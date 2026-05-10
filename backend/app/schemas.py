from typing import Literal

from pydantic import BaseModel, Field


Stability = Literal["stable", "oscillating", "high_current", "levitation_lost"]
ControlMode = Literal["pid", "open_loop"]


class ParameterUpdate(BaseModel):
    kp: float | None = Field(default=None, ge=0.0, le=500.0)
    ki: float | None = Field(default=None, ge=0.0, le=200.0)
    kd: float | None = Field(default=None, ge=0.0, le=200.0)
    moisture: float | None = Field(default=None, ge=0.0, le=0.4)
    targetDistance: float | None = Field(default=None, ge=0.018, le=0.13)
    controlMode: ControlMode | None = None
    sensorNoise: float | None = Field(default=None, ge=0.0, le=2.0)
    filterStrength: float | None = Field(default=None, ge=0.05, le=1.0)
    sandFlowRate: float | None = Field(default=None, ge=0.0, le=1.0)
    waterFlowRate: float | None = Field(default=None, ge=0.0, le=1.0)
    drainRate: float | None = Field(default=None, ge=0.0, le=1.0)


class Telemetry(BaseModel):
    time: float
    running: bool
    moisture: float
    trueMoisture: float
    estimatedMoisture: float
    moistureError: float
    mass: float
    dryMaterialMass: float
    waterMass: float
    materialFill: float
    waterLevel: float
    sandFlowRate: float
    waterFlowRate: float
    drainRate: float
    buoyancyForce: float
    apparentMass: float
    distance: float
    measuredDistance: float
    filteredDistance: float
    targetDistance: float
    current: float
    measuredCurrent: float
    filteredCurrent: float
    error: float
    magneticForce: float
    gravityForce: float
    stability: Stability
    controlMode: ControlMode
    sensorNoise: float
    filterStrength: float
    settlingTime: float | None
    overshoot: float
    oscillationCount: int


class ClientMessage(BaseModel):
    type: Literal["start", "stop", "reset", "set_parameters"]
    payload: ParameterUpdate | None = None
