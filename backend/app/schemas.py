from typing import Literal

from pydantic import BaseModel, Field


Stability = Literal["stable", "oscillating", "high_current", "levitation_lost"]


class ParameterUpdate(BaseModel):
    kp: float | None = Field(default=None, ge=0.0, le=500.0)
    ki: float | None = Field(default=None, ge=0.0, le=200.0)
    kd: float | None = Field(default=None, ge=0.0, le=200.0)
    moisture: float | None = Field(default=None, ge=0.0, le=0.4)
    targetDistance: float | None = Field(default=None, ge=0.018, le=0.13)


class Telemetry(BaseModel):
    time: float
    running: bool
    moisture: float
    mass: float
    distance: float
    targetDistance: float
    current: float
    error: float
    magneticForce: float
    gravityForce: float
    stability: Stability


class ClientMessage(BaseModel):
    type: Literal["start", "stop", "reset", "set_parameters"]
    payload: ParameterUpdate | None = None
