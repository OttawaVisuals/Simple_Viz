# Design brief checklist

This is **Claude's checklist for what to ask you**, not a form for you to fill out solo. The
lowest-friction way to use it: just describe the page in chat, conversationally, and let
Claude ask follow-ups against this list until every box is covered. Filling it out yourself
in advance is fine too if you'd rather, but isn't the expectation.

Other ways to get a brief started, if a blank chat message is easier than either of those:
- **Talk it through out loud** (ramble, no structure) — Claude organizes it after.
- **PowerPoint**, since that's already comfortable for layout — add a speaker note per
  element describing its behavior (see section 3/4 below for what "behavior" means) instead
  of writing a separate doc.

The goal either way is to describe **behavior and state**, not just a static layout — a
screenshot or PowerPoint slide only shows one moment; most misunderstandings on this project
have been about what happens *between* moments, not where things sit.

---

## 0. Quick checklist

- [ ] What's the **equation or concept**, and what real numbers ground it?
- [ ] What's the **reading order** top-to-bottom?
- [ ] For every icon: what does it look like **at rest**, **on change**, and **at an
      extreme/alert state**?
- [ ] For every animation: **what moves, what triggers it, and what happens at the edges**?
- [ ] For every piece of text: is it a **title, label, live readout, or caption**? (Different
      jobs — don't let two of them share one piece of text.)
- [ ] Is there an **existing page or a real-world object** to anchor a new element to,
      instead of describing it from scratch?

If in doubt, sketch it — even a rough box-and-arrow drawing beats a precise mockup, because
its imprecision signals "this part doesn't matter, the behavior does."

---

## 1. Concept

- Equation(s)
- Real numbers / reference values to use
- The one insight the page should deliver ("after playing with this, the user should feel
  that ___")
- Known simplifications / what's deliberately left out (state honestly in-page, per
  [CLAUDE.md](CLAUDE.md))

## 2. Page layout

- Reading order, top to bottom
- Grouping: which elements visually belong together — is proximity enough, or do you want
  explicit connectors (lines/arrows)?
- Dominant element: the one thing that should carry the most visual weight
- Anchor reference: "like page X, but ___" beats describing a new layout from scratch

## 3. Icons

For each icon or visual element that isn't plain text or a slider:

- Name / what it represents
- At rest: literal (a droplet, a person) or abstract (a bar, a dot)? Line or solid?
- On change: recolor, resize, swap to a different icon, or add/remove sub-elements? Is any
  "fill" driven by the raw value, or by the value's position among the other options (matters
  a lot when the options span multiple orders of magnitude — a linear fill by raw viscosity
  makes water and honey look identical to air; a position-based fill doesn't)
- At an extreme / alert state: does it change again past a threshold, or does something else
  (text, a gauge) carry that signal instead?
- Anchor reference: "like the gauge in straw-hose-flow.html" beats a fresh description

## 4. Animation

For each moving element:

- What moves: a single element, a group, the whole scene?
- Trigger: always looping, only on change, only past a threshold?
- Motion type: position along a path, scale, rotation, fade, particles?
- Speed mapping: tied to a real physical quantity, or just "looks lively"?
- At the edges: freeze, reverse, loop, disappear?

## 5. Text

For each text element, name its job — title, label, live readout, or caption — whether it's
static or dynamic, and roughly where it sits. A short list is easiest, e.g.:

- Title, static, top: "Why the straw gives up."
- Subtitle, static, below title: the concept + real numbers in one sentence
- Control labels, static, above each slider: "Fluid" / "Length" / "Diameter"
- Live readouts, dynamic, beside each label: current value
- Verdict, dynamic, next to the marker: "Possible" / "Impossible"
- Footnote, static, bottom: caveats and approximations

## 6. Anything else

- Color / state semantics beyond the default (ok / warn / bad) palette
- Mobile/narrow-width behavior, if it matters for this page
- Anything explicitly *out of scope* for this pass

---

## Why this exists

Logged after the `straw-hose-flow.html` redesign kept missing the mark despite a PowerPoint
mockup: static images encode position well but drop behavior entirely (what an element looks
like *before* a change, what triggers a change, what "update" even means for a given
element). This checklist exists to make behavior explicit up front instead of discovering the
gap after a build. See [HANDOVER.md](HANDOVER.md) for the concrete history this came out of.
