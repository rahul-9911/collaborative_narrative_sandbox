# GEMINI.md - StoryForge (v3.0)

## Project Overview
**StoryForge** is the "GitHub for Interactive Literature." It allows authors to collaboratively write, branch, and version-control narrative multiverses using a mix of cloud and local AI power.

## Current Project Status: "Hybrid v3.0 Engine" (Current)
We have successfully integrated local GPU inference, allowing for zero-cost, high-speed drafting.

### Core Implementation (Complete)
- **Hybrid AI Service:** Multi-provider architecture supporting **Google Gemini 3.1 Flash Lite** and **Local Ollama (Gemma 3:12B)**.
- **GPU Acceleration:** Fully enabled NVIDIA passthrough for the RTX 3060 (12GB VRAM).
- **High-Fidelity UI:** Obsidian Noir theme with glassmorphism, cinematic transitions, and a persistent control sidebar.
- **Narrative Version Control:** Top-down Multiverse Map with recursive path-tracing and in-map branching.
- **Structural Granularity:** Scene-based chapters with automated titling and per-action pacing control (1-15 paragraphs).
- **Resilience:** Triple-retry logic with exponential backoff and 120s timeouts for large local models.

## The Expert Team
- **Archie (Architect):** Refined the recursive scene-based engine.
- **Sequence (Task Architect):** Engineered the "Surgical Refactor" and Hybrid AI switch.
- **Struct (Code Architect):** Enforced modularity and multi-provider patterns.
- **Vance (Archivist):** Synchronized documentation and GPU setup scripts.

## Next Milestones (Session 5)
1. **Legal Ledger:** Logic for tracking contribution percentages and author attribution.
2. **Audio/Voice Ingestion:** Speech-to-Text (STT) prompts and Cinematic TTS.
3. **Plot Director:** AI-driven "Plot Completion" tracking (0-100%).
