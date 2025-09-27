# 🌸 MangaMatcher - ShellHacks 2026

> A Flask/React/PostgreSQL web application for manga enthusiasts to discover, rate, and match their preferences.

## 👥 Team

**Group Leaders:** Rhode & Gabi  
**Prince:** Ethan "the rod" Rodriguez  
**Heathen:** Alexander da loser  

---

## 🚀 Project Overview

MangaMatcher is a full-stack web application designed for hackathon development. It features:

- **Backend:** Flask API with PostgreSQL database
- **Frontend:** React application with modern UI
- **Database:** PostgreSQL with Docker Compose setup
- **Development:** Hot reload, API integration, and development tools

---

## 📁 Project Structure

```
mangamatcher1/
├── backend/
│   ├── app.py              # Flask API with recommendation logic
│   ├── Dockerfile          # Backend Docker image definition
│   ├── entrypoint.sh       # Wait for DB + seed dataset
│   ├── load_dataset.py     # CSV loader used by entrypoint
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── Dockerfile          # Multi-stage build serving React via Nginx
│   └── src/
│       └── App.js          # React quiz + recommendations UI
├── docker-compose.yml      # One-command stack (DB, API, UI)
├── init.sql                # Initial DB schema/data executed by Postgres
└── README.md               # This file
```

---

## 🛠️ Quick Start Guide

### Prerequisites

- Docker Desktop (or Docker Engine + Compose Plugin)
- Git

### One-Command Dev Environment

```bash
git clone https://github.com/rhodemilk/mangamatcher1.git
cd mangamatcher1

# Build and start database, backend API, and frontend UI
docker compose up --build
```

Open `http://localhost:3000` for the React UI, which talks to the Flask API running at `http://localhost:5000`. Postgres is exposed on `localhost:5432` (user `postgres`, password `password`).

The backend container waits for Postgres, creates tables, and seeds the `manga` dataset automatically on first run.

To stop everything:

```bash
docker compose down
```

To reset the database volume as well:

```bash
docker compose down -v
docker compose up --build
```

---

## 🎯 API Endpoints

The Flask backend provides the following REST API endpoints:

### General
- `GET /` - API welcome message
- `GET /health` - Health check

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
  ```json
  {
    "username": "otaku_user",
    "email": "user@example.com"
  }
  ```

### Manga
- `GET /api/manga` - List all manga
- `POST /api/manga` - Add new manga
  ```json
  {
    "title": "Attack on Titan",
    "author": "Hajime Isayama",
    "genre": "Action",
    "rating": 9.5
  }
  ```

---

## 🔧 Development Commands

If you prefer running services locally without Docker:

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:password@localhost:5432/mangamatcher
python app.py

# Frontend
cd frontend
npm install
npm start
```

You can still use `docker compose up postgres` to run only the database locally.

---

## 🚀 Deployment Notes

For hackathon presentation/deployment:

1. **Environment Variables:**
   - Set `DATABASE_URL` for production database
   - Set `REACT_APP_API_URL` for production API
   - Set `FLASK_ENV=production`

2. **Database Migration:**
   - The app auto-creates tables on first run
   - For production, consider using Flask-Migrate

3. **Frontend Build:**
   - Run `npm run build` to create production build
   - Serve static files with your preferred method

---

## 🛠️ Tech Stack

### Backend
- **Flask 2.3.3** - Web framework
- **SQLAlchemy 2.0.21** - ORM
- **PostgreSQL 15** - Database
- **Flask-CORS** - Cross-origin requests
- **python-dotenv** - Environment variables

### Frontend
- **React 18+** - UI library
- **JavaScript/JSX** - Programming language
- **Fetch API** - HTTP requests
- **CSS3** - Styling

### Development
- **Docker Compose** - Database containerization
- **pgAdmin 4** - Database administration
- **Hot Reload** - Development efficiency

---

## 🎮 Features Implemented

✅ **Flask Backend API**
- User management (CRUD)
- Manga catalog (CRUD)
- PostgreSQL integration
- CORS enabled
- Error handling
- Health checks

✅ **React Frontend**
- User interface forms
- API integration
- Real-time data updates
- Error handling
- Responsive design
- Loading states

✅ **Database Setup**
- PostgreSQL with Docker
- Auto table creation
- Development admin panel
- Data persistence

---

## 🎯 Next Steps for Hackathon

### Core Features to Add
1. **User Authentication** - Login/signup system
2. **Manga Recommendations** - Matching algorithm based on preferences
3. **Rating System** - User reviews and ratings
4. **Search & Filter** - Find manga by genre, author, rating
5. **User Profiles** - Personal manga lists and preferences

### Advanced Features
1. **Social Features** - Follow users, share recommendations
2. **API Integration** - External manga databases (MyAnimeList, etc.)
3. **Image Upload** - Manga cover images
4. **Real-time Updates** - WebSocket for live recommendations
5. **Mobile Responsive** - PWA capabilities

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Ensure PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres
```

**CORS Issues:**
- Ensure Flask-CORS is installed and configured
- Check API URL in React .env file

**Module Not Found:**
```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

**Port Already in Use:**
- Backend: Change PORT in .env or kill process on port 5000
- Frontend: React will prompt to use different port
- Database: Change port mapping in docker-compose.yml

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **ShellHacks 2026** for the amazing hackathon experience
- **Flask & React** communities for excellent documentation
- **PostgreSQL** for reliable database solutions
- **Docker** for simplified development environment

---

**Happy Hacking! 🚀**

*Built with ❤️ by the MangaMatcher team*
