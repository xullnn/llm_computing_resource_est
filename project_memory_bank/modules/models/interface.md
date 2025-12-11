---
name: Models Interface
description: MODEL_PRESETS schema and structure
last_updated: 2025-12-10
---

# Models Interface

## Data Structure

### `MODEL_PRESETS`
Array of model preset objects. Each preset has the following schema:

```javascript
{
  // Identity
  id: string,                   // Unique identifier (e.g., "qwen3-235b-a22b-fp8")
  provider: string,             // Organization (e.g., "Qwen", "Meta", "DeepSeek")
  name: string,                 // Human-readable name
  repo: string,                 // Hugging Face repo path (e.g., "Qwen/Qwen3-235B-A22B-Thinking-2507-FP8")
  hfUrl: string,                // Full Hugging Face URL
  
  // Model parameters
  paramsB: number,              // Total parameters (billions)
  activeParamsB: number,        // Active params per token (MoE) or same as paramsB (dense)
  
  // Architecture (from config.json)
  hiddenSize: number,           // Hidden dimension (d_model)
  layers: number,               // Number of transformer layers
  heads: number,                // Number of query attention heads
  
  // Precision
  weightPrecision: "bf16"|"fp16"|"fp8"|"int8"|"int4",
  kvPrecision: "bf16"|"fp16"|"fp8",
}
```

## Current Presets (16 models)

### Qwen (5 models)
- **qwen3-235b-a22b-fp8**: 235B total, 22B active, FP8 (largest MoE)
- **qwen3-next-80b**: 81B total, 3B active, BF16 (efficient MoE)
- **qwen3-32b**: 32B dense, BF16
- **qwen3-14b**: 14B dense, BF16
- **qwen3-8b**: 8B dense, BF16

### DeepSeek (3 models)
- **deepseek-v3**: 671B total, 37B active, BF16 (largest model)
- **deepseek-r1**: 671B total, 37B active, BF16 (reasoning variant)
- **deepseek-v2-chat**: 236B total, 38B active, BF16

### Meta (2 models)
- **llama-3.1-70b**: 70B dense, BF16
- **llama-3.1-8b**: 8B dense, BF16

### Mistral (2 models)
- **mixtral-8x22b**: 141B total, 44B active, BF16
- **mixtral-8x7b**: 47B total, 12B active, BF16

### Google (2 models)
- **gemma2-27b**: 27B dense, BF16
- **gemma2-9b**: 9B dense, BF16

### Databricks (1 model)
- **dbrx**: 132B total, 36B active, BF16

### 01.AI (1 model)
- **yi-1.5-34b**: 34B dense, BF16

## Usage Pattern

### In UI Module
```javascript
// Populate dropdown
MODEL_PRESETS.forEach((m, idx) => {
  const opt = document.createElement("option");
  opt.value = m.id;
  opt.textContent = `${m.provider} · ${m.name}`;
  sel.appendChild(opt);
});

// Get selected preset
function getSelectedPreset() {
  return MODEL_PRESETS.find(m => m.id === byId("modelPreset").value);
}

// Apply preset to form
function applyPreset(preset) {
  byId("paramsB").value = preset.paramsB;
  byId("activeParamsB").value = preset.activeParamsB || "";
  byId("weightPrecision").value = preset.weightPrecision || "bf16";
  byId("kvPrecision").value = preset.kvPrecision || "bf16";
  byId("hiddenSize").value = preset.hiddenSize || "";
  byId("numLayers").value = preset.layers || "";
}
```

## Adding New Presets

### Process
1. Find model on Hugging Face
2. Download `config.json` from model repo
3. Extract architecture params:
   - `hidden_size` → hiddenSize
   - `num_hidden_layers` → layers
   - `num_attention_heads` → heads
   - For MoE: check `num_experts_per_tok` or similar
4. Calculate total params (from model card or sum of tensors)
5. Determine default precision (usually BF16, unless quantized variant)
6. Add to `MODEL_PRESETS` array in `js/models.js`

### Example Entry
```javascript
{
  id: "llama-4-70b",
  provider: "Meta",
  name: "Llama 4 70B",
  repo: "meta-llama/Llama-4-70B-Instruct",
  hfUrl: "https://huggingface.co/meta-llama/Llama-4-70B-Instruct",
  paramsB: 70,
  activeParamsB: 70,  // Dense model
  hiddenSize: 8192,   // From config.json
  layers: 80,         // From config.json
  heads: 64,          // From config.json
  weightPrecision: "bf16",
  kvPrecision: "bf16",
}
```

## 📚 Go Deeper
- **How presets are used**: See `../ui/interface.md` (gatherInputs function)
- **Architecture params meaning**: See `../../core/glossary.md`

