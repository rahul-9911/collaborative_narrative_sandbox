# StoryForge v1 - Lean Monolith

The GitHub for Interactive Literature.

## 🚀 Quick Start (Local Deployment)

This project is fully containerized and runs on both Windows and Linux/macOS.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A **Google AI Studio API Key** (for Gemini 2.5 Flash).

### Deployment

#### On Windows:
1. Open PowerShell in the project directory.
2. Run the deployment script:
   ```powershell
   .\deploy.ps1
   ```
3. Edit the newly created `.env` file and add your `GEMINI_API_KEY`.
4. Run the script again to restart with the new key.

#### On Linux/macOS:
1. Open a terminal in the project directory.
2. Make the script executable and run it:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
3. Edit the newly created `.env` file and add your `GEMINI_API_KEY`.
4. Run the script again.

## 🏗️ Architecture
- **Web App:** Node.js/Express Monolith.
- **Database:** PostgreSQL (with Chapter-Tree schema).
- **AI Engine:** Gemini 2.5 Flash (via Cloud API) - Ready for local Ollama/Llama 3.

## 🗺️ Roadmap
- [x] Chapter-Based Forking Logic.
- [x] Switchable AI Service (Cloud/Local).
- [x] Cross-platform Docker Deployment.
- [ ] Visual 'Multiverse Map' (React Frontend).
- [ ] Audio/Voice-First Ingestion.
