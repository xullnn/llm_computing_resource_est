---
name: Glossary
description: Key domain terms
last_updated: 2025-12-10
---

# Glossary

## Model Architecture
- **MoE (Mixture of Experts)**: Model with sparse activation; total params ≠ active params per token
- **Active params**: Parameters actually used per forward pass (< total params for MoE)
- **Hidden size**: Dimension of transformer hidden states (d_model)
- **Layers**: Number of transformer blocks
- **Heads**: Number of attention heads (Q heads; often using GQA/MQA for K/V)
- **KV cache**: Cached key/value tensors from attention (avoids recomputation during decode)

## Performance Metrics
- **TTFT (Time To First Token)**: Latency from prompt submission to first generated token
- **Tokens/sec (TPS)**: Generation throughput during decode phase
- **TFLOPS**: Tera (10¹²) floating-point operations per second
- **TOPS**: Tera operations per second (integer ops, e.g., INT8/INT4)
- **Batch size**: Number of concurrent requests processed together

## Inference Phases
- **Prefill**: Process entire prompt in one forward pass (compute-bound, O(seq²) attention)
- **Decode**: Generate tokens one-by-one (memory-bound, weight-streaming limited)
- **Context length**: Total sequence length (prompt + generated tokens)

## Precision & Quantization
- **BF16/FP16**: 2 bytes per parameter (16-bit float)
- **FP8/INT8**: 1 byte per parameter (8-bit)
- **INT4**: 0.5 bytes per parameter (4-bit quantized)
- **Weight precision**: Quantization applied to model parameters
- **KV precision**: Quantization applied to attention cache

## Hardware Efficiency
- **Utilization (compute)**: Achieved TFLOPS / peak TFLOPS (typically 0.4–0.5)
- **Utilization (bandwidth)**: Achieved GB/s / peak bandwidth (typically 0.6–0.7)
- **Memory bandwidth**: Speed of data transfer between HBM/VRAM and compute units (GB/s)
- **Peak TFLOPS**: Maximum theoretical compute throughput

## 📚 Go Deeper
- **Inference physics**: See `../insights/physics.md`
- **Calculation formulas**: See `../modules/calculator/interface.md`

