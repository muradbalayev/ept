import pytest

from app.schemas import ParameterUpdate
from app.simulator import Simulator


def test_reset_returns_initial_stopped_state() -> None:
    simulator = Simulator()
    simulator.start()
    simulator.step(1.0 / 60.0)

    simulator.reset()
    telemetry = simulator.telemetry()

    assert telemetry.running is False
    assert telemetry.time == 0.0


def test_simulator_moves_toward_target_when_running() -> None:
    simulator = Simulator()
    before = abs(simulator.telemetry().error)

    simulator.start()
    for _ in range(240):
        simulator.step(1.0 / 60.0)

    after = abs(simulator.telemetry().error)

    assert after < before


def test_parameter_update_changes_moisture_and_target() -> None:
    simulator = Simulator()

    simulator.set_parameters(ParameterUpdate(moisture=0.22, targetDistance=0.06))
    telemetry = simulator.telemetry()

    assert telemetry.moisture == 0.22
    assert telemetry.targetDistance == 0.06
    assert telemetry.waterMass == pytest.approx(telemetry.dryMaterialMass * 0.22)


def test_sand_flow_increases_dry_material_and_fill() -> None:
    simulator = Simulator()
    before = simulator.telemetry()

    simulator.set_parameters(ParameterUpdate(sandFlowRate=1.0))
    simulator.start()
    for _ in range(120):
        simulator.step(1.0 / 60.0)

    after = simulator.telemetry()

    assert after.dryMaterialMass > before.dryMaterialMass
    assert after.materialFill > before.materialFill


def test_water_flow_increases_water_mass_and_true_moisture() -> None:
    simulator = Simulator()
    before = simulator.telemetry()

    simulator.set_parameters(ParameterUpdate(waterFlowRate=1.0))
    simulator.start()
    for _ in range(120):
        simulator.step(1.0 / 60.0)

    after = simulator.telemetry()

    assert after.waterMass > before.waterMass
    assert after.trueMoisture > before.trueMoisture


def test_drain_decreases_water_mass() -> None:
    simulator = Simulator()
    simulator.set_parameters(ParameterUpdate(moisture=0.35, drainRate=1.0))
    before = simulator.telemetry()

    simulator.start()
    for _ in range(120):
        simulator.step(1.0 / 60.0)

    after = simulator.telemetry()

    assert after.waterMass < before.waterMass
    assert after.trueMoisture < before.trueMoisture


def test_high_water_level_creates_buoyancy_and_apparent_mass_drop() -> None:
    simulator = Simulator()

    simulator.set_parameters(ParameterUpdate(moisture=0.38))
    telemetry = simulator.telemetry()

    assert telemetry.buoyancyForce > 0.0
    assert telemetry.apparentMass < telemetry.mass


def test_higher_moisture_requires_more_solenoid_current() -> None:
    dry_simulator = Simulator()
    dry_simulator.set_parameters(ParameterUpdate(moisture=0.02, sensorNoise=0.0))
    dry_simulator.start()

    wet_simulator = Simulator()
    wet_simulator.set_parameters(ParameterUpdate(moisture=0.25, sensorNoise=0.0))
    wet_simulator.start()

    for _ in range(120):
        dry_simulator.step(1.0 / 60.0)
        wet_simulator.step(1.0 / 60.0)

    assert wet_simulator.telemetry().current > dry_simulator.telemetry().current


def test_reset_restores_material_process_state() -> None:
    simulator = Simulator()
    simulator.set_parameters(ParameterUpdate(sandFlowRate=1.0, waterFlowRate=1.0))
    simulator.start()
    for _ in range(120):
        simulator.step(1.0 / 60.0)

    simulator.reset()
    telemetry = simulator.telemetry()

    assert telemetry.dryMaterialMass == pytest.approx(8.0)
    assert telemetry.waterMass == pytest.approx(0.96)
    assert telemetry.materialFill == pytest.approx(8.0 / 12.0)


def test_telemetry_estimates_moisture_from_filtered_measurements() -> None:
    simulator = Simulator()
    simulator.set_parameters(ParameterUpdate(sensorNoise=0.0, filterStrength=1.0))
    simulator.start()

    for _ in range(180):
        simulator.step(1.0 / 60.0)

    telemetry = simulator.telemetry()

    assert telemetry.trueMoisture == telemetry.moisture
    assert telemetry.estimatedMoisture == pytest.approx(telemetry.trueMoisture, abs=0.003)
    assert abs(telemetry.moistureError) < 0.003


def test_sensor_noise_and_filter_create_measured_and_filtered_values() -> None:
    simulator = Simulator()
    simulator.set_parameters(ParameterUpdate(sensorNoise=1.0, filterStrength=0.25))

    telemetry = simulator.telemetry()

    assert telemetry.measuredDistance != telemetry.distance
    assert telemetry.filteredDistance != telemetry.measuredDistance
    assert telemetry.measuredCurrent != telemetry.current
    assert telemetry.filteredCurrent != telemetry.measuredCurrent


def test_pid_mode_reduces_error_better_than_open_loop() -> None:
    pid_simulator = Simulator()
    pid_simulator.set_parameters(ParameterUpdate(controlMode="pid", sensorNoise=0.0))
    pid_simulator.start()

    open_loop_simulator = Simulator()
    open_loop_simulator.set_parameters(ParameterUpdate(controlMode="open_loop", sensorNoise=0.0))
    open_loop_simulator.start()

    for _ in range(120):
        pid_simulator.step(1.0 / 60.0)
        open_loop_simulator.step(1.0 / 60.0)

    assert abs(pid_simulator.telemetry().error) < abs(open_loop_simulator.telemetry().error)
    assert pid_simulator.telemetry().controlMode == "pid"
    assert open_loop_simulator.telemetry().controlMode == "open_loop"
