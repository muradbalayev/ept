import { Droplets, Gauge, Magnet, MoveVertical, Scale, Zap } from "lucide-react";
import type { Telemetry } from "../types/telemetry";

const format = (value: number, digits = 2) => value.toFixed(digits);

export function MetricGrid({ telemetry }: { telemetry: Telemetry }) {
  const metrics = [
    { label: "Həqiqi rütubət", value: `${format(telemetry.trueMoisture * 100, 1)}%`, icon: Droplets, tone: "cyan" },
    { label: "Hesablanan rütubət", value: `${format(telemetry.estimatedMoisture * 100, 1)}%`, icon: Gauge, tone: "green" },
    { label: "Ölçmə xətası", value: `${format(telemetry.moistureError * 100, 2)}%`, icon: Gauge, tone: "rose" },
    { label: "Kütlə", value: `${format(telemetry.mass, 2)} kq`, icon: Scale, tone: "amber" },
    { label: "Levitasiya məsafəsi", value: `${format(telemetry.distance * 100, 2)} sm`, icon: MoveVertical, tone: "green" },
    { label: "Solenoid cərəyanı", value: `${format(telemetry.current, 2)} A`, icon: Zap, tone: "copper" },
    { label: "Maqnit qüvvəsi", value: `${format(telemetry.magneticForce, 1)} N`, icon: Magnet, tone: "violet" },
    { label: "Məsafə xətası", value: `${format(telemetry.error * 1000, 1)} mm`, icon: Gauge, tone: "rose" },
  ];

  return (
    <section className="metrics-grid" aria-label="Telemetriya göstəriciləri">
      {metrics.map(({ label, value, icon: Icon, tone }) => (
        <article className={`metric-card ${tone}`} key={label}>
          <Icon size={18} />
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  );
}
