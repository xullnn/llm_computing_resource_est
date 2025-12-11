---
name: UI Module
description: Presentation layer with bilingual interface and real-time rendering
file: js/ui.js
load_when: UI changes, i18n updates, display logic debugging
go_deeper:
  - interface.md: Function signatures and event flow
  - implementation.md: Translation system internals
last_updated: 2025-12-11
---

# UI Module

## What
Orchestrates user interaction: preset selection, input gathering, calculation 
triggering, results rendering, language switching, and landing-page copy.

## Key Functions

### Lifecycle
- `init()`: On DOMContentLoaded, populate presets, bind events, initial render
- `computeAndRender()`: Gather inputs → call `calcRequirements()` → update DOM

### Preset Management
- `populatePresetSelect()`: Fill dropdown from `MODEL_PRESETS`
- `applyPreset(preset)`: Auto-fill form fields from selected model
- `updatePresetLink(preset)`: Show/hide Hugging Face link

### Input/Output
- `gatherInputs()`: Read form values into structured object
- `render(results)`: Update 4 result cards + assumptions text

### I18n
- `I18N` object: English & Chinese translations for calculator + landing content
- `t(key)`: Get translation for current language
- `applyStaticTranslations()`: Update all `[data-i18n]` elements (landing hero/features/how-use-cases/models + calculator UI)

### Unit Conversion
- `convertCompute()`: TFLOPS ↔ GFLOPS/PFLOPS/TOPS with speedup factors

## Event Flow
```
User changes input
    ↓
input/change event
    ↓
computeAndRender()
    ↓
gatherInputs() → calcRequirements() → render()
    ↓
DOM updated (VRAM, compute, bandwidth, TTFT cards)
```

## Key Features
- **Real-time updates**: Every input change triggers recalculation (<5ms)
- **Preset integration**: Merges preset metadata with user overrides
- **Bilingual**: EN/ZH with dynamic switching (no page reload)
- **Unit flexibility**: Choose TFLOPS/GFLOPS/PFLOPS/TOPS for compute display

## When to Update
- Adding new languages (expand `I18N` object)
- New result metrics (add card to `render()`)
- Form field additions (update `gatherInputs()`)
- Unit conversions (e.g., watts, cost estimates)

## 📚 Go Deeper
- **API**: See `interface.md`
- **I18n system**: See `../../integration/i18n-system.md`
- **Data flow**: See `../../integration/data-flow.md`
