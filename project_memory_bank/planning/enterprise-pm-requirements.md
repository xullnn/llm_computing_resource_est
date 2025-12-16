---
name: Enterprise PM Requirements
description: Pain points, data requirements, and implementation architecture for AI product managers deploying open-source LLMs
created: 2025-12-14
updated: 2025-12-14
status: implementation-ready
deployment: Vercel (static hosting)
---

# Enterprise PM Requirements

## 📋 Context

### Target User
**AI App Product Managers** who:
- Developed AI-powered applications for business customers
- Need to deploy open-source LLMs on servers due to data privacy/security requirements
- Sell server + AI app bundles to different customer tiers
- Have general business/tech background but not deep ML infrastructure expertise

### Business Model
- **Not** buying servers for internal use
- **Selling** servers bundled with AI applications to enterprise customers
- Different customer tiers → Different server configurations (e.g., 80B model tier vs 235B model tier)

### Constraints
- **Only open-source models** — For accessibility and deployment flexibility
- **Only 80B+ parameter models** — Enterprise use cases require large model capabilities
- **Focus on finding solutions** — Not cost/ROI optimization at this stage

---

## 🎯 Pain Points Analysis

### 1. Model → Hardware Mapping
> "To run DeepSeek-V3 (685B MoE), what are ALL the valid hardware configurations?"

**Challenge:**
- Don't know minimum VRAM requirements for a given model
- Don't understand the relationship between model architecture (dense vs MoE) and hardware needs
- Can't enumerate which GPU/NPU combinations could work

**What they need:**
- Given a model name → List all valid hardware configurations
- Include different quantization options (BF16, FP8, INT4) and their trade-offs
- Show multi-GPU requirements when single GPU insufficient

---

### 2. "Can Run" vs "Can Run Under Load"
> "Can this configuration handle 50 concurrent users sending 8K token requests?"

**Challenge:**
- "Works in testing" ≠ "Works in production"
- No understanding of how concurrent users affect memory (KV cache multiplication)
- Can't estimate queue depth or latency degradation under load

**What they need:**
- Throughput estimation: tokens/second at different concurrency levels
- Memory scaling: How KV cache grows with batch size and sequence length
- Latency bounds: When does response time become unacceptable?

---

### 3. Workload Characterization
> "What's our actual workload? How do I describe it technically?"

**Challenge:**
- Business knows "users send documents for analysis" but not token counts
- Different features have different workloads (chat vs document summarization vs code generation)
- Input/output ratios vary dramatically by use case

**What they need:**
- Workload profiling guidance (how to measure actual usage patterns)
- Workload presets: "Document analysis" = 8K input, 2K output typical
- Workload calculator: Users × requests/min × avg tokens = throughput requirement

---

### 4. Hardware Options Discovery
> "What hardware can actually run 235B models? What are my options?"

**Challenge:**
- Know they need "lots of GPU memory" but don't know specific products
- Unaware of alternatives (AMD, Huawei, Google TPU, Intel)
- Don't know which hardware generations are relevant (H100 vs A100 vs older)

**What they need:**
- Comprehensive hardware database covering:
  - NVIDIA Data Center GPUs (A100, H100, H200, B100, etc.)
  - AMD Instinct GPUs (MI250X, MI300X)
  - Huawei Ascend NPUs (910B, 910C)
  - Google TPUs (v4, v5e, v5p) — Note: typically cloud-only
  - Intel Gaudi accelerators
- Key specs: VRAM, memory bandwidth, compute TFLOPS, interconnect support

---

### 5. Multi-GPU Configuration Complexity
> "I need 8 GPUs — what does that actually mean for the server?"

**Challenge:**
- Don't understand NVLink vs PCIe implications
- Don't know what "tensor parallelism" means for their architecture
- Unaware that GPU topology affects performance significantly

**What they need:**
- Explanation of multi-GPU topologies (NVLink mesh, PCIe tree, etc.)
- Performance implications: NVLink enables faster inter-GPU communication
- Configuration recommendations based on model size

---

### 6. Server Platform Matching
> "I know I need 4× H100, but which server can hold them?"

