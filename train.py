"""Train WindCast AI models."""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

from utils import (
    MODELS_DIR,
    RANDOM_STATE,
    calculate_metrics,
    ensure_directories,
    inverse_lstm_predictions,
    load_dataset,
    prepare_data,
    save_joblib,
    save_metrics_report,
    build_ml_pipeline,
)

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


def build_lstm_model(input_shape):
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


def train_models(dataset_path: str | None = None, epochs: int = 12, lookback: int = 24) -> pd.DataFrame:
    ensure_directories()
    data = prepare_data(load_dataset(dataset_path), lookback=lookback)

    models = {
        "Linear Regression": build_ml_pipeline(LinearRegression()),
        "Random Forest": build_ml_pipeline(
            RandomForestRegressor(n_estimators=250, max_depth=18, min_samples_leaf=2, random_state=RANDOM_STATE, n_jobs=-1)
        ),
    }
    if XGBRegressor is not None:
        models["XGBoost"] = build_ml_pipeline(
            XGBRegressor(
                n_estimators=450,
                learning_rate=0.035,
                max_depth=5,
                subsample=0.9,
                colsample_bytree=0.9,
                objective="reg:squarederror",
                random_state=RANDOM_STATE,
            )
        )

    rows = []
    best_name = None
    best_rmse = float("inf")
    for name, model in models.items():
        model.fit(data.X_train, data.y_train)
        predictions = model.predict(data.X_test)
        metrics = calculate_metrics(data.y_test, predictions)
        rows.append({"Model": name, **metrics})
        model_path = MODELS_DIR / f"{name.lower().replace(' ', '_')}.joblib"
        save_joblib(model, model_path)
        if metrics["RMSE"] < best_rmse:
            best_name = name
            best_rmse = metrics["RMSE"]
            save_joblib(model, MODELS_DIR / "best_model.joblib")

    if Sequential is not None and data.lstm_train is not None and len(data.lstm_train) > 20:
        lstm_model = build_lstm_model((data.lstm_train.shape[1], data.lstm_train.shape[2]))
        callbacks = [EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True)]
        lstm_model.fit(
            data.lstm_train,
            data.lstm_y_train,
            validation_split=0.15,
            epochs=epochs,
            batch_size=32,
            callbacks=callbacks,
            verbose=1,
        )
        scaled_predictions = lstm_model.predict(data.lstm_test, verbose=0).reshape(-1)
        predictions = inverse_lstm_predictions(data.feature_scaler, scaled_predictions)
        actual = inverse_lstm_predictions(data.feature_scaler, data.lstm_y_test)
        rows.append({"Model": "LSTM", **calculate_metrics(actual, predictions)})
        lstm_model.save(MODELS_DIR / "lstm_model.h5")
        save_joblib(data.feature_scaler, MODELS_DIR / "lstm_scaler.joblib")

    metrics_df = pd.DataFrame(rows).sort_values("RMSE").reset_index(drop=True)
    save_metrics_report(metrics_df)
    print(metrics_df.to_string(index=False))
    print(f"\nBest production model: {best_name} saved to {MODELS_DIR / 'best_model.joblib'}")
    return metrics_df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train WindCast AI forecasting models.")
    parser.add_argument("--data", type=str, default=None, help="Path to Kaggle CSV dataset.")
    parser.add_argument("--epochs", type=int, default=12, help="LSTM training epochs.")
    parser.add_argument("--lookback", type=int, default=24, help="LSTM sequence lookback length.")
    args = parser.parse_args()
    train_models(args.data, epochs=args.epochs, lookback=args.lookback)
