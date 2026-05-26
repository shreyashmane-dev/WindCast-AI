import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SimulationTick } from "../hooks/useWeatherSimulation";

interface RealTimeChartProps {
  data: SimulationTick[];
}

export default function RealTimeChart({ data }: RealTimeChartProps) {
  // Format the power value to display nicely in the tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as SimulationTick;
      return (
        <div className="glass-panel border border-cyan-500/35 p-3 rounded-lg text-xs flex flex-col gap-1 shadow-2xl">
          <span className="font-mono text-slate-400">Time: {item.time}</span>
          <span className="font-semibold text-cyan-400">Power: {item.power.toLocaleString()} kW</span>
          <span className="text-emerald-400">Wind: {item.windspeed} m/s</span>
          <span className="text-slate-300">Temp: {item.temperature} C</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {/* Custom Ambient Shadow Filter */}
          <defs>
            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
            <filter id="neon-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComponentTransfer in="blur" result="glow1">
                <feFuncA type="linear" slope="0.7"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.04)"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="rgba(255, 255, 255, 0.3)"
            fontSize={10}
            fontFamily="monospace"
            tickLine={false}
            dy={8}
          />

          <YAxis
            stroke="rgba(255, 255, 255, 0.3)"
            fontSize={10}
            fontFamily="monospace"
            tickLine={false}
            domain={[0, 2400]}
            dx={-8}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(6, 182, 212, 0.2)', strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="power"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorPower)"
            filter="url(#neon-glow)"
            activeDot={{ r: 5, strokeWidth: 0, fill: '#22d3ee' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
