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

## 🏗️ System Architecture & AI Flow

StoryForge is architected as a lean, containerized monolith designed for branching narrative generation. The system features a pluggable AI orchestration layer that seamlessly toggles between Cloud API inference and Local GPU-accelerated inference.

```text
+-----------------------------------------------------------------------+
|                       React 18 Frontend (SPA)                         |
|         • Story Reader  • Timeline Tree Map  • Drafting Modal         |
+-----------------------------------+-----------------------------------+
                                    |
                                    | HTTP Requests (User Choices & Prompts)
                                    v
+-----------------------------------------------------------------------+
|                  Node.js / Express Monolith Backend                   |
|        • API Router (/api)  • Story Controllers  • MVC Models         |
+--------------------+----------------------------------+---------------+
                     |                                  |
     Save/Fetch Data |                                  | Prompt + Context
                     v                                  v
+--------------------------+          +---------------------------------+
|   PostgreSQL Database    |          |    AI Service (ai.service.js)   |
| • Chapter Hierarchy Tree |          | • Story Bible & Codex Context   |
| • Entities & Codex State |          | • Strict JSON Output Parser     |
+--------------------------+          +----------------+----------------+
                                                       |
                                    AI_PROVIDER Switch (.env)
                                    +------------------+------------------+
                                    |                                     |
               [AI_PROVIDER=GEMINI] |                                     | [AI_PROVIDER=LOCAL]
                                    v                                     v
+---------------------------------------------+ +---------------------------------------------+
|            CLOUD PATHWAY (API)              | |             LOCAL PATHWAY (GPU)             |
|       Google Gemini 3.1 / 2.5 Flash         | |         Ollama (Gemma 3:4b / Llama 3)       |
+---------------------------------------------+ +---------------------------------------------+
| • Transport: HTTPS via @google/genai SDK    | | • Transport: HTTP to http://ollama:11434    |
| • Protocol : Cloud API Request              | | • Protocol : POST /api/generate             |
| • Hardware : Cloud Infrastructure           | | • Hardware : Local NVIDIA RTX 3060 (12GB)   |
| • Config   : GEMINI_API_KEY in .env         | | • Privacy  : 100% Offline & Free Inference  |
+----------------------+----------------------+ +----------------------+----------------------+
                       |                                               |
                       +-----------------------+-----------------------+
                                               |
                                               v Returns Structured JSON
                               +-------------------------------+
                               |  { "title": "...",            |
                               |    "prose": "...",            |
                               |    "choices": ["1", "2", "3"] |
                               |  }                            |
                               +-------------------------------+
```

### 🔍 How AI Is Consumed: Local vs. Cloud API

StoryForge decouples narrative generation logic from the underlying model provider in `src/services/ai.service.js`. A single environment flag controls model dispatch:

| Feature | ☁️ Cloud Pathway (`GEMINI`) | 💻 Local Pathway (`LOCAL`) |
| :--- | :--- | :--- |
| **Model** | Google Gemini (3.1 Flash Lite / 2.5 Flash) | Gemma 3 (4B) or Llama 3 via Ollama |
| **Transport** | HTTPS via `@google/generative-ai` SDK | HTTP REST (`POST http://ollama:11434/api/generate`) |
| **Hardware** | Cloud-hosted (Google AI Studio) | Local NVIDIA RTX 3060 (12GB VRAM via Docker GPU passthrough) |
| **Configuration** | `AI_PROVIDER=GEMINI` & `GEMINI_API_KEY` | `AI_PROVIDER=LOCAL` & `LOCAL_MODEL_NAME=gemma3:4b` |
| **Prompt Pipeline** | Injects Story Bible + Codex world state + narrative phase | Injects identical context with strict JSON formatting flags |
| **Resilience** | Exponential backoff for transient rate limits | 120s timeout guard + custom JSON extractor for local model outputs |
| **Best For** | Instant zero-setup demo & fast prototyping | Complete data privacy, offline operation & zero API costs |

### 🔄 End-to-End Execution Flow at a Glance
1. **User Action:** The reader chooses a branch action in the React UI or writes a custom intent.
2. **Context Resolution:** The Express backend loads the chapter ancestry and Codex world state from PostgreSQL.
3. **Prompt Formulation:** The `AIService` injects plot goals, tone, narrative phase, and world constraints.
4. **Provider Dispatch:**
   - If **GEMINI**: Calls Google Generative AI API with the compiled prompt.
   - If **LOCAL**: Dispatches a JSON payload to the internal Ollama container over port 11434.
5. **Output Parsing:** The system extracts structured JSON containing the next prose section and three distinct branch choices.
6. **World Architect Pass:** A background pass extracts new characters, locations, and status changes into the Codex.

## 🗺️ Roadmap
- [x] Chapter-Based Forking Logic.
- [x] Switchable AI Service (Cloud/Local).
- [x] Cross-platform Docker Deployment.
- [ ] Visual 'Multiverse Map' (React Frontend).
- [ ] Audio/Voice-First Ingestion.
