from dataclasses import dataclass
from math import sqrt

from .config import SimulationConfig
from .pid import clamp
from .schemas import Stability


@dataclass
class PhysicsState:
    time: float
    moisture: float
    distance: float
    velocity: float
    current: float
    target_distance: float


class PhysicsEngine:
    def __init__(self, config: SimulationConfig) -> None:
        self.config = config

    def mass_for_moisture(self, moisture: float) -> float:
        bounded = clamp(moisture, self.config.min_moisture, self.config.max_moisture)
        return self.config.base_mass_kg * (1.0 + bounded)

    def gravity_force(self, mass: float) -> float:
        return mass * self.config.gravity

    def magnetic_force(self, current: float, distance: float) -> float:
        safe_distance = max(distance, self.config.min_distance_m)
        return self.config.magnetic_constant * current**2 / safe_distance**2

    def equilibrium_current(self, mass: float, distance: float) -> float:
        safe_distance = max(distance, self.config.min_distance_m)
        current = sqrt(self.gravity_force(mass) * safe_distance**2 / self.config.magnetic_constant)
        return clamp(current, self.config.min_current_a, self.config.max_current_a)

    def stability_for(self, error: float, velocity: float, current: float, distance: float) -> Stability:
        if distance >= self.config.max_distance_m * 0.96 or distance <= self.config.min_distance_m * 1.04:
            return "levitation_lost"
        if current >= self.config.max_current_a * 0.9:
            return "high_current"
        if abs(error) < self.config.stable_error_m and abs(velocity) < self.config.stable_velocity_mps:
            return "stable"
        return "oscillating"

    def step(self, state: PhysicsState, requested_current: float, dt: float) -> PhysicsState:
        dt = clamp(dt, 0.0, 0.04)
        mass = self.mass_for_moisture(state.moisture)

        requested_current = clamp(requested_current, self.config.min_current_a, self.config.max_current_a)
        response = clamp(dt / self.config.coil_time_constant_s, 0.0, 1.0)
        current = state.current + (requested_current - state.current) * response

        magnetic = self.magnetic_force(current, state.distance)
        acceleration = self.config.gravity - magnetic / mass - self.config.air_damping * state.velocity

        velocity = state.velocity + acceleration * dt
        distance = state.distance + velocity * dt

        if distance < self.config.min_distance_m:
            distance = self.config.min_distance_m
            velocity = max(0.0, -velocity * 0.25)
        elif distance > self.config.max_distance_m:
            distance = self.config.max_distance_m
            velocity = min(0.0, -velocity * 0.2)

        return PhysicsState(
            time=state.time + dt,
            moisture=state.moisture,
            distance=distance,
            velocity=velocity,
            current=current,
            target_distance=state.target_distance,
        )
