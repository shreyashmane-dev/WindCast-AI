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
  Play,
  Pause,
  TrendingUp,
  Compass,
  Gauge,
  Activity,
  AlertTriangle
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

  const [activeHorizon, setActiveHorizon] = useState<"1 Hour" | "6 Hours" | "24 Hours">("6 Hours");

  if (isLoading || !isAuthenticated) {
    return <ProtectedLoader />;
  }

  const latestPower = history[history.length - 1]?.power || 0;
  const efficiency = calculateEfficiency(latestPower);
  const alertInfo = getAlertStatus(latestPower, weather.windspeed);
  const modelAccuracy = ML_METRICS[activeModel]?.R2 || 0.924;

  const getWindDirectionString = (deg: number) => {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const idx = Math.round(((deg % 360) / 22.5) % 16);
    return `${deg}° (${directions[idx]})`;
  };

  return (
    <DashboardLayout>
      <Head>
        <title>WindCast AI - Overview Command Center</title>
      </Head>

      <div className="flex flex-col gap-8 w-full bg-grid-pattern pb-8">
        
        {/* Prediction Engine Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-2 h-2 rounded-full bg-secondary indicator-pulse"></div>
              <span className="font-label-sm text-xs font-bold text-secondary tracking-widest uppercase">Streaming Telemetry Active</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase font-mono">Global Grid Overview</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Real-time telemetrics and AI-driven forecasting predictions.</p>
          </div>

          <div className="flex items-center gap-3 bg-surface-container/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`p-1.5 rounded-full hover:bg-surface-bright border border-white/5 text-on-surface transition-colors cursor-pointer flex items-center gap-2 ${
                isSimulating ? "text-secondary" : "text-amber-500"
              }`}
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span className="font-label-sm text-xs font-mono text-on-surface-variant">Last Update: Just now</span>
          </div>
        </header>

        {/* 1. Bento KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* KPI 1: Predicted Power Output */}
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-primary/20"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-sm text-xs font-bold font-mono text-on-surface-variant uppercase tracking-wider">Current Gen Output</span>
              <Zap size={18} className="text-primary" />
            </div>
            <div className="font-display-lg text-[32px] font-bold text-on-surface font-mono neon-glow-primary">
              {latestPower.toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
              <span className="text-sm text-on-surface-variant font-normal font-sans">kW</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1 uppercase font-mono">Capacity Peak: 2,200 kW</p>
          </div>

          {/* KPI 2: 24h Predicted Power */}
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden group ai-glow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-tertiary/20"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-sm text-xs font-bold font-mono text-on-surface-variant uppercase tracking-wider">24h Predicted Peak</span>
              <TrendingUp size={18} className="text-tertiary-fixed-dim" />
            </div>
            <div className="font-display-lg text-[32px] font-bold text-tertiary-fixed-dim font-mono">
              {(latestPower * 1.12).toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
              <span className="text-sm text-on-surface-variant font-normal font-sans">kW</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1 uppercase font-mono">Estimated Dispatch Horizon</p>
          </div>

          {/* KPI 3: Live Wind Speed */}
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-secondary/20"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-sm text-xs font-bold font-mono text-on-surface-variant uppercase tracking-wider">Avg Wind Speed</span>
              <Wind size={18} className="text-secondary animate-pulse" />
            </div>
            <div className="font-display-lg text-[32px] font-bold text-on-surface font-mono">
              {weather.windspeed.toFixed(2)}{" "}
              <span className="text-sm text-on-surface-variant font-normal font-sans">m/s</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1 uppercase font-mono">Primary Kinetic Driver</p>
          </div>

          {/* KPI 4: Active Turbine Efficiency */}
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-sm text-xs font-bold font-mono text-on-surface-variant uppercase tracking-wider">Turbine Operational Eff</span>
              <Gauge size={18} className="text-primary" />
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <div className="font-display-lg text-[32px] font-bold text-primary">{efficiency.toFixed(1)}%</div>
              <div className="text-xs text-on-surface-variant">/ 100%</div>
            </div>
            {/* Status progress bar matching Stitch */}
            <div className="w-full h-1.5 bg-surface-variant rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-primary shadow-[0_0_10px_rgba(0,242,255,0.8)] rounded-full transition-all duration-500"
                style={{ width: `${efficiency}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* 2. Main Analytics Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          
          {/* Left panel: Real-time generation plot */}
          <div className="xl:col-span-2 glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[400px]">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  Real-time Power Generation Trend
                </h3>
                <p className="font-label-sm text-xs font-mono text-on-surface-variant mt-1">
                  Actual Power vs. AI Predicted Yield (Last 12 Hours)
                </p>
              </div>
              <div className="flex gap-4 text-xs font-mono text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(0,242,255,0.8)]"></div>
                  <span>Actual (kW)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-secondary border-dashed bg-transparent"></div>
                  <span>Predicted (kW)</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full relative min-h-[260px]">
              <RealTimeChart data={history} />
            </div>
          </div>

          {/* Right panel: Live turbine status & energy flow */}
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[400px] relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
              <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                <Wind size={18} className="text-primary" />
                Active Generator Hub #04
              </h3>
              <div className="flex gap-1 shrink-0">
                <div className="w-1 h-3 bg-secondary rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                <div className="w-1 h-4 bg-secondary rounded-full animate-[pulse_1.2s_ease-in-out_infinite_0.2s]"></div>
                <div className="w-1 h-2 bg-secondary rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s]"></div>
              </div>
            </div>

            {/* Turbine illustration */}
            <div className="flex-1 flex flex-col items-center justify-center my-2 relative">
              <WindTurbine windSpeed={weather.windspeed} height={200} glowColor="#00f2ff" />
              
              {/* Radial Energy Grid flow (animated flow path) */}
              <svg className="absolute bottom-2 left-0 w-full h-12 pointer-events-none" viewBox="0 0 300 40">
                <path d="M 50,30 L 250,30" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 50,30 L 250,30" stroke="#4edea3" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" className="energy-dot" />
                <circle cx="50" cy="30" r="4.5" fill="#4edea3" className="animate-pulse" />
                <circle cx="250" cy="30" r="4.5" fill="#00f2ff" />
                <text x="35" y="16" fill="rgba(218,226,253,0.4)" fontSize="8" fontFamily="monospace">GEN BUS</text>
                <text x="235" y="16" fill="rgba(218,226,253,0.4)" fontSize="8" fontFamily="monospace">GRID NODE</text>
              </svg>
            </div>

            {/* Weather highlights */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2 bg-surface-container/40 p-2.5 rounded-lg border border-white/5">
                <Compass size={14} className="text-primary" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-on-surface-variant uppercase">WIND DIRECTION</span>
                  <span className="text-on-surface font-semibold mt-0.5">{getWindDirectionString(weather.winddirec)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-surface-container/40 p-2.5 rounded-lg border border-white/5">
                <Zap size={14} className="text-secondary animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-on-surface-variant uppercase">WIND GUST</span>
                  <span className="text-on-surface font-semibold mt-0.5">{weather.windgust} m/s</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Secondary Bento Grid: AI Core & Regional Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Core AI Engine Card */}
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between ai-glow lg:col-span-1 min-h-[300px]">
            <div>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                <h3 className="font-title-md text-title-md font-semibold text-on-surface">Core AI Engine</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-container/10 border border-primary/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,242,255,1)]"></div>
                  <span className="font-label-sm text-[10px] text-primary uppercase tracking-widest">Live</span>
                </div>
              </div>
              
              <div className="space-y-5 mt-6 font-mono text-xs">
                <div>
                  <span className="font-label-sm text-xs text-on-surface-variant block mb-1">Active Model Deployment</span>
                  <span className="font-body-md text-sm text-on-surface font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">psychology</span>
                    {activeModel} Deep Net
                  </span>
                </div>
                
                <div>
                  <span className="font-label-sm text-xs text-on-surface-variant block mb-1">Confidence Accuracy</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-tertiary-container shadow-[0_0_10px_rgba(233,221,255,0.5)] rounded-full transition-all"
                        style={{ width: `${modelAccuracy * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-label-sm text-xs text-tertiary font-bold">{(modelAccuracy * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full relative flex`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  alertInfo.status === "Normal" ? "bg-green-400" : alertInfo.status === "Off" ? "bg-red-400" : "bg-amber-400"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  alertInfo.status === "Normal" ? "bg-green-500" : alertInfo.status === "Off" ? "bg-red-500" : "bg-amber-500"
                }`}></span>
              </span>
              <span>Grid Safeguard State: {alertInfo.status}</span>
            </div>
          </div>

          {/* Regional Flux Map Simulated Frame */}
          <div className="glass-panel p-6 rounded-xl lg:col-span-2 flex flex-col relative overflow-hidden group min-h-[300px]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 z-10">
              <h3 className="font-title-md text-title-md font-semibold text-on-surface flex items-center gap-2">
                <Compass size={18} className="text-secondary" />
                Regional Wind Flux Map
              </h3>
              <span className="text-[9px] font-mono text-primary uppercase">Simulated Hub Node #04</span>
            </div>

            <div className="flex-1 w-full rounded-lg bg-surface-container-low border border-white/5 relative z-10 overflow-hidden flex items-center justify-center min-h-[180px]">
              {/* Simulating heatmap colors with Stitch grads */}
              <div className="absolute inset-0 bg-gradient-to-tr from-surface via-surface-container to-surface-variant"></div>
              <div className="absolute w-32 h-32 bg-primary/30 rounded-full blur-2xl top-1/4 left-1/4"></div>
              <div className="absolute w-40 h-40 bg-secondary/20 rounded-full blur-3xl bottom-1/3 right-1/4"></div>
              <div className="absolute w-24 h-24 bg-tertiary-container/30 rounded-full blur-2xl top-1/2 left-1/2"></div>
              
              <div className="z-10 font-mono text-[10px] text-on-surface-variant bg-surface/80 px-4 py-2.5 rounded-full backdrop-blur-sm border border-white/10 uppercase tracking-wider flex items-center gap-2 select-none">
                <Compass size={12} className="text-primary animate-spin-slow" />
                <span>Flux Scanning Enabled: Normal Atmospheric Drift</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Forecast Horizons Area Charts */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[400px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <span className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase">
                Short-Term Forecast Horizons
              </span>
            </div>
            
            {/* Horizon Segmented Controllers styled as Stitch glass capsules */}
            <div className="flex gap-1 bg-surface-container p-1 border border-white/5 rounded-full">
              {(["1 Hour", "6 Hours", "24 Hours"] as const).map((horizon) => (
                <button
                  key={horizon}
                  onClick={() => setActiveHorizon(horizon)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-mono tracking-wider font-semibold cursor-pointer transition-all ${
                    activeHorizon === horizon
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(116,245,255,0.2)]"
                      : "text-on-surface-variant hover:text-primary border border-transparent"
                  }`}
                >
                  {horizon.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full relative min-h-[280px]">
            <ForecastChart data={forecasts[activeHorizon] || []} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
