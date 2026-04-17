# Karpathy Guidelines (Project Standard)

Behavioral guidelines to reduce common LLM coding mistakes, adopted as the core operational standard for StoryForge.

## 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- State assumptions explicitly.
- Present multiple interpretations - don't pick silently.
- Push back if a simpler approach exists.
- Stop and ask if something is unclear.

## 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" that wasn't requested.
- If it can be done in 50 lines instead of 200, do it in 50.

## 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Don't "improve" adjacent code or formatting.
- Don't refactor what isn't broken.
- Match existing style perfectly.
- Remove orphans (imports/variables) created by YOUR changes.

## 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
- Transform tasks into verifiable goals.
- Refactor/Fix → Ensure tests pass before AND after.
- State a brief plan with verification steps for every multi-step task.
