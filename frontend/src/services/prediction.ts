import { api } from "./api";
import { WeatherMetrics } from "../utils/predictionModel";

export interface PredictionPayload {
  predicted_power: number;
  efficiency: number;
  alert_status: string;
  confidence_score: number;
  model_used: string;
  region?: string;
}

export interface BatchPredictionPayload {
  total_records: number;
  average_predicted_power: number;
  peak_predicted_power: number;
  alert_records_count: number;
  predictions: number[];
}

/**
 * Service to execute predictions against the FastAPI backend.
 */
export const predictionService = {
  /**
   * Calls GET /predict (FastAPI) or POST depending on method design.
   * SecureBearer token is injected automatically by our interceptor client.
   */
  async getForecast(
    weather: WeatherMetrics,
    modelName: string
  ): Promise<PredictionPayload> {
    try {
      return await api.post<PredictionPayload>("/predict", {
        temperature: weather.temperature,
        relativehu: weather.relativehu,
        dewpoint: weather.dewpoint,
        windspeed: weather.windspeed,
        winddirec: weather.winddirec,
        windgust: weather.windgust,
        location: weather.location ?? "Mumbai, India",
        model: modelName,
      });
    } catch (error: any) {
      // Graceful local offline fallback simulation in case the backend server isn't running yet!
      console.warn("Backend server connection failed. Executing local ML pipeline simulation fallback.");
      
      const { predictPower, calculateEfficiency, getAlertStatus } = await import("../utils/predictionModel");
      const power = predictPower(modelName, weather);
      const eff = calculateEfficiency(power);
      const alert = getAlertStatus(power, weather.windspeed);

      return {
        predicted_power: power,
        efficiency: eff,
        alert_status: alert.message,
        confidence_score: modelName === "LSTM" ? 0.86 : modelName === "Random Forest" ? 0.61 : 0.88,
        model_used: `${modelName} (Local Client Fallback)`,
        region: weather.location ?? "Mumbai, India",
      };
    }
  },

  /**
   * Transmits a CSV file multipart stream to the backend.
   */
  async uploadBatchCSV(file: File): Promise<BatchPredictionPayload> {
    const formData = new FormData();
    formData.append("file", file);

    return await api.post<BatchPredictionPayload>("/predict/batch", formData);
  }
};
