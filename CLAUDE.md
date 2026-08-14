# Simple Viz

Interactive, single-page visualizations that make a physics/math concept viscerally
understandable — the speed of light, calculating Earth's diameter from shadows, that kind
of thing. One concept per page. The insight should come from *looking and playing*, not
from reading paragraphs.

## Design principles

**See [STYLE_GUIDE.md](STYLE_GUIDE.md) for the current, user-approved visual language** —
design tokens (colors, type), page skeleton, and component patterns (theme toggle, equation,
sliders, etc.), all extracted from [`visualizations/straw-hose-flow.html`](visualizations/straw-hose-flow.html),
the reference implementation. Start new pages from that file's `<style>` block rather than
designing from scratch. The principles below still apply; STYLE_GUIDE.md is how they're
currently expressed in code.

- **Simple and elegant, not a dashboard.** No card/panel chrome, no drop shadows, no
  "eyebrow + badge" cliché. Content sits directly on the page background; use thin hairline
  rules sparingly to separate sections. (Outlined, transparent pill-shaped buttons *are* now
  sanctioned, but only for small discrete-option selectors — see STYLE_GUIDE.md — not for
  primary actions or navigation.)
- **Format: title + one subtitle paragraph + figure.** The subtitle states the real numbers
  and the concept in one breath. Everything after that is the diagram. Avoid stacking
  multiple boxed sections (data tables, notes, controls) each in their own card — keep them
  as plain page content.
- **Typography does the separating.** A serif or humanist face for the title/subtitle
  (the reading text), monospace for numbers and data readouts. That contrast alone is
  usually enough structure — don't reach for extra visual dividers on top of it.
- **Real numbers, honestly presented.** Use accurate physical constants and distances.
  When speeds differ by orders of magnitude, prefer an honest device — a magnifying/zoom
  callout on a small region, a fixed camera with the world scrolling past — over a log-scale
  or warped timeline. If a compromise or approximation is made (e.g. a record speed used as
  a hypothetical), say so directly in the copy.
- **Interactive over decorative.** Prefer a play/pause + speed control the user can act on
  over a static illustration. Keep controls minimal and text-styled, not button-shaped UI
  chrome.
- **Theme-aware.** Every visualization must render correctly in both light and dark mode
  (`prefers-color-scheme` plus a `data-theme` override), since these get published as
  Artifacts viewed in either. Dark mode uses a dark blue background, never black. Include an
  explicit in-page toggle (see STYLE_GUIDE.md) rather than relying on system preference alone.

## Technical constraints

- **One self-contained HTML file per concept**, in `visualizations/`. No build step, no
  bundler, no external dependencies (no CDN scripts, no web fonts, no analytics).
  Everything — CSS, JS, SVG — lives inline in that one file so it can be opened directly in
  a browser or published as-is.
- **Hand-authored inline SVG** for diagrams (native shapes: `circle`, `rect`, `line`,
  `polygon`, `path`), animated via vanilla JS (`requestAnimationFrame`, attribute updates).
  No charting or animation libraries.
- **File naming:** kebab-case, descriptive of the concept, e.g. `earth-moon-race.html`,
  `eratosthenes-shadow.html`.

## Current state

See [HANDOVER.md](HANDOVER.md) for what's built, the reasoning behind current design
choices, and open questions for whoever picks this up next (Claude or Codex).
