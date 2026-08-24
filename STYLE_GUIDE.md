# Style guide

**As of 2026-08-14, [`visualizations/straw-hose-flow.html`](visualizations/straw-hose-flow.html)
is the reference implementation for the site's visual language.** The user approved this
design explicitly ("Ok this is the style") after several rounds of iteration. Start new
pages by copying its `<style>` block and adapting the component patterns below, rather than
designing a look from scratch. If a concept clearly calls for something structurally
different, deviate — but treat this as the default, not one option among many.

This supersedes the earlier, sparser look originally used by `gravity-lab.html`,
`mass-energy.html`, and `planet-light-delay.html`. All pages on the site — including those
three — were migrated to this style on 2026-08-14; see [HANDOVER.md](HANDOVER.md) for
per-page migration notes.

## Why a Markdown file, not a shared `.css`

[CLAUDE.md](CLAUDE.md) requires every visualization to be **one self-contained HTML file**
with no external dependencies — that rules out a shared stylesheet the pages `<link>` to.
This file exists to document the pattern in one place anyway; copy the relevant CSS/HTML/JS
straight into each new page's own inline `<style>`/`<script>`.

## Required document head

**Every page must start with exactly these four lines, before `<title>`.** They were missing
from all thirteen pages until 2026-08-14 and each omission was doing real damage:

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
```

- **`<!doctype html>`** — without it browsers render in quirks mode (`document.compatMode`
  returns `"BackCompat"`, verified). The layouts happen to survive it, but nothing here is
  designed against quirks-mode box/inline rules and there is no reason to gamble.
- **`<meta charset="utf-8">`** — these files are UTF-8 and carry raw `η`, `μ`, `Δ`, `ρ`,
  `⁰¹²³⁴⁵⁶⁷⁸⁹`, `≈` and em dashes *inside JS string literals*, not just as HTML entities.
  Served over HTTP with no charset declaration, Chrome falls back to windows-1252 in Western
  locales and the legends and readouts turn to mojibake.
- **`<meta name="viewport" ...>`** — without it mobile browsers lay out at a 980px viewport
  and zoom out, which silently disables every `@media (max-width:…)` rule *and* every
  `w < 620` narrow branch inside the `geom()` functions. All the mobile work was dead code.
- **`<html lang="en">`** — screen reader pronunciation.

## Design tokens

Every page defines the same CSS custom properties, with light as the default and dark as an
override — both `prefers-color-scheme` and an explicit `data-theme` attribute (for the
in-page toggle, see below) must work:

```css
:root{
  --bg:#F7F5F0;--fg:#1B1A17;--muted:#6E675D;--muted2:#4A463F;
  --line:#E2DDD2;--line2:#C1BAAC;--border:#D7D1C4;--accent:#2F6BD8;--bad:#A83D2A;--track:#E2DDD2;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --bg:#121A2C;--fg:#E9E6DB;--muted:#8B93A8;--muted2:#C6C1B1;
    --line:#28304A;--line2:#3B4562;--border:#2E3854;--accent:#6FA0F2;--bad:#E68075;--track:#28304A;
  }
}
:root[data-theme="dark"]{
  --bg:#121A2C;--fg:#E9E6DB;--muted:#8B93A8;--muted2:#C6C1B1;
  --line:#28304A;--line2:#3B4562;--border:#2E3854;--accent:#6FA0F2;--bad:#E68075;--track:#28304A;
}
```

- **Dark mode is navy (`#121A2C`), never black.** This was an explicit correction from the
  user — don't default to `#000`/near-black for `--bg`.
- `--accent` is the one saturated color on the page, reserved for the active/hovered control
  and its linked equation term. `--bad` (a muted red/coral) is reserved for "impossible" /
  over-limit states. Everything else is drawn from the neutral `--fg`/`--muted`/`--muted2`/
  `--line` scale.
