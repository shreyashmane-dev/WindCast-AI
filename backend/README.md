# WindCast AI Backend

Production-grade FastAPI backend for short-term wind power forecasting. It exposes ML inference, analytics, batch CSV prediction, model comparison, and realtime WebSocket streams for the existing Next.js frontend.

## Architecture

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── ml/
│   ├── utils/
│   ├── middleware/
│   └── main.py
├── trained_models/
├── tests/
├── requirements.txt
└── Dockerfile
```

## Dataset

The backend trains from:

```text
data/wind.csv
```

Required columns:

```text
temperature, relativehu, dewpoint, windspeed, winddirec, windgust, Power
```

## Setup

From the project root:

```bash
pip install -r backend/requirements.txt
```

## Train Models

```bash
python backend/scripts/train_models.py --data data/wind.csv --epochs 3
```

Saved outputs:

```text
backend/trained_models/linear_regression.pkl
backend/trained_models/random_forest.pkl
backend/trained_models/xgboost.pkl
backend/trained_models/best_model.pkl
backend/trained_models/lstm.h5
backend/trained_models/lstm_scaler.joblib
backend/trained_models/metrics.csv
backend/trained_models/metadata.json
```

TensorFlow is a required backend training dependency. Use Python 3.11 for this command; if TensorFlow/Keras cannot import, training fails instead of publishing placeholder LSTM metrics.

## Run API

PowerShell:

```powershell
.\backend\start.ps1
```

Cross-platform:

```bash
python -m uvicorn --app-dir backend app.main:app --reload --host 127.0.0.1 --port 8010
```

Docs:

```text
http://127.0.0.1:8010/docs
```

## API Endpoints

Base URL for Next.js:

```text
http://127.0.0.1:8010/api/v1
```

### Health

```http
GET /health
GET /api/v1/health
```

### Single Prediction

```http
POST /api/v1/predict
Content-Type: application/json
```

```json
{
  "temperature": 25,
  "relativehu": 70,
  "dewpoint": 21,
  "windspeed": 8,
  "winddirec": 180,
  "windgust": 11
}
```

Response:

```json
{
  "predicted_power": 0.42,
  "confidence_score": 0.81,
  "model_used": "xgboost",
  "units": "normalized_power",
  "alert": "normal",
  "inference_ms": 3.1,
  "request_timestamp": "2026-05-26T..."
}
```

### Batch Prediction

```http
POST /api/v1/predict/batch
Content-Type: multipart/form-data
```

Upload a CSV containing:

```text
temperature,relativehu,dewpoint,windspeed,winddirec,windgust
```

### Models

```http
GET /api/v1/models
```

Returns available models, metrics, and best model selection logic.

### Analytics

```http
GET /api/v1/analytics
```

Returns average power, max power, efficiency, sample count, trend direction, and recent trend points.

### Live Forecast

```http
GET /api/v1/forecast/live?limit=12
```

WebSocket:

```text
ws://127.0.0.1:8010/api/v1/ws/live
```

## Next.js Integration

Create `.env.local` in the frontend:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010/api/v1
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8010/api/v1/ws/live
```

Prediction fetch:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function predictPower(payload: WeatherInput) {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}
```

WebSocket stream:

```ts
const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
socket.onmessage = (event) => {
  const point = JSON.parse(event.data);
  // Send point.predicted_power and point.weather.windspeed to Recharts.
};
```

## Security

- CORS restricted through `CORS_ORIGINS`.
- Typed Pydantic validation for all prediction inputs.
- Secure response headers.
- JWT helper endpoint and optional bearer token validation.
- In-memory API rate limiting.
- Environment-driven secrets via `.env`.

## Docker

```bash
docker compose up --build
```

The backend will run on:

```text
http://localhost:8000
```

## Deployment

- Render: use `backend/render.yaml`.
- Railway: use `backend/railway.json`.
- Docker: use `backend/Dockerfile` or `docker-compose.yml`.
- Vercel serverless: `backend/vercel.json` is included, but Docker/Render/Railway are recommended for ML inference because model files and native ML dependencies are heavier than typical serverless limits.

## Tests

```bash
pytest backend/tests
```
