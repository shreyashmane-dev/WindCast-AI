import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "../layouts/DashboardLayout";
import { ML_METRICS } from "../utils/predictionModel";
import PerformanceChart from "../charts/PerformanceChart";
import CorrelationHeatmap from "../charts/CorrelationHeatmap";
import { useAuth } from "../services/auth";
import ProtectedLoader from "../components/auth/ProtectedLoader";
import { GitCompare, Award, Table, BarChart3, HelpCircle, Activity, LineChart as LineIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

export default function ModelComparison() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Sort models by RMSE ascending
  const rankedModels = Object.entries(ML_METRICS)
    .map(([name, metrics]) => ({ name, ...metrics }))
    .sort((a, b) => a.RMSE - b.RMSE);

  if (isLoading || !isAuthenticated) {
    return <ProtectedLoader />;
  }

  // The best model (lowest RMSE)
  const bestModelName = rankedModels[0]?.name || "LSTM-X4 Deep Net";

  const forecastPathData = [
    { step: "T+10m", Actual: 1420, LSTM: 1410, XGBoost: 1390, RandomForest: 1380, LinearReg: 1310 },
    { step: "T+20m", Actual: 1450, LSTM: 1445, XGBoost: 1410, RandomForest: 1400, LinearReg: 1330 },
    { step: "T+30m", Actual: 1510, LSTM: 1502, XGBoost: 1470, RandomForest: 1430, LinearReg: 1360 },
    { step: "T+40m", Actual: 1480, LSTM: 1485, XGBoost: 1440, RandomForest: 1410, LinearReg: 1350 },
    { step: "T+50m", Actual: 1560, LSTM: 1550, XGBoost: 1500, RandomForest: 1460, LinearReg: 1390 },
    { step: "T+60m", Actual: 1610, LSTM: 1605, XGBoost: 1530, RandomForest: 1490, LinearReg: 1410 },
    { step: "T+70m", Actual: 1590, LSTM: 1594, XGBoost: 1510, RandomForest: 1470, LinearReg: 1400 },
    { step: "T+80m", Actual: 1650, LSTM: 1642, XGBoost: 1560, RandomForest: 1510, LinearReg: 1430 },
    { step: "T+90m", Actual: 1720, LSTM: 1715, XGBoost: 1610, RandomForest: 1560, LinearReg: 1460 },
    { step: "T+100m", Actual: 1690, LSTM: 1698, XGBoost: 1580, RandomForest: 1530, LinearReg: 1440 },
    { step: "T+110m", Actual: 1740, LSTM: 1735, XGBoost: 1620, RandomForest: 1560, LinearReg: 1470 },
    { step: "T+120m", Actual: 1810, LSTM: 1803, XGBoost: 1670, RandomForest: 1610, LinearReg: 1500 }
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>WindCast AI – Model Comparison</title>
      </Head>

      <div className="flex flex-col gap-6 w-full bg-grid-pattern pb-8">
        
        {/* Header Title */}
        <div className="pb-2 border-b border-white/5">
          <h2 className="font-display-lg text-display-lg text-primary uppercase font-mono">
            Model Performance Comparison
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Audit evaluation metrics (MAE, RMSE, R2, MAPE) across ML forecasting models and weather-feature correlations.
          </p>
        </div>

        {/* AI Recommendation Badge (Pulsing Glow from Stitch) */}
        <div className="glass-panel-heavy rounded-xl p-6 border-primary/30 animate-pulse-glow relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary/50 text-primary shadow-[0_0_12px_rgba(0,242,255,0.4)]">
            <Award size={24} className="text-primary" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-widest">AI Recommendation • Best Fit</span>
            </div>
            <h3 className="font-title-md text-md text-on-surface font-bold font-mono">{bestModelName}</h3>
            <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
              LSTM outperforms other models by 14% in current volatile wind conditions due to superior handling of sequential temporal dependencies.
            </p>
          </div>
          <button className="flex-shrink-0 bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-mono font-bold px-6 py-2.5 rounded-lg text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_12px_rgba(0,242,255,0.3)] cursor-pointer select-none">
            Deploy {bestModelName.split(" ")[0]}
          </button>
        </div>

        {/* 1. Rankings & Metrics Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left panel: Standard Metrics Table */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-xl flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Table size={16} className="text-primary" />
                  <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                    Model Evaluation Metrics Table
                  </span>
                </div>
                <span className="text-[9px] font-mono text-on-surface-variant">TEST EVALUATION SYSTEM</span>
              </div>

              {/* Responsive Table styled cleanly as Stitch */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-on-surface-variant uppercase tracking-widest text-[9px] h-8">
                      <th className="pb-2">Algorithm Name</th>
                      <th className="pb-2 text-right">MAE (kW)</th>
                      <th className="pb-2 text-right">RMSE (kW)</th>
                      <th className="pb-2 text-right">R2 Accuracy</th>
                      <th className="pb-2 text-right">MAPE (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-on-surface">
                    {rankedModels.map((model, idx) => {
                      const isBest = idx === 0;
                      return (
                        <tr
                          key={model.name}
                          className={`h-11 ${
                            isBest ? "text-secondary font-semibold" : "text-on-surface-variant"
                          }`}
                        >
                          <td className="py-2.5 flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              isBest ? "bg-secondary animate-ping" : "bg-outline"
                            }`}></span>
                            {model.name}
                            {isBest && (
                              <span className="text-[8px] bg-secondary-container/10 border border-secondary/30 text-secondary px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                                BEST
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right">{model.MAE.toFixed(2)}</td>
                          <td className="py-2.5 text-right">{model.RMSE.toFixed(2)}</td>
                          <td className="py-2.5 text-right font-bold">{(model.R2 * 100).toFixed(1)}%</td>
                          <td className="py-2.5 text-right">{model.MAPE.toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 p-3 bg-surface-container/40 border border-white/5 rounded-lg text-[10px] text-on-surface-variant font-normal leading-relaxed uppercase tracking-wider font-mono">
              Note: Metrics come from the saved backend model report. MAE and RMSE measure prediction error; R2 shows how well each model explains measured wind-power output.
            </div>
          </div>

          {/* Right panel: dynamic ranking best badge card */}
          <div className="glass-panel p-5 rounded-xl flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
            {/* Backlit highlight */}
            <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-secondary/5 filter blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />

            <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-secondary" />
                <span className="text-xs font-mono font-bold tracking-wider text-secondary uppercase">
                  Algorithm Ranking Badges
                </span>
              </div>
              <span className="text-[9px] font-mono text-on-surface-variant">ML OPS REPORT</span>
            </div>

            {/* Ranking display widgets */}
            <div className="flex-grow flex flex-col gap-3 justify-center">
              {rankedModels.map((model, idx) => {
                const rankColors = [
                  "bg-secondary/10 border-secondary/30 text-secondary shadow-[0_0_12px_rgba(78,222,163,0.15)]",
                  "bg-primary-container/10 border-primary/20 text-primary",
                  "bg-surface-container/50 border-white/5 text-on-surface-variant",
                  "bg-surface-container/20 border-white/5 opacity-60 text-on-surface-variant"
                ];

                return (
                  <div
                    key={`rank-badge-${model.name}`}
                    className={`px-3.5 py-2.5 rounded-lg border flex items-center justify-between text-xs font-mono ${rankColors[idx] || rankColors[2]}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[10px] w-4 uppercase tracking-widest text-on-surface-variant">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-on-surface">{model.name}</span>
                    </div>
                    <span className="font-bold text-[10px] uppercase tracking-wider">
                      RMSE {model.RMSE.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3.5 border-t border-white/5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={12} className="text-secondary animate-pulse" />
              <span>{bestModelName} production model is active</span>
            </div>

          </div>

        </div>

        {/* 2. Grouped Performance Bar Chart Panel */}
        <div className="glass-panel p-5 rounded-xl min-h-[380px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              <span className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase">
                Model Error Profile Visualizer (MAE, RMSE, MAPE)
              </span>
            </div>
            <span className="text-[9px] font-mono text-on-surface-variant">INTERACTIVE MULTI-BAR</span>
          </div>

          <div className="w-full relative">
            <PerformanceChart />
          </div>
        </div>

        {/* 3. Multi-Model Forecast Path Prediction Overlay */}
        <div className="glass-panel p-5 rounded-xl min-h-[380px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <LineIcon size={16} className="text-primary" />
              <span className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase">
                Multi-Model Sequential Forecast Path Overlay (T+120m)
              </span>
            </div>
            <span className="text-[9px] font-mono text-on-surface-variant">TEMPORAL FLUX TRACKING</span>
          </div>

          <div className="flex-1 w-full text-slate-200 text-xs h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastPathData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="step" stroke="#849495" fontSize={9} />
                <YAxis stroke="#849495" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#171F33", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelClassName="text-on-surface-variant text-[10px] font-mono uppercase"
                />
                <CartesianGrid stroke="rgba(255, 255, 255, 0.02)" strokeDasharray="3 3" />
                <Legend wrapperStyle={{ fontSize: "9px", fontFamily: "monospace", textTransform: "uppercase" }} />
                
                <Line type="monotone" dataKey="Actual" stroke="#4edea3" strokeWidth={2.5} dot={true} style={{ filter: "drop-shadow(0 0 4px rgba(78,222,163,0.5))" }} />
                <Line type="monotone" dataKey="LSTM" stroke="#00f2ff" strokeWidth={2} dot={false} style={{ filter: "drop-shadow(0 0 3px rgba(0,242,255,0.4))" }} />
                <Line type="monotone" dataKey="XGBoost" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="RandomForest" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="LinearReg" stroke="#6b7280" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-surface-container/40 border border-white/5 rounded-lg text-[10px] text-on-surface-variant font-mono uppercase tracking-wider leading-relaxed">
            Physics Explanation: Tree ensembles (Random Forest, XGBoost) fit individual weather inputs but miss temporal memory. The sequential LSTM model tracks actual wind flow inertia over time, avoiding localized lag.
          </div>
        </div>

        {/* 4. Custom Correlation Heatmap Matrix */}
        <div className="glass-panel p-5 rounded-xl min-h-[380px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
            <div className="flex items-center gap-2">
              <GitCompare size={16} className="text-primary" />
              <span className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase">
                Atmospheric Variables Correlation Grid Heatmap
              </span>
            </div>
            <span className="text-[9px] font-mono text-on-surface-variant">PHYSICS COEFFICIENT ARRAY</span>
          </div>

          <div className="w-full relative">
            <CorrelationHeatmap />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
