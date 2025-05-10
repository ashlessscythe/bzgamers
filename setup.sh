#!/bin/bash

# BZGamers Setup Script

echo "🎮 Setting up BZGamers project..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local file from example if it doesn't exist
if [ ! -f .env.local ]; then
  echo "🔑 Creating .env.local file..."
  cp .env.example .env.local
  echo "⚠️  Don't forget to update your API keys in .env.local"
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "npm run dev"
echo ""
echo "📝 To complete the remaining tasks in Milestone 1:"
echo "1. Create a RAWG API account at https://rawg.io/apidocs"
echo "2. Get your API key and add it to .env.local"
echo "3. Test the API endpoints with your key"
echo ""
echo "Happy coding! 🎮"
