# 🧠 LLM Resource Sizer: Project Memory Bank

This repository contains the evolving state, vision, and architectural constraints of the LLM Resource Sizer project. It serves as the authoritative context for development.

## 🗂️ Directory Structure

*   **`core/`**: High-level vision, mission, and system topology.
*   **`insights/`**: Deep dives into physics-based estimation and architectural decisions.
*   **`integration/`**: Data flow, pipeline automation, and i18n systems.
*   **`planning/`**: Product requirements and implementation roadmap (Phases 1–5).

## 🛠️ Key Technical Registry

Refer to **`registry.yml`** for the map of critical files and dynamic data schemas.

---

## ⚡ Current System State (Dec 2025)

*   **Models**: 73 vendor-exclusive models (70-700B) from 7 tier-1 vendors, fetched via two-stage HF API.
*   **Vendors**: google, anthropic, openai, Qwen, deepseek-ai, nvidia, apple.
*   **Hardware**: Verified specs for NVIDIA (15+ GPUs) and Huawei (4+ NPUs).
*   **Architecture**: Config-driven build-time pipeline + Dynamic runtime filtering (Vanilla JS).
*   **Discovery**: Multi-row filters (recency, org, arch, size) with comparison mode.
