---
name: Neumorphic Components Sandbox
description: Standalone component previews for hardware-inspired blocks
last_updated: 2025-12-11
---

# Neumorphic Components

Light, soft-shadow previews for concrete hardware metaphors (more literal redraws based on the reference photos):
- `style.css`: Shared neumorphic tokens and layered shadows tuned for etched metal/copper highlights.
- `hbm.html`: Stacked dies under a top cap with TSV columns and a BGA substrate grid.
- `compute-die.html`: Reticle grid and pad rails above/below the die with a peak-compute badge.
- `kv-cache.html`: Dual DDR-style sticks with IC cans, stickers, and gold fingers.
- `bandwidth-bus.html`: HBM ↔ die nodes bridged by interposer traces and via studs.
- `ports-and-flow.html`: Connector shells with copper contacts plus TTFT/TPS chips for prefill/decode.
- `references/`: Real-world photos for visual grounding (HBM package, GPU die, DDR module, interposer/bus, HDMI port).

`<span class="value" data-bind="...">` placeholders mirror calculator outputs so the components can be wired directly when integrated into the main page. Open any HTML file in this folder to view the standalone previews; numbers are placeholders.