**Challenge:**
- GPUs don't work standalone — need compatible server chassis
- Power delivery constraints (8× H100 SXM = 5,600W+ for GPUs alone)
- Form factor variations (PCIe cards vs SXM modules)
- Cooling requirements

**What they need:**
- Server platform database:
  - Vendor: SuperMicro, Dell, HPE, Lenovo, Inspur, etc.
  - Max GPU count and supported GPU types
  - Form factor (4U, 8U, etc.)
  - Power capacity
  - NVLink topology support
- Matching logic: "For 8× H100 SXM → Dell PowerEdge XE9680, SuperMicro SYS-821GE-TNHR"

---

### 7. Quantization Trade-offs
> "Can I use INT4 to fit on fewer GPUs? What's the quality impact?"

**Challenge:**
- Know quantization exists but don't understand when it's appropriate
- Can't evaluate quality degradation for their specific use case
- Different models respond differently to quantization

**What they need:**
- Quantization options per model (which models support INT4/INT8/FP8 well)
- Memory savings calculator
- Quality impact indicators (benchmark degradation %)
- Recommendation framework: "For chat, INT4 acceptable; for code gen, FP8 minimum"

---

### 8. Inference Framework Compatibility
> "Does my hardware work with vLLM? TensorRT-LLM? SGLang?"

**Challenge:**
- Framework choice significantly affects throughput
- Not all hardware equally supported by all frameworks
- Some models require specific frameworks for optimal performance

**What they need:**
- Compatibility matrix: Hardware × Framework × Model
- Performance multipliers: "vLLM on H100 achieves X% of theoretical max"
- Recommended framework per hardware family

---

### 9. Availability Reality (Non-Cost)
> "H100s are ideal, but can I actually get them?"

**Challenge:**
- Ideal hardware often has long lead times
- Need to know alternatives that are actually purchasable
- Supply chain varies by region

**What they need:**
- General availability indicators (not real-time, but directional)
- Alternative recommendations: "If H100 unavailable, consider MI300X or 2× H200"
- Regional notes where applicable

---

### 10. Vendor Communication Gap
> "How do I write the RFP? What specs should I include?"

**Challenge:**
- Don't speak vendor/technical language
- Don't know what questions to ask
- Can't evaluate competing proposals

**What they need:**
- Spec sheet generator: Export requirements in vendor-friendly format
- Key specs checklist: VRAM, bandwidth, interconnect, power, cooling
- Comparison framework for evaluating proposals

---

## 📊 Required Datasets

### Dataset 1: Open-Source LLM Models (80B+)

**Purpose:** Enumerate all relevant large open-source models with architecture details

**Required Fields:**
| Field | Description | Example |
|-------|-------------|---------|
| `model_id` | Hugging Face model identifier | `meta-llama/Llama-3.1-405B` |
| `name` | Display name | `Llama 3.1 405B` |
| `parameters` | Total parameter count (billions) | `405` |
| `architecture` | Model type | `dense` or `moe` |
| `hidden_size` | Hidden dimension | `16384` |
| `num_layers` | Transformer layers | `126` |
| `num_heads` | Attention heads | `128` |
| `num_kv_heads` | KV heads (for GQA) | `8` |
| `vocab_size` | Vocabulary size | `128256` |
| `max_seq_length` | Maximum context length | `131072` |
| `moe_num_experts` | (MoE only) Total experts | `256` |
| `moe_top_k` | (MoE only) Active experts | `8` |
| `license` | License type | `llama3.1` |
| `release_date` | Release date | `2024-07-23` |

**Data Source: Hugging Face Hub API**

```
Primary API:
GET https://huggingface.co/api/models?filter=text-generation&sort=downloads

Model Details:
GET https://huggingface.co/api/models/{model_id}

Config (architecture params):
GET https://huggingface.co/{model_id}/raw/main/config.json
```

**Filtering Strategy:**
1. Filter by `pipeline_tag: text-generation`
2. Parse `config.json` for architecture parameters
3. Filter by parameter count ≥ 80B
4. Filter by license (permissive: Apache, MIT, Llama, Qwen, etc.)

