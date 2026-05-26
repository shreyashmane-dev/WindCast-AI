import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "../layouts/DashboardLayout";
import { useSimulation } from "../hooks/useWeatherSimulation";
import { calculateEfficiency, getAlertStatus, ML_METRICS } from "../utils/predictionModel";
import RealTimeChart from "../charts/RealTimeChart";
import ForecastChart from "../charts/ForecastChart";
import WindTurbine from "../components/WindTurbine";
import { useAuth } from "../services/auth";
import ProtectedLoader from "../components/auth/ProtectedLoader";
import {
  Zap,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  Percent,
  Play,
  Pause,
  ArrowUpRight,
  TrendingUp,
  Compass,
  Gauge
} from "lucide-react";

export default function DashboardOverview() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const {
    weather,
    activeModel,
    isSimulating,
    history,
    forecasts,
    setIsSimulating,
  } = useSimulation();

  if (isLoading || !isAuthenticated) {
    return <ProtectedLoader />;
  }

  const [activeHorizon, setActiveHorizon] = useState<"1 Hour" | "6 Hours" | "24 Hours">("6 Hours");

  const latestPower = history[history.length - 1]?.power || 0;
  const efficiency = calculateEfficiency(latestPower);
  const alertInfo = getAlertStatus(latestPower, weather.windspeed);
  const modelAccuracy = ML_METRICS[activeModel]?.R2 || 0.90;

  // Format wind direction (e.g. 222deg -> SW)
  const getWindDirectionString = (deg: number) => {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const idx = Math.round(((deg % 360) / 22.5) % 16);
    return `${deg}° (${directions[idx]})`;
  };

  const kpis = [
    {
      label: "PREDICTED POWER OUTPUT",
      value: `${latestPower.toLocaleString(undefined, { maximumFractionDigits: 1 })} kW`,
      sub: `Capacity Peak: 2,200 kW`,
      color: "text-cyan-400 text-glow-cyan",
      borderColor: "hover:border-cyan-500/35",
      icon: Zap,
      iconColor: "text-cyan-400",
      glowBg: "bg-cyan-500/10",
    },
    {
      label: "LIVE WIND SPEED",
      value: `${weather.windspeed.toFixed(2)} m/s`,
      sub: `Primary Kinetic Driver`,
      color: "text-slate-100",
      borderColor: "hover:border-slate-500/35",
      icon: Wind,
      iconColor: "text-slate-400 animate-pulse",
      glowBg: "bg-slate-500/5",
    },
    {
      label: "TURBINE OPERATIONAL EFF",
      value: `${efficiency.toFixed(1)}%`,
      sub: `Current Conversion Ratio`,
      color: efficiency > 60 ? "text-emerald-400 text-glow-green" : efficiency > 20 ? "text-slate-200" : "text-amber-400",
      borderColor: "hover:border-emerald-500/35",
      icon: Gauge,
      iconColor: efficiency > 60 ? "text-emerald-400" : "text-amber-400",
      glowBg: "bg-emerald-500/5",
    },
    {
      label: "MODEL R2 SCORE",
      value: `${(modelAccuracy * 100).toFixed(1)}%`,
      sub: `Confidence Index: EXCELLENT`,
      color: "text-emerald-400",
      borderColor: "hover:border-emerald-500/35",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
      glowBg: "bg-emerald-500/5",
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>WindCast AI - Real-Time Forecast Dashboard</title>
      </Head>

      <div className="flex flex-col gap-6 w-full">
        
        {/* Dynamic Telemetry Header Board */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-glass-border/30">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 uppercase font-mono">
              Real-Time Wind Power Forecast Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live weather inputs drive short-term ML predictions and power-output graphs.
            </p>
          </div>

          {/* Simulation controller toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                isSimulating
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:bg-emerald-500/20"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:bg-amber-500/20"
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause size={13} />
                  <span>PAUSE TELEMETRY FEED</span>
                </>
              ) : (
                <>
                  <Play size={13} />
                  <span>START TELEMETRY FEED</span>
                </>
              )}
            </button>

            <div className="px-3.5 py-2 glass-panel border border-glass-border rounded-lg text-xs font-mono flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isSimulating ? "bg-emerald-500 animate-ping" : "bg-amber-500 animate-pulse"}`}></span>
              <span className="text-slate-400 uppercase">SYS_LOAD: 0.14</span>
            </div>
          </div>
        </div>

        {/* 1. Glassmorphism KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div
              key={`kpi-card-${idx}`}
              className={`glass-panel glass-panel-hover p-4.5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[110px] relative overflow-hidden group cursor-default ${kpi.borderColor}`}
            >
              {/* Backlit glow accent */}
              <div className={`absolute -top-12 -right-12 h-24 w-24 rounded-full ${kpi.glowBg} filter blur-xl transition-opacity opacity-50 group-hover:opacity-80`} />

              <div className="flex justify-between items-start z-10">
                <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
                  {kpi.label}
                </span>
                <kpi.icon size={16} className={`${kpi.iconColor}`} />
              </div>

              <div className="mt-3.5 z-10">
                <div className={`text-2xl font-mono font-bold tracking-tight ${kpi.color}`}>
                  {kpi.value}
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">
                  {kpi.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Main Analytics Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          
          {/* Left panel: Real-time generation plot */}
          <div className="xl:col-span-2 glass-panel p-5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[360px]">
            <div className="flex items-center justify-between pb-4 border-b border-glass-border/30 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                  Live Prediction Graph: Wind Power vs Time
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">
                POLLING INTERVAL: 3.0s | MODEL: {activeModel}
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <RealTimeChart data={history} />
            </div>
          </div>

          {/* Right panel: Live turbine status & energy flow */}
          <div className="glass-panel p-5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[360px] relative overflow-hidden group">
            
            {/* Energy flow vector diagram */}
            <div className="flex items-center gap-2 pb-4 border-b border-glass-border/30 mb-4">
              <Wind size={16} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Active Generator Hub #04
              </span>
            </div>

            {/* Turbine illustration */}
            <div className="flex-1 flex flex-col items-center justify-center my-2 relative">
              <WindTurbine windSpeed={weather.windspeed} height={200} />
              
              {/* Radial Energy Grid flow (animated flow path) */}
              <svg className="absolute bottom-4 left-0 w-full h-12 pointer-events-none" viewBox="0 0 300 40">
                {/* Horizontal electrical transmission cable path */}
                <path d="M 50,30 L 250,30" stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeLinecap="round" />
                {/* Glowing neon green flow lines */}
                <path d="M 50,30 L 250,30" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" className="energy-dot" />
                {/* Grid nodes */}
                <circle cx="50" cy="30" r="4.5" fill="#10b981" className="animate-pulse" />
                <circle cx="250" cy="30" r="4.5" fill="#06b6d4" />
                <text x="35" y="16" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">GEN BUS</text>
                <text x="235" y="16" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">GRID NODE</text>
              </svg>
            </div>

            {/* Weather highlights */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-glass-border/30 text-xs font-mono">
              <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-glass-border">
                <Compass size={13} className="text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase">WIND DIRECTION</span>
                  <span className="text-slate-200 font-semibold mt-0.5">{getWindDirectionString(weather.winddirec)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-glass-border">
                <Zap size={13} className="text-amber-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase">WIND GUST</span>
                  <span className="text-slate-200 font-semibold mt-0.5">{weather.windgust} m/s</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 3. Operational Safety Warning & Secondary Weather Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Warning System Status Card */}
          <div className="glass-panel p-4.5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block">
                Sys Warning Array & Status
              </span>
              <div className="flex items-center gap-3 mt-3">
                <span className={`h-3 w-3 rounded-full relative flex`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    alertInfo.status === "Normal" ? "bg-emerald-400" : alertInfo.status === "Off" ? "bg-red-400" : "bg-amber-400"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${
                    alertInfo.status === "Normal" ? "bg-emerald-500" : alertInfo.status === "Off" ? "bg-red-500" : "bg-amber-500"
                  }`}></span>
                </span>
                <h3 className={`text-md font-mono font-bold tracking-tight ${
                  alertInfo.status === "Normal" ? "text-emerald-400" : alertInfo.status === "Off" ? "text-red-400" : "text-amber-400"
                }`}>
                  {alertInfo.status.toUpperCase()} – {alertInfo.message}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Safety checks mark idle wind, low generation, and storm cut-out conditions while the live prediction feed updates.
              </p>
            </div>
          </div>

          {/* Secondary Weather metrics */}
          <div className="lg:col-span-2 glass-panel p-4.5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between pb-2 border-b border-glass-border/30 mb-2">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
                Weather Input Matrix
              </span>
              <span className="text-[9px] font-mono text-cyan-400">ATMOSPHERIC SYNCED</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-950/40 p-3 rounded-lg border border-glass-border flex flex-col">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-mono">
                  <Thermometer size={12} className="text-slate-400" />
                  <span>Temperature</span>
                </div>
                <span className="text-md font-mono font-bold text-slate-200 mt-1">{weather.temperature}°C</span>
              </div>
              
              <div className="bg-slate-950/40 p-3 rounded-lg border border-glass-border flex flex-col">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-mono">
                  <Droplets size={12} className="text-slate-400" />
                  <span>Humidity</span>
                </div>
                <span className="text-md font-mono font-bold text-slate-200 mt-1">{weather.relativehu}%</span>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-glass-border flex flex-col">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-mono">
                  <Droplets size={12} className="text-slate-400" />
                  <span>Dewpoint</span>
                </div>
                <span className="text-md font-mono font-bold text-slate-200 mt-1">{weather.dewpoint}°C</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Forecast Horizons Area Charts */}
        <div className="glass-panel p-5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between pb-4 border-b border-glass-border/30 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-cyber-purple" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Short-Term Forecast Horizons
              </span>
            </div>
            
            {/* Horizon Segmented Controllers */}
            <div className="flex gap-1.5 bg-slate-950/50 p-1 border border-glass-border rounded-lg">
              {(["1 Hour", "6 Hours", "24 Hours"] as const).map((horizon) => (
                <button
                  key={horizon}
                  onClick={() => setActiveHorizon(horizon)}
                  className={`px-3 py-1 rounded text-[10px] font-mono tracking-wider font-semibold cursor-pointer transition-all ${
                    activeHorizon === horizon
                      ? "bg-cyber-purple/15 text-cyber-purple border border-cyber-purple/30 shadow-[0_0_8px_rgba(139,92,246,0.15)]"
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  {horizon.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Render Recharts Forecast Panel */}
          <div className="flex-1 w-full relative">
            <ForecastChart data={forecasts[activeHorizon] || []} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