- **Series palette (decided 2026-08-22).** A page with multiple fluids/planets/objects to
  tell apart draws from this standing five-color set, in order, instead of inventing hexes
  per page:

  ```css
  --s1:var(--accent);      /* same token as the page accent — don't hardcode it separately */
  --s2:#D9A41F;--s2-dark:#F0C766;
  --s3:#C4522B;--s3-dark:#E08A6A;
  --s4:#3E8E6E;--s4-dark:#6FBFA0;
  --s5:#8A5AA8;--s5-dark:#B98FD4;
  ```

  `--s1` is deliberately just `var(--accent)` (`#2F6BD8` / `#6FA0F2`) — a single-series page
  should use the accent directly rather than re-declaring it. `--s2`&ndash;`--s5` need their
  own `-dark` variant declared under the same `prefers-color-scheme`/`data-theme` blocks as
  the rest of the tokens, the `-dark` hexes lightened by the same eye as the existing
  `--accent`/`--bad`/`--cat-*` pairs (not just used as-is against navy). This set was chosen
  for maximum separation between series, including under red&ndash;green color blindness —
  it will therefore usually read as more saturated than the rest of the page, which is
  correct: series color is meant to compete for attention the way `--accent` does, not recede
  like `--muted`. A page needing more than five series is rare enough not to plan for; extend
  by eye rather than pre-defining `--s6`.
- Per-concept accent colors that don't fit the series set above (e.g. a single non-accent
  prop color) still sit outside the token set as their own hex constant, since they carry
  specific semantic meaning rather than being theme chrome.

  **Adopted across the live pages on 2026-08-23.** `mass-energy.html`, `heat-pump-magic.html`,
  `straw-hose-flow.html` and `reynolds-number.html` now draw their series colors from
  `--s1`&ndash;`--s5` instead of per-page hexes, chosen by closest hue so the existing semantics
  survive (water &rarr; `--s1`, honey &rarr; `--s2`, TNT &rarr; `--s3`, antimatter &rarr;
  `--s4`, uranium &rarr; `--s5`). A useful side effect: the two pages that share a fluid set
  now agree color-for-color, which they didn't before.

  **`braking-distance.html` is a sanctioned exception.** Its four road surfaces are the one
  case where the standing set's hues fight the concept: dry asphalt is not blue, snow is not
  terracotta, ice is not green. It keeps its own semantic road palette
  (`--surf-dry`/`--surf-wet`/`--surf-snow`/`--surf-ice`) &mdash; but declared as real tokens
  in all three `:root` blocks with light *and* dark values, which is the part that actually
  matters. **A per-concept color set is only allowed if it ships a dark variant.** The reason
  this rule exists: the snow surface was `#AFC6DB` in both themes, and since that color is
  applied to the gauge's *label text*, it rendered at 1.62:1 on the light background &mdash;
  effectively invisible. Note the practical bar here is graphic-color separation, not
  WCAG-AA text contrast: the approved set itself runs 2.08:1 (`--s2`) to 4.69:1 (`--s5`) in
  light mode, so match that band rather than chasing 4.5:1.

  **Prop colors stay outside the set.** `potato-trajectory.html`'s two browns describe the
  potato itself, not a series, and are correctly left as page-local hexes.
- **`index.html` only:** the homepage tile grid colors each tile by category
  (`--cat-everyday` / `--cat-discoveries` / `--cat-fun`, added 2026-08-20 at the user's
  request). Each tile rebinds `--accent` locally to its category hue, which also recolors the
  accent strokes inside the shared icon sprite. This is a cover-page device for telling twelve
  tiles apart at a glance — **do not carry category colors into a visualization page**, where
  the single-`--accent` rule above still holds.

## Homepage icons (decided 2026-08-22)

Each catalogue tile in `index.html` gets a distinct symbol from the shared `icon-sprite`
(`0 0 120 64` viewBox, `currentColor` + `var(--accent)`, ID = the visualization's filename
slug — see the JS architecture note in HANDOVER.md for how the mapping works). Default
treatment for a new icon:

- **Register: object-in-diagram as the default**, e.g. a small drawn coffee cup sitting on
  the cooling-curve diagram it explains, rather than either a pure object sketch or a pure
  abstract diagram alone. This isn't a hard rule — deviate where a concept is cleanly one or
  the other (a pure curve for something with no physical object, a pure object for something
  with no useful diagram) — but reach for the combination first.
- **Line weight: a two-step ladder, 2.2px / 1.3px.** The subject of the icon (the thing named
  in the title) draws at 2.2px; supporting/context lines (axes, reference marks, dashed
  extension lines) draw at 1.3px. Don't introduce a third weight — the existing sprite's
  freehand range (0.55&ndash;4px across symbols, and four symbols with no declared default)
  is exactly what this replaces.
- **Accent: used throughout the icon**, not reserved for a single element — strokes, fills,
  and the occasional filled accent mark (an endpoint, a highlighted region) can all carry
  `var(--accent)` where it helps the icon read at 64px. Since `--accent` is rebound per
  category on the homepage, this also means an icon can look meaningfully different, not just
  recolored, across its three category tints — that's fine.
- These are defaults to reach for, not a retrofit mandate — see "Current state" in CLAUDE.md;
  don't resweep the existing 47-symbol sprite to conform.

## Typography

- Body font: `Georgia,"Iowan Old Style","Palatino Linotype",serif` — the reading face for
  title, subtitle, and prose. No web fonts (Google Fonts etc. are an external dependency;
  the earlier draft this style was ported from used one, but the site's `system font
  fallback` constraint always wins over matching a draft exactly).
  everything numeric or code-like (`.mono` utility class):
  `ui-monospace,"Cascadia Code","SF Mono",Consolas,monospace`, with
  `font-variant-numeric: tabular-nums`.
- That serif/mono contrast is the *only* typographic system — don't add a third typeface.
- **Spelling: Canadian** (decided 2026-08-22) — *metre*, *colour*, *centre*, *neighbour*, not
  the US forms. Matches the `.ca` domain and most existing prose; a handful of stray US
  spellings (`neighbor` ×6) predate this ruling and get fixed opportunistically, not swept.

### Title, subtitle and voice (decided 2026-08-22)

- **Title formula: question by default** ("How deep is the well?"), naming the thing the
  reader wants to know so the page reads as the answer. A wry/character title ("Why the
  straw gives up") is allowed as a deliberate exception for a page where the concept has an
  obvious hook — don't reach for it as the default register.
- **Technical names are allowed in a title** when it's the established name of the phenomenon
  itself (*Reynolds number*, *Snell's law*) — not gatekept to the topbar tag — provided the
  subtitle explains what it means in plain terms immediately under it. The bar is "a
  non-specialist reader isn't left needing to look the term up before the subtitle finishes."
- **Subtitle: one paragraph, about 40 words, two sentences.** Long enough to carry a real
  number and the concept, short enough to read in one breath — this is the concrete target
  for CLAUDE.md's existing "states the real numbers and the concept in one breath" rule.
  Below ~25 words it tends to lose the number; above ~60 it stops being a subtitle. Keep the
  existing `.sub{max-width:52ch}` measure — that's already the majority convention and pairs
  correctly with the topgrid's equation/legend columns.
- **Voice: second person, imperative.** "Drop a stone and start a timer," not "A stone is
  dropped." Applies to the subtitle and any instructional copy; the note/methodology sections
  can stay descriptive.
- **Units: metric first, imperial in brackets** where a reader would actually think in
  imperial — `60 m (200 ft)` — not metric-only. Exception: when the object itself is sold or
  specified in imperial (pizza diameters in inches, etc.), lead with that native unit instead
  and don't force a metric-first rewrite.

## Page skeleton

Top to bottom, in this order:

1. **`.topbar`** — the `mc madeclear` brand mark (linking to `../index.html`) on the left, a
   small-caps monospace tag naming the underlying law/equation plus the theme toggle button
   on the right.
2. **`.topgrid`** — a 3-column row: title + one-paragraph subtitle (widest column) | the
   equation, centered both axes in its box | a compact legend table translating each
   equation symbol to its current value.
3. **`.hero`** — the animated figure. Full width, hand-authored inline SVG, JS-driven.
4. **`.resultrow`** — a 2-column row: interactive controls (sliders/pickers, ~2/3 width) |
   the result readout (~1/3 width), which includes a gauge/scale visualizing where the
   current value sits against some real-world limit.
5. **`.presets`** — one-line "Try:" row of text-styled buttons that jump to interesting
   preset states (a real-world example, an edge case).
6. **`.note`** — closing paragraph: states the equation's name/source (link to Wikipedia or
   similarly reputable source), the approximations made, and any narrative hook (e.g. the
   Tim Vine anecdote) that motivated the page. Small, muted, monospace.

Stack to a single column below ~700–820px; see the `@media` queries in
`straw-hose-flow.html` for the exact breakpoints per section.

**Laptop-height default.** The title, equation, hero animation, controls and live results
should fit within a standard laptop viewport where the concept permits (roughly 768 px tall,
before the optional presets, methodology, note and feedback). Prefer a shorter SVG viewBox,
tighter section spacing and compact controls over hiding information. When controls and live
results carry equal weight, use a 50/50 `.resultrow`; put each live number beside or at the
end of the slider/gauge it explains rather than spending a separate vertical row on it.

**Preferred animated scale reveal.** [`constant-acceleration.html`](visualizations/constant-acceleration.html)
is the reference for the kind of explanatory animation Simon likes. Begin at a familiar,
readable scale with only the objects needed for that opening beat; reveal later objects as
the story reaches them. Keep one spatial anchor fixed (the Sun at far left), let the moving
subject travel normally at first, then hold it near three-quarters width while the world
zooms or rescales behind it. This preserves object identity while making enormous scale
changes legible. Prefer a wide, shallow hero that still leaves sliders and live results
visible on a 768px laptop. Use the standing series palette to distinguish important objects
and regions, but keep structural lines quiet. Always provide replay and honour
`prefers-reduced-motion`.

**Animation standard.** Choose the motion pattern that best reveals that page's mechanism:
[`constant-acceleration.html`](visualizations/constant-acceleration.html) is the reference for
scale reveal; [`pizza-area.html`](visualizations/pizza-area.html) is a useful copy → transform →
assemble pattern for quantity comparisons. Do not force either pattern onto an unrelated idea.
Across types, use distinct semantic colours, one understandable idea per beat, calm easing, and
a clear final result. For paired time-based diagrams, first match their baseline visual cycle;
only then apply the physical difference, so the animation does not invent a difference at the
zero/everyday-speed case. If colour signals remaining space, use green; use orange/red for excess
or overflow, and state the result in text too. Restart slider-linked sequences when inputs change
and honour `prefers-reduced-motion`.

**Primary animation control.** When starting or replaying the animation is the page's main
action, use a compact filled accent pill with a play icon, clear action label (`Drop the stone`,
`Play`, `Replay`) and visible keyboard focus. Place it clear of the moving subject and important
labels; do not overlay the animation's opening state. During playback, disable it and show a
plain running label. Use this stronger treatment sparingly—secondary or optional playback can
remain an outlined/text control.

**Link targets.** Internal links to pages on madeclear.ca (catalogue tiles, navigation and
contextual cross-links) open in the same tab. External links to sources, papers and other
websites open in a new tab (`target="_blank"` with `rel="noopener"`), so readers keep their
place in the visualization. Apply this to every external `<a href="https://…">` source link.

## Component patterns

**Theme toggle** — plain text button, not an icon or switch, matching the topbar's
monospace/uppercase style. Labels itself with the mode it will switch *to* ("Dark mode" /
"Light mode"), not the current mode. Persist the explicit choice in `localStorage` so it
survives reloads, and let the initial state still follow `prefers-color-scheme` until the
user overrides it.

**`currentTheme()` must read the applied DOM attribute before it reads storage.** The obvious
version — go straight to `localStorage`, fall back to `prefers-color-scheme` — has a bug that
only shows up where storage is blocked: a sandboxed iframe (which is how these render when
published as Artifacts), Safari private browsing, or blocked cookies. There the `catch` leaves
`stored` null on *every* call, so `currentTheme()` keeps returning the system preference no
matter what the user clicked, and the toggle can only ever move in one direction. Reading the
live `data-theme` attribute first makes the control work with storage entirely unavailable;
storage then only carries the choice across reloads, which is all it was ever for.

```js
var STORAGE_KEY = 'PAGE-NAME-theme'; // unique per page
function systemPrefersDark(){ return matchMedia('(prefers-color-scheme: dark)').matches; }
function currentTheme(){
  var applied = document.documentElement.getAttribute('data-theme');
  if(applied) return applied;                 // ← the live state wins; see note above
  var stored = null; try { stored = localStorage.getItem(STORAGE_KEY); } catch(e){}
  return stored || (systemPrefersDark() ? 'dark' : 'light');
}
function applyTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  themeToggle.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
  try { localStorage.setItem(STORAGE_KEY, t); } catch(e){}
}
themeToggle.addEventListener('click', function(){ applyTheme(currentTheme()==='dark'?'light':'dark'); });
applyTheme(currentTheme());
```

**Equation** — plain HTML/CSS flex layout (`.eqn`/`.frac`/`.bar`), *not* a hand-measured SVG
text layout. Simpler to get right and just as legible; reserve SVG for the hero diagram.
Terms that correspond to an interactive control (`<em>`) get `transition:color .2s` and are
recolored to `--accent` on hover/drag of that control — this hover-linkage between control
and equation term is one of the style's signature details, carry it into every new page that
has both an equation and matching sliders.

**Legend table** — one row per symbol, all on one line (`grid-template-columns:1.6em 1fr
auto`): symbol (colored, linked to its control same as the equation term) · plain-language
name · current value in a smaller, dimmer mono font (`color:var(--muted)`, ~11px). Don't
stack name and value on separate lines — that was tried and corrected.

**Discrete picker (e.g. fluid selector)** — pill-shaped buttons
(`border-radius:999px`), outlined, transparent background, `--muted` text when inactive;
active state tints the background toward the option's own color via `color-mix(in srgb,
COLOR 22%, var(--bg))` and colors the border with that same color, so it reads correctly in
both themes without hardcoding a light/dark tint pair. *Note: this reintroduces the "rounded
pill button" that [CLAUDE.md](CLAUDE.md)'s original design principles warned against — the
user has since approved it in this specific role (a small discrete-option selector, always
outlined/transparent, never a solid filled CTA-style button). Don't extend pill buttons to
other UI roles (primary actions, navigation) without separately checking.*

**Slider** — custom div-based track (not a native `<input type=range>`), so the fill and
thumb can be styled to match the rest of the page exactly:

```html
<div class="track" tabindex="0" role="slider" aria-label="...">
  <div class="rail"></div>
  <div class="fill"></div>
  <div class="thumb"></div>
