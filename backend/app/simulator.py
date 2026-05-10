from math import sin

from .config import CONFIG, SimulationConfig
from .physics import PhysicsEngine, PhysicsState
from .pid import PIDController, clamp
from .schemas import ParameterUpdate, Telemetry


class Simulator:
    def __init__(self, config: SimulationConfig = CONFIG) -> None:
        self.config = config
        self.physics = PhysicsEngine(config)
        self.pid = PIDController(config.default_kp, config.default_ki, config.default_kd)
        self.running = False
        self.control_mode = "pid"
        self.sensor_noise = config.default_sensor_noise
        self.filter_strength = config.default_filter_strength
        self.state = self._initial_state()
        self.filtered_distance = self.state.distance
        self.filtered_current = self.state.current
        self._reset_quality_metrics()

    def _initial_state(self) -> PhysicsState:
        mass = self.physics.mass_for_moisture(0.12)
        initial_distance = self.config.target_distance_m + 0.006
        current = self.physics.equilibrium_current(mass, initial_distance)
        return PhysicsState(
            time=0.0,
            moisture=0.12,
            distance=initial_distance,
            velocity=0.0,
            current=current,
            target_distance=self.config.target_distance_m,
        )

    def reset(self) -> None:
        self.pid.reset()
        self.running = False
        self.state = self._initial_state()
        self.filtered_distance = self.state.distance
        self.filtered_current = self.state.current
        self._reset_quality_metrics()

    def start(self) -> None:
        self.running = True

    def stop(self) -> None:
        self.running = False

    def set_parameters(self, update: ParameterUpdate) -> None:
        self.pid.configure(update.kp, update.ki, update.kd)

        if update.controlMode is not None and update.controlMode != self.control_mode:
            self.control_mode = update.controlMode
            self.pid.reset()
            self._reset_quality_metrics()
        if update.moisture is not None:
            self.state.moisture = clamp(update.moisture, self.config.min_moisture, self.config.max_moisture)
        if update.targetDistance is not None:
            self.state.target_distance = clamp(
                update.targetDistance,
                self.config.min_distance_m,
                self.config.max_distance_m,
            )
            self._reset_quality_metrics()
        if update.sensorNoise is not None:
            self.sensor_noise = clamp(update.sensorNoise, 0.0, 2.0)
        if update.filterStrength is not None:
            self.filter_strength = clamp(update.filterStrength, 0.05, 1.0)

    def step(self, dt: float) -> None:
        if not self.running:
            return

        mass = self.physics.mass_for_moisture(self.state.moisture)
        error = self.state.distance - self.state.target_distance
        if self.control_mode == "pid":
            feed_forward = self.physics.equilibrium_current(mass, self.state.distance)
            pid_trim = self.pid.update(error, dt)
        else:
            feed_forward = self.physics.equilibrium_current(mass, self.state.target_distance)
            pid_trim = 0.0
        requested_current = feed_forward + pid_trim
        self.state = self.physics.step(self.state, requested_current, dt)
        self._update_quality_metrics()

    def telemetry(self) -> Telemetry:
        measured_distance, measured_current = self._sample_sensors()
        estimated_moisture = self.physics.estimate_moisture(self.filtered_current, self.filtered_distance)
        mass = self.physics.mass_for_moisture(self.state.moisture)
        error = self.state.distance - self.state.target_distance
        magnetic = self.physics.magnetic_force(self.state.current, self.state.distance)
        gravity = self.physics.gravity_force(mass)
        stability = self.physics.stability_for(error, self.state.velocity, self.state.current, self.state.distance)

        return Telemetry(
            time=self.state.time,
            running=self.running,
            moisture=self.state.moisture,
            trueMoisture=self.state.moisture,
            estimatedMoisture=estimated_moisture,
            moistureError=estimated_moisture - self.state.moisture,
            mass=mass,
            distance=self.state.distance,
            measuredDistance=measured_distance,
            filteredDistance=self.filtered_distance,
            targetDistance=self.state.target_distance,
            current=self.state.current,
            measuredCurrent=measured_current,
            filteredCurrent=self.filtered_current,
            error=error,
            magneticForce=magnetic,
            gravityForce=gravity,
            stability=stability,
            controlMode=self.control_mode,
            sensorNoise=self.sensor_noise,
            filterStrength=self.filter_strength,
            settlingTime=self.settling_time,
            overshoot=self.overshoot,
            oscillationCount=self.oscillation_count,
        )

    def _sample_sensors(self) -> tuple[float, float]:
        t = self.state.time
        distance_noise = self.sensor_noise * self.config.distance_noise_m_at_unit * (
            sin(37.0 * t) + 0.5 * sin(91.0 * t + 1.7)
        )
        current_noise = self.sensor_noise * self.config.current_noise_a_at_unit * (
            sin(29.0 * t + 0.6) + 0.45 * sin(73.0 * t + 2.1)
        )

        measured_distance = clamp(
            self.state.distance + distance_noise,
            self.config.min_distance_m,
            self.config.max_distance_m,
        )
        measured_current = clamp(
            self.state.current + current_noise,
            self.config.min_current_a,
            self.config.max_current_a,
        )

        alpha = clamp(self.filter_strength, 0.05, 1.0)
        self.filtered_distance += alpha * (measured_distance - self.filtered_distance)
        self.filtered_current += alpha * (measured_current - self.filtered_current)
        return measured_distance, measured_current

    def _reset_quality_metrics(self) -> None:
        self.overshoot = abs(self.state.distance - self.state.target_distance)
        self.oscillation_count = 0
        self.settling_time: float | None = None
        self._previous_error = self.state.distance - self.state.target_distance
        self._stable_samples = 0

    def _update_quality_metrics(self) -> None:
        error = self.state.distance - self.state.target_distance
        self.overshoot = max(self.overshoot, abs(error))

        if abs(error) > 0.0002 and abs(self._previous_error) > 0.0002 and error * self._previous_error < 0:
            self.oscillation_count += 1
        self._previous_error = error

        is_stable = abs(error) <= self.config.stable_error_m and abs(self.state.velocity) <= self.config.stable_velocity_mps
        if is_stable:
            self._stable_samples += 1
            if self.settling_time is None and self._stable_samples >= 15:
                self.settling_time = self.state.time
        else:
            self._stable_samples = 0
