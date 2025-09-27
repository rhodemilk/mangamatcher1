#!/bin/bash

echo "🌸 Starting MangaMatcher..."
echo "=========================="
echo ""

# Set up Node.js environment
export PATH="/Users/alexgomez/mangamatcher1/node-v18.20.8-darwin-arm64/bin:$PATH"
export NODE_PATH="/Users/alexgomez/mangamatcher1/node-v18.20.8-darwin-arm64/lib/node_modules"

# Check if Node.js is available
if ! ./use_node.sh node --version &> /dev/null; then
    echo "❌ Node.js is not available!"
    echo "Please run: ./install_nodejs.sh"
    exit 1
fi

echo "✅ Node.js found: $(./use_node.sh node --version)"
echo "✅ npm found: $(./use_node.sh npm --version)"
echo ""

# Start backend
echo "🚀 Starting backend server..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🚀 Starting frontend server..."
cd frontend
../use_node.sh npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 MangaMatcher is starting up!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000 (will open automatically)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