**Challenges:**
- Parameter counts not in standard field — must calculate from architecture
- Not all models have complete `config.json`
- Some models have multiple variants (base, instruct, chat)

**Update Frequency:** Weekly (new models release frequently)

---

### Dataset 2: GPU/NPU Hardware Specs (Multi-GPU Focus)

**Purpose:** Database of AI accelerators for **multi-GPU/multi-NPU configuration estimation**

> ⚠️ **Core Feature:** The tool estimates whether configurations like "2× H100" or "4× Huawei Ascend 300I Duo" can run a specific model, NOT single-GPU scenarios. Multi-card deployments are the primary use case.

**Example Questions This Dataset Enables:**
- "Can 2× H100 SXM run Llama 3.1 405B at BF16?"
- "Can 4× Huawei Atlas 300I Duo run DeepSeek-V3 with INT8 quantization?"
- "How many H200 cards needed for Qwen 72B with 32K context?"

**Required Fields:**
| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique identifier | `nvidia-h100-sxm` |
| `vendor` | Manufacturer | `NVIDIA` / `Huawei` |
| `name` | Product name | `H100 SXM` |
| `type` | Accelerator type | `gpu` / `npu` |
| `generation` | Product generation | `Hopper` |
| `vram_gb` | Memory capacity (GB) | `80` |
| `memory_type` | Memory technology | `HBM3` |
| `bandwidth_gbps` | Memory bandwidth (GB/s) | `3350` |
| `fp16_tflops` | FP16 compute (TFLOPS) | `1979` |
| `bf16_tflops` | BF16 compute (TFLOPS) | `1979` |
| `fp8_tflops` | FP8 compute (TFLOPS) | `3958` |
| `int8_tops` | INT8 compute (TOPS) | `3958` |
| `tdp_watts` | Power consumption (W) | `700` |
| `form_factor` | Physical form | `SXM5` / `PCIe` / `Module` |
| `interconnect` | High-speed link | `NVLink 4.0` / `HCCS` |
| `interconnect_bandwidth_gbps` | Link bandwidth (GB/s) | `900` |
| `max_cards_per_node` | Typical max cards per server | `8` |
| `release_year` | Release year | `2022` |
| `status` | Availability status | `available` / `announced` / `eol` |

**Data Sources:**

| Vendor | Source | Notes |
|--------|--------|-------|
| **NVIDIA** | Official data sheets, nvidia.com/data-center | No API; manual extraction from PDFs |
| **Huawei** | e.huawei.com, hiascend.com | No API; some specs in Chinese docs |

**Challenges:**
- **No official APIs exist** for any vendor's hardware specs
- Must maintain as **static curated database** with source URLs
- Specs don't change often — quarterly updates sufficient
- Huawei product naming can be complex (Atlas series has many variants)

**Quality Assurance:**
- Each entry must include `source_url` linking to official documentation
- Include `verified_date` for each entry
- Version control all changes

**Coverage Priority (Phase 1: NVIDIA + Huawei Only):**

> ⚠️ **Note:** The lists below are **preliminary and incomplete**. A thorough investigation of each vendor's full product line is required during implementation.

**Phase 1 — NVIDIA (preliminary):**
- Data Center GPUs: A100, H100, H200, B100, B200, GB200
- Form factors: SXM, PCIe, NVL variants
- _Needs thorough review of current product portfolio_

**Phase 1 — Huawei (preliminary):**
- Ascend series: Atlas 300I Duo, Atlas 800, Ascend 910B, 910C
- Reference: https://e.huawei.com/cn/products/computing/ascend/
- _Needs thorough review of current product portfolio_

**Phase 2+ (Future):**
- AMD Instinct (MI250X, MI300X, MI325X)
- Intel Gaudi (Gaudi 2, Gaudi 3)
- Google TPU (v4, v5e, v5p) — cloud reference only

---

### Dataset 3: Server Platforms (Future)

**Purpose:** Match GPU requirements to compatible server chassis

