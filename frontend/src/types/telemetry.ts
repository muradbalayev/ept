export type Stability = "stable" | "oscillating" | "high_current" | "levitation_lost";

export interface Telemetry {
  time: number;
  running: boolean;
  moisture: number;
  trueMoisture: number;
  estimatedMoisture: number;
  moistureError: number;
  mass: number;
  dryMaterialMass: number;
  waterMass: number;
  materialFill: number;
  waterLevel: number;
  sandFlowRate: number;
  waterFlowRate: number;
  drainRate: number;
  buoyancyForce: number;
  apparentMass: number;
  distance: number;
  measuredDistance: number;
  filteredDistance: number;
  targetDistance: number;
  current: number;
  measuredCurrent: number;
  filteredCurrent: number;
  error: number;
  magneticForce: number;
  gravityForce: number;
  stability: Stability;
  sensorNoise: number;
  filterStrength: number;
  settlingTime: number | null;
  overshoot: number;
  oscillationCount: number;
}

export interface ControlParameters {
  kp: number;
  ki: number;
  kd: number;
  moisture: number;
  targetDistance: number;
  sensorNoise: number;
  filterStrength: number;
  sandFlowRate: number;
  waterFlowRate: number;
  drainRate: number;
}

export type WsMessage =
  | { type: "start" }
  | { type: "stop" }
  | { type: "reset" }
  | { type: "set_parameters"; payload: ControlParameters };
