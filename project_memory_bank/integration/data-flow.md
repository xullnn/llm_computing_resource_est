---
name: End-to-End Data Flow
description: How data flows from user input to results display
last_updated: 2025-12-10
---

# Data Flow

## Full Cycle Overview

```
Page Load
  ↓
init() - Populate presets, apply first, bind events
  ↓
computeAndRender() - Initial calculation
  ↓
[User Interaction Loop]
  ↓
Input change → computeAndRender()
  ↓
gatherInputs() → calcRequirements() → render()
  ↓
DOM updated with new results
```

## Step-by-Step Flow

### 1. Initialization (`init()`)

**Trigger**: `DOMContentLoaded` event

**Steps**:
1. `populatePresetSelect()` - Create dropdown options from `MODEL_PRESETS`
2. `applyPreset(MODEL_PRESETS[0])` - Fill form with Qwen3-235B-FP8 values
3. `updatePresetLink(MODEL_PRESETS[0])` - Show Hugging Face link
4. `applyStaticTranslations()` - Apply English translations (default)
5. Bind event listeners:
   - All `input`/`select` → `computeAndRender()`
   - `#modelPreset` → `handlePresetSelect()`
   - `#langSelect` → Language switch handler
6. `computeAndRender()` - Initial calculation and display

### 2. Preset Selection

**Trigger**: User selects different model from dropdown

**Flow**:
```
User selects preset
  ↓
change event on #modelPreset
  ↓
handlePresetSelect()
  ├─ getSelectedPreset() - Find preset by ID
  ├─ applyPreset(preset) - Fill form fields
  │   ├─ paramsB
  │   ├─ activeParamsB
  │   ├─ weightPrecision
  │   ├─ kvPrecision
  │   ├─ hiddenSize (optional)
  │   └─ numLayers (optional)
  ├─ updatePresetLink(preset) - Update HF link
  └─ computeAndRender() - Recalculate
```

**Example**: User switches from Qwen3-235B to Llama 3.1 70B
- Form updates: 235B → 70B, FP8 → BF16, etc.
- Calculator uses new values
- Results show 70B requirements

### 3. Input Change

**Trigger**: User modifies any input field

**Flow**:
```
User changes input (e.g., prompt tokens: 10000 → 50000)
  ↓
input/change event
  ↓
computeAndRender()
  ↓
gatherInputs()
  ├─ Read all form values via byId()
  ├─ Parse numbers via readNumber()
  ├─ Merge with preset metadata (heads, activeParamsB)
  └─ Return input object
  ↓
calcRequirements(inputs)
  ├─ Estimate missing params (layers, hiddenSize if needed)
  ├─ Calculate memory (weights + KV + workspace)
  ├─ Calculate compute (decode FLOPs)
  ├─ Calculate bandwidth (weight streaming + KV)
  ├─ Calculate TTFT (if hardware provided)
  └─ Return results object
  ↓
render(results)
  ├─ Convert compute to selected unit (TFLOPS/GFLOPS/etc)
  ├─ Format numbers (fmt, fmtCompute)
  ├─ Update #vramCard innerHTML
  ├─ Update #computeCard innerHTML
  ├─ Update #bandwidthCard innerHTML
  ├─ Update #ttftCard innerHTML
  └─ Update #assumptions text
  ↓
DOM reflects new calculation (<5ms total)
```

### 4. Results Rendering

**Trigger**: `render(results)` called with calculation output

**Cards Updated**:

#### VRAM Card
```
Required VRAM / HBM
[123.45 GB]
Weights: 140 GB · KV: 5.12 GB
```
- **Metric**: `totalVramGb`
- **Details**: `weightBytesTotal`, `kvCacheBytes`

#### Compute Card
```
Required compute
[2.34 TFLOPS]
Active params: 37B · Total params: 671B
Assumes speedup x2 vs BF16/FP16. Raw: 1.17 TFLOPS.
```
- **Metric**: `requiredTflops` (converted to selected unit)
- **Details**: `activeParamsB`, `paramsB`, speedup note for TOPS

#### Bandwidth Card
```
Required memory bandwidth
[456.78 GB/s]
Conservative (weights streamed):  456.78 GB/s
Optimistic (weights resident):     91.36 GB/s
```
- **Metric**: `requiredBwGbpsConservative` (primary)
- **Breakdown**: Conservative vs optimistic estimates

