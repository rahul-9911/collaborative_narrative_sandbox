# GEMINI.md - StoryForge (v3.5 Hardened Engine)

## Project Overview
**StoryForge** is the "GitHub for Interactive Literature." It allows authors to collaboratively write, branch, and version-control narrative multiverses using a mix of cloud (Gemini 3.1) and local AI (Gemma 3 via RTX 3060).

## Current Project Status: "Hardened v3.5 Engine"
We have successfully decoupled the data layer and implemented narrative compression for infinite story length.

### Core Implementation (Complete)
- **Model-View-Controller (MVC):** Successfully extracted SQL from controllers into dedicated `/src/models` for `Story` and `Chapter`. (Restored by Struct)
- **Narrative Chronicler:** Automated background summarization of finalized chapters to enable **Infinite Context**. (Engineered by Archie)
- **Dual-Mode Engine:** Explicit separation between **Read-Only Archive** mode and **Active Drafting** mode.
- **Hybrid AI Service:** Robust multi-provider architecture supporting Gemini 3.1 and Local Gemma 3 (4B/12B).
- **Navigation Resilience:** Hardened path reconstruction with loop protection and null-safe component rendering. (Stabilized by Sequence)

## User Flow & UI Landscape (The Operational Map)
### 1. The Welcome Gate (Home View)
- **"Access the Library":** Opens the collection of existing story worlds.
- **"Architect a World":** Opens the creation suite.

### 2. The Library (Library View)
- **"Create New World":** Opens the Architect interface.
- **"Access Timeline":** Triggers narrative reconstruction and opens the **World Map**.

### 3. The Story Architect (Creation View)
- **"Begin Architecture":** Generates Chapter 1 and transitions to **Quest View**.

### 4. The World Map (Branches View)
- **"Arc [X]" Button:** Selects a node and reconstructs the historical path.
- **"Branch Narrative" Icon (GitBranch):** Manual fork point creation.
- **Modal Buttons:** Choice selection or "Commit to Timeline" (Play Icon).

### 5. The Narrative Portal (Quest View)
- **"Timeline Map" (Header):** Return to tree visualization.
- **"Branch from here" (GitBranch):** Inline forking between chapters.
- **"Collaborative Choices":** AI-generated paths for active drafting.
- **"Commit to Timeline" (Play Icon):** Submit custom prose.
- **"Start Collaborative Draft" (PenTool):** Wakes the AI for a new branch in a Read-Only archive.

## The Expert Team (Operational Mandates)
- **Archie (Lead Architect):** Engineered the "Chronicler" summarization loop. Oversees recursive node logic and "Path Purity."
- **Struct (Code Architect):** **Surgical Scrutiny Mandate.** Enforces MVC boundaries and performs "Triple-Check" audits on all code changes. Completed the Model Extraction and backend decoupling.
- **Sequence (Task Architect):** **Impact Analysis Mandate.** Decomposes tasks and verifies the "Blast Radius" of every change. Executed the emergency stabilization and prop-chain restoration.
- **Vance (Archivist):** Custodian of the "Forge Chronicles" and hardware-to-docker bridging. Synchronized the technical manuals.
- **Sentinel (Watchdog):** Modernity and lifecycle auditor (EKS, PG, Node versions).
- **Kube (Ops):** Infrastructure as Code (OpenTofu) and deployment specialist.
- **Maven (Strategist):** Product value proposition and user persona expert.
- **Guard (Security):** Zero-trust architecture and compliance officer.

## Next Milestones (Session 6 Hardening)
1. **Surgical Bug Fixing:** Resolving inconsistencies in local AI fetch and navigation edge cases.
2. **Audio/Voice Ingestion:** Implementation of the "Voice-First" prose pipeline (RTX 3060).
3. **Legal Ledger:** Logic for tracking contribution percentages and author attribution.
4. **Plot Director:** AI-driven "Plot Completion" tracking.

## Recent Fixes (v3.5+)
- **MVC Restored:** Raw SQL extracted from controllers into `Chapter.model.js`.
- **WSoD Resolved:** Non-existent `handleManualFork` prop removed; `QuestView` hardened with null-safety.
- **Network Stabilized:** Host-level Ollama service disabled to allow Docker port 11434 exclusivity.
