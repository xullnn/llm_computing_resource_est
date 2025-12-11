---
name: Structure Module
description: HTML document structure and semantic markup
file: index.html
load_when: Adding form fields, restructuring sections, SEO/accessibility
last_updated: 2025-12-11
---

# Structure Module

## What
Semantic HTML5 document defining the landing + calculator experience:
- Marketing landing stack (hero, features, how-it-works, use cases, model roster)
- Calculator header, form sections, and results cards
- Language selector lives in the landing hero (EN/ZH)

## Document Structure

### Head
- UTF-8 charset, viewport meta for mobile
- SEO: meta description/keywords, OG/Twitter tags, JSON-LD SoftwareApplication, canonical (https://llmrunnable.com/)
- Title: "LLM Resource Sizer"
- CSS link: `css/main.css`
- Sitemap/robots: `sitemap.xml` and `robots.txt` at root pointing to `https://llmrunnable.com/`

### Body

#### Landing hero (`.hero-landing`)
- Pill eyebrow + H1 + subhead + CTA buttons (scroll to calculator / how-it-works)
- Stats chips (offline, presets, bilingual)
- Callout card with checklist + language selector dropdown (EN/ZH)

#### Marketing sections
- Features grid (offline, physics-backed, presets, bilingual)
- How-it-works steps (inputs → math → outputs)
- Use cases (hobbyists, research, teams)
- Model coverage blurb (16 presets roster)

#### Calculator header (`.hero#calculator`)
- Eyebrow: "Calculator"
- H2: "LLM Resource Sizer"
- Lead text + link back to top

#### Main

**Section 1: Model** (`.panel`)
- Model preset dropdown (with HF link)
- Model params (B)
- Active params for MoE (B, optional)
- Weight precision (BF16/FP16/FP8/INT8/INT4)
- KV precision (BF16/FP16/FP8)
- Hidden size (override, optional)
- Layers (override, optional)

**Section 2: Workload** (`.panel`)
- Prompt tokens
- Max new tokens
- Batch size / concurrency
- Target throughput (tokens/sec per stream)
- Target TTFT (ms)
- Utilization (compute)
- Utilization (bandwidth)

**Section 3: Results** (`.panel.results`)
- Compute unit selector (TFLOPS/GFLOPS/PFLOPS/TOPS)
- 4 cards: VRAM, Compute, Bandwidth, TTFT
- Assumptions text (calculation methodology)

### Scripts (end of body)
1. `js/models.js` (data)
2. `js/calc.js` (logic)
3. `js/ui.js` (presentation)

## Accessibility Features
- All inputs have `<label>` wrappers
- Helper text via `<small>` elements
- `data-i18n` attributes for translation targets
- External links: `rel="noreferrer noopener"`
- ARIA labels on HF link (dynamic)

## Form Fields Pattern
```html
<label class="field">
  <span data-i18n="key">Label</span>
  <input id="fieldId" type="number" ...>
  <small data-i18n="keyHelp">Help text</small>
</label>
```

## When to Update
- Adding new input fields (model params, workload specs)
- Restructuring sections (tabs, collapsible panels)
- Adding new result cards (cost, power consumption)
- SEO improvements (meta tags, Open Graph)
- Accessibility enhancements (ARIA labels, keyboard nav)

## 📚 Go Deeper
- **Styling**: See `../styles/summary.md`
- **Translation system**: See `../../integration/i18n-system.md`