**Required Fields:**
| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique identifier | `dell-xe9680` |
| `vendor` | Manufacturer | `Dell` |
| `model` | Product name | `PowerEdge XE9680` |
| `max_gpus` | Maximum GPU count | `8` |
| `supported_gpus` | Compatible GPU list | `["H100 SXM", "H200 SXM"]` |
| `form_factor` | Rack units | `6U` |
| `max_power_watts` | Power capacity | `10,200` |
| `nvlink_topology` | NVLink configuration | `Full mesh` |
| `cpu_sockets` | CPU count | `2` |
| `max_ram_tb` | Max system RAM | `4` |

**Data Sources:**
- Dell, HPE, SuperMicro, Lenovo product configurators
- No public APIs — would require manual curation

**Priority:** Lower than Models and GPUs datasets (Phase 2)

---

### Dataset 4: Inference Frameworks (Future)

**Purpose:** Track framework compatibility and performance characteristics

**Required Fields:**
| Field | Description | Example |
|-------|-------------|---------|
| `name` | Framework name | `vLLM` |
| `supported_hardware` | Compatible accelerators | `["NVIDIA", "AMD ROCm"]` |
| `supported_models` | Architecture support | `["Llama", "Qwen", "Mistral"]` |
| `key_features` | Notable capabilities | `PagedAttention, continuous batching` |
| `performance_notes` | Relative performance | `Best for high-throughput serving` |

**Priority:** Lower (Phase 2)

---

## 🔄 Data Pipeline Architecture

### Phase 1: Semi-Automated (Recommended Start)

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
├─────────────────────────────────────────────────────────────────┤
│  Hugging Face API ──────► Auto-fetch model configs              │
│  Official Data Sheets ──► Manual curation → JSON/YAML           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOCAL DATA FILES                            │
├─────────────────────────────────────────────────────────────────┤
│  /data/models.json             ← Model specs (auto-updated)     │
│  /data/hardware/nvidia.json   ← NVIDIA specs (manual)          │
│  /data/hardware/huawei.json   ← Huawei specs (manual)          │
│  /data/platforms.json          ← Server specs (Phase 2)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CALCULATOR ENGINE                           │
├─────────────────────────────────────────────────────────────────┤
│  Load data at runtime → No backend needed                        │
│  All calculations client-side → Privacy preserved                │
└─────────────────────────────────────────────────────────────────┘
```

### Update Workflow

**Models (Weekly):**
1. Script fetches from Hugging Face API
2. Parses config.json for each 80B+ model
3. Generates updated `/data/models.json`
4. Human review before commit

**Hardware (Quarterly):**
1. Check vendor announcements for new products
2. Update vendor-specific file: `/data/hardware/nvidia.json` or `/data/hardware/huawei.json`
3. Include source URLs and verification dates
4. Version control changes

---

## 🏗️ Implementation Architecture

### Deployment Platform: Vercel

The project is hosted on Vercel, which influences our architecture decisions:

| Vercel Feature | How We Use It |
|----------------|---------------|
| **Static Hosting** | HTML/CSS/JS served from global CDN |
| **Build-time Data** | JSON data files baked into static deploy |
| **Serverless Functions** | Not needed (keep serverless philosophy) |
| **Auto-deploy** | Git push → automatic rebuild and deploy |
| **No Persistent Storage** | All data lives in git repo |

**Key Principle:** Data updates happen at build time via GitHub Actions, not at runtime. This preserves the offline-capable, privacy-first architecture.

---

### Site Structure

```
/
├── index.html                    # Main calculator (existing)
├── models/
│   └── index.html               # Open-source model database/explorer
├── hardware/
│   ├── index.html               # Hardware overview (all vendors)
│   ├── nvidia.html              # NVIDIA Data Center GPUs
│   ├── amd.html                 # AMD Instinct GPUs (optional Phase 2)
│   └── huawei.html              # Huawei Ascend NPUs
├── for/
│   ├── hobbyists.html           # (existing persona page)
│   ├── teams.html               # (existing persona page)
│   └── researchers.html         # (existing persona page)
├── data/
│   ├── models.json              # Open-source model specs (auto-updated)
│   └── hardware/                # Hardware specs per vendor (manual, versioned)
│       ├── nvidia.json          # NVIDIA Data Center GPUs
│       └── huawei.json          # Huawei Ascend NPUs
├── scripts/
│   └── fetch-models.js          # Hugging Face API fetcher
├── js/
│   ├── calc.js                  # (existing) calculation engine
│   ├── ui.js                    # (existing) UI logic
│   ├── models.js                # (existing) → migrate to data/models.json
│   └── gpus.js                  # (existing) → migrate to data/hardware/*.json
├── css/
│   └── main.css                 # (existing) styles
└── .github/
    └── workflows/
        └── update-models.yml    # Weekly model data refresh
