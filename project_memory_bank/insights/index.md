---
name: Insights Index
description: Navigation for patterns, architecture, and lessons
last_updated: 2025-12-10
---

# Insights Index

This directory contains higher-level knowledge: design patterns, architectural decisions, 
and lessons learned from development and validation.

## Available Categories

### `architecture.md`
**Key architectural decisions and rationale**
- Why serverless/offline?
- Why vanilla JS (no framework)?
- Why no build system?
- Data flow pattern choices

**Load when**: Considering major refactors, explaining design to new contributors

---

### `physics.md`
**LLM inference physics and formula validation**
- Transformer forward pass math (FLOPs, memory, bandwidth)
- Prefill vs decode bottlenecks
- MoE optimization patterns
- Validation examples (Llama 70B, DeepSeek-V3)
- Known limitations and assumptions

**Load when**: Updating calculation formulas, debugging estimates, understanding bottlenecks

---

### `patterns.md` (Future)
**Reusable code patterns established in project**
- Event-driven reactive updates
- Preset override pattern
- Translation system pattern
- Pure function calculator pattern

**Load when**: Implementing similar patterns elsewhere, refactoring

---

### `lessons.md` (Future)
**Debugging lessons and anti-patterns**
- Common pitfalls
- Performance gotchas
- Browser compatibility issues
- Edge cases discovered

**Load when**: Troubleshooting, onboarding new developers

## Usage Pattern

**Quick lookup**: Read this index to find relevant category

**Deep dive**: Load specific insight file for detailed knowledge

**Cross-reference**: Insight files link to relevant module/integration docs

