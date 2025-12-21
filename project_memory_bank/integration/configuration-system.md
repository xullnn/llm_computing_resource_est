---
name: Configuration System
description: Whitelist strategy and pipeline constraints
last_updated: 2025-12-21
---

# Configuration System

## 📋 Strategic Alignment

The `scripts/config.json` file is the **governance layer** of the platform. It ensures that the model browser remains professional by enforcing strict exclusivity for Tier-1 vendors.

## 🎛️ Governance Schema

| Key | Strategic Logic |
| :--- | :--- |
| `vendors` | Exclusive whitelist of 8 organizations (Google, Anthropic, OpenAI, Qwen, DeepSeek, NVIDIA, Apple, XiaomiMiMo). |
| `params.min` (70) | The "Enterprise Threshold": Where deployment requires specialized infrastructure. |
| `params.max` (700) | The "Viability Limit": Excludes experimental models that lack production hardware targets. |
| `cutoffDays` (730) | The "Stability Window": Limits models to the last 24 months to ensure architecture relevance. |

## 🏢 Exclusivity Rationale
*   **Quality Control**: Community fine-tunes are intentionally excluded to maintain a dataset of models with "stated" performance benchmarks.
*   **Clean Discovery**: Eliminates noise from 1000+ low-volume repos, focusing only on what global teams actually procurement.

## 🔄 Integration Workflow

### 1. The Build-Time Probe
The `fetch-models.js` script uses the config to drive a two-stage enrichment process:
1.  **Stage 1**: Query HF list API for organizations in the whitelist.
2.  **Stage 2**: Perform individual probes for architecture (config.json) and weight metadata (safetensors).

### 2. Manual Overrides (`data/overrides.json`)
Used as a **Corrective Layer** for gated models (e.g., Llama 405B) or cases where HF metadata is missing layers/hidden size.

## 🛡️ Best Practices
1.  **Vendor Audits**: Review the `vendors` list quarterly to add emerging Tier-1 players (e.g., recent additions of Apple and Xiaomi).
2.  **Range Stability**: Changing the `params.min` threshold significantly impacts the **Hardware Tiering** view on the homepage.
