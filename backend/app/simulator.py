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
        self.state = self._initial_state()

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

    def start(self) -> None:
        self.running = True

    def stop(self) -> None:
        self.running = False

    def set_parameters(self, update: ParameterUpdate) -> None:
        self.pid.configure(update.kp, update.ki, update.kd)

        if update.moisture is not None:
            self.state.moisture = clamp(update.moisture, self.config.min_moisture, self.config.max_moisture)
        if update.targetDistance is not None:
            self.state.target_distance = clamp(
                update.targetDistance,
                self.config.min_distance_m,
                self.config.max_distance_m,
            )

    def step(self, dt: float) -> None:
        if not self.running:
            return

        mass = self.physics.mass_for_moisture(self.state.moisture)
        error = self.state.distance - self.state.target_distance
        feed_forward = self.physics.equilibrium_current(mass, self.state.distance)
        pid_trim = self.pid.update(error, dt)
        requested_current = feed_forward + pid_trim
        self.state = self.physics.step(self.state, requested_current, dt)

    def telemetry(self) -> Telemetry:
        mass = self.physics.mass_for_moisture(self.state.moisture)
        error = self.state.distance - self.state.target_distance
        magnetic = self.physics.magnetic_force(self.state.current, self.state.distance)
        gravity = self.physics.gravity_force(mass)
        stability = self.physics.stability_for(error, self.state.velocity, self.state.current, self.state.distance)

        return Telemetry(
            time=self.state.time,
            running=self.running,
            moisture=self.state.moisture,
            mass=mass,
            distance=self.state.distance,
            targetDistance=self.state.target_distance,
            current=self.state.current,
            error=error,
            magneticForce=magnetic,
            gravityForce=gravity,
            stability=stability,
        )
