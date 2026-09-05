# Life Observatory — Frontend Redesign Notes

## Browser-verified problem inventory (baseline, 2026-09-05)
Reviewed live @ 1440x900 and 390x844. Console clean, no overflow-x.

### Global
- Header search input text clipped on left ("Qsk anything") — layout/padding bug, ALL pages.
- Greeting "Good afternoon, Alex / A calmer, kinder you is a stronger you" — cheesy, cramped.
- Sidebar cramped/narrow; brand block tight; random floating italic quote mid-sidebar; Settings/Help cramped.
- Over-reliance on white rounded cards (radius 24-30px) → "grid of SaaS widgets".
- Everything equal visual weight → weak hierarchy. Two pull-quotes on home.

### Home
- Hero eyebrow clipped ("OU'RE MOVING FORWARD"); generic clip-art sun/mountain/pines; templated feel.
- 9 stacked equal-weight cards across two columns.
- Life Horizon: x-axis dates WRONG (shows Mar–Aug; data is Jun–Sep); "Aug 20?" clipped; redundant domain status row duplicates top legend; lines bunched flat then spike (bad normalization).

### Chat — CRITICAL
- Raw markdown rendered literally: "### 1. What I See", "- **Option A:**". Must render as real UI.

### Timeline
- No timeline spine; stacked cards; repetitive filler ("Followed by updated momentum in this domain").
- 3-column per-card layout = DB rows.

### Insights
- Literal duplicate of Home's 3 components. No unique value.

### Goals
- Large sparse cards, awkward right-floated buttons, unbalanced whitespace.

### Connections
- Best content; still generic cards; cramped 3-col mini-section.

### Evidence modal
- Raw ISO timestamps ("Occurred At: 2026-09-05T04:44:40.749Z"), raw "User Reflection:" prefixes, truncated text, duplicate entries. Technical, breaks trust.

### Mobile
- Hero illustration overlaps text; eyebrow/legend/chart-dates clipped.
- 7-item bottom nav overcrowded.

## Design direction (decided)
Concept: an **observatory / observational instrument** — quiet, patient observation of gradual change.
- Signature: the **Life Horizon ridgeline as a living masthead** = the true hero of Home. Editorial headline states the single most important observation, drawn from real data, set over/near the horizon.
- Composition over cards: full-width editorial sections, hairline dividers, generous vertical rhythm, background bands (canvas vs subtle). Cards reserved for genuinely card-like atoms (one reflection, one source).
- Typography: Fraunces (display/serif, the human voice) + one clean sans (body/UI) + a MONO for labels/axis/timestamps/confidence (the instrument/measurement voice) — the signature typographic move.
- Palette: refine, don't replace. Paper canvas + ink; restrained forest green primary + one warm accent. Spend color boldness only in the Horizon.
- Dial back radius (24-30 → ~10-14) and shadows → kills SaaS-widget feel.
- Insights becomes the deep-dive (distinct from Home): full What Changed + drift + all insights w/ evidence.

## Progress log
- (in progress) reading data contract + components before building.
