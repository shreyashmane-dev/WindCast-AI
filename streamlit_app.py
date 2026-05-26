"""Streamlit dashboard for WindCast AI."""

from __future__ import annotations

import time
from io import StringIO

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from sklearn.ensemble import RandomForestRegressor

from utils import (
    FEATURE_COLUMNS,
    MODELS_DIR,
    REPORTS_DIR,
    build_ml_pipeline,
    forecast_horizon,
    get_latest_model_path,
    load_dataset,
    load_joblib,
    low_power_alert,
    make_eda_figures,
    model_comparison_figure,
    predict_power,
    prepare_data,
    turbine_efficiency,
)


st.set_page_config(page_title="WindCast AI", page_icon="⚡", layout="wide")

CUSTOM_CSS = """
<style>
:root {
  --glass: rgba(255, 255, 255, 0.08);
  --line: rgba(255, 255, 255, 0.16);
  --cyan: #22d3ee;
  --green: #34d399;
  --amber: #fbbf24;
}
.stApp {
  background:
    radial-gradient(circle at 8% 8%, rgba(34, 211, 238, 0.18), transparent 28%),
    radial-gradient(circle at 86% 18%, rgba(52, 211, 153, 0.14), transparent 26%),
    linear-gradient(135deg, #071014 0%, #0d1822 45%, #10131d 100%);
  color: #eef7f8;
}
[data-testid="stSidebar"] {
  background: rgba(3, 10, 15, 0.72);
  border-right: 1px solid var(--line);
}
.block-container { padding-top: 1.2rem; }
.hero {
  padding: 1.2rem 1.4rem;
  border: 1px solid var(--line);
  background: linear-gradient(135deg, rgba(34,211,238,.13), rgba(52,211,153,.07));
  border-radius: 8px;
  backdrop-filter: blur(18px);
  margin-bottom: 1rem;
}
.hero h1 { font-size: 2rem; margin: 0; letter-spacing: 0; }
.hero p { margin: .35rem 0 0; color: #bde4e4; }
.kpi-card {
  border: 1px solid var(--line);
  background: var(--glass);
  border-radius: 8px;
  padding: 1rem;
  min-height: 112px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  transition: transform .2s ease, border-color .2s ease;
}
.kpi-card:hover { transform: translateY(-2px); border-color: rgba(34,211,238,.42); }
.kpi-label { color: #a9c7ca; font-size: .86rem; }
.kpi-value { color: #ffffff; font-size: 1.6rem; font-weight: 750; margin-top: .25rem; }
.kpi-sub { color: #72f2c5; font-size: .82rem; margin-top: .25rem; }
.glass-panel {
  border: 1px solid var(--line);
  background: var(--glass);
  border-radius: 8px;
  padding: 1rem;
  backdrop-filter: blur(14px);
}
.stButton button, .stDownloadButton button {
  border-radius: 8px;
  border: 1px solid rgba(34,211,238,.38);
  background: linear-gradient(135deg, rgba(34,211,238,.26), rgba(52,211,153,.20));
  color: white;
}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


@st.cache_data(show_spinner=False)
def cached_data():
    return prepare_data(load_dataset())


@st.cache_resource(show_spinner=False)
def cached_model():
    model_path = get_latest_model_path()
    if model_path and model_path.exists():
        return load_joblib(model_path), model_path.name
    data = cached_data()
    model = build_ml_pipeline(RandomForestRegressor(n_estimators=120, random_state=42, n_jobs=-1))
    model.fit(data.X_train, data.y_train)
    return model, "temporary_random_forest"


def kpi_card(label: str, value: str, subtext: str) -> None:
    st.markdown(
        f"""
        <div class="kpi-card">
          <div class="kpi-label">{label}</div>
          <div class="kpi-value">{value}</div>
          <div class="kpi-sub">{subtext}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def prediction_report(weather: dict, prediction: float, forecasts: dict[str, pd.DataFrame]) -> str:
    buffer = StringIO()
    buffer.write("WindCast AI Prediction Report\n")
    buffer.write("=============================\n\n")
    buffer.write(f"Predicted current power: {prediction:.2f} kW\n")
    buffer.write(f"Turbine efficiency: {turbine_efficiency(prediction):.2f}%\n")
    buffer.write(f"Alert status: {low_power_alert(prediction)}\n\n")
    buffer.write("Input Weather\n")
    for key, value in weather.items():
        buffer.write(f"- {key}: {value}\n")
    buffer.write("\nForecast Summary\n")
    for name, frame in forecasts.items():
        buffer.write(f"- {name}: average {frame['Predicted_Power'].mean():.2f} kW, peak {frame['Predicted_Power'].max():.2f} kW\n")
    return buffer.getvalue()


