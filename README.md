# WindCast AI - Short-Term Wind Power Forecasting

WindCast AI is a machine learning project for short-term wind power forecasting using Kaggle wind power and weather datasets. The system predicts wind turbine power output from weather parameters, compares multiple ML models, and serves results through a real-time dashboard with manual prediction and CSV batch prediction modes.

## Project Objective

The goal is to forecast short-term wind power output using weather conditions such as wind speed, wind direction, temperature, humidity, dewpoint, gust speed, and actual timestamp features.

This project demonstrates:

- Machine learning regression for renewable energy forecasting.
- Weather-data preprocessing and feature engineering.
- Model comparison using MAE, RMSE, R2, and MAPE.
- Real-time dashboard visualizations.
- Manual single-scenario prediction.
- CSV batch prediction with downloadable results.

## Dataset

The project uses Kaggle-style wind power forecasting data and local weather datasets.

Main dataset:

```text
data/wind.csv
```

Raw location datasets:

```text
data/raw/Location1.csv
data/raw/Location2.csv
data/raw/Location3.csv
data/raw/Location4.csv
```

Required weather/input columns:

```text
temperature
relativehu
dewpoint
windspeed
winddirec
windgust
Power
Time
```

Important features used by the model:

- Wind speed
- Wind direction
- Temperature
- Humidity
- Dewpoint
- Wind gust
- Actual time / timestamp
- Engineered time features
- Engineered wind physics features

## Machine Learning Models

The platform compares these models:

- Linear Regression
- Random Forest
- XGBoost
- LSTM

Current trained production model:

```text
XGBoost
```

Note: LSTM is trained as a real TensorFlow/Keras sequence model. Use a Python 3.11 environment and install `backend/requirements.txt` before running the backend training pipeline.

## Latest Training Results

Training was run on the full dataset:

```text
Total records: 175,200
Best model: XGBoost
```

Model comparison:

```text
Model              MAE       RMSE      R2        MAPE
XGBoost            0.140996  0.195914  0.465809  401.355768
Random Forest      0.142736  0.197397  0.457692  404.347106
Linear Regression  0.151354  0.205378  0.412952  400.624041
LSTM               0.152276  0.211587  0.425809  421.423556
```

Best model selection is based on lowest RMSE.

## System Features

### Manual Prediction Mode

Users can manually enter weather parameters:

```text
temperature
relative humidity
dewpoint
wind speed
wind direction
wind gust
region
model
```

The backend returns:

```text
predicted_power
efficiency
alert_status
confidence_score
model_used
region
```

### CSV Batch Prediction Mode

Users can upload weather parameter CSV files.

Example input:

```csv
temperature,relativehu,dewpoint,windspeed,winddirec,windgust,region
28,65,20,15,120,18,Mumbai India
30,60,22,18,140,22,Texas USA
```

The backend:

1. Reads the CSV file.
2. Validates required columns.
3. Auto-detects common column names like `Wind Speed`.
4. Runs ML predictions row by row.
5. Adds prediction columns.
6. Saves a downloadable result CSV.

Generated output includes:

```text
Predicted_Power
Prediction_Confidence
Efficiency_Percent
Alert_Status
Resolved_Region
```

### Analytics Mode

If the uploaded CSV includes actual `Power`, the backend also performs historical analytics:

- MAE
- RMSE
- R2
- actual vs predicted comparison
- AI-style insights
- alert count
- trend data for graphs

### Region Mapping

The frontend shows human-friendly regions, while the backend maps them internally to dataset locations:

```text
Mumbai, India  -> Location1
Texas, USA     -> Location2
Berlin, Germany -> Location3
Tokyo, Japan   -> Location4
```

This keeps the product experience realistic without exposing raw dataset labels.

## Real-Time Dashboard

The dashboard displays:

- Live prediction graphs
- Wind speed vs predicted power charts
- Model comparison table
- MAE/RMSE/R2/MAPE performance chart
- Efficiency analytics
- Alert cards
- Manual prediction console
- CSV upload analytics
- Downloadable prediction results

## Backend API

Backend path:

```text
backend/
```

Run backend:

```bash
python -m uvicorn --app-dir backend app.main:app --reload --host 127.0.0.1 --port 8010
```

API docs:

```text
http://127.0.0.1:8010/docs
```

Important endpoints:

```text
POST /api/v1/predict
POST /api/v1/predict/batch
GET  /api/v1/predict/sample-csv
GET  /api/v1/predict/batch/download/{file_id}
GET  /api/v1/models
GET  /api/v1/models/active
GET  /api/v1/models/regions
```

## Frontend

Frontend path:

```text
frontend/
```

Run frontend:

```bash
cd frontend
npm run dev
```

Build frontend:

```bash
npm run build
```

## Train Models

Run the backend training pipeline:

```bash
cd backend
python app/ml/train.py
```

Training outputs:

```text
backend/trained_models/linear_regression.joblib
backend/trained_models/random_forest.joblib
backend/trained_models/xgboost.joblib
backend/trained_models/best_model.joblib
backend/trained_models/best_model.pkl
backend/trained_models/lstm.h5
backend/trained_models/lstm_model.h5
backend/trained_models/lstm_scaler.joblib
backend/trained_models/model_metrics.csv
backend/trained_models/metrics.csv
backend/trained_models/metadata.json
backend/app/static/model_metrics.csv
```

## Verification

Latest verification:

```text
Backend tests: 18 passed
Frontend production build: passed
Manual prediction API: passed
CSV batch prediction API: passed
```

## Project Structure

```text
WindCast AI/
  backend/
    app/
      api/
      core/
      ml/
      schemas/
      services/
    tests/
    trained_models/
  frontend/
    src/
      pages/
      components/
      charts/
      hooks/
      services/
      utils/
  data/
    raw/
    wind.csv
  models/
  reports/
  README.md
```

## Summary

WindCast AI is a short-term wind power forecasting system using machine learning. It uses weather data, trains and compares multiple models, predicts power output, supports real-time dashboard visualization, and provides CSV upload analytics for practical renewable energy forecasting workflows.
