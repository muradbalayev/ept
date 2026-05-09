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
