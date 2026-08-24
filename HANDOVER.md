# Handover

## Physics and runtime fixes from a live-page review — 2026-08-23

A deep review of the 17 pages linked from `index.html` turned up eight numeric/copy errors and
two defects. All ten are fixed below; every fix was re-verified in-browser against a hand
calculation, and all 17 pages were re-checked afterwards for console errors, thrown click
handlers and horizontal overflow at 375px and 1280px (all clean).

- **`mass-energy.html` — China's annual energy was 1000x too small.** `CHINA_ANNUAL_J` was
  `168386888e9`, but the comment beside it correctly says *168,386,888 **TJ*** and 1 TJ = 1e12 J.
  Every "years of China's total annual energy supply" row was therefore 1000x too high (1 kg of
  matter appeared to be worth 0.53 years of it; the real figure is 5.3x10^-4). Now `e12`.
  - The `1.5x China's yearly energy` preset had been calibrated against the *buggy* constant, so
    its 2.81 kg was really 0.0015x. The honest mass for 1.5x is ~2,810 kg, above the slider's
    1000 kg ceiling — so the preset is now **`½x China's yearly energy`** at `data-m="2.972"`
    (936.8 kg), which lands on exactly 0.500x. The Sources note was updated to match.
- **`mass-energy.html` — horizontal overflow at 375px** (document was 526px wide). Two
  independent causes, both fixed: `#lblActual` ("zoom: first … of mc² — …") is left-anchored and
  `white-space:nowrap`, so it ran to x=542; it now wraps inside the hero at narrow widths
  (`geom()` returns `narrow` for this). And the stacked `.resultrow` used `1fr`, whose automatic
  `min-content` floor was pinned at 460px by the fuel-picker pills; now
  `minmax(0,1fr)` + `min-width:0` on `.ctrls`/`.result`. Verified 0 overflow at 320/375/414/700/820/1280.
- **`earth-moon-race.html` — the magnification was 67x, not 81x.** Both rulers share one
  viewBox, so the factor is `((ZOOM_X1−ZOOM_X0)/ZOOM_KM) / ((TRACK_X1−TRACK_X0)/D)` = **67.3x**.
  Corrected in the in-diagram label and the closing note.
- **`earth-moon-race.html` — wrong planet distances and a dead source.** The note claimed Mars,
  Jupiter and Saturn sit 232 / 795 / 1,511 million km from the Sun; NASA's planetary fact sheet
  gives **227.9 / 778.5 / 1,432** (Saturn was off by 5.5%). `MILESTONES` and the note now use those.
  The cited `spacemath.gsfc.nasa.gov` URL no longer resolves at all — replaced with
  `nssdc.gsfc.nasa.gov/planetary/factsheet/`. (A sweep of all 77 external links across the 17
  live pages found this was the only dead one.)
- **`index.html` — the braking tile said "stopping distance".** Stopping distance doesn't
  quadruple; only the *braking* component goes as v², which is the page's whole point. The tile's
  own `data-desc` and the page's `<h1>` both already said braking. Fixed to match.
- **`constant-acceleration.html` — the slider maximum displayed "100% c".** `speed()` used a
  fixed `maximumFractionDigits:6`, and `tanh(10)x100 = 99.9999996` rounds up to 100 — on a page
  whose slider label says "never reaches c". The same saturation also made the top ~7 steps print
  an identical "99.999999% c". Precision is now scaled to the remaining gap
  (`ceil(-log10((1-b)*100))+1` decimals), so every attainable speed shows two significant digits
  of its shortfall and every step is distinct. Slider max now reads **99.99999959% c**; the
  static range label was corrected to match (it had said 99.999996%, a third different number).
- **`cosmic-scale.html` — the scale-factor formula printed "= 0.0".** `factorText()` only used
  scientific notation above 100, so for everything below the geometric midpoint (quark, weak
  force, proton, virus — and the whole lower half of the slider) the line read
  "(selected ÷ smallest) ÷ (biggest ÷ selected) = 0.0" while the headline above it showed the
  reciprocal as e.g. 1.42x10^32. It now falls back to `sci()` below 0.1 as well: the quark reads
  `7.03 x 10^-33`.
- **`eratosthenes-shadow.html` — the "150 km apart" preset didn't reconcile.** It stored
  `theta2:5.55`, off the angle sliders' 0.1° grid, so the legend showed Δθ = **1.3°** while the
  circumference was computed from 1.35°: a reader doing 360x150/1.3 got 41,538 km, not the
  40,000 km printed. Snapped to `theta2:5.5`. The preset now reads C = 41,538 km, D = 13,222 km,
  **+3.8% off** — which is more honest anyway: a 150 km baseline *should* visibly amplify a
  rounded angle, and the old preset implied it was as good as Eratosthenes' 800 km one.
- **`eratosthenes-shadow.html` — the two "actual" figures disagreed.** The gauge compares against
  the mean diameter (12,742 km, i.e. C = 40,030 km) while the effort line cited the *equatorial*
  circumference (40,075 km). Two sticks on a shared meridian measure the north–south circle, so
  that line now reads **"actual: 40,008 km through the poles"**.
- **`microwave-chocolate.html` — "reset to 2.45 GHz" threw on every click.** `#freqReset` carries
  `class="preset"` for its styling but has no `data-p`, so the shared handler ran
  `presets[undefined].spacing` → `TypeError`. (The reset still worked — its own listener is
  registered separately and later listeners survive an exception — but it was the only uncaught
  error on the site.) The selector is now scoped to `.preset[data-p]`, with a `if(!p) return;`
  guard behind it.

### Two stale entries in this file, corrected

- The straw-page entry below describes air as solved from the closed form
  `p1²−p2² = G²fLRT/D` giving **222 kPa** for the Tim Vine preset. The shipped code implements the
  fuller isothermal balance *including* the acceleration term,
  `p1²−p2²−2G²RT·ln(p1/p2) = G²fLRT/D`, solved by bisection — which gives **235 kPa**. The page's
  own `.note` describes the shipped version correctly; only this file was behind. Hand-verified.
- The heat-pump entry's `+15°C` control point does not exist in `COP_CURVE`; the array goes
  `-20, -15, -8, 0, 8, 20`. +15°C falls on the same straight extrapolated segment by
  interpolation, so the behaviour is as described — only the wording is off.

### Known, not fixed in this pass

Style-level findings from the same review, left for a separate pass: `constant-acceleration.html`
has no `data-feedback` section at all; `basic-functions.html` has a forked feedback block, a
non-canonical brand wordmark and no `prefers-reduced-motion` (nor does `potato-trajectory.html`);
the standing `--s1`–`--s5` series palette is used only by `constant-acceleration.html`, and the
six pages inventing their own hexes declare no dark-mode variants (`braking-distance.html`'s
snow label is `#AFC6DB` on the light background — 1.62:1); `time-dilation.html`'s `.lc-play`
uses `color:#fff` instead of `var(--bg)`, 2.63:1 in dark mode; and `heat-pump-magic.html`'s
equation box shows the Carnot COP while the headline reports the real machine's.

## Primary animation controls standardized — 2026-08-23

- **`constant-acceleration.html`**, **`heat-pump-magic.html`**, and **`potato-trajectory.html`** now use the same filled accent playback pill as `well-depth.html`: play icon + clear action label, disabled running state, and replay label after completion.
- Inline controls such as `basic-functions.html`'s Play/Pause remain text-styled because they assist a slider rather than start a page's primary animation.

## Constant acceleration promoted — 2026-08-23

- **`visualizations/constant-acceleration.html`** is reviewed and complete. It was promoted from `unreviewed.html` to the main catalogue in `index.html`.
- Its homepage icon is the approved object-in-diagram mark: a small rocket following a dashed relativity curve, using the 2.2px subject / 1.3px context stroke ladder.
- `tracker.html` now defaults this page to **Checked — Reviewed and complete** for fresh browser profiles.

## Straw page merges the compressible airflow model, retires the Darcy page — 2026-08-23

- **`visualizations/straw-hose-flow.html`** (reviewed, live) now shows **two equations**
  (Hagen–Poiseuille and Darcy–Weisbach) stacked in the equation box; whichever one actually
  describes the current flow (`Re ≤ 2,300` vs. above) is highlighted, the other dims. This
  fixed a real bug: the page previously always displayed the laminar Hagen–Poiseuille formula
  even when water's Reynolds number had crossed into turbulent territory and the *computed*
  pressure had silently switched to a Darcy–Weisbach correction underneath — the equation on
  screen and the number on screen could disagree with no visual indication.