```

---

### Dedicated Pages

| Page | Purpose | Data Source | Update Frequency |
|------|---------|-------------|------------------|
| `/models/` | Browse/search 80B+ open-source models | `data/models.json` | Weekly (automated) |
| `/hardware/nvidia.html` | NVIDIA GPU reference with full specs | `data/hardware/nvidia.json` | Quarterly (manual) |
| `/hardware/huawei.html` | Huawei Ascend NPU reference | `data/hardware/huawei.json` | Quarterly (manual) |
| `/hardware/` | Cross-vendor comparison overview | `data/hardware/*.json` (all) | Quarterly (manual) |

**Cross-linking UX:**
- Model cards have "Use in Calculator" → navigates to `/?model=llama-3.1-405b`
- Hardware cards have "Compare with Model" → navigates to `/?gpu=h100-sxm`
- Calculator auto-populates from URL parameters

---

### Automated Data Updates (GitHub Actions)

**Why GitHub Actions over Vercel Cron:**

| Approach | Pros | Cons |
|----------|------|------|
| **GitHub Actions** ✅ | Free, git-versioned, simple, works offline | Data "stale" between updates (acceptable) |
| Vercel Cron + KV | Real-time | Costs money, adds runtime dependency |
| Client-side fetch | Always fresh | Slow load, API limits, breaks offline |

**Workflow: Weekly Model Update**

```yaml
# .github/workflows/update-models.yml
name: Update Open-Source Model Data

on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at 00:00 UTC
  workflow_dispatch:      # Manual trigger for testing

jobs:
  update-models:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Fetch open-source models from Hugging Face
        run: node scripts/fetch-models.js
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}  # Optional: for higher rate limits
      
      - name: Check for changes
        id: changes
        run: |
          git diff --quiet data/models.json || echo "changed=true" >> $GITHUB_OUTPUT
      
      - name: Commit and push if changed
        if: steps.changes.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/models.json
          git commit -m "chore: update open-source model data [automated]"
          git push
```

**Flow Diagram:**

```
┌────────────────────────────────────────────────────────────────┐
│                    WEEKLY (AUTOMATED)                           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   GitHub Actions Cron (Sunday 00:00 UTC)                       │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ scripts/fetch-models.js                  │                  │
│   │  - Fetch from Hugging Face API          │                  │
│   │  - Filter: 80B+, open-source license    │                  │
│   │  - Parse config.json for architecture   │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ data/models.json (updated)               │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   Git commit + push ──► Vercel webhook ──► Auto-redeploy       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                   QUARTERLY (MANUAL)                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Human checks vendor announcements                             │
│           │                                                     │
│           ├──► NVIDIA updates ──► Edit data/hardware/nvidia.json│
│           │                                                     │
│           └──► Huawei updates ──► Edit data/hardware/huawei.json│
│                                                                 │
│   (include source_url and verified_date for each entry)        │
│           │                                                     │
│           ▼                                                     │
│   Git commit + push ──► Vercel auto-redeploy                   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### Fetch Script: Open-Source Models Only

```javascript
// scripts/fetch-models.js
// Fetches ONLY open-source models with permissive licenses

const fs = require('fs');

const MIN_PARAMS_BILLION = 80;

// Permissive open-source licenses we accept
const OPEN_SOURCE_LICENSES = [
  'apache-2.0',
  'mit',
  'bsd-3-clause',
  'llama3.1',
  'llama3.2',
  'llama3',
  'llama2',
  'qwen',
  'gemma',
  'deepseek',
  'yi',
  'mistral',
  'openrail',
  'cc-by-4.0',
  'cc-by-sa-4.0',
];

async function fetchOpenSourceModels() {
  console.log('Fetching open-source models from Hugging Face...');
  
  const models = [];
  
  // Fetch top text-generation models by downloads
  const response = await fetch(
    'https://huggingface.co/api/models?' +
    'filter=text-generation&' +
    'sort=downloads&' +
    'direction=-1&' +
    'limit=500'  // Fetch more to filter down
  );
  
  if (!response.ok) {
    throw new Error(`HF API error: ${response.status}`);
  }
  
  const rawModels = await response.json();
  console.log(`Found ${rawModels.length} text-generation models`);
  
  for (const model of rawModels) {
    // Skip if no license or not open-source
    const license = (model.license || '').toLowerCase();
    const isOpenSource = OPEN_SOURCE_LICENSES.some(l => license.includes(l));
    
    if (!isOpenSource) {
      continue;
    }
    
    // Fetch config.json for architecture details
    try {
      const configUrl = `https://huggingface.co/${model.modelId}/raw/main/config.json`;
      const configRes = await fetch(configUrl);
      
      if (!configRes.ok) continue;
      
      const config = await configRes.json();
      
      // Estimate parameter count from architecture
      const params = estimateParams(config);
      
      if (params < MIN_PARAMS_BILLION) continue;
      
      console.log(`✓ ${model.modelId}: ${params.toFixed(1)}B params (${license})`);
      
      models.push({
        id: model.modelId,
        name: formatModelName(model.modelId),
        parameters_billion: Math.round(params * 10) / 10,
        architecture: detectArchitecture(config),
        hidden_size: config.hidden_size,
        num_layers: config.num_hidden_layers,
        num_heads: config.num_attention_heads,
        num_kv_heads: config.num_key_value_heads || config.num_attention_heads,
        vocab_size: config.vocab_size,
        max_seq_length: config.max_position_embeddings,
        intermediate_size: config.intermediate_size,
        // MoE fields (if present)
        moe_num_experts: config.num_local_experts || null,
        moe_top_k: config.num_experts_per_tok || null,
        // Metadata
        license: model.license,
        downloads: model.downloads,
        huggingface_url: `https://huggingface.co/${model.modelId}`,
      });
      
    } catch (e) {
      // Skip models with missing/invalid config
      continue;
    }
  }
  
  // Sort by parameters descending
  models.sort((a, b) => b.parameters_billion - a.parameters_billion);
  
  const output = {
    metadata: {
      updated_at: new Date().toISOString(),
      source: 'Hugging Face Hub API',
      filter: 'open-source licenses only, 80B+ parameters',
      count: models.length,
    },
    models: models,
  };
  
  fs.writeFileSync(
    'data/models.json',
    JSON.stringify(output, null, 2)
  );
  
  console.log(`\nSaved ${models.length} open-source models to data/models.json`);
}

function estimateParams(config) {
  const h = config.hidden_size || 0;
  const L = config.num_hidden_layers || 0;
  const V = config.vocab_size || 0;
  const I = config.intermediate_size || (4 * h);
  
  // Transformer parameter estimation:
  // - Attention: 4 * h^2 per layer (Q, K, V, O projections)
  // - FFN: 2 * h * I per layer (or 3 * h * I for gated FFN)
  // - Embeddings: V * h
  // - LayerNorms: negligible
  
  const hasGatedFFN = config.hidden_act === 'silu' || 
                      config.model_type === 'llama' ||
                      config.model_type === 'qwen2';
  
  const ffnMultiplier = hasGatedFFN ? 3 : 2;
  const attentionParams = L * 4 * h * h;
  const ffnParams = L * ffnMultiplier * h * I;
  const embeddingParams = V * h;
  
  return (attentionParams + ffnParams + embeddingParams) / 1e9;
}

function detectArchitecture(config) {
  if (config.num_local_experts && config.num_local_experts > 1) {
    return 'moe';
  }
  return 'dense';
}

function formatModelName(modelId) {
  // "meta-llama/Llama-3.1-405B-Instruct" → "Llama 3.1 405B Instruct"
  const name = modelId.split('/').pop();
  return name
    .replace(/-/g, ' ')
    .replace(/\./g, '.')
    .replace(/(\d)([A-Z])/g, '$1 $2');
}

fetchOpenSourceModels().catch(console.error);
```

---

### Data File Schemas

**`data/models.json` (auto-generated):**
```json
{
  "metadata": {
    "updated_at": "2025-12-14T00:00:00.000Z",
    "source": "Hugging Face Hub API",
    "filter": "open-source licenses only, 80B+ parameters",
    "count": 42
  },
  "models": [
    {
      "id": "meta-llama/Llama-3.1-405B-Instruct",
      "name": "Llama 3.1 405B Instruct",
      "parameters_billion": 405,
      "architecture": "dense",
      "hidden_size": 16384,
      "num_layers": 126,
      "num_heads": 128,
      "num_kv_heads": 8,
      "vocab_size": 128256,
      "max_seq_length": 131072,
      "intermediate_size": 53248,
      "moe_num_experts": null,
      "moe_top_k": null,
      "license": "llama3.1",
      "downloads": 1234567,
      "huggingface_url": "https://huggingface.co/meta-llama/Llama-3.1-405B-Instruct"
    }
  ]
}
```

**`data/hardware/nvidia.json` (manually curated):**
```json
{
  "metadata": {
    "vendor": "NVIDIA",
    "updated_at": "2025-12-14",
    "curated_by": "human",
    "source": "https://www.nvidia.com/en-us/data-center/",
    "version": "1.0.0"
  },
  "hardware": [
    {
      "id": "nvidia-h100-sxm",
      "name": "H100 SXM",
      "type": "gpu",
      "generation": "Hopper",
      "vram_gb": 80,
      "memory_type": "HBM3",
      "bandwidth_gbps": 3350,
      "fp16_tflops": 1979,
      "bf16_tflops": 1979,
      "fp8_tflops": 3958,
      "tdp_watts": 700,
      "form_factor": "SXM5",
      "interconnect": "NVLink 4.0",
      "interconnect_bandwidth_gbps": 900,
      "max_cards_per_node": 8,
      "release_year": 2022,
      "status": "available",
      "source_url": "https://www.nvidia.com/en-us/data-center/h100/",
      "verified_date": "2025-12-14"
    }
  ]
}
```

**`data/hardware/huawei.json` (manually curated):**
```json
{
  "metadata": {
    "vendor": "Huawei",
    "updated_at": "2025-12-14",
    "curated_by": "human",
    "source": "https://e.huawei.com/cn/products/computing/ascend/",
    "version": "1.0.0"
  },
  "hardware": [
    {
      "id": "huawei-atlas-300i-duo",
      "name": "Atlas 300I Duo",
      "type": "npu",
      "generation": "Ascend",
      "vram_gb": 64,
      "memory_type": "HBM2e",
      "bandwidth_gbps": 1200,
      "fp16_tflops": 640,
      "bf16_tflops": 640,
      "int8_tops": 1280,
      "tdp_watts": 250,
      "form_factor": "PCIe",
      "interconnect": "HCCS",
      "interconnect_bandwidth_gbps": 392,
      "max_cards_per_node": 8,
      "release_year": 2023,
      "status": "available",
      "source_url": "https://e.huawei.com/cn/products/computing/ascend/atlas-300i-duo",
      "verified_date": "2025-12-14"
    }
  ]
}
```

> ⚠️ **Note:** The specs above are **placeholder examples**. Actual values must be verified from official documentation during hardware investigation phase.

---

## 🎯 Feature Roadmap

### Phase 1: Core Data Foundation
- [ ] **NVIDIA hardware investigation** — Complete review of Data Center GPU product line (A100, H100, H200, B100, B200, GB200 + all form factors)
- [ ] **Huawei hardware investigation** — Complete review of Ascend/Atlas product line (Atlas 300I Duo, Atlas 800, Ascend 910B, 910C, etc.)
- [ ] Create `/data/hardware/nvidia.json` with complete NVIDIA specs (multi-GPU focus)
- [ ] Create `/data/hardware/huawei.json` with complete Huawei specs (multi-GPU focus)
- [ ] Create `/data/models.json` with 80B+ open-source models schema
- [ ] Build `scripts/fetch-models.js` for Hugging Face API integration
- [ ] Set up `.github/workflows/update-models.yml` for weekly updates
- [ ] Migrate existing `js/models.js` and `js/gpus.js` to use new data files

### Phase 2: Dedicated Reference Pages
- [ ] Create `/models/index.html` — Open-source model explorer
- [ ] Create `/hardware/index.html` — Hardware overview page
- [ ] Create `/hardware/nvidia.html` — NVIDIA GPU reference
- [ ] Create `/hardware/huawei.html` — Huawei Ascend NPU reference
- [ ] Implement cross-linking: "Use in Calculator" buttons with URL params

### Phase 3: Enterprise PM Features
- [ ] Workload calculator (users × requests × tokens → throughput)
- [ ] Multi-GPU configuration recommendations
- [ ] Hardware comparison view (side-by-side specs)
- [ ] Spec sheet export (vendor-friendly format)

### Phase 4: Advanced Matching (Future)
- [ ] Server platform database
- [ ] Framework compatibility matrix
- [ ] Quantization impact estimator
- [ ] AMD Instinct GPU support

---

## 📎 References

### Official Documentation Links
- **NVIDIA Data Center**: https://www.nvidia.com/en-us/data-center/
- **AMD Instinct**: https://www.amd.com/en/products/accelerators/instinct.html
- **Huawei Ascend**: https://www.hiascend.com/
- **Google Cloud TPU**: https://cloud.google.com/tpu/docs
- **Hugging Face Hub API**: https://huggingface.co/docs/hub/api

### Existing Project Files
- `/js/models.js` — Current model presets
- `/js/gpus.js` — Current GPU database
- `/js/calc.js` — Calculation engine

---

## 📝 Open Questions

1. **Hugging Face API rate limits?** — Need to verify limits for automated fetching
2. **Model config.json consistency?** — How many 80B+ models have complete configs?
3. **Huawei documentation accessibility?** — Some specs may only be in Chinese; need bilingual review
4. **NVIDIA product line completeness?** — Need thorough review of all Data Center GPU variants (SXM, PCIe, NVL)
5. **Huawei product line completeness?** — Need thorough review of Atlas/Ascend series variants
6. **Multi-GPU interconnect specs?** — NVLink vs PCIe vs HCCS bandwidth affects multi-card performance estimation
7. **Server platform scope?** — How many vendors to cover in Phase 2?

---

## ✅ Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Deploy on Vercel (static hosting) | Existing setup, CDN performance, auto-deploy |
| GitHub Actions for model updates | Free, git-versioned, no runtime dependency |
| Open-source models only | User requirement for accessibility |
| **Multi-GPU configurations as core feature** | Users deploy on multi-card setups, not single GPU |
| **Phase 1: NVIDIA + Huawei only** | Focus on two major vendors first, expand later |
| Separate pages per vendor | Clean organization, better maintainability |
| **Separate JSON files per vendor** | Enables parallel work, avoids merge conflicts |
| Data in `/data/*.json` | Static files, CDN-cached, works offline |
| Weekly model updates | Balance freshness vs API limits |
| Quarterly hardware updates | Specs change slowly, manual curation needed |

---

**Document Status:** Implementation-ready  
**Last Updated:** 2025-12-14  
**Next Actions:**
1. Create `/data/` folder structure with `/data/hardware/` subfolder
2. Implement `scripts/fetch-models.js`
3. **Thorough investigation of NVIDIA Data Center GPU product line** (all variants, form factors)
4. **Thorough investigation of Huawei Ascend/Atlas product line** (all variants)
5. Create `/data/hardware/nvidia.json` with complete NVIDIA specs
6. Create `/data/hardware/huawei.json` with complete Huawei specs
7. Test GitHub Actions workflow locally

**Owner:** TBD

