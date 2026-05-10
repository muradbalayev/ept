import { Pause, Play, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useTelemetryStore } from "../store/telemetryStore";
import type { ControlParameters } from "../types/telemetry";

type NumericKey = keyof ControlParameters;

const controls: Array<{
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  transform?: (value: number) => number;
  inverse?: (value: number) => number;
}> = [
  { key: "kp", label: "Kp", min: 0, max: 260, step: 1, unit: "" },
  { key: "ki", label: "Ki", min: 0, max: 90, step: 1, unit: "" },
  { key: "kd", label: "Kd", min: 0, max: 120, step: 1, unit: "" },
  {
    key: "moisture",
    label: "Başlanğıc rütubət",
    min: 0,
    max: 40,
    step: 1,
    unit: "%",
    transform: (value) => value * 100,
    inverse: (value) => value / 100,
  },
  {
    key: "sandFlowRate",
    label: "Qum axını",
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    transform: (value) => value * 100,
    inverse: (value) => value / 100,
  },
  {
    key: "waterFlowRate",
    label: "Su axını",
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    transform: (value) => value * 100,
    inverse: (value) => value / 100,
  },
  {
    key: "drainRate",
    label: "Drenaj / quruma",
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    transform: (value) => value * 100,
    inverse: (value) => value / 100,
  },
  {
    key: "targetDistance",
    label: "Hədəf məsafə",
    min: 2,
    max: 12,
    step: 0.1,
    unit: "sm",
    transform: (value) => value * 100,
    inverse: (value) => value / 100,
  },
  {
    key: "sensorNoise",
    label: "Sensor səs-küyü",
    min: 0,
    max: 2,
    step: 0.05,
    unit: "x",
  },
  {
    key: "filterStrength",
    label: "Filtr gücü",
    min: 0.05,
    max: 1,
    step: 0.05,
    unit: "",
    transform: (value) => value * 100,
    inverse: (value) => value / 100,
  },
];

export function ControlPanel() {
  const telemetry = useTelemetryStore((state) => state.telemetry);
  const parameters = useTelemetryStore((state) => state.parameters);
  const updateParameters = useTelemetryStore((state) => state.updateParameters);
  const sendCommand = useTelemetryStore((state) => state.sendCommand);

  const handleChange = (key: NumericKey, rawValue: number, inverse?: (value: number) => number) => {
    updateParameters({ [key]: inverse ? inverse(rawValue) : rawValue });
  };

  return (
    <section className="panel control-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PID İDARƏETMƏ</p>
          <h2>Sənaye Tipli Sazlama</h2>
        </div>
        <SlidersHorizontal size={20} />
      </div>

      <div className="button-row">
        <button
          className="command primary"
          title="Simulyasiyanı başlat"
          type="button"
          onClick={() => sendCommand({ type: "start" })}
          disabled={telemetry.running}
        >
          <Play size={17} />
          Başlat
        </button>
        <button
          className="command"
          title="Simulyasiyanı dayandır"
          type="button"
          onClick={() => sendCommand({ type: "stop" })}
          disabled={!telemetry.running}
        >
          <Pause size={17} />
          Dayandır
        </button>
        <button className="icon-command" title="Sistemi sıfırla" type="button" onClick={() => sendCommand({ type: "reset" })}>
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="slider-list">
        {controls.map((control) => {
          const displayValue = control.transform ? control.transform(parameters[control.key]) : parameters[control.key];
          return (
            <label className="slider-control" key={control.key}>
              <span>
                {control.label}
                <strong>
                  {displayValue.toFixed(control.step < 1 ? 1 : 0)}
                  {control.unit ? ` ${control.unit}` : ""}
                </strong>
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={displayValue}
                onChange={(event) => handleChange(control.key, Number(event.target.value), control.inverse)}
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
