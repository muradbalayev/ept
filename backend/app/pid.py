from dataclasses import dataclass


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


@dataclass
class PIDController:
    kp: float
    ki: float
    kd: float
    integral_limit: float = 0.6
    output_limit: float = 9.0

    def __post_init__(self) -> None:
        self.integral = 0.0
        self.previous_error = 0.0
        self.initialized = False

    def reset(self) -> None:
        self.integral = 0.0
        self.previous_error = 0.0
        self.initialized = False

    def configure(self, kp: float | None = None, ki: float | None = None, kd: float | None = None) -> None:
        if kp is not None:
            self.kp = kp
        if ki is not None:
            self.ki = ki
        if kd is not None:
            self.kd = kd

    def update(self, error: float, dt: float) -> float:
        if dt <= 0:
            return 0.0

        self.integral = clamp(self.integral + error * dt, -self.integral_limit, self.integral_limit)
        derivative = 0.0 if not self.initialized else (error - self.previous_error) / dt

        self.previous_error = error
        self.initialized = True

        output = self.kp * error + self.ki * self.integral + self.kd * derivative
        return clamp(output, -self.output_limit, self.output_limit)
