import React from "react";
import Head from "next/head";
import DashboardLayout from "../layouts/DashboardLayout";
import { motion } from "framer-motion";
import {
  Cpu,
  Zap,
  Activity,
  Wind,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Database,
  Terminal,
  Server,
  Layers,
  FileText
} from "lucide-react";

export default function AboutSystem() {
  const models = [
    {
      name: "LSTM Recurrent Network",
      r2: "42.6%",
      mae: "0.15",
      type: "Sequential Time-Series Model",
      icon: TrendingUp,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/5",
      glow: "rgba(167, 139, 250, 0.15)",
      description: "A TensorFlow/Keras Long Short-Term Memory model trained on ordered weather sequences. It uses lookback windows to learn how actual time, wind speed, direction, temperature, humidity, dewpoint, and gust changes affect short-term power output."
    },
    {
      name: "Random Forest Regressor",
      r2: "45.8%",
      mae: "0.14",
      type: "Decision Tree Ensemble",
      icon: Layers,
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
      glow: "rgba(6, 182, 212, 0.15)",
      description: "An ensemble of decision trees used to capture non-linear relationships in Kaggle wind-power data. It is useful for stable baseline forecasting across changing weather conditions."
    },
    {
      name: "XGBoost Regressor",
      r2: "46.6%",
      mae: "0.14",
      type: "Gradient Boosting Machine",
      icon: Cpu,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
      glow: "rgba(16, 185, 129, 0.15)",
      description: "A boosted tree model tuned for weather-feature interactions. It is currently the strongest production model by RMSE in the saved comparison report."
    },
    {
      name: "Linear Regression",
      r2: "41.3%",
      mae: "0.15",
      type: "Regression Baseline",
      icon: Sliders,
      color: "text-slate-400 border-slate-500/20 bg-slate-500/5",
      glow: "rgba(148, 163, 184, 0.05)",
      description: "A simple interpretable baseline that estimates power from weather features. It helps compare whether more advanced models add meaningful forecasting value."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Weather Dataset Input",
      desc: "Kaggle wind-power records provide wind speed, wind direction, temperature, humidity, dewpoint, wind gust, actual time, and measured Power."
    },
    {
      num: "02",
      title: "Feature Engineering",
      desc: "Missing values are imputed, numeric fields are cleaned, and actual timestamps are converted into hour, day, month, seasonal, and wind-direction features."
    },
    {
      num: "03",
      title: "Model Training",
      desc: "Linear Regression, Random Forest, XGBoost, and LSTM are trained and evaluated on chronological train/test splits for short-term forecasting."
    },
    {
      num: "04",
      title: "Model Comparison",
      desc: "Each model is compared using MAE, RMSE, R2, and MAPE. The production model is selected by lowest RMSE."
    },
    {
      num: "05",
      title: "Real-Time Dashboard",
      desc: "Live weather simulation and backend predictions are plotted as real-time graphs for predicted wind power, wind speed, and forecast horizons."
    }
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>WindCast AI - Short-Term Wind Power Forecasting</title>
      </Head>

      <div className="flex flex-col gap-6 w-full">
        
        {/* Page Header */}
        <div className="pb-2 border-b border-glass-border/30">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 uppercase font-mono">
            Short-Term Wind Power Forecasting Using Machine Learning
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kaggle wind power and weather datasets, ML model comparison, and a real-time prediction dashboard.
          </p>
        </div>

        {/* 1. Core Vision & Platform Card */}
        <div className="glass-panel p-6 rounded-xl border border-glass-border relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-500/5 filter blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="flex items-center gap-2 pb-3 border-b border-glass-border/20 mb-4">
            <Terminal size={15} className="text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              Project Objective
            </span>
          </div>

          <div className="text-xs font-mono text-slate-300 leading-relaxed space-y-3 font-normal">
            <p>
              WindCast AI is a short-term wind power forecasting project built with machine learning. It predicts wind turbine power output from weather conditions such as wind speed, wind direction, temperature, humidity, dewpoint, wind gust, and actual timestamp features.
            </p>
            <p>
              The system trains Linear Regression, Random Forest, XGBoost, and LSTM models, compares them with MAE, RMSE, R2, and MAPE, and displays live prediction graphs in the dashboard.
            </p>
          </div>
        </div>

        {/* 2. Step-by-Step System Flowchart */}
        <div className="flex flex-col gap-3 font-mono">
          <div className="flex items-center gap-2 pb-2 border-b border-glass-border/20 mb-2">
            <Activity size={15} className="text-cyan-400" />
            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
              Dataset to Live Forecast Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="glass-panel p-4 rounded-xl border border-glass-border flex flex-col justify-between min-h-[145px] hover:border-cyan-500/20 transition-all group"
              >
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-md font-black font-mono text-cyan-400/80 group-hover:text-cyan-400 transition-colors">
                    {step.num}
                  </span>
                  <span className="text-[7px] tracking-widest">STAGE</span>
                </div>
                <div className="mt-3">
                  <h4 className="text-[11px] font-bold text-slate-200 uppercase">{step.title}</h4>
                  <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Deep Algorithmic Specifications */}
        <div className="flex flex-col gap-4 font-mono">
          <div className="flex items-center gap-2 pb-2 border-b border-glass-border/20">
            <Cpu size={15} className="text-cyan-400" />
            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
              Machine Learning Models
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map((model, idx) => {
              const Icon = model.icon;
              return (
                <div 
                  key={idx}
                  className="glass-panel p-5 rounded-xl border p-5 flex flex-col justify-between gap-4 relative overflow-hidden group transition-all border-glass-border hover:border-cyan-500/25"
                  style={{ minHeight: "220px" }}
                >
                  {/* Decorative Glow Ring */}
                  <div 
                    className="absolute -top-16 -right-16 h-32 w-32 rounded-full filter blur-xl opacity-20 group-hover:opacity-45 transition-opacity"
                    style={{ backgroundColor: model.glow }}
                  />

                  <div className="flex justify-between items-start border-b border-glass-border/20 pb-3">
                    <div className="flex flex-col">
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                        {model.name}
                      </h3>
                      <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">
                        {model.type}
                      </span>
                    </div>
                    <div className={`h-8 w-8 rounded bg-slate-950 border border-glass-border flex items-center justify-center ${model.color.split(" ")[0]}`}>
                      <Icon size={15} />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
                    {model.description}
                  </p>

                  <div className="flex gap-4 pt-3 border-t border-glass-border/20 text-[9px] uppercase font-bold tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={11} className="text-emerald-400" />
                      <span className="text-slate-400">R2 Score:</span>
                      <span className="text-emerald-400">{model.r2}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap size={11} className="text-cyan-400 animate-pulse" />
                      <span className="text-slate-400">MAE:</span>
                      <span className="text-cyan-400">{model.mae}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Generator Turbine Capacity & Safety Cuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono print:grid-cols-1">
          
          {/* Capacity Rescaling Card */}
          <div className="glass-panel p-5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-2 pb-2.5 border-b border-glass-border/20">
              <Zap size={13} className="text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-200 uppercase">
                Prediction Output & Capacity
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 leading-relaxed mt-2.5 font-normal">
              The trained backend predicts power from weather features and rescales output for a standard 2,200 kW turbine view in the dashboard. Negative values are clipped to zero so displayed power remains physically meaningful.
            </p>
            <span className="text-[8px] text-slate-500 uppercase mt-2.5 tracking-wider">
              Rated turbine limits: 2,200 kW Standard
            </span>
          </div>

          {/* Safety Threshold cuts */}
          <div className="glass-panel p-5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-2 pb-2.5 border-b border-glass-border/20">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-200 uppercase">
                Generator Safeguard Alarms
              </span>
            </div>
            <div className="text-[9px] text-slate-400 leading-relaxed space-y-1.5 mt-2.5 font-normal">
              <div className="flex items-center justify-between text-slate-300">
                <span>Cut-in Limit (Idle):</span>
                <span className="font-bold text-amber-400">&lt; 3.0 m/s</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Rated Output Velocity:</span>
                <span className="font-bold text-cyan-400">14.0 m/s</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Cut-out Limit (Storm Safety):</span>
                <span className="font-bold text-red-400">&gt;= 25.0 m/s</span>
              </div>
            </div>
            <p className="text-[8px] text-slate-500 uppercase mt-2.5 leading-relaxed">
              Cut-out state marks unsafe high-wind operation and stops production in the simulation.
            </p>
          </div>

          {/* System Environment stacks */}
          <div className="glass-panel p-5 rounded-xl border border-glass-border flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-2 pb-2.5 border-b border-glass-border/20">
              <Server size={13} className="text-purple-400" />
              <span className="text-[10px] font-bold text-slate-200 uppercase">
                Technology Stack
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 leading-relaxed mt-2.5 font-normal">
              <div>
                <strong>Frontend</strong>:<br />Next.js 15, React, Tailwind, Framer Motion
              </div>
              <div>
                <strong>Backend</strong>:<br />FastAPI, Pydantic, Pandas, Joblib
              </div>
              <div>
                <strong>Auth</strong>:<br />Firebase SDK & Admin token decoders
              </div>
              <div>
                <strong>Data Feeds</strong>:<br />Heartbeat WebSockets & Fetch Interceptors
              </div>
            </div>
            <span className="text-[8px] text-slate-500 uppercase mt-2.5 tracking-wider">
              WindCast AI Labs Core v2.4
            </span>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
