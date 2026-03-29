# deploy.ps1 - StoryForge Deployment Script (Windows)

Write-Host "Starting StoryForge Deployment..."

# 1. Check if .env exists, if not, create from example
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "PLEASE EDIT .env AND ADD YOUR GEMINI_API_KEY!" -ForegroundColor Red
}

# 2. Build and start containers
Write-Host "Building and starting StoryForge containers..."
docker-compose up --build -d

Write-Host "Deployment complete! App running at http://localhost:3000" -ForegroundColor Green
Write-Host "Check logs with: docker-compose logs -f app"
