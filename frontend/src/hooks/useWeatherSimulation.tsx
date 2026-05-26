import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { WeatherMetrics, predictPower } from "../utils/predictionModel";
import { fetchPrediction, normalizedPowerToKw } from "../utils/windcastApi";

function randomNormal(mean = 0, std = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  return mean + std * randStdNormal;
}

export interface SimulationTick {
  time: string;
  temperature: number;
  relativehu: number;
  dewpoint: number;
  windspeed: number;
  winddirec: number;
  windgust: number;
  power: number;
}

export interface ForecastData {
  time: string;
  temperature: number;
  windspeed: number;
  power: number;
}

const DEFAULT_WEATHER: WeatherMetrics = {
  temperature: 20.25,
  relativehu: 51.36,
  dewpoint: 10.7,
  windspeed: 7.43,
  winddirec: 222.76,
  windgust: 9.06,
};

export type SimulationContextType = {
  weather: WeatherMetrics;
  activeModel: string;
  isSimulating: boolean;
  history: SimulationTick[];
  forecasts: Record<string, ForecastData[]>;
  setWeather: (metrics: Partial<WeatherMetrics>) => void;
  setIsSimulating: (sim: boolean) => void;
  changeModel: (model: string) => void;
};

export const SimulationContext = createContext<SimulationContextType | null>(null);

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}

