from __future__ import annotations

from io import BytesIO


def test_batch_prediction(client):
    csv_data = (
        "temperature,relativehu,dewpoint,windspeed,winddirec,windgust\n"
        "25,70,21,8,180,11\n"
        "29,66,23,10,210,14\n"
    )
    response = client.post(
        "/api/v1/predict/batch",
        files={"file": ("weather.csv", BytesIO(csv_data.encode("utf-8")), "text/csv")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 2
    assert len(body["predictions"]) == 2
