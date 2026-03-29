# GEMINI.md - StoryForge (v2.5)

## Project Overview
**StoryForge** is the "GitHub for Interactive Literature." It allows authors to collaboratively write, branch, and version-control narrative multiverses, moving them from collaborative drafts toward professional publication.

## Current Project Status: "Modular v2.5 Suite" (Current)
We have successfully transitioned from a monolith to a **Fully Modular Component Architecture**.

### Core Implementation (Complete)
- **Modular Monolith Backend:** Decoupled into `/api/routes`, `/api/controllers`, and `/services`.
- **Modular React Frontend:** Dismantled the `App.jsx` monolith into standalone views (`Home`, `Library`, `Quest`, `Branches`) and layouts.
- **Narrative Continuity:** High-fidelity scene-based chapters with automated titling and pacing controls (1-15 paragraphs).
- **Hardened Decision Portal:** Map-centric branching with context-aware previews and multiline custom inputs.
- **Resilience Engine:** Automated exponential backoff retry for AI transient errors (503/500).
- **Persistent Version History:** Recursive top-down timeline map with path-tracing integrity.

## The Expert Team
- **Archie (Architect):** Refined the recursive scene-based engine.
- **Sequence (Task Architect):** Broke down the "Great Dismantling" into surgical steps.
- **Struct (Code Architect):** Enforced modularity across the full stack.
- **Vance (Archivist):** Synchronized platform branding and documentation.

## Next Milestones (Session 4)
1. **Audio/Voice Ingestion:** Implementation of the "Voice-First" prose pipeline (RTX 3060).
2. **Legal Ledger:** Logic for tracking contribution percentages and royalties.
3. **Pacing Engine:** AI-driven "Plot Completion" detection.
