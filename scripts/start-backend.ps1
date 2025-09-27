# PowerShell script to create venv, install deps, and run Flask backend (SQLite fallback)
param(
    [string]$venvPath = ".venv",
    [string]$dbPath = "mangamatcher_local.db"
)

if (-not (Test-Path $venvPath)) {
    python -m venv $venvPath
}

# Activate venv for this session
& "$venvPath\Scripts\Activate.ps1"

python -m pip install --upgrade pip
pip install -r backend\requirements.txt

# Set DATABASE_URL to sqlite file so the app runs without Postgres
$env:DATABASE_URL = "sqlite:///$PSScriptRoot\$dbPath"
$env:FLASK_ENV = "development"

cd backend
python app.py
