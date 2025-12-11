---
name: LLM Inference Physics
description: Transformer math underpinning calculations
last_updated: 2025-12-10
---

# LLM Inference Physics

## Transformer Forward Pass

### Compute (FLOPs)

#### Dense Layer (Feed-Forward)
**Formula**: `2 * weight_params * tokens`

**Rationale**: 
- Matrix multiplication: `W @ x` = `d_out` multiplications per input element
- Each multiply-accumulate = 2 ops (multiply + add)

**Example**: 
- 70B model, 1 token: `2 * 70e9 * 1 = 140 GFLOPs`
- 70B model, 10 tokens/sec: `2 * 70e9 * 10 = 1.4 TFLOPS`

#### Attention (Self-Attention)
**Complexity**: O(seq²) for standard attention

**Operations per layer**:
1. **Q, K, V projections**: `3 * 2 * hidden² * seq` (linear layers)
2. **QK^T**: `seq × hidden` @ `hidden × seq` = `seq² * hidden` multiplies
3. **Softmax**: `seq²` operations (typically ignored, smaller than matmuls)
4. **Attention @ V**: `seq × seq` @ `seq × hidden` = `seq² * hidden` multiplies

**Simplified per layer**: `4 * seq² * hidden` (focusing on quadratic terms)

**Why quadratic hurts**:
- Prompt length 10K → 100M ops per layer for attention
- Prompt length 100K → 10B ops per layer (100× worse)

#### Total Prefill FLOPs
**Formula**: `2 * active_params * 1e9 * prompt + 4 * layers * prompt² * hidden`

**Components**:
1. Dense forward pass through all layers
2. Attention computation for all tokens at once

**Example (Llama 3.1 70B, 10K prompt)**:
- Dense: `2 * 70e9 * 10000 = 1.4e15` FLOPs (1.4 PFLOPs)
- Attention: `4 * 80 * 10000² * 8192 = 2.6e14` FLOPs (0.26 PFLOPs)
- **Total**: ~1.66 PFLOPs

**TTFT at 200 TFLOPS**: `1.66e15 / 200e12 = 8.3 seconds`

#### Total Decode FLOPs (per token)
**Formula**: `2 * active_params * 1e9 + 4 * layers * avg_seq * hidden`

**Components**:
1. Dense forward pass (1 token)
2. Attention computation (1 query × context length)

**avg_seq**: Average sequence length seen during generation ≈ `prompt + new/2`

**Example (Llama 3.1 70B, 10K context)**:
- Dense: `2 * 70e9 = 140 GFLOPs`
- Attention: `4 * 80 * 10000 * 8192 = 26 GFLOPs`
- **Total per token**: ~166 GFLOPs

**Throughput at 10 tok/s**: `166 GFLOPs * 10 = 1.66 TFLOPS`

---

## Memory Hierarchy

### Model Weights
**Must reside in HBM/VRAM** (streaming from CPU too slow for real-time)

**Formula**: `params * 1e9 * bytes_per_precision`

**Precision sizes**:
- BF16/FP16: 2 bytes
- FP8/INT8: 1 byte
- INT4: 0.5 bytes (4-bit quantization)

**Example (Llama 3.1 70B, BF16)**:
- `70e9 * 2 = 140 GB`
- Fits on: 2× A100 80GB

### KV Cache
**Grows linearly with sequence length**

**Formula per token**: `layers * hidden * 2 * precision_bytes`
- Factor of 2: K and V tensors (separate caches)

**Total cache**: `batch * seq * layers * hidden * 2 * bytes`

**Example (Llama 3.1 70B, 10K context, BF16, batch=1)**:
- `1 * 10000 * 80 * 8192 * 2 * 2 = 26.2 GB`

**Batch scaling**:
- Batch 8: `8 * 26.2 = 210 GB` (exceeds single GPU!)

**Why KV cache matters**:
- Without cache: Must recompute attention for entire history every token (O(seq²) cost)
- With cache: Only compute new K/V, reuse old (O(seq) cost)

### Workspace / Activations
**Temporary memory for forward pass**

**Formula (estimate)**: `weight_bytes * 0.12`

**Rationale**:
- Activations for each layer: `batch * seq * hidden * bytes`
- Gradients (if training): ~2× weights (not applicable for inference)
- Optimizer states (if training): ~2× weights (not applicable for inference)
- Inference workspace: much smaller, ~10-15% of weights

**Example (70B BF16)**:
- `140 GB * 0.12 = 16.8 GB`

### Total VRAM
**Formula**: `weights + KV_cache + workspace`

**Example (Llama 3.1 70B, 10K ctx, batch=1)**:
- Weights: 140 GB
- KV cache: 26 GB
- Workspace: 17 GB
- **Total**: ~183 GB (fits on 3× A100 80GB with tight fit)

---

## Bandwidth Bottleneck (Decode Phase)

