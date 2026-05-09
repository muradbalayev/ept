from pydantic import BaseModel


class SimulationConfig(BaseModel):
    base_mass_kg: float = 8.0
    gravity: float = 9.81
    target_distance_m: float = 0.05
    magnetic_constant: float = 0.002
    min_current_a: float = 0.0
    max_current_a: float = 25.0
    min_distance_m: float = 0.018
    max_distance_m: float = 0.13
    min_moisture: float = 0.0
    max_moisture: float = 0.4
    default_kp: float = 120.0
    default_ki: float = 20.0
    default_kd: float = 35.0
    coil_time_constant_s: float = 0.08
    air_damping: float = 4.2
    stable_error_m: float = 0.0025
    stable_velocity_mps: float = 0.006


CONFIG = SimulationConfig()
