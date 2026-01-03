# Project Memory Bank Changelog

## 2026-01-03 - TTFT Visualization & High-Density UI Update

### Context
Synchronized Project Memory Bank with recent production changes:
- TTFT (Time To First Token) interactive visualization system
- Parameter Pills UI pattern for vendor model grouping
- Horizontal row layout for 70B+ model families (DeepSeek, Qwen)

### Updated Files

#### `registry.yml`
**Changes:**
- Added `js/ttft-chart.js` and `js/ttft-chart-renderer.js` to service layer
- Added `js/ui.js` and `js/gpus.js` for completeness
- Created new `prototyping` section documenting `prototype_lab/`
- Updated pillar descriptions to reflect Parameter Pills feature

**Impact:** Registry now accurately reflects all 10 service modules + prototyping workflow.

---

#### `core/system_overview.md`
**Changes:**
- Added **TTFT Visualization Architecture** section with flow diagram
- Extended Service Layer Map table with TTFT and GPU modules
- Documented two-section header pattern (Output Speed + TTFT chart)
- Included design rationale for progressive disclosure and left-aligned headers

**Impact:** System overview now explains the interactive chart architecture end-to-end.

---

#### `insights/architecture.md`
**Changes:**
- Added **Section 6: High-Density UI Patterns**
- Documented three key decisions:
  1. **Parameter Pills over Range Text** — shows model density ("72B ×3" vs "72B-480B")
  2. **Horizontal Row Layout** — groups variants within parameter tiers
  3. **Left-Aligned Spec Box Headers** — prevents floating icon visual bugs
- Included production code references (`js/models-page.js`, `css/models.css`)
- Included prototype reference (`prototype_lab/model-family-grouping-v2.html`)

**Impact:** Future UI work on vendor displays now has documented design rationale.

---

#### `insights/index.md`
**Changes:**
- Added "High-Density UI Patterns" bullet to Architecture Decisions summary
- Added **UI/UX** usage pattern for vendor display modifications

**Impact:** Index guides designers/developers to consult architecture decisions before UI changes.

---

#### Removed Files
- **Deleted:** `project_memory_bank/planning/` (empty directory)

**Rationale:** Directory was never used; removal reduces noise in memory bank structure.

---

### Statistics

| Metric | Before | After | Delta |
|:-------|:-------|:------|:------|
| Registry Lines | 34 | 41 | +7 |
| System Overview Lines | 61 | 93 | +32 |
| Architecture Lines | 68 | 100 | +32 |
| Insights Index Lines | 28 | 30 | +2 |
| Total Memory Bank Size | ~400 lines | ~473 lines | +18% |

### Design Principles Applied

✅ **Zero Code Duplication** — Used file/line references instead of embedding code  
✅ **Diagram-First Documentation** — Added Mermaid flow for TTFT architecture  
✅ **Rationale Over History** — Documented *why* decisions were made, not *when*  
✅ **Progressive Disclosure** — Maintained layer structure (registry → overview → details)  
✅ **Lean & Scannable** — No file exceeds 100 lines; all use tables/bullets for quick scanning

---

## Previous Update: 2025-12-21

Initial creation of Project Memory Bank structure with:
- Core vision and system overview
- Physics-based resource calculation rationale
- I18n and configuration system documentation
- Data flow pipeline architecture

---

## Maintenance Notes

- **Next Update Threshold:** When new service modules are added or major UI patterns emerge
- **Anti-Pattern Warning:** Do NOT add per-sprint task logs or historical narratives
- **Size Discipline:** If any file exceeds 100 lines, consider splitting with "Go Deeper" markers
