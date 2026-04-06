# Machine Context: StoryForge Environment (v3.5+)

## OS & Hardware
- **OS:** Ubuntu 24.04.4 LTS (Noble Numbat)
- **Kernel:** 6.17.0-19-generic
- **CPU:** Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz
- **RAM:** 62GiB
- **GPU:** NVIDIA GeForce RTX 3060 (12GB VRAM, Driver 580.126.09) - **ACTIVE**

## Deployment Status
- **Docker Compose Stack:** active (Postgres 16 + Ollama + StoryForge App).
- **StoryForge Server:** Running on port 3000.
- **Ollama Internal URL:** `http://ollama:11434`.

## Network Exclusivity (Critical)
- **Host Ollama Service:** DISABLED (`systemctl stop ollama && systemctl disable ollama`).
- **Port 11434:** Exclusively reserved for the `storyforge_local_ai` Docker container to prevent "Address already in use" conflicts.

## Context Engine
- **Infinite Context:** Narrative summarization (Chronicler) enabled.
- **Resilience Engine:** 120s timeouts and exponential backoff for local inference.

## Project Guardrails (Surgical Hardening)
1. **The Triple-Check Rule:** No code changes without auditing imports and prop-chains.
2. **MVC Enforcement:** All SQL must live in `/src/models`, never in controllers.
3. **Audit Verified:** All major components (Sidebar, Home, Library, Quest, Branches) in sync.

## Maintenance
- **Logs:** `docker compose logs -f app` for narrative generation audit.
- **DB Check:** `docker exec storyforge_db psql -U storyforge -d storyforge_v1`.