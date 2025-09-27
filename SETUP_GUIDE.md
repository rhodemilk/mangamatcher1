# 🚀 MangaMatcher Setup Guide for Teammates

## 📋 Prerequisites Check

Before starting, make sure you have:
- **Python 3.8+** (Python 3.13+ recommended)
- **Git** (to clone the repository)
- **Terminal/Command Prompt** access

## 🔧 Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone https://github.com/rhodemilk/mangamatcher1.git
cd mangamatcher1
```

### 2. Backend Setup (Python/Flask)

#### 2.1 Create Virtual Environment
```bash
cd backend
python -m venv venv
```

#### 2.2 Activate Virtual Environment
**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

#### 2.3 Install Python Dependencies
```bash
# Upgrade pip first
pip install --upgrade pip

# Install all requirements
pip install -r requirements.txt
```

**If you get Flask-SQLAlchemy errors:**
```bash
# Force reinstall if needed
pip install -r requirements.txt --force-reinstall

# Or install Flask-SQLAlchemy directly
pip install Flask-SQLAlchemy==3.1.1
```

#### 2.4 Test Backend
```bash
python app.py
```
You should see:
```
* Serving Flask app 'app'
* Debug mode: on
* Running on http://127.0.0.1:8000
```

**Press Ctrl+C to stop the server.**

### 3. Frontend Setup (Node.js/React)

#### 3.1 Install Node.js
**Option A: Use our helper script**
```bash
cd ..  # Go back to project root
./install_nodejs.sh
```

**Option B: Manual installation**
1. Go to https://nodejs.org
2. Download and install Node.js (LTS version recommended)
3. Restart your terminal

#### 3.2 Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### 3.3 Test Frontend
```bash
npm start
```
You should see:
```
> mangamatcher-frontend@1.0.0 start
> react-scripts start
Compiled successfully!
Local:            http://localhost:3000
```

**Press Ctrl+C to stop the server.**

### 4. Run the Complete Application

#### Option A: Use the Startup Script (Recommended)
```bash
cd ..  # Go back to project root
./start.sh
```

#### Option B: Manual Startup
**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

## 🛠️ Troubleshooting

### Backend Issues

**"No module named 'flask_sqlalchemy'"**
```bash
pip install Flask-SQLAlchemy==3.1.1
```

**"Port 8000 is in use"**
```bash
# Find what's using port 8000
lsof -i :8000  # On macOS/Linux
netstat -ano | findstr :8000  # On Windows

# Kill the process (replace PID with actual process ID)
kill -9 <PID>  # On macOS/Linux
taskkill /PID <PID> /F  # On Windows
```

**Python version issues**
```bash
# Check Python version
python --version

# If using Python 3.13+, you might need latest packages
pip install --upgrade -r requirements.txt
```

### Frontend Issues

**"npm: command not found"**
- Install Node.js from https://nodejs.org
- Restart your terminal after installation

**"Port 3000 is in use"**
```bash
# Find what's using port 3000
lsof -i :3000  # On macOS/Linux
netstat -ano | findstr :3000  # On Windows

# Kill the process
kill -9 <PID>  # On macOS/Linux
taskkill /PID <PID> /F  # On Windows
```

**"Something is already running on port 3000"**
- Press 'Y' to run on a different port, or
- Kill the existing process using the commands above

### General Issues

**Virtual environment not activating**
```bash
# Make sure you're in the backend directory
cd backend

# Try with full path
source ./venv/bin/activate  # On macOS/Linux
.\venv\Scripts\activate  # On Windows
```

**Permission errors on macOS/Linux**
```bash
# Make scripts executable
chmod +x start.sh
chmod +x status.sh
chmod +x install_nodejs.sh
chmod +x use_node.sh
```

## 🔍 Verify Everything is Working

### 1. Check Backend Health
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"healthy","timestamp":"..."}`

### 2. Check Frontend
Open http://localhost:3000 in your browser. You should see the MangaMatcher interface.

### 3. Test Quiz Functionality
1. Go to http://localhost:3000
2. Take the quiz
3. You should get manga recommendations

## 📞 Getting Help

If you're still having issues:

1. **Check the logs** in your terminal for error messages
2. **Verify all prerequisites** are installed correctly
3. **Try the troubleshooting steps** above
4. **Ask your teammates** for help

## 🎯 Quick Commands Reference

```bash
# Start everything
./start.sh

# Check status
./status.sh

# Install Node.js
./install_nodejs.sh

# Backend only
cd backend && source venv/bin/activate && python app.py

# Frontend only
cd frontend && npm start

# Stop everything
# Press Ctrl+C in each terminal
```

## ✅ Success Checklist

- [ ] Repository cloned successfully
- [ ] Python virtual environment created and activated
- [ ] Backend dependencies installed
- [ ] Backend starts without errors
- [ ] Node.js installed
- [ ] Frontend dependencies installed
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:8000/health
- [ ] Quiz functionality works
