"""
Atmospheric telemetry simulator service.
Generates smooth random walk drifts for weather parameters to stream over WebSockets.
"""

import random
from typing import Dict, Any

class WeatherTelemetrySimulator:
  def __init__(self):
    # Establish baseline weather coordinates
    self.temperature = 20.25
    self.relativehu = 51.36
    self.dewpoint = 10.70
    self.windspeed = 7.43
    self.winddirec = 222.76
    self.windgust = 9.06

  def tick(self) -> Dict[str, float]:
    """
    Simulates a time tick (adding smooth Gaussian drift to meteorological metrics).
    """
    # Smooth random walks
    wind_drift = random.normalvariate(0, 0.22)
    temp_drift = random.normalvariate(0, 0.08)
    humid_drift = random.normalvariate(0, 0.6)

    # Walk parameters within strict physical bounds
    self.windspeed = max(1.5, min(28.0, self.windspeed + wind_drift))
    self.windgust = max(self.windspeed, min(35.0, self.windspeed + max(0.5, 1.8 + random.normalvariate(0, 0.2))))
    self.temperature = max(-5.0, min(45.0, self.temperature + temp_drift))
    self.relativehu = max(15.0, min(100.0, self.relativehu + humid_drift))
    
    # Recalculate dewpoint in line with new humidity
    self.dewpoint = self.temperature - (100.0 - self.relativehu) / 5.0
    self.winddirec = (self.winddirec + random.normalvariate(0, 2.0) + 360.0) % 360.0

    return {
        "temperature": round(self.temperature, 2),
        "relativehu": round(self.relativehu, 2),
        "dewpoint": round(self.dewpoint, 2),
        "windspeed": round(self.windspeed, 2),
        "winddirec": round(self.winddirec, 2),
        "windgust": round(self.windgust, 2)
    }

weather_simulator = WeatherTelemetrySimulator()
