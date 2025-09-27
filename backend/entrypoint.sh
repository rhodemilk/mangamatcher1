#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database at $DATABASE_URL..."
    python <<'PY'
import os
import time
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

url = os.environ.get("DATABASE_URL")
retries = int(os.environ.get("DB_CONNECT_RETRIES", "30"))
delay = float(os.environ.get("DB_CONNECT_DELAY", "1"))

if not url:
    raise SystemExit("DATABASE_URL not set")

engine = create_engine(url, pool_pre_ping=True)

for attempt in range(1, retries + 1):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        break
    except OperationalError as exc:
        if attempt == retries:
            raise SystemExit(f"Database connection failed after {retries} attempts: {exc}")
        time.sleep(delay)
else:
    raise SystemExit("Database connection loop exited without success")
PY

    echo "Database is ready. Ensuring dataset is loaded..."
    python load_dataset.py || true
fi

exec python app.py