#### TTFT Card
```
TTFT
[1234 ms]
Budget: 1500 ms · Prompt: 10000
```
- **Metric**: `ttftMs` (if hardware provided)
- **Fallback**: "Provide peak TFLOPS to estimate TTFT"
- **Details**: `ttftBudgetMs`, prompt token count

### 5. Language Switch

**Trigger**: User changes language dropdown

**Flow**:
```
User selects language (en → zh)
  ↓
change event on #langSelect
  ↓
currentLang = "zh"
  ↓
applyStaticTranslations()
  ├─ Update all [data-i18n] elements
  └─ Update compute unit dropdown labels
  ↓
updatePresetLink(getSelectedPreset())
  └─ Update aria-label with translated text
  ↓
computeAndRender()
  └─ Re-render cards with Chinese translations
```

**What changes**:
- All labels and help text
- Result card headings
- Assumptions text
- No recalculation needed (numbers stay same)

## Data Structures

### Input Object (from `gatherInputs()`)
```javascript
{
  paramsB: 235,
  activeParamsB: 22,
  heads: 64,
  weightPrecision: "fp8",
  kvPrecision: "fp8",
  hiddenSize: 4096,
  layers: 94,
  promptTokens: 10000,
  newTokens: 200,
  batchSize: 1,
  targetTps: 10,
  ttftMs: 1500,
  utilCompute: 0.45,
  utilBandwidth: 0.6,
}
```

### Results Object (from `calcRequirements()`)
```javascript
{
  // Model params
  paramsB: 235,
  activeParamsB: 22,
  hiddenSize: 4096,
  layers: 94,
  // ... etc
  
  // Memory
  totalVramGb: 123.45,
  weightBytesTotal: 123456789012,
  kvCacheBytes: 5368709120,
  workspaceBytes: 14814814813,
  
  // Compute
  requiredTflops: 1.234,
  effectiveTflops: undefined,
  
  // Bandwidth
  requiredBwGbps: 456.78,
  requiredBwGbpsConservative: 456.78,
  requiredBwGbpsOptimistic: 91.36,
  effectiveBwGbps: undefined,
  
  // TTFT
  ttftMs: undefined,
  ttftBudgetMs: 1500,
  
  // Status
  computeOk: undefined,
  vramOk: undefined,
  bandwidthOk: undefined,
}
```

## Key Principles

### 1. Unidirectional Flow
Data flows one way: **Input → Calculation → Render**
- No circular dependencies
- Easy to debug (follow the flow)
- Predictable state management

### 2. Reactive Updates
Every input change triggers full recalculation.
- **Why**: Calculations are fast (<5ms)
- **Benefit**: Always shows correct results
- **No optimization needed**: Vanilla JS math is instant

### 3. Pure Functions
`calcRequirements()` has no side effects.
- **Input**: Plain object
- **Output**: Plain object
- **No DOM access**: Calculator module doesn't know about UI
- **Testable**: Easy to unit test

### 4. Separation of Concerns
- **Models** (`models.js`): Data only
- **Calculator** (`calc.js`): Pure logic, no UI
- **UI** (`ui.js`): Presentation only, delegates calculation
- **Clear interfaces**: Each module has well-defined API

### 5. Preset Override Pattern
Presets are starting points, not constraints.
- User can override any value
- Calculator uses **actual form values**, not preset
- Preset metadata (heads) merged in `gatherInputs()`

## Performance Notes

### Calculation Speed
- Typical calculation: **<5ms**
- Real-time updates feel instant
- No throttling/debouncing needed

### DOM Updates
- Only 4 cards updated (targeted innerHTML replacement)
- No virtual DOM overhead
- Direct DOM manipulation sufficient at this scale

### Memory
- No persistent state (everything derived from inputs)
- No memory leaks (no long-lived closures)
- Lightweight (~150KB total code)

## 📚 Go Deeper
- **Calculator implementation**: See `../modules/calculator/interface.md`
- **UI functions**: See `../modules/ui/interface.md`
- **I18n system**: See `i18n-system.md`
- **Architecture rationale**: See `../insights/architecture.md`

