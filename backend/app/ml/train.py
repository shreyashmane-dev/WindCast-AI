"""
Training pipeline for WindCast AI models.
Processes data/wind.csv, trains Linear Regression, Random Forest, XGBoost,
and temporal sequence models, and saves trained models inside trained_models/.
"""

import argparse
import math
import json
import sys
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

try:
  from tensorflow.keras.callbacks import EarlyStopping
  from tensorflow.keras.layers import Dense, Dropout, LSTM
  from tensorflow.keras.models import Sequential
except Exception:  # pragma: no cover
  EarlyStopping = Dense = Dropout = LSTM = Sequential = None

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))
DATA_PATH = BASE_DIR.parent / "data" / "wind.csv"
MODELS_DIR = BASE_DIR / "trained_models"
REPORTS_DIR = BASE_DIR / "app" / "static" # Directory to save metrics report

from app.ml.features import FEATURE_COLUMNS, RAW_COLUMNS, TARGET_COLUMN, add_time_features  # noqa: E402

TARGET_COLUMN = "Power"
RANDOM_STATE = 42

def ensure_directories():
  MODELS_DIR.mkdir(parents=True, exist_ok=True)
  REPORTS_DIR.mkdir(parents=True, exist_ok=True)

def load_and_preprocess_data() -> pd.DataFrame:
  if not DATA_PATH.exists():
    raise FileNotFoundError(f"Provided dataset not found at: {DATA_PATH}")

  print(f"Loading dataset from: {DATA_PATH}...")
  df = pd.read_csv(DATA_PATH)
  
  # Clean column duplicates. Keep all four locations so the production model sees
  # the full range of telemetry patterns available in the dataset.
  df = df.drop_duplicates()

  # Detect and parse timestamp
  time_col = None
  for col in ["Time", "time", "timestamp", "date", "DateTime"]:
    if col in df.columns:
      time_col = col
      break

  if time_col:
    df[time_col] = pd.to_datetime(df[time_col], errors="coerce")
    df = df.rename(columns={time_col: "Time"})
  else:
    df["Time"] = pd.date_range("2025-01-01", periods=len(df), freq="h")

  df = df.dropna(subset=["Time"]).sort_values("Time").reset_index(drop=True)

  # Check columns
  required = RAW_COLUMNS + [TARGET_COLUMN]
  missing = [c for c in required if c not in df.columns]
  if missing:
    raise ValueError(f"Dataset is missing key metrics columns: {missing}")

  # Clean numerical columns
  for col in required:
    df[col] = pd.to_numeric(df[col], errors="coerce")

  imputer = SimpleImputer(strategy="median")
  df[required] = imputer.fit_transform(df[required])

  # Engineer temporal, directional, and wind-physics features.
  df = add_time_features(df)
  
  # Ensure Power targets cannot be negative
  df["Power"] = df["Power"].clip(lower=0)

  print(f"Dataset preprocessed successfully. Total records: {len(df)}")
  return df

def calculate_metrics(y_true, y_pred) -> dict:
  y_true = np.asarray(y_true, dtype=float)
  y_pred = np.asarray(y_pred, dtype=float)
  
  mae = float(np.mean(np.abs(y_true - y_pred)))
  rmse = float(math.sqrt(np.mean((y_true - y_pred) ** 2)))
  
  # R2 Score calculation
  ss_res = np.sum((y_true - y_pred) ** 2)
  ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
  r2 = float(1 - (ss_res / (ss_tot + 1e-9)))

  # MAPE calculation (safe clamp denominators)
  denom = np.maximum(np.abs(y_true), 0.01)
  mape = float(np.mean(np.abs((y_true - y_pred) / denom)) * 100)
  
  return {"MAE": mae, "RMSE": rmse, "R2": r2, "MAPE": mape}

def build_ml_pipeline(model):
  return Pipeline(
      steps=[
          ("imputer", SimpleImputer(strategy="median")),
          ("scaler", StandardScaler()),
          ("model", model),
      ]
  )

def make_sequences(values: np.ndarray, target_index: int, lookback: int) -> tuple[np.ndarray, np.ndarray]:
  X, y = [], []
  for idx in range(lookback, len(values)):
    X.append(values[idx - lookback : idx])
    y.append(values[idx, target_index])
  return np.asarray(X), np.asarray(y)

def build_lstm_model(input_shape):
  if Sequential is None:
    raise RuntimeError(
        "TensorFlow is required for LSTM training. Use Python 3.11 and install backend/requirements.txt."
    )
  model = Sequential(
      [
          LSTM(64, return_sequences=True, input_shape=input_shape),
          Dropout(0.2),
          LSTM(32),
          Dropout(0.2),
          Dense(16, activation="relu"),
          Dense(1),
      ]
  )
  model.compile(optimizer="adam", loss="mse", metrics=["mae"])
  return model

def inverse_scaled_power(scaler: MinMaxScaler, scaled_values: np.ndarray) -> np.ndarray:
  power_min = scaler.data_min_[-1]
  power_max = scaler.data_max_[-1]
  return np.asarray(scaled_values).reshape(-1) * (power_max - power_min) + power_min

