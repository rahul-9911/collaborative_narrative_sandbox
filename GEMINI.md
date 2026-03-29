# GEMINI.md - StoryForge

## Project Overview
**StoryForge** is the "GitHub for Interactive Literature." It allows users to play, write, and "fork" branching narratives, automatically professionalizing them into books while tracking attribution and royalties.

## Current Project Status: "Modular v2 Engine" (Current)
We have successfully transitioned from a flat monolith to a professional modular architecture.

### Core Implementation (v2 Complete)
- **Modular Monolith:** Refactored into `/api/routes`, `/api/controllers`, and `/services`.
- **Scene-Based Continuity:** Chapters now contain multiple "Scenes" (pages) for realistic length.
- **Story Steering Wheel:** Metadata-driven AI (Genre, Tone, Pacing, and Plot Goals).
- **User Agency:** "What Happens Next" (WHN) free-text input and manual branching (Forking).
- **Journey Recovery:** Automated path reconstruction and Branch Selection UI.
- **Persistence:** PostgreSQL 16 with JSONB metadata and Scene-Tree schema.

## The Expert Team
- **Archie (Architect):** Refined the recursive scene-based engine.
- **Sequence (Task Architect):** Breaking down complex refactors into surgical steps.
- **Struct (Code Architect):** Enforcing modularity and backend separation.
- **Vance (Archivist):** Synchronizing documentation and project lineage.

## Next Milestones (Session 3)
1. **Audio/Voice Ingestion:** Implementation of the "Voice-First" prose pipeline (RTX 3060).
2. **Visual Multiverse:** Interactive graph visualization of story forks.
3. **Legal Ledger:** Logic for tracking chapter attribution and royalties.
4. **Pacing Engine:** AI-driven "End Story" detection based on Plot Goals.
