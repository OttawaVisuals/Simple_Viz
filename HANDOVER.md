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
    ├── earth-moon-race.html      # speed-of-light concept
    ├── straw-hose-flow.html      # style reference implementation
    └── eratosthenes-shadow.html  # Earth's diameter from two shadows
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

**Migrated to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton (2026-08-14).** Now uses the
standard topbar → topgrid (title/sub | `t = d/v` equation | legend) → hero → resultrow →
note layout, cream/navy theme tokens with an explicit toggle, and the per-object accent
colors (light/Parker/bullet/jet) kept as separate hex constants outside the shared token
set since they're semantic (per CLAUDE.md's per-concept-color guidance). Two adaptations
since this concept doesn't have interactive sliders like straw-hose-flow:
- The **legend rows are hover-triggers, not slider-linked** — hovering a traveller's row
  dims the other three lanes in the hero SVG (`.lane.dim`), rather than recoloring an
  equation term (there's one `v` symbol shared by four different speeds, so no single
  term to link).
- The **speed multiplier** (previously a single cycling button) is now a discrete pill
  picker (1×/2×/4×/8×/16×/32×), matching the sanctioned "discrete picker" component
  pattern instead of a single button with hidden state.
- The **result column** shows light's live position (km from Earth) with a simple
  Earth→Moon reach gauge and a round-trip counter, replacing the old plain elapsed-time
  readout — there's no "limit" concept here so the gauge has no red bad-line/mark-label
  ghost machinery, just a track + moving mark.

Play/Pause/Reset controls and the underlying real-time physics (light bounces
continuously, Parker/bullet/jet crawl on a magnified 1,500 km ruler) are unchanged from
the original.

**Design history (pre-migration):**
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

### `eratosthenes-shadow.html` — "Two sticks measure a planet"

Built directly to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton (2026-08-14), no earlier
draft. Implements Eratosthenes' method: `D = 360°·d/(π·Δθ)`, where `d` is the distance
between two sticks on the same meridian and `Δθ` is the difference in shadow angle between
them at solar noon.

- **Two sliders** (`d`: 100–2000 km, `Δθ`: 1–20°) drive the equation directly — both are
  independent inputs, not one computed from the other, matching the "distance + angle in,
  diameter out" shape of the real method. Standard hover-linkage into the equation/legend
  terms, per the style guide.
- **Hero diagram, two panels in one SVG**: a small full-Earth globe inset (left) with the
  current `Δθ` shown as a highlighted wedge, connected via dashed fan lines (reusing
  earth-moon-race's magnifying-lens convention) into a larger schematic ground-level scene
  (right) — two vertical sticks, parallel dashed sun-ray guides from directly overhead, and
  a highlighted shadow on the second stick sized by `h·tan(Δθ)`. The zoomed panel is
  explicitly **not to scale** (labeled in-page) — stick spacing maps to `d` only
  proportionally within a fixed panel width, not literally, since real `d` values (100s–1000s
  of km) can't be drawn to true scale next to a stick a few centimeters tall.
- **Physics note on the diagram's reference frame**: both sticks are drawn vertical (as real
  gnomons are, locally perpendicular to the ground); the *sun ray* is drawn tilted by `Δθ` at
  the second stick instead, rather than tilting the stick. This was a deliberate choice so the
  angle shown between ray and stick directly matches "Δθ = shadow angle," and the shadow
  length follows the standard `tan(Δθ)` relation — the equally-valid alternative (vertical sun
  rays, tilted stick) gives a different, non-standard `sin(Δθ)` shadow length and doesn't match
  how the effect is normally described.
- **Result box**: computed diameter vs. Earth's true mean diameter (12,742 km) as a percent
  error, plus a linear gauge (6,000–20,000 km) marking the true value as a reference line —
  intentionally *not* framed as possible/impossible like straw-hose-flow's gauge, since any
  `d`/`Δθ` pair is mathematically valid; the gauge here is purely "how close did this
  particular pair land you."
- **Presets**: Eratosthenes' actual historical numbers (800 km, 7.2° → 40,000 km, ~0.1% off);
  a clean "10° of latitude" pair (1,112 km, 10° → lands almost exactly on 12,742 km); and a
  "150 km apart" pair showing the same method still works at a much shorter baseline (chosen
  to stay inside the sliders' own range — an earlier draft used 50 km, which fell below the
  slider's 100 km floor and desynced the thumb position from the readout; fixed by moving the
  preset inside range and clamping the slider's fill-percent math defensively for future
  presets/edits).
- No measurement-error model: the equation is exact for any `d`/`Δθ` input, so presets differ
  only by which real numbers they use, not by correctness. The note explains, without
  modeling it, why small baselines are harder in practice (angle measurement precision).

