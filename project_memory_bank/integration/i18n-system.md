---
name: I18n System
description: Bilingual translation system (EN/ZH)
last_updated: 2025-12-10
---

# I18n System

## Architecture

### Design Pattern
**Object-based dictionary** with manual translation lookup.

**Why not i18n library?**
- Only 2 languages (EN/ZH)
- ~50 translation keys
- No pluralization/complex formatting needed
- Keeps bundle size minimal (<1KB for all translations)

## Translation Dictionary

### Structure
```javascript
const I18N = {
  en: {
    // UI labels
    eyebrow: "Offline · Serverless",
    title: "LLM Resource Sizer",
    modelParams: "Model params (B)",
    // ... ~50 keys
    
    // Special: Array for assumptions
    assumptions: [
      "Prefill FLOPs = 2 * active_params...",
      "Decode FLOPs/token ≈ ...",
      // ...
    ],
  },
  zh: {
    eyebrow: "离线 · 无服务器",
    title: "LLM 资源估算",
    modelParams: "模型参数量 (B)",
    // ... corresponding Chinese translations
    
    assumptions: [
      "Prefill FLOPs = 2 * active_params...",
      // ... (Chinese translations)
    ],
  },
};
```

### Translation Categories

**UI Labels** (form fields):
- `modelParams`, `activeParams`, `weightPrecision`, etc.
- `promptTokens`, `newTokens`, `batchSize`, etc.
- `utilCompute`, `utilBw`

**Help Text** (small explanatory text):
- `modelPresetHelp`, `activeParamsHelp`
- `utilComputeHelp`, `utilBwHelp`

**Section Headers**:
- `sectionModel`, `sectionWorkload`, `sectionResults`

**Results Labels**:
- `requiredVram`, `requiredCompute`, `requiredBandwidth`
- `bandwidthConservative`, `bandwidthOptimistic`
- `weightsLabel`, `promptLabel`, `budgetLabel`, `ttftLabel`

**Compute Units**:
- `computeUnitOptions`: Nested object with unit labels

**Assumptions**:
- `assumptions`: Array of formula descriptions

## Translation Functions

### `t(key)`
Retrieves translation for current language.

```javascript
function t(key) {
  const dict = I18N[currentLang] || I18N.en;
  return dict[key] || I18N.en[key] || key;
}
```

**Fallback chain**:
1. Current language dictionary
2. English dictionary
3. Key itself (if missing)

**Usage**:
```javascript
const label = t("requiredVram");  // "Required VRAM / HBM" or "显存 / HBM 需求"
```

### `applyStaticTranslations()`
Updates all static UI text (not dynamically rendered content).

```javascript
function applyStaticTranslations() {
  const dict = I18N[currentLang] || I18N.en;
  
  // Update all [data-i18n] elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (dict[k]) el.textContent = dict[k];
  });
  
  // Update compute unit dropdown options
  const unitOptions = dict.computeUnitOptions || I18N.en.computeUnitOptions;
  const sel = byId("computeUnit");
  Array.from(sel.options).forEach((opt) => {
    if (unitOptions[opt.value]) opt.textContent = unitOptions[opt.value];
  });
}
```

**Called**:
- On page load (default English)
- On language switch

## HTML Translation Markup

### Static Elements
Use `data-i18n` attribute:

```html
<span data-i18n="modelParams">Model params (B)</span>
<small data-i18n="modelPresetHelp">You can edit any value after prefilling.</small>
<h2 data-i18n="sectionResults">Results</h2>
```

**How it works**:
- Attribute value = key in `I18N` object
- `applyStaticTranslations()` updates `textContent`
- Initial HTML text is English (fallback if JS disabled)

### Dynamic Elements
Use `t(key)` in JavaScript:

```javascript
// In render() function
byId("vramCard").innerHTML = `
  <strong>${t("requiredVram")}</strong>
  <div class="metric">${fmt(results.totalVramGb, 2)} GB</div>
  <div class="sub">${t("weightsLabel")}: ${fmt(...)} GB · KV: ${fmt(...)} GB</div>
`;
```

## Language Switching

