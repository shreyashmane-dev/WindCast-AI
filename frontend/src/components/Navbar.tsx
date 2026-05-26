import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Menu, X, Bell, HelpCircle, User, Search } from "lucide-react";

interface NavbarProps {
  activeModel?: string;
  isSimulating?: boolean;
}

export default function Navbar({ activeModel = "LSTM-X4 Deep Net", isSimulating = true }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "Overview", path: "/dashboard" },
    { name: "Predict Power", path: "/predictions" },
    { name: "Compare Models", path: "/comparison" },
    { name: "About Us", path: "/about" },
  ];

  return (
    <header className="bg-surface/60 backdrop-blur-md fixed top-0 left-0 right-0 w-full h-16 z-50 border-b border-white/10 shadow-[0_0_20px_rgba(111,60,216,0.15)] flex justify-between items-center px-6 transition-all duration-300">
      {/* Left section: Search bar on desktop shifted left (under desktop sidebar layout) */}
      <div className="flex items-center gap-4 md:pl-64 transition-all duration-300">
        <div className="hidden md:flex items-center bg-surface-container-highest/50 rounded-full px-4 py-2 border border-white/5 focus-within:border-primary-fixed-dim/50 transition-colors">
          <Search size={16} className="text-on-surface-variant mr-2" />
          <input 
            className="bg-transparent border-none text-on-surface focus:ring-0 p-0 text-xs w-48 placeholder-on-surface-variant/50 focus:outline-none" 
            placeholder="Search parameters..." 
            type="text"
          />
        </div>
      </div>

      {/* Mobile Logo: visible only on mobile when sidebar is hidden */}
      <Link href="/" className="md:hidden flex items-center gap-2 select-none group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-fixed-dim to-secondary flex items-center justify-center shadow-[0_0_12px_rgba(0,242,255,0.4)] transition-all">
          <Wind size={18} className="text-surface-container-lowest animate-spin-slow" />
        </div>
        <span className="font-bold tracking-tighter text-lg text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text">
          WindCast AI
        </span>
      </Link>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Active Pill indicators for Desktop */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/40 border border-white/5 text-[11px] text-on-surface-variant">
            <span>Model:</span>
            <span className="font-semibold text-primary-fixed-dim">{activeModel}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/40 border border-white/5 text-[11px] text-on-surface-variant">
            <span className={`h-1.5 w-1.5 rounded-full ${isSimulating ? "bg-secondary animate-pulse" : "bg-outline"}`}></span>
            <span>Feed:</span>
            <span className={`font-semibold ${isSimulating ? "text-secondary" : "text-outline"}`}>
              {isSimulating ? "LIVE" : "PAUSED"}
            </span>
          </div>
        </div>

        {/* Notifications & Help */}
        <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none active:scale-95 duration-200">
          <Bell size={20} />
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none active:scale-95 duration-200">
          <HelpCircle size={20} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none active:scale-95 duration-200">
          <User size={20} className="text-primary" />
          <span className="hidden md:inline text-xs font-semibold tracking-wide">Analyst Profile</span>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-surface-container border border-white/5 text-on-surface-variant hover:text-primary active:scale-95 transition-all"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Drawer Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 glass-panel-heavy border-b border-white/10 flex flex-col p-6 gap-4 z-50 md:hidden"
          >
            {/* Status indicators */}
            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5 text-on-surface-variant">
              <span>AI Core Model:</span>
              <span className="text-primary-fixed-dim font-bold font-mono">{activeModel}</span>
            </div>

            {/* Menu Links */}
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const isActive = router.pathname === link.path;
                return (
                  <Link key={link.path} href={link.path} onClick={() => setMobileMenuOpen(false)}>
                    <div
                      className={`py-2.5 px-3 rounded-lg text-sm transition-all ${
                        isActive
                          ? "bg-primary-container/10 border border-primary/20 text-primary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                router.push("/");
                setMobileMenuOpen(false);
              }}
              className="mt-2 w-full py-2.5 text-center text-xs bg-surface-container border border-white/5 hover:border-primary/50 text-on-surface hover:text-primary rounded-lg transition-all font-semibold uppercase tracking-wider"
            >
              Enter Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