### Style migration sweep (2026-08-14): `gravity-lab.html`, `mass-energy.html`, `planet-light-delay.html`

All three were rewritten from their original sparse dark-first look to the
[STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton in one pass, at the user's request ("update all
the other pages with the style"). Each keeps its original physics/data untouched — only the
chrome, layout, and interaction pattern changed (native `<input type=range>` sliders became
custom drag tracks, dropdown/button controls became discrete pill pickers, embedded SVG
`<text>` became percentage-positioned HTML `.lbl` overlays, per the style guide).

- **`gravity-lab.html`** ("The pull between worlds") — `F = Gm₁m₂/r²`. Kept the original's
  log-scale mass/distance sliders and exact preset values (two people, Earth+Moon, Earth+Sun)
  verbatim. Added a legend row for `G` (fixed constant) and `F` (computed, no slider). No
  gauge — there's no natural possible/impossible framing for gravitational force, so the
  result box instead translates the force into an "equivalent to lifting ___ kg on Earth"
  comparison against everyday weight thresholds (paperclip/coin/person/car/cargo ship).
  Force formatting needed unit prefixes out to `YN`/`ZN`/`EN`/`PN` (not just `kN`–`TN`) since
  planet-scale forces land in the 10¹⁹–10²² N range; mass formatting needed a generic
  scientific-notation fallback (`× 10ᵉ kg`) instead of the original's two fixed buckets
  (10²⁰/10²⁴), which broke down for Sun-scale masses (~2×10³⁰ kg) — this was a real bug
  caught during testing (garbled "1995262.31 × 10²⁴ kg" output), not a style preference.
- **`mass-energy.html`** ("How much energy is in matter?") — `E = mc²`, single mass slider
  (paperclip/coin/1 kg/100 kg presets, unchanged domain). Also no gauge, for the same
  reason; result box keeps the original's two comparison lines (1 kW-heater runtime, TNT
  equivalent) in the verdict-sub/effort-line slots. Fixed a formatting bug where very large
  heater runtimes printed as raw days (e.g. "1040225901.3 days") instead of converting to
  years past the 365-day mark.
- **`planet-light-delay.html`** ("You are seeing the past") — the most involved port: `t =
  d/c`, `s = vt`, shown as one combined `s = vd/c` equation. The `<select>` dropdown became a
  7-item pill picker (Moon/Mars/Jupiter/Saturn/Neptune/Sun/Andromeda); the distance slider's
  min/max now reconfigure per selected object, same as the original's per-planet near/far
  range. Kept the original's icon-drawing logic (per-planet SVG shapes) and its
  small-offset magnified inset (reused again as the established zoom-lens pattern) almost
  verbatim, just re-themed onto CSS custom properties instead of hardcoded per-planet hex
  colors. Fixed the same "huge number prints raw" class of bug for both light-travel time
  (years past 1,000 now use `toLocaleString` instead of 2-decimal fixed notation) and
  distance (light-years/AU past 1,000 likewise) — both surfaced clearly once Andromeda's
  ~2.5-million-year/light-year numbers were run through the original two-decimal formatters.

### Six-page batch (2026-08-14): `horizon-distance.html`, `lightning-distance.html`,  `braking-distance.html`, `rocket-equation.html`, `keplers-third-law.html`, `ocean-salt.html`

Built in parallel directly to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton, no earlier drafts — each agent was given exact reference numbers up front (rather than deriving physics itself) and instructed to read `straw-hose-flow.html` and copy its CSS/component patterns near-verbatim. All six pass a structural check (balanced `<script>`/`<style>`/`<div>`/`<svg>` tags, only the approved `--bg/--fg/--muted/--muted2/--line/--line2/--border/--accent/--bad/--track` CSS custom properties, no invented tokens).

