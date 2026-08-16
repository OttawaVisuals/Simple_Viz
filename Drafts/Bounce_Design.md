# Design brief — "Count the bounces"

Filled out per [DESIGN_BRIEF_TEMPLATE.md](../DESIGN_BRIEF_TEMPLATE.md), as a proposal to
react to rather than a spec to build blind — flagged **OPEN** wherever a call is mine to make
but easy to overrule.

---

## 1. Concept

**Equations**

- Coefficient of restitution, from one measured bounce: `e = √(h₁/h₀)`
- Height after n bounces: `hₙ = h₀·e^(2n)`
- Bounces until the height drops below a threshold hₘᵢₙ: `n = ln(hₘᵢₙ/h₀) / (2·ln e)`
- Total bounce time, idealized (infinite bounces, finite time — a geometric series/Zeno
  result): `T = t₀·(1+e)/(1−e)`, where `t₀ = √(2h₀/g)` is the first fall time

**Real numbers / reference values** — e depends on the ball *and* the surface, not the ball
alone, so this page needs a picker of real ball+surface pairs rather than a single "bounciness"
slider. Approximate, commonly-cited restitution values (**OPEN — I'd verify/source these
properly before shipping, treat as placeholders for now**):

| Ball | Surface | e (approx.) |
|---|---|---|
| Superball / bouncy ball | Concrete | 0.85–0.90 |
| Basketball | Hardwood | 0.75–0.80 |
| Tennis ball | Concrete | 0.70–0.75 |
| Tennis ball | Grass | 0.50–0.55 |
| Golf ball | Concrete | 0.65–0.70 |
| Tennis ball | Carpet | 0.30–0.40 |

The site already treats a combined coefficient as an *approximation* rather than exact contact
mechanics (per the equation brainstorm) — the note should say so plainly, same honest-value
treatment as straw-hose-flow's fluid viscosities.

**The one insight**: after playing with this, the user should feel that "a ball doesn't stop
bouncing suddenly — it keeps going, shrinking by the *same fraction* every single bounce,
which is why the bounces speed up right before they vanish, and why a drum under it lets you
keep counting long after your eyes give up."

**Known simplifications, stated in-page**: pure vertical drop only (no spin/side-slip); e held
constant across all bounces of a run (a real ball's e drifts slightly as it slows, and yaws
sideways over many bounces — both ignored); the "infinite bounces in finite time" total is the
idealized textbook result — a real ball stops a little sooner (rolling losses, air drag, energy
lost sideways), noted but not modeled.

## 2. Page layout

Standard skeleton (topbar → topgrid → hero → resultrow → presets → note), same as every other
page — no structural deviation needed here.

- **Dominant element**: the hero — a real-time bouncing ball, decaying visibly, is the whole
  point, same register as `pendulum-period.html`'s genuinely-animated swing rather than a
  static-per-render diagram.
- **Anchor reference**: `pendulum-period.html` for the animation model (Play/Pause/"Drop again"
  controls, real-time physics, `reduceMotion` defaults to paused) + `straw-hose-flow.html` for
  the discrete ball/surface picker pattern (like its fluid picker).

## 3. Icons / hero diagram

**The ball** — a simple filled circle, falling and bouncing along a vertical line above a floor
line. At rest: sits on the floor at the drop point before release. On change (height slider):
repositions its start height. During animation: real 1:1-time vertical motion — free-fall down,
instant elastic-ish rebound up to `e²` times the previous peak, repeating. No color change or
alert state; the *shrinking arcs* are the whole signal, not a recolor.

**Peak-height ghost markers** (**OPEN, but recommend it**) — as bounces happen, leave a faint
dashed horizontal tick at each bounce's peak height, so the geometric decay is visible as a
staircase even after the ball itself is moving too fast/small to track by eye. Fades old ticks
slightly so the newest are clearest. Anchor: similar spirit to `braking-distance.html`'s
persistent measurement marks, adapted to a vertical decay instead of a horizontal one.

