import { WeatherMetrics } from "./predictionModel";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8010/api/v1";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8010/api/v1/ws/live";

export interface BackendPrediction {
  predicted_power: number;
  confidence_score?: number;
  model_used: string;
  efficiency?: number;
  alert_status?: string;
  region?: string;
  units?: string;
  alert?: string;
  inference_ms?: number;
  request_timestamp?: string;
}

export interface BackendMetric {
  model: string;
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
}

export interface BackendModelsResponse {
  active_model: string;
  available_models: string[];
  metrics: BackendMetric[];
  comparison: {
    best_model: string;
    best_rmse: number;
    selection_logic: string;
  };
}

export interface BackendAnalytics {
  average_power: number;
  peak_power?: number;
  max_power: number;
  min_power: number;
  efficiency: number;
  overall_turbine_efficiency?: number;
  sample_count: number;
  total_records_processed?: number;
  trend_direction: string;
  trend_gradient?: string;
  trend_analysis: Array<{
    timestamp: string;
    power: number;
    windspeed: number;
  }>;
}

type ModelListItem = {
  name: string;
  metrics: {
    MAE: number;
    RMSE: number;
    R2: number;
    MAPE: number;
  };
};

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("windcast_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchPrediction(weather: WeatherMetrics, model = "XGBoost"): Promise<BackendPrediction> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ...weather, model, location: weather.location ?? "Mumbai, India" }),
  });

  if (!response.ok) {
    throw new Error(`Prediction request failed with ${response.status}`);
  }

  return response.json();
}

export async function fetchModels(): Promise<BackendModelsResponse> {
  const response = await fetch(`${API_BASE_URL}/models`, { headers: authHeaders() });
  if (!response.ok) {
    throw new Error(`Models request failed with ${response.status}`);
  }
  const body = await response.json();
  if (Array.isArray(body)) {
    const metrics: BackendMetric[] = body.map((item: ModelListItem) => ({
      model: item.name,
      mae: item.metrics.MAE,
      rmse: item.metrics.RMSE,
      r2: item.metrics.R2,
      mape: item.metrics.MAPE,
    }));
    const ranked = [...metrics].sort((a, b) => a.rmse - b.rmse);
    return {
      active_model: ranked[0]?.model ?? "XGBoost",
      available_models: metrics.map((item) => item.model),
      metrics,
      comparison: {
        best_model: ranked[0]?.model ?? "XGBoost",
        best_rmse: ranked[0]?.rmse ?? 0,
        selection_logic: "Lowest validation RMSE from backend model metrics.",
      },
    };
  }
  return body;
}

export async function fetchAnalytics(): Promise<BackendAnalytics> {
  const response = await fetch(`${API_BASE_URL}/analytics`);
  if (!response.ok) {
    throw new Error(`Analytics request failed with ${response.status}`);
  }
  const body = await response.json();
  return {
    average_power: body.average_power ?? 0,
    max_power: body.max_power ?? body.peak_power ?? 0,
    peak_power: body.peak_power ?? body.max_power ?? 0,
    min_power: body.min_power ?? 0,
    efficiency: body.efficiency ?? ((body.overall_turbine_efficiency ?? 0) / 100),
    overall_turbine_efficiency: body.overall_turbine_efficiency,
    sample_count: body.sample_count ?? body.total_records_processed ?? 0,
    total_records_processed: body.total_records_processed ?? body.sample_count ?? 0,
    trend_direction: body.trend_direction ?? body.trend_gradient ?? "stable",
    trend_gradient: body.trend_gradient,
    trend_analysis: body.trend_analysis ?? [],
  };
}

export function createLiveSocket(): WebSocket {
  return new WebSocket(WS_URL);
}

export function normalizedPowerToKw(power: number, ratedPower = 2200): number {
  return power <= 1.5 ? power * ratedPower : power;
}
