---
name: Calculator Engine
description: Core resource estimation based on transformer inference physics
file: js/calc.js
load_when: Changing formulas, debugging estimates, understanding bottlenecks
go_deeper:
  - interface.md: calcRequirements() signature
  - implementation.md: Formula derivations and heuristics
last_updated: 2025-12-10
---

# Calculator Module

## What
Pure function `calcRequirements(input)` that estimates four resource dimensions:
1. **VRAM**: Weights + KV cache + workspace overhead
2. **Compute**: TFLOPS for target throughput (decode phase)
3. **Bandwidth**: GB/s for weight+KV streaming (memory-bound)
4. **TTFT**: Prefill latency (if hardware specs provided)

## Calculation Strategy

### Heuristics (when parameters missing)
- `estimateLayers()`: Scales with model size (32–80 layers)
- `estimateHiddenSize()`: Derived from `sqrt((params * 1e9) / (12 * layers))`
- `estimateHeads()`: Assumes head_dim ~128
- `align()`: Rounds dimensions to multiples of 64 (hardware-friendly)

### Core Formulas
**Memory**:
- Weights: `params * 1e9 * bytes_per_precision`
- KV cache: `batch * seq * layers * hidden * 2 * kv_bytes` (K + V)
- Workspace: `weights * 0.12` (overhead estimate)

**Compute (decode)**:
- Dense: `2 * active_params * tokens/sec` (forward pass)
- Attention: `4 * layers * avg_seq * hidden` (QK^T + Attn@V)

**Bandwidth**:
- Conservative: `(weights/batch + KV_read + KV_write) * throughput`
- Optimistic: Assumes 80% weight reuse from cache

**TTFT (prefill)**:
- FLOPs: `2 * params * prompt + 4 * layers * prompt² * hidden`
- Latency: `prefill_flops / (effective_tflops * 1e12)`

## Key Concepts
- **Prefill is compute-bound**: Depends on TFLOPS
- **Decode is memory-bound**: Bottlenecked by bandwidth
- **MoE optimization**: Active params << total params reduces compute (but memory unchanged)
- **Batch amortization**: Weights read once per batch, KV per token

## When to Update
- New precision formats (INT2, FP6)
- Improved workspace overhead estimates
- Attention variants (MLA, sparse attention)
- Hardware-specific optimizations (FlashAttention, tensor cores)

## 📚 Go Deeper
- **API**: See `interface.md`
- **Math details**: See `implementation.md`
- **Physics validation**: See `../../insights/physics.md`

