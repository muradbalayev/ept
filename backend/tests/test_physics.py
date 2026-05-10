import pytest

from app.config import CONFIG
from app.physics import PhysicsEngine


def test_moisture_increases_mass() -> None:
    engine = PhysicsEngine(CONFIG)

    dry_mass = engine.mass_for_moisture(0.0)
    wet_mass = engine.mass_for_moisture(0.3)

    assert wet_mass > dry_mass
    assert wet_mass == CONFIG.base_mass_kg * 1.3


def test_wetter_material_needs_more_equilibrium_current() -> None:
    engine = PhysicsEngine(CONFIG)

    dry_current = engine.equilibrium_current(engine.mass_for_moisture(0.0), CONFIG.target_distance_m)
    wet_current = engine.equilibrium_current(engine.mass_for_moisture(0.4), CONFIG.target_distance_m)

    assert wet_current > dry_current
    assert wet_current <= CONFIG.max_current_a


def test_estimated_moisture_matches_equilibrium_measurement() -> None:
    engine = PhysicsEngine(CONFIG)
    moisture = 0.18
    mass = engine.mass_for_moisture(moisture)
    current = engine.equilibrium_current(mass, CONFIG.target_distance_m)

    estimated = engine.estimate_moisture(current, CONFIG.target_distance_m)

    assert estimated == pytest.approx(moisture)


def test_estimated_moisture_uses_dry_material_mass_and_buoyancy() -> None:
    engine = PhysicsEngine(CONFIG)
    dry_mass = 9.0
    water_mass = 1.8
    buoyancy = 2.0
    apparent_mass = dry_mass + water_mass - buoyancy / CONFIG.gravity
    current = engine.equilibrium_current(apparent_mass, CONFIG.target_distance_m)

    estimated = engine.estimate_moisture_for_dry_mass(current, CONFIG.target_distance_m, dry_mass, buoyancy)

    assert estimated == pytest.approx(water_mass / dry_mass)
