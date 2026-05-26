import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CorrelationCell {
  x: string;
  y: string;
  value: number;
  description: string;
}

const VARIABLES = ["Wind Speed", "Wind Gust", "Power Output", "Temperature", "Humidity", "Dewpoint"];

const CORRELATION_DATA: CorrelationCell[] = [
  // Wind Speed row
  { x: "Wind Speed", y: "Wind Speed", value: 1.00, description: "Identical variables." },
  { x: "Wind Speed", y: "Wind Gust", value: 0.94, description: "Extremely strong positive coupling; higher average wind speed guarantees higher gust speeds." },
  { x: "Wind Speed", y: "Power Output", value: 0.86, description: "Strong non-linear correlation. Wind speed is the primary kinetic driver for electricity output." },
  { x: "Wind Speed", y: "Temperature", value: 0.12, description: "Weak positive correlation. Minor thermal convective pressure currents." },
  { x: "Wind Speed", y: "Humidity", value: -0.22, description: "Mild negative correlation. Saturated, moist air columns are denser and slow down wind velocities." },
  { x: "Wind Speed", y: "Dewpoint", value: -0.05, description: "Negligible direct correlation with absolute humidity levels." },

  // Wind Gust row
  { x: "Wind Gust", y: "Wind Speed", value: 0.94, description: "Extremely strong positive coupling." },
  { x: "Wind Gust", y: "Wind Gust", value: 1.00, description: "Identical variables." },
  { x: "Wind Gust", y: "Power Output", value: 0.82, description: "Strong correlation. Gusts provide temporary surges, though turbine governors clamp output." },
  { x: "Wind Gust", y: "Temperature", value: 0.15, description: "Weak positive correlation. Heat expands air mass, altering turbulent gust vectors." },
  { x: "Wind Gust", y: "Humidity", value: -0.24, description: "Mild negative correlation." },
  { x: "Wind Gust", y: "Dewpoint", value: -0.04, description: "Negligible direct interaction." },

  // Power Output row
  { x: "Power Output", y: "Wind Speed", value: 0.86, description: "Direct power generation driver." },
  { x: "Power Output", y: "Wind Gust", value: 0.82, description: "Highly correlated kinetic surge driver." },
  { x: "Power Output", y: "Power Output", value: 1.00, description: "Identical variables." },
  { x: "Power Output", y: "Temperature", value: 0.08, description: "Near-zero direct correlation, though temperature affects generator air density." },
  { x: "Power Output", y: "Humidity", value: -0.18, description: "Humid air reduces turbine aerodynamic drag coefficients slightly." },
  { x: "Power Output", y: "Dewpoint", value: -0.02, description: "Negligible direct correlation." },

  // Temperature row
  { x: "Temperature", y: "Wind Speed", value: 0.12, description: "Weak convection correlations." },
  { x: "Temperature", y: "Wind Gust", value: 0.15, description: "Weak turbulence correlations." },
  { x: "Temperature", y: "Power Output", value: 0.08, description: "Low correlation, mostly seasonal offsets." },
  { x: "Temperature", y: "Temperature", value: 1.00, description: "Identical variables." },
  { x: "Temperature", y: "Humidity", value: -0.58, description: "Strong negative correlation. Higher temperature rapidly drops relative humidity." },
  { x: "Temperature", y: "Dewpoint", value: 0.74, description: "Strong positive correlation. Higher ambient temperature holds exponentially more dewpoint." },

  // Humidity row
  { x: "Humidity", y: "Wind Speed", value: -0.22, description: "Mild negative correlation." },
  { x: "Humidity", y: "Wind Gust", value: -0.24, description: "Mild negative correlation." },
  { x: "Humidity", y: "Power Output", value: -0.18, description: "Drag reduction offsets." },
  { x: "Humidity", y: "Temperature", value: -0.58, description: "Relative humidity drops as air warms." },
  { x: "Humidity", y: "Humidity", value: 1.00, description: "Identical variables." },
  { x: "Humidity", y: "Dewpoint", value: 0.28, description: "Moderate correlation linking moisture to saturation points." },

  // Dewpoint row
  { x: "Dewpoint", y: "Wind Speed", value: -0.05, description: "Negligible correlation." },
  { x: "Dewpoint", y: "Wind Gust", value: -0.04, description: "Negligible correlation." },
  { x: "Dewpoint", y: "Power Output", value: -0.02, description: "Negligible correlation." },
  { x: "Dewpoint", y: "Temperature", value: 0.74, description: "Thermal capacities linked to dew thresholds." },
  { x: "Dewpoint", y: "Humidity", value: 0.28, description: "Moisture saturation correlations." },
  { x: "Dewpoint", y: "Dewpoint", value: 1.00, description: "Identical variables." },
];

