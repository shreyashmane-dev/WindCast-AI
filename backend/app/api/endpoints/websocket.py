"""
Asynchronous WebSocket real-time telemetry streaming router.
"""

import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.simulation import weather_simulator
from app.ml.service import ml_service

router = APIRouter()

@router.websocket("")
async def websocket_forecast_stream(websocket: WebSocket):
  """
  Establishes a bi-directional WebSocket connection.
  Pushes weather fluctuations and ML forecasts every 2 seconds.
  Listens for 'ping' heartbeats or JSON configs to switch the active model on the fly.
  """
  await websocket.accept()
  print("WebSocket Connection Synced: client dispatch online.")

  active_model = "Random Forest"

  try:
    while True:
      # 1. Non-blocking receiver check
      # Wait briefly (0.05 seconds) to see if client sent any packets
      try:
        client_msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.05)
        
        # Respond to heartbeat pings to keep cloud proxies open
        if client_msg == "ping":
          await websocket.send_text("pong")
        else:
          try:
            payload = json.loads(client_msg)
            if "model" in payload:
              active_model = payload["model"]
              print(f"WS Telemetry Core: active model overridden to '{active_model}'")
          except Exception:
            pass
      except asyncio.TimeoutError:
        # No incoming messages in this check cycle, continue to broadcast
        pass

      # 2. Generate smooth meteorological telemetry sensor walk
      weather = weather_simulator.tick()

      # 3. Run selected ML forecast
      prediction = ml_service.predict(active_model, weather)

      # 4. Compile structured broadcast packet matching Next.js parameters
      broadcast_payload = {
          "temperature": weather["temperature"],
          "relativehu": weather["relativehu"],
          "dewpoint": weather["dewpoint"],
          "windspeed": weather["windspeed"],
          "winddirec": weather["winddirec"],
          "windgust": weather["windgust"],
          "predicted_power": prediction["predicted_power"],
          "efficiency": prediction["efficiency"],
          "alert_status": prediction["alert_status"],
          "confidence_score": prediction["confidence_score"],
          "model_used": prediction["model_used"]
      }

      # 5. Broadcast packet
      await websocket.send_json(broadcast_payload)

      # 6. Throttle loop to 2 seconds
      await asyncio.sleep(2.0)

  except WebSocketDisconnect:
    print("WebSocket Disconnect: client dispatch offline.")
  except Exception as err:
    print(f"WebSocket execution error: {err}")
    try:
      await websocket.close()
    except Exception:
      pass
