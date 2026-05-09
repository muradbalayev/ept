import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

function round(value: number, digits = 3) {
  return Number(value.toFixed(digits));
}

function buildOscillatingResponse() {
  const data: Array<[number, number]> = [];
  const steady = 0.312;
  const damping = 2.7;
  const frequency = 21.2;
  const omega = 2 * Math.PI * frequency;
  const amplitude = 0.39;

  for (let index = 0; index <= 520; index += 1) {
    const t = (2 * index) / 520;
    const y = steady + Math.exp(-damping * t) * (amplitude * Math.sin(omega * t) - steady * Math.cos(omega * t));
    data.push([round(t, 3), round(Math.max(0, y), 4)]);
  }

  return data;
}

function buildPidResponse() {
  const data: Array<[number, number]> = [];
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

const axisText = "#52625a";
const gridLine = "#9ba9a2";

export function TransitionProcessCharts() {
  const pidlessData = useMemo(() => buildOscillatingResponse(), []);
  const pidData = useMemo(() => buildPidResponse(), []);

  const pidlessOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      animation: false,
      grid: { left: 54, right: 24, top: 26, bottom: 42 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "value",
        min: 0,
        max: 2,
        interval: 0.1,
        name: "t, s",
        nameLocation: "middle",
        nameGap: 28,
        axisLabel: { color: axisText },
        axisLine: { lineStyle: { color: "#26342d" } },
        splitLine: { lineStyle: { color: gridLine, width: 1.1 } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 0.65,
        interval: 0.05,
        name: "Is(t), A",
        axisLabel: { color: axisText },
        axisLine: { lineStyle: { color: "#26342d" } },
        splitLine: { lineStyle: { color: gridLine, width: 1.1 } },
      },
      series: [
        {
          name: "PID-siz keçid prosesi",
          type: "line",
          showSymbol: false,
          smooth: false,
          data: pidlessData,
          lineStyle: { color: "#111111", width: 2 },
        },
      ],
    }),
    [pidlessData],
  );

  const pidOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      animation: false,
      grid: { left: 54, right: 24, top: 26, bottom: 42 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "value",
        min: 0,
        max: 150,
        interval: 25,
        name: "t, s",
        nameLocation: "middle",
        nameGap: 28,
        axisLabel: { color: axisText },
        axisLine: { lineStyle: { color: "#26342d" } },
        splitLine: { lineStyle: { color: gridLine, width: 1.1 } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 4.5,
        interval: 0.5,
        name: "Çıxış",
        axisLabel: { color: axisText },
        axisLine: { lineStyle: { color: "#26342d" } },
        splitLine: { lineStyle: { color: gridLine, width: 1.1 } },
      },
      series: [
        {
          name: "PID ilə keçid prosesi",
          type: "line",
          showSymbol: false,
          smooth: true,
          data: pidData,
          lineStyle: { color: "#3156d4", width: 2.5 },
          markLine: {
            symbol: "none",
            label: { color: axisText, formatter: "Qərarlaşmış qiymət" },
            lineStyle: { color: "#87958d", type: "solid" },
            data: [{ yAxis: 4 }],
          },
        },
      ],
    }),
    [pidData],
  );

  return (
    <section className="transition-chart-grid" aria-label="4-cü fəsil keçid prosesi qrafikləri">
      <article className="panel transition-chart-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">ŞƏKİL 4.4.1</p>
            <h2>Keçid prosesinin qrafiki</h2>
          </div>
        </div>
        <ReactECharts option={pidlessOption} className="transition-chart" notMerge lazyUpdate />
        <p className="chart-caption">
          PID tətbiq edilməmiş halda sistemin cavabı sönən-rəqsi xarakter daşıyır. Əyri əvvəl böyük amplituda ilə
          rəqs edir, sonra tədricən qərarlaşmış qiymətə yaxınlaşır.
        </p>
      </article>

      <article className="panel transition-chart-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">ŞƏKİL 4.4.2</p>
            <h2>PİD tənzimləyicisi əlavə etməklə alınan keçid prosesinin qrafiki</h2>
          </div>
        </div>
        <ReactECharts option={pidOption} className="transition-chart" notMerge lazyUpdate />
        <p className="chart-caption">
          PID tənzimləyicisi əlavə edildikdən sonra sistem daha tez qərarlaşır, rəqslərin sayı azalır və çıxış
          hədəf qiymət ətrafında stabil qalır.
        </p>
      </article>
    </section>
  );
}
