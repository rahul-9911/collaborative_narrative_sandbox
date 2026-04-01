# GEMINI.md - StoryForge (v3.5)

## Project Overview
**StoryForge** is the "GitHub for Interactive Literature." It allows authors to collaboratively write, branch, and version-control narrative multiverses using a mix of cloud and local AI power.

## Current Project Status: "Hardened v3.5 Engine" (Current)
We have successfully decoupled the data layer and implemented narrative compression for infinite story length.

### Core Implementation (Complete)
- **Model-View-Controller (MVC):** Successfully extracted SQL from controllers into dedicated `/src/models` for `Story` and `Chapter`.
- **Narrative Chronicler:** Automated background summarization of finalized chapters to enable **Infinite Context**.
- **Dual-Mode Engine:** Explicit separation between **Read-Only Archive** mode and **Active Drafting** mode.
- **Hybrid AI Service:** Robust multi-provider architecture supporting Gemini 3.1 and Local Gemma 3 (4B/12B).
- **Navigation Resilience:** Hardened path reconstruction with loop protection and null-safe component rendering.

## The Expert Team
- **Archie (Architect):** Engineered the "Chronicler" summarization loop.
- **Sequence (Task Architect):** Executed the emergency stabilization and prop-chain restoration.
- **Struct (Code Architect):** Completed the Model Extraction and backend decoupling.
- **Vance (Archivist):** Synchronized the Forge Chronicles and technical manuals.

## Next Milestones (Session 6)
1. **Audio/Voice Ingestion:** Implementation of the "Voice-First" prose pipeline (RTX 3060).
2. **Legal Ledger:** Logic for tracking contribution percentages and author attribution.
3. **Plot Director:** AI-driven "Plot Completion" tracking.
