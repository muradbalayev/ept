import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { useTelemetryStore } from "../store/telemetryStore";

export function Charts() {
  const history = useTelemetryStore((state) => state.history);
  const axisText = "#52625a";
  const gridLine = "#d5e0da";
  const legendText = "#26342d";

  const motionOption = useMemo(() => {
    const times = history.map((point) => point.time.toFixed(1));
    return {
      backgroundColor: "transparent",
      color: ["#4fd1c5", "#f6ad55", "#ef476f"],
      tooltip: { trigger: "axis" },
      legend: { top: 0, textStyle: { color: legendText } },
      grid: { left: 48, right: 48, top: 42, bottom: 34 },
      xAxis: { type: "category", data: times, axisLabel: { color: axisText }, axisLine: { lineStyle: { color: gridLine } } },
      yAxis: [
        { type: "value", name: "sm", axisLabel: { color: axisText }, splitLine: { lineStyle: { color: gridLine } } },
        { type: "value", name: "A", axisLabel: { color: axisText }, splitLine: { show: false } },
      ],
      series: [
        {
          name: "Məsafə",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number((point.distance * 100).toFixed(3))),
        },
        {
          name: "Ölçülmüş məsafə",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number((point.measuredDistance * 100).toFixed(3))),
          lineStyle: { type: "dashed" },
        },
        {
          name: "Filtrlənmiş məsafə",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number((point.filteredDistance * 100).toFixed(3))),
          lineStyle: { width: 3 },
        },
        {
          name: "Hədəf",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number((point.targetDistance * 100).toFixed(3))),
        },
        {
          name: "Cərəyan",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number(point.current.toFixed(3))),
        },
      ],
    };
  }, [history]);

  const qualityOption = useMemo(() => {
    const times = history.map((point) => point.time.toFixed(1));
    return {
      backgroundColor: "transparent",
      color: ["#7c83ff", "#06d6a0", "#ffd166", "#a35f24", "#0f8f84", "#4f57c8"],
      tooltip: { trigger: "axis" },
      legend: { top: 0, textStyle: { color: legendText } },
      grid: { left: 48, right: 48, top: 42, bottom: 34 },
      xAxis: { type: "category", data: times, axisLabel: { color: axisText }, axisLine: { lineStyle: { color: gridLine } } },
      yAxis: [
        { type: "value", name: "% / kq", axisLabel: { color: axisText }, splitLine: { lineStyle: { color: gridLine } } },
      ],
      series: [
        {
          name: "Həqiqi rütubət",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number((point.trueMoisture * 100).toFixed(2))),
        },
        {
          name: "Hesablanan rütubət",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number((point.estimatedMoisture * 100).toFixed(2))),
        },
        {
          name: "Ölçmə xətası",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number((point.moistureError * 100).toFixed(3))),
        },
        {
          name: "Real kütlə",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number(point.mass.toFixed(2))),
        },
        {
          name: "Maqnitin hiss etdiyi çəki",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number(point.apparentMass.toFixed(2))),
          lineStyle: { type: "dashed" },
        },
        {
          name: "Su səviyyəsi",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number((point.waterLevel * 100).toFixed(2))),
        },
        {
          name: "Kamera dolması",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: history.map((point) => Number((point.materialFill * 100).toFixed(2))),
        },
      ],
    };
  }, [history]);

  return (
    <section className="chart-grid">
      <article className="panel chart-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">CANLI QRAFİK</p>
            <h2>Məsafə və cərəyan</h2>
          </div>
        </div>
        <ReactECharts option={motionOption} className="chart" notMerge lazyUpdate />
      </article>
      <article className="panel chart-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">MATERİAL</p>
            <h2>Rütubətin ölçülməsi</h2>
          </div>
        </div>
        <ReactECharts option={qualityOption} className="chart" notMerge lazyUpdate />
      </article>
    </section>
  );
}
