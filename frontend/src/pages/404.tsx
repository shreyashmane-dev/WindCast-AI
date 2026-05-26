import React from "react";
import Head from "next/head";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Wind } from "lucide-react";
import { motion } from "framer-motion";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>WindCast AI – Telemetry Connection Lost (404)</title>
      </Head>

      <div className="min-h-screen w-full bg-dark-deep bg-cyber-grid text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Glowing backgrounds */}
        <div className="bg-ambient bg-cyan-500/10 top-1/4 left-1/4" />
        <div className="bg-ambient bg-rose-500/10 bottom-1/4 right-1/4" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-panel border border-rose-500/25 p-8 rounded-2xl max-w-md w-full text-center relative z-10 shadow-[0_0_30px_rgba(239,68,68,0.08)]"
        >
          {/* Neon warning icon */}
          <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/35 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">
            <AlertCircle size={28} className="text-rose-400" />
          </div>

          <h1 className="text-2xl font-mono font-bold tracking-wider text-rose-400 uppercase">
            CONNECTION LOST: 404
          </h1>
          <h2 className="text-sm font-mono text-slate-400 mt-2 uppercase tracking-widest">
            Atmospheric Node Offline
          </h2>
          
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            The wind turbine grid telemetry path you are seeking is either out of synchronization, de-commissioned, or has wandered outside of our neural forecast parameters.
          </p>

          {/* Quick link button to go back */}
          <div className="mt-8 pt-6 border-t border-glass-border/30">
            <Link href="/" className="group inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 border border-glass-border hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-all">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>RETURN TO MAIN PORTAL</span>
            </Link>
          </div>
        </motion.div>

        {/* Small branding footer */}
        <div className="absolute bottom-6 text-[9px] font-mono text-slate-600 tracking-widest uppercase">
          WINDCAST AI LABS // GRID SECURITY PROTOCOL
        </div>
      </div>
    </>
  );
}
