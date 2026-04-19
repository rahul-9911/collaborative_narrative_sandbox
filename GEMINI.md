# GEMINI.md - StoryForge (v4.0 Hardened Architecture)

## Project Overview
**StoryForge** is the "GitHub for Interactive Literature." It allows authors to collaboratively write, branch, and version-control narrative multiverses using a mix of cloud (Gemini 3.1) and local AI (Gemma 3 via RTX 3060).

## Current Project Status: "v4.0 Unified Engine"
We have achieved a stable, URL-driven architecture with an immersive, distraction-free reading interface.

### Core Implementation (Complete)
- **Unified Header (v4.0):** Dual-layered fixed header in `App.jsx` handling both global branding and narrative navigation (Prev/Next/Branch Switcher).
- **Immersive Reader Mode:** Complete removal of persistent sidebar; full-width prose focus.
- **Absolute Scroll Restoration:** Bulletproof `useLayoutEffect` and DOM-keying to ensure readers always start at the top of a chapter.
- **Global Drafting Modal:** Lifted drafting logic to the root level for a consistent UX across the Map and Quest views.
- **Drafting Guard:** Mandatory "Pages to Generate" selector and choice-highlighting to prevent accidental generations.
- **Model-View-Controller (MVC):** SQL decoupled into `/src/models` for `Story` and `Chapter`.

## Behavioral Standards (Mandatory)
- **Karpathy Guidelines:** Think before coding, Simplicity first, Surgical changes, Goal-driven execution.
- **Triple-Check Mandate:** Every code change must be audited for imports and prop-chains by Struct.

## User Flow (The Hierarchical Path)
### 1. Home View
- Global landing page with entry points to the Library or Architect.
### 2. Library View
- The world collection. Selecting a story navigates to the **Timeline Map**.
### 3. Timeline Map (Branches View)
- Vertical tree visualization of narrative arcs. Clicking a node enters the **Reader**.
### 4. Narrative Reader (QuestView)
- Immersive prose reading. Navigation bar in header allows linear movement or branch switching.
- **Forge New Path:** Global modal for drafting new chapters with pacing control.

## The Expert Team (Operational Mandates)
- **Archie (Lead Architect):** Oversees unified header logic and path purity.
- **Struct (Code Architect):** Enforces MVC boundaries and performs "Triple-Check" audits.
- **Sequence (Task Architect):** Manages task decomposition and "Blast Radius" verification.

## Next Milestones (Session 10)
1. **Audio/Voice Ingestion:** Local Whisper implementation for "Voice-First" prose dictation.
2. **Legal Ledger:** Contribution percentages and author attribution logic.
3. **Plot Director:** AI-driven thread completion tracking.
