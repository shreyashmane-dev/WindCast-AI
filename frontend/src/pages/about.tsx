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
      r2: "92.4%",
      mae: "1.92",
      type: "Sequential Deep Net",
      icon: TrendingUp,
      color: "text-primary border-primary/30 bg-primary/5",
      glow: "rgba(0, 242, 255, 0.15)",
      description: "Recurrent neural network with memory cells trained on ordered sequences of meteorological parameters. Highly resilient against short-term micro-convective drifts."
    },
    {
      name: "Random Forest Regressor",
      r2: "45.8%",
      mae: "0.14",
      type: "Decision Tree Ensemble",
      icon: Layers,
      color: "text-secondary border-secondary/30 bg-secondary/5",
      glow: "rgba(78, 222, 163, 0.15)",
      description: "An ensemble of decision trees used to capture non-linear interactions in Kaggle weather arrays. Serves as a robust baseline forecaster for stable seasons."
    },
    {
      name: "XGBoost Regressor",
      r2: "46.6%",
      mae: "0.14",
      type: "Gradient Boosting Machine",
      icon: Cpu,
      color: "text-tertiary border-tertiary/30 bg-tertiary/5",
      glow: "rgba(139, 92, 246, 0.15)",
      description: "Optimized gradient boosted tree networks prioritizing high wind speed metrics. Strong estimator for sudden wind gust changes and cut-out risks."
    },
    {
      name: "Linear Regression",
      r2: "41.3%",
      mae: "0.15",
      type: "Linear Baseline",
      icon: Sliders,
      color: "text-on-surface-variant border-white/5 bg-white/5",
      glow: "rgba(132, 148, 149, 0.05)",
      description: "interpretable statistical regression mapping primary windspeed inputs to power output. Useful for sanity audits on advanced neural yields."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Weather Dataset Input",
      desc: "Kaggle wind records feed temperature, windspeed, humidity, dewpoint, pressure, direction, and gust telemetry."
    },
    {
      num: "02",
      title: "Feature Physics",
      desc: "Imputes missing attributes, maps seasonal cyclic loops, and aligns directional coordinates."
    },
    {
      num: "03",
      title: "Model Training",
      desc: "Iterates regressors and registers the sequence-based LSTM configuration on the server."
    },
    {
      num: "04",
      title: "Comparison Suite",
      desc: "Audits MAE, RMSE, R2, and MAPE errors to nominate the active operational dispatch model."
    },
    {
      num: "05",
      title: "Command Center",
      desc: "Broadcasts simulated sensors and batch CSV prediction arrays to live telemetry curves."
    }
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>WindCast AI - Short-Term Wind Power Forecasting</title>
      </Head>

      <div className="flex flex-col gap-6 w-full bg-grid-pattern pb-8">
        
        {/* Page Header */}
        <div className="pb-2 border-b border-white/5">
          <h2 className="font-display-lg text-display-lg text-primary uppercase font-mono">
            Forecasting Physics & Models
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Overview of Kaggle datasets, ML pipeline, model definitions, and active technology stacks.
          </p>
        </div>

        {/* 1. Core Vision & Platform Card */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/5 filter blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
            <Terminal size={15} className="text-primary animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
              Project Objective
            </span>
          </div>

          <div className="text-xs font-mono text-on-surface-variant leading-relaxed space-y-3 font-normal">
            <p>
              WindCast AI is a short-term wind power forecasting project built with machine learning. It predicts wind turbine power output from weather conditions such as wind speed, wind direction, temperature, humidity, dewpoint, wind gust, and actual timestamp features.
            </p>
            <p>
              The system trains Linear Regression, Random Forest, and XGBoost in the current environment, supports LSTM when TensorFlow is available, compares models with MAE, RMSE, R2, and MAPE, and displays live prediction graphs in the dashboard.
            </p>
          </div>
        </div>

        {/* 2. Step-by-Step System Flowchart */}
        <div className="flex flex-col gap-3 font-mono">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
            <Activity size={15} className="text-secondary" />
            <span className="text-xs font-bold tracking-wider text-secondary uppercase">
              Dataset to Live Forecast Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="glass-panel p-4 rounded-xl flex flex-col justify-between min-h-[145px] hover:border-primary/20 transition-all group"
              >
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="text-md font-black font-mono text-primary group-hover:text-primary transition-colors">
                    {step.num}
                  </span>
                  <span className="text-[7px] tracking-widest">STAGE</span>
                </div>
                <div className="mt-3">
                  <h4 className="text-[11px] font-bold text-on-surface uppercase">{step.title}</h4>
                  <p className="text-[9px] text-on-surface-variant mt-1.5 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Deep Algorithmic Specifications */}
        <div className="flex flex-col gap-4 font-mono">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Cpu size={15} className="text-primary animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              Machine Learning Models
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map((model, idx) => {
              const Icon = model.icon;
              return (
                <div 
                  key={idx}
                  className="glass-panel p-5 rounded-xl flex flex-col justify-between gap-4 relative overflow-hidden group transition-all"
                  style={{ minHeight: "220px" }}
                >
                  <div 
                    className="absolute -top-16 -right-16 h-32 w-32 rounded-full filter blur-xl opacity-20 group-hover:opacity-45 transition-opacity"
                    style={{ backgroundColor: model.glow }}
                  />

                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                    <div className="flex flex-col">
                      <h3 className="text-xs font-bold text-on-surface uppercase tracking-wide">
                        {model.name}
                      </h3>
                      <span className="text-[8px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                        {model.type}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded bg-surface-container border border-white/5 flex items-center justify-center text-primary">
                      <Icon size={15} />
                    </div>
                  </div>

                  <p className="text-[10px] text-on-surface-variant leading-relaxed font-normal">
                    {model.description}
                  </p>

                  <div className="flex gap-4 pt-3 border-t border-white/5 text-[9px] uppercase font-bold tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={11} className="text-secondary" />
                      <span className="text-on-surface-variant">R2 Score:</span>
                      <span className="text-secondary">{model.r2}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap size={11} className="text-primary animate-pulse" />
                      <span className="text-on-surface-variant">MAE:</span>
                      <span className="text-primary">{model.mae}</span>
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
          <div className="glass-panel p-5 rounded-xl flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
              <Zap size={13} className="text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-on-surface uppercase">
                Prediction Output & Capacity
              </span>
            </div>
            <p className="text-[9.5px] text-on-surface-variant leading-relaxed mt-2.5 font-normal">
              The trained backend predicts power from weather features and rescales output for a standard 2,200 kW turbine view in the dashboard. Negative values are clipped to zero so displayed power remains physically meaningful.
            </p>
            <span className="text-[8px] text-on-surface-variant uppercase mt-2.5 tracking-wider">
              Rated turbine limits: 2,200 kW Standard
            </span>
          </div>

          {/* Safety Threshold cuts */}
          <div className="glass-panel p-5 rounded-xl flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
              <ShieldCheck size={13} className="text-secondary" />
              <span className="text-[10px] font-bold text-on-surface uppercase">
                Generator Safeguard Alarms
              </span>
            </div>
            <div className="text-[9px] text-on-surface-variant leading-relaxed space-y-1.5 mt-2.5 font-normal">
              <div className="flex justify-between text-on-surface-variant">
                <span>Cut-in Limit (Idle):</span>
                <span className="font-bold text-amber-400">&lt; 3.0 m/s</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Rated Output Velocity:</span>
                <span className="font-bold text-primary">14.0 m/s</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Cut-out Limit (Storm Safety):</span>
                <span className="font-bold text-error">&gt;= 25.0 m/s</span>
              </div>
            </div>
            <p className="text-[8px] text-on-surface-variant uppercase mt-2.5 leading-relaxed">
              Cut-out state marks unsafe high-wind operation and stops production in the simulation.
            </p>
          </div>

          {/* System Environment stacks */}
          <div className="glass-panel p-5 rounded-xl flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
              <Server size={13} className="text-tertiary" />
              <span className="text-[10px] font-bold text-on-surface uppercase">
                Technology Stack
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px] text-on-surface-variant leading-relaxed mt-2.5 font-normal">
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
            <span className="text-[8px] text-on-surface-variant uppercase mt-2.5 tracking-wider">
              WindCast AI Labs Core v2.4
            </span>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