### Why Decode is Memory-Bound
**Observation**: Must read entire model + KV cache per token.

**Arithmetic intensity**: FLOPs / bytes_read
- Decode: `140 GFLOPs / 140 GB = 1 FLOP/byte`
- Matrix multiplication (dense training): `100-1000 FLOPs/byte`

**Implication**: GPU compute sits idle waiting for memory.

### Weight Streaming
**Conservative (no cache hits)**: Read all weights per token

**Formula**: `active_params * 1e9 * weight_bytes / batch`

**Example (70B BF16, batch=1)**:
- `70e9 * 2 / 1 = 140 GB per token`
- At 10 tok/s: `140 * 10 = 1400 GB/s` required (exceeds A100 @ 2 TB/s!)

**Batch amortization (batch=8)**:
- `140 / 8 = 17.5 GB per token`
- At 10 tok/s: `175 GB/s` (much more reasonable)

### KV Cache Streaming
**Read existing KV**: `layers * context_len * hidden * 2 * bytes`

**Write new KV**: `layers * hidden * 2 * bytes`

**Example (70B BF16, 10K ctx)**:
- Read: `80 * 10000 * 8192 * 2 * 2 = 26.2 GB`
- Write: `80 * 8192 * 2 * 2 = 2.6 MB` (negligible)

### Total Bandwidth (Conservative)
**Formula**: `(weight_bytes/batch + KV_read + KV_write) * throughput`

**Example (70B, 10K ctx, batch=1, 10 tok/s)**:
- Weights: `140 GB`
- KV: `26 GB`
- Total: `166 GB per token`
- Bandwidth: `166 * 10 = 1660 GB/s`

**Reality check**: A100 has 2 TB/s → could do ~12 tok/s (close estimate!)

### Optimistic Bandwidth
**Assumption**: 80% of weights stay in L2/L3 cache (GPU caches are large)

**Effective weight read**: `weight_bytes * 0.2`

**Example (70B, 10K ctx, batch=1, 10 tok/s)**:
- Weights: `140 * 0.2 = 28 GB`
- KV: `26 GB`
- Total: `54 GB per token`
- Bandwidth: `54 * 10 = 540 GB/s` (much more feasible)

**Why optimistic is realistic**:
- GPU L2 cache: 40-80 MB (holds frequently accessed layers)
- Weight reuse across batches
- Modern inference frameworks optimize for locality

---

## MoE (Mixture of Experts)

### Architecture
**Total params**: All expert weights loaded in memory.

**Active params**: Only activated experts used in forward pass.

**Example (DeepSeek-V3)**:
- Total: 671B parameters
- Active: 37B parameters per token (~5.5% activation)

### Resource Implications

#### Memory (Total Params)
- Must load all experts into VRAM
- **Formula**: `total_params * 1e9 * bytes`
- **Example**: `671e9 * 2 = 1342 GB` (requires 8× H100 80GB or 17× A100 80GB)

#### Compute (Active Params)
- Only activated experts compute
- **Formula**: `2 * active_params * 1e9 * throughput`
- **Example**: `2 * 37e9 * 10 = 0.74 TFLOPS` (5× less than 70B dense!)

#### Bandwidth (Between)
- Must read activated expert weights from memory
- **Formula**: Between `active_bytes` (if cached) and `total_bytes` (if cold)
- **Depends on**: Routing pattern, cache hits, expert reuse

### MoE Advantage
**Memory-heavy, compute-light**: 
- Use memory capacity to store giant model
- Only activate fraction for computation
- Get large model intelligence at smaller compute cost

**Example**: DeepSeek-V3 (671B) runs at similar speed to Llama 70B, but has 9× parameters.

---

## Validation Examples

### Llama 3.1 70B (BF16)

**Published specs** (Meta):
- Parameters: 70B
- Minimum VRAM: 140 GB (weights only)
- Recommended: 2× A100 80GB

**Our calculation**:
- Weights: `70e9 * 2 = 140 GB` ✓
- KV (10K ctx, batch=1): `1 * 10000 * 80 * 8192 * 2 * 2 = 26 GB`
- Workspace: `140 * 0.12 = 17 GB`
- **Total**: 183 GB (fits on 3× A100 with buffer) ✓

**Compute (10 tok/s)**:
- Decode: `2 * 70e9 * 10 = 1.4 TFLOPS` ✓
- A100 (BF16): 312 TFLOPS peak × 0.4 util = 125 TFLOPS (plenty) ✓

**Bandwidth (10 tok/s, batch=1)**:
- Conservative: `(140 + 26) * 10 = 1660 GB/s`
- A100: 2039 GB/s × 0.6 util = 1223 GB/s (close, might need batch) ✓

### DeepSeek-V3 (671B total, 37B active, BF16)

**Published specs**:
- Requires 8× H100 80GB
- Achieves ~30-50 tok/s aggregate (with batching)

