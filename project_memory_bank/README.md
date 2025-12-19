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

*   **Models**: 93+ open-source models (80B+) fetched automatically from Hugging Face.
*   **Hardware**: Verified specs for NVIDIA (9+ GPUs) and Huawei (4+ NPUs).
*   **Architecture**: Static build-time pipeline (GitHub Actions) + Dynamic runtime fetching (Vanilla JS).
*   **Deployment**: Static hosting on Vercel.
