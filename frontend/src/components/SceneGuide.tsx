import { CircleDot, Droplets, Goal, Magnet, PackageOpen, RadioReceiver, Waves, Zap } from "lucide-react";

const sceneItems = [
  {
    icon: Zap,
    title: "Yuxarıdakı mis halqalar",
    text: "Solenoid dolağıdır. Cərəyan artdıqca elektromaqnit sahəsi güclənir və materialı yuxarı dartır.",
  },
  {
    icon: CircleDot,
    title: "Ortadakı levitasiya cismi",
    text: "Solenoid daxilində levitasiya edən sabit maqnit və onun daşıdığı material yükünü göstərir. N/S işarələri real sxemdəki sabit maqnitin qütbləridir.",
  },
  {
    icon: PackageOpen,
    title: "Qum girişi",
    text: "Bərk-səpələnən materialın ölçü kamerasına daxil olduğu bunkerdir. Qum axını artdıqca quru material kütləsi və kamera dolması artır.",
  },
  {
    icon: Droplets,
    title: "Su girişi",
    text: "Rütubəti yaratmaq üçün materiala verilən su xəttidir. Su axını artanda materialda su kütləsi, rütubət və tələb olunan solenoid cərəyanı dəyişir.",
  },
  {
    icon: Waves,
    title: "Sarı və mavi əyri xətlər",
    text: "Maqnit sahə xətləridir. Onlar solenoid cərəyanının yaratdığı sahənin istiqamətini və intensivliyini vizual göstərir.",
  },
  {
    icon: RadioReceiver,
    title: "Soldakı sensor şüası",
    text: "Hall/yerdəyişmə vericisinin ideyasını simvolizə edir. Obyektin mövqeyi ölçülür və idarəetməyə geri qaytarılır.",
  },
  {
    icon: Goal,
    title: "Sarı hədəf halqası",
    text: "Tələb olunan levitasiya məsafəsidir. PID sistemi obyekti bu səviyyədə saxlamağa çalışır.",
  },
  {
    icon: Magnet,
    title: "Aşağıdakı baza",
    text: "Qurğunun mexaniki dayaq hissəsini və ölçmə kamerasının referans mühitini göstərir.",
  },
];

export function SceneGuide() {
  return (
    <section className="guide-grid" aria-label="3D səhnənin izahı">
      {sceneItems.map(({ icon: Icon, title, text }) => (
        <article className="guide-item" key={title}>
          <Icon size={18} />
          <div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
