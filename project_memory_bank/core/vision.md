---
name: Project Vision
description: Evolution from a simple calculator to an Enterprise Decision Hub
last_updated: 2025-12-19
---

# Project Vision

## 🎯 The Mission
To empower AI Product Managers and Infrastructure Teams to transition from "Experimental AI" to "Production Deployment" by providing physics-backed hardware estimations for massive open-source models (80B+).

## 🏢 Target Persona: The Enterprise PM
The tool is specifically tuned for PMs who sell **Server + AI App Bundles**.
*   **Business Goal**: Match the right model tier (e.g., 80B vs 400B) to the right hardware configuration (e.g., 2× vs 8× H100).
*   **The Problem**: "Can I run DeepSeek-V3 on this server?" is a complex question involving VRAM, interconnect bandwidth, and multi-GPU overhead.
*   **The Solution**: An interconnected "Decision Hub" that links model specifications to hardware capacity.

## 🔄 The "Virtuous Loop" UX Pattern
Our goal is to create a circular navigation flow that answers three fundamental questions:
1.  **Discovery**: "What models are available and what are their specs?" → **Model Explorer**
2.  **Estimation**: "What resources do these models actually need?" → **Calculator Hub**
3.  **Validation**: "Does my specific hardware meet these needs?" → **Hardware Hub**

## 🛡️ Non-Negotiable Pillars
*   **Open-Source Only**: Focus on models that can be deployed on private infrastructure (Qwen, Llama, DeepSeek).
*   **Privacy-First**: Zero-telemetry, zero-API architecture. User workloads never leave the browser.
*   **Multi-GPU by Default**: Moving away from "single-GPU thinking" to realistic "cluster/node thinking" (1-72 GPUs).
*   **Automation-Driven**: Automated model specification fetching to keep pace with the rapidly evolving LLM landscape.