### Flow
```
User changes #langSelect dropdown (en → zh)
  ↓
change event
  ↓
currentLang = "zh"
  ↓
applyStaticTranslations()
  ├─ Update all [data-i18n] elements
  └─ Update compute unit dropdown
  ↓
updatePresetLink(getSelectedPreset())
  └─ Update aria-label with translated text
  ↓
computeAndRender()
  └─ Re-render dynamic content with t() calls
```

### No Page Reload
- All translation happens in JavaScript
- No network requests
- Instant language switching

## Translation Maintenance

### Adding New String

**1. Add to both dictionaries**:
```javascript
const I18N = {
  en: {
    // ... existing keys
    newFeatureLabel: "New Feature",
  },
  zh: {
    // ... existing keys
    newFeatureLabel: "新功能",
  },
};
```

**2. Use in HTML** (static):
```html
<span data-i18n="newFeatureLabel">New Feature</span>
```

**3. Or use in JS** (dynamic):
```javascript
const label = t("newFeatureLabel");
```

### Adding New Language

**1. Add language to dictionary**:
```javascript
const I18N = {
  en: { /* ... */ },
  zh: { /* ... */ },
  es: {
    // Spanish translations
    eyebrow: "Sin conexión · Sin servidor",
    title: "Calculadora de Recursos LLM",
    // ... all keys translated
  },
};
```

**2. Add option to language dropdown**:
```html
<select id="langSelect">
  <option value="en">English</option>
  <option value="zh">中文</option>
  <option value="es">Español</option>
</select>
```

**3. Test**:
- Switch to new language
- Verify all static text updates
- Verify dynamic results render correctly

## Special Cases

### Compute Unit Options
Nested object for dropdown labels:

```javascript
computeUnitOptions: {
  tflops: "TFLOPS",
  gflops: "GFLOPS",
  pflops: "PFLOPS",
  tops_int8: "TOPS (INT8)",
  tops_int4: "TOPS (INT4)",
}
```

**Usage**:
```javascript
const unitLabel = (I18N[currentLang]?.computeUnitOptions || I18N.en.computeUnitOptions)[unit];
```

### Assumptions Array
Formula descriptions stored as array:

```javascript
assumptions: [
  "Prefill FLOPs = 2 * active_params * prompt_tokens + attention ~ 4 * layers * prompt² * hidden_size;",
  "Decode FLOPs/token ≈ 2 * active_params + 4 * layers * avg_seq * hidden_size (avg_seq ≈ prompt + new/2).",
  // ...
]
```

**Rendering**:
```javascript
const assumptionLines = I18N[currentLang]?.assumptions || I18N.en.assumptions;
byId("assumptions").textContent = assumptionLines.join(" ");
```

### Template Strings with Placeholders
For dynamic values within translations:

```javascript
// Translation with placeholder
speedNote: "Assumes speedup x{speed} vs BF16/FP16. Raw: {raw} TFLOPS.",

// Usage
const note = (t("speedNote") || "")
  .replace("{speed}", SPEEDUP[unit])
  .replace("{raw}", fmtCompute(results.requiredTflops));
```

## Translation Coverage

### Current Status
- **English**: 100% (base language)
- **Chinese**: 100% (all keys translated)

### Keys by Category
- **Labels**: ~20 keys
- **Help text**: ~5 keys
- **Results**: ~10 keys
- **Section headers**: ~5 keys
- **Compute units**: 5 keys
- **Assumptions**: 4 strings
- **Misc**: ~5 keys

**Total**: ~50 translation keys

## Best Practices

### 1. Always Provide Fallback
```javascript
const dict = I18N[currentLang] || I18N.en;
return dict[key] || I18N.en[key] || key;
```

### 2. Keep Translations in Sync
When adding key, add to **all** language dictionaries immediately.

### 3. Use Semantic Keys
```javascript
// Good
modelParams: "Model params (B)"

// Bad
mp: "Model params (B)"
```

### 4. Avoid Hardcoded Text
```javascript
// Bad
byId("card").innerHTML = `<strong>Required VRAM</strong>`;

// Good
byId("card").innerHTML = `<strong>${t("requiredVram")}</strong>`;
```

### 5. Test Both Languages
Always verify:
- Static text updates correctly
- Dynamic content renders correctly
- No missing translations (check browser console)

## 📚 Go Deeper
- **Data flow**: See `data-flow.md` (language switch section)
- **UI functions**: See `../modules/ui/interface.md`

