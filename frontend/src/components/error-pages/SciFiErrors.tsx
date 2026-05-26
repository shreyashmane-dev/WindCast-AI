import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw, Radio, Settings2, Database } from "lucide-react";
import { motion } from "framer-motion";

/**
 * 1. ServerError500 (Core Overload)
 * Renders a cracked/fractured database core illustration.
 */
export function ServerError500({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="glass-panel border border-rose-500/25 p-8 rounded-2xl max-w-md w-full text-center relative z-10 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
      {/* Visual core vector */}
      <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/35 flex items-center justify-center mb-6 animate-pulse relative">
        <Database size={26} className="text-rose-400" />
        <div className="absolute inset-x-0 h-[2px] bg-rose-500 rotate-45 transform scale-x-125 shadow-glow" />
      </div>

      <h1 className="text-xl font-mono font-bold tracking-wider text-rose-400 uppercase">
        500: CORE OVERLOAD ALERT
      </h1>
      <h2 className="text-xs font-mono text-slate-400 mt-2 uppercase tracking-widest">
        Telemetry Database Failure
      </h2>

      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
        Our central forecasting database experienced a critical thermal threshold overload. Internal telemetry indices are temporarily scrambled.
      </p>

      <div className="mt-8 pt-6 border-t border-glass-border/30 flex gap-3 justify-center">
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-2"
        >
          <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
          <span>RETRY GRID REACH</span>
        </button>

        <Link href="/" className="px-4 py-2 bg-slate-950 border border-glass-border hover:border-slate-700 text-slate-300 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-all">
          <span>PORTAL HOME</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * 2. NetworkError (Sync Decoupled)
 * Renders a wireless array losing pulse connection.
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="glass-panel border border-amber-500/25 p-8 rounded-2xl max-w-md w-full text-center relative z-10 shadow-[0_0_30px_rgba(245,158,11,0.08)]">
      {/* Visual antenna array */}
      <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/35 flex items-center justify-center mb-6 relative">
        <Radio size={26} className="text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
        <div className="absolute top-1 left-1.5 right-1.5 h-1 border-t border-dashed border-amber-500/40" />
      </div>

      <h1 className="text-xl font-mono font-bold tracking-wider text-amber-400 uppercase">
        SYNC DECOUPLED
      </h1>
      <h2 className="text-xs font-mono text-slate-400 mt-2 uppercase tracking-widest">
        Telemetry Stream Signal Loss
      </h2>

      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
        The satellite array has drifted from its direct geostationary synchronization lock. Feeds are currently dropping telemetry packages.
      </p>

      <div className="mt-8 pt-6 border-t border-glass-border/30 flex gap-3 justify-center">
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-2"
        >
          <RefreshCw size={13} />
          <span>RE-ESTABLISH LINK</span>
        </button>

        <Link href="/" className="px-4 py-2 bg-slate-950 border border-glass-border hover:border-slate-700 text-slate-300 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-all">
          <span>PORTAL HOME</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * 3. MaintenanceMode (Grid Recalibration)
 * Renders turning sci-fi gear wheels.
 */
export function MaintenanceMode() {
  return (
    <div className="glass-panel border border-cyan-500/25 p-8 rounded-2xl max-w-md w-full text-center relative z-10 shadow-[0_0_30px_rgba(6,182,212,0.08)]">
      {/* Visual turning gears */}
      <div className="mx-auto h-16 w-16 rounded-full bg-cyan-500/10 border border-cyan-500/35 flex items-center justify-center mb-6 relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="text-cyan-400"
        >
          <Settings2 size={28} />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="text-cyan-500 absolute top-1.5 right-1.5"
        >
          <Settings2 size={16} />
        </motion.div>
      </div>

      <h1 className="text-xl font-mono font-bold tracking-wider text-cyan-400 uppercase">
        GRID RECALIBRATION
      </h1>
      <h2 className="text-xs font-mono text-slate-400 mt-2 uppercase tracking-widest">
        AI Core Recalibration active
      </h2>

      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
        The forecasting algorithm parameters are undergoing high-precision grid recalibration to align with new seasonal weather telemetry. Access holds.
      </p>

      <div className="mt-8 pt-6 border-t border-glass-border/30 flex justify-center">
        <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-500/25 px-4 py-2 rounded-lg animate-pulse uppercase tracking-wider">
          ⏳ Operational status: Synced in 14 minutes
        </div>
      </div>
    </div>
  );
}
