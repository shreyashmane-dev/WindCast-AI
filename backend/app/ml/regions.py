from __future__ import annotations

from typing import Any


REGION_METADATA = {
    "Location1": {
        "id": "mumbai_india",
        "display_name": "Mumbai, India",
        "city": "Mumbai",
        "country": "India",
        "timezone": "Asia/Kolkata",
        "aliases": ["mumbai", "india", "maharashtra", "location1"],
    },
    "Location2": {
        "id": "texas_usa",
        "display_name": "Texas, USA",
        "city": "Texas",
        "country": "USA",
        "timezone": "America/Chicago",
        "aliases": ["texas", "usa", "united states", "america", "location2"],
    },
    "Location3": {
        "id": "berlin_germany",
        "display_name": "Berlin, Germany",
        "city": "Berlin",
        "country": "Germany",
        "timezone": "Europe/Berlin",
        "aliases": ["berlin", "germany", "deutschland", "location3"],
    },
    "Location4": {
        "id": "tokyo_japan",
        "display_name": "Tokyo, Japan",
        "city": "Tokyo",
        "country": "Japan",
        "timezone": "Asia/Tokyo",
        "aliases": ["tokyo", "japan", "kanto", "location4"],
    },
}


def list_regions() -> list[dict[str, Any]]:
    return [
        {"model_location": key, **{k: v for k, v in value.items() if k != "aliases"}}
        for key, value in REGION_METADATA.items()
    ]


def resolve_model_location(value: str | None) -> str:
    if not value:
        return "Location1"

    normalized = str(value).strip().lower()
    if not normalized:
        return "Location1"

    for internal, metadata in REGION_METADATA.items():
        candidates = {
            internal.lower(),
            metadata["id"].lower(),
            metadata["display_name"].lower(),
            metadata["city"].lower(),
            metadata["country"].lower(),
            *[alias.lower() for alias in metadata["aliases"]],
        }
        if normalized in candidates:
            return internal
        if any(candidate in normalized for candidate in candidates if len(candidate) > 3):
            return internal
    return "Location1"


def display_region(value: str | None) -> str:
    internal = resolve_model_location(value)
    return REGION_METADATA[internal]["display_name"]
