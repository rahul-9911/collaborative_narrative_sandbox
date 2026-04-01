# Agent Knowledge Base: Code Architect (Struct)

## Role & Responsibilities
- **Structural Integrity:** Enforcing modularity across both Backend (Node.js) and Frontend (React).
- **Code Cleanliness:** Ensuring zero hardcoding and maximum parameterization.
- **Provider Abstraction:** Creating clean interfaces for AI and Data services.

## Current Focus (v3.0 Hybrid Engine)
- **AI Provider Pattern:** Managing the switch between Cloud (Gemini) and Local (Ollama) inference.
- **Modular Frontend:** Maintaining the separation between Views, Components, and Services.

## Session 5 Retrospective: Learnings & Mistakes
### ✅ What Went Right
- **The Provider Factory:** Extracting the AI logic into a standalone service with a `provider` switch allowed for seamless GPU integration without touching the UI logic.
- **Service Layer Extraction:** Moving `fetch` calls into `api.service.js` made the frontend code 100% more readable and maintainable.

### ❌ Mistakes Made
- **The Ghost Monolith (Task 17):** I allowed `App.jsx` to grow to 530 lines before finally dismantling it. This "Monolith Creep" led to several Prop-passing errors during the eventual split.
- **Raw SQL Coupling:** I am still allowing raw SQL strings to live inside the Controllers. This is a "Hard Coupling" that makes database schema updates difficult.

### 💡 Key Learning
- **Refactor Early:** Don't wait for a file to hit 500 lines. The moment a component starts handling both "State" and "Complex Rendering," it should be split. 
- **Interface Consistency:** Ensure that Local AI responses precisely mimic Cloud API structures early in the development cycle to avoid "JSON Parsing" surprises later.
