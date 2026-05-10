import { Activity, Atom, RadioTower } from "lucide-react";
import { Charts } from "./components/Charts";
import { ChapterFourAnalysis } from "./components/ChapterFourAnalysis";
import { ControlPanel } from "./components/ControlPanel";
import { DigitalTwinScene } from "./components/DigitalTwinScene";
import { MetricGrid } from "./components/MetricGrid";
import { RealismInsights } from "./components/RealismInsights";
import { SceneGuide } from "./components/SceneGuide";
import { StatusBar } from "./components/StatusBar";
import { TransitionProcessCharts } from "./components/TransitionProcessCharts";
import { useTelemetryStore } from "./store/telemetryStore";
import { useTelemetrySocket } from "./useTelemetrySocket";

const stabilityText = {
  stable: "sabit",
  oscillating: "rəqsi rejim",
  high_current: "yüksək cərəyan",
  levitation_lost: "levitasiya itdi",
};

export default function App() {
  useTelemetrySocket();
  const telemetry = useTelemetryStore((state) => state.telemetry);
  const connected = useTelemetryStore((state) => state.connected);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MAQNİT ASQILI RÜTUBƏT ÖLÇMƏ SİSTEMİ</p>
          <h1>Rəqəmsal Əkiz İdarəetmə Paneli</h1>
        </div>
        <div className="topbar-actions" aria-label="Sistem xülasəsi">
          <span className={connected ? "connection online" : "connection offline"}>
            <RadioTower size={16} />
            {connected ? "Canlı əlaqə aktivdir" : "Server bağlantısı yoxdur"}
          </span>
          <span className="connection">
            <Activity size={16} />
            {telemetry.running ? "Simulyasiya işləyir" : "Simulyasiya dayandırılıb"}
          </span>
          <span className="connection accent">
            <Atom size={16} />
            {stabilityText[telemetry.stability]}
          </span>
        </div>
      </header>

      <StatusBar />

      <section className="dashboard-grid">
        <section className="scene-panel" aria-label="3D rəqəmsal əkiz">
          <DigitalTwinScene telemetry={telemetry} />
        </section>

        <aside className="side-stack">
          <ControlPanel />
          <MetricGrid telemetry={telemetry} />
        </aside>
      </section>

      <SceneGuide />
      <Charts />
      <RealismInsights />
      <TransitionProcessCharts />
      <ChapterFourAnalysis />
    </main>
  );
}
