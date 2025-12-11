---
name: Calculator Interface
description: calcRequirements() API specification
last_updated: 2025-12-10
---

# Calculator Interface

## Main Function

### `calcRequirements(input)`
Estimates resource requirements for LLM inference.

**Parameters** (object with optional fields):
```javascript
{
  // Model architecture
  paramsB: number,              // Total parameters (billions)
  activeParamsB?: number,       // Active params for MoE (defaults to paramsB)
  hiddenSize?: number,          // Hidden dim (auto-estimated if missing)
  layers?: number,              // Transformer layers (auto-estimated)
  heads?: number,               // Attention heads (auto-estimated)
  
  // Precision
  weightPrecision: "bf16"|"fp16"|"fp8"|"int8"|"int4",
  kvPrecision: "bf16"|"fp16"|"fp8",
  
  // Workload
  promptTokens: number,         // Prompt length
  newTokens: number,            // Max generation length
  batchSize: number,            // Concurrent requests
  targetTps: number,            // Tokens/sec per stream
  ttftMs: number,               // Target TTFT (for validation)
  
  // Efficiency factors
  utilCompute: number,          // e.g., 0.45 (45% of peak TFLOPS)
  utilBandwidth: number,        // e.g., 0.6 (60% of peak bandwidth)
  
  // Hardware specs (optional, for TTFT estimation)
  peakTflops?: number,
  peakTops?: number,
  memBandwidth?: number,        // GB/s
}
```

**Returns** (object):
```javascript
{
  // Echoed/computed model params
  paramsB: number,
  activeParamsB: number,
  hiddenSize: number,
  layers: number,
  heads: number,
  headDim: number,
  weightBytes: number,          // Bytes per parameter (weight precision)
  kvBytes: number,              // Bytes per KV element
  totalSeq: number,             // promptTokens + newTokens
  
  // Memory requirements
  weightBytesTotal: number,     // Total bytes for model weights
  kvCacheBytes: number,         // Total bytes for KV cache
  workspaceBytes: number,       // Bytes for activations/overhead
  totalVramGb: number,          // Total VRAM needed (GB)
  
  // Compute requirements
  requiredTflops: number,       // TFLOPS for decode phase at target throughput
  effectiveTflops?: number,     // Actual hardware TFLOPS (if provided)
  
  // Bandwidth requirements
  requiredBwGbps: number,       // GB/s (conservative estimate)
  requiredBwGbpsConservative: number,  // Full weight streaming
  requiredBwGbpsOptimistic: number,    // 80% weight cache hit
  effectiveBwGbps?: number,     // Actual hardware bandwidth (if provided)
  
  // TTFT estimation
  ttftMs?: number,              // Estimated prefill time (if hardware provided)
  ttftBudgetMs: number,         // User's target TTFT
  
  // Status flags
  computeOk?: boolean,          // effectiveTflops >= requiredTflops
  vramOk?: boolean,             // (not currently computed)
  bandwidthOk?: boolean,        // effectiveBwGbps >= requiredBwGbps
}
```

## Helper Functions

### `estimateLayers(paramsB, layersHint?)`
Returns estimated layer count based on model size heuristic.

**Logic**:
- `paramsB >= 60` → 80 layers
- `paramsB >= 30` → 64 layers
- `paramsB >= 12` → 48 layers
- Otherwise → 32 layers

### `estimateHiddenSize(paramsB, layers)`
Returns estimated hidden dimension using transformer rule-of-thumb.

**Formula**: `sqrt((paramsB * 1e9) / (12 * layers))` aligned to nearest multiple of 64

**Rationale**: Dense transformer has ~12 * layers * hidden² parameters (attention + FFN)

### `estimateHeads(hiddenSize, headsHint?)`
Returns estimated attention head count.

**Assumption**: Modern models use head_dim ~128  
**Formula**: `max(8, round(hiddenSize / 128))`

### `align(value, base=64)`
Rounds value to nearest multiple of base.

**Purpose**: Ensure dimensions are hardware-friendly (tensor cores prefer multiples of 64/128)

## Constants

### `BYTES_PER_PREC`
Mapping from precision format to bytes per parameter:
```javascript
{
  bf16: 2,
  fp16: 2,
  fp8: 1,
  int8: 1,
  int4: 0.5,
}
```

## Key Formulas (Summary)

### Memory
- **Weights**: `paramsB * 1e9 * weightBytes`
- **KV cache**: `batch * totalSeq * layers * hiddenSize * 2 * kvBytes`
- **Workspace**: `weightBytesTotal * 0.12`

### Compute (Decode Phase)
- **Dense forward**: `2 * activeParamsB * 1e9 * throughput`
- **Attention**: `4 * layers * avgDecodeSeq * hiddenSize * throughput`
- **Total**: Sum of above, divided by 1e12 for TFLOPS

### Bandwidth (Decode Phase)
- **Weights per token**: `activeParamsB * 1e9 * weightBytes / batch`
- **KV read per token**: `layers * avgDecodeSeq * hiddenSize * 2 * kvBytes`
- **KV write per token**: `layers * hiddenSize * 2 * kvBytes`
- **Total conservative**: Sum × throughput ÷ 1e9 for GB/s
- **Total optimistic**: Weights × 0.2 (assume 80% cache hit)

### TTFT (Prefill Phase)
- **Prefill FLOPs**: `2 * activeParamsB * 1e9 * prompt + 4 * layers * prompt² * hiddenSize`
- **Latency**: `prefillFlops / (effectiveTflops * 1e12) * 1000` + 80ms overhead

## 📚 Go Deeper
- **Formula derivations**: See `implementation.md`
- **Physics validation**: See `../../insights/physics.md`
- **Usage in UI**: See `../ui/interface.md`

