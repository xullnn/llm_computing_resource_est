---
name: LLM Inference Physics
description: The mathematical constraints of transformer models on hardware
last_updated: 2025-12-19
---

# LLM Inference Physics

## 1. Parameter Estimation (The MoE Correction)

Estimating the size of modern LLMs requires distinguishing between **sequential layers** and **routing alternatives**.

### 🏗️ Architecture Formula
$$ \text{Total Params} = \text{Attention} + \text{Embedding} + \text{FFN Layers} $$

*   **Attention Layer**: Shared across all tokens.
*   **FFN Layers**:
    *   **Dense Models**: Single FFN block per layer.
    *   **MoE (Mixture of Experts)**: Multiple experts existing in parallel.
    *   **Gated FFN (SwiGLU)**: Uses a $3 \times$ multiplier (found in Qwen, Llama, DeepSeek).

### 🚨 MoE Math Logic
Experts are **routing alternatives**, not sequential additions. To calculate total size, we account for every expert in the cluster:
$$ \text{Expert Params} = \text{Layers} \times (3 \times \text{Hidden} \times \text{Expert\_Intermediate}) \times \text{Num\_Experts} $$

## 2. Memory Constraints (VRAM)

VRAM is the primary "Go/No-Go" gate for model deployment.

| Component | Formula | Impact |
| :--- | :--- | :--- |
| **Weights** | $\text{Params} \times \text{Bytes\_per\_Precision}$ | Static baseline (BF16=2B, FP8=1B) |
| **KV Cache** | $\text{Batch} \times \text{Seq} \times \text{Layers} \times \text{Hidden} \times 2 \times \text{Bytes}$ | Grows linearly with context and users |
| **Workspace** | $\text{Weights} \times 0.12$ | Overhead for activations and metadata |

## 3. The Bandwidth Bottleneck (Decode Phase)

During the generation (decode) phase, LLMs are almost always **memory-bandwidth bound**.

*   **Conservative Estimation**: Assumes every weight must be read from HBM for every single token generated.
*   **Multi-GPU Scaling**: By distributing a model across 8 GPUs, we aggregate their memory bandwidth (e.g., $8 \times 3.35 \text{ TB/s} = 26.8 \text{ TB/s}$), enabling much higher throughput.

## 4. Time to First Token (TTFT)

Prefill is **compute-bound** ($O(\text{seq}^2)$ complexity). It depends on the raw TFLOPS of the hardware.

*   **Formula**: $\text{Prefill\_FLOPs} / (\text{Peak\_TFLOPS} \times \text{Utilization})$
*   **MoE Benefit**: Only activated experts perform FLOPs, significantly reducing TTFT for massive models like DeepSeek-V3 compared to dense counterparts.

## 📚 Reference Principles
*   **Arithmetic Intensity**: The ratio of FLOPs to Memory Access. Low intensity in decode phase causes GPU compute to sit idle.
*   **Batch Amortization**: Increasing batch size spreads the cost of weight-loading across multiple users, improving efficiency.
