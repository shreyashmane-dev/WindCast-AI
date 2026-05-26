import { useEffect, useRef, useState } from "react";
import { createLiveSocket, normalizedPowerToKw } from "../utils/windcastApi";

export interface LiveForecastPoint {
  step: number;
  predicted_power: number;
  power_kw: number;
  confidence_score: number;
  model_used: string;
  alert: string;
  weather: {
    temperature: number;
    relativehu: number;
    dewpoint: number;
    windspeed: number;
    winddirec: number;
    windgust: number;
  };
}

export function useLiveForecastSocket(enabled = true) {
  const [points, setPoints] = useState<LiveForecastPoint[]>([]);
  const [status, setStatus] = useState<"connecting" | "open" | "closed" | "error">("closed");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const socket = createLiveSocket();
    socketRef.current = socket;
    setStatus("connecting");

    socket.onopen = () => setStatus("open");
    socket.onerror = () => setStatus("error");
    socket.onclose = () => setStatus("closed");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const point: LiveForecastPoint = {
        ...data,
        power_kw: normalizedPowerToKw(data.predicted_power),
      };
      setPoints((prev) => [...prev.slice(-59), point]);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [enabled]);

  return { points, status };
}
