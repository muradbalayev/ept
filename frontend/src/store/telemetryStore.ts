import { create } from "zustand";
import type { ControlParameters, Telemetry, WsMessage } from "../types/telemetry";

const MAX_HISTORY = 300;

const initialTelemetry: Telemetry = {
  time: 0,
  running: false,
  moisture: 0.12,
  trueMoisture: 0.12,
  estimatedMoisture: 0.12,
  moistureError: 0,
  mass: 8.96,
  dryMaterialMass: 8,
  waterMass: 0.96,
  materialFill: 0.67,
  waterLevel: 0.3,
  sandFlowRate: 0,
  waterFlowRate: 0,
  drainRate: 0,
  buoyancyForce: 0,
  apparentMass: 8.96,
  distance: 0.062,
  measuredDistance: 0.062,
  filteredDistance: 0.062,
  targetDistance: 0.05,
  current: 10.5,
  measuredCurrent: 10.5,
  filteredCurrent: 10.5,
  error: 0.012,
  magneticForce: 55,
  gravityForce: 87.9,
  stability: "oscillating",
  sensorNoise: 0.35,
  filterStrength: 0.25,
  settlingTime: null,
  overshoot: 0.012,
  oscillationCount: 0,
};

const initialParameters: ControlParameters = {
  kp: 120,
  ki: 20,
  kd: 35,
  moisture: 0.12,
  targetDistance: 0.05,
  sensorNoise: 0.35,
  filterStrength: 0.25,
  sandFlowRate: 0,
  waterFlowRate: 0,
  drainRate: 0,
};

interface TelemetryStore {
  connected: boolean;
  telemetry: Telemetry;
  history: Telemetry[];
  parameters: ControlParameters;
  sender: ((message: WsMessage) => void) | null;
  setConnected: (connected: boolean) => void;
  setSender: (sender: ((message: WsMessage) => void) | null) => void;
  pushTelemetry: (telemetry: Telemetry) => void;
  sendCommand: (message: WsMessage) => void;
  updateParameters: (partial: Partial<ControlParameters>) => void;
}

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  connected: false,
  telemetry: initialTelemetry,
  history: [initialTelemetry],
  parameters: initialParameters,
  sender: null,
  setConnected: (connected) => set({ connected }),
  setSender: (sender) => set({ sender }),
  pushTelemetry: (telemetry) =>
    set((state) => ({
      telemetry,
      history: [...state.history, telemetry].slice(-MAX_HISTORY),
    })),
  sendCommand: (message) => {
    get().sender?.(message);
  },
  updateParameters: (partial) => {
    const parameters = { ...get().parameters, ...partial };
    set({ parameters });
    get().sender?.({ type: "set_parameters", payload: parameters });
  },
}));
