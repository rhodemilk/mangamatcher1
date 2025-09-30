# 🌸 MangaMatcher

A React + Flask application that helps you discover manga based on your preferences through an interactive quiz.

## ✨ Features

- **Interactive Quiz**: Answer questions about your manga preferences (genres, demographics, eras, mood)
- **Smart Recommendations**: Using Machine Learning from scratch the recommendation system recommends you mangas and links them to amazon using ISBN.
- **Character Chats**: Once you've selected your picks, you can chat to the character to know a little more about their respective story (used gemini api).
- **Manga Database**: Scraped from Google Books and Anilist. Curated collection of popular manga with detailed information.

## 🚀 Quick Start

> **📖 For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

### Prerequisites

- Python 3.8+ (Python 3.13+ recommended)
- Node.js 16+ (see installation instructions below)
- Git

### Quick Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rhodemilk/mangamatcher1.git
   cd mangamatcher1
   ```

2. **Setup backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install --upgrade pip
   pip install -r requirements.txt
   cd ..
   ```

3. **Install Node.js:**
   ```bash
   ./install_nodejs.sh
   ```

4. **Setup frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Start the application:**
   ```bash
   ./start.sh
   ```

6. **Verify your setup (optional):**
   ```bash
   ./verify_setup.sh
   ```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 🏗️ Project Structure

```
mangamatcher1/
├── backend/
│   ├── app.py              # Flask API server
│   ├── load_dataset.py     # Data loading utilities
│   ├── manga_with_amazon_links.csv  # Manga database
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── Quiz.js        # Quiz component
│   │   └── Recommendations.js  # Results component
│   └── package.json       # Node.js dependencies
├── start.sh               # Startup script
├── status.sh              # Status check script
├── verify_setup.sh        # Setup verification script
├── install_nodejs.sh      # Node.js installation helper
├── use_node.sh            # Node.js wrapper script
├── SETUP_GUIDE.md         # Comprehensive setup instructions
└── README.md              # This file
```

## 🔧 API Endpoints

- `GET /health` - Health check
- `GET /api/quiz/options` - Get available quiz options
- `POST /api/quiz/recommend` - Get manga recommendations
- `GET /api/manga` - Get all manga data

## 🎯 How It Works

1. **Quiz**: Users answer questions about their preferences
2. **Feature Extraction**: User preferences are converted to text features
3. **Similarity Matching**: TF-IDF vectorization finds similar manga
4. **Recommendations**: Top 10 most similar manga are returned
5. **Interactive UI**: Users can like/pass through recommendations

## 🛠️ Development

### Backend (Flask)
- Uses SQLite database for simplicity
- TF-IDF + cosine similarity for recommendations
- CORS enabled for frontend communication

### Frontend (React)
- Modern React with hooks
- Responsive design with CSS
- Proxy configuration for API calls

## 📝 Notes

- **Local Development Only**: This setup is designed for local development and testing
- Database is automatically created on first run
- All manga data is loaded from CSV file
- No authentication required (simple demo app)
- Uses port 8000 for backend, 3000 for frontend
- Docker files have been removed for simplicity

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 8000 is available
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

**Flask-SQLAlchemy import errors:**
- Make sure you're using Python 3.8+ (Python 3.13+ recommended)
- Try: `pip install --upgrade pip`
- Then: `pip install -r requirements.txt --force-reinstall`
- If still having issues, try: `pip install Flask-SQLAlchemy==3.1.1`

**Frontend won't start:**
- Ensure Node.js is installed: `node --version`
- Run `npm install` in frontend directory
- Check if port 3000 is available

**No recommendations:**
- Check backend logs for errors
- Ensure manga data is loaded (check database)
- Verify API endpoints are responding

**Common Python/Flask issues:**
- If you get "No module named 'flask_sqlalchemy'": Run `pip install Flask-SQLAlchemy`
- If you get version conflicts: Try `pip install --upgrade -r requirements.txt`
- If using Python 3.13+: Some packages might need latest versions

## 📄 License

MIT License - feel free to use and modify!