export function useWeatherSimulation(initialModel = "XGBoost") {
  const [activeModel, setActiveModel] = useState<string>(initialModel);
  const [weather, setWeather] = useState<WeatherMetrics>(DEFAULT_WEATHER);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [history, setHistory] = useState<SimulationTick[]>([]);
  const [forecasts, setForecasts] = useState<Record<string, ForecastData[]>>({});

  const weatherRef = useRef(weather);
  const modelRef = useRef(activeModel);
  const backendOnlineRef = useRef(true);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  useEffect(() => {
    modelRef.current = activeModel;
  }, [activeModel]);

  const predictPowerKw = async (modelName: string, currentWeather: WeatherMetrics): Promise<number> => {
    if (backendOnlineRef.current) {
      try {
        const response = await fetchPrediction(currentWeather, modelName);
        return normalizedPowerToKw(response.predicted_power);
      } catch {
        backendOnlineRef.current = false;
      }
    }

    return predictPower(modelName, currentWeather);
  };

  const predictPowerKwFallback = (modelName: string, currentWeather: WeatherMetrics): number => {
    return predictPower(modelName, currentWeather);
  };

  const updateForecasts = async (currentWeather: WeatherMetrics, currentModel: string) => {
    const baseDate = new Date();
    const horizons = {
      "1 Hour": 6,
      "6 Hours": 6,
      "24 Hours": 12,
    };
    const newForecasts: Record<string, ForecastData[]> = {};

    for (const [horizon, ticks] of Object.entries(horizons)) {
      const forecastList: ForecastData[] = [];
      const intervalMinutes = horizon === "1 Hour" ? 10 : horizon === "6 Hours" ? 60 : 120;
      let walkWind = currentWeather.windspeed;
      let walkTemp = currentWeather.temperature;
      let walkHumid = currentWeather.relativehu;

      for (let i = 1; i <= ticks; i++) {
        const forecastTime = new Date(baseDate.getTime() + i * intervalMinutes * 60 * 1000);
        const cycle = Math.sin((i + baseDate.getHours()) / 4.0);
        walkWind = Math.max(1.5, walkWind + cycle * 0.9 + randomNormal(0, 0.5));
        walkTemp = walkTemp + Math.cos((i + baseDate.getHours()) / 6.0) * 0.6 + randomNormal(0, 0.3);
        walkHumid = Math.min(100, Math.max(10, walkHumid + randomNormal(0, 3)));
        const walkDew = walkTemp - (100 - walkHumid) / 5;

        const forecastWeather: WeatherMetrics = {
          temperature: parseFloat(walkTemp.toFixed(2)),
          relativehu: parseFloat(walkHumid.toFixed(2)),
          dewpoint: parseFloat(walkDew.toFixed(2)),
          windspeed: parseFloat(walkWind.toFixed(2)),
          winddirec: Math.round((currentWeather.winddirec + cycle * 20 + 360) % 360),
          windgust: parseFloat((walkWind + 2 + Math.random()).toFixed(2)),
          location: currentWeather.location,
        };

        const power = await predictPowerKw(currentModel, forecastWeather);
        forecastList.push({
          time:
            horizon === "1 Hour"
              ? forecastTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : `${forecastTime.toLocaleDateString([], { month: "short", day: "numeric" })} ${forecastTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          temperature: forecastWeather.temperature,
          windspeed: forecastWeather.windspeed,
          power: parseFloat(power.toFixed(1)),
        });
      }

      newForecasts[horizon] = forecastList;
    }

    setForecasts(newForecasts);
  };

  useEffect(() => {
    let cancelled = false;

    async function seedHistory() {
      const start = new Date();
      const tempHistory: SimulationTick[] = [];
      let currentWind = DEFAULT_WEATHER.windspeed;
      let currentTemp = DEFAULT_WEATHER.temperature;

      for (let i = 15; i >= 0; i--) {
        const timeLabel = new Date(start.getTime() - i * 60 * 1000);
        const factor = Math.sin(i / 3.0);
        const histWind = Math.max(2.0, currentWind + factor * 0.8 + randomNormal(0, 0.4));
        const histGust = histWind + Math.max(0.2, 1.5 + randomNormal(0, 0.3));
        const histTemp = currentTemp + Math.cos(i / 4.0) * 0.5 + randomNormal(0, 0.2);
        const histHumid = Math.min(100, Math.max(20, 55 - (histTemp - 20) * 1.5 + randomNormal(0, 2)));
        const histDew = histTemp - (100 - histHumid) / 5;
        const histWeather: WeatherMetrics = {
          temperature: parseFloat(histTemp.toFixed(2)),
          relativehu: parseFloat(histHumid.toFixed(2)),
          dewpoint: parseFloat(histDew.toFixed(2)),
          windspeed: parseFloat(histWind.toFixed(2)),
          winddirec: Math.round((210 + Math.sin(i) * 15 + 360) % 360),
          windgust: parseFloat(histGust.toFixed(2)),
        };
        const power = await predictPowerKw(activeModel, histWeather);
        tempHistory.push({
          time: timeLabel.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          ...histWeather,
          power: parseFloat(power.toFixed(1)),
        });
      }

      if (!cancelled) {
        setHistory(tempHistory);
        void updateForecasts(DEFAULT_WEATHER, activeModel);
      }
    }

    void seedHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      void (async () => {
        const current = weatherRef.current;
        const currentModel = modelRef.current;
        const windDrift = randomNormal(0, 0.22);
        const tempDrift = randomNormal(0, 0.08);
        const humidDrift = randomNormal(0, 0.6);

        const nextWind = Math.max(1.5, current.windspeed + windDrift);
        const nextGust = Math.max(nextWind, nextWind + Math.max(0.5, 1.8 + randomNormal(0, 0.25)));
        const nextTemp = Math.max(-5, Math.min(45, current.temperature + tempDrift));
        const nextHumid = Math.max(15, Math.min(100, current.relativehu + humidDrift));
        const nextDew = nextTemp - (100 - nextHumid) / 5;

        const nextWeather: WeatherMetrics = {
          temperature: parseFloat(nextTemp.toFixed(2)),
          relativehu: parseFloat(nextHumid.toFixed(2)),
          dewpoint: parseFloat(nextDew.toFixed(2)),
          windspeed: parseFloat(nextWind.toFixed(2)),
          winddirec: Math.round((current.winddirec + randomNormal(0, 2) + 360) % 360),
          windgust: parseFloat(nextGust.toFixed(2)),
          location: current.location,
        };

        setWeather(nextWeather);
        const power = await predictPowerKw(currentModel, nextWeather);
        const nextTick: SimulationTick = {
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          ...nextWeather,
          power: parseFloat(power.toFixed(1)),
        };

        setHistory((prev) => {
          const nextHistory = [...prev, nextTick];
          if (nextHistory.length > 20) nextHistory.shift();
          return nextHistory;
        });

        void updateForecasts(nextWeather, currentModel);
      })();
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleWeatherChange = (metrics: Partial<WeatherMetrics>) => {
    const updated = { ...weather, ...metrics };

    if (metrics.relativehu !== undefined || metrics.temperature !== undefined) {
      updated.dewpoint = parseFloat((updated.temperature - (100 - updated.relativehu) / 5).toFixed(2));
    }

    if (updated.windgust < updated.windspeed) {
      updated.windgust = updated.windspeed;
    }

    setWeather(updated);
    void updateForecasts(updated, activeModel);

    const fallbackPower = predictPowerKwFallback(activeModel, updated);
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const setInstantPoint = (power: number) => {
      const instantTick: SimulationTick = {
        time: timestamp,
        ...updated,
        power: parseFloat(power.toFixed(1)),
      };
      setHistory((prev) => [...prev.slice(0, -1), instantTick]);
    };

    setInstantPoint(fallbackPower);
    void predictPowerKw(activeModel, updated).then(setInstantPoint);
  };

  const changeModel = (model: string) => {
    setActiveModel(model);
    void updateForecasts(weather, model);

    const fallbackPower = predictPowerKwFallback(model, weather);
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const setInstantPoint = (power: number) => {
      const instantTick: SimulationTick = {
        time: timestamp,
        ...weather,
        power: parseFloat(power.toFixed(1)),
      };
      setHistory((prev) => {
        if (prev.length === 0) return [instantTick];
        return [...prev.slice(0, -1), instantTick];
      });
    };

    setInstantPoint(fallbackPower);
    void predictPowerKw(model, weather).then(setInstantPoint);
  };

  return {
    weather,
    activeModel,
    isSimulating,
    history,
    forecasts,
    setWeather: handleWeatherChange,
    setIsSimulating,
    changeModel,
  };
}

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const sim = useWeatherSimulation();
  return <SimulationContext.Provider value={sim}>{children}</SimulationContext.Provider>;
}
