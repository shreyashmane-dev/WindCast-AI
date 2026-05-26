import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, KeyRound, Cpu, ShieldCheck } from "lucide-react";
import { TurbineLoader } from "../loading/SciFiLoaders";

export default function ProtectedLoader({ 
  onComplete,
  requireAuth = true
}: { 
  onComplete?: () => void;
  requireAuth?: boolean;
}) {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { text: "Initializing grid decryption keys...", duration: 900 },
    { text: "Authorizing edge telemetry nodes...", duration: 800 },
    { text: "Validating secure session JWT token...", duration: 1000 },
    { text: "Decrypting energy matrices... ACCESS GRANTED", duration: 800 }
  ];

  useEffect(() => {
    let currentStep = 0;
    
    const runSteps = () => {
      if (currentStep < steps.length - 1) {
        setTimeout(() => {
          currentStep++;
          setActiveStep(currentStep);
          runSteps();
        }, steps[currentStep].duration);
      } else {
        // Trigger completion callback after the last step settles
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 600);
      }
    };

    runSteps();
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-full bg-dark-deep bg-cyber-grid text-slate-100 flex flex-col items-center justify-center p-6 z-55 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="bg-ambient bg-cyan-500/10 top-1/4 left-1/3" />
      <div className="bg-ambient bg-emerald-500/10 bottom-1/4 right-1/3" />

      {/* Laser Scanning line sweep */}
      <div className="scanning-laser-line" />

      <div className="max-w-md w-full glass-panel border border-cyan-500/20 p-8 rounded-2xl relative z-10 flex flex-col items-center shadow-[0_0_40px_rgba(6,182,212,0.06)]">
        
        {/* Dynamic scanning icon indicator */}
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-full bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center relative">
            <KeyRound size={26} className="text-cyan-400 animate-pulse" style={{ filter: "drop-shadow(0 0 6px #06b6d4)" }} />
          </div>
          {/* Pulsing security sweep halo */}
          <div className="absolute inset-[-4px] rounded-full border border-emerald-400/20 animate-ping" style={{ animationDuration: '2.5s' }} />
        </div>

        <h2 className="text-lg font-mono font-bold tracking-widest text-slate-200 uppercase text-center">
          Deciphering Auth Session
        </h2>
        <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase -mt-0.5 mb-6 text-center block">
          Secure Handshake In Progress
        </span>

        {/* Loading Spinner */}
        <div className="my-2 select-none">
          <TurbineLoader size={70} text="" />
        </div>

        {/* Scrolling security logging */}
        <div className="w-full bg-slate-950/80 border border-glass-border p-4 rounded-xl font-mono text-[10px] text-slate-400 mt-6 flex flex-col gap-2 relative">
          <div className="absolute top-2 right-3 text-[8px] text-slate-600 tracking-widest uppercase">
            SEC_LOG
          </div>
          
          <AnimatePresence mode="popLayout">
            {steps.slice(0, activeStep + 1).map((step, idx) => {
              const isCurrent = idx === activeStep;
              const isLast = idx === steps.length - 1;
              return (
                <motion.div
                  key={`step-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-center gap-2 ${
                    isCurrent 
                      ? isLast 
                        ? "text-emerald-400 font-bold" 
                        : "text-cyan-400 font-semibold"
                      : "text-slate-500"
                  }`}
                >
                  {isLast && idx === activeStep ? (
                    <ShieldCheck size={12} className="text-emerald-400 animate-bounce shrink-0" />
                  ) : (
                    <Cpu size={12} className={`shrink-0 ${isCurrent ? "animate-spin" : ""}`} style={{ animationDuration: '4s' }} />
                  )}
                  <span className="truncate">{step.text}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Micro security keys detail */}
        <div className="w-full flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase mt-6 pt-4 border-t border-glass-border/30">
          <span>SHA-256 HASH VERIFY</span>
          <span>SYNC_CLOCK_OK</span>
        </div>
      </div>
    </div>
  );
}
