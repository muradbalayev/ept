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