data = cached_data()
model, model_name = cached_model()
df = data.frame

st.sidebar.title("WindCast AI")
page = st.sidebar.radio(
    "Navigation",
    ["Overview", "Real-Time Prediction", "Forecast Horizons", "Analytics", "Model Comparison", "Reports"],
)
st.sidebar.caption(f"Active model: {model_name}")
st.sidebar.caption("Dataset columns: temperature, relativehu, dewpoint, windspeed, winddirec, windgust, Power")

st.markdown(
    """
    <div class="hero">
      <h1>WindCast AI - Short-Term Wind Power Forecasting</h1>
      <p>Real-time renewable energy forecasting with machine learning, live weather simulation, and turbine efficiency intelligence.</p>
    </div>
    """,
    unsafe_allow_html=True,
)

latest = df.iloc[-1]
default_weather = {
    "temperature": float(latest["temperature"]),
    "relativehu": float(latest["relativehu"]),
    "dewpoint": float(latest["dewpoint"]),
    "windspeed": float(latest["windspeed"]),
    "winddirec": float(latest["winddirec"]),
    "windgust": float(latest["windgust"]),
}
current_prediction = predict_power(model, default_weather)

if page == "Overview":
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        kpi_card("Predicted Power", f"{current_prediction:,.0f} kW", "Latest weather snapshot")
    with col2:
        kpi_card("Efficiency", f"{turbine_efficiency(current_prediction):.1f}%", "Rated capacity baseline")
    with col3:
        kpi_card("Wind Speed", f"{latest['windspeed']:.1f} m/s", "Primary power driver")
    with col4:
        kpi_card("Status", low_power_alert(current_prediction), "Operational alert")

    left, right = st.columns([1.35, 1])
    with left:
        fig = px.line(df.tail(180), x="Time", y="Power", title="Recent Historical Power Trend")
        fig.update_layout(template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig, use_container_width=True)
    with right:
        scatter = px.scatter(df.tail(400), x="windspeed", y="Power", color="windgust", title="Wind-to-Power Response")
        scatter.update_layout(template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(scatter, use_container_width=True)

elif page == "Real-Time Prediction":
    st.subheader("Weather Input Console")
    c1, c2, c3 = st.columns(3)
    with c1:
        temperature = st.number_input("temperature", value=default_weather["temperature"], step=0.5)
        windspeed = st.number_input("windspeed", value=default_weather["windspeed"], min_value=0.0, step=0.2)
    with c2:
        relativehu = st.number_input("relativehu", value=default_weather["relativehu"], min_value=0.0, max_value=100.0, step=1.0)
        winddirec = st.number_input("winddirec", value=default_weather["winddirec"], min_value=0.0, max_value=360.0, step=2.0)
    with c3:
        dewpoint = st.number_input("dewpoint", value=default_weather["dewpoint"], step=0.5)
        windgust = st.number_input("windgust", value=default_weather["windgust"], min_value=0.0, step=0.2)

    weather = {
        "temperature": temperature,
        "relativehu": relativehu,
        "dewpoint": dewpoint,
        "windspeed": windspeed,
        "winddirec": winddirec,
        "windgust": windgust,
    }
    prediction = predict_power(model, weather)
    col1, col2, col3 = st.columns(3)
    with col1:
        kpi_card("Live Prediction", f"{prediction:,.0f} kW", "Model output")
    with col2:
        kpi_card("Efficiency", f"{turbine_efficiency(prediction):.1f}%", "Turbine insight")
    with col3:
        kpi_card("Alert", low_power_alert(prediction), "Low power threshold")

    simulate = st.toggle("Run live weather simulation", value=False)
    chart_area = st.empty()
    if simulate:
        live_rows = []
        progress = st.progress(0)
        for step in range(24):
            noise_weather = {key: float(value) for key, value in weather.items()}
            noise_weather["windspeed"] = max(0, noise_weather["windspeed"] + np.random.normal(0, 0.35))
            noise_weather["windgust"] = max(noise_weather["windspeed"], noise_weather["windgust"] + np.random.normal(0, 0.45))
            live_rows.append({"Step": step + 1, "Predicted_Power": predict_power(model, noise_weather)})
            live_fig = px.line(pd.DataFrame(live_rows), x="Step", y="Predicted_Power", markers=True, title="Live Streaming Prediction")
            live_fig.update_layout(template="plotly_dark", yaxis_title="Power (kW)")
            chart_area.plotly_chart(live_fig, use_container_width=True)
            progress.progress((step + 1) / 24)
            time.sleep(0.35)

elif page == "Forecast Horizons":
    horizons = {"Next 1 Hour": 1, "Next 6 Hours": 6, "Next 24 Hours": 24}
    forecasts = {name: forecast_horizon(model, latest, hours) for name, hours in horizons.items()}
    cols = st.columns(3)
    for col, (name, frame) in zip(cols, forecasts.items()):
        with col:
            kpi_card(name, f"{frame['Predicted_Power'].mean():,.0f} kW", f"Peak {frame['Predicted_Power'].max():,.0f} kW")

    selected = st.segmented_control("Forecast view", list(forecasts.keys()), default="Next 6 Hours")
    fig = px.area(forecasts[selected], x="Time", y="Predicted_Power", title=f"{selected} Power Forecast")
    fig.update_layout(template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(fig, use_container_width=True)

elif page == "Analytics":
    figures = make_eda_figures(df)
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs(
        ["Wind Speed", "Temperature", "Correlation", "Trend", "Distributions", "Pair Matrix"]
    )
    with tab1:
        st.plotly_chart(figures["wind_power"], use_container_width=True)
    with tab2:
        st.plotly_chart(figures["temperature_power"], use_container_width=True)
    with tab3:
        st.plotly_chart(figures["correlation"], use_container_width=True)
    with tab4:
        st.plotly_chart(figures["power_trend"], use_container_width=True)
    with tab5:
        st.plotly_chart(figures["histograms"], use_container_width=True)
    with tab6:
        st.plotly_chart(figures["pair_plot"], use_container_width=True)

elif page == "Model Comparison":
    metrics_path = REPORTS_DIR / "model_metrics.csv"
    if metrics_path.exists():
        metrics = pd.read_csv(metrics_path)
        st.dataframe(metrics, use_container_width=True)
        st.plotly_chart(model_comparison_figure(metrics), use_container_width=True)
        best = metrics.sort_values("RMSE").iloc[0]
        kpi_card("Best Model", str(best["Model"]), f"RMSE {best['RMSE']:.2f} | R2 {best['R2']:.3f}")
    else:
        st.info("Run `python train.py` to generate the model comparison report.")

elif page == "Reports":
    forecasts = {
        "Next 1 Hour": forecast_horizon(model, latest, 1),
        "Next 6 Hours": forecast_horizon(model, latest, 6),
        "Next 24 Hours": forecast_horizon(model, latest, 24),
    }
    report = prediction_report(default_weather, current_prediction, forecasts)
    st.text_area("Prediction report preview", report, height=360)
    st.download_button("Download prediction report", report, file_name="windcast_prediction_report.txt")
    st.write("Deployment targets: Streamlit Cloud, Render, and Hugging Face Spaces are prepared in the project files.")