- **`horizon-distance.html`** ("Why standing up lets you see farther") — `d = √(2Rh)`, R=6,371 km fixed, single **log-scale** height slider (1 m–500 km) since the effect spans person-height to ISS-altitude. Hero diagram is an explicitly-labeled schematic (not to true scale, per CLAUDE.md's honest-device guidance) since h ranges over 5+ orders of magnitude vs R. Gauge compares against English Channel width. Presets: beach/standing/lighthouse/airplane/ISS.
- **`lightning-distance.html`** ("How far away was that lightning?") — `d = v·Δt`, v=343 m/s fixed, single linear Δt slider (0–60s). Hero has a play button that animates a sound wavefront outward at a timing proportional to real Δt (60s maps to ~4s of animation). Linear (not log) gauge flags the ~15–20 km real-world thunder-audibility limit, well short of what the raw formula alone would suggest at high Δt. Confirms the folk "5 seconds per mile" rule.
- **`braking-distance.html`** ("Why speed quadruples your stopping distance") — `d = v²/(2μg)`, speed slider (10–200 km/h) + surface pill-picker (dry/wet/snow/ice μ values). Also computes and displays reaction distance (1.5s typical reaction time) alongside pure braking distance, so the result reflects real stopping-distance charts rather than just the idealized equation. Car animation uses a two-phase tween (linear during reaction, quadratic ease-out during braking) matching constant-deceleration kinematics.
- **`rocket-equation.html`** ("Why one more passenger costs so much fuel") — Tsiolkovsky `Δv = vₑ·ln(m₀/mf)`, log-scale mass-ratio slider (1.1–30) + engine pill-picker (solid/kerosene-LOX/hydrogen-LOX/ion). Gauge marks 9,400 m/s as the Δv needed to reach LEO (includes gravity/drag losses, not just orbital velocity). Ion drive is hard-coded to always show "Can't launch." regardless of its Δv number, since real ion engines can't produce enough thrust to lift off a planet even though their high exhaust velocity makes the raw Δv figure look sufficient — a case where the honest caveat had to override the naive gauge comparison.
- **`keplers-third-law.html`** ("Why Mercury's year is 88 days") — simplified solar-system form `T = a^1.5` (T in years, a in AU), sourced from the general `T² = 4π²a³/GM` and stated as such in the note. Log-scale semi-major-axis slider (0.2–50 AU), 9 presets (8 planets + Pluto). Gauge places the current period among real planets' periods on a log scale rather than using possible/impossible framing.
- **`ocean-salt.html`** ("Draining the ocean's salt onto dry land") — `h = m/(ρ·A)`, m=4.725×10¹⁹ kg (ocean salt mass, fixed) and ρ=2,170 kg/m³ (rock salt density, fixed) both constants, single interactive variable is a 4-option area pill-picker (world land/USA/Texas/France) since the picker itself already serves as the "try real values" mechanism — deliberately has no separate presets row, noted as intentional in-page. World-land case (~146 m) roughly matches the commonly-cited "~500 ft" trivia figure. Hero uses a log-scale vertical axis (depths span 146 m–39 km depending on area) with reference lines (Eiffel Tower, Burj Khalifa, Everest, cruising altitude).

All six were added to `index.html`'s main grid (numbered 07–12) and removed from the roadmap list in the same edit.

## Roadmap

A running list of future equation pages now lives directly in `index.html`, in a "What's
next" section below the built grid, so progress is visible on the site itself rather than
only in this file. Each entry has the concept, its core equation, and a status tag (`up
next` / `idea`). Update that list in `index.html` directly as pages move from idea → next →
built (moving a built one out of the roadmap list and into the main `.grid` section with a
numbered `.concept` card, per the existing pattern).

**Distance to the horizon**, **how far away was that lightning**, **braking distance vs
speed**, **the rocket equation**, **Kepler's third law**, and **all the salt in the sea** were
all built in the 2026-08-14 six-page batch above and moved out of this list.

Remaining idea, not yet scoped: **the weight of all animal life** (humans vs livestock vs
wild mammals by total biomass, not headcount — a Fermi-style comparison rather than a clean
single equation, so its visual form needs more thought than the others).

## Open questions / next steps

- A site index (`index.html`) now links twelve concepts, most recently the six-page batch
  above (horizon distance, lightning distance, braking distance, the rocket equation,
  Kepler's third law, ocean salt). Each is intentionally a simplified explainer, with its
  approximation stated in-page.
- **Decided (2026-08-14):** every visualization should share the visual language in
  [STYLE_GUIDE.md](STYLE_GUIDE.md) — the user confirmed straw-hose-flow.html's v5 design as
  the site's style going forward. `earth-moon-race.html` was migrated the same day, and
  `gravity-lab.html`, `mass-energy.html`, and `planet-light-delay.html` followed in a
  dedicated sweep later that day (see above) — every page on the site now shares this style.
- The zoom window in `earth-moon-race.html` is a **fixed** 1,500 km (not auto-scaling to
  keep fast objects in frame) — deliberate simplification. If a future request wants the
  probe to stay visible the whole time, an auto-zoom-out camera is the next thing to try,
  but note it has a failure mode: once the fastest object finishes and caps out, the
  furthest-distance-driven zoom will lock at that scale and flatten the slower objects again
  unless the scaling logic explicitly excludes finished racers.
- No build/lint/test tooling exists in this repo yet — everything is validated by opening
  the HTML file directly. Add tooling only if the project's scope grows enough to need it.
