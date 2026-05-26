import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "../layouts/DashboardLayout";
import { ML_METRICS } from "../utils/predictionModel";
import PerformanceChart from "../charts/PerformanceChart";
import CorrelationHeatmap from "../charts/CorrelationHeatmap";
import { useAuth } from "../services/auth";
import ProtectedLoader from "../components/auth/ProtectedLoader";
import { GitCompare, Award, Table, BarChart3, HelpCircle, Activity } from "lucide-react";

export default function ModelComparison() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Sort models by RMSE ascending to calculate performance rankings dynamically
  const rankedModels = Object.entries(ML_METRICS)
    .map(([name, metrics]) => ({ name, ...metrics }))
    .sort((a, b) => a.RMSE - b.RMSE);

  if (isLoading || !isAuthenticated) {
    return <ProtectedLoader />;
  }

  return (
    <DashboardLayout>
      <Head>
        <title>WindCast AI – Model Comparison</title>
      </Head>

      <div className="flex flex-col gap-6 w-full">
        
        {/* Header Title */}
        <div className="pb-2 border-b border-glass-border/30">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 uppercase font-mono">
            Model Performance Comparison & Feature Physics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit evaluation metrics (MAE, RMSE, R2, MAPE) across ML forecasting models and weather-feature correlations.
          </p>
        </div>

        {/* 1. Rankings & Metrics Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left panel: Standard Metrics Table */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-glass-border/30 mb-4">
                <div className="flex items-center gap-2">
                  <Table size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                    Model Evaluation Metrics Table
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">TEST EVALUATION SYSTEM</span>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-glass-border/40 text-slate-500 uppercase tracking-widest text-[9px] h-8">
                      <th className="pb-2">Algorithm Name</th>
                      <th className="pb-2 text-right">MAE (kW)</th>
                      <th className="pb-2 text-right">RMSE (kW)</th>
                      <th className="pb-2 text-right">R2 Accuracy</th>
                      <th className="pb-2 text-right">MAPE (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/20">
                    {rankedModels.map((model, idx) => {
                      const isBest = idx === 0;
                      return (
                        <tr
                          key={model.name}
                          className={`h-11 ${
                            isBest ? "text-emerald-400 font-semibold" : "text-slate-300"
                          }`}
                        >
                          <td className="py-2.5 flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              isBest ? "bg-emerald-400 animate-ping" : "bg-slate-700"
                            }`}></span>
                            {model.name}
                            {isBest && (
                              <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
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

            <div className="mt-4 p-3 bg-slate-950/40 border border-glass-border rounded-lg text-[10px] text-slate-500 font-normal leading-relaxed uppercase tracking-wider font-mono">
              Note: Metrics come from the saved backend model report. MAE and RMSE measure prediction error; R2 shows how well each model explains measured wind-power output.
            </div>
          </div>

          {/* Right panel: dynamic ranking best badge card */}
          <div className="glass-panel p-5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
            {/* Backlit highlight */}
            <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-emerald-500/5 filter blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />

            <div className="flex items-center justify-between pb-3.5 border-b border-glass-border/30 mb-4">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-emerald-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                  Algorithm Ranking Badges
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">ML OPS REPORT</span>
            </div>

            {/* Ranking display widgets */}
            <div className="flex-1 flex flex-col gap-3 justify-center">
              {rankedModels.map((model, idx) => {
                const rankColors = [
                  "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
                  "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
                  "bg-slate-950/40 border-glass-border text-slate-300",
                  "bg-slate-950/20 border-glass-border/50 text-slate-500"
                ];

                return (
                  <div
                    key={`rank-badge-${model.name}`}
                    className={`px-3.5 py-2.5 rounded-lg border flex items-center justify-between text-xs font-mono ${rankColors[idx]}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[10px] w-4 uppercase tracking-widest text-slate-500">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold">{model.name}</span>
                    </div>
                    <span className="font-bold text-[10px] uppercase tracking-wider">
                      RMSE {model.RMSE.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3.5 border-t border-glass-border/30 text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400 animate-pulse" />
              <span>{rankedModels[0]?.name} production model is active</span>
            </div>

          </div>

        </div>

        {/* 2. Grouped Performance Bar Chart Panel */}
        <div className="glass-panel p-5 rounded-xl border border-glass-border min-h-[380px]">
          <div className="flex items-center justify-between pb-4 border-b border-glass-border/30 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Model Error Profile Visualizer (MAE, RMSE, MAPE)
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">INTERACTIVE MULTI-BAR</span>
          </div>

          <div className="w-full relative">
            <PerformanceChart />
          </div>
        </div>

        {/* 3. Custom Correlation Heatmap Matrix */}
        <div className="glass-panel p-5 rounded-xl border border-glass-border min-h-[380px]">
          <div className="flex items-center justify-between pb-4 border-b border-glass-border/30 mb-6">
            <div className="flex items-center gap-2">
              <GitCompare size={16} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Atmospheric Variables Correlation Grid Heatmap
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">PHYSICS COEFFICIENT ARRAY</span>
          </div>

          <div className="w-full relative">
            <CorrelationHeatmap />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
