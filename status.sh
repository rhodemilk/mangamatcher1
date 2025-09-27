#!/bin/bash

echo "🌸 MangaMatcher Status Check"
echo "============================"
echo ""

# Check backend
echo "🔍 Checking Backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
    echo "   Health: $(curl -s http://localhost:8000/health | grep -o '"status":"[^"]*"')"
else
    echo "❌ Backend is not running"
fi

echo ""

# Check frontend
echo "🔍 Checking Frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not running"
fi

echo ""

# Check Node.js
echo "🔍 Checking Node.js..."
if ./use_node.sh node --version &> /dev/null; then
    echo "✅ Node.js: $(./use_node.sh node --version)"
    echo "✅ npm: $(./use_node.sh npm --version)"
else
    echo "❌ Node.js is not available"
fi

echo ""

# Check Python environment
echo "🔍 Checking Python Environment..."
if [ -f "backend/venv/bin/activate" ]; then
    echo "✅ Python virtual environment exists"
    if source backend/venv/bin/activate && python --version &> /dev/null; then
        echo "✅ Python: $(source backend/venv/bin/activate && python --version)"
    else
        echo "❌ Python virtual environment issue"
    fi
else
    echo "❌ Python virtual environment not found"
fi

echo ""
echo "🎯 Quick Actions:"
echo "  Start everything: ./start.sh"
echo "  Check status: ./status.sh"
echo "  Open app: http://localhost:3000"
