import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Cpu,
  GitCompare,
  Home,
  ChevronLeft,
  ChevronRight,
  Wind,
  Zap,
  Activity,
  Info
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Predict Power", icon: Cpu, path: "/predictions" },
    { name: "Compare Models", icon: GitCompare, path: "/comparison" },
    { name: "About Us", icon: Info, path: "/about" },
    { name: "Home", icon: Home, path: "/" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 78 }}
      transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
      className="fixed top-0 left-0 h-screen z-30 glass-panel border-r border-glass-border flex flex-col justify-between pt-20 pb-6 text-slate-300 overflow-hidden"
    >
      {/* Sidebar Top / Menu Section */}
      <div className="flex flex-col gap-6 w-full">
        {/* Toggle Button */}
        <div className={`flex w-full px-4 ${isOpen ? "justify-end" : "justify-center"}`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-md hover:bg-white/5 border border-transparent hover:border-glass-border text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 px-3 w-full">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className="relative block">
                <div
                  className={`flex items-center gap-4 px-3 py-3 rounded-lg cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                    isActive
                      ? "text-cyan-300 font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {/* Sliding glowing background for active element */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarGlow"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-950/40 via-cyan-900/10 to-transparent border-l-2 border-cyan-400 z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <item.icon
                    size={20}
                    className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" : ""
                    }`}
                  />

                  <AnimatePresence mode="popLayout">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 text-sm whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed mode */}
                  {!isOpen && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-900/95 border border-glass-border text-xs text-slate-200 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shadow-xl whitespace-nowrap z-55">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / System Monitor */}
      <div className="px-4 flex flex-col gap-4">
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3.5 bg-slate-950/60 border border-glass-border rounded-lg"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">AI Status</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-energy opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-energy"></span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <Activity size={12} className="text-electric-cyan animate-pulse" />
              <span>Sensors: ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono">
              <Zap size={12} className="text-electric-cyan animate-pulse" />
              <span>System: OK</span>
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center group relative cursor-help">
            <span className="flex h-2 w-2 relative my-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-energy opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-energy"></span>
            </span>
            <div className="absolute left-16 bottom-2 ml-2 p-3 bg-slate-900 border border-glass-border rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl z-55 text-[10px] w-40">
              <div className="font-semibold text-slate-200">AI Status: OK</div>
              <div className="text-slate-400 mt-1">All systems are running.</div>
            </div>
          </div>
        )}

        {/* Logo Icon in footer bottom */}
        <div className="flex items-center justify-center py-2 border-t border-glass-border/30">
          <Wind size={22} className="text-cyan-400 animate-spin-slow" />
        </div>
      </div>
    </motion.aside>
  );
}