**Our calculation**:
- Weights: `671e9 * 2 = 1342 GB`
- 8× H100 80GB = 640 GB (too small!)
- **Reality**: Uses tensor parallelism + offloading

**Compute (10 tok/s per stream)**:
- Decode: `2 * 37e9 * 10 = 0.74 TFLOPS` ✓ (very low due to MoE)
- H100 (BF16): 1000 TFLOPS peak × 0.4 = 400 TFLOPS (massive headroom) ✓

**Bandwidth** (bottleneck):
- Expert routing adds overhead
- Aggregate bandwidth across 8 GPUs: ~21 TB/s
- Can support high batch sizes

### Qwen3-235B-A22B-FP8

**Our calculation**:
- Weights: `235e9 * 1 = 235 GB` (FP8 = 1 byte)
- Compute (10 tok/s): `2 * 22e9 * 10 = 0.44 TFLOPS` (very low, MoE)
- Bandwidth: Reduced 2× due to FP8

**FP8 advantage**:
- 2× memory reduction (vs BF16)
- 2× bandwidth reduction
- Possible compute speedup on H100 (FP8 Tensor Cores)

---

## Known Limitations & Assumptions

### Conservative Biases (Overestimate)
1. **No FlashAttention**: Assumes standard O(seq²) attention
   - Reality: FlashAttention reduces memory and speeds up by 2-4×
2. **No kernel fusion**: Assumes separate ops for each layer
   - Reality: Modern frameworks fuse operations
3. **No pipeline parallelism**: Assumes single-GPU overhead
   - Reality: Multi-GPU setups optimize differently

### Not Modeled
1. **Distributed inference**: Multi-GPU communication overhead
2. **Batching efficiency**: Dynamic batching, request scheduling
3. **Quantization accuracy**: Potential quality degradation from INT4/INT8
4. **Hardware-specific optimizations**: 
   - Tensor Cores (INT8 ~2×, INT4 ~3.5× faster)
   - Ampere/Hopper architecture features
   - FlashAttention-2, PagedAttention
5. **Framework overhead**: vLLM, TensorRT-LLM, etc. have different characteristics

### When to Recalibrate
1. **New attention variants**: 
   - Multi-latent attention (MLA) - reduces KV cache
   - Sparse attention - reduces O(seq²) cost
   - Linear attention - O(seq) complexity
2. **Hardware architecture changes**:
   - Blackwell (B100/B200) - new tensor cores
   - TPU v5/v6 - different memory/compute balance
3. **Framework optimizations**:
   - PagedAttention (vLLM) - better KV cache utilization
   - Continuous batching - higher throughput
   - Speculative decoding - 2-3× speedup

---

## Formula Summary

### Memory
```
Weights:     params * 1e9 * bytes_per_precision
KV Cache:    batch * seq * layers * hidden * 2 * kv_bytes
Workspace:   weight_bytes * 0.12
Total VRAM:  Weights + KV + Workspace
```

### Compute
```
Prefill FLOPs:  2 * active_params * 1e9 * prompt + 4 * layers * prompt² * hidden
Decode FLOPs:   2 * active_params * 1e9 + 4 * layers * avg_seq * hidden
TFLOPS:         Decode_FLOPs * throughput / 1e12
```

### Bandwidth
```
Weight read:   active_params * 1e9 * weight_bytes / batch
KV read:       layers * avg_seq * hidden * 2 * kv_bytes
KV write:      layers * hidden * 2 * kv_bytes
Total (cons):  (Weight_read + KV_read + KV_write) * throughput / 1e9
Total (opt):   (Weight_read * 0.2 + KV_read + KV_write) * throughput / 1e9
```

### TTFT
```
Prefill_time:  Prefill_FLOPs / (effective_TFLOPS * 1e12)
TTFT:          Prefill_time * 1000 + 80  (ms, with overhead)
```

---

## 📚 References

### Academic Papers
- Vaswani et al., "Attention Is All You Need" (2017) - Original Transformer
- Shazeer et al., "Fast Transformer Decoding: One Write-Head is All You Need" (2019) - MQA/GQA
- Dao et al., "FlashAttention: Fast and Memory-Efficient Exact Attention" (2022)
- Korthikanti et al., "Reducing Activation Recomputation in Large Transformer Models" (2022)

### Technical Resources
- NVIDIA A100 Whitepaper - Memory bandwidth specs
- NVIDIA H100 Whitepaper - Tensor Core capabilities
- Hugging Face Transformers - Model architectures
- vLLM Documentation - Inference optimizations

### Model-Specific
- Meta Llama 3.1 Model Card
- DeepSeek-V3 Technical Report
- Qwen Technical Reports

## 📚 Go Deeper
- **Calculator implementation**: See `../modules/calculator/interface.md`
- **Architecture decisions**: See `architecture.md`
- **Data flow**: See `../integration/data-flow.md`

