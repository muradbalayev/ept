import { ActivitySquare, Filter, Gauge, Route, Sigma } from "lucide-react";
import { useTelemetryStore } from "../store/telemetryStore";

const modeText = {
  pid: "PID ilə qapalı idarəetmə",
  open_loop: "PID-siz açıq idarəetmə",
};

export function RealismInsights() {
  const telemetry = useTelemetryStore((state) => state.telemetry);

  const measurementCards = [
    { label: "Ölçülmüş məsafə", value: `${(telemetry.measuredDistance * 100).toFixed(3)} sm` },
    { label: "Filtrlənmiş məsafə", value: `${(telemetry.filteredDistance * 100).toFixed(3)} sm` },
    { label: "Ölçülmüş cərəyan", value: `${telemetry.measuredCurrent.toFixed(3)} A` },
    { label: "Filtrlənmiş cərəyan", value: `${telemetry.filteredCurrent.toFixed(3)} A` },
  ];

  const qualityCards = [
    { label: "Rejim", value: modeText[telemetry.controlMode] },
    { label: "Maksimal xəta", value: `${(telemetry.overshoot * 1000).toFixed(1)} mm` },
    { label: "Qərarlaşma müddəti", value: telemetry.settlingTime === null ? "hələ sabitləşmir" : `${telemetry.settlingTime.toFixed(2)} s` },
    { label: "Rəqslərin sayı", value: `${telemetry.oscillationCount}` },
  ];

  return (
    <section className="realism-panel" aria-label="Metrologiya və real ölçmə izahı">
      <div className="chapter-heading">
        <div>
          <p className="eyebrow">REAL ÖLÇMƏ MƏNTİQİ</p>
          <h2>Rütubət cərəyan və məsafədən necə hesablanır?</h2>
        </div>
        <Gauge size={22} />
      </div>

      <div className="realism-grid">
        <article className="realism-card">
          <div className="section-title">
            <Route size={18} />
            <h3>Ölçmə ardıcıllığı</h3>
          </div>
          <ol className="process-list">
            <li>Slider həqiqi rütubəti simulyasiya edir və materialın kütləsi dəyişir.</li>
            <li>Kütlə dəyişdiyi üçün ağırlıq qüvvəsi və solenoidə lazım olan cərəyan dəyişir.</li>
            <li>Sensor məsafə və cərəyanı səs-küylü şəkildə ölçür.</li>
            <li>Filtr ölçməni yumşaldır və rütubət filtrlənmiş dəyərlərdən hesablanır.</li>
          </ol>
        </article>

        <article className="realism-card">
          <div className="section-title">
            <Sigma size={18} />
            <h3>Hesablama düsturu</h3>
          </div>
          <div className="formula-stack">
            <strong>Fm = k · I² / d²</strong>
            <strong>m = Fm / g</strong>
            <strong>w = (m - m₀) / m₀</strong>
          </div>
          <p className="chart-caption">
            Burada I filtrlənmiş solenoid cərəyanı, d isə filtrlənmiş levitasiya məsafəsidir. Nəticədə sistem
            rütubəti birbaşa qəbul etmir, ölçülmüş fiziki parametrlərdən qiymətləndirir.
          </p>
        </article>

        <article className="realism-card">
          <div className="section-title">
            <Filter size={18} />
            <h3>Sensor və filtr dəyərləri</h3>
          </div>
          <div className="compact-metric-grid">
            {measurementCards.map((item) => (
              <div className="compact-metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="realism-card">
          <div className="section-title">
            <ActivitySquare size={18} />
            <h3>PID-siz və PID-li müqayisə</h3>
          </div>
          <div className="compact-metric-grid">
            {qualityCards.map((item) => (
              <div className="compact-metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <p className="chart-caption">
            PID-li rejimdə sistem məsafə xətasına reaksiya verir. PID-siz rejimdə isə yalnız əvvəlcədən hesablanmış
            balans cərəyanı verilir və sistem xarici təsirə daha zəif cavab verir.
          </p>
        </article>
      </div>
    </section>
  );
}
