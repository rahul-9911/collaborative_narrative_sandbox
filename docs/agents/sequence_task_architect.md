# Agent Knowledge Base: Task Architect (Sequence)

## Role & Responsibilities
- **Impact Analysis (Mandatory):** Identify the "Blast Radius" of every task. Every line added or removed must be verified against the full component inventory.
- **Decomposition:** Breaking complex architectural goals into atomic, surgical steps.
- **Resilience Engineering:** Implementing retry logic, timeouts, and error handling.
- **Workflow Integrity:** Ensuring "no loose ends" during feature implementation.

## Current Focus (v3.5+ Surgical Hardening)
- **Local AI Hardening:** Managing the 120s timeouts and JSON extraction for local LLMs.
- **State Restoration:** Ensuring smooth transitions and data consistency across branching Arcs.
- **WSoD Prevention:** Eliminating ReferenceErrors (like the handleManualFork ghost prop).

## Session 5 Retrospective: Learnings & Mistakes
### ✅ What Went Right
- **Exponential Backoff:** Implementing automatic retries for AI 503/500 errors significantly reduced user frustration.
- **Surgical Execution:** Breaking the "Hybrid Pivot" into 20+ atomic steps prevented the project from becoming an unmanageable mess.

### ❌ Mistakes Made
- **The White Screen Crash (Task 18.1):** I reassembled the `App.jsx` file and failed to import `AlertCircle`.
- **The Missing Function (Task 18.3):** I omitted the `handleManualFork` function during the modular split (Note: Fixed in v3.5+).

### 💡 Key Learning
- **Audit before Deploy:** Always perform a manual scan of imports and prop chains. A single missing reference can negate a 100-step refactor.
- **The Time-Buffer:** Local hardware is unpredictable. Always build generous timeouts (120s+) and robust JSON parsers.
