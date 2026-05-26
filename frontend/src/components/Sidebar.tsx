import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Cpu,
  GitCompare,
  Home,
  Info,
  ChevronLeft,
  ChevronRight,
  Wind,
  Sparkles
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
    { name: "Home Portal", icon: Home, path: "/" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 78 }}
      transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
      className="fixed top-0 left-0 h-screen z-40 bg-surface-container/40 backdrop-blur-xl border-r border-white/5 shadow-2xl flex flex-col justify-between pt-6 pb-6 text-on-surface overflow-hidden"
    >
      {/* Sidebar Top / Menu Section */}
      <div className="flex flex-col gap-6 w-full">
        {/* Top Header Logo */}
        <div className="px-5 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-fixed-dim to-secondary flex items-center justify-center shadow-[0_0_12px_rgba(116,245,255,0.4)] shrink-0">
              <Wind size={18} className="text-surface-container-lowest" />
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <h1 className="text-md font-bold text-primary tracking-tight">WindCast AI</h1>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-widest -mt-0.5">Renewables Core</p>
              </motion.div>
            )}
          </Link>

          {/* Collapse toggle */}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded bg-surface border border-white/5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Collapsed view toggle button */}
        {!isOpen && (
          <div className="flex justify-center w-full">
            <button
              onClick={() => setIsOpen(true)}
              className="p-1.5 rounded bg-surface border border-white/5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 w-full px-2">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className="relative block">
                <div
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                    isActive
                      ? "text-primary bg-primary-container/20 border-r-4 border-primary shadow-[inset_0_0_15px_rgba(0,219,231,0.2)] font-medium"
                      : "text-on-surface-variant hover:bg-surface-bright/50 hover:text-on-surface"
                  }`}
                >
                  <item.icon
                    size={18}
                    className={`relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? "text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]" : ""
                    }`}
                  />

                  <AnimatePresence mode="popLayout">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 text-xs tracking-wide whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed view */}
                  {!isOpen && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-surface-container border border-white/10 text-[10px] text-on-surface rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shadow-xl whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / System Monitor & Premium CTA */}
      <div className="px-3 flex flex-col gap-4">
        {/* Upgrade to Pro Button */}
        {isOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary text-on-primary-container font-semibold text-xs shadow-[0_0_15px_rgba(116,245,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
          >
            Upgrade to Pro
          </motion.button>
        )}

        {/* Lead Analyst Card */}
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-surface-container-high/40 border border-white/5 rounded-xl flex items-center gap-3"
          >
            <div className="relative w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center bg-surface-bright select-none shrink-0 font-bold text-xs text-primary">
              DV
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-on-surface truncate">Dr. E. Vance</span>
              <span className="text-[9px] text-on-surface-variant truncate">Lead Analyst</span>
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center relative group cursor-pointer">
            <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center bg-surface-bright select-none font-bold text-xs text-primary">
              DV
            </div>
            <div className="absolute left-16 bottom-2 ml-2 p-3 bg-surface-container border border-white/10 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl z-50 text-[10px] w-36">
              <div className="font-bold text-on-surface">Dr. E. Vance</div>
              <div className="text-on-surface-variant mt-0.5">Lead Analyst</div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
