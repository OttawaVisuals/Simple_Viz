# Handover

Working log for switching between Claude and Codex on this project. Update this file
whenever a design direction is decided, reversed, or left open — the goal is that either
tool can pick up mid-stream without re-reading the whole chat history.

## Folder structure

```
Simple_Viz/
├── CLAUDE.md                    # design + technical rules for this project
├── HANDOVER.md                  # this file
├── STYLE_GUIDE.md               # the current, user-approved visual language — start new pages here
├── DESIGN_BRIEF_TEMPLATE.md     # fill-in template for requesting a new/redesigned page
└── visualizations/
    └── earth-moon-race.html   # speed-of-light concept, current iteration
```

**Before starting a new page or a redesign, fill out
[DESIGN_BRIEF_TEMPLATE.md](DESIGN_BRIEF_TEMPLATE.md)** (or ask the user to) — it walks
through icon states, animation triggers, layout order, and text roles explicitly, since
those are exactly the details a static mockup (screenshot, PowerPoint) tends to drop.

Each concept is one self-contained `.html` file in `visualizations/` — open it directly in
a browser, no server or build step needed. Naming is kebab-case and descriptive
(`earth-moon-race.html`, not `viz1.html`).

## Built so far

### `earth-moon-race.html` — "Earth to the Moon, at real speed"

Shows four things crossing the real Earth–Moon distance (384,400 km) at their real speed:
light, NASA's Parker Solar Probe, a rifle bullet, and a commercial jet.

**Current design (as of this iteration):**
- Everything runs at true 1:1 real time — no time compression, no log scale.
- Light is fast enough (1.28 s one-way) to animate directly on the full-scale track; it
  bounces Earth↔Moon continuously.
- Parker/bullet/jet are too slow to show motion at that scale, so a small dashed "lens" box
  near Earth on the overview connects via diagonal lines to one shared ruler showing just the
  first 1,500 km. Their vertically offset markers all use that same ruler, so their positions
  compare directly without turning the lower half into three separate chart lanes. Parker
  crosses that window in seconds and is marked "off-scale" past the edge; the bullet and jet
  stay visible crawling near the start.
- A speed multiplier (1×/2×/4×/8×/16×/32×, cycles on click) scales all four clocks equally —
  no distortion introduced between racers at any setting.
- Visual style: serif type for title/subtitle (reading text), monospace for all numbers, no
  card/panel/badge chrome, minimal text-styled controls. Travel times now sit directly beside
  each moving marker; the redundant reference table was removed.

**Reference numbers used** (recheck if reused elsewhere): distance 384,400 km · light
299,792 km/s · Parker Solar Probe 192 km/s (record speed near the Sun, not a speed it
reaches near Earth — flagged in the footnote) · bullet 1 km/s · jet 0.25 km/s.

**Rejected approaches, and why:**
1. *Log-scale timeline slider* (v1) — technically honest (position = elapsed ÷ own travel
   time, just the clock underneath was log-compressed) but the user found it confusing/not
   wanted; asked for a standard linear time scale instead.
2. *"Treadmill" scrolling-ruler lanes* (v2) — fixed marker, background ruler scrolls past to
   imply speed (like a car odometer). Technically sound but the user said it "wasn't
   working" visually/conceptually — didn't read clearly as motion.
3. *Landed on*: real 1:1 time + magnifying-lens callout (v3, current), sketched directly by
   the user as a small box with diagonal connector lines fanning into a larger zoomed panel.
   This is the pattern to reuse for future concepts with large speed/scale disparities.

### `straw-hose-flow.html` — "Why the straw gives up"

Explains why a long drink straw becomes impossible to sip through while a much longer
garden hose stays effortless, via the Hagen–Poiseuille law: ΔP = 8ηLQ/(πr⁴). Resistance
scales linearly with tube length but with the *inverse fourth power* of radius, so radius
dominates.

**v5 (current) is the canonical style reference for the whole site — see
[STYLE_GUIDE.md](STYLE_GUIDE.md).** The user liked a hand-designed draft
(`Drafts/Why the straw gives up.dc.html`, built in an external tool with a React-like
component framework) enough to say "this is the style" and ask for it recorded as the
default going forward. This page is that draft ported to a self-contained, dependency-free
HTML/CSS/vanilla-JS file (no Google Fonts, no framework — see CLAUDE.md's technical
constraints), then iterated with the user across several rounds:
- Cream/navy (never black) theme with an explicit toggle button, serif+mono type contrast,
  and equation terms/legend rows that recolor to the accent color when the matching slider
  is hovered or dragged — the style's signature detail.
- Layout, current: topbar (back link + law name + theme toggle) → 3-column header (title+sub
  | equation, centered both axes | legend table, one line per row) → full-width animated
  hero diagram → 2-column row (sliders 2/3 | result+gauge 1/3) → one-line "Try" presets →
  closing note with a source link and the page's narrative hook.
- Interactive tube: sliders for length (0.1–10 m) and diameter (1.5–10 mm), plus a fluid
  picker (air/water/milkshake/honey, each a real viscosity and representative flow rate). A
  compact gauge shows required pressure on a log scale against a "mouth limit" line; while
  dragging a slider, the gauge's ghost marker + label switch to a relative "3.2× harder"
  readout instead of an absolute value.
- Numeric result *is* shown (kPa, unlike the v4 experiment below) with a "Possible."/
  "Impossible" verdict inline right after it on the same line; when impossible, names a real
  device that could still do it (household vacuum → shop-vac → industrial pump).
- Animated flow dashes move at the tube's real mean velocity (Q/πr²), freezing when the
  required pressure exceeds the human limit.
