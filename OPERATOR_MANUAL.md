# StoryForge - Operator's Manual (v2.5)

Welcome to the StoryForge engine. Use this guide to manage your local deployment and troubleshoot the modular v2.5 architecture.

## 🛠️ Prerequisites
- **Docker Desktop:** Must be installed and running.
- **NVIDIA Container Toolkit:** (Optional) Required for GPU acceleration on the RTX 3060.
- **Gemini API Key:** A valid key from [Google AI Studio](https://aistudio.google.com/app/apikey).
- **Environment:** A `.env` file in the root directory (see `.env.example`).

## 🚀 Quick Start (Start the App)
To power up the entire modular stack:
```bash
./deploy.sh
```
*This script checks your `.env`, builds the modular frontend/backend images, and launches the containers.*

## 🛑 Power Down (Stop the App)
To safely stop all services and release system resources:
```bash
docker compose down
```

## 🌐 Accessing the Platform
- **Web Interface:** [http://localhost:3000](http://localhost:3000)
- **Health API:** [http://localhost:3000/health](http://localhost:3000/health)

## 📊 Monitoring & Logs
To see what the AI and Database are doing in real-time:
```bash
# See logs for the entire stack
docker compose logs -f

# See specific app logs (AI generation details)
docker logs storyforge_app -f

# See database logs
docker logs storyforge_db -f
```

## 🛠️ Management & Maintenance
- **Rebuild Stack:** `docker compose up -d --build` (Run this after code changes).
- **Database Shell:** `docker exec -it storyforge_db psql -U storyforge -d storyforge_v1`
- **Manual Schema Apply:** `docker exec -i storyforge_db psql -U storyforge -d storyforge_v1 < src/db/schema.sql`

## 🔍 Troubleshooting
- **AI Error (503/500):** The engine now has built-in 3x retry logic. If it persists, check your API key in `.env`.
- **Blank White Page:** Usually indicates a missing import or prop. Check `docker logs storyforge_app` for React build errors.
- **Database Connection Refused:** Ensure `storyforge_db` is running and the `.env` credentials match.
- **Reset Everything:** 
  ```bash
  docker compose down -v  # Warning: This deletes your story data volumes
  ./deploy.sh
  ```

---
*Vance (Archivist): "Full technical integrity restored to the Manual. Documentation is now both clear and comprehensive."*