**The floor / balloon-drum toggle** — a plain floor line by default. Toggling "with balloon
drum" on swaps the floor's visual to a taut membrane (drawn as a shallow arc that flexes down
slightly on each impact) and, critically, keeps emitting a visible "thock" pulse (a small
expanding ring, per-bounce) even once the ball's own visible height has dropped below the
render threshold — this is the page's answer to "how would I actually keep counting at home."
**OPEN**: is the balloon-drum toggle in scope for v1, or a stretch goal? It's the single most
distinctive idea from the brainstorm, but the page is fully coherent without it (the ghost-mark
staircase alone tells the story). I'd build the base page first and add the drum toggle if
there's time/appetite.

## 4. Animation

- **What moves**: the ball (position), the floor membrane if drum mode is on (small
  flex/pulse), the peak-tick trail (appends, fades).
- **Trigger**: Play/Pause + "Drop again" buttons, same as pendulum-period — starts playing by
  default unless `prefers-reduced-motion`, in which case it starts paused at the full decay
  already drawn (all ticks placed, per the reduced-motion pattern for bounded interaction
  tweens).
- **Motion type**: real kinematic free-fall/rebound, not eased — `y(t)` from actual `d = ½gt²`
  segments chained bounce to bounce, same "genuinely animate the real physics" approach as
  pendulum-period's semi-implicit integration (this one's exact and closed-form per bounce, so
  no integrator needed, just piecewise parabolas).
- **Speed mapping**: real time throughout — even a low-e combo (tennis ball on carpet, few
  bounces) finishes in a couple of seconds at typical household heights (0.5–1.5 m), and a
  high-e combo (superball on concrete) just runs longer with more visible bounces, which is
  itself part of the point. No time compression needed (checked: `t₀ = √(2·1.5/9.8) ≈ 0.55s`,
  and even at e=0.9 the geometric total `T = t₀·(1+e)/(1−e) ≈ 10.5s` — comfortably watchable).
- **At the edges**: animation runs until height drops below a small render-floor (a few mm
  equivalent), then the ball parks at rest on the floor; "Drop again" resets to the top.

## 5. Text

- Title, static, top: "Count the bounces."
- Subtitle, static, below title: states the equation's shape and the real numbers in one
  breath — e.g. "Each bounce returns the same fraction of the last — drop a tennis ball on
  concrete and it keeps roughly 70% of its height, bounce after bounce, until you're left
  counting the sound of it."
- Control labels: "Drop height" (slider), "Ball & surface" (picker)
- Live readouts, beside legend rows: `h₀`, `e` (from the current pair), `n` (computed), `T`
  (computed)
- Result readout, dynamic: big number = bounces until the ball drops below the visibility
  threshold, e.g. "**14 bounces** before it's too small to see" with a secondary line giving
  the total time, "≈6.2 s, start to (nearly) stop." No possible/impossible gauge — there's no
  natural limit line here (same shape as gravity-lab/mass-energy's no-gauge treatment), so the
  "gauge" slot is replaced by the peak-height staircase living in the hero itself.
- Footnote/note, static, bottom: names the coefficient-of-restitution equation, links a source,
  states the combined-surface approximation and the idealized-infinite-bounces caveat.

## 6. Anything else

- **Drop height slider range**: 0.3–2 m (**OPEN** — chosen to span "off a table" to "over your
  head," household-reachable without a ladder; easy to widen).
- **Presets**: "Superball on concrete" (many visible bounces, longest-running), "Tennis ball on
  carpet" (dies in 2–3 bounces, makes the contrast concrete), "Basketball off a table," "Golf
  ball on concrete."
- Mobile/narrow: standard single-column stack per the site breakpoints; no bespoke behavior
  needed since the hero is a single vertical lane, not a wide horizontal scene.
- Out of scope for this pass: spin/sideways drift, e drifting across bounces, anything beyond
  the vertical 1-D drop.

---

## Open questions for you

1. Are the restitution values in the table above OK as placeholders, or do you want me to dig
   up better-sourced numbers before building?
2. Balloon-drum toggle: build it into v1, or ship the base page first and add it after?
3. Peak-height ghost-mark staircase — good as the no-gauge substitute, or did you have
   something else in mind for the result panel?
4. Any preferred real ball/surface pairs beyond the four presets above?
