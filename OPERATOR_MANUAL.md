# StoryForge - Operator's Manual (v3.0)

Welcome to the StoryForge Engine. This guide provides instructions for managing the Hybrid v3.0 stack.

## 🛠️ Prerequisites
- **Docker Desktop:** Must be installed and running.
- **NVIDIA Container Toolkit:** Required for local GPU acceleration.
- **Gemini API Key:** Required if `AI_PROVIDER=GEMINI` is active.

## 🤖 AI Configuration (The Switch)
You can manually toggle between Cloud and Local AI by editing the `.env` file:

### 1. Cloud Mode (Google Gemini)
```text
AI_PROVIDER=GEMINI
GEMINI_API_KEY=your_key_here
```

### 2. Local Mode (Your GPU)
```text
AI_PROVIDER=LOCAL
LOCAL_MODEL_NAME=gemma3:12b
```
*Note: Local mode uses the RTX 3060 via Ollama. Re-run `./deploy.sh` after changing this setting.*

## 🚀 Quick Start
```bash
./deploy.sh
```

## 🛑 Power Down
```bash
docker compose down
```

## 📊 Real-Time Logs
- **App/AI Logic:** `docker logs storyforge_app -f`
- **Local Model Status:** `docker logs storyforge_local_ai -f`

## 🔍 Troubleshooting
- **GPU Not Found:** Run `./setup_gpu.sh` to re-configure the NVIDIA bridge.
- **JSON Parse Error:** The system automatically retries 3x. If persistent, try shortening the prompt.
- **Port 11434 Error:** Run `sudo systemctl stop ollama` if a native service is blocking Docker.

---
*Vance (Archivist): "Operational blueprint synced to Hybrid v3.0 Engine."*