</div>
```

Pointer-drag via `pointerdown`/`pointermove`/`pointerup` with `setPointerCapture`, plus
arrow-key/Home/End support on the track element for keyboard accessibility. Hovering or
dragging a slider sets an `active` key in page state, which both the slider's own label and
the linked equation term/legend row read to decide whether to render in `--accent`.

**`role="slider"` needs its `aria-value*` attributes set too, or a screen reader announces a
slider with no value.** This was missing on all ten sliders across the site until 2026-08-14.
Set all four on every render, inside the same function that already positions the fill and
thumb — don't add a separate update path that can drift out of sync:

```js
track.setAttribute('aria-valuemin', lo);
track.setAttribute('aria-valuemax', hi);
track.setAttribute('aria-valuenow', cur);      // the raw slider value, for min/now/max consistency
track.setAttribute('aria-valuetext', fmt(cur)); // the value a listener should actually hear
```

`aria-valuenow` should stay numerically consistent with `aria-valuemin`/`aria-valuemax` — for
a log-scale slider (or a gravity-lab-style log10-exponent slider) that means the raw slider
position, not the real-world value, since the two can't both anchor the same min/max pair.
`aria-valuetext` is what actually gets announced and always overrides `aria-valuenow` for
that purpose, so it's the one that should carry the honest real-world value and unit — reuse
whatever `fmt*()` function the readout already calls, don't write a second formatter.

**Result readout** — big mono number + smaller muted unit, with the verdict text
(e.g. "Possible." / "Impossible") inline immediately after on the same line, not on its own
line below. A secondary explanatory line follows underneath in `--muted2`. Below that, an
optional gauge: a thin horizontal track with a "reach" fill, tick marks, a labeled limit
line, and a colored marker for the current value — built from plain absolutely-positioned
`<div>`s with percentage `left`/`width`, not SVG (percentage positioning means it never needs
a resize observer).

**Put scale comparisons below the gauge/axis they explain.** A recurring layout mistake has
been placing real-world comparisons (pools, pitches, landmarks, limits) above the bar, where
they compete with the headline result and appear disconnected from the scale. The order is:
headline result → essential interpretation → gauge/bar → comparison text and reference labels.
If a reference label belongs to a specific tick, place it below that tick unless there is a
verified non-overlapping reason to do otherwise.

**A second section's `<p class="sub">` should use the full column width, not the topgrid's
52ch measure.** The base `.sub` rule (in the `.topgrid` header) caps line length at `52ch`
because it sits beside an equation/legend column and needs to stay narrow. A second section
added lower on the page (`starsection`, `lightclock`, or similar — see
[`starlight-spectrum.html`](visualizations/starlight-spectrum.html) and
[`time-dilation.html`](visualizations/time-dilation.html)) is full-width on its own row, so
inheriting that cap just leaves empty space beside the text for no reason. Override it
explicitly: `.yoursection .sub{max-width:none}`, alongside the smaller top margin these
sections already use.

The same rule applies to an always-visible explanatory section: its prose should span the
same full content width as the `.note`, unless a deliberate side-by-side layout constrains it.
Do not give it an arbitrary `ch` cap that makes it look narrower than the page below it.
When overriding an earlier component rule, put the full-width override **after** that rule in
the page stylesheet (or remove the old cap): equal-specificity CSS resolves in favour of the
later declaration. This exact source-order mistake caused the basic-functions log section to
remain constrained despite an earlier `max-width:none` override.

**This is a recurring bug, not a one-off — audit `.more`/`.more-body`/second-section width
against `.note` whenever you touch either.** Caught again on 2026-08-22 in
[`heat-pump-magic.html`](visualizations/heat-pump-magic.html): its `.more-body` still carried
`max-width:78ch` while `.note` above it ran full width, so the disclosure read at roughly
two-thirds the width of the rest of the page. Fixed the same way as the general rule above
(`.more-body{grid-template-columns:minmax(0,1fr)}` + `.more-item{min-width:0}`, `max-width`
dropped entirely). `basic-functions.html` and `thermal-comfort-pmv.html` were already correct.
When adding a new disclosure, verify with `getBoundingClientRect()` on `.note` and
`.more-body` directly rather than eyeballing — the gap is easy to miss at a glance since both
still look "roughly full width" until measured.

**On `index.html` and `about.html`, body text spans the full `.wrap` width — same edges as
the tile grid — not a narrower reading-column measure.** These two pages are full-width
layouts (no topgrid/equation column competing for space), so `.sub` and `.prose` should not
carry a `max-width` in `ch`/`px` at all; let them stretch to match `.tile-grid`'s left/right
edges exactly. A centered inner wrapper (e.g. a `.content{max-width:760px;margin:0 auto}`)
was tried on `about.html` and rejected by the user twice — first because the outer `.wrap`
itself was still capped at 760px instead of the site's 1320px, then because even after fixing
that, the centered inner column left dead gutters on both sides that made the page look
narrower than `index.html`'s edge-to-edge tile row. The fix both times was the same: drop the
width cap and let the text block use the full `.wrap`, exactly like the tile grid does.

**Presets row** — text-styled buttons (no border/background, just an underline), each
setting the full interactive state to a named real-world example in one click.

**Collapsible "More details" disclosure** — a native `<details class="more">` /
`<summary>` with a custom `+`/`&minus;` indicator (no marker triangle) and a `.more-body`
grid of `.more-item` blocks (italic serif `<h3>`, mono `<p>`), first used in
`heat-pump-magic.html` and reused for `thermal-comfort-pmv.html`'s full-methodology
section. Use this instead of cramming a long, page-specific breakdown into the main `.note`
paragraph — it keeps the page's default view uncluttered while still making the detail
available to a reader who wants it.

**A block equation inside a disclosure needs `min-width:0` on its grid-item ancestor, not
just `overflow-x:auto` on the equation itself.** A dense equation set (`.eq{white-space:
nowrap; overflow-x:auto}`) can be wide enough to need its own horizontal scrollbar — but if
that `.eq` sits inside a CSS Grid (`.more-body{display:grid}`), the grid item wrapping it
(`.more-item`) defaults to `min-width:auto`, which sizes the *track* to the equation's full
unwrapped content width and pushes the whole page into horizontal overflow at narrow
widths instead of scrolling internally. `overflow-x:auto` on the equation alone does
nothing to stop this, since the ancestor never shrinks enough to trigger it. Fix both ends:
`.more-body{grid-template-columns:minmax(0,1fr)}` and `.more-item{min-width:0}` (plus
`max-width:100%;box-sizing:border-box` on the `.eq` itself, for safety). Caught on
`thermal-comfort-pmv.html` at 375px — a real bug, not caught by a first pass that only
checked `overflow-x:auto` was present on the equation and assumed that was sufficient.

**`.more-body` must not carry its own `max-width` — it should render exactly as wide as
the `.note` paragraph directly above it.** A first pass gave `.more-body` a `max-width:82ch`
reading-width cap, on the assumption that dense equation-heavy prose wanted a narrower
measure than normal — but `.note` itself carries no such cap (this site's body copy already
spans the full `.wrap`/topgrid width by convention, same principle as the existing "second
section's `<p class="sub">` should use the full column width" and "on `index.html` and
`about.html`, body text spans the full `.wrap` width" entries above), so the capped
disclosure rendered visibly narrower than the text just above it — roughly two-thirds of
the page's actual content width — which reads as broken, not intentional. Give `.more-body`
no `max-width` at all and let it inherit the same width `.note` gets. Verified by comparing
`getBoundingClientRect()` on both elements directly (not just eyeballing): same `width` and
same `left` to the pixel.

**Private feedback** — every visualization ends with the same `data-feedback` section:
`Yes` / `Almost` / `Not yet` clarity choices, followed by an optional private comment.
Keep its CSS, HTML, and dependency-free JavaScript synchronized with
`straw-hose-flow.html`, the canonical copy. The form posts to `/api/feedback`; when a page
is opened directly from disk, it explains that submission is available on madeclear.ca
instead of failing silently. Feedback has no public read endpoint and collects no email
address. The generic context collector includes current accessible slider and select values
so a confusing state can be reproduced without adding page-specific integration code.

The form intentionally does not embed Turnstile. Turnstile's required remote browser script
would break the self-contained/offline constraint. The endpoint instead uses same-origin
validation, strict size and value limits, a hidden honeypot, and a daily HMAC duplicate key
that never stores the underlying IP address or user-agent string. Add Turnstile only if
observed spam justifies making this explicit exception.

**Back link — the `mc madeclear` brand mark**, not a text link. Every page's topbar links
back to the homepage using the same hand-drawn wordmark `index.html` itself uses in its own
topbar, scaled down to fit the thin `.topbar` row (removed 2026-08-18; a plain `&larr; Physics
you can see` text link with a GitHub-repo JS fallback for standalone/Artifact publishes was
used before that — the fallback needed a runtime check since `../index.html` only resolves
when the file is actually sitting in `visualizations/` next to the site index, which the brand
mark sidesteps by simply always pointing home):

```html
<a class="brand" href="../index.html" aria-label="Made clear — home">
  <svg class="brand-icon" viewBox="0 0 58 28" aria-hidden="true">
    <text x="22" y="16">mc</text>
    <path d="M1 22 C3 22 3 16 5 16 S7 26 9 26 S11 13 13 13 S15 23 17 23 S19 18 21 18 L57 18"/>
  </svg>
  <span class="brand-word" aria-hidden="true"><span>m</span><span class="sub">ade</span><span>c</span><span class="sub">lear</span></span>
