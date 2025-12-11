---
name: Architecture Decisions
description: Why this architecture and technology choices
last_updated: 2025-12-10
---

# Architecture Decisions

## Why Serverless/Offline?

### Decision
Pure client-side JavaScript with no backend, no external API calls.

### Rationale
1. **Privacy**: Users may estimate proprietary workloads; no data leaves their machine
2. **Speed**: No network latency; calculations finish in <5ms
3. **Accessibility**: Works offline (flights, air-gapped environments, developing countries)
4. **Cost**: Zero hosting/compute costs; scales infinitely via CDN
5. **Simplicity**: No server maintenance, no database, no authentication
6. **Reliability**: No server downtime; works as long as browser works

### Tradeoffs
- **No persistence**: Users can't save configurations (could add localStorage)
- **No analytics**: Can't track usage patterns (privacy-first feature)
- **No dynamic data**: Model presets hardcoded (but open-source models rarely change params)
- **No collaborative features**: Can't share configurations (could add URL params)

### When to Reconsider
- If adding user accounts and saved configurations
- If needing real-time model parameter updates from API
- If building team collaboration features
- If analytics become critical business need

---

## Why Vanilla JS (No Framework)?

### Decision
No React/Vue/Svelte; plain DOM manipulation with event listeners.

### Rationale
1. **Minimal bundle**: 150KB unminified (all code); frameworks add 40–100KB
2. **Performance**: No virtual DOM overhead; direct DOM updates fast for this scale
3. **Longevity**: No framework upgrade cycles; code works forever
4. **Learning**: Project serves as educational reference; frameworks obscure fundamentals
5. **Simplicity**: No build step, no JSX, no transpilation
6. **Transparency**: Users can "View Source" and understand everything

### Benchmarks
- **Current**: Page load ~50ms, calculation <5ms, render <2ms
- **With React**: +40KB bundle, +10ms initial render (negligible benefit)

### When to Reconsider
- If adding complex state (user accounts, saved configs, comparison mode)
- If UI complexity grows significantly (modals, tabs, wizards, drag-drop)
- If team scales beyond solo/duo (frameworks provide structure)
- If needing React ecosystem (component libraries, devtools)

---

## Why No Build System?

### Decision
No webpack/vite/parcel; raw ES6 or script tags.

### Rationale
1. **Simplicity**: `python -m http.server` or drag-drop to browser
2. **Transparency**: Users can read source directly (educational tool)
3. **No dependencies**: No `node_modules` (project is 5 files, 1150 lines)
4. **Git-friendly**: No generated files, no lockfiles
5. **Instant updates**: Edit → refresh (no rebuild wait)

### Current Setup
- HTML: Vanilla, no templating
- CSS: Plain CSS3 with variables (no preprocessor needed)
- JS: ES5 for compatibility (could upgrade to ES6 modules if desired)

### When to Add Build System
- If adding TypeScript (needs compilation)
- If needing CSS preprocessing (Sass/PostCSS)
- If splitting into ES modules (needs bundler for older browsers)
- If adding code minification for production
- If needing tree-shaking for large codebase

---

## Data Flow Pattern

### Decision
Unidirectional reactive flow: Input → Calculation → Render

### Rationale
1. **Simplicity**: Easy mental model (no circular dependencies)
2. **Debuggability**: Clear causality (change input → see effect)
3. **Performance**: Calculations fast enough to recompute on every change
4. **Testability**: Pure functions (calculator) separate from effects (DOM)

### Why Not MVC/MVVM?
- **No persistent model state**: Everything derived from inputs
- **No two-way binding needed**: One-way is sufficient
- **Simpler for small scope**: MVC overhead not justified for 5 files

### Why Not Redux/State Management?
- **No complex state**: All state is form values (already managed by DOM)
- **No async state**: No API calls, no loading states
- **No undo/redo**: Not needed for calculator

### Pattern Details
```
User Input (DOM) → Gather Values → Pure Calculation → Render Results (DOM)
      ↑                                                        |
      └────────────────────────────────────────────────────────┘
                     (loop on every change)
```

**Key principle**: Form inputs are single source of truth.

---

## Module Organization

### Decision
3 JavaScript files: `models.js` (data) → `calc.js` (logic) → `ui.js` (presentation)

### Rationale
1. **Separation of concerns**: Data, logic, presentation clearly separated
2. **Testability**: Calculator can be tested independently
3. **Reusability**: Calculator could be used in Node.js, CLI, etc.
4. **Clarity**: Each file has single responsibility

### Load Order
```html
<script src="js/models.js"></script>   <!-- Data first -->
<script src="js/calc.js"></script>     <!-- Logic second -->
<script src="js/ui.js"></script>       <!-- Presentation last -->
```

**Why this order**: 
- `ui.js` depends on `calc.js` and `models.js`
- `calc.js` is independent
- `models.js` is independent

### Why Not One File?
- **Maintainability**: Easier to find code by responsibility
- **Collaboration**: Less merge conflicts
- **Reusability**: Calculator can be extracted

### Why Not More Files?
- **Simplicity**: 3 files sufficient for 1150 lines
- **No over-engineering**: More files = more complexity without benefit

---

## I18n Approach

