#!/bin/bash

# The Circle Workspace Booking System Installation Script
echo "🚀 Setting up The Circle Workspace Booking System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js version 14 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists"
fi

# Create backups directory if it doesn't exist
echo "🗄️ Setting up database and backups..."
if [ ! -d "backups" ]; then
    mkdir -p backups
fi

echo ""
echo "🎉 Installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit the .env file with your configuration"
echo "2. Start the server: npm start"
echo "3. Access the public website: http://localhost:3000"
echo "4. Access the admin dashboard: http://localhost:3000/pages/admin-login.html"
echo "5. Login with default credentials: admin / admin123"
echo ""
echo "🔧 Development commands:"
echo "  npm run dev      - Start with auto-reload"
echo "  npm run dev:https - Start with HTTPS (development)"
echo ""
echo "🗄️ Database backup commands:"
echo "  npm run backup   - Create database backup"
echo "  npm run backup:sql - Export database as SQL"
echo "  npm run backup:list - List all backups"
echo ""
echo "⚠️  IMPORTANT: Change the default admin password after first login!"
echo ""
echo "📚 For more information, see README.md"
