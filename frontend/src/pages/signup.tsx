import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Wind, ShieldAlert, Cpu, Hammer } from "lucide-react";
import SignupForm from "../components/auth/SignupForm";
import WindTurbine from "../components/WindTurbine";

export default function SignupPage() {
  return (
    <>
      <Head>
        <title>WindCast AI – Register Edge Terminal</title>
      </Head>

      <div className="min-h-screen w-full bg-background bg-grid-pattern text-on-surface flex items-stretch overflow-hidden relative">
        
        {/* Dynamic Background Lights */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-tertiary/5 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* 1. Left Cinematic Visual Half (Hidden on mobile/tablet) */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-10 bg-surface-container/20 border-r border-white/5 relative overflow-hidden">
          
          {/* Neon Grid Backlit Halo */}
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] rounded-full bg-secondary/5 filter blur-[80px]" />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full border border-secondary/10 animate-spin-slow opacity-30" style={{ animationDuration: '50s' }} />

          {/* Top branding logo */}
          <div className="flex items-center gap-3 select-none relative z-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-fixed-dim to-secondary flex items-center justify-center shadow-[0_0_12px_rgba(116,245,255,0.4)] shrink-0">
              <Wind size={18} className="text-surface-container-lowest" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-primary">
                WINDCAST <span className="text-secondary font-bold font-mono">AI</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-on-surface-variant opacity-80 uppercase -mt-0.5">
                Renewables Core
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
            <WindTurbine windSpeed={10.5} height={340} glowColor="#4edea3" />
          </motion.div>

          {/* Bottom dispatch logs */}
          <div className="w-full max-w-sm glass-panel p-4 rounded-xl font-mono text-[9px] text-on-surface-variant relative z-10 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2">
              <span className="text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Hammer size={12} className="animate-pulse" />
                TERMINAL BUILDER
              </span>
              <span>NODE: WCAST-NEW</span>
            </div>
            <div className="flex flex-col gap-1 text-[8px] leading-relaxed">
              <div>&gt; INITIATING IDENTITY PROTOCOL SETUP... <span className="text-primary">READY</span></div>
              <div>&gt; ALLOCATING PERSISTENT OPERATOR INDEX... <span className="text-on-surface-variant opacity-70">SYNCED</span></div>
              <div>&gt; GRIDS STATUS: SECURE CHANNELS ESTABLISHED</div>
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
            <SignupForm />
          </motion.div>
        </div>

      </div>
    </>
  );
}
