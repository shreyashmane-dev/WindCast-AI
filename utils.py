"""Utility functions for WindCast AI.

The project expects Kaggle-style wind forecasting CSV files with these columns:
temperature, relativehu, dewpoint, windspeed, winddirec, windgust, Power.
An optional time column may be named Time, time, timestamp, date, or datetime.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler, StandardScaler


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
ASSETS_DIR = BASE_DIR / "assets"

REQUIRED_COLUMNS = [
    "temperature",
    "relativehu",
    "dewpoint",
    "windspeed",
    "winddirec",
    "windgust",
    "Power",
]
TIME_CANDIDATES = ["Time", "time", "timestamp", "date", "datetime", "DateTime"]
FEATURE_COLUMNS = [
    "temperature",
    "relativehu",
    "dewpoint",
    "windspeed",
    "winddirec",
    "windgust",
    "hour",
    "day",
    "month",
]
TARGET_COLUMN = "Power"
RANDOM_STATE = 42


@dataclass
class PreparedData:
    frame: pd.DataFrame
    X_train: pd.DataFrame
    X_test: pd.DataFrame
    y_train: pd.Series
    y_test: pd.Series
    lstm_train: Optional[np.ndarray]
    lstm_test: Optional[np.ndarray]
    lstm_y_train: Optional[np.ndarray]
    lstm_y_test: Optional[np.ndarray]
    feature_scaler: MinMaxScaler


def ensure_directories() -> None:
    for directory in [DATA_DIR, MODELS_DIR, REPORTS_DIR, ASSETS_DIR, BASE_DIR / "notebooks", BASE_DIR / "app"]:
        directory.mkdir(parents=True, exist_ok=True)


def find_dataset(path: Optional[str] = None) -> Optional[Path]:
    if path:
        candidate = Path(path)
        return candidate if candidate.exists() else None
    preferred = DATA_DIR / "wind_power_generation_forecasting.csv"
    if preferred.exists():
        return preferred
    non_sample_files = sorted(path for path in DATA_DIR.glob("*.csv") if not path.name.startswith("sample_"))
    if non_sample_files:
        return non_sample_files[0]
    csv_files = sorted(DATA_DIR.glob("*.csv"))
    return csv_files[0] if csv_files else None


def generate_sample_data(rows: int = 1500, output_path: Optional[Path] = None) -> pd.DataFrame:
    """Create realistic sample data for demos when the Kaggle CSV is not present."""
    rng = np.random.default_rng(RANDOM_STATE)
    time_index = pd.date_range("2025-01-01", periods=rows, freq="10min")
    hour = time_index.hour.to_numpy()
    seasonal = np.sin(np.linspace(0, 10 * np.pi, rows))

    windspeed = np.clip(7 + 2.8 * seasonal + rng.normal(0, 1.4, rows), 0, None)
    windgust = windspeed + np.clip(rng.normal(2.2, 1.0, rows), 0, None)
    temperature = 18 + 7 * np.sin(2 * np.pi * hour / 24) + rng.normal(0, 1.8, rows)
    relativehu = np.clip(65 - 0.9 * temperature + rng.normal(15, 7, rows), 18, 100)
    dewpoint = temperature - ((100 - relativehu) / 5) + rng.normal(0, 0.8, rows)
    winddirec = np.mod(190 + 70 * seasonal + rng.normal(0, 35, rows), 360)

    rated_power = 2200
    cut_in = 3.0
    rated_speed = 14.0
    power_curve = np.where(
        windspeed < cut_in,
        0,
        rated_power * ((np.minimum(windspeed, rated_speed) - cut_in) / (rated_speed - cut_in)) ** 3,
    )
    power = np.clip(power_curve + rng.normal(0, 85, rows), 0, rated_power)

    df = pd.DataFrame(
        {
            "Time": time_index,
            "temperature": temperature.round(2),
            "relativehu": relativehu.round(2),
            "dewpoint": dewpoint.round(2),
            "windspeed": windspeed.round(2),
            "winddirec": winddirec.round(2),
            "windgust": windgust.round(2),
            "Power": power.round(2),
        }
    )
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)
    return df


def load_dataset(path: Optional[str] = None, create_sample: bool = True) -> pd.DataFrame:
    dataset_path = find_dataset(path)
    if dataset_path is None:
        if not create_sample:
            raise FileNotFoundError("No CSV dataset found in data/. Add a Kaggle wind dataset first.")
        dataset_path = DATA_DIR / "sample_wind_power.csv"
        return generate_sample_data(output_path=dataset_path)
    return pd.read_csv(dataset_path)


def detect_time_column(df: pd.DataFrame) -> Optional[str]:
    for column in TIME_CANDIDATES:
        if column in df.columns:
            return column
    return None


def validate_columns(df: pd.DataFrame) -> None:
    missing = [column for column in REQUIRED_COLUMNS if column not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(missing)}")


def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    validate_columns(df)
    cleaned = df.copy()
    cleaned = cleaned.drop_duplicates()

    time_column = detect_time_column(cleaned)
    if time_column:
        cleaned[time_column] = pd.to_datetime(cleaned[time_column], errors="coerce")
        cleaned = cleaned.rename(columns={time_column: "Time"})
    else:
        cleaned["Time"] = pd.date_range("2025-01-01", periods=len(cleaned), freq="10min")

    cleaned = cleaned.dropna(subset=["Time"]).sort_values("Time").reset_index(drop=True)

    numeric_columns = [column for column in REQUIRED_COLUMNS if column in cleaned.columns]
    for column in numeric_columns:
        cleaned[column] = pd.to_numeric(cleaned[column], errors="coerce")

    imputer = SimpleImputer(strategy="median")
    cleaned[numeric_columns] = imputer.fit_transform(cleaned[numeric_columns])
    cleaned["hour"] = cleaned["Time"].dt.hour
    cleaned["day"] = cleaned["Time"].dt.day
    cleaned["month"] = cleaned["Time"].dt.month
    cleaned["Power"] = cleaned["Power"].clip(lower=0)
    return cleaned


def create_sequences(values: np.ndarray, target_index: int, lookback: int = 24) -> Tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    for i in range(lookback, len(values)):
        X.append(values[i - lookback : i])
        y.append(values[i, target_index])
    return np.asarray(X), np.asarray(y)


def prepare_data(df: pd.DataFrame, test_size: float = 0.2, lookback: int = 24) -> PreparedData:
    processed = preprocess_dataframe(df)
    X = processed[FEATURE_COLUMNS]
    y = processed[TARGET_COLUMN]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=RANDOM_STATE, shuffle=False
    )

    lstm_columns = FEATURE_COLUMNS + [TARGET_COLUMN]
    scaler = MinMaxScaler()
    scaled_values = scaler.fit_transform(processed[lstm_columns])
    sequences, sequence_targets = create_sequences(scaled_values, target_index=len(lstm_columns) - 1, lookback=lookback)

    if len(sequences) > 0:
        split_idx = max(1, int(len(sequences) * (1 - test_size)))
        lstm_train, lstm_test = sequences[:split_idx], sequences[split_idx:]
        lstm_y_train, lstm_y_test = sequence_targets[:split_idx], sequence_targets[split_idx:]
    else:
        lstm_train = lstm_test = lstm_y_train = lstm_y_test = None

    return PreparedData(processed, X_train, X_test, y_train, y_test, lstm_train, lstm_test, lstm_y_train, lstm_y_test, scaler)


def build_ml_pipeline(model) -> Pipeline:
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", model),
        ]
    )


def calculate_metrics(y_true: Iterable[float], y_pred: Iterable[float]) -> Dict[str, float]:
    y_true_arr = np.asarray(y_true, dtype=float)
    y_pred_arr = np.asarray(y_pred, dtype=float)
    mae = mean_absolute_error(y_true_arr, y_pred_arr)
    rmse = math.sqrt(mean_squared_error(y_true_arr, y_pred_arr))
    r2 = r2_score(y_true_arr, y_pred_arr)
    denominator = np.where(y_true_arr == 0, 1, y_true_arr)
    mape = np.mean(np.abs((y_true_arr - y_pred_arr) / denominator)) * 100
    return {"MAE": mae, "RMSE": rmse, "R2": r2, "MAPE": mape}


def inverse_lstm_predictions(scaler: MinMaxScaler, scaled_predictions: np.ndarray) -> np.ndarray:
    power_min = scaler.data_min_[-1]
    power_max = scaler.data_max_[-1]
    return scaled_predictions.reshape(-1) * (power_max - power_min) + power_min


def save_joblib(obj, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(obj, path)


def load_joblib(path: Path):
    return joblib.load(path)


def get_latest_model_path() -> Optional[Path]:
    preferred = MODELS_DIR / "best_model.joblib"
    if preferred.exists():
        return preferred
    candidates = sorted(MODELS_DIR.glob("*.joblib"))
    return candidates[0] if candidates else None


def predict_power(model, weather: Dict[str, float], timestamp: Optional[pd.Timestamp] = None) -> float:
    ts = timestamp or pd.Timestamp.now()
    row = pd.DataFrame(
        [
            {
                "temperature": weather["temperature"],
                "relativehu": weather["relativehu"],
                "dewpoint": weather["dewpoint"],
                "windspeed": weather["windspeed"],
                "winddirec": weather["winddirec"],
                "windgust": weather["windgust"],
                "hour": ts.hour,
                "day": ts.day,
                "month": ts.month,
            }
        ]
    )
    return float(np.maximum(model.predict(row)[0], 0))


def simulate_weather_stream(last_row: pd.Series, steps: int = 24, freq: str = "1h") -> pd.DataFrame:
    rng = np.random.default_rng()
    start = pd.Timestamp(last_row.get("Time", pd.Timestamp.now()))
    future_time = pd.date_range(start + pd.Timedelta(freq), periods=steps, freq=freq)
    stream = []
    base_speed = float(last_row["windspeed"])
    base_temp = float(last_row["temperature"])
    for index, ts in enumerate(future_time):
        windspeed = max(0, base_speed + np.sin(index / 3) * 1.3 + rng.normal(0, 0.45))
        windgust = max(windspeed, windspeed + rng.normal(1.8, 0.55))
        temperature = base_temp + np.sin(index / 6) * 2 + rng.normal(0, 0.4)
        relativehu = np.clip(float(last_row["relativehu"]) + rng.normal(0, 3), 20, 100)
        dewpoint = temperature - ((100 - relativehu) / 5)
        stream.append(
            {
                "Time": ts,
                "temperature": temperature,
                "relativehu": relativehu,
                "dewpoint": dewpoint,
                "windspeed": windspeed,
                "winddirec": np.mod(float(last_row["winddirec"]) + rng.normal(0, 14), 360),
                "windgust": windgust,
                "hour": ts.hour,
                "day": ts.day,
                "month": ts.month,
            }
        )
    return pd.DataFrame(stream)


def forecast_horizon(model, last_row: pd.Series, horizon_hours: int) -> pd.DataFrame:
    future = simulate_weather_stream(last_row, steps=horizon_hours, freq="1h")
    future["Predicted_Power"] = np.maximum(model.predict(future[FEATURE_COLUMNS]), 0)
    return future


def turbine_efficiency(power: float, rated_power: float = 2200.0) -> float:
    return float(np.clip((power / rated_power) * 100, 0, 100))


def low_power_alert(power: float, threshold: float = 250.0) -> str:
    return "Low power alert" if power < threshold else "Normal generation"


def make_eda_figures(df: pd.DataFrame) -> Dict[str, go.Figure]:
    figures = {
        "wind_power": px.scatter(df, x="windspeed", y="Power", trendline="ols", title="Wind Speed vs Power"),
        "temperature_power": px.scatter(df, x="temperature", y="Power", trendline="ols", title="Temperature vs Power"),
        "correlation": px.imshow(
            df[FEATURE_COLUMNS + ["Power"]].corr(),
            text_auto=".2f",
            color_continuous_scale="RdBu_r",
            title="Feature Correlation Heatmap",
        ),
        "power_trend": px.line(df, x="Time", y="Power", title="Power Trend Over Time"),
        "histograms": make_histogram_grid(df),
        "pair_plot": px.scatter_matrix(
            df[["temperature", "relativehu", "windspeed", "windgust", "Power"]],
            dimensions=["temperature", "relativehu", "windspeed", "windgust", "Power"],
            title="Pair Plot Matrix",
        ),
    }
    for fig in figures.values():
        fig.update_layout(template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    return figures


def make_histogram_grid(df: pd.DataFrame) -> go.Figure:
    columns = ["temperature", "relativehu", "dewpoint", "windspeed", "windgust", "Power"]
    fig = make_subplots(rows=2, cols=3, subplot_titles=columns)
    for idx, column in enumerate(columns):
        fig.add_trace(go.Histogram(x=df[column], name=column, marker_color="#2dd4bf"), row=(idx // 3) + 1, col=(idx % 3) + 1)
    fig.update_layout(title="Feature Distributions", showlegend=False, template="plotly_dark")
    return fig


def model_comparison_figure(metrics_df: pd.DataFrame) -> go.Figure:
    display = metrics_df.copy()
    fig = px.bar(display, x="Model", y=["MAE", "RMSE", "MAPE"], barmode="group", title="Model Error Comparison")
    fig.update_layout(template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    return fig


def save_metrics_report(metrics_df: pd.DataFrame, path: Path = REPORTS_DIR / "model_metrics.csv") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    metrics_df.to_csv(path, index=False)
