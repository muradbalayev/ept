import { BookOpen, CircuitBoard, Sigma, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useTelemetryStore } from "../store/telemetryStore";
import type { Telemetry } from "../types/telemetry";

const blocks = [
  { id: "W1(p)", title: "Qüvvə bloku", text: "G və Fe fərqindən maqnit içliyin yerdəyişməsi alınır." },
  { id: "W2(p)", title: "Hall vericisi", text: "Yerdəyişməni elektrik siqnalına çevirir." },
  { id: "W3(p)", title: "Gücləndirici", text: "Vericidən gələn zəif siqnalı gücləndirir." },
  { id: "W4(p)", title: "Korreksiya bəndi", text: "Keçid prosesini yaxşılaşdırmaq üçün siqnalı düzəldir." },
  { id: "W5(p)", title: "Cərəyan gücləndiricisi", text: "Solenoid dolağına verilən idarəedici cərəyanı formalaşdırır." },
  { id: "W6(p)", title: "Dempferləmə", text: "Sürətə görə əks əlaqə yaradaraq rəqsləri azaldır." },
  { id: "W7(p)", title: "Əks əlaqə", text: "Solenoid dartı qüvvəsini ümumi qapalı sistemə qaytarır." },
];

const formulas = [
  { title: "Rütubət", value: "W = (myaş - mquru) / mquru · 100%" },
  { title: "Görünən çəki", value: "Fapp = m·g - Fqaldırıcı" },
  { title: "Maqnit qüvvəsi", value: "Fm = k · I² / d²" },
  { title: "PID idarəetmə", value: "u = Kp·e + Ki∫e dt + Kd·de/dt" },
];

function calculateQuality(history: Telemetry[]) {
  const safeHistory = history.length > 0 ? history : [];
  const latest = safeHistory[safeHistory.length - 1];
  if (!latest) {
    return {
      maxDeviationMm: 0,
      settlingTime: "hesablanır",
      oscillations: 0,
      finalErrorMm: 0,
    };
  }

  const maxDeviationMm = Math.max(...safeHistory.map((point) => Math.abs(point.error) * 1000));
  const finalErrorMm = Math.abs(latest.error) * 1000;
  const stableIndex = safeHistory.findIndex((_, index) =>
    safeHistory.slice(index).every((point) => Math.abs(point.error) <= 0.0025),
  );

  let oscillations = 0;
  for (let index = 1; index < safeHistory.length; index += 1) {
    const previous = safeHistory[index - 1].error;
    const current = safeHistory[index].error;
    if (Math.abs(previous) > 0.0002 && Math.abs(current) > 0.0002 && Math.sign(previous) !== Math.sign(current)) {
      oscillations += 1;
    }
  }

  return {
    maxDeviationMm,
    settlingTime: stableIndex >= 0 ? `${safeHistory[stableIndex].time.toFixed(2)} s` : "hələ sabitləşmir",
    oscillations,
    finalErrorMm,
  };
}

export function ChapterFourAnalysis() {
  const history = useTelemetryStore((state) => state.history);
  const telemetry = useTelemetryStore((state) => state.telemetry);
  const quality = useMemo(() => calculateQuality(history), [history]);

  const qualityItems = [
    { label: "Maksimal dinamik xəta", value: `${(telemetry.overshoot * 1000 || quality.maxDeviationMm).toFixed(1)} mm` },
    { label: "Qərarlaşma müddəti", value: telemetry.settlingTime === null ? quality.settlingTime : `${telemetry.settlingTime.toFixed(2)} s` },
    { label: "Rəqslərin sayı", value: `${telemetry.oscillationCount || quality.oscillations}` },
    { label: "Son xəta", value: `${Math.abs(telemetry.error * 1000 || quality.finalErrorMm).toFixed(2)} mm` },
  ];

  return (
    <section className="chapter-panel" aria-label="4-cü fəsil üzrə analiz">
      <div className="chapter-heading">
        <div>
          <p className="eyebrow">IV FƏSİL İLƏ UYĞUNLUQ</p>
          <h2>Korreksiya edilmiş maqnit levitasiya sisteminin proqram modeli</h2>
        </div>
        <BookOpen size={22} />
      </div>

      <div className="chapter-summary">
        <div>
          <h3>Bu proqram nəyi sübut edir?</h3>
          <p>
            Bu panel 4-cü fəsildə verilən qapalı maqnit levitasiya sisteminin rəqəmsal əkizidir. Su əlavə olunduqda
            real kütlə artsa da, ölçü kamerasındakı qaldırıcı təsir maqnitin hiss etdiyi görünən çəkini azaldır. PID
            tənzimləyicisi həmin dəyişməyə uyğun solenoid cərəyanını düzəldərək obyekti hədəf məsafəyə qaytarır.
          </p>
        </div>
        <div>
          <h3>MATLAB/Simulink nəticəsinə uyğun hissə</h3>
          <p>
            Sağdakı PID parametrləri və aşağıdakı qrafiklər keçid prosesini canlı göstərir. Kp, Ki və Kd dəyişdikcə
            rəqslər, qərarlaşma müddəti və son xəta dəyişir. Bu, sənəddəki PID əlavə olunandan sonra keyfiyyət
            göstəricilərinin yaxşılaşması fikrinin interaktiv qarşılığıdır.
          </p>
        </div>
      </div>

      <div className="formula-row">
        {formulas.map((formula) => (
          <article className="formula-item" key={formula.title}>
            <span>{formula.title}</span>
            <strong>{formula.value}</strong>
          </article>
        ))}
      </div>

      <div className="analysis-layout">
        <section className="block-section" aria-label="Struktur sxem">
          <div className="section-title">
            <CircuitBoard size={18} />
            <h3>4-cü fəsildəki struktur sxemin proqramdakı qarşılığı</h3>
          </div>
          <div className="block-flow">
            {blocks.map((block, index) => (
              <div className="flow-cell" key={block.id}>
                <article className="transfer-block">
                  <strong>{block.id}</strong>
                  <span>{block.title}</span>
                  <p>{block.text}</p>
                </article>
                {index < blocks.length - 1 && <span className="flow-arrow">→</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="quality-section" aria-label="Dinamik keyfiyyət göstəriciləri">
          <div className="section-title">
            <TrendingUp size={18} />
            <h3>Keçid prosesinin canlı göstəriciləri</h3>
          </div>
          <div className="quality-grid">
            {qualityItems.map((item) => (
              <article className="quality-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
          <div className="model-note">
            <Sigma size={18} />
            <p>
              Hazır dəyərlər: rütubət {(telemetry.moisture * 100).toFixed(1)}%, real kütlə {telemetry.mass.toFixed(2)} kq,
              maqnitin hiss etdiyi çəki {telemetry.apparentMass.toFixed(2)} kq, solenoid cərəyanı {telemetry.current.toFixed(2)} A.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
