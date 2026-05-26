# WindCast AI Website Manual

This project already has a Streamlit website. After installing dependencies once, the website runs with one command, so Docker is not required.

## 1. Install Requirements

Run this once inside the project folder:

```bash
pip install -r requirements.txt
```

## 2. Train the Model

The Kaggle dataset has been copied into:

```text
data/raw/
```

A cleaned combined training file has been created at:

```text
data/wind_power_generation_forecasting.csv
```

Train the models with:

```bash
python train.py --data data/wind_power_generation_forecasting.csv --epochs 3
```

The best model is saved automatically to:

```text
models/best_model.joblib
```

## 3. Run the Website

Start the dashboard with one command:

```bash
streamlit run streamlit_app.py
```

Open the local URL shown by Streamlit, usually:

```text
http://localhost:8501
```

## 4. Evaluate Models

To regenerate the comparison metrics:

```bash
python evaluate.py --data data/wind_power_generation_forecasting.csv
```

## Dashboard Pages

- Overview: KPI cards, latest prediction, historical power trend.
- Real-Time Prediction: manual weather inputs and live simulation graph.
- Forecast Horizons: next 1 hour, 6 hours, and 24 hours.
- Analytics: Plotly EDA charts.
- Model Comparison: MAE, RMSE, R2, and MAPE table with charts.
- Reports: downloadable prediction report.

## Notes

- The website uses the trained `models/best_model.joblib` file when available.
- If no trained model exists, the app creates a temporary Random Forest model for demo use.
- Docker is skipped because the website needs only one command to run locally.
