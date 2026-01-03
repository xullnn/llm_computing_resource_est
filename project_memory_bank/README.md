# Project Memory Bank Overview

## 📂 Structure

```
project_memory_bank/
├── registry.yml                      [41 lines] L0 - Index of all modules
├── README.md                         [Navigation guide]
├── CHANGELOG.md                      [99 lines] Update history
│
├── core/                             [176 lines total]
│   ├── vision.md                     [39 lines] Project mission & strategic focus
│   ├── system_overview.md            [92 lines] Platform topology + TTFT architecture
│   └── glossary.md                   [45 lines] Domain terminology
│
├── insights/                         [181 lines total]
│   ├── index.md                      [29 lines] Knowledge area navigator
│   ├── physics.md                    [53 lines] Resource calculation rationale
│   └── architecture.md               [99 lines] Tech stack + High-Density UI decisions
│
└── integration/                      [154 lines total]
    ├── data-flow.md                  [57 lines] Model enrichment pipeline
    ├── configuration-system.md       [38 lines] Vendor whitelist governance
    └── i18n-system.md                [59 lines] Bilingual translation engine

Total: 651 lines (excluding README)
```

---

## 🎯 Quick Navigation

### I want to...

| Task | Load |
|:-----|:-----|
| **Understand the project** | L0: `registry.yml` → L1: `core/vision.md` |
| **Add a new page/feature** | L1: `core/system_overview.md` → `insights/architecture.md` |
| **Modify vendor UI** | `insights/architecture.md` (Section 6: High-Density UI) |
| **Update resource formulas** | `insights/physics.md` |
| **Debug data pipeline** | `integration/data-flow.md` + `integration/configuration-system.md` |
| **Add translation keys** | `integration/i18n-system.md` |
| **Understand TTFT charts** | `core/system_overview.md` (TTFT Visualization Architecture) |

---

## 📊 Current Focus Areas (Jan 2026)

### ✅ Production-Ready
- **TTFT Visualization**: Interactive FLOPs vs Latency charts with modal expansion
- **Parameter Pills**: High-density inventory display (`"72B×3"` instead of `"72B-480B"`)
- **Horizontal Layouts**: Model family grouping optimized for 70B+ variants
- **Two-Section Headers**: Output Speed (static) + TTFT (interactive)

### 🚧 Known Gaps (Documented in Mission Brief)
- **DeepSeek R1/V3 Data Integration**: Prototype has 685B entries; production pipeline needs update
- **Llama 405B Auth**: HF gated model handling (HTTP 401)
- **Speed Requirement Logic**: Ensure `calc.js` fully covers prototype's TODO items

---

## 🛡️ Memory Bank Principles

✅ **Diagrams over Code** — Use Mermaid/tables; reference files by path  
✅ **Current State Focus** — Document *what is*, not *what was done*  
✅ **Size Discipline** — No file >100 lines; split if complex  
✅ **Progressive Disclosure** — Registry → Core → Insights → Integration  
✅ **Zero Code Duplication** — Codebase is source of truth; memory provides context

---

## 🔄 Last Updated: 2026-01-03

See `CHANGELOG.md` for detailed update history.
