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
    default_sensor_noise: float = 0.35
    default_filter_strength: float = 0.25
    distance_noise_m_at_unit: float = 0.00035
    current_noise_a_at_unit: float = 0.04
    max_dry_material_mass_kg: float = 12.0
    sand_mass_rate_kg_s: float = 0.18
    water_mass_rate_kg_s: float = 0.08
    drain_rate_per_s: float = 0.08
    default_sand_flow_rate: float = 0.0
    default_water_flow_rate: float = 0.0
    default_drain_rate: float = 0.0
    buoyancy_start_level: float = 0.15
    buoyancy_gain_n: float = 50.0


CONFIG = SimulationConfig()
