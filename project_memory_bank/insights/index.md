---
name: Insights Index
description: Knowledge hierarchy for Resource Physics and Architecture
last_updated: 2026-01-03
---

# Insights Index

This directory contains the intellectual property of the project: the mathematical rationale and design choices that differentiate this Deployment Planner from simple calculators.

## 📚 Knowledge Areas

### 1. [Resource Physics](physics.md)
**The "Why" behind the numbers.**
*   VRAM vs Bandwidth vs Compute bottlenecks.
*   The math of the **70B Inflection Point**.
*   Hardware tiering logic (<24G, 24-80G, >80G).

### 2. [Architecture Decisions](architecture.md)
**The rationale for technology choices.**
*   Vanilla JS vs Frameworks (Portability and Longevity).
*   Shared Logic Engines (Syncing Drawer, Browser, and Calculator).
*   State Persistence via URL and LocalStorage.
*   High-Density UI Patterns (Parameter Pills, Horizontal Layouts).

## 🎯 Usage Pattern
*   **Engineering**: Consult `architecture.md` before adding new pages or heavy libraries.
*   **UI/UX**: Consult `architecture.md` (High-Density UI Patterns) before modifying vendor displays or spec boxes.
*   **Methodology**: Consult `physics.md` when refining estimation formulas for new architectures (e.g., MoE scaling).
