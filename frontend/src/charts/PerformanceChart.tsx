import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ML_METRICS } from "../utils/predictionModel";
import { BackendMetric, fetchModels } from "../utils/windcastApi";

type MetricKey = "MAE" | "RMSE" | "MAPE";

function formatModelName(name: string) {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PerformanceChart() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("RMSE");
  const [backendMetrics, setBackendMetrics] = useState<BackendMetric[]>([]);
  const [bestModel, setBestModel] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      try {
        const response = await fetchModels();
        if (!cancelled) {
          setBackendMetrics(response.metrics);
          setBestModel(response.comparison.best_model);
        }
      } catch {
        if (!cancelled) {
          setBackendMetrics([]);
          setBestModel("XGBoost");
        }
      }
    }

    void loadMetrics();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (backendMetrics.length > 0) {
      return backendMetrics.map((item) => ({
        name: formatModelName(item.model),
        rawName: item.model,
        value:
          activeMetric === "MAE"
            ? item.mae
            : activeMetric === "RMSE"
              ? item.rmse
              : item.mape,
        R2: item.r2,
      }));
    }

    return Object.entries(ML_METRICS).map(([name, metrics]) => ({
      name,
      rawName: name,
      value: metrics[activeMetric],
      R2: metrics.R2,
    }));
  }, [activeMetric, backendMetrics]);

  const metricsInfo = {
    MAE: { label: "Mean Absolute Error", color: "#06b6d4" },
    RMSE: { label: "Root Mean Squared Error", color: "#8b5cf6" },
    MAPE: { label: "Mean Absolute Percentage Error (%)", color: "#10b981" },
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel border border-slate-500/30 p-3.5 rounded-lg text-xs flex flex-col gap-1.5 shadow-2xl">
          <span className="font-semibold text-slate-100">{data.name}</span>
          <span className="font-mono text-cyan-400">
            {activeMetric}: <span className="font-bold">{data.value.toFixed(3)}</span>
          </span>
          <span className="font-mono text-emerald-400">
            R2: <span className="font-bold">{(data.R2 * 100).toFixed(1)}%</span>
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full min-h-[340px]">
      <div className="flex gap-2 self-end">
        {(["MAE", "RMSE", "MAPE"] as const).map((metric) => (
          <button
            key={metric}
            onClick={() => setActiveMetric(metric)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-mono tracking-wider font-semibold border transition-all ${
              activeMetric === metric
                ? "bg-cyan-500/10 border-cyan-500/60 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "bg-slate-950/40 border-glass-border text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            {metric}
          </button>
        ))}
      </div>

      <div className="flex-1 w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" fontSize={10} tickLine={false} dy={8} />
            <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={10} fontFamily="monospace" tickLine={false} dx={-8} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                const isBest = entry.rawName === bestModel;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isBest ? "#10b981" : metricsInfo[activeMetric].color}
                    fillOpacity={isBest ? 0.85 : 0.65}
                    stroke={isBest ? "#10b981" : metricsInfo[activeMetric].color}
                    strokeWidth={1}
                    className="transition-all duration-300 hover:opacity-100"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
