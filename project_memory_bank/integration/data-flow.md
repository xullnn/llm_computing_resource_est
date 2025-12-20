---
name: End-to-End Data Flow
description: Build-time to runtime lifecycle of model and hardware data
last_updated: 2025-12-20
---

# Data Flow

## ⚡ The Pipeline Lifecycle

Data moves through distinct phases: **Configuration → Discovery → Enrichment → Validation → Consumption**.

```mermaid
sequenceDiagram
    participant CFG as scripts/config.json
    participant SCRIPT as scripts/fetch-models.js
    participant HF_LIST as HF API (List)
    participant HF_IND as HF API (Individual)
    participant OVER as data/overrides.json
    participant DATA as data/models.json
    participant UI as Browser (js/ui.js)

    Note over SCRIPT: Manual Trigger
    SCRIPT->>CFG: Load Vendors + Param Range
    
    loop For each vendor
        SCRIPT->>HF_LIST: Query author={vendor}
        HF_LIST-->>SCRIPT: Model list (dates, tags)
    end
    
    SCRIPT->>SCRIPT: Deduplicate + Date filter
    
    loop For each candidate
        SCRIPT->>HF_IND: GET /api/models/{id}
        HF_IND-->>SCRIPT: Safetensors.total
        SCRIPT->>HF_IND: GET config.json
        HF_IND-->>SCRIPT: Architecture metadata
        SCRIPT->>SCRIPT: Validate param range (70-700B)
    end
    
    SCRIPT->>OVER: Merge manual overrides
    SCRIPT->>SCRIPT: Anomaly detection (±50% check)
    SCRIPT->>DATA: Write updated JSON
    
    Note over UI: User Visit
    UI->>DATA: Fetch JSON (Models + Hardware)
    UI->>UI: Populate Filters + Cards
    Note over UI: User Selects DeepSeek-V3 + 8x H100
    UI->>UI: Aggregate: 8×80GB = 640GB VRAM
    UI-->>User: Display Verdict + Recommendations
```

## 📂 Data Storage Structures

### 1. Model Data (`/data/models.json`)
Vendor-exclusive list of 73 models (70-700B, 7 vendors, 2-year window). Each entry includes:
*   **Identification**: `id`, `name`, `huggingface_url`.
*   **Architecture**: `architecture` (dense/moe), `num_layers`, `hidden_size`.
*   **MoE Details**: `moe_num_experts`, `moe_top_k`.
*   **Provenance**: `param_source` (safetensors > manual_override > stated > estimated).

### 2. Hardware Data (`/data/hardware/`)
Vendor-specific files (e.g., `nvidia.json`, `huawei.json`) to prevent merge conflicts.
*   **Specs**: `vram_gb`, `bandwidth_gbps`, `bf16_tflops`.
*   **Constraints**: `max_cards_per_node` (e.g., 8 for H100, 72 for GB200).

## 🎛️ Configuration System

### `scripts/config.json` (Centralized Settings)
```yaml
vendors: [google, anthropic, openai, Qwen, deepseek-ai, nvidia, apple]
params: { min: 70, max: 700 }
cutoffDays: 730
```

Controls:
- Which vendors to query (exclusive whitelist)
- Parameter range filter (70-700B for enterprise relevance)
- Time window (2 years for stability-focused deployments)

### `data/overrides.json` (Manual Metadata)
For models that cannot be auto-fetched (e.g., gated repos like Llama 3.1 405B):
```yaml
models:
  - id: meta-llama/Llama-3.1-405B-Instruct
    parameters_billion: 405.0
    param_source: manual_override
```

## 🧮 Calculation Interface

The UI (`js/ui.js`) acts as the glue between data and logic:

1.  **Gather Inputs**: Reads model architecture + selected GPU count.
2.  **Apply Logic**: Passes values to `calcRequirements()` in `js/calc.js`.
3.  **Aggregate Capacity**:
    *   `TotalVRAM = SingleVRAM × Count`
    *   `TotalCompute = SingleTFLOPS × Count`
4.  **Render**: Updates the 4 metric cards (VRAM, Compute, Bandwidth, TTFT).

## 🔍 Model Explorer Discovery

**Interface**: `models/index.html`

Multi-dimensional filtering system:
- **Recency**: Last Month, 3 Months, 6 Months, Year, All Time
- **Organization**: Auto-populated from vendor whitelist
- **Architecture**: Dense vs MoE
- **Size**: 70-100B, 100-200B, 200-400B, 400B+
- **Sort**: Newest, Largest, Most Popular

**Features**:
- Freshness indicators (🟢 <7 days, 🟡 <30 days)
- Data provenance badges (Safetensors, Stated, Estimated)
- Side-by-side comparison mode (up to 4 models)

## 🌍 i18n Data Flow

Translations are handled by a static dictionary in `js/ui.js`.
*   **Static Elements**: `[data-i18n]` attributes in HTML.
*   **Dynamic Elements**: Model names and hardware descriptions translated via the `t()` helper during rendering.
