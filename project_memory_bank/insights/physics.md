---
name: LLM Inference Physics
description: Mathematical constraints and Hardware Tiering logic
last_updated: 2025-12-21
---

# LLM Inference Physics

## 1. Resource Estimation Logic

The platform uses physics-based formulas to estimate the "pressure" a model puts on hardware.

### VRAM Footprint (The Gatekeeper)
VRAM is the primary constraint. We calculate three distinct precision scenarios:
*   **INT8 (Recommended)**: Balanced performance/accuracy for production.
*   **FP8**: Optimized for modern H100/H200/B200 hardware.
*   **BF16**: Full precision for research and maximum accuracy.

**Formula Components**:
$$ \text{Total VRAM} = \text{Weights} + \text{KV Cache} + \text{Workspace Overhead} $$
*   **KV Cache**: Grows linearly with **Batch Size** and **Sequence Length**.
*   **Workspace**: Estimated at **12% of total weights** for activations and buffers.

### Memory Bandwidth (The Speed Bottleneck)
During the **decode phase**, the speed of token generation is limited by how fast weights can be read from memory (HBM).
*   **GB/s Required**: Derived from (Active Params × Precision Bytes) × Target Tokens/Sec.
*   **Multi-GPU Benefit**: Scaling across GPUs (e.g., 8× H100) aggregates bandwidth, directly increasing tokens/sec.

## 2. Hardware Tiering Strategy

To simplify deployment decisions, models are automatically classified into three tiers based on their **INT8 VRAM footprint** (assuming Batch Size 1 and 8K context).

| Tier | VRAM Bound | Hardware Target | Strategic Use Case |
| :--- | :--- | :--- | :--- |
| **Consumer** | < 24GB | RTX 3090 / 4090 / Mac Studio | Local development, private document Q&A. |
| **Workstation** | 24GB - 80GB | Single A100 / H100 / A6000 | Professional nodes, small team serving. |
| **Infrastructure** | > 80GB | Multi-GPU Clusters (8× H100) | Enterprise-scale API serving, heavy RAG. |

## 3. MoE Efficiency Correction
For models like **DeepSeek-V3** or **Mixtral**, we distinguish between:
*   **Total Parameters**: Determines the VRAM required to load the model.
*   **Active Parameters**: Determines the compute (FLOPs) and bandwidth required per token.
*   **Strategic Advantage**: MoE allows models to have "Enterprise Tier" intelligence with "Workstation Tier" latency.

## 📚 Core Principles
*   **Arithmetic Intensity**: The platform identifies where a model shifts from being memory-bound (decode) to compute-bound (prefill).
*   **Batch Amortization**: We document how increasing concurrency improves hardware utilization but puts exponential pressure on the KV Cache.
