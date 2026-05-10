import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

type ChartPoint = [number, number];

function round(value: number, digits = 3) {
  return Number(value.toFixed(digits));
}

function buildScopeResponse(): ChartPoint[] {
  const data: ChartPoint[] = [];
  const target = 3.8;
  const dampingRatio = 0.105;
  const naturalFrequency = 0.705;
  const dampedFrequency = naturalFrequency * Math.sqrt(1 - dampingRatio ** 2);
  const phase = Math.atan(Math.sqrt(1 - dampingRatio ** 2) / dampingRatio);
  const amplitude = 1 / Math.sqrt(1 - dampingRatio ** 2);

  for (let index = 0; index <= 300; index += 1) {
    const t = (150 * index) / 300;
    const response =
      target *
      (1 -
        amplitude *
          Math.exp(-dampingRatio * naturalFrequency * t) *
          Math.sin(dampedFrequency * t + phase));

    data.push([round(t, 2), round(Math.max(response, 0), 4)]);
  }

  return data;
}

function buildPidSettlingResponse(): ChartPoint[] {
  const data: ChartPoint[] = [];
  const steady = 0.312;

  for (let index = 0; index <= 1200; index += 1) {
    const t = (2 * index) / 1200;
    const primaryOscillation = 0.31 * Math.exp(-2.55 * t) * Math.sin(148 * t - Math.PI / 2);
    const smallRipple = 0.01 * Math.exp(-1.35 * t) * Math.sin(690 * t);
    const response = steady + primaryOscillation + smallRipple;
    data.push([round(t, 4), round(Math.max(response, 0), 4)]);
  }

  return data;
}

function buildLegacyPidResponse(): ChartPoint[] {
  const data: ChartPoint[] = [];
  const target = 4;
  const damping = 0.155;
  const omega = 0.18;
  const beta = 0.03;

  for (let index = 0; index <= 500; index += 1) {
    const t = (150 * index) / 500;
    const y = target * (1 - Math.exp(-damping * t) * (Math.cos(omega * t) + beta * Math.sin(omega * t)));
    data.push([round(t, 2), round(y, 4)]);
  }

  return data;
}

