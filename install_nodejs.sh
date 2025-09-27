#!/bin/bash

echo "🌸 MangaMatcher - Node.js Installation Helper"
echo "=============================================="
echo ""

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    echo "✅ Node.js is already installed!"
    node --version
    npm --version
    exit 0
fi

echo "📦 Node.js is not installed. Here are your options:"
echo ""
echo "Option 1: Download and install manually (Recommended)"
echo "1. Go to: https://nodejs.org/en/download/"
echo "2. Download the macOS installer (.pkg file)"
echo "3. Run the installer"
echo "4. Restart your terminal"
echo ""
echo "Option 2: Use Homebrew (if you have it)"
echo "Run: brew install node"
echo ""
echo "Option 3: Use the downloaded installer"
echo "The installer is already downloaded as 'node.pkg'"
echo "Run: sudo installer -pkg node.pkg -target /"
echo ""

# Check if the pkg file exists
if [ -f "node.pkg" ]; then
    echo "📁 Found node.pkg installer in current directory"
    echo "You can install it by running:"
    echo "sudo installer -pkg node.pkg -target /"
    echo ""
fi

echo "After installing Node.js, come back and run:"
echo "cd frontend && npm install && npm start"
