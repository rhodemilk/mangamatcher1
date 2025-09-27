Quick start (local dev)

1) Backend (SQLite fallback — no Docker required)

Open PowerShell in the repo root and run:

    .\scripts\start-backend.ps1

This creates a virtualenv, installs Python deps from `backend/requirements.txt`, sets `DATABASE_URL` to a local sqlite file, and runs the Flask app on http://localhost:5000.

2) Frontend (React dev server)

Open a second PowerShell window and run:

    .\scripts\start-frontend.ps1

This installs frontend deps if needed and runs the React dev server on http://localhost:3000. The frontend `package.json` proxy points to http://localhost:5000 so API calls will reach the local backend.

Docker notes

- `docker compose up -d` will now build and run `postgres`, `backend`, and `frontend` (production build) services. If you prefer local dev, run the scripts above instead.
- If Docker builds fail (resource or I/O errors), use the local scripts for development.
