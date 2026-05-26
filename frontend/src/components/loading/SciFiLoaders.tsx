import React from "react";
import { motion } from "framer-motion";
import { Cpu, Wind } from "lucide-react";

/**
 * 1. TurbineLoader
 * Renders a miniature neon spinning wind turbine loader surrounded by a circular progress loop.
 */
export function TurbineLoader({ size = 80, text = "Synthesizing Grid..." }: { size?: number; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Glowing outer progress loop */}
        <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "3s" }} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgba(6, 182, 212, 0.08)"
            strokeWidth="3.5"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeDasharray="276"
            strokeDashoffset="120"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }}
          />
        </svg>

        {/* Center Spinning Turbine blades */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="text-cyan-400 z-10"
        >
          <Wind size={size * 0.45} style={{ filter: "drop-shadow(0 0 6px #06b6d4)" }} />
        </motion.div>
      </div>

      {text && (
        <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 text-glow-cyan uppercase animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * 2. EnergyPulseBar
 * Standard horizontal loading bar with a sweeping laser pulse.
 */
export function EnergyPulseBar({ progress = 45, label = "AI Inference Cycle" }: { progress?: number; label?: string }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider">
        <span>{label}</span>
        <span className="text-cyan-400 font-bold">{progress}%</span>
      </div>

      <div className="h-2 w-full bg-slate-950/60 border border-glass-border rounded-full overflow-hidden relative">
        {/* Pulsing fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 relative overflow-hidden rounded-full"
          style={{ boxShadow: "0 0 8px #06b6d4" }}
        >
          {/* Internal sweep laser */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent indicator-bar" />
        </motion.div>
      </div>
    </div>
  );
}

/**
 * 3. AISkeletonCard
 * Dashboard card skeleton containing shimmering grid lines representing telemetry values.
 */
export function AISkeletonCard() {
  return (
    <div className="glass-panel p-5 rounded-xl border border-glass-border min-h-[160px] flex flex-col justify-between relative overflow-hidden group">
      {/* Shimmer sweep overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent indicator-bar" style={{ animationDuration: "2.5s" }} />

      <div className="flex justify-between items-center z-10">
        {/* Small header block */}
        <div className="h-3 w-28 bg-slate-800 rounded-sm" />
        <Cpu size={14} className="text-slate-700" />
      </div>

      {/* Main value block */}
      <div className="mt-4 flex flex-col gap-2.5 z-10">
        <div className="h-7 w-36 bg-slate-800 rounded" />
        <div className="h-3.5 w-48 bg-slate-800/60 rounded-sm" />
      </div>

      {/* Bottom block */}
      <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center z-10">
        <div className="h-3 w-16 bg-slate-800/40 rounded-sm" />
        <div className="h-2.5 w-24 bg-slate-800/40 rounded-sm" />
      </div>
    </div>
  );
}
