---
name: System Overview
description: High-level architecture
last_updated: 2025-12-10
go_deeper:
  - modules/*/summary.md: Module details
  - integration/data-flow.md: End-to-end data flow
---

# System Overview

## Architecture Pattern
**Pure client-side reactive calculator**: User input → calculation → render (no server, no build)

## Module Flow
```
[Model Presets]──┐
                 ↓
[User Inputs] → [Calculator] → [Results Display]
                 ↑
         [Heuristics/Formulas]
```

## Modules

| Module | File | Responsibility | Lines |
|--------|------|----------------|-------|
| **Models** | `js/models.js` | 16 flagship LLM presets (Qwen, DeepSeek, Llama, etc.) | 232 |
| **Calculator** | `js/calc.js` | Physics-based estimation (VRAM, FLOPs, bandwidth, TTFT) | 147 |
| **UI** | `js/ui.js` | Bilingual interface, input gathering, real-time rendering | 339 |
| **Styles** | `css/main.css` | Dark theme with glassmorphism, responsive grids | 283 |
| **Structure** | `index.html` | Semantic HTML, form fields, result cards | 149 |

## Key Characteristics
- **Offline-first**: All computation in browser, no API calls
- **Reactive**: Every input change triggers recalculation (input/change event listeners)
- **Bilingual**: English & Chinese i18n with dynamic translation
- **Educational**: Displays calculation assumptions to build user understanding
- **No dependencies**: Vanilla JavaScript, no frameworks, no build system

## Technology Stack
- **Frontend**: HTML5, CSS3 (CSS Grid, CSS Variables)
- **Logic**: ES6 JavaScript (pure functions, event-driven)
- **I18n**: Object-based translation dictionary
- **Deployment**: Static hosting (any CDN or file server)

## Data Flow (High-Level)
1. **Initialization**: Load presets → apply first preset → render
2. **User interaction**: Change input → gather values → calculate → update DOM
3. **Preset selection**: Apply preset values → trigger recalculation
4. **Language switch**: Update translations → re-render

## 📚 Go Deeper
- **Module details**: See `modules/*/summary.md`
- **Complete data flow**: See `integration/data-flow.md`
- **Design decisions**: See `insights/architecture.md`
- **Physics & math**: See `insights/physics.md`