export function TransitionProcessCharts() {
  const scopeData = useMemo(() => buildScopeResponse(), []);
  const pidSettlingData = useMemo(() => buildPidSettlingResponse(), []);
  const legacyPidData = useMemo(() => buildLegacyPidResponse(), []);
  const legacyPointCount = legacyPidData.length;

  const scopeOption = useMemo(
    () => ({
      animation: false,
      backgroundColor: "#000000",
      color: ["#c9c21d"],
      grid: { left: 54, right: 18, top: 18, bottom: 44 },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#111111",
        borderColor: "#4c4c4c",
        textStyle: { color: "#e5e5e5" },
        valueFormatter: (value: number) => value.toFixed(3),
      },
      xAxis: {
        type: "value",
        min: 0,
        max: 150,
        interval: 50,
        axisLabel: { color: "#c9c9c9" },
        axisLine: { lineStyle: { color: "#7b7b7b" } },
        axisTick: { lineStyle: { color: "#7b7b7b" } },
        splitLine: { lineStyle: { color: "#333333", width: 1.1 } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 7.3,
        interval: 1,
        axisLabel: { color: "#c9c9c9" },
        axisLine: { lineStyle: { color: "#7b7b7b" } },
        axisTick: { lineStyle: { color: "#7b7b7b" } },
        splitLine: { lineStyle: { color: "#333333", width: 1.1 } },
      },
      series: [
        {
          name: "Keçid prosesi",
          type: "line",
          showSymbol: false,
          smooth: false,
          data: scopeData,
          lineStyle: { color: "#c9c21d", width: 1.35 },
        },
      ],
    }),
    [scopeData],
  );

  const pidSettlingOption = useMemo(
    () => ({
      animation: false,
      backgroundColor: "#ffffff",
      color: ["#111111"],
      grid: { left: 56, right: 26, top: 22, bottom: 42 },
      tooltip: {
        trigger: "axis",
        valueFormatter: (value: number) => value.toFixed(4),
      },
      xAxis: {
        type: "value",
        min: 0,
        max: 2,
        interval: 0.2,
        axisLabel: { color: "#111111" },
        axisLine: { lineStyle: { color: "#111111" } },
        axisTick: { lineStyle: { color: "#111111" } },
        splitLine: { lineStyle: { color: "rgba(0, 0, 0, 0.72)", width: 1 } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 0.65,
        interval: 0.05,
        axisLabel: { color: "#111111" },
        axisLine: { lineStyle: { color: "#111111" } },
        axisTick: { lineStyle: { color: "#111111" } },
        splitLine: { lineStyle: { color: "rgba(0, 0, 0, 0.72)", width: 1 } },
      },
      series: [
        {
          name: "PID ilə keçid prosesi",
          type: "line",
          showSymbol: false,
          smooth: false,
          data: pidSettlingData,
          lineStyle: { color: "#111111", width: 1.3 },
        },
      ],
    }),
    [pidSettlingData],
  );

  const legacyPidOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      animation: false,
      grid: { left: 54, right: 24, top: 26, bottom: 42 },
      xAxis: {
        type: "value",
        min: 0,
        max: 150,
        interval: 25,
        axisLabel: { color: "#52625a" },
        axisLine: { lineStyle: { color: "#26342d" } },
        splitLine: { lineStyle: { color: "#9ba9a2", width: 1.1 } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 4.5,
        interval: 0.5,
        axisLabel: { color: "#52625a" },
        axisLine: { lineStyle: { color: "#26342d" } },
        splitLine: { lineStyle: { color: "#9ba9a2", width: 1.1 } },
      },
      series: [
        {
          name: "Köhnə PID qrafiki",
          type: "line",
          showSymbol: false,
          smooth: true,
          data: legacyPidData,
          lineStyle: { color: "#3156d4", width: 2.5 },
        },
      ],
    }),
    [legacyPidData],
  );

  return (
    <section className="transition-chart-grid matlab-scope-layout" aria-label="4-cü fəsil keçid prosesi qrafikləri">
      <article className="panel transition-chart-panel scope-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">ŞƏKİL 4.3</p>
            <h2>Keçid prosesinin qrafiki</h2>
          </div>
        </div>

        <div className="scope-window" aria-label="MATLAB Scope tipli keçid prosesi">
          <div className="scope-titlebar">
            <span>Scope</span>
            <span className="scope-window-buttons">─ □ ×</span>
          </div>
          <div className="scope-menubar">File&nbsp;&nbsp;&nbsp;Tools&nbsp;&nbsp;&nbsp;View&nbsp;&nbsp;&nbsp;Simulation&nbsp;&nbsp;&nbsp;Help</div>
          <div className="scope-toolbar" aria-hidden="true">
            <span />
            <span />
            <span className="play" />
            <span />
            <span />
            <span />
          </div>
          <ReactECharts option={scopeOption} className="scope-chart" notMerge lazyUpdate />
          <div className="scope-footer">
            <span>Ready</span>
            <span>Sample based&nbsp;&nbsp;&nbsp;T=150.000</span>
          </div>
        </div>

        <p className="chart-caption">
          Bu qrafik sistemin hədəfə çatarkən əvvəl rəqs etdiyini, sonra isə sönərək qərarlaşmış qiymətə yaxınlaşdığını göstərir.
        </p>
      </article>

      <article className="panel transition-chart-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">ŞƏKİL 4.4</p>
            <h2>PİD tənzimləyicisi əlavə etməklə alınan keçid prosesinin qrafiki</h2>
          </div>
        </div>
        <ReactECharts option={pidSettlingOption} className="transition-chart pid-settling-chart" notMerge lazyUpdate />
        <p className="chart-caption">
          PID təsiri ilə rəqslərin amplitudası azalır və çıxış qısa müddətdən sonra sabit qiymət ətrafında qalır.
        </p>
      </article>

      <article
        className="panel transition-chart-panel legacy-transition-hidden"
        aria-hidden="true"
        data-legacy-chart="old-blue-echarts-transition"
        data-legacy-points={legacyPointCount}
      >
        <div data-legacy-color={legacyPidOption.series[0].lineStyle.color}>Köhnə qrafik silinməyib, UI-da gizlədilib.</div>
      </article>
    </section>
  );
}
