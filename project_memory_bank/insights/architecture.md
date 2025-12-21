---
name: Architecture Decisions
description: Design rationale for the Deployment Planning Platform
last_updated: 2025-12-21
---

# Architecture Decisions

## 1. Why Vanilla JS (No Framework)?

### Decision
The platform remains 100% framework-less (No React/Vue/Svelte), relying on direct DOM manipulation and custom events.

### Rationale
*   **Zero Build Wait**: Development is instant (Refresh → See change).
*   **Portability**: The entire platform can be zipped and run from any static server or local file system.
*   **Performance**: Initial load is <100ms because there is no framework hydration phase.
*   **Longevity**: No dependency hell or breaking framework updates.

## 2. Shared Engine Architecture

### Decision
Centralized logic files (`i18n.js`, `calc.js`) are shared across all 5 pillars of the site.

### Rationale
*   **Logic Parity**: Ensures the "Quick Estimate" in the Model Drawer matches the "Full Estimate" in the Calculator.
*   **Bilingual Sync**: A single language toggle in the nav bar updates all views simultaneously via the `languageChanged` custom event.

## 3. Data Flow Pattern

The platform uses a **Reactive Pull Pattern** for UI updates.

```mermaid
graph LR
    Input[User Input/Filter] --> State[Update Filter State]
    State --> Logic[Apply applyFilters & groupModels]
    Logic --> Render[Direct DOM Update]
    Render --> Style[CSS Variables for Progress Bars]
```

## 4. Routing & Navigation

### Decision
Strict use of **Absolute Paths** for all internal links and asset references.

### Rationale
*   **Hierarchy Resilience**: Prevents broken images/links when navigating from root (`/index.html`) to sub-directories (`/for/enterprise.html`).
*   **Standardization**: Simplifies navigation logic in `js/nav.js` as it doesn't need to calculate relative "dots" (`../../`).

## 5. Deployment Strategy

### Decision
Completely static deployment via GitHub Pages.

### Rationale
*   **Security**: No backend means no attack surface for user data.
*   **Offline-First**: Once the initial `models.json` is cached, the entire sizing logic works without an internet connection.
*   **Zero Cost**: Infinite scaling at zero operational expense.

## 🛡️ Summary of Choices

| Choice | Benefit | Tradeoff |
| :--- | :--- | :--- |
| **Vanilla JS** | Speed & Portability | More manual DOM code |
| **Serverless** | Privacy & Reliability | No cross-device sync |
| **Absolute Paths** | Robust Navigation | Local `file://` limitations |
| **Custom Events** | Decoupled Logic | No built-in state debugger |
