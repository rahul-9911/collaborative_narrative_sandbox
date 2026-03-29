#!/bin/bash
# deploy.sh - StoryForge Deployment Script (Linux/macOS)

echo "Starting StoryForge Deployment..."

# 1. Check if .env exists, if not, create from example
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "PLEASE EDIT .env AND ADD YOUR GEMINI_API_KEY!"
fi

# 2. Build and start containers
echo "Building and starting StoryForge containers..."
docker compose up --build -d

echo "Deployment complete! App running at http://localhost:3000"
echo "Check logs with: docker-compose logs -f app"
