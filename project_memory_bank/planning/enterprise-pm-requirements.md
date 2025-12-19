---
name: Enterprise PM Requirements
description: Pain points, data requirements, and implementation architecture for AI product managers
last_updated: 2025-12-19
status: active
---

# Enterprise PM Requirements

## 📋 Project Status: Phases 1–3 [VERIFIED]

The foundation of the Enterprise Decision Hub is complete.

| Phase | Milestone | Status | Key Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Data Foundation** | ✅ | Automated HF Pipeline + NVIDIA/Huawei JSONs |
| **Phase 2** | **Reference Pages** | ✅ | Model Explorer + Hardware Hub + Vendor Pages |
| **Phase 3** | **Navigation Hub** | ✅ | Sticky Global Nav + Ecosystem Grid + Contextual Links |

## 🎯 Current Focus: Phase 4 — Visual Insights & Workload Modeling

### 1. Multi-GPU Topology Visualizations
*   **Need**: Users need to understand the impact of inter-GPU communication.
*   **Plan**: SVG diagrams for **NVLink Mesh (8× H100)** vs **PCIe Tree**.
*   **Logic**: Illustrate why "8× cards" is better than "2× nodes of 4× cards" for massive models.

### 2. Workload Calculator Mode
*   **Need**: PMs start with business requirements (Users), not technical ones (Batch Size).
*   **Plan**: Section: "Users × Requests/min × Avg tokens = Throughput (tokens/sec)".
*   **Outcome**: Auto-populate the "Speed (tokens/sec)" input based on business scale.

### 3. Capacity Validation (Stress Testing)
*   **Need**: "Can 4× H100 handle 50 concurrent users?"
*   **Plan**: Calculate memory pressure and latency degradation under high batch sizes.

## 🚧 Known Issues & Refinements
*   **Llama 3.1 405B**: Automated config fetch fails due to Meta's license gate (HTTP 401). Requires manual metadata override.
*   **Mobile UI**: Large comparison tables in the Hardware Hub need horizontal scroll optimizations.
*   **i18n Coverage**: Ensure model-specific tooltips are fully translated in Chinese mode.

## 🚀 Future Roadmap (Phase 5)
*   **RFP Spec Generator**: Export PDF with calculated hardware requirements for vendor bidding.
*   **Benchmarking Database**: Integrate real-world throughput data from vLLM/TensorRT-LLM community reports.
