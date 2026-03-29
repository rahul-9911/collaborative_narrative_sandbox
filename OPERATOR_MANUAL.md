# StoryForge - Operator's Manual (v2.0)

Welcome to the StoryForge Engine. This guide provides exact steps for managing your local deployment.

## 🚀 Quick Start (Start the App)
To power up the entire stack (Database, AI Engine, and Frontend):
```bash
./deploy.sh
```
*This script automatically checks your `.env`, builds the Docker images, and launches the containers in detached mode.*

## 🛑 Power Down (Stop the App)
To safely stop all services and release system resources:
```bash
docker compose down
```

## 🌐 Accessing the Platform
Once started, the platform is available at:
- **Web Interface:** [http://localhost:3000](http://localhost:3000)
- **API Health Check:** [http://localhost:3000/health](http://localhost:3000/health)

## 🛠️ Management Commands
- **View Logs:** `docker compose logs -f app`
- **Rebuild Frontend:** `docker compose up -d --build`
- **Database Shell:** `docker exec -it storyforge_db psql -U storyforge -d storyforge_v1`

## 🔑 Environment Setup
Ensure your `.env` file contains a valid Gemini API Key:
```text
GEMINI_API_KEY=your_key_here
AI_PROVIDER=GEMINI
```

---
*Vance (Archivist): "Documentation synced to latest v2 modular architecture."*
