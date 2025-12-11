---
name: Styles Module
description: Dark theme visual design system
file: css/main.css
load_when: Style changes, responsive adjustments, theming
last_updated: 2025-12-11
---

# Styles Module

## Design System
**Theme**: Dark mode with purple/teal gradient background  
**Style**: Glassmorphism with subtle borders and shadows  
**Layout**: Responsive CSS Grid (auto-fit minmax pattern) with marketing + calculator sections

## Color Palette (CSS Variables)
```css
--bg: #060912          /* Page background */
--panel: #0f172a       /* Section cards */
--card: #0b1423        /* Input fields, result cards */
--text: #e8edf5        /* Primary text */
--muted: #9da7b8       /* Secondary text */
--accent: #7c3aed      /* Purple, primary action */
--success: #10b981     /* Green, positive status */
--warn: #f59e0b        /* Orange, warning */
--danger: #ef4444      /* Red, error */
--border: #1c2435      /* Element borders */
```

## Layout Structure
- **Landing hero** (`.hero-landing`): Two-column grid with CTA/buttons/stats + callout card containing language selector
- **Marketing sections** (`.landing-section`, `.landing-grid`, `.card-landing`, `.steps`): Feature grid, how-it-works steps, use-case cards, model roster
- **Calculator header** (`.hero`): Flex header with back-to-top CTA
- **Panels** (`.panel`): Calculator sections with border-radius 16px, shadow
- **Grid** (`.grid.two`, `.grid.three`): Responsive 2/3-column layouts
- **Cards** (`.card`): Result display cards in 2×2 grid
- **Fields** (`.field`): Input/select wrappers with labels

## Responsive Breakpoints
- **720px**: Stack calculator hero vertically; landing hero collapses to single column; tighter landing padding
- **1100px**: Reduce grid column min-widths; landing hero moves to single column

## Component Classes
- `.btn`: Gradient CTA; `.btn.ghost` for outline link-style buttons
- `.stat-chip`: Small badges for offline/preset/i18n stats
- `.card-landing`: Landing feature/use-case cards; `.icon-badge` for simple SVG icons
- `.steps` + `.step-card`: Numbered how-it-works tiles
- `.field`: Input/select wrapper with label, small helper text
- `.field.compact`: Minimal field style for inline controls and language switch
- `.metric`: Large result numbers (24px, weight 800)
- `.sub-row`: Two-column label/value pairs
- `.hf-link`: Hugging Face link with icon hover effects
- `.assumptions`: Small text explaining calculation methodology

## Visual Effects
- **Background**: Radial gradients (purple/teal) + linear gradient
- **Glassmorphism**: Semi-transparent panels with backdrop effects
- **Shadows**: `0 12px 45px rgba(0,0,0,0.3)` for depth
- **Hover states**: Button lift (-1px translateY), color transitions

## When to Update
- New color schemes (light mode, accessibility)
- Component additions (tooltips, modals, tabs)
- Animation/transitions
- Print styles

## 📚 Go Deeper
- Design tokens could be extracted for runtime theming
- Consider CSS custom properties for user-configurable themes