### Decision
Object-based translation dictionary; manual key lookup.

### Rationale
1. **Simple**: Only 2 languages (EN/ZH), ~50 keys
2. **Lightweight**: <1KB for all translations
3. **No dependencies**: i18n libraries are 10–50KB
4. **Transparent**: Easy to understand and debug

### Why Not i18next/vue-i18n?
- **Overkill**: Those libraries handle pluralization, date formatting, etc. (not needed)
- **Bundle size**: +30KB for features we don't use
- **Complexity**: Learning curve not justified for 50 strings

### When to Upgrade
- If adding 5+ languages
- If needing pluralization (1 item vs 2 items)
- If needing date/number formatting per locale
- If needing translation namespaces

---

## Styling Approach

### Decision
Plain CSS3 with CSS variables; no preprocessor.

### Rationale
1. **Modern CSS is powerful**: Variables, Grid, Flexbox solve most needs
2. **No build step**: Maintains simplicity
3. **Browser-native**: Best performance, no abstraction overhead
4. **Learning**: Educational for pure CSS skills

### Design System
- **CSS Variables** for theming (colors, spacing)
- **CSS Grid** for responsive layouts
- **Flexbox** for component alignment
- **Media queries** for breakpoints

### Why Not Tailwind?
- **Build step required**: Conflicts with no-build goal
- **Abstraction**: Want to show CSS fundamentals
- **Bundle size**: Unused classes add weight

### Why Not Sass/Less?
- **No nesting needed**: BEM or simple selectors sufficient
- **Variables solved by CSS**: Custom properties now native
- **No build step**: Keeps workflow simple

### When to Upgrade
- If design system grows complex (many components)
- If needing mixins (complex calculations)
- If team prefers Tailwind workflow

---

## Deployment Strategy

### Decision
Static files deployable to any CDN or web server.

### Rationale
1. **Simplicity**: Just copy files
2. **Compatibility**: Works on any host (GitHub Pages, Netlify, S3, etc.)
3. **Cost**: Free hosting options abundant
4. **Performance**: CDN edge caching for global speed

### Current Options
- **GitHub Pages**: Free, easy, version controlled
- **Netlify**: Free tier, instant deploys from git
- **Vercel**: Free tier, edge network
- **S3 + CloudFront**: Scalable, low cost

### No Server-Side Rendering
- **Not needed**: Pure calculator, no SEO requirements
- **Overhead**: SSR adds complexity without benefit

---

## Browser Compatibility

### Target
Modern browsers (last 2 versions of Chrome, Firefox, Safari, Edge)

### Features Used
- ES6 syntax (arrow functions, const/let, template literals)
- CSS Grid, Flexbox
- CSS Variables
- addEventListener
- querySelector

### IE11 Support
**Not targeted** - would require:
- Babel transpilation (adds build step)
- CSS Grid polyfills
- Custom property polyfills

**Rationale**: IE11 usage <1%, not worth complexity cost.

### Progressive Enhancement
- JavaScript required (not gracefully degrading to no-JS)
- **Rationale**: Calculator requires computation; no-JS fallback would be empty shell

---

## Testing Strategy

### Current State
No automated tests (project is 1150 lines, pure functions).

### Manual Testing
- Validate against known models (Llama 70B requirements)
- Cross-reference with vendor specs (NVIDIA A100, H100)
- User testing for calculation accuracy

### When to Add Tests
- If calculator logic becomes complex (>500 lines)
- If adding critical features (cost estimation, ROI calculation)
- If multiple contributors (prevent regressions)
- If converting to library (public API needs stability)

### Test Targets (if added)
- **Unit tests**: `calcRequirements()` with known inputs
- **Integration tests**: Full flow (preset → render)
- **Visual tests**: Screenshot comparison

---

## Performance Philosophy

### Approach
**No premature optimization** - keep code simple and readable.

### Current Performance
- Page load: ~50ms
- Calculation: <5ms (fast enough for real-time)
- Rendering: <2ms (direct DOM, 4 cards only)

### No Optimization Needed
- No debouncing: Calculations instant
- No memoization: Pure functions fast enough
- No virtual scrolling: No large lists
- No code splitting: Bundle already tiny (150KB)

### When to Optimize
- If calculation becomes complex (>50ms)
- If rendering slows down (>16ms, causes jank)
- If bundle grows large (>1MB)

**Rule**: Measure first, optimize only what's proven slow.

---

## Summary

| Decision | Reason | Tradeoff |
|----------|--------|----------|
| Serverless | Privacy, speed, cost | No persistence, no analytics |
| Vanilla JS | Performance, longevity | More boilerplate than frameworks |
| No build | Simplicity, transparency | No TypeScript, no modern syntax |
| Unidirectional flow | Debuggability, simplicity | Recomputes everything |
| Object i18n | Lightweight, simple | Manual key management |
| Plain CSS | No build, educational | No Sass conveniences |
| Static deploy | Universal compatibility | No dynamic features |

**Core philosophy**: Maximize simplicity and transparency for an educational, privacy-first calculator.

## 📚 Go Deeper
- **Data flow implementation**: See `../integration/data-flow.md`
- **System overview**: See `../core/system_overview.md`
- **Physics validation**: See `physics.md`

