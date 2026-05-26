from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Dict, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler, StandardScaler

from app.ml.features import FEATURE_COLUMNS, RAW_COLUMNS, TARGET_COLUMN, add_time_features

try:
    from xgboost import XGBRegressor
except Exception:  # pragma: no cover
    XGBRegressor = None

try:
    from tensorflow.keras.callbacks import EarlyStopping
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.models import Sequential
except Exception:  # pragma: no cover
    EarlyStopping = LSTM = Dense = Dropout = Sequential = None


def load_and_prepare_dataset(dataset_path: Path) -> pd.DataFrame:
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found: {dataset_path}")
    frame = pd.read_csv(dataset_path)
    missing = [column for column in RAW_COLUMNS + [TARGET_COLUMN] if column not in frame.columns]
    if missing:
        raise ValueError(f"Dataset missing required columns: {missing}")
    frame = frame.drop_duplicates().copy()
    for column in RAW_COLUMNS + [TARGET_COLUMN]:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    frame = add_time_features(frame)
    numeric_columns = RAW_COLUMNS + [TARGET_COLUMN] + ["hour", "day", "month"]
    imputer = SimpleImputer(strategy="median")
    frame[numeric_columns] = imputer.fit_transform(frame[numeric_columns])
    frame[TARGET_COLUMN] = frame[TARGET_COLUMN].clip(lower=0)
    return frame


def metric_dict(y_true, y_pred) -> Dict[str, float]:
    y_true_arr = np.asarray(y_true, dtype=float)
    y_pred_arr = np.asarray(y_pred, dtype=float)
    denominator = np.where(y_true_arr == 0, 1.0, y_true_arr)
    return {
        "mae": float(mean_absolute_error(y_true_arr, y_pred_arr)),
        "rmse": float(math.sqrt(mean_squared_error(y_true_arr, y_pred_arr))),
        "r2": float(r2_score(y_true_arr, y_pred_arr)),
        "mape": float(np.mean(np.abs((y_true_arr - y_pred_arr) / denominator)) * 100),
    }


def pipeline(model) -> Pipeline:
    return Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", model),
        ]
    )


def make_sequences(values: np.ndarray, target_index: int, lookback: int) -> Tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    for idx in range(lookback, len(values)):
        X.append(values[idx - lookback : idx])
        y.append(values[idx, target_index])
    return np.asarray(X), np.asarray(y)


def build_lstm(input_shape):
    model = Sequential(
        [
            LSTM(64, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(32),
            Dense(16, activation="relu"),
            Dense(1),
        ]
    )
    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return model


def train_all_models(dataset_path: Path, output_dir: Path, epochs: int = 3, lookback: int = 24) -> pd.DataFrame:
    output_dir.mkdir(parents=True, exist_ok=True)
    frame = load_and_prepare_dataset(dataset_path)
    X = frame[FEATURE_COLUMNS]
    y = frame[TARGET_COLUMN]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False, random_state=42)

    candidates = {
        "linear_regression": pipeline(LinearRegression()),
        "random_forest": pipeline(
            RandomForestRegressor(n_estimators=220, max_depth=18, min_samples_leaf=2, random_state=42, n_jobs=-1)
        ),
    }
    if XGBRegressor is not None:
        candidates["xgboost"] = pipeline(
            XGBRegressor(
                n_estimators=450,
                learning_rate=0.035,
                max_depth=5,
                subsample=0.9,
                colsample_bytree=0.9,
                objective="reg:squarederror",
                random_state=42,
                n_jobs=2,
            )
        )

    rows = []
    best_name = None
    best_rmse = float("inf")
    for name, model in candidates.items():
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        metrics = metric_dict(y_test, predictions)
        rows.append({"model": name, **metrics})
        joblib.dump(model, output_dir / f"{name}.pkl")
        if metrics["rmse"] < best_rmse:
            best_name = name
            best_rmse = metrics["rmse"]
            joblib.dump(model, output_dir / "best_model.pkl")

    if Sequential is None:
        raise RuntimeError(
            "TensorFlow/Keras is required for real LSTM training. "
            "Use Python 3.11 and install backend/requirements.txt."
        )
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(frame[FEATURE_COLUMNS + [TARGET_COLUMN]])
    seq_X, seq_y = make_sequences(scaled, target_index=len(FEATURE_COLUMNS), lookback=lookback)
    if len(seq_X) < 100:
        raise ValueError(
            f"Not enough sequence rows for LSTM training: got {len(seq_X)}, need at least 100. "
            f"Lower --lookback or provide more data."
        )
    split = int(len(seq_X) * 0.8)
    model = build_lstm((seq_X.shape[1], seq_X.shape[2]))
    model.fit(
        seq_X[:split],
        seq_y[:split],
        validation_split=0.15,
        epochs=epochs,
        batch_size=64,
        callbacks=[EarlyStopping(monitor="val_loss", patience=2, restore_best_weights=True)],
        verbose=1,
    )
    scaled_predictions = model.predict(seq_X[split:], verbose=0).reshape(-1)
    power_min, power_max = scaler.data_min_[-1], scaler.data_max_[-1]
    predictions = scaled_predictions * (power_max - power_min) + power_min
    actual = seq_y[split:] * (power_max - power_min) + power_min
    rows.append({"model": "lstm", **metric_dict(actual, predictions)})
    model.save(output_dir / "lstm.h5")
    joblib.dump(scaler, output_dir / "lstm_scaler.pkl")
    joblib.dump(scaler, output_dir / "lstm_scaler.joblib")

    metrics_df = pd.DataFrame(rows).sort_values("rmse").reset_index(drop=True)
    metrics_df.to_csv(output_dir / "metrics.csv", index=False)
    metadata = {
        "best_model": best_name,
        "feature_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN,
        "dataset_path": str(dataset_path),
        "rows": int(len(frame)),
        "lstm_model": "lstm.h5",
        "lstm_lookback": lookback,
    }
    (output_dir / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metrics_df
