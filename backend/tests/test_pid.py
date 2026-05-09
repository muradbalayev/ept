from app.pid import PIDController


def test_pid_output_is_clamped() -> None:
    pid = PIDController(kp=1000.0, ki=1000.0, kd=1000.0, output_limit=5.0)

    output = pid.update(1.0, 0.016)

    assert output == 5.0


def test_pid_reset_clears_integral() -> None:
    pid = PIDController(kp=1.0, ki=10.0, kd=0.0)
    pid.update(0.1, 1.0)

    pid.reset()

    assert pid.integral == 0.0
    assert pid.initialized is False
