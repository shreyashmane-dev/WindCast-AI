import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { ServerError500, NetworkError, MaintenanceMode } from "../components/error-pages/SciFiErrors";
import { Sliders } from "lucide-react";

export default function ErrorsShowcase() {
  const router = useRouter();
  const { type = "500" } = router.query;
  const [errorType, setErrorType] = useState<string>("500");

  // Keep state in sync with URL queries
  useEffect(() => {
    if (type) {
      setErrorType(type as string);
    }
  }, [type]);

  const handleToggle = (newType: string) => {
    setErrorType(newType);
    router.replace(`/errors?type=${newType}`, undefined, { shallow: true });
  };

  const renderActiveError = () => {
    switch (errorType) {
      case "network":
        return <NetworkError key="network" />;
      case "maintenance":
        return <MaintenanceMode key="maintenance" />;
      case "500":
      default:
        return <ServerError500 key="500" />;
    }
  };

  const getPageTitle = () => {
    if (errorType === "network") return "WindCast AI – Link Offline";
    if (errorType === "maintenance") return "WindCast AI – Calibration";
    return "WindCast AI – Core Overload";
  };

  return (
    <>
      <Head>
        <title>{getPageTitle()}</title>
      </Head>

      <div className="min-h-screen w-full bg-dark-deep bg-cyber-grid text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Glowing atmospheric background lights */}
        <div className="bg-ambient bg-cyan-500/10 top-1/4 left-1/4" />
        <div className="bg-ambient bg-rose-500/10 bottom-1/4 right-1/4" />

        {/* Floating Selector Switch (Top of Page) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 glass-panel p-2 rounded-xl border border-glass-border flex items-center gap-3 z-30 shadow-2xl">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono font-bold uppercase pl-2 select-none border-r border-glass-border/30 pr-3">
            <Sliders size={13} className="text-cyan-400" />
            <span>ERR_TYPE</span>
          </div>

          <div className="flex gap-1.5">
            {(["500", "network", "maintenance"] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleToggle(t)}
                className={`px-3 py-1 rounded text-[9px] font-mono tracking-wider font-semibold cursor-pointer transition-all ${
                  errorType === t
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                    : "text-slate-500 hover:text-slate-300 border border-transparent"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Animated Error Panel Container */}
        <div className="w-full flex items-center justify-center min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={errorType}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center"
            >
              {renderActiveError()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Small branding footer */}
        <div className="absolute bottom-6 text-[9px] font-mono text-slate-600 tracking-widest uppercase select-none">
          WINDCAST AI LABS // GRID FAULT GATEWAY
        </div>
      </div>
    </>
  );
}