export default function CorrelationHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<CorrelationCell | null>(null);

  // Helper to map correlation values into beautiful cyan/magenta glow colors
  const getCellColor = (value: number) => {
    if (value === 1.0) return "rgba(6, 182, 212, 0.9)"; // Bright cyan for perfect positive
    if (value > 0.8) return "rgba(6, 182, 212, 0.7)";
    if (value > 0.5) return "rgba(6, 182, 212, 0.4)";
    if (value > 0) return `rgba(6, 182, 212, ${value * 0.3})`;
    
    // Negative values get magenta/pink tints
    return `rgba(236, 72, 153, ${Math.abs(value) * 0.4})`;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full items-stretch">
      {/* Heatmap Grid */}
      <div className="flex-1 overflow-x-auto min-w-[320px]">
        <div className="grid grid-cols-7 gap-1.5 p-2 bg-slate-950/40 rounded-xl border border-glass-border">
          {/* Empty top-left cell */}
          <div className="flex items-center justify-end pr-2 text-[9px] font-mono text-slate-500">
            VAR MATRIX
          </div>
          
          {/* Top Label Column Headers */}
          {VARIABLES.map((v) => (
            <div key={`header-col-${v}`} className="text-center py-2 text-[9px] font-mono text-slate-400 font-semibold truncate px-1">
              {v}
            </div>
          ))}

          {/* Grid rows */}
          {VARIABLES.map((rowName) => (
            <React.Fragment key={`row-frag-${rowName}`}>
              {/* Row Header Label */}
              <div className="flex items-center justify-end pr-2.5 text-[9px] font-mono text-slate-400 font-semibold text-right whitespace-nowrap">
                {rowName}
              </div>

              {/* Cells */}
              {VARIABLES.map((colName) => {
                const cell = CORRELATION_DATA.find((c) => c.x === rowName && c.y === colName)!;
                const isHovered = hoveredCell && hoveredCell.x === rowName && hoveredCell.y === colName;
                
                return (
                  <div
                    key={`cell-${rowName}-${colName}`}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{ backgroundColor: getCellColor(cell.value) }}
                    className={`aspect-square sm:aspect-auto sm:h-12 rounded flex items-center justify-center text-xs font-mono font-bold cursor-pointer transition-all border ${
                      isHovered
                        ? "border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-[1.08] z-20"
                        : "border-slate-950/20 hover:border-slate-300"
                    }`}
                  >
                    <span className={cell.value > 0.8 ? "text-slate-950" : "text-slate-200"}>
                      {cell.value.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Dynamic Detail Card */}
      <div className="w-full xl:w-72 glass-panel p-4 rounded-xl border border-glass-border flex flex-col justify-between min-h-[160px]">
        <AnimatePresence mode="wait">
          {hoveredCell ? (
            <motion.div
              key={`${hoveredCell.x}-${hoveredCell.y}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2 h-full justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">Interaction Node</span>
                <h4 className="text-sm font-bold text-slate-100 mt-1">
                  {hoveredCell.x} <span className="text-slate-500">↔</span> {hoveredCell.y}
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {hoveredCell.description}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-glass-border/30 mt-4">
                <div
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: getCellColor(hoveredCell.value),
                    color: hoveredCell.value > 0.8 ? "#0a0f1d" : "#ffffff",
                  }}
                >
                  {hoveredCell.value > 0 ? "+" : ""}
                  {hoveredCell.value.toFixed(2)}
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Correlation Strength
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 py-6">
              <span className="text-sm">Hover over cells</span>
              <span className="text-[10px] uppercase font-mono tracking-wider mt-1 text-slate-600">
                To view cross-variable physics
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
