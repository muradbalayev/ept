import { AlertTriangle, CheckCircle2, Gauge, Power } from "lucide-react";
import { useTelemetryStore } from "../store/telemetryStore";

const statusText = {
  stable: "Sabit rejim",
  oscillating: "Rəqsi keçid prosesi",
  high_current: "Yüksək cərəyan",
  levitation_lost: "Levitasiya itdi",
};

export function StatusBar() {
  const telemetry = useTelemetryStore((state) => state.telemetry);
  const Icon = telemetry.stability === "stable" ? CheckCircle2 : AlertTriangle;

  return (
    <section className="status-strip">
      <div className={`status-pill ${telemetry.stability}`}>
        <Icon size={18} />
        {statusText[telemetry.stability]}
      </div>
      <div className="status-reading">
        <Gauge size={17} />
        Hədəf {(telemetry.targetDistance * 100).toFixed(1)} sm
      </div>
      <div className="status-reading">
        <Power size={17} />
        Görünən çəki {(telemetry.apparentMass * 9.81).toFixed(1)} N
      </div>
      <div className="status-reading">
        t = {telemetry.time.toFixed(2)} s
      </div>
    </section>
  );
}
