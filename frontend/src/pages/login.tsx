import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Wind, ShieldCheck, Database, KeyRound } from "lucide-react";
import LoginForm from "../components/auth/LoginForm";
import WindTurbine from "../components/WindTurbine";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>WindCast AI – Operator Authorization</title>
      </Head>

      <div className="min-h-screen w-full bg-dark-deep bg-cyber-grid text-slate-100 flex items-stretch overflow-hidden relative">
        
        {/* Dynamic Background Halo Lights */}
        <div className="bg-ambient bg-cyan-500/10 top-[-100px] left-[-100px]" />
        <div className="bg-ambient bg-blue-600/5 bottom-[-200px] right-[-100px]" />

        {/* 1. Left Cinematic Visual Half (Hidden on mobile/tablet) */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-10 bg-slate-950/45 border-r border-glass-border relative overflow-hidden">
          
          {/* Neon Grid Backlit Halo */}
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] rounded-full bg-cyan-500/5 filter blur-[80px]" />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full border border-cyan-500/10 animate-spin-slow opacity-30" style={{ animationDuration: '40s' }} />

          {/* Top branding logo */}
          <div className="flex items-center gap-3 select-none relative z-10">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
              <Wind size={22} className="text-cyan-400 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-md font-bold tracking-wider text-slate-100">
                WINDCAST <span className="text-cyan-400 text-glow-cyan">AI</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase -mt-0.5">
                Renewables core
              </span>
            </div>
          </div>

          {/* Center visual: Large spinning SVG Wind turbine */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full flex items-center justify-center my-6"
          >
            <WindTurbine windSpeed={9.0} height={340} glowColor="#06b6d4" />
          </motion.div>

          {/* Bottom security dispatch logs */}
          <div className="w-full max-w-sm bg-slate-950/70 border border-glass-border p-4 rounded-xl font-mono text-[9px] text-slate-500 relative z-10 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-glass-border/30 mb-2">
              <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={12} className="animate-pulse" />
                GRID ACCESS PORT
              </span>
              <span>NODE: OP-04</span>
            </div>
            <div className="flex flex-col gap-1 text-[8px] leading-relaxed">
              <div>&gt; INITIALIZING SECURITY INTERCEPT... <span className="text-emerald-400">READY</span></div>
              <div>&gt; AUTH RESOLVED VIA BEARER PROTOCOLS... <span className="text-slate-400">WAITING</span></div>
              <div>&gt; EDGE ENCRYPTION KEYS: SHIELD ACTIVE [256-BIT]</div>
            </div>
          </div>

        </div>

        {/* 2. Right Form Half (Takes full screen on mobile/tablet) */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex items-center justify-center"
          >
            <LoginForm />
          </motion.div>
        </div>

      </div>
    </>
  );
}
