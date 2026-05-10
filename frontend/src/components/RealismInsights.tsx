import { ActivitySquare, Droplets, Filter, Gauge, PackageOpen, Route, Sigma } from "lucide-react";
import { useTelemetryStore } from "../store/telemetryStore";

export function RealismInsights() {
  const telemetry = useTelemetryStore((state) => state.telemetry);
  const apparentLoss = Math.max(telemetry.mass - telemetry.apparentMass, 0);

  const measurementCards = [
    { label: "Ölçülmüş məsafə", value: `${(telemetry.measuredDistance * 100).toFixed(3)} sm` },
    { label: "Filtrlənmiş məsafə", value: `${(telemetry.filteredDistance * 100).toFixed(3)} sm` },
    { label: "Ölçülmüş cərəyan", value: `${telemetry.measuredCurrent.toFixed(3)} A` },
    { label: "Filtrlənmiş cərəyan", value: `${telemetry.filteredCurrent.toFixed(3)} A` },
  ];

  const qualityCards = [
    { label: "İdarəetmə", value: "PID ilə qapalı idarəetmə" },
    { label: "Maksimal xəta", value: `${(telemetry.overshoot * 1000).toFixed(1)} mm` },
    { label: "Qərarlaşma müddəti", value: telemetry.settlingTime === null ? "hələ sabitləşmir" : `${telemetry.settlingTime.toFixed(2)} s` },
    { label: "Rəqslərin sayı", value: `${telemetry.oscillationCount}` },
  ];

  const materialCards = [
    { label: "Quru material", value: `${telemetry.dryMaterialMass.toFixed(2)} kq` },
    { label: "Materialdakı su", value: `${telemetry.waterMass.toFixed(2)} kq` },
    { label: "Kamera dolması", value: `${(telemetry.materialFill * 100).toFixed(0)}%` },
    { label: "Su səviyyəsi", value: `${(telemetry.waterLevel * 100).toFixed(0)}%` },
    { label: "Suyun qaldırıcı qüvvəsi", value: `${telemetry.buoyancyForce.toFixed(2)} N` },
    { label: "Maqnitin hiss etdiyi çəki", value: `${telemetry.apparentMass.toFixed(2)} kq` },
    { label: "Çəki azalması", value: `${apparentLoss.toFixed(2)} kq` },
  ];

  const deviceMapCards = [
    { label: "1. Dartı qovşağı", value: "Maqnitin hiss etdiyi görünən çəki və cərəyanla təmsil olunur" },
    { label: "2. Solenoid", value: "3D səhnədəki mis dolaq" },
    { label: "3. Sabit maqnit", value: "N/S işarəli levitasiya edən içlik" },
    { label: "4. Ölçü kamerası", value: "Şəffaf kamera, qum və su burada toplanır" },
    { label: "5-6. Sensorlar", value: "Hall elementi və yerdəyişmə şüası" },
    { label: "7-8. Elektronika", value: "İdarəetmə bloku və cərəyan ölçən cihaz" },
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
            <li>Qum bunkerdən ölçü kamerasına tökülür və quru material kütləsi artır.</li>
            <li>Su çəndən boru ilə kameraya verilir və materialın rütubəti artır.</li>
            <li>Su səviyyəsi artdıqca qaldırıcı qüvvə artır və maqnitin hiss etdiyi görünən çəki azalır.</li>
            <li>Görünən çəki azaldığı üçün solenoidə lazım olan saxlayıcı cərəyan azalır.</li>
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
            <strong>m görünən = Fm / g</strong>
            <strong>w = su kütləsi / quru material kütləsi</strong>
            <strong>Görünən çəki = mg - F qaldırıcı</strong>
          </div>
          <p className="chart-caption">
            Burada I filtrlənmiş solenoid cərəyanı, d isə filtrlənmiş levitasiya məsafəsidir. Adi tərəzidə su kütləni
            artırır; bu maqnit asqılı ölçmədə isə suyun qaldırıcı təsiri maqnitin hiss etdiyi görünən çəkini azaldır.
            Rütubət həmin görünən çəki və cərəyan dəyişikliyi ilə qiymətləndirilir.
          </p>
        </article>

        <article className="realism-card">
          <div className="section-title">
            <PackageOpen size={18} />
            <h3>Qum və su prosesinin canlı dəyərləri</h3>
          </div>
          <div className="compact-metric-grid">
            {materialCards.map((item) => (
              <div className="compact-metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="realism-card">
          <div className="section-title">
            <Droplets size={18} />
            <h3>Sxemdəki hissələrin 3D qarşılığı</h3>
          </div>
          <div className="compact-metric-grid">
            {deviceMapCards.map((item) => (
              <div className="compact-metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
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
            <h3>PID sabitləşdirmə göstəriciləri</h3>
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
            PID tənzimləyicisi Hall/yerdəyişmə siqnalına baxır və solenoid cərəyanını daim düzəldir. Buna görə suyun
            yaratdığı görünən çəki dəyişikliyi zamanı maqnit hədəf məsafədə saxlanılır.
          </p>
        </article>

        <article className="realism-card">
          <div className="section-title">
            <Gauge size={18} />
            <h3>Müdafiədə qısa izah</h3>
          </div>
          <p className="chart-caption">
            Quru-nəm rütubət hesabında su kütləsi m(yaş) - m(quru) fərqidir. Maqnit asqılı qurğuda isə əsas ölçülən
            siqnal maqnitin hiss etdiyi görünən çəkidir. Su səviyyəsi artdıqca qaldırıcı qüvvə artır, görünən çəki
            azalır və solenoid cərəyanı dəyişir. Bu dəyişmə kalibrasiya olunaraq rütubətə çevrilir.
          </p>
        </article>
      </div>
    </section>
  );
}
