#!/bin/bash

echo "🌸 MangaMatcher Setup Verification"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check Python
echo "🔍 Checking Python..."
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    print_status 0 "Python $PYTHON_VERSION found"
else
    print_status 1 "Python not found"
fi

# Check pip
echo "🔍 Checking pip..."
if command_exists pip3; then
    print_status 0 "pip3 found"
else
    print_status 1 "pip3 not found"
fi

# Check Node.js
echo "🔍 Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js $NODE_VERSION found"
else
    print_status 1 "Node.js not found"
fi

# Check npm
echo "🔍 Checking npm..."
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm $NPM_VERSION found"
else
    print_status 1 "npm not found"
fi

# Check Git
echo "🔍 Checking Git..."
if command_exists git; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    print_status 0 "Git $GIT_VERSION found"
else
    print_status 1 "Git not found"
fi

echo ""
echo "🔍 Checking Project Structure..."

# Check if we're in the right directory
if [ -f "README.md" ] && [ -d "backend" ] && [ -d "frontend" ]; then
    print_status 0 "Project structure looks correct"
else
    print_status 1 "Project structure incomplete - make sure you're in the mangamatcher1 directory"
fi

# Check backend virtual environment
if [ -d "backend/venv" ]; then
    print_status 0 "Backend virtual environment exists"
else
    print_status 1 "Backend virtual environment not found - run: cd backend && python -m venv venv"
fi

# Check backend requirements
if [ -f "backend/requirements.txt" ]; then
    print_status 0 "Backend requirements.txt found"
else
    print_status 1 "Backend requirements.txt not found"
fi

# Check frontend node_modules
if [ -d "frontend/node_modules" ]; then
    print_status 0 "Frontend dependencies installed"
else
    print_status 1 "Frontend dependencies not installed - run: cd frontend && npm install"
fi

# Check frontend package.json
if [ -f "frontend/package.json" ]; then
    print_status 0 "Frontend package.json found"
else
    print_status 1 "Frontend package.json not found"
fi

# Check startup scripts
if [ -f "start.sh" ]; then
    print_status 0 "start.sh script found"
else
    print_status 1 "start.sh script not found"
fi

if [ -f "status.sh" ]; then
    print_status 0 "status.sh script found"
else
    print_status 1 "status.sh script not found"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="

# Check if backend is ready
if [ -d "backend/venv" ] && [ -f "backend/requirements.txt" ]; then
    echo "1. Activate backend virtual environment:"
    echo "   cd backend && source venv/bin/activate"
    echo ""
    echo "2. Install backend dependencies:"
    echo "   pip install -r requirements.txt"
    echo ""
fi

# Check if frontend is ready
if [ -f "frontend/package.json" ] && [ ! -d "frontend/node_modules" ]; then
    echo "3. Install frontend dependencies:"
    echo "   cd frontend && npm install"
    echo ""
fi

echo "4. Start the application:"
echo "   ./start.sh"
echo ""
echo "5. Open your browser to:"
echo "   http://localhost:3000"
echo ""

echo "📖 For detailed instructions, see SETUP_GUIDE.md"
echo "🆘 If you need help, check the troubleshooting section in SETUP_GUIDE.md"
