# Next.js Integration Contract

The frontend can connect to the FastAPI backend with these variables:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010/api/v1
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8010/api/v1/ws/live
```

Implemented frontend integration files:

- `frontend/src/utils/windcastApi.ts`
- `frontend/src/hooks/useWeatherSimulation.tsx`
- `frontend/src/hooks/useLiveForecastSocket.ts`
- `frontend/src/charts/PerformanceChart.tsx`

The simulation hook now calls `/predict` for trained-model inference and falls back to the local TypeScript model if the backend is unavailable.

The performance chart now calls `/models` and displays real backend metrics from `backend/trained_models/metrics.csv`.

Realtime streaming is available with:

```ts
const { points, status } = useLiveForecastSocket(true);
```

Each WebSocket point includes:

```ts
{
  step: number,
  predicted_power: number,
  power_kw: number,
  confidence_score: number,
  model_used: string,
  alert: string,
  weather: {
    temperature: number,
    relativehu: number,
    dewpoint: number,
    windspeed: number,
    winddirec: number,
    windgust: number
  }
}
```

For Recharts, use `power_kw`, `weather.windspeed`, and `confidence_score`.
