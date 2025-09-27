#!/bin/bash

# Set up Node.js environment
export PATH="/Users/alexgomez/mangamatcher1/node-v18.20.8-darwin-arm64/bin:$PATH"
export NODE_PATH="/Users/alexgomez/mangamatcher1/node-v18.20.8-darwin-arm64/lib/node_modules"

# Execute the command passed to this script
exec "$@"
