---
name: Project Vision
description: Goals and problem space
last_updated: 2025-12-10
---

# Vision

## Problem
Users need to estimate hardware requirements (VRAM, compute, bandwidth) to run 
large language models at specific performance targets (tokens/sec, TTFT) before 
investing in expensive infrastructure.

## Solution
Offline, serverless calculator that models transformer inference physics:
- **Memory**: Weights + KV cache + workspace overhead
- **Compute**: Prefill (O(seq²) attention) + decode (memory-bound) FLOPs
- **Bandwidth**: Weight reads + KV cache I/O per token
- **TTFT**: Dominated by prefill phase throughput

## Goals
1. **Accessibility**: Works offline, no backend, no dependencies
2. **Accuracy**: Based on transformer architecture math, validated against real deployments
3. **Flexibility**: Supports dense & MoE models, multiple precision formats (BF16/FP16/FP8/INT4)
4. **Clarity**: Real-time updates, bilingual (EN/ZH), educational assumptions display

## Non-goals
- Not a deployment tool (estimation only)
- Not covering distributed inference (single-node focus)
- Not modeling network latency or scheduling overhead

## 📚 Go Deeper
- **System overview**: See `system_overview.md`
- **Key terms**: See `glossary.md`
- **Architecture decisions**: See `../insights/architecture.md`

