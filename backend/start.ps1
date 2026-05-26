$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
python -m uvicorn --app-dir backend app.main:app --reload --host 127.0.0.1 --port 8010
