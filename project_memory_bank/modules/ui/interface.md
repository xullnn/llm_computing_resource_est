---
name: UI Interface
description: Function signatures and event flow
last_updated: 2025-12-10
---

# UI Interface

## Core Functions

### `init()`
Initialization function called on DOMContentLoaded.

**Steps**:
1. Populate model preset dropdown from `MODEL_PRESETS`
2. Apply first preset to form fields
3. Update Hugging Face link for first preset
4. Apply static translations (default English)
5. Bind event listeners to inputs/selects
6. Trigger initial calculation and render

### `computeAndRender()`
Main reactive function triggered on every input change.

**Flow**:
```
gatherInputs() → calcRequirements(inputs) → render(results)
```

**Called by**:
- Input/change events on all form fields
- Preset selection change
- Language switch (after translation update)

## Preset Management

### `populatePresetSelect()`
Fills the model preset dropdown with options.

**Logic**:
- Iterate `MODEL_PRESETS`
- Create `<option>` elements with format: `${provider} · ${name}`
- Set `value` to preset `id`
- Select first preset by default

### `applyPreset(preset)`
Auto-fills form fields from preset object.

**Fields updated**:
- `paramsB`: Total parameters
- `activeParamsB`: Active params (or empty if same as total)
- `weightPrecision`: Weight quantization
- `kvPrecision`: KV cache precision
- `hiddenSize`: Hidden dimension (or empty if auto-estimate)
- `numLayers`: Layer count (or empty if auto-estimate)

### `getSelectedPreset()`
Returns the currently selected preset object.

**Returns**: Preset object or `undefined`

### `updatePresetLink(preset)`
Shows/hides Hugging Face link based on preset.

**Logic**:
- If preset has `hfUrl`, show link and set `href`
- Update `aria-label` with preset info
- Hide if no URL available

## Input/Output

### `gatherInputs()`
Reads all form values into a structured object for calculator.

**Returns**:
```javascript
{
  paramsB: number,
  activeParamsB: number | undefined,
  heads: number | undefined,           // From preset, not form
  weightPrecision: string,
  kvPrecision: string,
  hiddenSize: number | undefined,
  layers: number | undefined,
  promptTokens: number,
  newTokens: number,
  batchSize: number,
  targetTps: number,
  ttftMs: number,
  utilCompute: number,
  utilBandwidth: number,
}
```

**Note**: Merges form values with preset metadata (heads, activeParamsB fallback)

### `render(results)`
Updates DOM with calculation results.

**Updates**:
1. **VRAM card**: Total GB, breakdown (weights, KV cache)
2. **Compute card**: TFLOPS/TOPS, active vs total params, speedup note
3. **Bandwidth card**: Conservative & optimistic estimates
4. **TTFT card**: Estimated ms or prompt for hardware specs
5. **Assumptions**: Formula summary text

**Handles**:
- Unit conversion (TFLOPS → GFLOPS/PFLOPS/TOPS)
- Missing values (shows "—" for undefined)
- Language-specific formatting

### `readNumber(id)`
Helper to safely parse number from input field.

**Returns**: `number | undefined`

## I18n Functions

### `t(key)`
Translates a key to current language.

**Parameters**: `key: string`  
**Returns**: Translated string or English fallback

### `applyStaticTranslations()`
Updates all elements with `[data-i18n]` attributes.

**Logic**:
- Query all `[data-i18n]` elements
- Set `textContent` from `I18N[currentLang][key]`
- Update compute unit dropdown options

### `I18N` object
Translation dictionary with structure:
```javascript
{
  en: { key: "English value", ... },
  zh: { key: "中文值", ... },
}
```

**Keys include**:
- UI labels: `modelParams`, `promptTokens`, etc.
- Help text: `modelPresetHelp`, `utilComputeHelp`, etc.
- Results: `requiredVram`, `requiredCompute`, etc.
- Assumptions: Array of formula descriptions

## Unit Conversion

### `convertCompute(valueTflops, unit)`
Converts TFLOPS to other compute units.

**Parameters**:
- `valueTflops: number` - Value in TFLOPS
- `unit: "tflops"|"gflops"|"pflops"|"tops_int8"|"tops_int4"`

**Returns**: Converted value (or `undefined` if input invalid)

**Speedup factors**:
- TOPS INT8: ÷2.0 (assumes 2× speedup over FP16)
- TOPS INT4: ÷3.5 (assumes 3.5× speedup over FP16)

## Utility Functions

### `byId(id)`
Shorthand for `document.getElementById(id)`.

### `fmt(num, digits=2)`
Formats number for display.

**Logic**:
- Non-finite → "—"
- `|num| >= 1000` → No decimals
- Otherwise → Fixed decimal places

### `fmtCompute(num)`
Specialized formatting for compute values.

**Logic**:
- `|num| >= 1000` → No decimals
- `|num| >= 1` → 2 decimals
- `|num| >= 0.01` → 3 decimals
- Otherwise → Scientific notation (2 decimals)

## Event Binding

### Input/Select Listeners
All `input` and `select` elements get two listeners:
- `input` event → `computeAndRender()`
- `change` event → `computeAndRender()`

### Preset Dropdown
- `change` event → `handlePresetSelect()`
  - Get selected preset
  - Apply preset to form
  - Update HF link
  - Trigger computation

### Language Dropdown
- `change` event → Update `currentLang` → `applyStaticTranslations()` → Update HF link → `computeAndRender()`

## Constants

### `SPEEDUP`
Assumed speedup factors for integer ops:
```javascript
{
  tops_int8: 2.0,   // 2× faster than FP16
  tops_int4: 3.5,   // 3.5× faster than FP16
}
```

## 📚 Go Deeper
- **Translation system**: See `../../integration/i18n-system.md`
- **Data flow**: See `../../integration/data-flow.md`
- **Calculator API**: See `../calculator/interface.md`

