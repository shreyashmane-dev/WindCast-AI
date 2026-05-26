import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useSimulation } from "../hooks/useWeatherSimulation";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { activeModel, isSimulating } = useSimulation();

  return (
    <div className="min-h-screen bg-dark-deep bg-cyber-grid text-slate-100 flex overflow-hidden">
      {/* Dynamic Ambient Blur Backgrounds */}
      <div className="bg-ambient bg-cyan-500/10 top-10 left-10" />
      <div className="bg-ambient bg-blue-600/5 bottom-20 right-10" />
      <div className="bg-ambient bg-emerald-500/5 top-1/2 left-1/3" />

      {/* Sticky Global Top Header */}
      <Navbar activeModel={activeModel} isSimulating={isSimulating} />

      {/* Collapsible Futuristic Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <motion.main
        initial={false}
        animate={{
          paddingLeft: sidebarOpen ? "276px" : "94px",
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
        className="flex-1 min-h-screen pt-20 pr-6 pb-6 overflow-y-auto flex flex-col z-10 transition-all"
      >
        <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