- **Air is no longer on the plain laminar formula regardless of speed.** It's far more wrong
  than the water case above: the Tim Vine straw preset (air, 1.5 m, 1.5 mm) hits ~170 m/s
  (Mach ≈ 0.5) and Re ≈ 16,900 — both turbulent *and* transonic, nowhere near where
  incompressible Hagen–Poiseuille applies. Air's pressure is now solved from the compressible
  Darcy–Weisbach momentum balance (`p1²−p2² = G²fLRT/D`, fixed exit at atmospheric), inverted
  to solve directly for the mouth pressure needed at a *fixed* target flow rate `Q` — this
  needs no iteration (unlike `straw-hose-flow-darcy.html`'s fixed-mouth-pressure direction,
  which iterates because `f` depends on the very flow it's solving for): fixing `Q` fixes the
  mass flux and therefore `Re` and `f` directly, so `p1` falls out in closed form. This is
  algebraically the same friction physics as the incompressible form (they agree at low
  pressure drop), not a third equation — the note now says so explicitly.
  - **Verified in-browser against hand calculation**: Tim Vine preset now reads **222 kPa**
    (up from the old, wrong 66 kPa), Re ≈ 16,939 (turbulent), Mach 0.49 — flagged as
    "beyond this model's low-speed assumption" since Mach ≥ 0.3. Milkshake preset still
    reads laminar/Hagen–Poiseuille active, Re ≈ 7. Garden hose preset (air, 10 m, 10 mm)
    reads transitional, Re ≈ 2,541, matching hand-derived values.
  - **Deliberately no choking guard added**, unlike the known-unfixed gap flagged in
    `pipe-flow-reference.html` for the old Darcy page (which could return Mach > 1 past the
    ~0.845 isothermal choking limit because it fixed mouth pressure and solved for flow).
    This page's fixed-`Q` direction bounds Mach to ≈0.5 at the narrowest slider setting
    (velocity depends only on `Q/A`), structurally below the choking limit — confirmed by
    checking the slider bounds, not by adding a runtime check for a case that can't occur.
- **Reynolds number is now a result** (`Re ≈ …`, current regime, linking to
  `reynolds-number.html`) computed the same way for every fluid, including air — the old
  `reynoldsFor()` special-cased air to `null`; giving air an explicit `rho:1.204` (exit/
  atmospheric density) let that special case disappear entirely.
- **`visualizations/straw-hose-flow-darcy.html` is retired** — it was never promoted to
  `index.html`, so its tile was removed from `unreviewed.html` and `tracker.html` instead,
  along with the icon-slug fallback that mapped its tile to the straw icon (no longer needed
  with no tile to map). The file itself is left in place, unlinked, rather than deleted.
  `reynolds-number.html`'s companion-pages link and closing note were updated to point only
  at the merged `straw-hose-flow.html` instead of the now-orphaned airflow model page.
- No console errors; no horizontal overflow confirmed at 375px and desktop widths via
  `scrollWidth`/`clientWidth`. **Not yet re-reviewed after this change** — recommend a human
  visual pass before considering the merge fully signed off, since the equation-box redesign
  (two stacked equations instead of one) hasn't been eyeballed, only measured.

## Time dilation — one-tick comparison and compact top layout, 2026-08-23

- **`visualizations/time-dilation.html`** now uses a user-triggered, bounded **“Play one tick”**
  sequence rather than a continuous decorative loop. It starts both clocks and photons together;
  the stationary clock completes one round trip while the moving clock advances by `1/γ`, then
  holds the final gap for comparison. Slider and preset changes re-sync it. Reduced motion jumps
  to the final state.
- The top animation is a two-column comparison: the two clock faces occupy the left column and
  the light-clock path uses the remaining width on the right. The moving path has exactly one
  round trip, matching the stationary path; this avoids a false speed difference at everyday
  speeds. Moving-clock elements use the accent colour consistently.
- The playback control is adjacent to the light-clock animation. The explanatory γ copy sits
  below the controls instead of competing with the animation, and the redundant Pythagorean
  derivation line was removed.
- The result is an even 50/50 controls/results row. It now reads directly as **“1.00 year on
  the moving clock = … years on Earth”**, retains the extra-time explanation, and marks the
  active magnitude on a semantic colour scale: negligible, small, measurable, large.
- JavaScript syntax and diff-whitespace checks passed. Browser visual QA was not available in
  this session; review the two-column top layout at desktop and mobile widths before publishing.

## Pizza comparison animation pattern — 2026-08-23

- **`visualizations/pizza-area.html`** now uses a quantity-comparison transformation pattern:
  a familiar source object stays visible, a copy moves and changes shape, then the transformed
  pieces assemble into the comparison area. The source/target quantities use distinct colours
  and the outcome is explicit: remaining space blinks green; overflow blinks orange. This is a
  page-specific pattern, not a replacement for the scale-reveal style used elsewhere.

## Well-depth primary playback control — 2026-08-23

- **`visualizations/well-depth.html`** establishes the primary playback-control treatment:
  a compact filled accent pill with play icon and action label, positioned clear of the opening
  animation state. It changes to a disabled running state and then a replay label. The style is
  documented in `STYLE_GUIDE.md` for pages where playback is the primary action.

## Live animation detail pass — potato and braking, 2026-08-23

- **`visualizations/potato-trajectory.html`** keeps the same projectile equations, controls and playback timing. The hero now shows a launch-velocity arrow before release, a live tangent velocity vector and gravity arrow during flight, an accent trail along the portion already travelled, potato spin/details, a clearer target ring, and hit/miss impact marks. The playback caption now reports the miss distance when applicable.
- **`visualizations/braking-distance.html`** keeps the same reaction/braking physics, controls, chart and 1.4-second tween. The hero now separates the two phases with quiet background bands, changes road texture with the selected surface, uses a more detailed car with rotating wheels, and adds live speed and rearward braking-force arrows. A heat-coloured trail and particles show where kinetic energy is dissipated, while a moving label reports phase, speed and percentage of energy dissipated from the same deceleration state.
- Both files pass JavaScript syntax, duplicate-ID, missing-element-reference and diff-whitespace checks. Automated browser QA remains unavailable because the in-app browser bridge still rejects its trusted dependency; inspect both once at desktop and mobile widths before publishing this pass.

## Heat-pump hero animation — visual upgrade, 2026-08-23

- **`visualizations/heat-pump-magic.html`** keeps its existing COP model, device comparison and chart. The formerly separate kWh-flow hero and lower refrigeration-cycle animation are now one combined hero; the lower diagram and its continuous animation were removed.
- In heat-pump mode the central device is a labelled sealed loop: evaporator → compressor → condenser → expansion valve. Blue/orange refrigerant particles circulate through those four states while the same playback brings Qc from outside air, W into the compressor, and Qh out of the condenser into the house. The stage caption explains each component in sequence.
- Electric-resistance and gas-furnace modes still replace the loop with their own machinery. Temperature-dependent snow/sun detail, indoor heat waves and the gas-flue loss remain.
- A text-styled **“Play the full cycle”** control runs the single bounded 3.9-second sequence. Device buttons and comparison presets replay it automatically. The displayed particle count is illustrative; arrow widths and exact kWh labels remain the quantitative encoding. `prefers-reduced-motion` skips to the final energy-balance sentence.
- JavaScript syntax, duplicate-ID, missing-static-element-reference and diff-whitespace checks pass. Browser playback QA remains open because the in-app browser bridge rejected its trusted dependency during this session; review the hero once at desktop and mobile widths before the next publish.

## Constant-acceleration page — development history, 2026-08-22

- **`visualizations/constant-acceleration.html`** began as an unreviewed special-relativity draft. It was promoted to `index.html` on 2026-08-23; the notes below preserve its implementation history.
- It uses constant **proper** acceleration (what passengers feel). The speed control is rapidity `η = ατ/c`, which maps to `v/c = tanh η` and gives useful resolution near light speed without ever selecting `c`.
- Current default: 1 g for `η = 1` gives 76.16% c after about 0.97 onboard years, 1.14 Earth years, and 0.53 light-years. The displayed distance, Earth time and onboard time assume one acceleration leg; stopping takes an equal deceleration leg.
- It does not model propellant, energy, radiation, collisions, gravity or engineering feasibility. Review source-link wording and visual layout at desktop/mobile before moving it to the reviewed catalogue.

### Follow-up — distance and energy, 2026-08-22

- A second logarithmic distance ruler now marks where the selected target speed is reached against the Moon, 1 AU, heliopause, outer Oort cloud, Alpha Centauri and Galactic-centre distances. The distances are reference markers, not targets or route plans.
- A 1 kg–100 tonne mass slider now reports `Eₖ = (γ − 1)mc²`, the Earth-frame kinetic energy of the selected dry/payload mass. It is deliberately presented as an absolute minimum: it excludes fuel mass, exhaust kinetic energy, inefficiency and deceleration.
- **2026-08-22 rebuild:** the page was rewritten from the accumulated four-script prototype into one state object, one renderer and one animation loop. Its compact topgrid, 238px desktop hero, three side-by-side controls and two-column results are intended to keep title/equation/animation/sliders/results within a 768px laptop viewport.
- The main hero is now a top-down radial view. “Zoom out” animates the view radius logarithmically from 40 AU through the heliopause, Oort Cloud and nearby-star scale while the target-speed position stays marked. Planetary orbits, heliopause and the Oort annulus use radial distances to scale; nearby-star directions are explicitly schematic. `prefers-reduced-motion` jumps to the final scale.
- **Animation direction revised:** the hero is now a wide, left-anchored flight view. It begins with the Sun at far left and Earth–Neptune spread schematically across the width with dotted orbit arcs. The rocket launches from Earth and passes the planets; after reaching roughly three-quarters width it stays fixed while the Sun remains anchored and the horizontal distance scale expands logarithmically to the selected endpoint. Heliopause (~120 AU), Voyager 1 (~173 AU in 2026), the Oort Cloud and nearby stars appear when their scale is reached.
- **Animation polish:** the opening frame contains only Sun, Earth and Mars, with Mars at three-quarters width. The rocket travels from Earth to Mars; zooming begins there, holding the rocket/Mars screen position while Jupiter through Neptune enter naturally from the right as the distance scale expands. The run time is 15 seconds. Planet orbits and bodies, heliopause, Voyager and the Oort Cloud use the approved `--s1`–`--s5` series palette. This animation is documented in `STYLE_GUIDE.md` as the preferred wide, anchored scale-reveal pattern.
- **Session closed:** the draft was functionally complete and passed JavaScript syntax, duplicate-ID, missing-element-reference and diff-whitespace checks. It was subsequently reviewed and promoted on 2026-08-23.

Working log for switching between Claude and Codex on this project. Update this file
whenever a design direction is decided, reversed, or left open — the goal is that either
tool can pick up mid-stream without re-reading the whole chat history.

## Site info

- **Published site:** [madeclear.ca](https://madeclear.ca), hosted on Cloudflare Pages.
  `hello@madeclear.ca` is the contact address referenced in every page's footer (see the
  Cloudflare Email Routing note below).
- Simon has seen `madeclear.ca` blocked by work-laptop IT policy (category/content
  filtering) with a "not a secure connection" warning — that's a corporate network/proxy
  issue on his end, not a site or Cloudflare cert problem; nothing to action here.

## Design guide settled: icons, palette, type and tone — 2026-08-22

Several open questions flagged in STYLE_GUIDE.md (icon weight/register/accent-usage, the
missing series-color palette, subtitle length, title formula, voice) were unresolved because
they're taste calls, not derivable from the code. Built
[`design-specimen.html`](design-specimen.html) — a single page in the site's own style
showing competing options side by side, coded (`I-R2`, `P-A`, `S-40`, etc.) so Simon could
reply with a short ballot instead of writing prose rulings. All decisions below are now in
**STYLE_GUIDE.md** and are **forward-only** — none of the 63 existing pages were swept to
conform, per Simon's explicit call.

- **Icons:** default register is object-in-diagram (a small drawn object sitting on the
  diagram it explains), line weight is a two-step ladder (2.2px subject / 1.3px context, no
  third value), accent color is used throughout the icon rather than reserved for one
  element. These are defaults to reach for per new icon, not a hard rule — deviate where a
  concept is cleanly a pure object or pure abstract diagram.
- **Most new icons will be produced with Codex going forward**, not Claude — if you're Claude
  picking this project back up, check whether the sprite in `index.html` already has an icon
  for a page before drawing one; don't duplicate work across tools.
- **Series palette (new):** a standing five-color set for pages with multiple
  fluids/planets/materials to distinguish, replacing "invent hexes per page." `--s1` is just
  `var(--accent)` — a single-series page needs no new color at all. `--s2`–`--s5` are defined
  with paired light/dark hexes the same way `--accent`/`--bad` are. See the "Series palette"
  entry under Design tokens in STYLE_GUIDE.md for the exact values.
- **Title/voice:** question-form titles by default (wry titles like "Why the straw gives up"
  are an allowed exception, not the default register); phenomenon names (Reynolds number,
  Snell's law) are fine in a title if the subtitle glosses them in plain terms; subtitle
  target is ~40 words / two sentences carrying a real number; voice is second-person
  imperative ("Drop a stone and start a timer"); units are metric-first with imperial in
  brackets, except objects natively sold/specified in imperial (pizza diameters in inches).
- **Spelling: Canadian**, formalized (metre, colour, centre, neighbour) — matches the `.ca`
  domain and most existing prose.
- **Bug caught and fixed while doing this:** `heat-pump-magic.html`'s `.more-body` still
  carried the exact `max-width:78ch` cap that an earlier STYLE_GUIDE entry already documented
  as wrong (the disclosure rendering visibly narrower than `.note` above it). Fixed the same
  way as that entry (`grid-template-columns:minmax(0,1fr)` + `.more-item{min-width:0}`, no
  cap) and verified with `getBoundingClientRect()` that `.note` and `.more-body` now match
  exactly. `basic-functions.html` and `thermal-comfort-pmv.html` were already correct — this
  is a recurring failure mode worth checking by measurement, not eyeballing, whenever a
  disclosure section is touched.

## Materials arrangement page — draft handover, 2026-08-21

- **`visualizations/materials-arrangement.html`** is a new, unreviewed teaching page about how
  atomic arrangement differs across material families. It is not yet catalogued in
  `unreviewed.html`, `index.html`, or `tracker.html`.
- The selector currently covers pure metals (copper, aluminium, titanium), alloys (brass,
  bronze, mild steel, cast iron, stainless steel, nichrome), a ceramic (alumina), a
  semiconductor (silicon), polymers (polyethylene, nylon, rubber), and soda-lime glass.
- The central display is intentionally schematic: it distinguishes representative atom types
  and arrangement families, but does **not** claim to render a full unit cell, exact alloy
  composition, polymer repeat unit, or glass chemistry. Every display now has a live colour
  key. Polymer chains explicitly show carbon-backbone and hydrogen atoms; nylon also marks
  nitrogen and oxygen; glass shows silicon and oxygen.
- A lower “Atoms in this material” panel draws neutral-atom electron-shell diagrams and lists
  atomic number plus shell populations for up to two representative elements. The page note
  explicitly warns that these are neutral atoms, not the bonding/charge states in a solid.
- JavaScript syntax checks passed after the last edit. Visual browser QA was not completed in
  the prior session because the local browser-control bridge failed; manually review the page
  at desktop and mobile widths before publishing.

## Cosmic scale page — reviewed and complete, 2026-08-22

- **`visualizations/cosmic-scale.html`** (“Closer to the smallest thing, or the biggest?”) is reviewed and complete. It now has selectable smallest/biggest endpoints, a log-scale position result, and a separate multiplicative scale-factor result.
- Moved from `unreviewed.html` to the reviewed-only catalogue in `index.html` under Fun physics. Reviewed count is now 15; unreviewed count is now 46.

## Basic functions page — reviewed and complete, 2026-08-21

- **`visualizations/basic-functions.html`** ("The curves behind most graphs") is page
  60, reviewed and listed under Everyday maths on `index.html` and in `tracker.html`. It was
  removed from `unreviewed.html`.
- One function is shown at a time: `sin(x)`, `cos(x)`, `tan(x)`, `e^x`, `ln(x)`, `log10(x)`,
  `x`, `x²`, `|x|`, `1/x`, or `√x`. An automatically moving input dot can be paused or
  dragged; the output readout, plot projections and gauge stay synchronized. Tangent and
  reciprocal asymptotes plus positive-only log domains are explicitly drawn rather than
  implying that the functions exist everywhere.
- Angles are radians. Curves are educational standard real-valued forms, not measured data;
  the output gauge is clipped to the visible plotting range for exponentials/tangent.
- **2026-08-21 follow-up:** page can now overlay a gold comparison function over the blue
  primary curve, using the same animated input. The primary function keeps the plot scale, so
  a comparison outside it is clipped instead of silently changing the reference scale. A
  visual log-scale section now contrasts the same four real sizes on linear and base-10-log
  rulers: hair (0.07 mm), a person (1.7 m), CN Tower (553 m) and Earth's diameter
  (12,742 km). The linear ruler visibly collapses the first three at the origin; the log
  ruler allocates equal width to each tenfold jump. It also states that zero/negative values
  cannot appear on a log axis.
- **2026-08-21 refinement:** alternating pale blue bands now mark every power-of-ten interval
  on the logarithmic ruler (`10^-1` through `10^10`), making the repeated scale jumps visible
  as areas, not only as spacing.
- **2026-08-21 layout:** the x input readout, animation control and slider now sit in the
  right-hand result column above the y output. Function and comparison selectors remain left.
- **2026-08-21 compact pass:** `basic-functions.html` now uses a 350px-high graph viewBox,
  tighter top/hero/result spacing, and a 50/50 controls/results split. X's slider sits left
  of its live number; the y headline is aligned opposite its label. Primary and comparison
  selectors now share the same grouped pill layout and active-state geometry. The general
  standard-laptop-height preference is recorded in `STYLE_GUIDE.md`.
- **2026-08-21 log section:** always visible (no disclosure), with full-width explanatory
  prose matching the page note. The prior narrow text came from this page's local
  `.more p{max-width:78ch}` rule; that cap is overridden and the full-width rule is now also
  explicit in `STYLE_GUIDE.md`.
- **2026-08-21 CSS-order correction:** the legacy 78ch component rule was later in the
  stylesheet than the first full-width override, so it won in the cascade. A final
  `.more p{max-width:none}` is now placed after all component defaults, and `STYLE_GUIDE.md`
  records the source-order requirement.
- **2026-08-21 comparison repair:** choosing None now clears the gold path data and explicitly
  hides both gold SVG elements. For sin/cos compared to tan/e^x, the graph and input range
  expand to −10…10; the gold path is clipped to the plotting rectangle and samples outside
  the primary y range are broken rather than drawn beyond the chart.
- **2026-08-21 function expansion:** linear `x`, quadratic `x²`, absolute value `|x|`,
  reciprocal `1/x` and square root `√x` were added. Reciprocal defaults to `x=1` to avoid an
  undefined starting input; its vertical asymptote is shown by the curve break.
- **Homepage icon:** Simon selected candidate 3 (three curve family). It is now active in
  `index.html`, using blue sine, gold linear and coral quadratic strokes. The four editable
  vector candidates remain in `Drafts/basic-functions-icon-options.svg`.
- **2026-08-21 icon/link polish:** function strokes in the selected homepage icon were
  reduced by 50%; its axes retain their original weight. Internal catalogue/page links stay
  in the same tab; external source links open a new tab with `rel="noopener"`. The convention
  is documented in `STYLE_GUIDE.md`.
- **Session closed, 2026-08-21:** basic-functions work is complete and reviewed. Commit
  `ac259b5` added the page, its reviewed catalogue/tracker status, icon options and style
  guidance; commit `50b318c` corrected link targets globally for the current HTML source
  links. Both are pushed to `main`. The next optional enhancement is adding more advanced
  functions (for example logistic, general power or step), but no follow-up work is pending.

## Fan laws page — new draft, 2026-08-20

- **`visualizations/fan-laws.html`** ("A little slower saves a lot of fan power") is new
  page 52 and is listed under Discoveries in `unreviewed.html` and `tracker.html`; it has
  not been reviewed and should not move to `index.html` yet.
- Scope is deliberately fixed-speed scaling for the same fan: one 30–120% speed control
  drives airflow `Q ∝ N`, pressure `Δp ∝ N²`, and ideal shaft power `P ∝ N³`. The default
  is the DOE's useful 80%-speed example (80% flow, 64% pressure, 51.2% power).
- The hero pairs a speed-responsive fan/airflow animation with the three affinity curves;
  the result column repeats the current values as three bars against the 100% reference.
- Assumptions are explicit: fixed diameter, density and efficiency; shaft power rather than
  exact electrical input; manufacturer curves remain authoritative for a real installation.
- Sources are the DOE variable-speed-drive tip sheet and ANSI/AMCA 210. No absolute CFM,
  pressure or motor-power baseline is invented; every output is relative to a known design
  point.

## Night-sky ice page — new draft, 2026-08-20

- **`visualizations/night-sky-ice.html`** ("How a desert night can make ice") is new page
  53 and is listed under Discoveries in `unreviewed.html` and `tracker.html`; it has not
  been reviewed and should not move to `index.html` yet.
- Historical attribution is deliberately Persian/Iranian, not Egyptian. The page links the
  open UCL/Pochee et al. yakhchāl study and uses its 100 mm pond depth, 11-hour night and
  0.7 sky-view factor as the model geometry.
- Three controls drive constant night air temperature (0–12°C), relative humidity (10–90%)
  and cloud cover (0–100%). Clear-sky emissivity is Brutsaert 1975,
  `εsky = 1.24(ea/Ta)^(1/7)` with vapour pressure in hPa; cloud cover linearly interpolates
  emissivity toward 1. Water temperature is integrated in 60-second steps, then latent heat
  is accumulated at 0°C and converted to ice thickness using 333.7 kJ/kg and 917 kg/m³.
- The default deliberately demonstrates the hook with above-freezing air: 4°C, 20% RH,
  clear sky → effective sky about −29.7°C, freezing begins after about 6.2 hours, and the
  simplified model produces about 3.6 mm of ice after 11 hours.
- Scope is explicitly radiation-first: fixed sheltered convection `h = 4 W/m²K` is included;
  evaporation and ground conduction are omitted. The page explains that the UCL detailed
  model found radiation dominant, evaporation cooling significant, and ground conduction a
  smaller heat gain, so this is not presented as a full historical reconstruction.

## Reynolds number page — new draft, 2026-08-20

- **`visualizations/reynolds-number.html`** ("When smooth flow breaks into turbulence") is
  new page 54, listed under Fun physics in `unreviewed.html` and `tracker.html`; it has not
  been reviewed and should not move to `index.html` yet.
- It is the regime-map companion to the two straw pages. Controls use flow rate and diameter,
  so the page evaluates `Re = 4ρQ/(πμD)` with the same representative water, air, milkshake
  and honey properties used locally. Pipe-flow guideposts are laminar below 2,300,
  transitional from 2,300–4,000, and turbulent above 4,000.
- The main hook uses water at 5 mL/s: a 3.0 mm straw gives Re ≈ 2,122, while a 1.5 mm straw
  gives Re ≈ 4,244. Halving diameter at fixed volumetric flow doubles Re because velocity
  rises by four while the characteristic diameter halves.
- The animated dye filament is deliberately qualitative, not CFD. Air presets use local
  density and viscosity only; compressible pressure-driven airflow remains the scope of
  `straw-hose-flow-darcy.html`.
- Sources are Reynolds' 1883 dye-filament experiment and NASA's official Reynolds-number
  explainer. States implying extreme mean speed are flagged rather than presented as normal
  pipe-flow examples.

## Well-depth page — reviewed and complete, 2026-08-22

- **`visualizations/well-depth.html`** ("How deep is the well?") is page 55, reviewed and
  listed under Fun physics on `index.html` and in `tracker.html`; it was removed from
  `unreviewed.html`.
- It solves the stopwatch delay as two journeys: `t = √(2h/g) + h/c`, with total delay
  and air temperature as controls. It uses `g = 9.81 m/s²` and
  `c = 331.3 + 0.606T m/s`.
- The default 4.0 s wait at 15°C gives about 70.6 m: 3.79 s falling and 0.21 s for sound
  to return. Using all four seconds as fall time would give 78.5 m, 7.92 m too deep.
- The hero animates the accelerating stone followed by the returning sound. A right-side
  phase indicator highlights `√(2h/g)` during the fall, then `h/c` during the sound return;
  the completed fall term stays visible but subdued. Sound is consistently gold in the
  returning wave, `h/c` term and timeline segment. The lower section is an even 50/50 split:
  two stacked sliders on the left, and results on the right; the result itself splits between
  the current depth/timeline and the solved form
  `h = (√(c² + 2gct) − c)²/(2g)`. The naive-result comparison remains exact.
- Scope is explicit: vacuum free fall and constant gravity; stone drag, echoes, reaction
  time, wind and humidity are omitted. Deep/light-stone cases can overestimate real depth.

## Dew-point window page — new draft, 2026-08-20

- **`visualizations/dew-point-window.html`** ("Why this window is fogging up") is page 56,
  under Discoveries in `unreviewed.html` and `tracker.html`; it is unreviewed.
- Uses the Magnus approximation over liquid water with indoor air temperature, relative
  humidity and inside glass temperature. Condensation appears when the glass is at or below
  the calculated dew point; fog/droplets are qualitative.

## Backlog — pitched ideas not yet built (added 2026-08-19)

Four ideas Simon pitched for future pages; none started as of this entry except the heat
pump page, begun the same day (see the handoff entry below).

**Six more pitched 2026-08-19** (a follow-up conversation with a colleague about the heat
pump page), none started:
- **Reynolds number.** Built as page 54 on 2026-08-20; see the handoff entry above.
- **Piping visuals (flow, head).** Head loss / pump curves — likely overlaps mechanically
  with the Reynolds-number page and the existing Darcy–Weisbach work in
  `straw-hose-flow-darcy.html`; worth scoping together rather than as three separate pages.
- **Hot-shower wait-time animation.** How long you wait for hot water at the tap, and why
  it's longer than "just the pipe volume ÷ flow rate" suggests once pipe friction/losses are
  modeled honestly — same friction machinery as the piping/Reynolds ideas above.
- **Dew point on a window, with selectors.** Indoor temp/humidity vs. window surface
  temperature (a proxy for outdoor temp/insulation) — condensation appears once the window
  surface drops below the dew point. Room for a genuinely satisfying visual (fogging glass).
- **Absolute/relative humidity and windchill/humidex animations.** Two related but distinct
  psychrometric concepts; could be one page with a mode toggle or two short pages.
- **ASHRAE 55 occupant thermal comfort.** The most involved idea pitched: a room-box diagram
  where the user repositions a person inside it and sets wall/ceiling/floor/outdoor
  temperatures, evaluated against the ASHRAE 55 comfort model (mean radiant temperature,
  operative temperature, PMV/PPD). Needs real research into the standard's actual formulas
  before scoping — flagged as the most ambitious of the six, likely deserves its own design
  pass rather than starting straight into `<canvas>`/SVG.

- **Heat pump "science, not magic."** How a heat pump delivers >100% "efficiency" (COP > 1)
  without breaking energy conservation — it moves heat from the outside atmosphere in
  addition to converting the electricity it uses, so the delivered heat is electricity-in
  plus free ambient heat, not electricity alone.
- **Fun unit converter.** Convert an energy quantity (J, kWh, etc.) into relatable everyday
  equivalents — e.g. "how many hamsters running in a wheel for 15 minutes." Needs a page
  format decision (single equation + slider doesn't obviously fit a converter with many
  target units — may want a picker of "convert to" categories instead).
- **E=mc² page addition.** Add energy-released-per-fuel-type comparisons (uranium fission,
  petroleum, natural gas, ...) to the existing mass-energy page rather than a new page —
  check `mass-energy.html` (or its current filename in `visualizations/`) for whether this
  fits as a second section, per the "second section extends the skeleton" pattern used on
  `starlight-spectrum.html`/`time-dilation.html`.
- **"It IS Rocket Science" page — built, 2026-08-19**, as a new file:
  `visualizations/escaping-a-planet.html`. Superseded a same-day plan to reframe the existing
  `escape-velocity.html` in place (that reframe was tried, then reverted via `git checkout`
  once the scope grew into something that needed its own page — `escape-velocity.html` is
  back to its original "Why the Moon lost its atmosphere" content, untouched).
  - **Two-phase physics, not just v<sub>esc</sub>.** Phase 1 (powered ascent) numerically
    integrates `a = F/m − GM/r²` as fuel drains (`m0=dry+fuel`, `mdot=F/vₑ`,
    `burnTime=fuel/mdot`) over 2,000 fixed steps — that step count matters: an earlier 140-step
    version under-shot cutoff velocity by ~2% (verified by hand in Python against a
    fine-step reference), bumped to 2,000 once the discrepancy was caught, which the
    JS integrator now matches within noise at every step count tested. A rocket whose thrust
    doesn't exceed its own weight at liftoff (`F ≤ m0·GM/r²`) never leaves the pad at all —
    a real, distinct outcome state, not just a low number. Phase 2 (coast) needs no simulation:
    specific energy `ε = ½v² − GM/r` is conserved after engine cutoff, so escape (`ε≥0`) or
    the exact apex altitude (`r_apex = −GM/ε`) both fall out algebraically from the cutoff
    state alone.
  - **Energy-budget bar is the literal KE/PE animation Simon asked for**, replacing the usual
    single-value gauge. Derived identity: normalizing by the surface potential-well depth
    `GM/r₀` (equivalently `v_esc₀²/2`) splits the escape condition into two independent
    fractions that sum cleanly — `f_height = 1 − r₀/r` (pure function of altitude) and
    `f_speed = v²/v_esc₀²` (pure function of speed) — with escape at `f_height+f_speed ≥ 1`.
    Verified by hand that this decomposition is algebraically identical to the `ε≥0` condition
    before building the stacked-bar UI on top of it. The bar animates live during both the
    launch button's powered-ascent phase (real per-step values from the integration) and its
    coast phase (stylized on-screen climb rate, but `v` at each displayed point is still solved
    exactly from energy conservation at that point's `r`, so the bar never drifts from the true
    physics even though the pacing is illustrative — same "honest device" pattern
    `escape-velocity.html` already used for its apex-height animation).
  - **Five independent controls** (planet picker; rocket dry mass and thrust as separate log
    sliders per Simon's explicit request, not bundled into one rocket-size preset; a fuel-type
    picker; fuel mass) plus five presets spanning all three outcome states: Saturn V 1st stage
    and Falcon 9 single-stage (both fall back — realistic, since this page's single-stage
    simplification is exactly why real rockets stage), Apollo LM ascent stage from the Moon
    (falls back in this vertical-only model even though the real vehicle reached lunar orbit —
    called out explicitly in the note as a limitation of ignoring sideways/orbital motion), an
    oversized hypothetical rocket from Earth (escapes, labeled as beyond any rocket actually
    built), and an ion-thrust attempt from Earth (never lifts off — thrust-to-weight 0.34,
    demonstrating that ion engines' huge exhaust velocity is irrelevant without enough thrust,
    a direct callback to `rocket-equation.html`'s own ion-drive caveat). Fuel exhaust
    velocities (solid/kerolox/hydrolox/ion) are the same numbers as `rocket-equation.html` for
    cross-page consistency. The closing note cross-links to `rocket-equation.html`.
  - Verified in-browser: all five presets checked programmatically against the outcome they're
    meant to demonstrate (escape/fall-back/never-lifts-off), no console errors, no horizontal
    overflow at desktop (1280px) or mobile (375px) widths, launch-button animation runs start
    to finish and resets cleanly, theme toggle works. No visual screenshot was possible this
    session (Browser pane compositing unavailable), so layout was checked via
    `getBoundingClientRect()` label-collision/overflow queries instead, consistent with this
    project's established fallback for that tooling gap. **Not yet reviewed** — first-pass
    build, not added to `index.html`'s reviewed grid yet.
  - **Follow-up pass, same day: three fixes shipped, then a design conversation paused
    mid-stream — Simon is picking this back up "a different day."**
    - **Shipped and live in the file:** (1) thrust was on a slider but never appeared in the
      equations — added a third equation line, `a = F/m − GM/r²` (the literal acceleration
      being integrated), with `F` wired into the existing hover-highlight system alongside the
      thrust slider, plus new legend rows for `F` and rocket mass (wet→dry). (2) Added an
      opening note sentence making explicit that `v_esc` only ever applies to an *unpowered*
      object, and that the verdict here only compares speed to it from engine cutoff onward —
      during the burn the rocket isn't racing that number, thrust is fighting gravity directly.
      (3) Added a closing note paragraph fact-checking the page against Artemis II (the
      current-day most-recent Artemis mission, launched April 2026 — not Artemis I, which an
      earlier draft would have defaulted to): SLS core stage MECO ≈161 km altitude / ≈7.6 km/s,
      and the separate trans-lunar-injection burn (Artemis I's published figures, same mission
      architecture) raised Orion from ≈7.8 to ≈10.1 km/s — genuinely *below* Earth's
      11.19 km/s escape velocity, which is the correct real-world result: reaching the Moon is
      a lower-energy three-body problem (timed to meet the Moon), not literal two-body Earth
      escape, and the note says so explicitly rather than leaving the "shortfall" looking like
      a page error. All three verified in-browser (legend/equation render correctly, no console
      errors). Sources: [NASASpaceFlight, Artemis I launch](https://www.nasaspaceflight.com/2022/11/artemis-i-launch-nov/),
      [AVweb, Artemis II core stage](https://avweb.com/aviation-news/space-flight/boeing-built-core-stage-powers-historic-artemis-ii-launch/),
      [Space.com, Artemis I TLI burn](https://www.space.com/artemis-1-orion-spacecraft-headed-for-moon).
    - **Open, unresolved design question — no code changed for this part.** Simon felt the
      thrust slider made the page too complicated and proposed dropping it, replacing it with a
      direct **altitude-cutoff** input (assume all fuel is spent by a chosen altitude) alongside
      planet/fuel-type/masses. Worked through two variants in conversation, neither implemented:
      1. **Drop thrust, accept an idealized instantaneous-kick-at-cutoff-altitude model.**
         `Δv = vₑ·ln(m₀/mf)` (unchanged) is delivered entirely at the user-chosen cutoff
         altitude, as if the rocket coasted there for free and only "pays" in speed once it
         arrives — the same idealization the classic `v_esc` formula already makes, just moved
         up from the surface. This removes gravity-loss modeling entirely (more optimistic than
         reality) and removes the "never leaves the pad" outcome (no thrust-vs-weight check
         left to make it possible). Clean, closed-form, no numerical integration needed at all.
      2. **Infer thrust from the other four parameters instead of dropping it**, i.e. solve
         `F` such that the existing powered-ascent integration lands exactly on the chosen
         cutoff altitude. Checked numerically in Python before ruling it out as the default
         plan: altitude-vs-thrust is **not monotonic** for a fixed rocket/fuel/planet — it rises
         slightly just above the liftoff threshold, peaks (≈309 km for the Saturn-V-scale test
         case, around TWR≈1.1–1.2), then falls as thrust increases further, asymptoting toward
         0 km as F→∞. Consequences: every rocket has a **hard ceiling on reachable cutoff
         altitude** that no amount of thrust can exceed (a chosen altitude above that ceiling
         has zero solutions), and altitudes near the ceiling have **two** valid thrust values
         (different burn profiles reaching the same altitude with different cutoff velocities,
         needing an arbitrary tie-break — probably always the higher-thrust root). That ceiling
         would have to be computed and the slider's range clamped dynamically per
         planet/fuel/mass combination just to keep the UI honest — comparable numerical
         complexity to keeping thrust as a direct input, while being less legible to the user
         (a slider that mysteriously stops responding past an invisible, ever-shifting limit).
         Recommended against this option for that reason; leaned back toward variant 1.
      - Also discussed, not yet acted on: Simon's observation that fuel *mass* alone doesn't
        represent a fuel's energy capacity. Clarified that `Δv = vₑ·ln(m₀/mf)` is a pure
        momentum-conservation result, not an energy equation — it doesn't know or care how
        energetic the propellant is chemically. `m_fuel` only supplies leverage (mass ratio);
        the propellant's actual energy content is folded entirely into `vₑ` (measured per
        real engine/fuel combination, not derivable from energy density alone, since some
        chemical energy is lost to heat/incomplete expansion rather than becoming directed
        exhaust speed). No page change implied by this — it was context for evaluating variant
        1 above, confirming that dropping thrust doesn't lose any *energy* information the page
        was actually modeling, since it never modeled fuel energy density in the first place.
    - **Next session should start here**: decide between variant 1 (recommended — simpler,
      closed-form, drops the "never lifts off" state) and keeping thrust as currently built: no
      code has changed since the three shipped fixes above. If variant 1 is chosen, the thrust
      slider, its legend/equation rows, the `F/m − GM/r²` powered-ascent integration, and the
      "never lifts off" outcome branch all get replaced by a single altitude-cutoff slider and
      the closed-form `v_cutoff = Δv` substitution described above — a substantial rewrite of
      `simulate()`, not a small edit, since the two-phase (numeric burn + exact coast)
      structure collapses into one exact calculation throughout.

**Three more pitched 2026-08-20** (Simon, noted for action later; none started):
- **Index page as a tile grid — built 2026-08-20** (see the handoff entry below; the
  "most visited" row is the one part deliberately deferred). Original pitch: rework
  `index.html` from its current list/card layout into
  a denser tile grid — about **5 tiles per row** — with a **Featured 5** row at the top and a
  **Most visited 5** row beneath it. **Remove the per-card numbering.** Add a **randomizer**
  control that re-shuffles the tile order on click. **Category becomes tile colour** rather
  than a separate label/grouping heading. Open questions to settle when building: where
  "most visited" data comes from (no analytics in this repo by constraint — likely a
  hand-maintained list, or `localStorage` visit counts on the client), and how the existing
  three category groupings (Everyday maths / Discoveries / Fun physics) survive if colour is
  doing the categorising.
- **`time-dilation.html` light clock — animate the moving clock's mirrors — built 2026-08-20.** In the light-clock
  derivation diagram, the two horizontal bars (mirrors) of the *moving* clock should visibly
  travel left to right as the light bounces, so the diagonal path reads as a consequence of
  the clock's motion rather than a static drawing.
- **`microwave-chocolate.html` — other frequencies — built 2026-08-20.** Add non-microwave-oven frequencies
  (Wi-Fi 2.4 GHz, and at least one other band) alongside the oven's 2.45 GHz, each with the
  caveat framing: *"if you could melt chocolate with your Wi-Fi, this would be the melt-spot
  spacing."* The half-wavelength melt-spot measurement is the same calculation; only the
  frequency changes, so this is most likely a selector on the existing figure rather than a
  new page.

## Current handoff — 2026-08-20

- **`visualizations/thermal-comfort-pmv.html` eighth follow-up pass: fixed the actual
  complaint from the previous pass, which was not the overflow bug.** Simon's "fix the width
  thing" after the overflow fix turned out to mean something entirely different: the
  methodology disclosure's text was visibly narrower than the `.note` paragraph directly
  above it (about two-thirds of the page's content width), not that it overflowed. Root
  cause: `.more-body{max-width:82ch}`, added on the unstated assumption that dense
  equation-heavy prose wanted a narrower reading measure — but `.note` itself carries no such
  cap, since this site's body copy spans the full `.wrap` width by established convention
  (same principle as the pre-existing "second section's `.sub` should use the full column
  width" and "index/about body text spans the full `.wrap`" rules already in
  [STYLE_GUIDE.md](STYLE_GUIDE.md#component-patterns)). Fixed by dropping the `max-width`
  entirely; verified with `getBoundingClientRect()` on both elements rather than eyeballing —
  `.more-body` now matches `.note`'s `width` and `left` to the pixel (869/38 at desktop),
  still no horizontal overflow at either 375px or desktop width after removing the cap.
  Documented in STYLE_GUIDE.md right alongside the overflow-gotcha entry from the previous
  pass, so both real bugs from this one disclosure section are recorded together.
  **Lesson for next time: when a user says "fix the width thing" right after a width fix
  just shipped, don't assume it's the same bug re-surfacing — confirm what they're actually
  looking at first.** This pass's fix required no back-and-forth only because the user's
  second message was specific enough ("wrapping at around 2/3 of the content width... should
  take the same width as the text above") to identify the real cause directly.

- **`visualizations/thermal-comfort-pmv.html` seventh follow-up pass: fixed the mobile
  overflow flagged (not yet confirmed) at the end of the previous pass — confirmed real,
  root-caused, and fixed.** With the Browser pane compositing again, `document.documentElement.
  scrollWidth` measured 754px in a 375px viewport with the methodology disclosure open. Root
  cause: the block-equation spans (`.eq{white-space:nowrap;overflow-x:auto}`) sit inside
  `.more-body{display:grid}`; a CSS Grid item defaults to `min-width:auto`, so the item
  wrapping each equation (`.more-item`) was sizing its grid *track* to the equation's full
  unwrapped content width instead of respecting the container — `overflow-x:auto` on the
  equation itself never got a chance to trigger, because its ancestor never shrank down to the
  viewport width in the first place. Fixed with `.more-body{grid-template-columns:minmax(0,
  1fr)}` plus `.more-item{min-width:0}` (and `max-width:100%;box-sizing:border-box` on `.eq`
  itself for good measure). Documented as a general gotcha in
  [STYLE_GUIDE.md](STYLE_GUIDE.md#component-patterns) under the "Collapsible 'More details'
  disclosure" entry, since any future page reusing this pattern with a dense equation block
  would hit the identical bug. **Also hit and worked around a same-session tooling quirk while
  verifying this**: `resize_window` without an explicit `tabId` silently no-ops on a
  `navigate`-opened tab (confirmed via `window.innerWidth` staying at the old size after the
  call reported success) — always pass `tabId` explicitly when more than one tab might exist.
  Verified after the fix: `scrollWidth === clientWidth` (375 = 375) at mobile width and (946 =
  946) at desktop with the disclosure open, the wide equations now scroll *inside* their own
  343px-wide box instead of expanding the page (confirmed via each `.eq`'s own
  `scrollWidth`/`clientWidth`), a real screenshot at 375px confirms the equation box visually
  clips at the page edge with its content scrollable rather than overflowing, no console
  errors, `pmvValue` still computes correctly (confirms the CSS-only fix didn't touch
  anything script-facing).

- **`visualizations/thermal-comfort-pmv.html` sixth follow-up pass: added a full
  "Methodology, equations and sources" disclosure**, at Simon's request for a detailed
  step-by-step writeup with every equation, assumption, source and numerical value used —
  page-specific, not a new site-wide pattern. Reused the `<details class="more">` /
  `.more-body` / `.more-item` disclosure CSS verbatim from `heat-pump-magic.html` (the
  site's first use of this pattern), adding one new `.eq` block-equation style (monospace,
  `var(--line)` background, horizontal-scrolling) since this page's formula set is far
  denser than that page's three prose paragraphs.
  - **15 items, written directly from the live source** (re-grepped every constant —
    `H_SI_VERTICAL=8.29`, `H_SI_HORIZ_UP=9.26`, `H_SI_HORIZ_DOWN=6.13`, `R_SO=0.03`,
    `IMPERIAL_R_TO_RSI=5.678263`, `ALIGN_FALLOFF=0.4`, `CONTOUR_N=22`, the full `pmvPpd()`
    term-by-term — rather than reconstructing from memory of earlier passes) so the writeup
    can't silently drift from what the code actually computes: overview, fixed assumptions,
    then one step each for wall/roof conduction, window U-value, the three ASHRAE film
    coefficients (with the direction each applies to), mean radiant temperature's
    angle-factor formula, the window-alignment falloff, operative temperature, the full
    Fanger/ISO 7730 PMV iteration (p_a, f_cl, the t_cl/h_c fixed-point loop, all five heat-loss
    terms, the final PMV expression), PPD, heat-loss share, the three local-discomfort
    thresholds, then separate items for the comfort-map/marching-squares methodology, the
    clo/met reference tables, and a consolidated source list.
  - **Sources cited by name with links**: ISO 7730/ASHRAE 55 for the PMV model itself (plus
    the CBE Thermal Comfort Tool's public documentation of the same reference algorithm),
    the two ASHRAE Fundamentals Handbook editions already sourced in an earlier pass for the
    film-coefficient table, ISO 6946 for the conduction formula's shape, the existing
    clothing/metabolic Wikipedia citations, and Wikipedia's marching-squares article for the
    contour-tracing algorithm. A closing paragraph explicitly states what is *not* from a
    cited source — the angle-factor distance formula, the window-alignment falloff, the
    fixed 10×10 m room and nominal wall areas — rather than letting those blend in with the
    cited figures.
  - Verified: no console errors on load; `pmvValue` still computes correctly after the
    insertion (confirms the new markup didn't break the script); exactly one `<details>`
    element with all 15 `.more-item` children present with the intended headings, 13 `.eq`
    blocks rendered, and the section confirmed positioned before the feedback section via
    `compareDocumentPosition` — all DOM-structural checks, since the Browser pane's
    compositing was unavailable for the entire second half of this session
    (`window.innerWidth` itself returned 0 even after a fresh tab), so no pixel-level/visual
    overflow check was possible this pass. **Flagged here explicitly so the next session
    re-checks this section's layout (especially the `.eq` blocks' `overflow-x:auto` at
    375px) visually once compositing is available again — not yet confirmed.**

- **`visualizations/thermal-comfort-pmv.html` fifth follow-up pass: windows now have a
  position along their wall, draggable directly in the diagram, and that position actually
  changes the physics** — at Simon's observation that windows were "not really defined,"
  always centered, with size but no location. Each `state.walls[k]` gained a `pos` field
  (0–1 along the wall, default 0.5/centered).
  - **Standing in front of a window now matters more than standing to its side.**
    Previously a window's share of its wall's angle factor was `raw × glazing` regardless of
    where the person stood along the wall — physically wrong, since a person off to one side
    shouldn't get full window exposure. `angleFactors()` now multiplies that by an
    `alignment` term (`ALIGN_FALLOFF = 0.4`): full exposure directly in front, fading
    linearly to zero (pure opaque wall) by 4 m of lateral offset. Verified the direction is
    right, not just present: with the window pinned to the east end of the north wall,
    standing at that end read PMV −0.50 versus −0.36 at the same wall-distance but the far
    (west) corner — colder when aligned with the window, as it should be.
  - **The window rect in the diagram is directly draggable** (`bindPointerDrag`-style
    pointerdown/move/up on `bandWindow[k]`, plus arrow-key support since it's a real
    `role="slider"` element now) — grabbing it and sliding it along its wall updates
    `state.walls[k].pos` live, same mechanism as the person control. Verified the pointer
    math itself (not just that *something* moved) by dragging from the wall's east edge to
    near its west edge and confirming `aria-valuetext` read exactly "100%" before and "0%"
    after. A matching mini-slider ("… window position") was added to each wall card for
    non-diagram control, shown/hidden alongside the R-value and window-size sliders whenever
    that wall is Exterior.
  - **Real bug caught during verification, not cosmetic: every preset click was silently
    corrupting the whole page to PMV `NaN`.** The preset-click handler explicitly
    reconstructs each wall's object from the preset data (`{type, temp, R, glazing}`) rather
    than copying it wholesale — a pattern already in place before this pass, but it now
    needed a 5th field and didn't get one, so every wall's `pos` became `undefined` the
    instant any preset was clicked, which cascades through `angleFactors()`'s
    `Math.abs(along−pos)` into `NaN` for every subsequent computation. Caught by checking the
    live `pmvValue` text after a preset click rather than trusting the UI looked fine — the
    wall temperature labels still rendered correct numbers (they don't depend on `pos`),
    which would have made this easy to miss on a visual pass alone. Fixed by defaulting to
    0.5 when a preset doesn't specify `pos` explicitly, and re-verified all five presets
    (`cozy/window/attic/corner/fan`) return real numbers, not `NaN`.
  - Verified in-browser: no horizontal overflow at 375px with the corner preset (both
    exterior walls now showing four sliders each), no console errors on a genuinely fresh
    tab (distinguished from the console tool's accumulated history across
    navigations — confirmed via a fresh tab that early errors were test artifacts from a
    transient viewport-compositing gap, not real page bugs), keyboard and pointer drag both
    functional on the window control. **Not yet reviewed.**

- **`visualizations/thermal-comfort-pmv.html` fourth follow-up pass, corrected mid-stream:
  a PPD comfort-map overlay, not an isometric view.** Simon's request ("a toggle to change
  from the person dragging to an isometric view") was first built literally as a 3D
  cutaway room (see git history for that version) — he then clarified he'd actually meant
  "lines of equal PPD value, like a topographic map." The isometric code (two SVG groups,
  a dimetric projection, its own invertible drag math) was fully removed rather than kept
  alongside the correct feature, since keeping a mode nobody asked for is exactly the kind
  of scope creep this project's own conventions warn against. One piece survived the
  rewrite: `meanRadiantTemp()` was refactored to take `(x, y, wallSurf, ceil)` instead of
  reading `state.personX/Y` directly — needed for the contour grid below, and a strictly
  cleaner signature regardless.
  - **The comfort map re-evaluates the entire PMV/PPD model at 23×23 grid points** across
    the room (`ppdGrid()`), holding every control fixed except position, then traces lines
    of equal PPD through that scalar field with a standard **marching-squares** algorithm
    (`marchingSquares()`, the full 16-case edge table, saddle cases 5/10 resolved with a
    fixed diagonal — a known, accepted simplification of basic marching squares). ~530
    PMV/PPD evaluations per redraw is trivial (each one converges in a handful of
    iterations), so it recomputes live on every slider move with no perceptible lag.
  - **Contour levels are auto-scaled to the room's actual PPD range** (`contourLevels()` /
    `niceStep()`), the same "pick ~5 nice round numbers spanning the data" logic a real
    topographic map's legend uses, rather than fixed 10%-apart bands that would either
    clutter a small room or show nothing in a large-range one. The ASHRAE 55 10% line is
    always added if it falls inside the range, drawn solid and bolder in `--bad` while
    every other level is a thin dashed `--muted2` line — the one line the standard actually
    cares about gets to look different from the rest.
  - **A uniform room shows an explicit note instead of an empty diagram.** The first version
    only drew contours when the grid's range exceeded a whole percentage point, so the
    default "well-insulated office" preset — real PPD range 6.7–6.9% — showed nothing when
    toggled on, which reads as broken rather than "this room is uniform." Fixed two ways:
    lowered the no-draw threshold to 0.05 points (so `niceStep` finds fractional levels like
    6.6/6.7/6.8/6.9% instead of bailing out), and added a fallback "Too uniform to contour
    (PPD x–y% everywhere)" message for the rare case that's still too flat to show anything.
  - Verified in-browser: the "cold corner office" preset draws five concentric rings
    (7.5–9.5%) radiating from the cold corner exactly as expected — label screen positions
    checked to confirm they step outward from the corner in order, not just that five paths
    exist. The "desk pushed against the window" preset confirmed the ASHRAE 10% line renders
    distinctly (solid, `stroke-width:1.75`, `--bad`) when the range actually spans it. No
    horizontal overflow at 375px in the corner preset, no console errors, default preset no
    longer shows a dead toggle. **Not yet reviewed.**

- **`visualizations/thermal-comfort-pmv.html` third follow-up pass: real 10×10 m room
  dimensions, and corrected direction-dependent interior film coefficients**, after Simon
  asked two precise questions about the physics: whether the walls had real dimensions (they
  didn't — dragging the person was purely a 0–1 fraction with no physical meaning), and what
  coefficient converted U/ΔT into the interior window surface temperature.
  - **Room is now a fixed 10×10 m footprint with a 2.4 m ceiling** (`ROOM_SIZE`,
    `WALL_HEIGHT` constants, not exposed as sliders — kept fixed so dragging the person means
    something concrete rather than adding a room-size control nobody asked for). The old
    placeholder `A_SEG = 7 m²` heat-loss-share constant is gone; `heatLossShare()` now uses
    each wall's real `ROOM_SIZE×WALL_HEIGHT` face area and the roof's real
    `ROOM_SIZE×ROOM_SIZE` footprint. Added a third info line in the diagram and to the
    person control's `aria-valuetext` reporting the person's distance from the west and
    north walls in actual metres, plus a caption above the hero stating the room dimensions.
  - **Interior film coefficients were wrong before this pass** — a single `R_SI = 0.12
    m²·K/W` was applied to every surface (walls, windows, *and* the roof), flagged as a
    known simplification in the previous entry below. Simon's colleague (from a Robert Bean
    training) sent three h<sub>si</sub> values; cross-checked against the actual ASHRAE
    Fundamentals Table 1 (2001 Handbook, non-reflective ε=0.90 surfaces) via web search
    before trusting either source blind. Found the colleague's "Vertical" value (9.09
    W/m²K) is actually ASHRAE's *45°-slope, upward* row — the standard's own vertical/
    horizontal-flow value is 8.29 W/m²K, and 9.09/8.29 look shifted by one row relative to
    the published 5-row table. Presented this discrepancy to Simon with sources rather than
    silently picking one; he chose the standard ASHRAE table. Implemented as three
    constants — `H_SI_VERTICAL=8.29` (walls, windows), `H_SI_HORIZ_UP=9.26` (roof/ceiling,
    indoor warmer than outdoor — heat escaping upward, the normal winter case),
    `H_SI_HORIZ_DOWN=6.13` (roof/ceiling, outdoor warmer — heat arriving downward, e.g. a
    hot attic in summer) — with the roof calculation now picking between the last two based
    on the live sign of `ta - tOut` each render, not a fixed assumption. `conductedSurface()`
    gained an `rSi` parameter so the same function serves all three cases correctly instead
    of hard-coding one resistance.
    Sources: [ASHRAE HVAC 2001 Fundamentals, Ch. 25](https://sovathrothsama.files.wordpress.com/2016/03/ashrae-hvac-2001-fundamentals-handbook.pdf),
    [1997 Fundamentals Ch. 24 (same table)](https://www.tagengineering.ca/wp-content/uploads/2015/01/1997-Fundamentals_24-.pdf).
  - Verified in-browser: hand-recomputed the cozy preset with the new 8.29 coefficient
    (R<sub>si</sub>=1/8.29=0.1206 vs. the old 0.12 — barely different, since the old
    hand-picked value happened to be very close to the correct vertical-surface figure) —
    page showed wall 20.9°C / window 15.1°C, matching by hand to the tenth of a degree.
    Confirmed the person-position readout via a keyboard Home-key reset (deterministically
    5.0 m / 5.0 m, the room's exact center) after an earlier reading showed a stray
    non-default value that turned out to be a browser-automation artifact from a prior
    test's leftover pointer state, not a code defect — traced by grepping every
    `personX`/`personY` assignment in the file and confirming none fire outside actual
    drag/keyboard/preset event handlers. Both themes, mobile (375px, including the
    three-line info block and longer "ext ... · win ..." labels in the worst-case corner
    preset — no overlaps, no horizontal overflow), no console errors. **Not yet reviewed.**

- **`visualizations/thermal-comfort-pmv.html` second follow-up pass: rebuilt as a top-down
  floor plan with four independently-configurable walls, plus a roof option for the
  ceiling**, at Simon's explicit request ("the ceiling could be the roof... a top view... 4
  walls, that we could select interior or R value + window for"). This superseded the single
  side-cross-section wall/window from the prior pass — see that entry immediately below for
  the conduction formulas, which carried over unchanged, just applied per-surface now.
  - **Room-box state reshaped**: `state.walls` is now `{N,E,S,W}`, each `{type:
    'interior'|'exterior', temp, R, glazing}` — interior walls keep a direct temperature
    slider (as the old single interior wall did); exterior walls get an R-value slider and
    a window-size (glazing %) slider, sharing one global window U-value rather than a
    per-wall one (kept to one shared slider deliberately, to avoid the control count
    exploding to 4 walls × 3 window sliders). Ceiling gained the same `type` split
    (`ceilType: 'interior'|'roof'`) — Roof mode reuses the identical
    `conductedSurface()` steady-state formula the walls use, just with its own R-value
    slider (10–60, vs walls' 2–50, since attics commonly run much higher R).
  - **Angle-factor MRT model generalized to 4 walls**: `angleFactors(x,y,wallSurf)` computes
    a raw view-factor per wall from the person's 2D position (`dist = {N:y, S:1-y, W:x,
    E:1-x}`, same `0.06+0.16*(1-dist)` shape as the old 1D model), splits each exterior
    wall's factor into window/opaque by its own glazing fraction, then normalizes the whole
    set (4 walls × up to 2 each, plus ceiling, plus floor) to sum to 1 — replacing the old
    single-window-wall-vs-interior-wall split. This is what makes a corner position with two
    exterior walls pull t<sub>r</sub> down from two directions at once, verified live: the
    new "cold corner office" preset (N and W both exterior, person at x=0.12,y=0.12) fires
    **two simultaneous** radiant-asymmetry flags while PMV alone still reads "meets ASHRAE
    55" (−0.47, 9.6% PPD) — exactly the gap between the single-number verdict and the
    room-box's spatial detail that motivated building this as a diagram instead of a
    calculator.
  - **Heat-loss-share and coldest-surface readouts generalized to aggregate across every
    exterior wall (and the roof, if active)**, not just one window wall: `heatLossShare()`
    sums window vs. opaque flux across all exterior walls using the same illustrative 7 m²
    per-surface assumption as the prior pass, and `coldestSurface()` scans all wall
    opaque/window temps plus ceiling/roof and floor to report whichever is actually coldest
    by name (verified: attic preset correctly reports "N window" as coldest even with a
    poorly-insulated roof active, since the window still ran colder in that configuration).
  - **Hero diagram rebuilt from a side elevation to a top-down plan**, north at top: room
    interior plus four wall bands built as SVG rects via `wallBandGeom()`/`windowBandGeom()`
    (window rect inset and centered along whichever wall has `glazing>0`, sized
    proportionally to that wall's own length), 8 possible radiant-ray lines (opaque +
    window per wall, hidden via `opacity:0` when a wall has no window) fanning from a
    draggable person to per-wall target points via `wallRayTargets()`. All SVG elements are
    built once via `createElementNS` in a setup pass (not static markup) since the
    4-wall/8-ray/window-rect structure repeats too regularly to hand-write four times over.
  - **Person drag is now 2D** (`personX`,`personY` both 0–1), using the SVG's
    `getBoundingClientRect()` scaled by both viewBox axes independently (`preserveAspectRatio:
    none` means x/y scale factors can differ) — arrow keys map naturally to
    left/right/up/down instead of the old single-axis left/right only, `Home` recenters
    both axes to 0.5 since a 2D control has no obvious single "home" edge.
  - **Wall labels condensed to one line each** (`N ext 20.3°C · win 10.5°C` / `E int
    21.0°C`) after deciding mid-build that stacking a separate wall-temp label and
    window-temp label per wall (as the old page did for its one window wall) would risk
    collision four times over instead of once — verified the single-line format never
    overflows the viewport at 375px even in the corner preset (two walls, both with the
    longest possible "ext ... · win ..." text), via `getBoundingClientRect()` checks on
    every label.
  - **New presets showcasing what a single exterior wall couldn't**: "a top-floor bedroom
    under an old roof" (`ceilType:'roof'`, R-20 roof, reclining/low-met — verified PMV
    reaches −1.97 "Cool", driven jointly by the roof and the low metabolic rate, a
    deliberately atmospheric combination) and "a cold corner office" (described above).
    Kept "a well-insulated office" and "a desk pushed against the window" from the prior
    pass (re-expressed in the new per-wall state shape) and folded the old separate
    "overheated meeting room" preset into "summer heat with a fan on" to hold the total at
    five, matching the site's typical preset count.
  - Verified in-browser: DOM/computed-value checks confirmed the physics before trusting
    any visual (cozy preset: N wall 21.0°C / window 15.1°C matching hand calculation to the
    tenth of a degree, same as the prior pass's side-view numbers, confirming the refactor
    didn't change the underlying math for the single-exterior-wall case). Live (non-preset)
    toggling of a wall's type and the ceiling's type both correctly show/hide their
    conditional sliders without a page reload. Both themes, desktop (946px) and mobile
    (375px, including the label-collision check above), no horizontal overflow at either
    width, no console errors. **Not yet reviewed.**

- **`visualizations/thermal-comfort-pmv.html` first follow-up pass: wall and window surface
  temperatures are now calculated, not set directly**, at Simon's explicit request ("with
  indoor temperature, outdoor temperature and R/U value, can we calculate the surface
  temperatures?"). Replaces the previous page's direct `tWindow` slider with four
  physically-grounded inputs — outdoor temperature, wall insulation (imperial R-value, since
  that's what's printed on Canadian insulation batts), window size (as % of the exterior
  wall), and window U-value — feeding a real steady-state conduction derivation instead of a
  free-standing number.
  - **Formulas**: wall surface temp uses `T_surf = T_in − (T_in−T_out)·R_si/R_total`, where
    `R_si = 0.12` and `R_so = 0.03` m²·K/W are the standard ASHRAE interior/exterior air-film
    resistances and `R_total` adds the user's R-value (converted from imperial via ÷5.678)
    between them. Window surface temp is simpler since a U-value already is the whole-assembly
    figure: heat flux is `U·(T_in−T_out)`, and the same `R_si` fraction of that gives the glass
    temperature — no iteration needed for either, unlike the PMV solver itself.
  - **Window size deliberately does not enter either formula** — a bigger window isn't colder
    glass, just more of it. Verified this is genuinely true (not an oversight) before wiring it
    up: size instead changes two other things that are shown explicitly, both new to this pass:
    (1) the angle-factor split in the room-box's MRT calculation — `angleFactors()` now divides
    the exterior-wall-facing factor between window and opaque wall by the glazing fraction, so
    a bigger window increases its own weight in t_r without changing its temperature; (2) the
    total heat-loss share readout ("window is 45% of that wall's area but carries 84% of its
    heat loss"), computed against a fixed representative 7 m² wall segment since the page has
    no absolute room dimensions elsewhere.
  - **Hero diagram**: the room-box's exterior-wall band now renders as two nested rects — the
    full band tinted by the derived wall-surface temperature, with a second rect inset and
    vertically centered inside it (height = glazing fraction × band height) tinted by the
    derived window temperature — so window size is visibly, proportionally represented, not
    just stated in a readout. Gained a fifth radiant ray (`rayExtWall`) alongside the
    pre-existing window/interior-wall/ceiling/floor rays.
  - Hand-verified the math against the live page before trusting it: cozy preset (22°C indoor,
    −10°C outdoor, R-20 wall, U-1.8 window) predicted wall 20.95°C / window 15.09°C by hand,
    page showed 21.0°C / 15.1°C; window preset (22°C indoor, −20°C outdoor, R-12 wall, U-2.8
    window, 45% glazing) predicted wall 19.77°C / window 7.89°C / 83.8% heat-loss share, page
    showed 19.8°C / 7.9°C / 84% — all within rounding.
  - Verified in-browser: both themes, desktop and 375px mobile widths (the longer "Interior
    wall" relabel — was "Wall", renamed to disambiguate from the new exterior-wall label —
    stays inside the viewport at the right-anchored edge), the 3-box control layout collapses
    to one column below 480px, all four presets, no console errors. **Not yet reviewed.**

- **`time-dilation.html`: the moving light clock's mirrors now travel.** Previously the moving
  panel drew its two mirrors as one static full-width rail spanning the whole zigzag, which hid
  the very thing the diagram exists to show — the diagonal path is a *consequence* of the clock
  sliding sideways. Now they are short bars that ride with the photon.
  - The bars are drawn at exactly the stationary panel's mirror width (`mirrorW: statW`),
    because it is meant to be the same clock. That forced the sweep geometry to reserve half a
    mirror of padding at each end (`edgePad = mirrorW/2 + 6`) so the bars stay inside the panel
    at full speed; the per-half-tick step is scaled down to match.
  - **The moving photon is now forward-only.** It used to run on `triWave`, sweeping the zigzag
    forward and then backward — which was invisible when the mirrors were a static rail, but
    with visible mirrors would have shown the clock sliding back to the left. The stationary
    panel keeps `triWave`, since that photon really does reverse at each mirror. The sweep
    restarts at the left edge instead, with the mirrors and dot fading out over the last 8 % of
    the cycle so the jump reads as the next clock arriving.
  - **The fade is deliberately one-sided.** A symmetric fade also starts the clock invisible at
    phase 0, which is exactly the state the page renders in at rest, after the reset button, and
    under `prefers-reduced-motion` — so it fades out only. `reduceMotion`'s declaration moved
    above `updateLightClockDots` for the same reason.
  - Verified across the whole speed range (slider driven at 5 %, 50 %, 99 %, plus reset): the
    moving mirror span is 112 px at every speed, exactly matching the stationary pair; the sweep
    collapses to a vertical line at v≈0 and still fits inside the panel at v≈0.99c. The sweep
    itself was verified by executing the shipped `updateLightClockDots` against stub elements at
    21 phases — bars always centred on the photon, never reversing, always inside the panel,
    photon alternating between the two mirror heights.

- **`microwave-chocolate.html`: a second section for other radio bands.** New
  `<section class="bands">` between the presets and the closing note — extending the page rather
  than starting a new one, the pattern already used on `starlight-spectrum.html` and
  `time-dilation.html`. The main measurement above it is untouched: it is keyed to the oven's
  nameplate 2.45 GHz, and that is what the c = 2fΔx experiment actually uses.
  - Six real band centres: 4G LTE band 3 (1.80 GHz), the oven (2.45), Wi-Fi 2.4 GHz channel 6
    (2.437), 5G n78 (3.50), Wi-Fi 5 GHz channel 100 (5.50), Wi-Fi 6E (6.50). Every spacing is
    **derived** from `c/2f` at draw time, never typed in, so the figures cannot drift from the
    equation the page is about — they come out at 8.33 / 6.12 / 6.15 / 4.28 / 2.73 / 2.31 cm.
  - The figure is six chocolate strips on one common 30 cm scale with a shared ruler, spots
    drawn at that band's half-wavelength, plus a dashed vertical through the oven's second spot
    so every other band can be read against it directly. The nicest thing it shows is that
    Wi-Fi's 2.437 GHz sits in the same ISM band as the oven, so its spots would land 0.3 mm from
    the oven's — the same fact that explains why a running microwave jams 2.4 GHz Wi-Fi.
  - Band selection is pill buttons (STYLE_GUIDE.md's sanctioned discrete-option selector),
    defaulting to Wi-Fi 2.4 GHz since that is the framing Simon asked for. A readout line under
    the figure states the selected band's spacing against the oven's, switching between a
    millimetre difference and a ratio depending on how far apart they are.
  - **The power caveat is stated up front, not buried**: an oven puts ~1,000 W into a sealed
    metal box, a router radiates ~0.1 W across a room — ten thousand times less, and untrapped.
    The section says plainly that nothing here melts anything and that only the geometry carries
    over.
  - Narrow layout uses a per-band `short` label. The first attempt derived it by regex-stripping
    the frequency off the pill text, which collapsed three different rows to just "Wi-Fi".
  - Verified: drawn spot gaps converted back to cm match `c/2f` for all six bands exactly; one
    pill pressed at a time; all six readout sentences correct; labels fit their gutter at 1440
    and 375 px; no page overflow; both themes; no console errors.

## Earlier on 2026-08-20

- **`index.html` rebuilt as a tile grid.** The catalogue is now a single flat grid of tiles
  instead of three hairline-rule lists, per Simon's pitch (see the 2026-08-20 backlog entry
  above). What changed, and the decisions behind each:
  - **Five tiles per row** at desktop (`repeat(5,minmax(0,1fr))`), stepping to 4 / 3 / 2 at
    1180 / 920 / 640 px. `grid-auto-rows:1fr` keeps every tile in a grid the same height so a
    two-line title and a four-line one still read as one even field.
  - **Featured is now five** (was three): `pizza-area`, `earth-moon-race`, `straw-hose-flow`,
    `heat-pump-magic`, `potato-trajectory` — the three existing picks plus the reference
    implementation and the newest page. Featured tiles are the same component one step larger
    (84 px icons vs 64, slightly bigger title).
  - **The three category sections are gone.** Simon chose one flat grid, with colour carrying
    the category — that is also what makes the randomiser meaningful, since it can shuffle the
    whole catalogue rather than shuffling within three groups. The `<select>` category filter
    still narrows the grid, so the grouping is still reachable, and the per-category lede
    paragraphs (`.cat-sub`) collapsed into one line under "All pages".
  - **Numbering removed.** The old `01 / Geometry` meta line is now just the category name,
    printed in that category's colour. Keeping a text label matters: it means the colour is
    never the only thing carrying the meaning, so no separate colour legend is needed.
  - **Category colour** uses three new token pairs (`--cat-everyday` / `--cat-discoveries` /
    `--cat-fun`), light and dark. Each tile does `--accent:var(--cat)` locally; because custom
    properties inherit into a `<use>` shadow tree, that single line also recolours the accent
    strokes inside the shared icon sprite, so artwork, border, tint and hover all agree with
    **no per-icon edits**. Light-mode Discoveries was darkened from `#9A6A12` to `#8A5E0C`
    during the build — at 10.5 px the first value only reached ~4.3:1 on `--bg`. See
    STYLE_GUIDE.md for the "index only, don't carry this into a visualization page" note.
  - **Tiles are tinted, not hairline.** A 1 px border at 30 % of the category colour over a
    6 % tint, deepening to 60 % / 13 % on hover, 10 px radius, no shadow. This is a knowing
    step toward "cards", which CLAUDE.md's principles warn against — it is what "tiles with
    category colours" actually asks for, and it stays flat and shadow-free.
  - **Icon + title only.** Simon chose this over showing descriptions: at ~250 px wide the old
    blurbs ran 6–8 lines. The descriptions were not deleted — they moved to a `data-desc`
    attribute, and the search box still matches against them (verified: searching "marathon"
    still finds `mass-energy.html`, whose blurb mentions it but whose title does not).
  - **Descriptions return as a tooltip** (added later the same day at Simon's request). One
    shared `#tileTip` element, positioned per tile, rather than a node per card; it reads the
    same `data-desc`. It opens on hover **and on keyboard focus** — hover-only content is
    unreachable by keyboard — sets `aria-describedby` on the tile while open, flips above the
    tile when there is no room below, and closes on leave/blur/Escape/filter change. Two bugs
    were caught and fixed during the build, both worth knowing about if this code is touched:
    tabbing to a tile scrolls it into view, and the original scroll handler hid the tooltip the
    instant a keyboard user reached it (it now *follows* a focused tile and only dismisses a
    hover-opened one); and the fade-in was gated on `requestAnimationFrame`, which never runs
    in a backgrounded document, so the tooltip could sit stuck at `opacity:0` — it now flushes
    layout by reading `offsetHeight` instead. `pointerenter` ignores `pointerType === 'touch'`,
    since on a touch device the tap just opens the page.
  - **The shuffle is animated** (same request). FLIP: measure every tile's rect, re-append in
    the new order, then animate each tile from its old position back to zero with the Web
    Animations API, so you watch the tiles travel to their new slots instead of the grid
    blinking. A mid-keyframe `scale(.93)` and 16 px lift give it the arc of a card being dealt;
    a per-tile random delay up to 110 ms staggers them. Any in-flight animation on a tile is
    cancelled before a new one starts, so back-to-back clicks do not stack (verified: 11
    animations max, every tile at rest with `transform:none`, no overlaps). Honours
    `prefers-reduced-motion: reduce` by reordering with no animation, and Reset order animates
    the same way.
  - **Shuffle / Reset order** are text-styled `.text-btn` controls in the browse row, matching
    the theme toggle. Deliberately *not* pills: STYLE_GUIDE.md only sanctions pill buttons for
    small discrete-option selectors, and these are actions. Shuffle is Fisher–Yates over the
    tile array followed by re-appending (appending an element already in the grid moves it, so
    no removal pass). The authored order is kept in `defaultOrder`, and "Reset order" is hidden
    until the first shuffle.
  - **Deferred: the "Most visited" row of five.** Simon chose to skip it for now rather than
    invent a ranking — this repo carries no analytics by constraint. An HTML comment marks the
    slot between Featured and All pages. If it is picked up later, the option discussed was
    localStorage click counts recorded by the index itself, shown as "most opened from this
    device" with a hand-picked default until enough clicks accumulate.
  - **Verification** (local static server, no console errors): tooltip verified on hover and
    focus, centred 11 px below its tile at 320 px wide, flipping above in the last row, and
    dismissed by blur / Escape / filtering; shuffle and reset verified as above. Note that the
    browser pane was not compositing in this session, so `document.hidden` was true throughout:
    the WAAPI timeline and CSS transitions were frozen, and real `focus` events did not fire
    (`document.hasFocus()` false). Those paths were checked by driving `animation.currentTime`
    by hand (correct interpolation at the midpoint, lands on `transform:none`) and by
    dispatching synthetic focus events. **The motion and the tooltip have never actually been
    watched playing** — worth a human look. 5 columns at 1440 px with zero
    horizontal overflow, 2 columns at 375 px likewise; 12 catalogue tiles + 5 featured tiles,
    17 icons injected and 0 broken sprite references; shuffle reorders the same set and Reset
    restores the authored order exactly; search "chocolate" → 1 page, category "Fun physics" →
    3 pages, cleared filters → 12 pages; both themes resolve their category tokens.
    **Not verified visually** — the browser pane could not composite screenshots in this
    session, so every check above is DOM/computed-style based. Worth a human look at the tint
    strength and the icon-in-category-colour treatment before considering this settled.
  - **Adding a newly reviewed page now** (this supersedes the mechanics in the 2026-08-17
    entry below, which still refers to three category grids): append one `<a class="tile"
    data-cat="…" data-desc="…" href="visualizations/<slug>.html">` to `#catalogueGrid`, add a
    matching `<symbol id="icon-<slug>">` to the sprite if one does not exist, and bump the
    "Twelve pages" / "Twelve equations" / results-count default. The icon is wired up by slug
    automatically, so no mapping table needs touching. `data-cat` must be spelled exactly
    `Everyday maths`, `Discoveries`, or `Fun physics` — the string drives both the filter and
    the tile colour.

## Previous handoff — 2026-08-19

- **`visualizations/thermal-comfort-pmv.html`** ("The room feels colder than the thermostat
  says") — new page 51, built directly from this file's own backlog idea above ("ASHRAE 55
  occupant thermal comfort"), the most ambitious of the six ideas pitched the same day. Added
  to **Discoveries** on `unreviewed.html` and `tracker.html` (not yet reviewed, so not on
  `index.html`).
  - **Research pass done first, in-conversation, before any code.** Verified the full Fanger
    heat-balance formula set (respiration/convection/radiation/evaporation terms, the
    clothing-surface-temperature iteration, PPD's closed form) against the EnergyPlus
    Engineering Reference and ISO 7730/ASHRAE 55 sources, then implemented the classic
    published iterative `pmv_ppd_iso` algorithm (the same one used across CBE's thermal
    comfort tool, pythermalcomfort, and Fanger's own reference program) rather than a
    simplified or re-derived approximation — this is exact, not illustrative, unlike most of
    this page's honest-device simplifications elsewhere.
  - **The room-box, built as a draggable-person SVG diagram**, not the usual single equation
    figure. Four surface-temperature sliders (ceiling, floor, interior walls, window) tint a
    room cross-section via a theme-aware `color-mix` temperature scale (cold→neutral→hot,
    anchored at 21°C, using `--accent`/`--line2`/`--bad` so it never needs a light/dark pair).
    The person (SVG `<g role="slider">`, pointer-drag + arrow-key accessible) walks between
    the window wall and the far wall; four radiant lines from the person to each surface are
    drawn live, stroke-width scaled to that surface's angle factor, so the MRT weighting is
    *visible*, not just a number changing.
  - **Mean radiant temperature uses a simplified angle-factor model**, stated as such in the
    note: `Fp_window = 0.06 + 0.16(1-x)`, fixed `Fp_ceil = Fp_floor = 0.12`, and the remainder
    assigned to the far/side walls combined — normalizes to 1 by construction, and captures
    the real, honest direction (closer to the window → more weight on the window's
    temperature) without claiming real solid-angle geometry. `t_r⁴ = ΣFp·(T+273)⁴` per ISO
    7730; operative temperature approximated as `(t_a+t_r)/2` (valid at the low air speeds
    this page's slider range covers).
  - **Local-discomfort flags** (draft risk, floor temperature outside 19–29°C, cold-window
    radiant asymmetry) sit below the main PMV/PPD gauge as a second, independent readout —
    deliberately included so a state can read PMV≈0 "Neutral" while still flagging real
    discomfort next to the window, the actual pedagogical point of building this as a room
    with a draggable person rather than a bare equation page. All three are explicitly
    labeled in the note as simplified proxies for ASHRAE 55's real local-discomfort limits,
    not direct implementations of them.
  - **Two real bugs caught and fixed during in-browser verification, both label-overflow at
    the 375px mobile width**: (1) the Window/Wall surface labels were centered on their own
    (narrow) band, so at mobile width "Window" hung off the left edge of the viewport and
    "Wall" off the right — fixed by anchoring them inward (`translateX(0)`/`translateX(-100%)`
    pinned to the room's left/right edge) instead of centering. (2) The live "Air · RH · m/s"
    label and the Window/Wall labels shared the same vertical row at narrow width and
    overlapped — fixed by moving the air label down to its own line, clear of both.
  - Verified in-browser: both themes, desktop (800px) and mobile (375px) widths, the "desk
    pushed against the window" preset (PMV drops to −0.65, ASHRAE 55 verdict correctly flips
    to non-compliant, cold-window asymmetry flag fires), direct pointer-drag of the person
    (PMV recovers to −0.42 moving away from the window), no horizontal overflow at 375px
    (`scrollWidth`/`clientWidth` both 375), no console errors. **Not yet reviewed** — first-pass
    build, not added to `index.html`'s reviewed grid.

- **`visualizations/heat-pump-magic.html`** ("Heat pumps don't create heat") — new page 50,
  added to **Discoveries** on `unreviewed.html` (not yet reviewed, so not on `index.html`)
  and `tracker.html`. Built from the first backlog idea above, directly to the
  [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton.
  - **The core answer to "how can COP exceed 100%?"**: COP = Q<sub>H</sub>/W, and energy
    conservation gives Q<sub>H</sub> = W + Q<sub>C</sub> — delivered heat is the electrical
    work *plus* heat absorbed from the outside air, not electricity alone. The equation box
    shows the idealized **Carnot ceiling**, T<sub>H</sub>/(T<sub>H</sub>&minus;T<sub>C</sub>)
    in kelvin (indoor target fixed at 21°C) — this stays clean/idealized like straw-hose's
    laminar equation, while the actual reported COP uses a realistic correction, footnoted in
    the note exactly like straw-hose's turbulent-flow correction.
  - **Realistic COP model, revised same day.** The first version derived the "real" COP from
    physics (a fixed 5°C heat-exchanger approach temperature plus a fixed 30% fraction of the
    resulting ideal figure), hand-tuned to land in a plausible range — Simon asked for an
    actual cited COP curve instead. Replaced with a piecewise-linear interpolation
    (`COP_CURVE` control points) through the midpoint of each range in [Daikin Quebec's
    published outdoor-temperature/COP table](https://daikinquebec.net/en/heat-pump/cop/):
    +8°C→4.00, 0°C→3.25, −8°C→2.75, −15°C→2.25. The page's slider range (−20°C to +15°C) goes
    slightly past that table at both ends, so the two endpoints are extrapolated using the
    slope of the nearest real segment rather than invented independently: −20°C→1.89
    (continuing the −15↔−8°C slope down), +15°C→4.66 (continuing the 0↔+8°C slope up). The
    equation box still shows the idealized Carnot ceiling unchanged (T<sub>H</sub>/(T<sub>H</sub>−T<sub>C</sub>)
    ≈ COP 7 at −20°C/21°C, which Simon spot-checked by hand) — the note now states plainly
    that the result-box number is read off the cited curve, not derived from that ceiling,
    and that the gap between the two is the honest measure of how far a real machine falls
    short of the theoretical best case. `GMAX` (the gauge's ×-scale) was tightened 6→5 to
    match the new, slightly lower COP ceiling (4.66 max vs. the old model's 5.6).
  - **Device picker** (Heat pump / Electric heater) directly demonstrates the answer: the
    electric resistance heater is pinned at COP 1.00 always (no refrigeration cycle, no free
    ambient heat), contrasted against the heat pump's COP that climbs with outdoor
    temperature. Switching devices also hides/shows the ambient-heat arrow in the hero
    diagram and dims the cloud icon.
  - **Hero diagram**: an energy-flow figure (cloud/outside air → heat pump unit → house),
    with a third vertical arrow for electricity in from a plug icon below the unit. Arrow
    stroke-width scales with each energy term's relative size (W fixed at 1 unit, Q<sub>C</sub>
    and Q<sub>H</sub> scaled off the live COP), animated with the site's standard flowing-dash
    pattern, gated behind `prefers-reduced-motion` per STYLE_GUIDE.md.
  - **Gauge is a stacked/segmented bar** (0–6×, linear, not log — the whole range fits in one
    decade so straw-hose's log gauge pattern didn't apply), not the usual reach+limit design:
    a "paid" segment (always 0–1×, electricity) and a "free" segment (1×–COP×, ambient heat)
    stack together, with a reference tick at 1× labeled "electric heater" for direct
    comparison. **Two real label-collision bugs caught and fixed during in-browser testing:**
    (1) the "N×" mark label and the "electric heater" reference label sit at nearly the same
    gauge position whenever COP is close to 1 (the electric-heater device's default case) —
    fixed by stacking the mark label above the reference row (`top:-17px` vs `-3px`) whenever
    they're within 22% of gauge width of each other, tuned up from an initial 12% threshold
    that still let a COP-1.76 case collide. (2) On narrow/mobile widths the hero's "Qc · N kWh,
    free" and "Qh · N kWh delivered" labels are wider than their own arrow's span and
    overflowed into the heat-pump box / house icon — fixed by constraining each label's
    `width` to its arrow's actual span (computed in the same `geom()` function that sizes the
    arrow) and letting it wrap (`white-space:normal`, `text-align:center`) instead of a fixed
    unconstrained nowrap string.
  - New hand-drawn icon added to `unreviewed.html`'s sprite (`icon-heat-pump-magic`): a cloud
    blob → arrow → unit box → arrow → house, matching the hero diagram's own visual metaphor
    at icon scale.
  - Verified in-browser: both themes, desktop and 375px mobile widths, all four presets (mild
    fall day 10°C, typical winter day &minus;5°C, deep freeze &minus;20°C, compare-electric),
    keyboard slider End-key to max (15°C, COP 4.66× — confirmed it stays within the gauge's
    5× scale with no clipping), no console errors. Re-verified after the COP-curve swap:
    −20°C reads 1.89× and 10°C reads 4.19× (between the table's 0°C/3.25 and +8°C/4.00
    points, as expected), no new label collisions introduced by the lower `GMAX`.
  - **Third pass, same day: comparison chart + title change + trimmed note, all at Simon's
    request.**
    - **Title changed** from "Heat pumps don't create heat." to **"Heat Pump ~~magic~~
      *Science*"** — literal strikethrough on "magic" (`<del>`, styled with `--bad` as the
      strike color) and italic on "Science" (`<em>`), matching the phrasing from this file's
      own backlog entry for the page's original pitch. The explanatory sentence that used to
      be the h1 ("They move it. Put in 1 kWh...") moved down into the `.sub` paragraph as
      "Heat pumps don't create heat — they move it..." so it still reads standalone now that
      the h1 no longer sets up the "they" antecedent.
    - **New COP-vs-temperature comparison chart**, added beside the flow-diagram hero (new
      `.herorow` 2-column grid wrapping both, stacking to 1 column under 900px — a deliberate
      deviation from STYLE_GUIDE.md's single full-width hero, matching CLAUDE.md's "deviate if
      the concept calls for it" allowance). Hand-authored inline SVG, no chart library: three
      curves over −20°C to +20°C — gas furnace (flat 0.90, doesn't depend on outdoor temp),
      the real heat-pump curve (same `realisticCOP()`/`COP_CURVE` used elsewhere on the page),
      and the Carnot ceiling (`carnotCOP()`). **The Carnot curve is genuinely unbounded** as
      T<sub>C</sub>→T<sub>H</sub> (21°C), so plotting it on the same linear 0–10× axis as the
      other two — which is what makes the comparison legible — means it must go off-scale
      well before the domain's warm end. Handled honestly rather than clipped silently: the
      chart's y-cap (`CHART_YMAX=10`) and the exact temperature where Carnot crosses it
      (`CARNOT_CAP_T`, solved algebraically from `T_H`/`CHART_YMAX` rather than hardcoded) are
      computed together, the dashed Carnot line simply stops being drawn past that point, and
      a small arrow glyph marks where it runs off the top. A text line below the chart
      (`#chartCurrent`) states all three current values in words regardless of scale — e.g.
      "Carnot ceiling ≈294.1× (off scale)" at 20°C — so the answer is never just implied by a
      line vanishing off the edge. Slider range extended −20…+15°C → **−20…+20°C** to match
      the chart's requested domain; `COP_CURVE`'s warm-end extrapolated point moved from
      +15°C/4.66 to +20°C/5.13 (same 0↔+8°C slope continued further, so +15°C still
      interpolates to the same 4.66 as before — no discontinuity introduced), and the gauge's
      `GMAX` bumped 5→6 to keep clearing the new 5.13 ceiling with margin.
    - **Note paragraph shortened** from ~230 words to ~110 — cut the step-by-step numeric
      walk-through of the COP curve's control points (now redundant with the chart itself)
      and tightened the energy-conservation explanation to one sentence, while keeping both
      citations (Carnot/Wikipedia, Daikin Quebec) and the "one product line, not a universal
      curve" caveat.
    - Verified in-browser: both themes, desktop and 375px mobile (chart restacks correctly
      below the flow diagram, all labels wrap without collision), −20°C/10°C/20°C slider
      positions (7.17×/on-chart, in-between, ≈294× off-chart-with-arrow respectively), no
      console errors.
  - **Fourth pass, same day: vertical centering + a third heating device (natural gas), both
    at Simon's request.**
    - **`.herorow` centered vertically** (`align-items:start`→`center`) so the shorter flow
      diagram sits centered against the taller chart column instead of pinned to its top edge
      — a one-line CSS change, no JS involved since the diagram's own internal labels are
      absolutely positioned relative to its own box and unaffected by the box's position
      within the row.
    - **`DEVICES` gained a third entry, `gas` ("Natural gas"), fixed at COP 0.90** (the same
      `GAS_COP` constant the comparison chart's flat line already used) — the first device on
      this page with COP genuinely below 1, which needed real new machinery, not just a third
      button: `cop()` gained a `state.device==='gas'` branch; `dev()` was rewritten to look up
      by `key` instead of assuming a hardcoded `state.device==='hp'?0:1` index (that
      shortcut would have silently mis-resolved for gas); the input icon switches between the
      existing plug (electricity) and a new hand-drawn flame path (fuel) via `d.icon`/`d.key`;
      the unit label reads "furnace" for gas, "heat pump"/"heater" as before otherwise; and
      the input arrow's label switches from "W · 1.00 kWh" to "Fuel · 1.00 kWh equiv." to be
      honest that fuel and electricity are being compared on a common energy basis, not that
      gas is literally metered in kWh.
    - **New loss arrow and label** (`lossLine`/`lblLoss`), the "new line of loss" Simon asked
      for: exits the unit box upward (mirroring the input arrow's "upward into the box" from
      below, so the two read as a matched pair) with width scaled to `1−COP` and opacity/
      visibility gated on `c<1` — invisible for heat pump/electric, visible only for gas.
      Needed real headroom above the unit box that didn't exist before: `geom()`'s `cy`/`vbH`
      both grew by ~10px (`70/150`→`78/160` narrow, `80/170`→`88/180` wide) to reserve that
      space unconditionally, so toggling to gas doesn't reflow/resize the diagram relative to
      the other two devices.
    - **Gauge became a genuine three-way split**, not just a bigger legend: previously the
      "paid" segment always spanned a fixed 0→1× (implicitly assuming COP≥1) with "free"
      making up any excess above it. For gas that assumption is wrong — paid-for energy can
      go **unrecovered**. Rewrote the segment math in `drawResult()` as a branch on `c>=1`:
      the ≥1 case keeps the old paid(0→1)+free(1→COP) split; the new <1 case draws
      paid/delivered from 0→COP and a `.loss` segment (new `var(--bad)` fill, new `#gLoss`
      div) from COP→1, i.e. the paid-for energy that never became heat. The gauge's reference
      tick/label was renamed from "electric heater" to the device-agnostic **"1× = fully paid
      for"**, since that tick is now a meaningful anchor for three devices, not a callout to
      one specific one. `verdictSub`/`effortLine` text and the result number's color
      (`--accent` above 1, `--bad` below 1, `--fg` at exactly 1) all gained a third branch to
      match.
    - Added a "compare: natural gas" preset alongside the existing electric one, and extended
      the note's existing gas-furnace sentence (already there from the chart-adding pass) to
      point at the new loss arrow and mention all three devices are toggleable.
    - Verified in-browser: gas device shows flame icon, red loss arrow + "lost · 0.10 kWh"
      label, red gauge segment ending exactly at the "1×" tick, 90% headline in `--bad`, in
      both themes and at 375px mobile (loss label wraps to two lines without clipping the top
      of the diagram); electric heater and heat pump re-verified unaffected (zero-width loss
      segment, correct icon/label switching back); no console errors.
  - **Not yet reviewed** — still a first-pass build, not marked complete. Open item for a
    future review pass: the Daikin table's numbers are one specific product line, not a
    universal curve — worth deciding whether to keep it as the page's single reference or
    add a second real curve (e.g. a cold-climate model) for contrast.
  - **Fifth pass, 2026-08-19: refrigeration-cycle diagram + "more details" disclosure**, both
    from the colleague-feedback backlog note above.
    - **New `.refrig` full-width section** (after the presets row, before the note — the
      "second section extends the skeleton" pattern, mirroring `time-dilation.html`'s
      `.lightclock`), showing the four-stage loop (evaporator &rarr; compressor &rarr;
      condenser &rarr; expansion valve) as an SVG rectangle, same measured-width/viewBox +
      HTML-label-overlay technique as the hero (`geomRefrig()`/`drawRefrig()` mirror
      `geom()`/`drawHero()`). Deliberately **independent of the device picker** — it always
      shows the heat pump's own cycle regardless of which of the three devices is selected,
      with the sub-paragraph stating directly that the electric heater and gas furnace skip
      this loop entirely. Only the evaporator label's outdoor-temperature readout is live
      (tied to the T<sub>C</sub> slider); the rest is static since the cycle's stages don't
      change. Segment color codes hot/cold side (blue=cold, orange=hot, reusing the hero's
      existing Q<sub>C</sub>/Q<sub>H</sub> colors) and dash density codes vapor/liquid
      (loose dash=vapor, tight dash=liquid), explained in a `.refrig-legend` below the
      diagram rather than four more inline labels risking collision — a deliberate
      simplification after concluding four positioned flow-state labels around the loop was
      collision-prone for the time available; the loop's four *box* labels (name + one-line
      state) still position individually, verified collision-free. Dash animation reuses the
      existing `tick()`/`reduceMotion` rAF loop (same accessibility gate, no new one added).
    - **New `<details class="more">` disclosure** after the note, before feedback — first use
      of a collapsible on the site (checked: no `<details>`/`<summary>` pattern existed
      anywhere in `visualizations/` or `STYLE_GUIDE.md` before this). Styled to match the
      mono/uppercase text-button language (`.theme-toggle`-adjacent), custom `+`/&minus;`
      indicator swapped via `.more[open]` rather than the native marker triangle. **Real bug
      caught and fixed during in-browser testing**: the first draft set `.more-body{display:
      grid}` unconditionally, which — because that author rule has higher specificity than
      the browser's default `details:not([open]) > *` hiding rule — kept the body visible
      even while the `<details>` was closed. Fixed by making the state explicit instead of
      relying on the UA default: `.more-body{display:none}` / `.more[open] .more-body{display:
      grid}`. Three items inside: (1) outside-air volume processed, a cited CFM/ton range
      (Trane) with a stated 3-ton/2,000 m&sup3;/h "typical" assumption; (2) heat available in
      that air, **live-computed** from `state.Tc` — air density via the ideal-gas law
      (&rho;=P/(R&middot;T)) &times; c<sub>p</sub>=1,005 J/(kg&middot;K), multiplied by the
      assumed airflow and a stated 4&deg;C evaporator air-side temperature drop — then
      explicitly cross-checked against this page's own `realisticCOP()`-derived Q<sub>C</sub>
      at the same temperature, with the note stating plainly the two won't match exactly
      (illustrative sensible-heat estimate, not a coil design) but should land in the same
      order of magnitude; (3) heat-exchanger surface area, a face-area &times; fin-multiplier
      order-of-magnitude estimate (~8&ndash;15 m&sup2;) since no authoritative single-number
      source for residential outdoor-coil surface area turned up in research — flagged
      in-page as an estimate, not a spec, per the site's honesty convention (same pattern as
      `mass-energy.html`'s hamster-wheel figure).
    - Verified in-browser: both themes (button-toggle checked, computed colors resolve
      correctly, no transparent/unset values), desktop (1280px) and mobile (375px, no
      horizontal overflow), all four refrig-diagram labels confirmed inside their boxes with
      zero label-label overlap at both widths (`getBoundingClientRect()`/viewBox-scaled
      checks — no screenshot tool available this session, same fallback used elsewhere in
      this file), the details toggle opens/closes with the indicator and content swapping
      together, the live air-energy paragraph and the diagram's evaporator label both update
      together when a preset changes T<sub>C</sub> (checked against the "deep freeze" preset,
      &minus;20&deg;C), no console errors at any point.

- **`visualizations/mass-energy.html`** ("How much energy is in matter?") received a full
  redesign pass today, directly answering this file's own backlog idea above ("E=mc²
  page addition"). **Reviewed and complete as of 2026-08-19** — moved from
  `unreviewed.html`'s Discoveries list into `index.html`'s reviewed Discoveries group
  (card `15 / Mass and energy`, category count "Four pages"→"Five pages", topbar "Eleven
  equations"→"Twelve equations", search bar's live "11 pages"→"12 pages";
  `unreviewed.html`'s Discoveries count "Eighteen pages"→"Seventeen pages" and its total
  "39 pages"→"38 pages"). `tracker.html`'s `PAGES` array already listed the page under
  Discoveries, so no change needed there.
  - **What real fuel/process actually delivers, against the same theoretical mc².** Added a
    "Real process" picker (TNT, gasoline, uranium-235 fission, hydrogen fusion,
    matter-antimatter annihilation) whose specific-energy figures (J/kg) are standard
    combustion/nuclear-physics constants, cited with links in the page's Sources note
    (TNT_equivalent, Gasoline#Energy_content, Nuclear_fission, and the proton-proton chain,
    all Wikipedia). The single hero animation (merged from an earlier two-animation draft
    at Simon's request) shows one bar: a dim "ghost" fill for the full theoretical mc² at
    the current mass, with a bright accent sliver inside it sized to the selected process's
    actual fraction — same visual, same scale, so the gap between theory and reality is
    literally the size of the sliver rather than two separate numbers to compare mentally.
  - **Result box replaced with a 3-column equivalency table** (Category | Full mc² | selected
    fuel), computed live off both the mass slider and the fuel picker: total energy, then
    four real-world comparisons — years of China's total annual energy supply (168,386,888 TJ,
    2023, IEA World Energy Balances — also the figure used to calibrate the "1.5×" mass
    preset), years of an average Canadian home's energy use (87.6 GJ, 2023, Natural Resources
    Canada), round trips Vancouver↔Montreal in a Ford F-150 (~4,600 km one-way, ~12.5 L/100km
    combined, stated as an assumption), marathons run by an average human (~2,600 kcal, a
    commonly-cited estimate), and hamsters running a wheel for 30 minutes (~1 W mechanical
    output, explicitly flagged in the Sources note as an order-of-magnitude estimate, not a
    measured figure). Each equivalency row carries a small hand-authored inline SVG icon
    (China map outline, house, pickup truck, running figure, hamster wheel) — no icon library,
    consistent with the site's SVG-only constraint. The "Total energy" row is set in a larger
    font than the rest of the table to read as the headline figure.
  - **Layout, iterated twice at Simon's request.** First pass put the mass slider and fuel
    picker side-by-side above a full-width table; second pass (this entry's final state) wraps
    both in one `.resultrow` — mass slider stacked above the fuel picker on the left half,
    equivalency table on the right half, equal `1fr 1fr` columns, stacking to one column under
    820px. The table's own explanatory sentence ("The full mc² column is theoretical...") was
    moved to sit below the table rather than above it, also per request.
  - Verified in-browser at each iteration: both themes, desktop (1400px) and mobile (375px)
    widths, fuel-pill switching updates the hero sliver/table/labels together, presets
    (including the "1.5× China's yearly energy" mass preset, landing on exactly a 1.50×
    reading), row-icon rendering (18×18px via `getBoundingClientRect()`), total-row font size
    (18px), equal grid-column widths (`getComputedStyle` on `.resultrow`), no console errors,
    no page-level horizontal overflow on mobile (table scrolls inside its own
    `.equiv-scroll` container instead).

## Previous handoff — 2026-08-18

- **Sitewide: every visualization page's topbar back-link replaced with the `mc madeclear`
  brand mark**, at Simon's request ("remove the link to the github (top left of pages) and
  replace with the mc logo/name and link to the main page"). Previously each page's top-left
  was a plain `&larr; Physics you can see` text link to `../index.html`, with a JS fallback
  that swapped it to a GitHub-repo link whenever the page was opened somewhere that relative
  path wouldn't resolve (published standalone, e.g. as an Artifact) — documented in
  STYLE_GUIDE.md's old "Back link" section. That fallback is exactly what Simon wanted gone.
  Replaced across all 49 files in `visualizations/` with `index.html`'s own hand-drawn `mc`
  icon + "madeclear" wordmark (`<a class="brand" href="../index.html">…</a>`), scaled to ~72%
  size to fit the topbar's thin row, always pointing at `../index.html` with no JS fallback —
  see STYLE_GUIDE.md's updated "Back link" entry for the exact markup/CSS to copy into future
  pages. Applied mechanically with a small Perl script (`fix_topbar.pl`, not committed — lived
  in the session scratchpad) since the pattern was byte-identical across every "normal" file;
  `straw-hose-flow-darcy.html`'s single-line minified markup and its own differently-shaped
  minified fallback (`var back=$('backLink')...`, missed by the first pass's more specific
  pattern match since it wasn't literally `backLink.href = ...`) were fixed by hand — that
  file's separate footer "GitHub" link was deliberately left alone since it's unrelated to the
  top-left request. **Two real bugs caught while scripting this, both from the same root
  cause:** `local $/` (slurp mode, needed to read a whole file at once) silently makes Perl's
  `chomp()` a no-op, since `chomp` strips whatever `$/` currently holds and `$/` was undef —
  the first attempt left a stray blank line after every `</a>` tag from an un-chomped trailing
  newline in the replacement HTML, and separately corrupted the em dash in `aria-label="Made
  clear — home"` into mojibake because the script lacked `use utf8;` (needed so literal
  non-ASCII characters in Perl source are read as UTF-8 rather than raw bytes before being
  re-encoded on write). Caught both on the first single-file trial run before the 47-file batch
  application — restored from a backup copy and fixed the script rather than needing to revert
  47 files after the fact. Verified after the full rollout: `grep` for `backLink` and for the
  `github.com/OttawaVisuals` fallback URL across every file (clean except the intentional
  darcy footer link), div tag-balance counts per file, no console errors and correct rendering
  in-browser at desktop/375px width and both themes on several sampled pages
  (`straw-hose-flow-darcy.html`, `pizza-area.html`, `half-life.html`, `time-dilation.html`).
- **`index.html`'s Featured section: swapped the straw card for the pizza one**, at Simon's
  request ("remove the straw from the main page (replace with the pizza)"). `straw-hose-flow.
  html` remains linked from its own reviewed category card further down the page (Fun physics)
  and from `about.html`'s origin story — only the homepage's three-card Featured spotlight
  changed, now: pizza-area, potato-trajectory, earth-moon-race.

- **`visualizations/time-dilation.html` gained a light-clock derivation diagram** (new
  `.lightclock` section, added after the existing presets row and before the closing note,
  matching `starlight-spectrum.html`'s "second section extends the skeleton" precedent). The
  page's existing analog-clock hero already showed *that* moving clocks run slow, tied to the
  velocity slider; this section shows *why*, geometrically — two mirrors with one photon
  bouncing between them (one round trip = one tick). A small stationary panel bounces the
  photon straight up/down; beside it, the same clock moving at the slider's current v draws a
  static zigzag path (two round trips, `LC_SEGS=4` segments) whose horizontal step per
  half-tick is `v/c × maxHalfStep` — 0 at rest, filling the panel near c — with an animated dot
  ping-ponging along it (decorative pacing, not tied to real elapsed time, same category as the
  existing clock-hand loop). The first half-tick is annotated as a right triangle (`L`
  vertical, `v·t` horizontal, `c·t` hypotenuse), and a derivation line beneath states
  `(c·t)² = (v·t)² + L² ⇒ t = t₀·γ` with the live γ value, tying directly back to the Lorentz
  factor already shown in the equation/result above rather than introducing a second,
  disconnected number. Explicitly labeled "schematic, not to scale" per the site's honesty
  convention (the linear `v/c × maxHalfStep` mapping is illustrative, not the real path-length
  ratio). Verified in-browser via `getBBox()` checks (no dedicated screenshot tool available
  this session, same limitation noted for other animated pages): no label overlap at desktop
  (1163px) or mobile (375px) width, at both slider extremes (`jet` preset ≈8×10⁻⁷c and `v99`
  preset =0.99c — including the near-zero case where the two adjacent "L" labels sit only 4px
  apart but don't touch), in both themes, no console errors, zigzag path/mirrors stay inside
  the SVG viewBox at every width.
  - **Follow-up pass, same day:** three fixes/additions after Simon tried the page.
    (1) The `.lightclock .sub` paragraph inherited the topgrid header's `.sub{max-width:52ch}`
    rule, leaving dead space beside the text since this section is full-width on its own row
    (no adjacent equation/legend column to make room for). Added `.lightclock .sub{max-width:
    none}` — recorded as a general pattern in
    [STYLE_GUIDE.md](STYLE_GUIDE.md#component-patterns) ("A second section's `<p class="sub">`
    should use the full column width") so future second sections (`starsection`-style) don't
    repeat it. (2) Added a "↺ reset to slowest & re-sync the clocks" button
    (`#lcResetBtn`) inside `.lightclock`: sets `state.p=0` and zeroes both `lcStatAccum`/
    `lcMovAccum` animation-distance accumulators (plus `simYears`, so the main hero clock
    hands reset too), because dragging the speed slider around leaves the two dots at
    arbitrary, unequal points in their own tick cycles — without a reset there was no way to
    cleanly demonstrate "at low speed these tick at the same rate." Fixing this surfaced a
    second, real bug: the moving panel's static path starts at the *bottom* mirror
    (`pts[0]=[x0,cy+L]`) while the stationary dot's phase-0 position was the *top* mirror, so
    right after reset the two dots sat at opposite mirrors — same tick rate, opposite phase,
    which still visually reads as "not synced." Fixed by flipping the stationary dot's phase
    mapping (`sy = cy+L − triWave(phase)·2L`, was `cy−L + triWave(phase)·2L`) to also start at
    the bottom. Verified via `getBoundingClientRect()`-equivalent (`circle` cy/cx read
    directly): both dots land on the identical y-coordinate immediately after reset and stay
    matched 400ms later at low speed. (3) Added the Parker Solar Probe as a sixth preset
    (192 km/s, the same record-near-Sun figure already sourced in `earth-moon-race.html`) and
    gauge tick, answering Simon's actual question — yes, even the fastest human-made object is
    measurably time-dilated, just barely: verified ≈6.47 s/year, ≈17.7 ms/day, "Small." tier
    (between GPS and 0.9c on the gauge).
  - **ISS/GPS gauge tick-label collision, fixed same day.** The ISS and GPS labels overlapped
    by ~9px at default width — pre-existing, independent of the probe addition (each tick's
    position only depends on its own preset, not on `GAUGE_REFS` order/count). This was first
    flagged as a background task and picked up in a separate `git worktree`, but that worktree
    had branched from the last *committed* state (`b144839`) — since the light-clock diagram,
    reset button, and Probe preset above were all still uncommitted in the main working tree at
    that point, the worktree's copy of `time-dilation.html` had none of them, and its fix was
    applied to that stale file (confirmed: zero matches for `lightclock`/`Solar
    Probe`/`lcResetBtn` in its diff). Re-applied the same fix directly against the current file
    instead of merging that branch: a new `layoutGaugeTickLabels()` measures each `.ticklabel`'s
    pixel width via a cached canvas `measureText` context, sorts by gauge position, and greedily
    assigns colliding labels to a second row (`top:45px`, gauge height `56px→68px` when
    stacked) — reusing the same measure-and-stack pattern as `braking-distance.html` (commit
    `b95e531`). Called every `drawResult()` (not gated behind the one-time tick-building block)
    so it re-resolves on resize instead of freezing at first-render width. Verified via
    `getBoundingClientRect()`: ISS now sits on row 2 while GPS/jet/Solar Probe/0.9c/0.99c stay
    on row 1 with no overlaps, at both desktop and 375px mobile widths and in both themes; no
    console errors. **Lesson for next time:** a background task run in a worktree only sees
    committed history — if a suggested fix targets a file with uncommitted local changes,
    either commit first or expect the worktree's result to need re-applying, not merging.
  - **Marked reviewed and complete.** Added to the reviewed-only homepage's **Discoveries**
    group in `index.html` (card `24 / Relativity`, third page in that category — category count
    bumped "Two pages"→"Three pages", the topbar's "Nine equations"→"Ten equations", and the
    search bar's live "9 pages"→"10 pages"), and removed from `unreviewed.html`'s draft list
    (count "40 pages"→"39 pages"). `tracker.html`'s `PAGES` array already listed
    `time-dilation.html` under Discoveries from the original eighteen-page batch, so no change
    needed there. No open items remain.

- **`visualizations/braking-distance.html` received a full review and interaction pass today**
  across commits `5907b00`, `6e54faf`, and `cea829c` (all pushed to `main`). Final page state:
  - The title correctly says **braking distance**, since reaction distance grows linearly with
    speed and total stopping distance therefore does not simply quadruple when speed doubles.
  - Controls are a compact laptop 2×2 grid: speed + surface on the first row,
    perception–reaction time + vehicle mass on the second. The 0.2–2.0 s reaction range is
    carefully described: 0.2 s is a simple laboratory visual response, not an F1 road-hazard
    response; 1.5 s is the common baseline; 2.0 s is the conservative elderly/inexperienced
    scenario cited in the page note.
  - Mass does **not** alter distance in the tire-friction-limited model because mass cancels;
    it remains adjustable because it scales kinetic energy. Results show reaction distance,
    braking distance, dissipated translational kinetic energy, and total stopping distance.
  - The main car animation has reaction above the road and braking below it, with no pitch
    reference marker. Directly beneath it, one full-width dual-axis chart shows speed and
    kinetic energy versus distance; pointer hover reports exact distance, speed, and energy.
  - The result gauge is followed—not preceded—by dynamic distance comparisons against a 50 m
    Olympic pool, 105 m football pitch, and 400 m track lap. The recurring rule that comparison
    text belongs below the gauge/axis it explains is recorded in `STYLE_GUIDE.md`.
  - The energy comparison uses the approximate metabolic cost for a 70 kg person running on
    level ground (about 1 kcal/kg/km), with assumptions and sources linked in-page.
  - Verified in-browser at 1,024 px, 736 px, and 360 px; light/dark themes; pointer tooltip;
    keyboard slider changes; no horizontal overflow or console errors. At 1,024×900 the full
    control/result block ends inside the viewport.
- **Update — same day:** a follow-up review pass (via Claude) found a real overlap bug the
  earlier pass missed: the gauge's dynamic "▲ m total" marker label and the static
  "football pitch · 105 m" reference label share one row above the track and collided
  whenever total stopping distance landed near 105 m — including the default "highway, dry
  road" preset (91 m), so most first-time visitors would see it. Fixed in commit `b95e531` by
  measuring both labels' pixel widths (canvas `measureText`) and stacking the marker label
  above the reference label only when they'd actually collide; non-colliding cases are
  unchanged. Verified across all four presets, drag positions, light/dark theme, and
  mobile/desktop widths.
- **Continuation status:** Simon confirmed "reviewed and complete" for this page. It has been
  moved from `unreviewed.html` to the homepage's Everyday maths group (`03 / Motion`) in
  `index.html`, with page/category counts updated in both files. No known bug remains.
- **Other pages completed and explicitly reviewed today:** `eratosthenes-shadow.html`,
  `shelf-sag.html`, `pizza-area.html`, and `microwave-chocolate.html`. Their final designs,
  equations, responsive checks, and source notes are recorded in the page-specific entries
  below. All four are on the reviewed-only homepage; no follow-up work is currently open.
- **Independent second-pass review, same day (Claude, after Codex's four completions above):**
  all four pages were re-checked from scratch — equations hand-traced and diffed against live
  computed output, STYLE_GUIDE.md token/skeleton compliance, copy read for typos/unsourced
  claims, and in-browser console/overflow checks at desktop and 375px widths.
  `eratosthenes-shadow.html`, `pizza-area.html`, and `shelf-sag.html` held up with no changes
  needed. `microwave-chocolate.html` had two real hero-label collision bugs the first pass
  missed (see that page's entry below for detail) — fixed in commit `10f16e6`, pushed to
  `main`. All four are confirmed publish-ready as of this update.

## Previous handoff — 2026-08-17

- **`index.html` now only lists pages marked "reviewed and complete" in this file.** At
  Simon's request, the homepage's category grids (Everyday maths / Discoveries / Fun physics)
  were cut down to reviewed pages only. Eight are currently reviewed: `horizon-distance.html`,
  `shelf-sag.html`, `pizza-area.html`, `earth-moon-race.html`, `eratosthenes-shadow.html`,
  `straw-hose-flow.html`, `microwave-chocolate.html`, and `potato-trajectory.html`. The initial change removed the
  other ~45 built-but-not-yet-reviewed pages' cards entirely (not commented out; they're
  still fully built and still linked from `tracker.html`, just not surfaced on the public
  index until reviewed). Category counts, the results-count default text, and the topbar's
  "N equations" count were all updated to match. The three-card Featured section was left
  as-is. **When a page gets marked reviewed and
  complete going forward, add its card back to the relevant category grid in `index.html`**
  (copy the pattern from one of the four current cards) — this is now a required step, not
  optional, since the homepage is the reviewed-only source of truth. The icon `<symbol>`
  sprite at the top of the file was left untouched (all ~48 icons still defined, most just
  unused for now) since removing them was pure churn with no visible benefit.
- **`pipe-flow-reference.html`** (root level, 2026-08-18) is a new internal reference doc —
  not a visualization, not linked from `index.html`'s public grid, not in `tracker.html`.
  Written after the water turbulent-flow fix above, as a working decision tree for which
  pipe-flow formula applies (Hagen–Poiseuille vs. Darcy–Weisbach vs. isothermal compressible
  vs. Fanno flow), with a live-status table of which formula each straw/hose page actually
  uses today. It also **pins the open bug found the same day in
  `straw-hose-flow-darcy.html`**: the isothermal compressible model chokes at
  Ma=1/√γ≈0.845 for air, but the page reports results past that (confirmed Mach 1.49 at
  short-length/wide-diameter/max-pressure) without flagging that the number is physically
  invalid there, not just imprecise — the existing "Mach≥0.3, use Fanno flow" copy undersells
  it. Simon deferred that fix for the day; **check `pipe-flow-reference.html`'s "Applied on
  this site" table before starting on it**, since the exact repro and the fix approach
  (detect/flag choking explicitly rather than reporting past it) are recorded there, not just
  in chat history. Update that table's status column whenever a formula changes on either
  straw/hose page, the same way this file's own per-page entries are kept current.
- **`visualizations/straw-hose-flow-darcy.html`** is an experimental, not-yet-reviewed
  duplicate of the completed straw/hose page. It replaces the invalid fixed-flow
  Hagen&ndash;Poiseuille air calculation with a low-Mach compressible Darcy&ndash;Weisbach solver:
  mouth pressure is the input and achievable airflow is the output. It iterates the Darcy
  friction factor from Reynolds number, reports flow regime/exit velocity/Mach number, and
  flags Mach&nbsp;0.3+ combinations as requiring full Fanno flow. It is linked from
  `unreviewed.html` as page 49 and tracked in `tracker.html`; do not add it to the reviewed
  homepage until its model and presentation receive a fresh review.
- **`visualizations/starlight-spectrum.html`** ("Starlight has a barcode") — new page 46,
  added to **Discoveries** on `index.html` and `tracker.html`. Built directly to the
  [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton, no earlier draft; picked from three pitched
  ideas (rocket science, Coriolis effect, spectroscopy) via user choice.
  - **Equation**: the Rydberg formula for hydrogen's Balmer series,
    `1/λ = R(1/2² − 1/n²)`, computed live (not hardcoded per-line) so the n=3..9 slider
    sweeps smoothly from Hα (656 nm, red) toward the series limit (364.6 nm) as n grows —
    the note states the 364.6 nm limit explicitly and explains why the slider stops at n=9
    rather than claiming arbitrarily high n stays visible.
  - **Hero, two panels**: a schematic (explicitly not energy-accurate, evenly-spaced rows —
    same "not to scale" honesty pattern as `eratosthenes-shadow.html`'s zoom panel) hydrogen
    energy-level diagram with a colour-coded arrow from the slider's n down to n=2, beside an
    **emission**-style spectrum bar (bright single line on black, like a gas-discharge tube)
    at the computed wavelength — both driven by one `wavelengthColor()` function so the arrow,
    the line, and the result readout are always the same colour.
  - **Second section, deliberately extending the skeleton**: a star picker (Rigel/Sirius
    A/Sun/Betelgeuse, spanning B/A/G/M spectral types) shows an **absorption**-style spectrum
    (dark lines on a full rainbow) for seven real elements/molecules at their real vacuum
    wavelengths, with per-star relative line strengths. The note states directly that these
    strengths are a qualitative illustration of the real Morgan–Keenan OBAFGKM classification
    pattern (Balmer lines peak near A0, Ca II peaks in G/K, TiO bands only in M), not measured
    equivalent widths — the underlying physical trend is real, the exact 0–1 numbers are not
    sourced to a specific spectral atlas. Element legend rows dim/highlight the matching lines
    on hover, reusing `earth-moon-race.html`'s lane-dimming pattern.
  - Verified in-browser: both panels' colours match their computed wavelength, star switching
    updates the metadata line and every element's strength label, the n slider works via both
    drag and arrow-key input, and the theme toggle alternates correctly in both directions.
  - `index.html`'s header count, results count, and the Discoveries section count were bumped
    to 46/Eighteen; `tracker.html`'s `PAGES` array was updated to match.

## Previous handoff — 2026-08-16

---

**Same session, continued** — the other two of the three pitched ideas were built right
after `starlight-spectrum.html` above, both added to **Discoveries** (now 20 pages, site
total 48):

- **`visualizations/newtons-cannonball.html`** ("Orbit isn't up. It's sideways.") — page 47.
  Real two-body Kepler orbital mechanics (not a scripted arc): given a launch speed slider
  (0–12 km/s, tangential, from a fixed 300 km altitude), the page derives the resulting
  conic section analytically from specific energy and angular momentum (`ε = v²/2 − μ/r`,
  `e = √(1 + 2εL²/μ²)`, `a = −μ/2ε`), classifies the launch point as periapsis or apoapsis
  depending on whether `v ≥ v_circ`, and samples `r(ν) = p/(1+e·cos ν)` to draw the actual
  crash arc, ellipse, or hyperbola. This is literally Newton's 1687 cannonball diagram,
  computed for real rather than illustrated. One real bug caught during testing: right at
  escape velocity, floating-point noise made `ε` read as a tiny *negative* number instead of
  ≈0, so the escape case was misclassified as an almost-infinite bound ellipse (a 10.9-year
  orbital period). Fixed with a `-50 m²/s²` threshold on ε (small vs. its ~1e7–1e8 scale, far
  above float noise) — the "Escape Earth" preset was also switched from a hardcoded speed to
  the runtime-computed `v_circ·√2`, since the hardcoded value happened to round to just under
  the true escape speed for this altitude.
- **`visualizations/coriolis-effect.html`** ("Straight lines that don't stay straight") —
  page 48, directly answering the pitched idea's own question ("is it something you can test
  easily at home?"). Two-panel hero (user-triggered "Roll the ball" animation, left panel
  fixed/inertial view with visibly spinning disc, right panel co-rotating view where the same
  straight-line motion traces a curve) demonstrates *why* the effect exists before any numbers
  appear. Quantitative section uses the standard small-deflection formula
  `y ≈ Ω sinφ · d²/v` against a four-item scenario picker (bathtub drain, thrown baseball,
  naval gunfire, the WWI Paris Gun) spanning negligible→historically-documented. **A real
  scoping catch during drafting**: an initially-planned fifth scenario (hurricane-scale wind
  over 500 km) produced a computed deflection *larger than the distance travelled* — the
  formula assumes the sideways drift is a small correction to an otherwise-straight path,
  which breaks down completely at the hurricane/ocean-gyre scale where Coriolis doesn't
  nudge the path, it *is* the reason the path spirals (needs full geostrophic-balance fluid
  dynamics, out of scope for one equation). Rather than show a bogus number, that scenario
  was dropped from the picker and the distinction is explained qualitatively in the note
  instead. The note also directly cites Wikipedia's own documentation of the bathtub-drain
  myth rather than just asserting it's false.
  - Both pages verified in-browser (console, live computed values against hand-calculated
    physics, preset behaviour, theme toggle both directions). The `requestAnimationFrame`
    loops in both hero animations could not be visually screenshotted in this session's
    preview tooling (confirmed via a plain rAF counter test that it never ticks in a
    non-displayed pane) — this is a tooling limitation shared by every animated page on the
    site already (`straw-hose-flow.html`, `earth-moon-race.html`), not specific to these two;
    the underlying transform math was verified independently by direct computation instead.

- **Next-session reminder for Simon:** complete the Cloudflare dashboard steps in
  `CLOUDFLARE_SETUP.md` (create/run the D1 migration, bind `FEEDBACK_DB`, add the
  `FEEDBACK_HASH_KEY` secret, route `hello@madeclear.ca`, and redeploy) before testing the
  new feedback form in production.
- The site currently contains **45 visualization pages** in `visualizations/`, plus a new
  `about.html` at the repo root (not a visualization — no equation/sliders — so it's not in
  `index.html`'s grid or `tracker.html`'s `PAGES` array; it's linked from the homepage
  footer instead).
- `index.html` lists all 45 pages and now includes client-side search plus category
  filtering (`Everyday maths`, `Discoveries`, `Fun physics`). The result count is live and
  the filter is intentionally dependency-free.
- `tracker.html` now tracks all 45 pages. Keep its `PAGES` array synchronized with the
  homepage when adding or removing a visualization.
- **`about.html`** ("Why this site exists") — new root-level page telling the site's own
  origin story: the *Taskmaster* Tim Vine straws-vs-hose bit that became
  `straw-hose-flow.html`, generalized into why every page since follows the same
  play-first format. Reuses `index.html`'s shell (tokens, topbar, theme toggle, footer) at
  a narrower 760px prose width instead of the topgrid/hero/resultrow skeleton, since it has
  no equation or interactive figure. Linked from `index.html`'s footer ("Why this site
  exists").
- **`visualizations/potato-trajectory.html`** ("Throwing a potato into a hole") — card 45
  under **Fun physics**. **Reviewed and complete as of 2026-08-17** — Simon called this page
  out as the model for what the site should be ("fun, interactive simple physics explained")
  and it went through a follow-up tuning pass after the initial build (see below); no open
  items remain. Standard no-drag projectile motion (`x=v₀cosθ·t`, `y=h₀+v₀sinθ·t−½gt²`),
  three sliders (release height **0.5–1.5 m**, launch angle **0–75°**, speed 1–10 m/s)
  against a **fixed target**: a hole 3.00 m away, **20 cm wide** (an assumed tolerance,
  stated as such), landed on by a 200 g potato (mass used only for the impact-energy stat —
  without drag it never affects the trajectory itself, which the note says explicitly so the
  fixed third slider-looking constant doesn't read as load-bearing physics it isn't). Direct
  sibling of `straw-hose-flow.html`: both trace back to the same *Taskmaster* "get an object
  to a target" format, cross-linked from each page's closing note and from the new
  `about.html`.
  - **2026-08-17 tuning pass, four rounds of feedback:** (1) release-height range narrowed
    from 0–2 m to 0.5–1.5 m and max angle from 85° to 75°, plus tighter chart padding above
    the apex and a smaller `.hero` top margin, all to cut down page-height reflow while
    dragging sliders (the SVG's `viewBox` height tracks the current trajectory's apex, so a
    wide height/angle range made the page visibly jump during a drag); the "Straight in" and
    "The lob, same hole" presets used `h₀=0`, now out of range, so their speeds were
    recomputed by bisection for `h₀=0.5` (5.02 m/s and 6.57 m/s) to keep landing exactly on
    the hole. (2) Hole narrowed 30→20 cm wide. (3) Added an "Energy to launch it" panel
    (`KE=½mv₀²`, angle/height-independent — confirmed live in-browser that the number holds
    steady while dragging the angle slider) with an estimated average force (energy ÷ an
    assumed 0.6 m arm-swing distance, flagged as a rough estimate) and two fun comparisons
    against gravitational PE (`mgh`) figures for a 4 kg cat climbing a 3 m tree and a 70 kg
    adult stepping onto a 45 cm chair — a second note paragraph gives both equations, the
    comparison assumptions/sources, and flags that these are mechanical work numbers, not
    calories (muscle is ~20–25% efficient). (4) Diagram line contrast was weak in dark mode
    (`--line2`, meant for thin UI hairlines, is low-contrast against the dark-navy bg); added
    a dedicated `--diagram` token (`#8A8270` light / `#7C88A8` dark) for the ground line,
    trajectory path, h₀ line, and hole outline, with stroke widths bumped ~0.25–0.5px. Also
    added a concrete drag-effect number to the first note paragraph (a 6 cm-sphere, Cd=0.47
    numerical sim of a 1 m/45°/5 m/s throw lands ~3 cm short of the no-drag distance, under
    1%) instead of just asserting drag is negligible.
  - **Dynamic hero axis, both dimensions share one scale.** The horizontal domain
    recomputes each render as `max(hole+1.5, landing×1.15, 5)` m so the view zooms to fit
    whatever the current slider combination actually produces — tight around the hole for
    a well-aimed throw, wide enough to show a wild overshoot without clipping it. Height
    domain follows the same idea off the release height/apex. Critically, both axes use the
    *same* px-per-metre scale (not independently stretched), so the parabola on screen is
    the true shape of the throw, not a squashed schematic — this matters more here than on
    most pages since the arc's shape (not just its endpoint) is the thing being shown.
  - **Throw is a user-triggered playback, not an auto-looping or slider-linked animation.**
    Matches `lightning-distance.html`'s "play it out" button pattern rather than
    `pendulum-period.html`'s auto-playing loop: the static trajectory, landing marker, and
    hit/miss verdict all update live while dragging sliders, but the animated potato only
    moves when "Throw" is pressed, at a fixed 0.6× real-time rate (stated in the note) since
    some slider combinations land in well under half a second at full speed. Any slider
    change resets the throw back to "▶ Throw" at the release point. No `prefers-reduced-
    motion` branch was needed under the site's own rule for this shape of animation — it's
    the explicitly user-initiated/bounded case the style guide says to leave alone.
  - **Two presets ("Straight in" 45°/5.43 m/s and "The lob, same hole" 70°/6.76 m/s) land at
    exactly the same 3.00 m**, computed from the real range identity
    `R=v₀²sin(2θ)/g` rather than tuned by eye — this demonstrates a genuine, non-obvious
    property of the equation (complementary angles on level ground share a range) rather
    than just being two more example throws. Both presets deliberately use `h₀=0`, since the
    complementary-angle identity is only exact on level ground; adding release height would
    have made the "same hole" claim slightly false. Two more presets ("Too flat", "Too
    gentle") show a real overshoot and undershoot for contrast.
  - **The result gauge is a target zone, not a single limit line** — a departure from every
    other page's gauge (straw-hose's mouth-limit line, eratosthenes' single reference tick):
    a highlighted band spans `hole ± 15 cm` and the landing-distance marker either falls
    inside it (verdict "In the hole!", `--fg`) or outside it (verdict "Short"/"Long",
    `--bad`), since this page's whole point is a target window, not a pass/fail threshold or
    a "how close" percentage.
- `index.html` and `tracker.html` have visible `:focus-visible` keyboard outlines.
- All 44 visualization pages now end with the same private clarity-feedback component:
  `Yes` / `Almost` / `Not yet`, plus an optional comment. The canonical implementation is
  in `visualizations/straw-hose-flow.html` and is documented in `STYLE_GUIDE.md`.
- Cloudflare Pages feedback infrastructure lives in `functions/api/feedback.js`, with the
  D1 schema in `migrations/0001_feedback.sql`. One-time dashboard steps are documented in
  `CLOUDFLARE_SETUP.md`; the required binding/secret names are `FEEDBACK_DB` and
  `FEEDBACK_HASH_KEY`.
- Feedback is private (there is no read endpoint), stores no email or raw IP address, and
  uses a daily HMAC key to update rather than duplicate a visitor's response to one page.
  Turnstile was deliberately deferred to preserve each page's no-external-dependency rule.
- The homepage and all visualization pages now use `hello@madeclear.ca` and disclose that
  the site is designed and maintained by Simon using AI-assisted development. The email
  alias is not live until Simon creates the Cloudflare Email Routing rule.
- No tipping link was added. Stripe Payment Links in CAD was recommended as the best neutral
  option, with Ko-fi as the friendlier alternative; Simon has not selected/configured one.
- Local checks completed after the latest changes: all 44 pages have exactly one feedback
  section, three rating choices, one private form, balanced HTML structures, valid inline
  JavaScript, and no dead feedback/coffee placeholders. Desktop and 390 px mobile layouts
  were browser-checked. The Pages Function passed stubbed valid-POST/D1-write and non-POST
  tests; the D1 migration executed successfully in SQLite. `git diff --check` passes.
- The Cloudflare dashboard, D1 database, email route, production deployment, and production
  form submission have **not** been changed or tested. Those are the next-session steps.
- That feedback-system work (the bullet above and the four above it) was committed at the
  time; the working tree is clean as of this handoff. The most recent commit
  (`249564d`, "Add about.html and a potato-into-a-hole trajectory page") is **local only —
  one commit ahead of `origin/main`, not yet pushed.** Codex should start with `git status`
  and `git log` to confirm current state before making changes.
- There is no build step or test runner. Validate changes by opening the affected HTML files
  directly in a browser and running the local link/count checks when index or tracker data
  changes.
- Before handing work to the other coding agent, update this section with the current state,
  decisions, open questions, and exact files changed. Then commit or at least leave a clean,
  inspectable diff; the other agent should start from the same working directory and run
  `git status`/`git diff` first.

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
    ├── eratosthenes-shadow.html  # Earth's diameter from two shadows
    └── ...                       # forty-two pages in all; see index.html for the full list
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

Shows six things crossing the real Earth–Moon distance (384,400 km) at their real speed:
light, NASA's Parker Solar Probe, speed of sound in water, a rifle bullet, speed of sound
in air, and a commercial jet.

**Reviewed and complete as of 2026-08-17.** One of the original pages, revisited across
several rounds of feedback (all in the entry below): the d/v legend table, sourcing every
speed, and the zoom mechanics went through two further passes after the initial overhaul —
(1) sound removed from the full-scale overview (only light + Parker move enough there to be
worth showing; sound stayed in the zoom ruler) and Parker's overview line moved right under
light's, and (2) the "Light's position" readout was dropped entirely (cumulative total
distance is now the only result panel) and the zoom callout was redrawn as a full frame
around the whole magnified ruler — title centered at its top, a magnifying-glass icon at the
top-left, straight funnel lines from the small to-scale box into the frame's corners — since
the user's original ask ("make the zoom box more clear") turned out to be about the visual
composition, not the caption text. No open items remain.
**2026-08-17 overhaul, one of the original pages, several rounds of user feedback:**
- **Legend rebuilt as a d/v table.** Rows now show a `d`/`v` variable column (not just a
  colored letter + name + value) so each row visibly ties to the `t = d/v` equation above
  it — a shared `d` row (`384,400 km`, Earth–Moon distance) sits above six `v` rows ordered
  fastest→slowest. Hovering any row now recolors the matching `d`/`v` term in the equation
  (new `data-k` attributes on the `<em>`s), in addition to the existing lane-dimming.
- **Added speed of sound in air (343 m/s) and water (1,481 m/s)** as two more travellers,
  in both the zoom ruler and (per the user's choice) the full-scale overview. Sound in
  water is genuinely faster than the rifle bullet (1.48 km/s vs 1 km/s) — called out
  directly in the note as a fun, checkable fact.
- **Zoom box redrawn to true scale.** It was a fixed 32×22 px box irrespective of what it
  represented; it's now sized from the actual px/km of the full-scale track (5,000 km ×
  0.00255 px/km ≈ 12.8 px), so its own sliver-thin width is part of the honest picture, not
  a schematic placeholder. Bumped from 1,500 km to 5,000 km (~1.3% of the trip) at the
  user's request. Also given an accent fill/stroke (was a plain gray dashed outline) and an
  explicit "~81× magnified" caption for stronger visual framing, per user feedback that the
  old box didn't read clearly as a zoom.
- **Three faint lines added beneath light's own bounce on the full-scale track** — Parker,
  sound (water), sound (air) — each with a tiny creeping marker and live km readout. At
  normal 1×–8× speed they're indistinguishable from stationary; only Parker visibly crawls
  across within a session even at 32×. This is deliberate: it's the visual argument for why
  the zoom exists, requested directly by the user ("add lines under the speed of light").
- **New cumulative-distance panel**, kept alongside (not replacing) the existing
  bounce-resetting "light's position" readout per the user's choice of the smaller-scope
  option. Tracks total km light has crossed since t=0 (`simSeconds × c`, monotonic, ignores
  the bounce direction) against a log-scale gauge with Moon/Mars/Jupiter/Saturn milestones.
  Mars/Jupiter/Saturn are each planet's **average distance from the Sun**, not from Earth —
  stated explicitly in the note, since mixing that with the Earth-relative Moon distance
  would otherwise misleadingly imply light is headed toward those planets from here; it's a
  size-of-number benchmark only. Fixed one real bug during testing: alternating tick labels
  by even/odd index (the pattern used elsewhere on the site) left Mars and Saturn's labels
  overlapping in the narrower result column, since both landed on the "odd" row while sitting
  close together on the log scale — replaced with an explicit per-milestone row (`ROW_TOP`)
  instead of alternation, verified at 32× playback over a real ~2 hour run.
- **All speed/distance figures now sourced** in a dedicated note paragraph: Moon distance
  (NASA Space Place), Parker's record speed (NASA, Dec 2024 perihelion), rifle muzzle
  velocity (Wikipedia), airliner cruise speed (Boeing 747-8), speed of sound in air (NASA
  Glenn) and water (Engineering ToolBox), and the Mars/Jupiter/Saturn light-minute figures
  (NASA Goddard). Previously only light speed and the Parker caveat were sourced inline.
- Verified in-browser across light/dark mode, mobile width (375px), and a real long-running
  32× session (Light's position readout occasionally renders with a font/glyph artifact
  specific to this session's headless screenshot tool — confirmed via computed-style
  inspection to be a rendering-only quirk, not a real transform/CSS bug).

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

**Reviewed and complete as of 2026-08-17.** A follow-up pass (after the correctness/a11y
sweeps below) sourced the mouth-pressure limits and fixed a gauge-label collision:
- The suck/blow (PImax/PEmax) limits were previously asserted as "rough estimates" with no
  citation. Now cited to [clinical maximal mouth-pressure
  measurements](https://pmc.ncbi.nlm.nih.gov/articles/PMC4001942/), with the note stating
  explicitly that sucking and blowing are *not* the same limit — adults typically manage
  ~10 kPa sucking (PImax) vs. ~20 kPa blowing (PEmax), since exhale muscles are stronger
  than inhale ones, which is why air's limit was already set higher than the three liquids'.
- The `.gauge .limitlabel` ("mouth limit") moved from `top:0` (level with the marker label)
  to below the axis (`top:47px`, `.gauge` height 56→66px), the same collision fix already
  used on `shelf-sag.html`/`bike-gears.html` — previously it could visually merge with the
  pressure-marker label whenever a result landed close to the limit.
- The gauge is log-scale (9 decades, `LOGMIN=-1`/`LOGMAX=8`); this is now stated in the note.

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
- **2026-08-18 physics fix (Claude): water's turbulent-flow edge case.** The page's
  Hagen–Poiseuille formula is only valid for laminar flow (Re≲2,300); comparing it against
  `visualizations/straw-hose-flow-darcy.html` (built to fix air's compressibility issue)
  prompted checking Reynolds numbers for the liquid presets too. Honey and milkshake stay
  laminar (Re well under 15) across the entire slider range, so they're unaffected — but
  water crosses Re≈4,245 at the diameter slider's narrow end, past the point where the
  laminar formula is valid; the live page was silently extrapolating it there. Fixed in
  `a8f3fa1` by switching liquids' `pressureFor()` to general Darcy–Weisbach with a
  Reynolds-dependent friction factor (`f=64/Re` laminar, a smooth-pipe turbulent correlation
  above Re=4,000, blended in between) — algebraically identical to Hagen–Poiseuille below
  Re=2,300 (verified honey/milkshake output is byte-identical before/after), so only water's
  narrow-diameter extreme actually changes: ~1.06 MPa instead of the previous ~402 kPa at
  L=10 m, D=1.5 mm. Air is deliberately left on the original laminar-only formula — its
  larger, separate problem is compressibility (density changing along the tube), which a
  friction-factor correction alone doesn't fix; that's what the experimental Darcy variant
  page is for. Added an honest in-page flag ("turbulent flow, Re≈…") in the effort-line
  whenever the current slider combination leaves the laminar regime the displayed equation
  illustrates, plus an explanation in the note paragraph, rather than silently changing the
  number without disclosure. **Lesson:** density (ρ) was added to each `LIQ` entry for this,
  but only water's value is actually load-bearing under the current slider ranges — worth
  rechecking this analysis if the diameter/length slider bounds ever change, since a wider
  range could push milkshake or honey into turbulent territory too.

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

**Reviewed and complete as of 2026-08-18.** Added to the reviewed-only homepage and removed
from `unreviewed.html` after the final interaction and diagram pass.

Built directly to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton (2026-08-14), no earlier
draft. Implements Eratosthenes' circumference method: `C = 360°·d/Δθ`, with diameter
reported as `D = C/π`. Here `d` is the distance between two sticks on the same meridian and
`Δθ = |θ₂ − θ₁|` is the difference between their shadow angles at solar noon.

- **Three sliders** drive the equation directly: distance (`d`: 100–2000 km) plus separate
  stick angles (`θ₁` and `θ₂`: 0–20°). Equal angles are handled explicitly instead of
  dividing by zero.
- **Hero diagram, two panels in one SVG**: a small full-Earth globe inset (left) with the
  current `Δθ` shown as a highlighted wedge beside a larger schematic ground-level scene
  (right) — two vertical sticks, individual sun-ray guides and shadows, and a visibly curved
  Earth surface. The zoomed panel is
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
- A field log lets visitors enter date/time, coordinates, and angle measurements. Entries
  persist only in that browser's `localStorage`; a ShadeMap link supports testing locations
  and times.

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
  - **Not reviewed/complete as of 2026-08-17** (explicitly flagged by Simon — needs more review before
    it's treated as finished, unlike the four pages marked reviewed and complete elsewhere in this
    file). A 2026-08-17 pass fixed the same gauge-label collision as the other pages, added
    light-crossing-time/loudness/pitch result lines, and added a mirrored frequency-spectrum chart
    (source spectrum vs. distance-attenuated spectrum) using three published dB/km figures at 1/2/4
    kHz interpolated log-log, rather than the full ISO 9613-1 formula (which didn't reproduce
    published reference values when checked numerically — see the git log for that session's detail).
    That's a lot of new content added in one session without a fresh-eyes pass; treat it as
    provisional until reviewed again.
- **`braking-distance.html`** ("Why speed quadruples your braking distance") — `d = v²/(2μg)`, with speed, surface, perception–reaction-time, and vehicle-mass controls in a compact laptop 2×2 grid. Mass deliberately changes kinetic energy but not distance in the tire-friction-limited model. The car animation uses a two-phase tween (linear during reaction, quadratic ease-out during braking); its earlier 105 m pitch marker was removed to keep the hero focused. A single full-width chart directly below combines speed and kinetic energy over distance and exposes exact distance/speed/energy values on pointer hover. Results separate reaction distance, braking distance, total stopping distance, and dissipated energy. The distance-comparison sentence (50 m Olympic pool / 105 m pitch / 400 m track lap) sits **below** the gauge, not above it.
  - **Recurring placement rule, decided 2026-08-18:** real-world comparison text belongs below the gauge/bar/axis it explains. Putting it above the scale repeatedly made it compete with the headline result and read as detached metadata. This is now also recorded in `STYLE_GUIDE.md`; preserve that order on future pages.
- **`rocket-equation.html`** ("Why one more passenger costs so much fuel") — Tsiolkovsky `Δv = vₑ·ln(m₀/mf)`, log-scale mass-ratio slider (1.1–30) + engine pill-picker (solid/kerosene-LOX/hydrogen-LOX/ion). Gauge marks 9,400 m/s as the Δv needed to reach LEO (includes gravity/drag losses, not just orbital velocity). Ion drive is hard-coded to always show "Can't launch." regardless of its Δv number, since real ion engines can't produce enough thrust to lift off a planet even though their high exhaust velocity makes the raw Δv figure look sufficient — a case where the honest caveat had to override the naive gauge comparison.
- **`keplers-third-law.html`** ("Why Mercury's year is 88 days") — simplified solar-system form `T = a^1.5` (T in years, a in AU), sourced from the general `T² = 4π²a³/GM` and stated as such in the note. Log-scale semi-major-axis slider (0.2–50 AU), 9 presets (8 planets + Pluto). Gauge places the current period among real planets' periods on a log scale rather than using possible/impossible framing.
- **`ocean-salt.html`** ("Draining the ocean's salt onto dry land") — `h = m/(ρ·A)`, m=4.725×10¹⁹ kg (ocean salt mass, fixed) and ρ=2,170 kg/m³ (rock salt density, fixed) both constants, single interactive variable is a 4-option area pill-picker (world land/USA/Texas/France) since the picker itself already serves as the "try real values" mechanism — deliberately has no separate presets row, noted as intentional in-page. World-land case (~146 m) roughly matches the commonly-cited "~500 ft" trivia figure. Hero uses a log-scale vertical axis (depths span 146 m–39 km depending on area) with reference lines (Eiffel Tower, Burj Khalifa, Everest, cruising altitude).

All six were added to `index.html`'s main grid (numbered 07–12) and removed from the roadmap list in the same edit.

### Correctness sweep (2026-08-14, after the six-page batch)

A full review of all twelve pages plus `index.html`. Fixes applied:

- **Missing document head, all 13 files.** None had a doctype, charset, viewport, or `lang` —
  so every page rendered in quirks mode, all mobile CSS/`geom()` breakpoints were dead, and
  the raw UTF-8 characters in the JS string literals were one missing HTTP header away from
  mojibake. The required four-line head is now documented in
  [STYLE_GUIDE.md](STYLE_GUIDE.md#required-document-head); start every new page with it.
- **`gravity-lab.html`: the Earth + Moon preset was wrong by 5×.** `m2` was `10^22.17`
  (1.48×10²² kg) instead of the Moon's 7.34×10²² kg (`10^22.866`), so the page reported
  4.1×10¹⁹ N against a true 1.98×10²⁰ N. All three presets now carry 3-decimal exponents, and
  the sliders were raised from 2 to 3 decimals to match — at 2 dp a log10 exponent can't
  resolve better than ~2%, so the presets literally could not land on the real values without
  desyncing the thumb from the readout (the same failure mode recorded under
  `eratosthenes-shadow.html`). Earth+Moon and Earth+Sun now both land within 0.2%.
- **`mass-energy.html`: the "100 kg" preset printed `8.99e+3 PJ`.** `fmtEnergy` stopped at PJ,
  and `toPrecision(3)` flips to exponential notation once the exponent reaches the precision —
  so it rendered scientific notation nested inside an already-scientific unit. Added EJ and ZJ
  buckets (1 kg alone is 9×10¹⁶ J and the slider reaches 1,000 kg). The "coin" preset was also
  100 g; now 7.9 g.
- **`planet-light-delay.html`: the Sun used the wrong reference frame.** Its speed was 220 km/s,
  the Sun's orbit around the *galactic centre* — but Earth is carried along with that, so it
  cancels and can't produce apparent drift. Every other object uses a speed relative to Earth
  (which is what the legend row claims). Now 29.78 km/s, Earth's own orbital speed. The note
  and the Sun's result line both explain the frame explicitly, since this is exactly the kind
  of thing that looks like a bigger, more impressive number if you don't think about it.
- **`rocket-equation.html`: presets named after real vehicles carried invented mass ratios.**
  "Saturn V, 1st stage" used R=10 → 6,908 m/s, when the S-IC's real 2,970 t → 893 t gives
  R=3.33 → 3,609 m/s. "Dawn" used R=2.2 → 23,654 m/s against its real R=1.54 → 12,953 m/s.
  "Shuttle main engine" is an *engine*, not a stage, so no mass ratio is well-defined for it at
  all — replaced with the Centaur upper stage (23.2 t / 2.25 t, R=10.3). The corrected Saturn V
  number is also a better story: one stage buys a third of the way to orbit, which is why it
  needs two more above it.
- **`horizon-distance.html`**: the note bounded the h² error "well under 1% even at airliner
  altitude" but the slider runs to 500 km and the ISS preset sits at 408 km, where the figure
  reads ~2% low against the sight line and the along-the-ground distance is 3% shorter again.
  The note now states which distance `d` is and gives the numbers at the top of the range.
- **`ocean-salt.html`**: removed a dead `ticksG.appendChild.bind(ticksG);` statement and two
  unused arrays; `buildStaticHero()` was tearing down and rebuilding all tick/reference DOM on
  every animation frame and is now gated on width; the rAF tween now parks itself when it
  lands instead of holding a frame callback open for the life of the page.
- **`keplers-third-law.html`**: the subtitle's "only about 78 times farther out" is measured
  from Mercury, not Earth, which wasn't stated; reworded and the 690× period ratio added.

Known, **not** fixed at this point (see the review notes for detail): sliders declare
`role="slider"` but set no `aria-valuenow`/`valuemin`/`valuemax`/`valuetext`; only
`earth-moon-race.html` honours `prefers-reduced-motion`; and the `← Physics you can see` back
link 404s when a page is published standalone as an Artifact. **All three were fixed in the
next pass — see below.**

### `index.html` migrated to the style guide (2026-08-14)

The index was the last page still on the original pre-migration look (near-black `#0b0d10`
background, its own `--light`/`--teal`/`--blue` token set, no theme toggle) — the one page
that didn't match, and the first one anyone sees. Rebuilt on the shared tokens, type scale,
topbar and theme toggle, copied from `straw-hose-flow.html` rather than re-derived.

It's a listing page, so the `topgrid → hero → resultrow` skeleton doesn't apply; what carries
over is the token set, the serif/mono split, the topbar with its toggle, hairline rules with
no card chrome, and `--accent` reserved for hover. Two deliberate deviations, both noted in
the file: the `h1` is one step larger than a visualization page's (this is a cover, not a
figure caption), and `.wrap` is 1040px rather than 1320px since there's no wide hero to fill.

**A real bug surfaced while testing the migrated toggle, and it was in the shared pattern —
so all 13 pages had it.** `currentTheme()` read `localStorage` and fell back to
`prefers-color-scheme`. Where storage is *blocked* rather than merely empty — sandboxed
iframe, private browsing, blocked cookies — the `catch` leaves `stored` null on every call, so
the function keeps returning the system preference regardless of what the user clicked and the
toggle only ever moves one direction. Verified: in a storage-blocked context the old code went
dark→light→light→light; the fixed code alternates correctly. This matters because a sandboxed
iframe is exactly how these render when published as Artifacts, which is the site's stated
distribution channel. `currentTheme()` now reads the applied `data-theme` attribute first and
only consults storage for the initial load; fixed in all 13 files and in
[STYLE_GUIDE.md](STYLE_GUIDE.md)'s snippet, with the reasoning recorded there so the broken
version doesn't get copied into the next page.

### Accessibility pass: slider ARIA, reduced motion, and the back-link 404 (2026-08-14)

The three items left open by the correctness sweep above, all fixed in the same session.

- **Slider `aria-value*` attributes.** All ten custom sliders across the site (fourteen
  tracks total — `gravity-lab.html` and `straw-hose-flow.html` each have more than one) now
  set `aria-valuemin`/`aria-valuemax`/`aria-valuenow`/`aria-valuetext` inside the same draw
  function that already positions the fill and thumb, so they can't drift out of sync with
  what's on screen. For the log-scale sliders (`gravity-lab.html`'s mass/distance, which store
  a log10 *exponent* as state — see the gravity-lab fix above — plus `horizon-distance.html`,
  `keplers-third-law.html`, `mass-energy.html`, `rocket-equation.html`), `aria-valuenow` stays
  the raw slider value so it's numerically consistent with min/max, while `aria-valuetext`
  carries the real-world value and unit a screen reader should actually announce — reusing
  each page's existing `fmt*()` formatter rather than writing a second one. Full pattern in
  [STYLE_GUIDE.md](STYLE_GUIDE.md#component-patterns).
- **`prefers-reduced-motion`.** Previously only `earth-moon-race.html` checked it. Two shapes
  of animation needed it, treated differently:
  - Continuous, no-pause-control loops — the orbiting planet in `keplers-third-law.html`
    (which, unlike every other animated page, has no play/pause at all and was just spinning
    from page load) and the scrolling exhaust/flow dashes in `rocket-equation.html` and
    `straw-hose-flow.html` — now simply don't start their `requestAnimationFrame` loop under
    reduced motion. The page is still fully correct at rest; it just doesn't move on its own.
  - Bounded tweens triggered by interaction — the car easing along the road in
    `braking-distance.html` and the salt column easing to height in `ocean-salt.html` — now
    snap straight to the end state instead of easing over ~1.4s / ~12%-per-frame. `earth-moon-
    race.html`'s bouncing light and `lightning-distance.html`'s "play it out" button were left
    alone: those animations are the content the user asked to see by pressing play, not
    decoration layered on top of a static result.
  - `mass-energy.html`, `gravity-lab.html`, `horizon-distance.html`, `eratosthenes-
    shadow.html`, and `planet-light-delay.html` have no continuous or auto-triggered
    animation (confirmed: no `requestAnimationFrame` in any of them) and needed no change.
- **Back-link 404 on standalone Artifacts.** The relative `../index.html` link only resolves
  when the file is physically sitting in `visualizations/` next to the site index — true for
  the primary "open the file directly" use case, false when published standalone. Every page
  now checks `location.pathname` against `/\/visualizations\/[^\/]+\.html?$/i` on load; when
  it doesn't match, the link is repointed to the GitHub repo (`OttawaVisuals/Simple_Viz`,
  opened in a new tab) instead of staying dead. Deliberately not a `fetch` probe — `fetch` to
  a relative path from a `file://` page is blocked by CORS in Chrome, which would have broken
  detection on exactly the primary use case it needs to preserve. Verified: this browser
  tooling's own preview pane serves local files through a `data:` URL wrapper rather than real
  `file://` navigation, which happens to be a second real case the fallback correctly catches.

### `bike-gears.html` — "Same legs, different gear" (2026-08-15)

Built to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton, no earlier draft. `v = πD·(N_c/N_s)·f`
— wheel diameter times gear ratio times cadence. Three integer sliders (chainring 28–53t,
sprocket 11–36t, cadence 40–130 rpm) plus a four-option road picker (flat / 3% / 8% / 15%).
First page in the **Everyday maths** category; index card 04.

- **The result box shows a different quantity from the gauge, deliberately.** The big number
  is the equation's own output (speed in km/h); the gauge underneath measures what that speed
  costs — average tangential force on the pedal, against the rider's own body weight (736 N) as
  the reference line. That's the page's whole point: the ratio buys speed *by* dividing force,
  so showing only one of the two would hide the trade. Because the two differ, the gauge needed
  a caption of its own (`.gauge-label`), which straw-hose-flow's does not.
- **Force bands describe the push, not how long you could hold it.** An earlier wording ("an
  endurance pace you could hold for hours") was wrong: force is what the *gear* sets, but
  stamina answers to power, and the two come apart at different cadences — 268 N at 65 rpm is
  315 W, while the same 268 N at 90 rpm is 435 W. The bands were reworded to describe the push
  only, and the required crank power now prints beside the body-weight percentage so the honest
  picture is on the page.
- **Hero: two registers at two very different scales.** A magnified drivetrain (chainring,
  chain, sprocket, rotating crank) beside the road at true scale, with the bike as a small
  silhouette and a bracket showing how far one pedal turn carries it. Real geometry throughout —
  chain pitch 12.7 mm sets the tooth spacing, chainstay 410 mm the centre distance, 172.5 mm
  cranks. The two registers differ by about 10×, so they are joined by the site's dashed
  lens-box-and-fan-lines convention and the panel carries a computed "magnified 13×" caption.
  The panel's scale is fixed off the *largest* sprocket/chainring, not the current ones, so it
  doesn't rescale (and the magnification caption doesn't flicker) while a slider moves.
- **Three animation rates had to be faked, all for aliasing, none of them a displayed number.**
  The teeth are drawn at true pitch but held *still*: a chainring passes ~80 teeth per second,
  which at 60 fps reads as a slow backwards crawl. The crank arm carries the rotation instead
  and runs at the true cadence. Wheel spin is capped at 7 rev/s because three spokes can only be
  read unambiguously below about half a spoke-spacing per frame. Chain-link speed is scaled to a
  quarter of real, for the same reason as the teeth. Everything actually *stated* on the page is
  exact.
- **The gauge's limit label sits below the axis, not above it** like straw-hose-flow's. The
  marker pins to the right-hand end whenever the gear is unturnable, which is precisely when its
  own label would land on top of the limit label; moving one to the row under the ticks
  separates them for good rather than clamping around the collision.
- `.ctrl-title em` sets `text-transform:none`, deviating from straw-hose-flow, whose
  `.ctrl-title` uppercases its symbol. That is harmless for `η`/`L` but not here: it rendered
  `f` as `F` and `N_c` as `N_C`, contradicting the equation directly above. Worth copying the
  fix into straw-hose-flow (it currently shows `R` where the equation says `r`).
- Reference numbers: 700×25c wheel, rolling circumference 2,105 mm (D = 670 mm); chain pitch
  12.7 mm; cranks 172.5 mm; chainstay 410 mm, bottom-bracket drop 70 mm; 75 kg rider + 8 kg
  bike; C_rr 0.005; C_dA 0.35 m²; air 1.225 kg/m³; drivetrain efficiency 97%. Presets: steady
  cruise (50×17, 90 rpm, flat → 33.4 km/h, 216 W), sprinting flat out (53×11, 110 rpm, flat →
  66.9 km/h, 1,499 W, just over body weight), climbing a wall (34×32, 65 rpm, 15% → 8.7 km/h,
  315 W), and the wrong gear (53×11, 65 rpm, 15% → 1.98× body weight, "Can't turn it").

### `shelf-sag.html` — "A shelf that sags" (2026-08-15)

**Reviewed and complete as of 2026-08-18.** Added to the reviewed-only homepage and removed
from `unreviewed.html` after the off-centre-load, cross-section, and failure-model pass.

- Uses the simply supported, off-centre point-load equation
  `δa = Pa²(L−a)²/(3EIL)`, with sliders for load, span, and load position.
- Replaces the orientation buttons with a draggable rectangular cross-section selector for
  independent width `b` and height `h`; `I = bh³/12` updates live.
- The full piecewise deflection curve is sampled along the beam. Sag uses a fixed 12× visual
  magnification rather than a constant-size bow, so changing inputs visibly changes the curve.
- Adds `Mmax = Pa(L−a)/L` and `σmax = 6Mmax/(bh²)`. Beam regions above the representative
  6.03 MPa No. 2 SPF bending design value turn red and receive a break marker. The copy is
  explicit that this is a design comparison, not an exact fracture prediction.
- Laptop layout uses three equal columns: compact stacked sliders, cross-section selector,
  and results. Mobile returns to a single-column flow. General reading links use Wikipedia.

### `snells-law.html` — "Why the straw looks bent" (2026-08-15)

Built to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton, no earlier draft. n₁sinθ₁ = n₂sinθ₂.
One slider (angle of incidence, 0–90°) plus a 6-option picker covering both directions
through three material pairs — Air↔Water, Air↔Glass, Air↔Diamond, plus the reverse of each
(Water→Air, Glass→Air, Diamond→Air). Card 11, under **Discoveries**, after eratosthenes-
shadow.

- **One picker covers two different physical stories on purpose.** Light entering a denser
  medium (any Air→X pair) always refracts — that's the bent-straw case named in the title.
  Light exiting back into a less dense one (any X→Air pair) has a critical angle and can hit
  **total internal reflection**, which the "entering" direction can never produce. Rather than
  add a separate mode toggle, the six picker options just assign n₁/n₂ directly per pair, and
  the same physics formula handles both behaviours without any branching — TIR falls out
  naturally whenever sinθ₂ would have to exceed 1.
- **No animation, unlike most of the site.** The ray diagram is fully redrawn from state on
  every interaction; nothing plays on its own, so there was nothing to gate behind
  `prefers-reduced-motion` — same category as gravity-lab, mass-energy, eratosthenes-shadow,
  horizon-distance, and planet-light-delay per the correctness-sweep note above.
- **Medium 1 is always drawn on top, medium 2 always on the bottom**, regardless of which
  pair is selected — even for water→air, which draws water above and air below, the reverse
  of a real fish tank. This is deliberate: it's a schematic ray diagram (the standard
  textbook convention), not a literal scene, and re-orienting the artwork per pair would have
  added real complexity for no gain in clarity. Labels on each half state the material and
  its index directly so it's never ambiguous.
- **Real numbers**: air 1.00, water 1.333, crown glass 1.52, diamond 2.42 (approximate,
  visible light, room temperature — dispersion, the small wavelength-dependence that splits
  white light into a prism's rainbow, is named as unmodelled in the note). Critical angles
  computed live, not hardcoded, but check out against the well-known reference figures:
  water→air 48.6° (matches the number this page's roadmap entry had already named before it
  was built), glass→air 41.1°, diamond→air 24.4° — the last of these is a large part of why
  cut diamonds throw back so much light.
- `.ctrl-title em` carries `text-transform:none` from the start (see the bike-gears/
  straw-hose-flow r→R bug above) — checked and confirmed correct here (θ, not uppercased) as
  part of building the page, not a later fix.

### `pendulum-period.html` — "A swing keeps its own time" (2026-08-15)

Built to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton, no earlier draft. T = 2π√(L/g), the
small-angle pendulum period, deliberately shown with **no amplitude term at all** — that
absence is the whole point of the page. Two sliders (length 0.1–5 m, release angle 5–120°)
plus a gravity picker (Earth/Moon/Mars/Jupiter, real surface values). Card 15, under **Fun
physics**, right after straw-hose-flow.

- **The number shown and animated is not the equation above it.** The equation is the
  small-angle approximation; the readout and the swinging bob both use the *exact* period,
  found by integrating the pendulum's real equation of motion (θ″ = −(g/L)sinθ) rather than
  the formula. The two agree closely at small angles and visibly diverge past a threshold —
  which is the honest way to show that the small-angle formula is an approximation without
  ever putting a wrong number in the big readout.
- **That divergence threshold is computed, not guessed.** The exact/small-angle period ratio
  reduces to a complete elliptic integral of the first kind, K(sin(θ₀/2)), computed via the
  arithmetic–geometric mean (a few iterations converge to machine precision — no series
  truncation or lookup table). The angle at which the ratio first exceeds 1% is then found by
  bisection against that same relation, once, at script load — landed on 23°, close to the
  commonly-quoted "~23°" figure, but derived from the page's own formula rather than
  hardcoded, so it can't silently drift out of sync with it.
- **A genuinely animated pendulum**, unlike most of this site's static-per-render pages: the
  bob swings in real time via a small-step semi-implicit Euler integration of the exact
  nonlinear equation (8 substeps per frame), so a large-amplitude release visibly lingers near
  the top of its swing the way a real pendulum does — not a sinusoid scaled to amplitude. Real
  time, no compression needed: even the shortest/fastest case in the slider range (L=0.1 m,
  Jupiter's g) has a period of ~0.4 s, well within comfortable viewing speed.
- **Play/Pause/"Release again" controls**, copied from `earth-moon-race.html`'s playback
  pattern (`playing = !reduceMotion` at load, so it still starts moving for most visitors but
  respects reduced motion by defaulting to paused) — this is the "animation is the content"
  category from the style guide, not a decorative loop, since watching the swing *is* how the
  period-independence claim gets tested.
- **A same-day bug, caught in testing, not shipped**: `lblAmp` (and the same-shaped `lblPos`
  label on `terminal-velocity.html`, built right after) were positioned at a horizontal
  *centre* point with no `translateX(-50%)` centring transform — harmless for short text, but
  their actual contents ("±120° release angle", "Arms out · A=0.7 m² · C_d=0.62") are long
  enough to overflow past the right edge of a 375px viewport. Both fixed by adding the
  transform; worth checking any new `.lbl` overlay anchored at a *centre* x (as opposed to a
  true left or right edge) for the same issue before shipping.
- Presets: a seconds pendulum (L≈0.994 m, the real length that gives exactly T=2 s on Earth,
  historically used as a length standard), a playground swing (2.5 m, 60°), pushed too far
  (1 m, 118°, well past the 23° threshold), on the Moon (1 m, 30°, g=1.62).

### `terminal-velocity.html` — "Falling as fast as the air allows" (2026-08-15)

Built to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton, no earlier draft. v = √(2mg/(ρACd)).
One mass slider (40–120 kg) plus a 4-option body-position picker (arms out / feet-first /
head-down / under canopy), each with representative frontal-area and drag-coefficient values.
Card 16, under **Fun physics**, right after the new pendulum page.

- **The subtitle's real hook is that mass matters at all.** In a vacuum, acceleration is
  mass-independent (the textbook "everything falls at the same rate" result) — but drag
  depends on frontal area, not mass, while weight does depend on mass, so in air two people in
  the same position genuinely fall at different terminal speeds if one is heavier. The
  "heavier falls faster" preset (same arms-out position, 120 kg instead of 80 kg) makes this
  concrete: 195.6 → 239.6 km/h, same shape, same equation, only the mass changed.
- **Body-position numbers are back-derived, not measured**, same honest-value treatment as
  straw-hose-flow's viscosities: real, well-cited terminal velocities for an ~80 kg skydiver
  (arms-out ≈195 km/h, head-down ≈257 km/h) were used to solve for a plausible (A, Cd) pair
  reproducing that number, since individually-measured A and Cd for a human body in freefall
  aren't standardized figures the way, say, water's viscosity is. The note says so explicitly.
  A canopy-open comparison was added as the fourth option specifically because it's an
  order-of-magnitude change (≈20 km/h) rather than the ~30% spread between body positions —
  showing both scales of effect on one page was worth the extra picker option.
  Values used: arms-out A=0.70 m² Cd=0.62, feet-first A=0.50 Cd=0.72, head-down A=0.35 Cd=0.72,
  canopy A=25 m² Cd=1.7 (a modern ram-air canopy), air density ρ=1.225 kg/m³ fixed at sea
  level — the note states explicitly that this models the steady-state balance point only, not
  an actual skydive's descent through changing air density.
- **Airflow streaks are a continuous decorative loop** (no pause control), so — unlike the
  pendulum page built the same session — it follows the more common site pattern: gated behind
  `prefers-reduced-motion` at the top-level `if(!reduceMotion) rafId = ...` rather than
  defaulting to playing-but-pausable. The distinction matters: here the streaks only restate
  the already-shown numeric speed, so losing them under reduced motion costs nothing, whereas
  the pendulum's swing *is* the evidence for its own claim and needed to stay interactive.
- Same `lblPos` centring-transform bug described under `pendulum-period.html` above — fixed
  here too, in the same testing pass that caught it on the pendulum page.

### Categories, and a much longer roadmap (2026-08-15)

`index.html` now groups both the built pages and the roadmap under **three categories**,
proposed by the user: **Everyday maths**, **Discoveries**, **Fun physics**. Decisions worth
knowing before editing that file:

- **Three, not four.** A separate "scale" bucket (`ocean-salt.html`, and the queued animal-
  biomass idea) was considered and rejected — it would have been a one-page category next to a
  seven-page one. Scale-shock pages live under **Fun physics**, whose lede was widened to say
  so ("oddities *and quantities too big to picture*"). If scale ever reaches three or four
  built pages, splitting it back out is the obvious move.
- **The user's own examples anchor the taxonomy** and should not be re-litigated silently:
  bike gears → Everyday maths, speed of light → Discoveries, the straw → Fun physics. That is
  why `earth-moon-race.html` sits under Discoveries even though its payoff is magnitude rather
  than derivation.
- **The split is 5 / 8 / 4** (3 / 7 / 2 before `bike-gears.html`, then 4 / 7 / 2, then 4 / 8 / 2
  once `snells-law.html` landed ahead of `shelf-sag.html`, then 5 / 8 / 2, then 5 / 8 / 4 once
  `pendulum-period.html` and `terminal-velocity.html` landed). Fun physics catching up to
  Everyday maths is new — every prior update in this file noted Discoveries as the largest
  group, which is still true, but the gap has narrowed with each batch.
- **Cards are renumbered on every addition** so the numbers still ascend down the page. Any
  older note in this file referring to earlier ranges means a *previous* numbering. Current
  order, after `pendulum-period.html` and `terminal-velocity.html` landed: 01 horizon,
  02 lightning, 03 braking, 04 bike-gears, 05 shelf-sag · 06 earth-moon, 07 planet-light-delay,
  08 mass-energy, 09 gravity-lab, 10 eratosthenes, 11 snells-law, 12 rocket, 13 kepler ·
  14 straw-hose-flow, 15 pendulum-period, 16 terminal-velocity, 17 ocean-salt.
- **Categories live on `index.html` only.** The visualization pages' topbars still carry just
  the back link + law name + theme toggle; no category label was added there, since the
  right-hand slot is already occupied and a page reached as a standalone Artifact has no
  category context to belong to.

Two CSS changes were needed to support per-category grids, both worth preserving:

- The closing hairline moved from `.concept:nth-last-child(-n+2)` onto `.grid` itself. The old
  rule assumed one grid with an even card count; with a 3-card and a 7-card group it would have
  drawn a bottom border under one card in the middle of a row.
- `.grid:has(> .concept:last-child:nth-child(odd))::after` inserts an empty cell when a group
  has an odd number of cards, so the rule above the final row spans the full width instead of
  stopping halfway. It's suppressed under 760px, where the grid is single-column and the filler
  would add a stray empty row. This is self-maintaining — add or remove a card and the filler
  follows — which is why it's a `:has()` selector rather than a hand-placed filler element.

**Roadmap went from 9 entries to 30**, grouped by the same three categories, each still
`concept — hook · equation · status`. Three were tagged `up next` rather than `idea`: **bike
gears**, **a shelf that sags** (`δ = PL³/48EI`), and **why the straw looks bent** (Snell,
`n₁sinθ₁ = n₂sinθ₂`) — picked as the strongest single-equation pages with clean slider shapes.
All three were built the same day (see the entries above), and **pendulum period** and
**terminal velocity** (both plain `idea` entries, not `up next`) followed in a second batch
the same day too. All five are now out of the list, leaving 25. Notes on the remaining
entries:

- **Fourier** was deliberately reduced from "the Fourier transform" (not a two-sliders-one-
  number page) to **building a square wave from harmonics** — slider = number of terms, and the
  Gibbs overshoot parking at ~9% is the payoff. The full time↔frequency page is a different,
  larger job.
- **"Why computers count in sixteens"** (binary/hex) is the weakest fit on the list and is
  known to be: it's a converter with no equation, no computed result, and no gauge. Kept
  because the user proposed it; the salvage is the *nibble* insight (one hex digit = four bits),
  not the conversion itself.
- **"A string you can actually hear"** would be the first page to use **Web Audio**, which is
  native and therefore allowed under the no-external-dependencies rule. Nothing on the site
  makes sound yet. It pairs naturally with the Fourier harmonics page.
- **"The ten-metre ceiling"** (`h = P₀/ρg`) is the companion page that `straw-hose-flow.html`
  explicitly scopes out — hydrostatic, not viscous. The two should cross-link if both exist.
- Ideas raised in the same brainstorm but **not** added, as weaker or redundant: mortgage
  amortization (overlaps compound interest), rain load on a roof (overlaps ocean salt's shape),
  ladder friction angle, the ideal gas law, the Drake equation, and boiling point at altitude.

### Seven-page batch (2026-08-15): finishing "Everyday maths" — `compound-interest.html`, `pizza-area.html`, `mpg-trap.html`, `binary-hex.html`, `birthday-paradox.html`, `roast-time.html`, `decibels.html`

Built in parallel directly to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton, no earlier drafts — same approach as the six-page batch above: each agent got exact reference numbers and equations up front and was told to copy `straw-hose-flow.html`'s CSS/component patterns near-verbatim. This batch cleared every remaining `idea`/`up next` entry under "Everyday maths" in `index.html`'s roadmap, so that category's roadmap list is now empty and its `<h3 class="rm-cat">Everyday maths</h3>` heading was removed entirely (the other two categories' roadmap lists are untouched).

- **`compound-interest.html`** ("The last decade earns more") — `A = P(1+r/n)^(nt)`. Sliders for principal, annual rate, years, plus a compounding-frequency picker (annually/monthly/daily). Verified before shipping (P=$10,000, r=7%, monthly, t=40y): decade gains $10,097 → $20,291 → $40,778 → $81,949 — the last decade ($81,949) does exceed the first three combined ($71,165), confirming the headline claim numerically rather than assuming it. Hero shows the exponential curve with per-decade shaded gain regions plus a dashed "no compounding" simple-interest reference line. No gauge (no natural limit).
- **`pizza-area.html`** ("One big pizza, or two smaller ones?") — `A = πr²`. **Reviewed and complete as of 2026-08-18.** A big-pizza diameter slider plus a small-pizza-diameter picker drive a compact 230 px laptop diagram. The circles scale against both available width and height, so even the 24-inch extremes remain on-page. A second comparison turns the large pizza into an area-equivalent square and overlays two equal-width rectangles from its bottom-left; their combined height shows the smaller pizzas' total area as a percentage of the large one. Mobile stacks the circle and rectangle comparisons in a 330 px diagram. Verified presets: two 12″ (226.2 sq in) vs one 18″ (254.5 sq in, +12.5%); two 10″ vs one 16″ (+28.0%); two 14″ vs one 20″ (+2.0%, near-crossover).
- **`mpg-trap.html`** ("Miles per gallon is a trap") — `fuel ∝ 1/mpg`, modeled as gallons = distance/mpg over a fixed 10,000 mi. Two mpg sliders (before/after) plus a distance slider. Hero is the 1/mpg hyperbola with the user's before/after bracketed on it. **The initial brief's headline numbers were wrong and the building agent caught it**: 15→20 mpg saves ≈167 gal (not ≈333 as drafted) and is ≈3.3× the 40→50 saving (not ≈6.7×) — the 333 gal/6.7× figures actually belong to a 10→15 mpg pair, which is why that pair is kept as a fourth preset. The shipped page uses the verified numbers throughout; worth remembering that even a carefully-drafted task brief can carry an arithmetic error and agents should verify claimed numbers, not just implement them.
- **`binary-hex.html`** ("A hex digit is exactly four bits") — deliberately reframed around the "nibble" insight per the roadmap's own admission (recorded earlier in this file) that this was the weakest-fit idea on the list, being a converter with no equation/gauge. Eight individually toggleable bit switches, grouped visually into two nibbles, decode live to decimal/hex/binary/ASCII character. No SVG hero — plain HTML/CSS toggle grid, since there's no geometry to animate; no slider or gauge, matching the concept's shape. Verified presets: 65→'A', 97→'a', 48→'0', 170→0xAA (alternating bits), 255→0xFF, 0→0x00.
- **`birthday-paradox.html`** ("23 people, a coin flip") — `P = 1 − Π_{k=0}^{n-1}(365−k)/365`, implemented as a running product (not literal factorials, to avoid floating-point overflow/underflow at n near 100). Single group-size slider (2–100). Hero is the full P(n) curve for n=0–100 with a 50%-line marker at the verified n=23 crossing (P(23)≈50.7%, P(22)≈47.6%). Gauge reused for the 0–100% probability track with the 50% line as the reference — a natural fit, unlike most of this batch. Also surfaces the pair count n(n−1)/2 alongside n, since that's the actual intuition-fix (comparing pairs, not people, to days).
- **`roast-time.html`** ("Why the big roast takes so long") — `A/V = 6/L` for a cube of side L, plus an `L²`-based relative heat-diffusion time multiplier layered on top as the practical cooking-time consequence (kept explicitly distinct from the A/V ratio itself in the note, since they're two related but different scaling facts). Single log-scale size slider (2–300 cm, `state.Lexp = log10(L)`, same pattern as `gravity-lab.html`'s log10-exponent sliders) covers both the cooking half (chicken breast → turkey crown presets) and the animal-thermoregulation half (mouse → elephant presets) of the hook on one control. Hero splits into a true-fixed-scale cube (with a magnified inset + honest "shown N× actual size" caption for small L, reusing the site's zoom-lens convention) beside the A/V-vs-L hyperbola curve. No gauge (no natural limit), matching the `mass-energy.html`/`gravity-lab.html` precedent.
- **`decibels.html`** ("Decibels don't add up") — `dB = 10·log₁₀(I/I₀)`. A dB slider (0–140) plus a real-sound-source pill picker (whisper 30 dB → jet takeoff 140 dB). The hero plots both the intensity ratio I/I₀ and a perceived-loudness approximation (2^(dB/10), the "+10 dB ≈ doubles loudness" rule of thumb, stated as approximate) on a shared log-decade axis, where both curves become straight lines of very different slope — that slope mismatch is the page's payoff. Verified: +10/+20/+30 dB → 2×/4×/8× perceived loudness as expected, and I/I₀ spans 10³× (whisper) to 10¹⁴× (jet) with proper scientific-notation formatting (this project has a documented history of huge-number formatting bugs — see the correctness-sweep note above — so this was checked deliberately, not assumed). Gauge marks 85 dB as a commonly-cited prolonged-exposure-risk threshold, stated as an approximate guideline in the note, not a medical claim.

All seven were added to `index.html`'s Everyday maths grid (renumbered 06–12, pushing Discoveries to 13–20 and Fun physics to 21–24 — total site count is now twenty-four pages, up from seventeen) and removed from the roadmap list in the same edit. Verified in-browser (via a temporary local static-file preview, since these pages assume `file://` or same-directory HTTP serving) that `index.html` renders all 24 cards with no console errors and that `compound-interest.html` loads cleanly end to end; the other six were already verified individually by their building agents before this integration pass.

### Eighteen-page batch (2026-08-16): clearing the rest of the roadmap — Discoveries + Fun physics

Built in parallel, same approach as the two batches above: each of 18 agents got exact reference numbers/constants and an equation up front and was told to copy `straw-hose-flow.html`'s CSS/component patterns near-verbatim. This batch cleared **every remaining `idea` entry** in `index.html`'s roadmap — nine under Discoveries, nine under Fun physics — so the entire `<section class="roadmap">` (heading, lede, and both category lists) was removed from `index.html`; there is no roadmap section on the site anymore, only the built grid. Site total went from 24 pages to **42**.

Five of the eighteen build agents (`slinky-drop.html`, `time-dilation.html`, `animal-biomass.html`, `doppler-shift.html`, `sky-blue.html`) were cut off mid-verification by an account-level API spend-limit error, but their files were already fully written by that point — a manual pass (tag-balance check, CSS-token check, in-browser console-error check, and re-deriving each page's key numbers by hand against what was on screen) confirmed all five shipped correctly with no fixes needed. Two more (`bayes-theorem.html`, `coffee-cooling.html`, `ten-metre-ceiling.html`) had their build agents finish but couldn't get browser access to self-verify visually — same manual pass confirmed these too. Worth remembering: an agent hitting a hard external error mid-verification doesn't necessarily mean the deliverable is broken, check the actual file before re-running work.

**Discoveries additions** (renumbered 21–29):
- **`grid-voltage.html`** ("Why the grid runs at 400,000 volts") — `P_loss = I²R`, fixed 500 MW delivered over a fixed 15 Ω line, single log-scale voltage slider across the real standard classes (11 kV–765 kV). Verified: loss falls with the square of voltage (400kV→765kV's 1.91× voltage step gives exactly 1.91²≈3.66× less loss). At the two lowest voltage classes, computed loss legitimately exceeds 100% of delivered power — not a bug, the honest result of forcing a fixed high-power line to distribution voltage; the note explains why that configuration is never used in practice.
- **`earth-temperature.html`** ("Sunlight in, heat out") — `T = (S(1−α)/4σ)^(1/4)`, blackbody equilibrium. Verified Earth's bare-equation T≈254.6K/−18.6°C against the real 288K/15°C surface average — the 33° gap IS the greenhouse effect, modeled as an explicit toggle/second marker rather than folded into the formula (the formula alone can't produce it). Venus preset states its real ~735K is wildly higher than the bare equation predicts, for the same greenhouse reason, without claiming the page models it.
- **`earth-black-hole.html`** ("Squeeze the Earth into a black hole") — `r_s = 2GM/c²`. Verified Earth ≈8.87mm, Sun ≈2.95km, Cygnus X-1 ≈62km, Sagittarius A* ≈12.3 million km — all match standard cited figures. Log-scale mass slider (10¹⁵–10³⁷ kg) with honest metric-prefix length formatting throughout (no raw-huge-number bug, per the correctness-sweep precedent).
- **`time-dilation.html`** ("Moving clocks run slow") — `γ = 1/√(1−v²/c²)`. Velocity-only special-relativity model; explicitly and repeatedly states this is NOT the real GPS correction on its own (that's +38 μs/day net, combining this page's −7 μs/day velocity effect with a larger, unmodeled general-relativity gravitational effect) — a deliberate callback to the `planet-light-delay.html` Sun-frame bug from the correctness sweep, i.e. the same *class* of "impressive number, wrong reference frame" mistake, avoided here on purpose.
- **`bayes-theorem.html`** ("Why a 99%-accurate test can still be wrong") — full Bayes' theorem with a 400-icon natural-frequency grid (not just the formula) as the hero, the standard pedagogical technique for making base-rate effects legible. Verified the classic result: at 1% prevalence with a 99%/99% test, P(disease|positive) is exactly 50% — a coin flip.
- **`square-wave.html`** ("The overshoot that refuses to leave") — Fourier square-wave synthesis, `f(t)=(4/π)Σsin(kωt)/k` over odd k. Gibbs-phenomenon overshoot verified numerically to converge to ≈8.95% (the true Gibbs constant), found via a fine 8000-sample scan of the actual partial sum rather than asserted from memory.
- **`escape-velocity.html`** ("Why the Moon lost its atmosphere") — `v=√(2GM/r)`. Five real bodies verified (Moon 2.38, Mars 5.03, Earth 11.19, Jupiter 59.5, Sun's surface 617.5 km/s). One deliberate deviation from the brief: used Jupiter's *equatorial* radius (71,492 km) rather than its mean radius (69,911 km, which the brief specified), since equatorial is what the commonly-cited 59.5 km/s figure actually pairs with — matching the well-known reference number won out over literally following the brief's stated radius.
- **`half-life.html`** ("Reading a bone's age off its isotopes") — `N=N₀e^(−λt)`, four real isotopes (C-14, I-131, Co-60, U-238). States the real ~50,000-year / ~8.7-half-life practical ceiling on carbon dating as an explicit gauge limit, not just prose.
- **`doppler-shift.html`** ("Why a passing siren drops in pitch") — `f'=f·v/(v∓v_s)`, stationary-listener simplification stated explicitly. Verified at 60 km/h: 736 Hz approaching / 668 Hz receding (+5.1%/−4.6%) against a fixed 700 Hz siren.

**Fun physics additions** (renumbered 34–42, after the existing four pages became 30–33):
- **`ten-metre-ceiling.html`** ("The ten-metre ceiling") — `h=P₀/ρg`, the barometric limit straw-hose-flow.html's own note explicitly scopes out as a different mechanism (hydrostatic vs. viscous) — this page is that promised companion, and cross-links back to straw-hose-flow.html by name in its closing note. Mercury preset deliberately uses the 0°C reference density (13,595.1 kg/m³) rather than a rounder approximate figure specifically because it lands the result on the textbook-exact 760.0mm barometer height, the numeric coincidence the page's hook depends on.
- **`coffee-cooling.html`** ("Milk now, or milk later?") — Newton's law of cooling, modeling milk-added-immediately vs. milk-added-later as two full scenarios. The building agent didn't just spot-check presets but derived a closed-form proof that scenario A (milk now) minus scenario B (milk later) is strictly non-negative for all t,k≥0 — algebraic certainty the claim holds everywhere, not just at the chosen preset values.
- **`resonance.html`** ("A small push, badly timed") — the roadmap's literal `A∝1/(ω₀²−ω²)` genuinely diverges to infinity at resonance, which is physically dishonest, so this page uses the standard damped-driven-oscillator form instead (`Q=1/√((1−x²)²+(b̂x)²)`) and shows the roadmap's undamped formula only as a dashed reference curve explicitly clipped rather than plotted to infinity — documented in-page, not a silent substitution. Also flags that the popularly-cited Tacoma Narrows Bridge collapse is scientifically closer to aeroelastic flutter than simple forced resonance, rather than repeating the common oversimplified version uncritically.
- **`guitar-string.html`** ("A string you can actually hear") — `f=(1/2L)√(T/μ)`, the site's first page using Web Audio (native, no external dependency, per CLAUDE.md). Confirmed no autoplay — sound only plays on an explicit Play-button press. String presets were tuned so the illustrative T/μ values land on real note frequencies (verified: low E≈82.4Hz/E2, high E≈330Hz/E4) rather than using arbitrary numbers that happen to be in a guitar-ish range.
- **`microwave-chocolate.html`** ("Measuring light speed with chocolate") — `c=fλ`. **Reviewed and complete as of 2026-08-18.** The legend presents compatible SI units directly (`2.45×10⁹ Hz`, metres, and m/s), while the note explains the `GHz·cm = 10⁷ m/s` shortcut. The diagram uses theme-aware accent colours, retains the top-down melted-spot measurement, and adds a side-view standing wave with adjacent antinodes aligned to spots `λ/2` apart. The percent-error gauge keeps its `true c` label below the scale.
  - **Post-review fix, same day:** an independent re-check (Claude, after Codex's "reviewed and complete" pass) found the equation/physics were correct but two hero-label collisions were not — `lblCorner` ("top-down view...") and `lblTrue` ("λ/2 = 6.12 cm (true)") landed on the same y-row and visibly overlapped by ~75px at 800px viewport width, and `lblSpotA`/`lblSpotB` ("melted spot A"/"melted spot B") overlapped by a few px at 375px mobile width. Confirmed both via `getBoundingClientRect()` before and after the fix, not just visual inspection. Fixed in `10f16e6` by giving the two captions distinct rows (`lblCorner` at `py(2)`, `lblTrue` moved to a fixed `py(17)` instead of a formula that could coincide with `lblCorner`'s row) and shortening the spot labels to single letters ("A"/"B") below the existing 620px narrow breakpoint, matching the pattern `lblSpotC` already used. Re-verified no overlap at 800px/375px, no console errors, no horizontal overflow. **Lesson for future review passes on this project:** "verified in-browser" claims should include an actual overlap/bounding-box check for any absolutely-positioned `.lbl`/`.note-inline` element sharing a coordinate formula with another label, not just a visual screenshot pass — this bug wouldn't show up in a spot-check unless you were looking for it at the right viewport width.
- **`slinky-drop.html`** ("The bottom hasn't heard yet") — wave speed on a stretched spring. The roadmap's literal `v=√(kL/m)` is dimensionally wrong (works out to m²/s⁴, not m²/s²); the building agent caught this via explicit dimensional analysis and used the corrected `v=L√(k/m)` (equivalently `√(kL²/m)`) instead, stating the derivation and the correction directly in the note rather than silently fixing it. Verified the travel time simplifies to `√(m/k)` — L cancels out entirely, so a longer stretch doesn't change how long the bottom waits, only how dramatic the pause looks.
- **`sky-blue.html`** ("Why the sky is blue") — `I∝1/λ⁴`. Explicitly states there's no single "the" blue/red scattering ratio without naming which representative wavelengths went in — shows the calculation both ways (450/650nm → 4.35×; 400/700nm → 9.38×, closer to the "~5.5×" figure sometimes quoted elsewhere) rather than picking one number and presenting it as definitive. Sun/sky colors for the midday-vs-sunset comparison are computed live via the Kasten–Young airmass formula and Beer–Lambert extinction, not just illustrated.
- **`ship-buoyancy.html`** ("Why ships float") — `F=ρVg`, simplified rectangular hull. Verified the ship floats measurably higher in seawater than freshwater for the same cargo (max cargo before flooding: 700t seawater vs. 680t freshwater), confirming the direction of a real, subtle effect rather than asserting it. Cites the Plimsoll line as a genuine real regulatory concept, not just an analogy.
- **`animal-biomass.html`** ("All animal life, by weight") — `M=Σ(n·m)`, real headline figures from Bar-On, Phillips & Milo, *PNAS* 2018 (livestock ≈0.1 Gt C, humans ≈0.06 Gt C, wild mammals ≈0.007 Gt C). Verified the ≈22.9× ratio by hand; explicitly flags that Gt C (carbon mass) is not live/wet body weight, roughly 5–10× smaller, so the numbers shouldn't be compared directly to "how much do you weigh." No gauge, following `ocean-salt.html`'s fixed-dataset "scale" page precedent.

All eighteen were added to `index.html`'s Discoveries and Fun physics grids in the same edit that removed the (now-empty) roadmap section entirely. Verified in-browser (local static-file preview) that `index.html` renders all 42 cards with no console errors, and individually re-verified every one of the eighteen pages' key numbers by loading each and checking console/page text against the building agents' claimed figures.

### `cosmic-scale.html` — "Closer to the smallest thing, or the biggest?" (2026-08-16)

Built to the [STYLE_GUIDE.md](STYLE_GUIDE.md) skeleton, no earlier draft, from a one-line user
idea ("are we closer in size to the smallest or biggest things in the universe, slider could
go from grain of rice to Earth"). Card 43, under **Fun physics** (14 pages now), same "scale"
sub-genre as `ocean-salt.html`/`animal-biomass.html`.

- **The equation is the log-position formula itself**, not a physics law: `f = log(s/ℓₚ) /
  log(U/ℓₚ)`, where `ℓₚ` is the Planck length (1.616255×10⁻³⁵ m, fixed) and `U` is the
  observable universe's diameter (8.8×10²⁶ m, fixed). `f` is literally what fraction of the
  way along a base-10-log ruler a given size sits — 0 at the Planck length, 1 at the edge of
  the observable universe. This is the same log10-exponent-as-slider-state pattern used by
  `gravity-lab.html`/`rocket-equation.html`, just carried all the way into the page's own
  headline number instead of being an intermediate step.
- **The payoff number: a human (1.7 m) sits at f≈56.7%** — past the midpoint, i.e. closer to
  the biggest end of the log scale than the smallest, which most people's intuition gets
  backwards. This fixed human benchmark is drawn on the hero (bold "You" tick) and the result
  gauge (a permanent tick labeled "you") regardless of what the slider is currently pointing
  at, so every other object the user drags to is implicitly compared against it.
- **Single log-scale slider spans the entire range** (`state.logS` runs from `log10(ℓₚ)` to
  `log10(U)`, ~61.7 decades) rather than a bounded, physically-plausible range like other
  pages' log sliders — the whole point here is that the range itself is the content. Presets
  (proton/virus/rice/whale/Earth/observable universe) jump to real reference sizes.
- **Hero is a static log-scale ruler, not an animated diagram** — eleven reference objects
  (Planck length, proton, atom, virus, rice grain, human, blue whale, Earth, Sun, Milky Way,
  observable universe) as fixed ticks, plus one moving accent-colored marker tracking the
  slider. **4-lane vertical label stacking, cycled by array index (`i%4`), not 2-lane
  alternation** — a 2-lane top/bottom layout (straw-hose-flow's usual pattern) was tried first
  and produced real overlapping labels and one label overflowing past the hero's right edge,
  caught by measuring `getBoundingClientRect()` in-browser rather than by eye. The 4-lane
  version was verified the same way (positions logged and checked pairwise for overlap at
  desktop 1280px and mobile 375px) before shipping. The first/last labels (Planck length,
  Universe) are anchored `translateX(0)`/`translateX(-100%)` instead of the usual centered
  `-50%`, same edge-anchoring reasoning as the gauge ticklabels elsewhere on the site.
- **A same-shaped formatting bug caught before shipping, matching this project's documented
  history of huge/tiny-number formatting bugs**: the initial `fmtLen()` ran every sub-metre
  bucket (cm/mm/µm/nm/pm/fm) through the same scientific-notation helper as the multi-order-
  of-magnitude buckets, so a proton printed as "1.70 × 10⁰ fm" instead of "1.70 fm". Fixed by
  splitting a `niceNum()` helper that only drops to scientific notation outside a
  comfortably-readable 0.01–1000 range, reserved for the axis extremes and light-year figures.
- **Honest caveat placed directly in the note**: the Planck length is a theoretical
  quantum-gravity scale, not the size of a real particle, and is named as such rather than
  implied to be "the smallest thing." Also flags that the Planck-length-to-proton gap alone is
  ~20 orders of magnitude (about a third of the whole ruler), almost entirely empty of any
  built structure — so the 56.7% "midpoint" answer is shaped as much by that empty subatomic
  stretch as by anything at the cosmic end, which is worth knowing before treating 56.7% as a
  deep fact about human significance rather than an artifact of how the two endpoints were
  chosen.
- Reference sizes used (recheck if reused elsewhere): Planck length 1.616255×10⁻³⁵ m; proton
  1.7×10⁻¹⁵ m; hydrogen atom 1.06×10⁻¹⁰ m; a virus ~1×10⁻⁷ m; DNA width and red blood cell were
  considered but dropped from the permanent tick set as redundant with nearby ticks (still
  fine as future preset additions); grain of rice 7 mm; human height 1.7 m; blue whale 25 m;
  Earth diameter 1.2742×10⁷ m; Sun diameter 1.3914×10⁹ m; Milky Way diameter ~9.4607×10²⁰ m
  (100,000 ly); observable universe diameter 8.8×10²⁶ m (~93 billion ly).

### `horizon-distance.html`: curve-direction fix and a body picker (2026-08-16)

Found via the page tracker (`tracker.html`), which had a note on this page reading "Curve is
wrong way. Could add other planets" — both items fixed in the same session.

- **The hero's schematic arc was bowing the wrong way.** In `geom()`, `ctrlY = baseY +
  arcRise` pulls the quadratic Bézier's midpoint *down* (larger SVG y), drawing a valley
  (⌣) — the ground appeared to dip away from the observer and rise back up toward the
  horizon point. The comment right above it ("how much the arc bows down at the edges")
  describes the intended dome shape (⌢, high in the middle, dropping at the edges — the
  correct way to show a surface curving away beneath you), so this was a sign error, not a
  design choice. Fixed to `ctrlY = baseY - arcRise`. Verified at both a small height (1.7 m)
  and the ISS preset (408 km) that the sight line now lands on the dome's downslope.
- **Added a World picker** (Moon / Mars / Earth / Jupiter, real mean radii), following
  `planet-light-delay.html`'s `.object-buttons` pill-picker pattern verbatim (added that CSS
  class to this file, which hadn't needed it before). Selecting a world swaps the module-level
  `R` and re-renders; the five presets (beach/lighthouse/Everest/airplane/ISS) are Earth-only
  scenarios and now force the world back to Earth when clicked, rather than computing an Earth
  height against whatever world happened to be selected.
- **Each world's eye-height slider max is scaled to the same h÷R fraction as Earth's**
  (500,000 / 6,371,000 ≈ 0.0785), giving Moon 130 km, Mars 260 km, Jupiter 5,000 km — so the
  flat-horizon approximation's error at the top of the slider stays close to Earth's own
  already-documented ~2%, rather than silently growing much larger on the smaller worlds
  (the Moon's radius is small enough that reusing Earth's flat 1–500 km range would have put
  the h² term at a dishonest ~14% by the top, not the ~2% the note claims). The note now
  states this scaling explicitly and flags that Jupiter has no solid surface — h there is
  measured from the standard cloud-top reference level used to define its "radius."
- **The gauge needed to widen from ~1–2,500 km to ~1–30,000 km** to fit Jupiter's much larger
  horizon (up to ~26,440 km at its slider's max), which surfaced two follow-on bugs, both
  fixed before shipping:
  - Five text tick labels no longer fit the result column's narrow width (verified by
    measuring `getBoundingClientRect()` in-browser, the same technique used to catch
    `cosmic-scale.html`'s label overlaps) — now only every other decade gets a text label
    (every decade still gets a tick mark), standard minor/major log-axis convention.
  - `fmtH()`'s `(h/1000).toPrecision(h>=100000?4:3)` flips to exponential notation once a
    value needs 5+ significant digits — Jupiter's 69,911 km radius printed as `"6.991e+4
    km"`. This is the same class of huge-number formatting bug documented earlier in this
    file (gravity-lab, mass-energy, planet-light-delay); `fmtH()` now uses plain rounding
    with `toLocaleString()` past 1,000 km instead of `toPrecision`. Re-verified all four
    worlds' R and slider-max readouts, plus Jupiter's distance readout at both its default
    and maximum height, print correctly.
- The subtitle and note were reworded minimally to stop asserting "Earth" as the only body
  while keeping the existing Earth-specific numbers (4.6 km beach, 2,000+ km ISS) intact as
  the default-world example.

**Reviewed and complete as of 2026-08-17.** Three further rounds of feedback, all in this
session:
- **Gauge label collision fixed** — same `top:0` → below-axis move as `straw-hose-flow.html`/
  `shelf-sag.html`/`bike-gears.html`, so the English Channel limit label can no longer overlap
  the horizon-distance marker label.
- **Switched to the exact formula.** `d = √(2Rh + h²)` is used for both the displayed equation
  and the actual computation, replacing the flat-horizon approximation — simple enough not to
  need the shortcut, and it let the note drop its "dropping the h² term" error-percentage
  caveats entirely (the refraction, ground-arc, and schematic-scale caveats stayed, since
  those are independent of which formula computes `d`).
- **Hero diagram rebuilt around real circle-tangent geometry, then tuned twice more.** The
  first pass (schematic radius shrinks + eye height grows together, horizon = the actual
  tangent point) fixed the "arbitrary-looking" connection but introduced a real bug: the
  tangent point's vertical drop grows with curvature while the margin below the baseline was
  a fixed 34px, so the horizon marker rendered off the bottom of the viewBox above ~9 m —
  caught by the user testing the live page, not by inline review. Second pass fixed it
  properly: `baseY`/`vbH` are now sized from the eye-rise range so the drop always has room,
  the circle radius is set as a multiple of the diagram's own width (so the arc always spans
  edge-to-edge — "the world keeps curving away past the horizon" — rather than occupying an
  arbitrary fraction of it), the observer moved from a 16%-inset position to hard against the
  left edge to free the rest of the width, and the eye-rise pixel range was halved so height
  reads as a modest lift rather than the dominant motion. Verified in-browser at the exact old
  breakpoint (9.3 m) plus both slider extremes, Earth and Jupiter, mobile width, and both
  themes.

### `bounce-restitution.html` — "Count the bounces" (2026-08-16)

Built directly from a filled-out design brief (`Drafts/Bounce_Design.md`), the first page
built that way since `Drafts/Straw_Design.md`. Coefficient of restitution: `hₙ = h₀e^(2n)`,
where e = √(h₁/h₀) is a property of a **ball-and-surface pair**, not the ball alone. Card 44,
under **Fun physics**, right after `cosmic-scale.html`.

- **A genuinely real-time simulation, not a per-render static diagram** — same category as
  `pendulum-period.html`'s playback (Play/Pause/reset, `playing = !reduceMotion` at load). The
  ball's height is computed from closed-form projectile segments (an initial half-parabola
  drop, then alternating full up-down parabolas per bounce, each with `dur = √(2·peak/g)`) —
  exact per-bounce kinematics, no numerical integrator needed since the physics itself is
  piecewise-exact. Verified in-browser that the bounce counter and ghost-tick trail advance
  correctly in real time; also verified (via `document.visibilityState`) that an apparent
  animation stall during testing was the browser throttling `requestAnimationFrame` on a
  backgrounded tab, not a bug in the tick loop — worth remembering for future testing sessions
  using this same browser-automation tooling, since a backgrounded preview tab will look frozen
  even when the code is correct.
- **The stopping condition is the ball's own real radius, not an arbitrary threshold.** Once a
  bounce's predicted peak height falls below the ball's physical radius, the animation settles
  — there's no bounce left that's visually distinguishable from the ball just sitting on the
  floor. This single physically-grounded threshold does double duty: it's both what "too small
  to see" means or the animation, and what the closed-form `n = ⌈ln(R/h₀)/(2·ln e)⌉` predicts
  for the result panel's headline number, so the two can't drift out of sync with each other.
- **No possible/impossible gauge**, matching the `gravity-lab.html`/`mass-energy.html` no-gauge
  precedent — there's no natural limit line for a bounce count. In its place, the hero itself
  carries a fading trail of dashed "ghost ticks" at each bounce's peak height, visually showing
  the geometric decay as a staircase even once the ball's own motion is hard to track by eye.
- **The balloon-drum toggle** (the distinctive idea from the original brainstorm) shipped in
  v1 rather than being deferred, since it turned out cheap to add once the bounce-event loop
  already existed: toggling it on plays a small expanding-and-fading ring at the floor on every
  impact (JS-driven per the site's SVG-animation rule, not a CSS transition), independent of
  whether the ball itself is still visible — the point being you can keep counting by ear after
  your eyes give up, which is also stated directly in the closing note.
- **Ball radii are drawn to a compressed but honest relative scale** (mapped from real radii
  0.02–0.121 m onto a 6–21 px range), so a basketball visibly reads larger than a golf ball
  rather than all balls sharing one fixed icon size — a small honesty upgrade over just using a
  uniform dot, in the spirit of CLAUDE.md's "real numbers, honestly presented."
- **Two of the six ball/surface presets carry real regulation numbers, not estimates**: the
  NBA's spec that a basketball dropped from 6 ft onto hardwood must rebound 49–54 in (→ e ≈
  0.85) and the ITF's spec that a tennis ball dropped from 100 in onto concrete must rebound
  53–58 in (→ e ≈ 0.75). The other four (superball/concrete, golf/concrete, tennis/grass,
  tennis/carpet) are flagged in-page as rough estimates, since there's no equivalent official
  spec for them — same honest-value treatment as straw-hose-flow's fluid viscosities.
- Presets: superball off a table (1.2 m, most visible bounces), basketball off a table (0.9 m,
  the NBA-spec pair), tennis ball onto carpet (1.0 m, dies fastest — makes the surface
  contrast concrete), golf ball overhead (1.8 m, hard ball from height).
- Added to `index.html`'s Fun physics grid as card 44 (category count 14→15 pages) and its
  matching roadmap `<li>` removed, leaving three roadmap ideas still open (see below).

### Homepage concept icons (2026-08-17)

`index.html` now gives every one of its 45 visualization links a distinct preview icon.

- The user chose the person + long looping straw + candle direction for
  `straw-hose-flow.html`, then asked for the same visual treatment across the catalogue.
- The production icons are **inline SVG symbols**, not generated PNGs. The initial raster
  straw sketch was transparent with near-black outlines and therefore disappeared in dark
  mode; the SVG set instead uses `currentColor`, `var(--accent)`, and `var(--bad)` so one asset
  works automatically in both themes.
- All symbols live in a hidden `<defs>` sprite near the top of `index.html`, use the shared
  `0 0 120 64` viewBox and rounded 2.2 px line treatment, and are deliberately simple enough
  to read at the homepage's 76 px icon height.
- A short script derives each symbol ID from the visualization filename (for example,
  `visualizations/straw-hose-flow.html` → `#icon-straw-hose-flow`) and inserts a decorative,
  `aria-hidden` SVG before the card metadata. When adding a page, add a symbol whose ID uses
  the same filename slug; no separate mapping table is required.
- Browser verification: 45 links / 45 symbols / 45 rendered icons; light and dark themes;
  search still returns the correct count and card; mobile at 390 px is a single column with
  no horizontal overflow; no console warnings or errors. `git diff --check` also passes.
- The `eratosthenes-shadow.html` homepage icon was replaced with the user-selected thin-line
  Earth-curve, two-stick, and dotted-sun-ray version on 2026-08-19. Treat this icon as
  **provisional**: the user approved using it now but explicitly noted it may be revisited.
- The `time-dilation.html` homepage icon now uses the user-selected light-clock comparison:
  a vertical light path beside the longer diagonal path of a moving clock. This choice is
  also **provisional** and may be revisited.
- The `heat-pump-magic.html` homepage icon now uses the user-selected outdoor-unit concept:
  atmospheric heat flows from a cloud into a compact 2:1 heat-pump unit, whose fan sits on
  the right, and the unit delivers heat into a house.
- The `microwave-chocolate.html` homepage icon now uses the user-selected side-by-side
  concept: a microwave emits a blue wave toward a segmented chocolate bar with two warm
  melt spots and a measurement bracket.

## Session handover — double slit and capillarity (2026-08-21)

Two new self-contained draft pages were added. They are listed in `unreviewed.html`, not the
homepage catalogue, pending the normal accuracy-and-polish review pass. The draft listing now
shows 47 pages; its inline icon sprite includes matching `icon-double-slit` and
`icon-capillary-rise` symbols.

- **`visualizations/double-slit.html`** — "One particle, two slits." Covers Young's original
  light experiment, the ideal far-field two-slit intensity pattern, discrete detection events,
  and loss of interference when which-path information is available. Controls change slit
  separation, wavelength, screen distance, and display mode. The home section is explicitly
  limited to the classical optical interference experiment using a low-power laser and a
  commercial double-slit slide; it does not claim a home single-photon experiment is practical.
- **`visualizations/capillary-rise.html`** — "How water climbs." Uses an ideal clean,
  vertical circular glass capillary: Jurin's law for equilibrium height and a
  gravity-corrected Lucas–Washburn form for the rising speed. The liquid values are marked as
  illustrative room-temperature estimates, especially for soap mixture and vegetable oil.
  Its home experiment deliberately uses two flat glass pieces and uniform tape spacers, which
  is more model-like than a paper towel. Paper/coffee-filter wicking is presented only as an
  extension fitted to `x² = Ct`, not as a uniform capillary.
- The capillarity liquid picker was initially implemented as a native `<select>`. Simon noticed
  it departed from the approved style. It has been replaced with the style guide's approved
  outlined, transparent discrete-option pills: Water, Soapy water, Vegetable oil. Their active
  colors have light/dark theme tokens.
- Script syntax checks passed for both new pages. A future review should still inspect the
  pages at narrow viewport widths and check the numeric behaviour of every liquid/radius
  preset in a browser before promotion to `index.html`.

**New roadmap idea:** `index.html` and this handover list now include **Can you hear the size
of a bottle?** — a Helmholtz-resonance page. Model: `f = c/(2π)√(A/(V L_eff))`; account for
end correction in `L_eff` and present it as a household estimate.

## Roadmap

Three ideas are still open, added 2026-08-16 as a themed batch — kitchen-table experiments
where you measure something real with household items. `bounce-restitution.html` above was the
fourth and has been built; see `index.html`'s `<section class="roadmap">` for the current
`<h3 class="rm-cat">`/`<ul><li>` markup if adding or removing entries.

- **Why the spoon feels colder than the table** (Everyday maths) — same room temperature, but
  touch metal and wood and your hand disagrees. The honest equation here is *thermal
  effusivity* e = √(kρc), not conductivity alone — effusivity is what actually sets how fast
  heat is pulled from your fingertip on contact, which is worth getting right rather than
  reaching for the more familiar but less precise k.
- **How deep is the well** (Everyday maths) — drop a stone, count the seconds to the splash,
  back out the depth from d = ½gt². Same timing-trick family as `lightning-distance.html`, run
  in reverse (there, known speed + measured delay gives distance; here it's closer to a
  well-known "how deep is the well" puzzle, and a full solve should also account for the
  stone's own splash sound needing to travel back up, the same correction lightning-distance
  didn't need since light is instantaneous at that scale).
- **Melting ice doesn't raise the glass** (Fun physics) — float an ice cube in a full glass,
  mark the waterline, watch it not move. Archimedes' displacement: a floating object displaces
  exactly its own weight in water, and ice melts into exactly that same volume of water — ties
  into the real climate-science point that floating sea ice melting doesn't raise sea level
  (only land ice does), worth stating directly in the note.
- **Can you hear the size of a bottle?** (Fun physics; added 2026-08-21) — a household
  Helmholtz-resonance experiment: change a bottle's air volume or neck opening and hear the
  pitch move. The core model is f = c/(2π)√(A/(VL_eff)); it should explicitly state that the
  effective neck length includes an end correction, so it is an estimate rather than a
  precision measurement.

## Open questions / next steps

- A site index (`index.html`) now links forty-five concepts, grouped into the three categories
  described above (Everyday maths / Discoveries / Fun physics). Each is intentionally a
  simplified explainer, with its approximation stated in-page.
- **Decided (2026-08-14):** every visualization should share the visual language in
  [STYLE_GUIDE.md](STYLE_GUIDE.md) — the user confirmed straw-hose-flow.html's v5 design as
  the site's style going forward. `earth-moon-race.html` was migrated the same day, and
  `gravity-lab.html`, `mass-energy.html`, and `planet-light-delay.html` followed in a
  dedicated sweep later that day (see above) — every page in `visualizations/` now shares this
  style. `index.html` followed in its own pass the same day, so every page on the site,
  including the cover, is on the shared token set and has a theme toggle.
- The zoom window in `earth-moon-race.html` is a **fixed** 1,500 km (not auto-scaling to
  keep fast objects in frame) — deliberate simplification. If a future request wants the
  probe to stay visible the whole time, an auto-zoom-out camera is the next thing to try,
  but note it has a failure mode: once the fastest object finishes and caps out, the
  furthest-distance-driven zoom will lock at that scale and flatten the slower objects again
  unless the scaling logic explicitly excludes finished racers.
- No build/lint/test tooling exists in this repo yet — everything is validated by opening
  the HTML file directly. Add tooling only if the project's scope grows enough to need it.
