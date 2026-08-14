# Handover

Working log for switching between Claude and Codex on this project. Update this file
whenever a design direction is decided, reversed, or left open — the goal is that either
tool can pick up mid-stream without re-reading the whole chat history.

## Folder structure

```
Simple_Viz/
├── CLAUDE.md                    # design + technical rules for this project
├── HANDOVER.md                  # this file
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

- Interactive tube: sliders for radius (1.5–40 mm, spans coffee stirrer → fire hose) and
  length (0.1–30 m), plus a liquid picker (air/water/milkshake, each with a real viscosity
  and a representative target flow rate). A gauge needle shows the suction pressure required,
  color-coded against a red line at ~10 kPa — a rough estimate of sustained human mouth
  suction, stated as approximate in the footnote.
- Animated flow dots move at the tube's real average velocity (Q/πr²), so a wider tube at
  the same flow rate visibly moves slower — a physically accurate detail, not just flavor.
  Dots freeze and the tube outline turns red when the required pressure exceeds the human
  limit.
- A small comparison line under the controls directly demonstrates the asymmetry: doubling
  length always doubles ΔP; doubling radius always cuts it to 1/16.
- Deliberately scoped to horizontal flow only (pure viscous drag). The much better-known
  "you can't suck water up more than ~10m" limit is a *different* phenomenon (hydrostatic —
  fighting atmospheric pressure, not viscosity) and is only mentioned as a footnote caveat,
  not modeled, to avoid conflating two separate mechanisms in one equation.
- Reference numbers used: η(air) 1.81×10⁻⁵ Pa·s, η(water) 1.0×10⁻³ Pa·s, η(milkshake) 0.3
  Pa·s, η(honey) 5 Pa·s (representative values, not fixed constants); target flow 5 mL/s for
  liquids, 0.3 L/s for air.

**Revision history (v2 and v3 both superseded by v4, current):** v2 added an illustrated
scene, top-positioned controls, and tick-marked sliders after the user liked that direction
in principle — but the actual layout was guessed from a verbal description and didn't match
what the user had in mind. v3 tried again against a PowerPoint mockup of the intended layout
(person icon → straw → glass above three selectors, arrows into a big equation, gauge below)
— closer, but a static mockup still couldn't convey *behavior* (what recolors vs resizes vs
swaps, what's animated vs static, what each piece of text's job is), so it still missed. This
is what prompted [DESIGN_BRIEF_TEMPLATE.md](DESIGN_BRIEF_TEMPLATE.md) — see that file's
"Why this exists" section. **v4 (current) was built directly from a filled-out design brief**
(preserved in `Drafts/Straw_Design.md`) and matched on the first pass. Key specifics from
that brief, worth reusing as patterns:
- **Icons show magnitude, not just identity.** Length and diameter icons are a single outline
  at the control's max value with an inner shape that fills *linearly* with the slider's own
  raw position (not log-mapped) — a visual "how much of the max is this" readout. The fluid
  icon (a droplet) is the one exception: since viscosity spans ~5 orders of magnitude across
  the four fluids, filling it by the *raw* value would make three of the four fluids look
  identically empty next to honey — it fills by the fluids' evenly-spaced *position*
  (0/33/66/100%) instead, colored to the selected fluid. Flagging this pattern: when a
  linear-fill icon's underlying values span multiple orders of magnitude, fill by position
  among the options, not by the raw value.
- **The hero scene doesn't animate** — it's a static recompute on every change (straw recolors
  to the fluid, fills to the selected length, and shows a dashed tick + red overflow past the
  longest length still humanly feasible for the current fluid+diameter). The *only* motion
  anywhere on the page is a one-shot marker sliding across the bar chart on change, no loop.
- **Bar chart scale is per-fluid and logarithmic.** Its ceiling/floor are the worst/best case
  reachable within the sliders' own range for the *selected* fluid (max length + min diameter
  / min length + max diameter), mapped via a log scale — tried linear first and the human
  suction/blow zones (a few kPa) were an invisible sliver next to a viscous fluid's worst case
  (which reaches into MPa); log mapping keeps the zones legibly sized regardless of which
  fluid is picked.
- **Numbers were deliberately dropped from the primary readout** in favor of a plain
  "Possible"/"Impossible" verdict, since kPa doesn't mean much to most readers; when
  impossible, it names a real device that could still do it (household vacuum → shop-vac →
  industrial pump, by ascending suction capability) rather than just saying no.
- **Equation term arrows require measured layout, not hardcoded coordinates** — the ΔP
  formula is laid out character-by-character via `getComputedTextLength()` at runtime so the
  numerator/denominator can be measured and centered exactly, with arrows anchored to the
  measured centers of η, L, and r. Hardcoding pixel positions for text this precise doesn't
  survive a font/size change.
- **Gotcha: CSS `transition`/`transform` on SVG elements didn't animate in testing** (`x1`/`x2`
  aren't CSS-animatable, and even wrapping in a `<g>` with `transform: translateX()` produced
  no visible motion in this environment) — the marker slide is done with a plain
  `requestAnimationFrame` tween instead, which is portable everywhere. Prefer JS-driven tweens
  over CSS transitions for SVG geometry animation on this project going forward.
- Real numbers used: η(air) 1.81×10⁻⁵ Pa·s · η(water) 1.0×10⁻³ Pa·s · η(milkshake) 0.3 Pa·s ·
  η(honey) 5 Pa·s; Q = 5 mL/s for liquids, 0.3 L/s for air; human-limit zones: sucking easy
  <4 kPa / hard 4–10 kPa / impossible >10 kPa, blowing easy <5 kPa / hard 5–20 kPa /
  impossible >20 kPa (all rough estimates, stated as such in-page); device suction estimates:
  household vacuum ≈20 kPa, shop-vac ≈30 kPa, industrial vacuum pump ≈90 kPa.

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
- Whether every future visualization should share this exact visual language (serif title,
  monospace data, magnifying-lens device for scale disparities) or whether each concept
  should get its own distinct treatment — not yet decided by the user. Current default:
  reuse this language unless a concept clearly calls for something else.
- The zoom window in `earth-moon-race.html` is a **fixed** 1,500 km (not auto-scaling to
  keep fast objects in frame) — deliberate simplification. If a future request wants the
  probe to stay visible the whole time, an auto-zoom-out camera is the next thing to try,
  but note it has a failure mode: once the fastest object finishes and caps out, the
  furthest-distance-driven zoom will lock at that scale and flatten the slower objects again
  unless the scaling logic explicitly excludes finished racers.
- No build/lint/test tooling exists in this repo yet — everything is validated by opening
  the HTML file directly. Add tooling only if the project's scope grows enough to need it.
