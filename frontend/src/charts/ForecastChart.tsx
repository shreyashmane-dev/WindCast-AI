import React from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ForecastData } from "../hooks/useWeatherSimulation";

interface ForecastChartProps {
  data: ForecastData[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as ForecastData;
      return (
        <div className="glass-panel border border-cyber-purple/35 p-3 rounded-lg text-xs flex flex-col gap-1 shadow-2xl">
          <span className="font-mono text-slate-400">Horizon: {item.time}</span>
          <span className="font-semibold text-cyan-400">Predicted Power: {item.power.toLocaleString()} kW</span>
          <span className="text-cyber-purple font-medium">Estimated Wind: {item.windspeed} m/s</span>
          <span className="text-slate-300">Temp: {item.temperature}°C</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: -5, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorForecastPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
            <filter id="purple-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
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

          {/* Left Y Axis for Power */}
          <YAxis
            yAxisId="left"
            stroke="rgba(255, 255, 255, 0.3)"
            fontSize={10}
            fontFamily="monospace"
            tickLine={false}
            domain={[0, 2400]}
            dx={-8}
          />

          {/* Right Y Axis for Wind Speed */}
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(139, 92, 246, 0.5)"
            fontSize={10}
            fontFamily="monospace"
            tickLine={false}
            domain={[0, 25]}
            dx={8}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.15)', strokeWidth: 1 }} />

          <Legend 
            verticalAlign="top" 
            height={36} 
            content={({ payload }) => (
              <div className="flex items-center justify-end gap-6 text-[11px] font-mono text-slate-400 pr-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400"></span>
                  <span>PREDICTED POWER (kW)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-0.5 bg-cyber-purple"></span>
                  <span>WIND SPEED (m/s)</span>
                </span>
              </div>
            )}
          />

          {/* Area representing forecasted power */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="power"
            name="power"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorForecastPower)"
            filter="url(#purple-glow)"
          />

          {/* Line representing forecasted wind speed */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="windspeed"
            name="windspeed"
            stroke="#22d3ee"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: '#22d3ee' }}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#ffffff' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