- Deliberately scoped to horizontal flow only (pure viscous drag). The much better-known
  "you can't suck water up more than ~10 m" limit is a *different* phenomenon (hydrostatic —
  fighting atmospheric pressure, not viscosity) and is only mentioned as a note caveat, not
  modeled, to avoid conflating two separate mechanisms in one equation.
- Reference numbers used: η(air) 1.81×10⁻⁵ Pa·s, η(water) 1.0×10⁻³ Pa·s, η(milkshake) 0.3
  Pa·s, η(honey) 5 Pa·s (representative values, not fixed constants); target flow 5 mL/s for
  liquids, 0.3 L/s for air; human-limit zones: sucking easy <4 kPa / impossible >10 kPa,
  blowing easy <5 kPa / impossible >20 kPa (rough estimates, stated as such in-page); device
  suction estimates: household vacuum ≈20 kPa, shop-vac ≈30 kPa, industrial pump ≈90 kPa.

**Revision history (v2–v4, all superseded):** v2 added an illustrated scene, top-positioned
controls, and tick-marked sliders after the user liked that direction in principle — but the
layout was guessed from a verbal description and didn't match what the user had in mind. v3
tried again against a PowerPoint mockup (person icon → straw → glass above three selectors,
arrows into a big equation, gauge below) — closer, but a static mockup still couldn't convey
*behavior*, so it still missed. This is what prompted
[DESIGN_BRIEF_TEMPLATE.md](DESIGN_BRIEF_TEMPLATE.md). v4 was built directly from a filled-out
brief (`Drafts/Straw_Design.md`) and matched on the first pass, but was itself later replaced
wholesale by v5 once the user supplied the hand-designed draft above. Patterns from v4 worth
knowing even though its specific UI is gone:
- **Icon magnitude pattern** (not currently used in v5, but worth reusing if a future page
  wants linear-fill icons): fill an icon by the control's raw slider position, *except* when
  the underlying values span multiple orders of magnitude (like viscosity across the four
  fluids) — then fill by the options' evenly-spaced *position* instead, or the smaller values
  all look identically empty next to the largest.
- **Equation-arrow layout via `getComputedTextLength()`** — superseded in v5 by a plain HTML
  flex/fraction layout (see STYLE_GUIDE.md's "Equation" pattern), which is simpler and just
  as legible; no more runtime text measurement needed for the equation itself.
- **Gotcha, still relevant: CSS `transition`/`transform` on SVG elements didn't animate in
  testing** (`x1`/`x2` aren't CSS-animatable, and even wrapping in a `<g>` with
  `transform: translateX()` produced no visible motion in this environment) — use a plain
  `requestAnimationFrame` tween instead, which is portable everywhere. Prefer JS-driven
  tweens over CSS transitions for SVG geometry animation on this project going forward. (v5's
  gauge sidesteps this entirely by using absolutely-positioned HTML `<div>`s with percentage
  `left`/`width` instead of SVG, which *can* use a plain CSS `transition:left` — see
  STYLE_GUIDE.md's "Result readout" pattern.)

## Roadmap

A running list of future equation pages now lives directly in `index.html`, in a "What's
next" section below the built grid, so progress is visible on the site itself rather than
only in this file. Each entry has the concept, its core equation, and a status tag (`up
next` / `idea`). Update that list in `index.html` directly as pages move from idea → next →
built (moving a built one out of the roadmap list and into the main `.grid` section with a
numbered `.concept` card, per the existing pattern).

Current top pick: **Earth's circumference from shadows** (Eratosthenes' method — two sticks,
two shadow angles, one known distance between them, `C = 360°·d/Δθ`) — pick this up next.

Two new ideas added to the roadmap list in `index.html` (2026-08-13, both still `idea` status,
not scoped yet): **all the salt in the sea** (dissolved ocean salt spread over dry land,
`h = m/(ρ·A)` — likely lands on the "spread over land ~500 ft deep" framing, needs a real
figure check) and **the weight of all animal life** (humans vs livestock vs wild mammals by
total biomass, not headcount — a Fermi-style comparison rather than a clean single equation,
so its visual form needs more thought than the others).

## Open questions / next steps

- A site index (`index.html`) now links five concepts. Three earlier self-contained
  interactions were added: `planet-light-delay.html` (past vs current planetary position),
  `mass-energy.html` (E = mc² mass-energy comparison), and `gravity-lab.html` (Newtonian
  gravitational attraction). `straw-hose-flow.html` (Hagen–Poiseuille flow resistance) was
  added most recently. Each is intentionally a simplified explainer, with its approximation
  stated in-page.
- **Decided (2026-08-14):** every new visualization should share the visual language in
  [STYLE_GUIDE.md](STYLE_GUIDE.md) — the user confirmed straw-hose-flow.html's v5 design as
  the site's style going forward. The four earlier pages (`earth-moon-race.html`,
  `gravity-lab.html`, `mass-energy.html`, `planet-light-delay.html`) predate this and haven't
  been migrated — update them to match opportunistically when next touched, not as a
  dedicated sweep unless the user asks.
- The zoom window in `earth-moon-race.html` is a **fixed** 1,500 km (not auto-scaling to
  keep fast objects in frame) — deliberate simplification. If a future request wants the
  probe to stay visible the whole time, an auto-zoom-out camera is the next thing to try,
  but note it has a failure mode: once the fastest object finishes and caps out, the
  furthest-distance-driven zoom will lock at that scale and flatten the slower objects again
  unless the scaling logic explicitly excludes finished racers.
- No build/lint/test tooling exists in this repo yet — everything is validated by opening
  the HTML file directly. Add tooling only if the project's scope grows enough to need it.
