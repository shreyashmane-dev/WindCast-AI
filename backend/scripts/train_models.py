from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))

from app.ml.training import train_all_models  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Train WindCast AI backend models.")
    parser.add_argument("--data", default=str(ROOT / "data" / "wind.csv"), help="Path to CSV with WindCast columns.")
    parser.add_argument("--out", default=str(ROOT / "backend" / "trained_models"), help="Model output directory.")
    parser.add_argument("--epochs", type=int, default=3, help="LSTM epochs.")
    parser.add_argument("--lookback", type=int, default=24, help="LSTM lookback windows.")
    args = parser.parse_args()
    metrics = train_all_models(Path(args.data), Path(args.out), epochs=args.epochs, lookback=args.lookback)
    print(metrics.to_string(index=False))


if __name__ == "__main__":
    main()
