"""Evaluate saved WindCast AI models and export reports."""

from __future__ import annotations

import argparse

import joblib
import pandas as pd

from utils import (
    MODELS_DIR,
    calculate_metrics,
    ensure_directories,
    load_dataset,
    prepare_data,
    save_metrics_report,
)

try:
    from tensorflow.keras.models import load_model
    from utils import inverse_lstm_predictions, load_joblib
except Exception:  # pragma: no cover
    load_model = None


def evaluate_models(dataset_path: str | None = None) -> pd.DataFrame:
    ensure_directories()
    data = prepare_data(load_dataset(dataset_path))
    rows = []

    for model_path in sorted(MODELS_DIR.glob("*.joblib")):
        if model_path.name in {"best_model.joblib", "lstm_scaler.joblib"}:
            continue
        model = joblib.load(model_path)
        predictions = model.predict(data.X_test)
        model_name = model_path.stem.replace("_", " ").title()
        rows.append({"Model": model_name, **calculate_metrics(data.y_test, predictions)})

    lstm_path = MODELS_DIR / "lstm_model.h5"
    scaler_path = MODELS_DIR / "lstm_scaler.joblib"
    if load_model is not None and lstm_path.exists() and scaler_path.exists() and data.lstm_test is not None:
        scaler = joblib.load(scaler_path)
        lstm = load_model(lstm_path)
        scaled_predictions = lstm.predict(data.lstm_test, verbose=0).reshape(-1)
        predictions = inverse_lstm_predictions(scaler, scaled_predictions)
        actual = inverse_lstm_predictions(scaler, data.lstm_y_test)
        rows.append({"Model": "LSTM", **calculate_metrics(actual, predictions)})

    metrics_df = pd.DataFrame(rows).sort_values("RMSE").reset_index(drop=True)
    save_metrics_report(metrics_df)
    print(metrics_df.to_string(index=False))
    return metrics_df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate saved WindCast AI models.")
    parser.add_argument("--data", type=str, default=None, help="Path to Kaggle CSV dataset.")
    args = parser.parse_args()
    evaluate_models(args.data)
