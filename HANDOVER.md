# Handover

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

## Backlog — pitched ideas not yet built (added 2026-08-19)

Four ideas Simon pitched for future pages; none started as of this entry except the heat
pump page, begun the same day (see the handoff entry below).

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
- **"It IS Rocket Science" page addition.** Add other planets/bodies (Moon, Mars, Jupiter,
  etc.) to show how surface gravity `g` changes required escape/orbital velocity — again
  likely a second-section addition to the existing page rather than a new file; find the
  page's actual current filename before starting (name may differ from the pitch title).

## Current handoff — 2026-08-19

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
