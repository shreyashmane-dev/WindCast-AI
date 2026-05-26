import React from "react";

interface WindTurbineProps {
  windSpeed: number;
  height?: number;
  className?: string;
  glowColor?: string;
}

export default function WindTurbine({
  windSpeed,
  height = 240,
  className = "",
  glowColor = "#06b6d4",
}: WindTurbineProps) {
  // Map windspeed to animation duration (lower wind speed = longer duration, i.e., slower spin)
  // Cut-in speed is 3.0. If below, don't spin (duration = 0)
  const isSpinning = windSpeed >= 3.0;
  
  // Calculate duration: 15 m/s = 1s rotation, 3 m/s = 6s rotation
  const duration = isSpinning 
    ? `${Math.max(0.4, 20 / Math.pow(windSpeed, 1.1))}s`
    : "0s";

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 200 300"
        className="h-full w-auto select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ambient Glow Filter */}
        <defs>
          <filter id="turbine-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Foundation & Ground Pad */}
        <path
          d="M 60 290 L 140 290 L 125 282 L 75 282 Z"
          fill="#1e293b"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        <rect x="50" y="290" width="100" height="4" rx="2" fill="#0f172a" />

        {/* Main Monopile Tower */}
        <path
          d="M 94 282 L 97 122 L 103 122 L 106 282 Z"
          fill="url(#towerGrad)"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="towerGrad" x1="94" y1="282" x2="106" y2="282" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="35%" stopColor="#334155" />
            <stop offset="65%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="nacelleGrad" x1="88" y1="110" x2="116" y2="122" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="bladeGrad" x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="70%" stopColor="rgba(203, 213, 225, 0.5)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.1)" />
          </linearGradient>
        </defs>

        {/* Cable / Grid flow connection indicator (Pulsing neon core in base) */}
        <circle
          cx="100"
          cy="274"
          r="3.5"
          fill={isSpinning ? "#10b981" : "#f59e0b"}
          className="animate-pulse"
          filter="url(#turbine-glow)"
          style={{ filter: `drop-shadow(0 0 4px ${isSpinning ? "#10b981" : "#f59e0b"})` }}
        />

        {/* Tower Aviation Warning Strobe (Red blinking dot) */}
        <circle
          cx="100"
          cy="126"
          r="2.5"
          fill="#ef4444"
          className="animate-pulse"
          style={{ animationDuration: "1s" }}
        />

        {/* Nacelle (Generator Housing) */}
        <rect
          x="86"
          y="110"
          width="28"
          height="14"
          rx="4"
          fill="url(#nacelleGrad)"
          stroke="rgba(255,255,255,0.08)"
        />
        {/* Wind Vane/Anemometer Details */}
        <line x1="89" y1="110" x2="89" y2="104" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="89" cy="103" r="1.5" fill="#94a3b8" />

        {/* ROTOR & BLADES GRUP - Spinned dynamically */}
        <g
          transform="translate(100, 117)"
          className={isSpinning ? "animate-turbine" : ""}
          style={{
            animationDuration: duration,
          }}
        >
          {/* Blade 1 (Pointing straight up by default) */}
          <g transform="rotate(0)">
            <path
              d="M -3 -6 C -3 -30 -1.5 -65 -0.5 -84 C -0.2 -90 0.2 -90 0.5 -84 C 1.5 -65 3 -30 3 -6 C 2.5 0 -2.5 0 -3 -6 Z"
              fill="url(#bladeGrad)"
            />
            {/* Aerodynamic blade tip neon strobe indicator */}
            <circle
              cx="0"
              cy="-84"
              r="2"
              fill={glowColor}
              filter="url(#turbine-glow)"
            />
          </g>

          {/* Blade 2 (Rotated 120deg) */}
          <g transform="rotate(120)">
            <path
              d="M -3 -6 C -3 -30 -1.5 -65 -0.5 -84 C -0.2 -90 0.2 -90 0.5 -84 C 1.5 -65 3 -30 3 -6 C 2.5 0 -2.5 0 -3 -6 Z"
              fill="url(#bladeGrad)"
            />
            <circle
              cx="0"
              cy="-84"
              r="2"
              fill={glowColor}
              filter="url(#turbine-glow)"
            />
          </g>

          {/* Blade 3 (Rotated 240deg) */}
          <g transform="rotate(240)">
            <path
              d="M -3 -6 C -3 -30 -1.5 -65 -0.5 -84 C -0.2 -90 0.2 -90 0.5 -84 C 1.5 -65 3 -30 3 -6 C 2.5 0 -2.5 0 -3 -6 Z"
              fill="url(#bladeGrad)"
            />
            <circle
              cx="0"
              cy="-84"
              r="2"
              fill={glowColor}
              filter="url(#turbine-glow)"
            />
          </g>

          {/* Rotor Spinner Cap (Central Nose Cone) */}
          <circle
            cx="0"
            cy="0"
            r="7"
            fill="#1e293b"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          <circle
            cx="0"
            cy="0"
            r="3"
            fill={isSpinning ? glowColor : "#f59e0b"}
            filter="url(#turbine-glow)"
            style={{
              transition: "fill 0.3s ease",
            }}
          />
        </g>
      </svg>
    </div>
  );
}
