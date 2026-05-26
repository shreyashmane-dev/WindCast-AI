import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import { 
  Wind, 
  ArrowRight, 
  Zap, 
  Cpu, 
  BarChart3, 
  ShieldCheck, 
  Database, 
  Radio, 
  Activity, 
  Clock, 
  TrendingUp, 
  Compass, 
  Gauge 
} from "lucide-react";
import WindTurbine from "../components/WindTurbine";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { fetchAnalytics, fetchModels } from "../utils/windcastApi";

export default function LandingPortal() {
  const [datasetRows, setDatasetRows] = useState<number>(0);
  const [averagePower, setAveragePower] = useState<number>(0);
  const [bestModel, setBestModel] = useState<string>("XGBoost");
  const [bestR2, setBestR2] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function loadRealProjectStats() {
      try {
        const [analytics, models] = await Promise.all([fetchAnalytics(), fetchModels()]);
        const ranked = [...models.metrics].sort((a, b) => a.rmse - b.rmse);
        if (!cancelled) {
          setDatasetRows(analytics.sample_count);
          setAveragePower(analytics.average_power);
          setBestModel(models.comparison.best_model || ranked[0]?.model || "XGBoost");
          setBestR2(ranked[0]?.r2 ?? 0);
        }
      } catch {
        if (!cancelled) {
          setDatasetRows(175200);
          setAveragePower(342.84);
          setBestModel("XGBoost");
          setBestR2(0.466);
        }
      }
    }

    void loadRealProjectStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const features = [
    {
      title: "Realtime Forecasting",
      desc: "Short-term wind-to-power predictions from weather inputs using trained ML regression and sequence models.",
      icon: Zap,
      color: "text-cyan-400",
      glow: "bg-cyan-500/10",
    },
    {
      title: "Weather Feature Analytics",
      desc: "Uses wind speed, wind direction, temperature, humidity, dewpoint, wind gust, and actual time features.",
      icon: Cpu,
      color: "text-emerald-400",
      glow: "bg-emerald-500/10",
    },
    {
      title: "Live Weather Telemetry",
      desc: "Live dashboard inputs track wind speed, humidity, dewpoint, direction, and gust fluctuations.",
      icon: Radio,
      color: "text-blue-400",
      glow: "bg-blue-500/10",
    },
    {
      title: "ML Model Comparators",
      desc: "Side-by-side MAE, RMSE, R2, and MAPE comparison for Linear Regression, Random Forest, XGBoost, and LSTM.",
      icon: BarChart3,
      color: "text-purple-400",
      glow: "bg-purple-500/10",
    },
    {
      title: "Grid Optimization Insights",
      desc: "Calculates turbine conversion ratios and sends preemptive low-power or loading cutoff safeguard warnings.",
      icon: ShieldCheck,
      color: "text-amber-400",
      glow: "bg-amber-500/10",
    },
  ];

  // Mock sparkline data for dashboard preview
  const sparkData = [
    { value: 1200 }, { value: 1450 }, { value: 1300 }, { value: 1700 },
    { value: 1500 }, { value: 1900 }, { value: 1650 }, { value: 2100 }
  ];

  return (
    <>
      <Head>
        <title>WindCast AI - Short-Term Wind Power Forecasting System</title>
        <meta name="description" content="Short-term wind power forecasting using Kaggle wind power datasets, weather features, machine learning models, and live prediction graphs." />
      </Head>

      <div className="relative min-h-screen w-full bg-dark-deep bg-cyber-grid text-slate-100 flex flex-col justify-between overflow-x-hidden">
        {/* Futuristic Ambient Lighting Circles */}
        <div className="bg-ambient bg-cyan-500/15 top-[-100px] right-[-100px]" />
        <div className="bg-ambient bg-emerald-500/10 bottom-[-200px] left-[-100px]" />
        <div className="bg-ambient bg-blue-600/10 top-[35%] left-[25%]" />
        <div className="bg-ambient bg-purple-500/5 top-[60%] right-[10%]" />

        {/* Global Cinematic Particle floating overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <motion.div
            animate={{
              y: [0, -100, 0],
              x: [0, 50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute h-2 w-2 rounded-full bg-cyan-400 top-[15%] left-[10%] filter blur-[1px]"
          />
          <motion.div
            animate={{
              y: [0, -150, 0],
              x: [0, -80, 0],
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute h-3 w-3 rounded-full bg-emerald-400 top-[65%] left-[80%] filter blur-[2px]"
          />
          <motion.div
            animate={{
              y: [0, -80, 0],
              x: [0, 40, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute h-1.5 w-1.5 rounded-full bg-blue-400 top-[45%] left-[50%] filter blur-[1px]"
          />
        </div>

        {/* Header Branding */}
        <header className="w-full px-6 py-5 z-20 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3 select-none">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
              <Wind size={22} className="text-cyan-400 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-md font-bold tracking-wider text-slate-100">
                WINDCAST <span className="text-cyan-400 text-glow-cyan">AI</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase -mt-0.5">
                Next-Gen Renewables
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors uppercase cursor-pointer select-none">
              Operator Log In
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 border border-glass-border text-xs text-slate-400 font-mono select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>SYSTEM STATE: SYNCED</span>
            </div>
          </div>
        </header>

        {/* Section A: Hero Section */}
        <main className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 z-10 relative">
          
          {/* Hero Left Content */}
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left items-center lg:items-start max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-mono select-none"
            >
              <Cpu size={12} className="animate-pulse" />
              <span>Edge AI Forecaster v2.4.0</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-100"
            >
              Predict Renewable Energy with{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                AI Precision
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm sm:text-md text-slate-400 leading-relaxed font-normal"
            >
              Machine learning project using Kaggle wind power and weather datasets to predict turbine output from wind speed, wind direction, temperature, humidity, dewpoint, wind gust, and actual time.
            </motion.p>

            {/* Launch CTA Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 w-full mt-4 justify-center lg:justify-start"
            >
              <Link href="/dashboard" className="group">
                <div className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] cursor-pointer transition-all">
                  <span>OPEN LIVE DASHBOARD</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>

              <Link href="/predictions">
                <div className="px-5 py-3 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-glass-border hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 font-semibold text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <span>MAKE PREDICTION</span>
                </div>
              </Link>
            </motion.div>

            {/* scrolling metrics row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 border-t border-glass-border/30 w-full pt-8 mt-8 text-left"
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 select-none">CUMULATIVE GENERATED</div>
                <div className="text-sm sm:text-md font-mono font-bold text-cyan-400 mt-1">
                  {datasetRows.toLocaleString()} rows
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 select-none">BEST MODEL R2</div>
                <div className="text-sm sm:text-md font-mono font-bold text-emerald-400 mt-1 text-glow-green">
                  {(bestR2 * 100).toFixed(1)}% {bestModel}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 select-none">GRID SYNC STATUS</div>
                <div className="text-sm sm:text-md font-mono font-bold text-blue-400 mt-1">
                  {averagePower.toLocaleString(undefined, { maximumFractionDigits: 1 })} kW avg
                </div>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Visual Column - Large rotating Turbine */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full flex items-center justify-center relative max-w-sm lg:max-w-md xl:max-w-lg"
          >
            <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-cyan-500/5 filter blur-[60px] animate-pulse" />
            <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full border border-cyan-500/10 scale-95 opacity-50 z-0 animate-spin-slow" style={{ animationDuration: '60s' }} />

            <div className="relative z-10 w-full">
              <WindTurbine windSpeed={8.5} height={420} glowColor="#06b6d4" />
            </div>
            
            {/* Live Indicator overlay card on the turbine graphic */}
            <div className="absolute bottom-4 right-4 glass-panel border border-cyan-500/20 px-4 py-3 rounded-lg flex flex-col gap-1.5 shadow-2xl z-20">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Node telemetry live</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-200">Wind Velocity: 8.5 m/s</span>
              <span className="text-[10px] font-mono text-cyan-400">Simulated Turbine Hub</span>
            </div>
          </motion.div>
        </main>

        {/* Section B: Trust / Operational Matrix Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-12 border-y border-glass-border/20 z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "REALTIME PREDICTIONS", val: "< 3s Latency", desc: "Sensors stream to ML models." },
              { label: "AI FORECASTING ENGINE", val: "XGBoost + LSTM", desc: "Short-term ML forecasting models." },
              { label: "ENERGY ANALYTICS CORE", val: `${datasetRows.toLocaleString()} Rows`, desc: "Aggregated historical records." },
              { label: "MODEL COMPARISON", val: "MAE RMSE R2", desc: "Accuracy metrics shown live." }
            ].map((metric, idx) => (
              <div key={`trust-block-${idx}`} className="flex flex-col items-center">
                <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">{metric.label}</span>
                <h3 className="text-xl font-bold font-mono text-cyan-400 mt-2 text-glow-cyan">{metric.val}</h3>
                <p className="text-[10px] font-mono text-slate-400 mt-1">{metric.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section C: Stagger-Animated Features Cards */}
        <section className="w-full max-w-7xl mx-auto px-6 py-16 lg:py-24 z-10 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase text-glow-cyan">Core Platform Capabilities</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-100 mt-2 uppercase font-mono">
              Futuristic Energy Dispatching Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-normal">
              Stable edge systems, optimized neural inference pipelines, and high-tech real-time analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={`feature-card-${idx}`}
                className="glass-panel glass-panel-hover p-6 rounded-2xl border border-glass-border flex flex-col justify-between min-h-[190px] relative overflow-hidden group cursor-default hover:border-cyan-500/25"
              >
                {/* Backlit card accent */}
                <div className={`absolute -top-12 -right-12 h-24 w-24 rounded-full ${feature.glow} filter blur-xl opacity-35 group-hover:opacity-75 transition-opacity duration-300`} />

                <div className="h-10 w-10 rounded-lg bg-slate-950 border border-glass-border flex items-center justify-center mb-4 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all">
                  <feature.icon size={18} className={`${feature.color} transition-transform group-hover:scale-110`} />
                </div>

                <div className="z-10">
                  <h4 className="text-sm font-bold font-mono text-slate-200 uppercase">{feature.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section D: Dashboard Mockup Interactive Preview */}
        <section className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-glass-border/20 z-10 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase">Interactive Terminal Preview</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-100 mt-2 uppercase font-mono">
              The Operational Command Center
            </h2>
          </div>

          {/* Glassmorphic Mockup Container */}
          <div className="w-full glass-panel border border-glass-border p-6 rounded-2xl relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-cyan-500/10">
            {/* Mock Header navbar */}
            <div className="flex justify-between items-center pb-4 border-b border-glass-border/30 mb-6 text-xs font-mono text-slate-500 select-none">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-300 font-bold uppercase">EDGE_NODE_04</span>
              </div>
              <span className="text-[10px] tracking-widest">POLLING ACTIVE: 3s Ticks</span>
            </div>

            {/* Mockup Dashboard Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Left Widget: Sparklines */}
              <div className="bg-slate-950/60 border border-glass-border p-4 rounded-xl flex flex-col justify-between h-44">
                <div className="flex justify-between items-start text-[9px] font-mono text-slate-500">
                  <span>REALTIME POWER TREND</span>
                  <Activity size={12} className="text-cyan-400" />
                </div>
                {/* Recharts sparkline */}
                <div className="h-20 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-300">
                  <span>Current Output</span>
                  <span className="font-bold text-cyan-400 text-glow-cyan">1,784 kW</span>
                </div>
              </div>

              {/* Middle Widget: Spinning Generator */}
              <div className="bg-slate-950/60 border border-glass-border p-4 rounded-xl flex flex-col items-center justify-center h-44 relative overflow-hidden">
                <div className="absolute top-3 left-4 text-[9px] font-mono text-slate-500">
                  ACTIVE HUB
                </div>
                <WindTurbine windSpeed={9.0} height={110} />
                <span className="text-[10px] font-mono text-slate-200 font-bold mt-1">Wind Velocity: 9.0 m/s</span>
              </div>

              {/* Right Widget: Speedometer Readout */}
              <div className="bg-slate-950/60 border border-glass-border p-4 rounded-xl flex flex-col justify-between h-44">
                <div className="text-[9px] font-mono text-slate-500 uppercase">conversion metric</div>
                
                <div className="flex flex-col items-center justify-center py-2">
                  <h3 className="text-3xl font-bold font-mono text-emerald-400 text-glow-green">81.1%</h3>
                  <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">Turbine Efficiency</span>
                </div>

                <div className="flex justify-between text-[9px] font-mono border-t border-glass-border/30 pt-3 text-slate-500 uppercase">
                  <span>Safeguard status</span>
                  <span className="text-emerald-400 font-bold">Normal</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Section E: Premium Cinematic CTA Section */}
        <section className="w-full max-w-5xl mx-auto px-6 py-16 lg:py-24 z-10 relative">
          <div className="w-full glass-panel border border-cyan-500/20 p-10 lg:p-14 rounded-3xl relative overflow-hidden text-center shadow-[0_0_40px_rgba(6,182,212,0.06)] group hover:border-cyan-500/35">
            {/* Backlit CTA accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-cyan-500/5 filter blur-[100px] pointer-events-none" />

            <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase text-glow-cyan">Launch dispatch core</span>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 mt-3 uppercase font-mono leading-tight max-w-xl mx-auto">
              Power the Future with AI Integration
            </h2>
            
            <p className="text-xs text-slate-400 mt-4 max-w-md mx-auto leading-relaxed font-normal">
              Synchronize edge meteorological telemetry arrays and implement high-precision ML forecasting models instantly.
            </p>

            <div className="mt-8 flex justify-center">
              <Link href="/dashboard" className="group">
                <div className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] cursor-pointer transition-all">
                  <span>ENTER DISPATCH CORE</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer className="w-full border-t border-glass-border/30 py-4 px-6 z-10 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] font-mono text-slate-500 select-none">
            <span>© 2026 WINDCAST AI LABS. ALL POWER FORECASTS ARE PRE-SYNCED VIA EDGE CORE.</span>
            <div className="flex gap-4">
              <span className="hover:text-slate-400 cursor-pointer">GLIDE FLUID INTELLIGENCE</span>
              <span className="hover:text-slate-400 cursor-pointer">NODE PROTOCOLS</span>
              <span className="hover:text-slate-400 cursor-pointer">ML OPS METRICS</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
