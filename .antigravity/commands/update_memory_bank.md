

## Now

Briefly recall what the project is, what we just changed in the codebase, and what the new “current truth” is. Assume major changes may have made parts of the memory bank inaccurate.

Now check the **Project Memory Bank** to investigate if it accurately reflects the **current implementation**.

1. **Scan the relevant Memory Bank layers (progressively)** to refresh context.
2. **Cross-check against the current codebase** to confirm what changed and what is now true.

Produce a **high-level update plan** to bring the Project Memory Bank fully in sync with the current implementation.

#### Key goals

- **Reflect current reality**: architecture, module boundaries, interfaces, and integration points must match the code as it exists today.
- **Prune aggressively**: identify and remove (or clearly mark) **legacy / obsolete / misleading** content that could contaminate future reasoning.
- **Avoid duplication**: do not mirror the codebase in prose.

#### Content rules

- **Do not paste code unless unavoidable.**
   Prefer:
  - diagrams / flowcharts / sequence flows
  - file paths + module/class/interface names
  - concise bullet summaries of behavior and decisions
- **When details matter, reference instead of repeating**: point to the exact file(s) where the truth lives.
- **Keep updates layered and minimal**: update only the files/layers that must change for the new reality.

#### Output format: update plan only

Provide a plan that includes:

- **Files to update** (by path) and the **type of change** (add / rewrite / prune / split).
- **Obsolete sections to remove** and why they’re obsolete.
- **New or changed interfaces/integration points** that must be reflected.
- **Any diagrams to add/refresh** (and where they should live).
- **Verification checklist**: what to confirm in code before finalizing edits.

Do **not** apply edits yet — only produce the plan.