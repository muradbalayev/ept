export type Stability = "stable" | "oscillating" | "high_current" | "levitation_lost";

export interface Telemetry {
  time: number;
  running: boolean;
  moisture: number;
  mass: number;
  distance: number;
  targetDistance: number;
  current: number;
  error: number;
  magneticForce: number;
  gravityForce: number;
  stability: Stability;
}

export interface ControlParameters {
  kp: number;
  ki: number;
  kd: number;
  moisture: number;
  targetDistance: number;
}

export type WsMessage =
  | { type: "start" }
  | { type: "stop" }
  | { type: "reset" }
  | { type: "set_parameters"; payload: ControlParameters };