</a>
```

```css
.brand{display:flex;align-items:center;gap:8px;color:var(--fg);text-transform:none;letter-spacing:0}
.brand:hover{color:var(--accent)}
.brand-icon{display:block;width:42px;height:20px;overflow:visible}
.brand-icon text{fill:currentColor;font:italic 16px Georgia,"Iowan Old Style","Palatino Linotype",serif}
.brand-icon path{fill:none;stroke:var(--accent);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.brand-word{display:flex;align-items:baseline;font:italic 18px/1 Georgia,"Iowan Old Style","Palatino Linotype",serif;white-space:nowrap}
.brand-word .sub{font-size:.54em;line-height:1;transform:translateY(.38em);margin-right:.18em;color:inherit}
```

These sizes are index.html's own `.brand`/`.brand-icon`/`.brand-word` rules scaled to about
72% (58px→42px icon width, 22px→16px/25px→18px type) so the taller wordmark still fits the
topbar's thin 11px-row height without forcing it to grow much; `.topbar`'s own
`align-items:baseline` needs to become `align-items:center` for the same reason, or the
wordmark sits too high against the theme-toggle/tag text on its right. No JS or fallback
needed — a single fixed `href` is enough now that there's no GitHub-repo alternative to fall
back to.

## JS architecture notes

- No frameworks. A single page-scoped IIFE with a plain `state` object, a `render()` that
  re-derives every DOM update from `state`, and DOM ids grabbed once via a small `$()`
  helper.
- The hero diagram's geometry is computed in a `geom(w, ...)` function where `w` is the
  *measured* CSS pixel width of its container (via `ResizeObserver`), and the SVG's
  `viewBox` width is set to that same `w` — so 1 viewBox unit equals 1 real CSS pixel. This
  lets fixed-size HTML label overlays (positioned by percentage) line up with the SVG
  underneath regardless of how the page has been resized, without hardcoding a canvas size.
- Prefer JS-driven `requestAnimationFrame` tweens over CSS `transition`/`transform` for any
  SVG geometry animation — see the "gotcha" note in [HANDOVER.md](HANDOVER.md) under
  `straw-hose-flow.html`'s history.
- **Any animation that runs on its own — with no user action ending it — must check
  `prefers-reduced-motion` before it starts.** Two shapes of this on the site:
  - A **continuous decorative loop** with no pause control (the orbiting planet in
    `keplers-third-law.html`, the scrolling exhaust/flow dashes in `rocket-equation.html` and
    `straw-hose-flow.html`): just don't call the initial `requestAnimationFrame(tick)` when
    `matchMedia('(prefers-reduced-motion: reduce)').matches` — the page still renders
    correctly at rest, it simply doesn't move on its own.
  - A **bounded tween triggered by interaction** (the car easing along the road in
    `braking-distance.html`, the column height easing to its target in `ocean-salt.html`):
    snap straight to the end state instead of easing — either set the tween's duration to
    ~0 or skip the loop and assign the final value directly. The end state is what carries
    the information; the easing there is decoration, unlike `earth-moon-race.html`'s bouncing
    light or `lightning-distance.html`'s "play it out" wavefront, where the animation *is*
    the content the user asked to see by pressing play — leave a genuinely user-initiated,
    bounded animation alone.
  - Compute `reduceMotion` once at the top of the page's IIFE, next to the other constants —
    don't re-query `matchMedia` inside the render loop.
