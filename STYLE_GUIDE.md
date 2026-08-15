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
- Per-concept accent colors (e.g. the four fluid colors in straw-hose-flow) sit outside this
  token set as their own hex constants, since they carry semantic meaning (identifying a
  specific fluid/object) rather than being theme chrome.

## Typography

- Body font: `Georgia,"Iowan Old Style","Palatino Linotype",serif` — the reading face for
  title, subtitle, and prose. No web fonts (Google Fonts etc. are an external dependency;
  the earlier draft this style was ported from used one, but the site's `system font
  fallback` constraint always wins over matching a draft exactly).
  everything numeric or code-like (`.mono` utility class):
  `ui-monospace,"Cascadia Code","SF Mono",Consolas,monospace`, with
  `font-variant-numeric: tabular-nums`.
- That serif/mono contrast is the *only* typographic system — don't add a third typeface.

## Page skeleton

Top to bottom, in this order:

1. **`.topbar`** — back link (`&larr; Physics you can see`) on the left, a small-caps
   monospace tag naming the underlying law/equation plus the theme toggle button on the
   right.
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

**Presets row** — text-styled buttons (no border/background, just an underline), each
setting the full interactive state to a named real-world example in one click.

**Back link** — `<a href="../index.html" id="backLink">&larr; Physics you can see</a>` in the
topbar only resolves when the file is actually sitting in `visualizations/` next to the site
index — true when opened straight from the repo (the primary use case per CLAUDE.md) or from
a real deployment at the same relative layout, but not when the page is published standalone
(e.g. as an Artifact), where there's no sibling `index.html` to reach and the link 404s. Every
page detects this and falls back to the GitHub repo instead of leaving a dead link — add this
right after the theme-toggle's `applyTheme(currentTheme());` call:

```js
(function(){
  var backLink = document.getElementById('backLink');
  if(!/\/visualizations\/[^\/]+\.html?$/i.test(location.pathname)){
    backLink.href = 'https://github.com/OttawaVisuals/Simple_Viz';
    backLink.target = '_blank';
    backLink.rel = 'noopener';
    backLink.textContent = 'Simple Viz on GitHub ↗';
  }
})();
```

The check is a pure `location.pathname` regex — no `fetch` probe, since `fetch` to a relative
path on a `file://` page is blocked by CORS in Chrome and would false-negative on exactly the
"open the file directly" case this is meant to protect.

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