def train_lstm_model(df: pd.DataFrame, rows: list[dict], lookback: int = 24, epochs: int = 12) -> dict:
  print("\n--- Training TensorFlow LSTM Sequence Model ---")
  if Sequential is None:
    message = (
        "TensorFlow/Keras is not installed for this Python interpreter. "
        "LSTM was not trained; use Python 3.11 with backend/requirements.txt to create lstm.h5."
    )
    print(message)
    return {"trained": False, "reason": message}

  scaler = MinMaxScaler()
  scaled_values = scaler.fit_transform(df[FEATURE_COLUMNS + [TARGET_COLUMN]])
  seq_X, seq_y = make_sequences(scaled_values, target_index=len(FEATURE_COLUMNS), lookback=lookback)
  if len(seq_X) < 100:
    message = (
        f"Not enough sequence rows for LSTM training: got {len(seq_X)}, need at least 100. "
        f"Lower --lookback or provide more data."
    )
    print(message)
    return {"trained": False, "reason": message}

  split_idx = int(len(seq_X) * 0.8)
  model = build_lstm_model((seq_X.shape[1], seq_X.shape[2]))
  model.fit(
      seq_X[:split_idx],
      seq_y[:split_idx],
      validation_split=0.15,
      epochs=epochs,
      batch_size=64,
      callbacks=[EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True)],
      verbose=1,
  )

  scaled_predictions = model.predict(seq_X[split_idx:], verbose=0).reshape(-1)
  predictions = inverse_scaled_power(scaler, scaled_predictions)
  actual = inverse_scaled_power(scaler, seq_y[split_idx:])
  metrics = calculate_metrics(actual, np.maximum(predictions, 0))
  print(f"LSTM Metrics: MAE={metrics['MAE']:.2f} | RMSE={metrics['RMSE']:.2f} | R2={metrics['R2']:.3f}")

  rows.append({"Model": "LSTM", **metrics})
  model.save(MODELS_DIR / "lstm.h5")
  model.save(MODELS_DIR / "lstm_model.h5")
  joblib.dump(scaler, MODELS_DIR / "lstm_scaler.joblib")
  return {"trained": True, "reason": "TensorFlow LSTM trained and saved.", "metrics": metrics}

def train_and_evaluate(epochs: int = 12, lookback: int = 24):
  ensure_directories()
  df = load_and_preprocess_data()

  X = df[FEATURE_COLUMNS]
  y = df[TARGET_COLUMN]

  # Perform chronological train/test split to preserve temporal sequence boundaries
  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=RANDOM_STATE, shuffle=False)

  print("\n--- Training Standard Machine Learning Models ---")
  models = {
      "Linear Regression": build_ml_pipeline(LinearRegression()),
      "Random Forest": build_ml_pipeline(
          RandomForestRegressor(
              n_estimators=180,
              max_depth=18,
              min_samples_leaf=2,
              max_features=0.8,
              random_state=RANDOM_STATE,
              n_jobs=-1,
          )
      ),
      "XGBoost": build_ml_pipeline(
          XGBRegressor(
              n_estimators=900,
              learning_rate=0.025,
              max_depth=7,
              min_child_weight=2,
              subsample=0.9,
              colsample_bytree=0.9,
              reg_lambda=1.5,
              objective="reg:squarederror",
              tree_method="hist",
              random_state=RANDOM_STATE,
              n_jobs=-1,
          )
      )
  }

  rows = []
  best_name = None
  best_rmse = float("inf")

  for name, pipeline in models.items():
    print(f"Fitting {name} forecasting engine...")
    pipeline.fit(X_train, y_train)
    
    preds = pipeline.predict(X_test)
    preds = np.maximum(preds, 0) # Clip negative power outputs

    metrics = calculate_metrics(y_test, preds)
    print(f"{name} Metrics: MAE={metrics['MAE']:.2f} | RMSE={metrics['RMSE']:.2f} | R²={metrics['R2']:.3f}")
    
    rows.append({"Model": name, **metrics})

    # Save models
    model_slug = name.lower().replace(" ", "_")
    joblib.dump(pipeline, MODELS_DIR / f"{model_slug}.joblib")

    if metrics["RMSE"] < best_rmse:
      best_name = name
      best_rmse = metrics["RMSE"]
      joblib.dump(pipeline, MODELS_DIR / "best_model.joblib")
      joblib.dump(pipeline, MODELS_DIR / "best_model.pkl")

  lstm_status = train_lstm_model(df, rows, lookback=lookback, epochs=epochs)

  # Save evaluation metrics reports
  report_df = pd.DataFrame(rows).sort_values("RMSE").reset_index(drop=True)
  report_df.to_csv(REPORTS_DIR / "model_metrics.csv", index=False)
  report_df.to_csv(MODELS_DIR / "model_metrics.csv", index=False)
  report_df.rename(columns=str.lower).to_csv(MODELS_DIR / "metrics.csv", index=False)
  metadata = {
      "best_model": best_name.lower().replace(" ", "_") if best_name else None,
      "best_display_name": best_name,
      "feature_columns": FEATURE_COLUMNS,
      "target_column": TARGET_COLUMN,
      "dataset_path": str(DATA_PATH),
      "rows": int(len(df)),
      "lstm_model": "lstm.h5" if lstm_status["trained"] else None,
      "lstm_lookback": lookback,
      "lstm_status": lstm_status,
  }
  (MODELS_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
  
  print("\n==================================================")
  print("Training pipeline finished successfully!")
  print(report_df.to_string(index=False))
  print(f"\nBest Production Model: {best_name} (Saved to best_model.joblib)")
  print("==================================================")

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Train WindCast AI backend models, including real TensorFlow LSTM.")
  parser.add_argument("--epochs", type=int, default=12, help="LSTM training epochs.")
  parser.add_argument("--lookback", type=int, default=24, help="LSTM sequence lookback length.")
  args = parser.parse_args()
  train_and_evaluate(epochs=args.epochs, lookback=args.lookback)
