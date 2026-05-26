import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Menu, X, Globe, User, Cpu, AlertTriangle } from "lucide-react";

interface NavbarProps {
  activeModel?: string;
  isSimulating?: boolean;
}

export default function Navbar({ activeModel = "Random Forest", isSimulating = true }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "Overview", path: "/dashboard" },
    { name: "Predict Power", path: "/predictions" },
    { name: "Compare Models", path: "/comparison" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass-panel border-b border-glass-border z-40 px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 select-none group">
        <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 group-hover:border-cyan-400 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all">
          <Wind size={22} className="text-cyan-400 animate-spin-slow group-hover:scale-105 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]"></span>
        </div>
        <div className="flex flex-col">
          <span className="text-md font-bold tracking-wider text-slate-100 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text">
            WINDCAST <span className="text-cyan-400 text-glow-cyan font-bold font-mono">AI</span>
          </span>
          <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase -mt-0.5">Energy Forecaster</span>
        </div>
      </Link>

      {/* Desktop Metrics / Status Pills */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Model Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 border border-glass-border text-xs text-slate-300">
          <Cpu size={13} className="text-cyan-400" />
          <span>AI Model:</span>
          <span className="font-semibold text-cyan-400">{activeModel}</span>
        </div>

        {/* Sync Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 border border-glass-border text-xs text-slate-300">
          <span className={`h-1.5 w-1.5 rounded-full ${isSimulating ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
          <span>Simulator:</span>
          <span className={`font-semibold ${isSimulating ? "text-emerald-400" : "text-amber-400"}`}>
            {isSimulating ? "ACTIVE" : "PAUSED"}
          </span>
        </div>
      </div>

      {/* Navigation Links - Desktop */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => {
          const isActive = router.pathname === link.path;
          return (
            <Link key={link.path} href={link.path}>
              <span
                className={`text-sm cursor-pointer relative py-2 transition-colors duration-200 ${
                  isActive ? "text-cyan-400 font-medium" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Profile/System Actions */}
      <div className="flex items-center gap-3">
        {/* Sync Status Button */}
        <div className="hidden sm:flex p-2 rounded-lg bg-slate-900 border border-glass-border hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer">
          <Globe size={16} className="animate-pulse" />
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-300">
          <User size={14} className="text-cyan-400" />
          <span className="hidden sm:inline font-mono">OP-ENGINEER</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-glass-border text-slate-400 hover:text-cyan-400 hover:border-cyan-500/45 transition-all"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 glass-panel border-b border-glass-border flex flex-col p-6 gap-4 z-50 md:hidden bg-slate-950/95"
          >
            {/* Status indicators for mobile */}
            <div className="flex flex-col gap-2 pb-4 border-b border-glass-border/30">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>AI Model:</span>
                <span className="text-cyan-400 font-semibold">{activeModel}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Simulator:</span>
                <span className={isSimulating ? "text-emerald-400 font-semibold animate-pulse" : "text-amber-400 font-semibold"}>
                  {isSimulating ? "ACTIVE" : "PAUSED"}
                </span>
              </div>
            </div>

            {/* Menu Links */}
            {links.map((link) => {
              const isActive = router.pathname === link.path;
              return (
                <Link key={link.path} href={link.path} onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-cyan-950/30 text-cyan-400 border border-cyan-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {link.name}
                  </div>
                </Link>
              );
            })}

            {/* Close Button at bottom of drawer */}
            <button
              onClick={() => {
                router.push("/");
                setMobileMenuOpen(false);
              }}
              className="mt-2 w-full py-2.5 text-center text-xs bg-slate-900 border border-glass-border hover:border-cyan-500 rounded-lg text-slate-300 hover:text-cyan-400 transition-all font-semibold"
            >
              Enter Landing Portal
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
