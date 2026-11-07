# Atlas Play on Made clear

Published page: `visualizations/atlas-play.html` at https://madeclear.ca/visualizations/atlas-play.html

The checked-in HTML bundles React, Anime.js, icons, country/city data and the map inline. Cloudflare Pages serves it directly with no deployment build step or Sites account. System fonts replace remote web fonts. Country flags (flag-icons, MIT) are bundled as SVG images for reliable display on Windows; country names remain visible. Light/dark mode and reduced-motion controls are included.

To edit/rebuild (Node 22.13+):

```sh
cd scripts/atlas-play
npm ci
npm test
npm run build
```

Commit source changes and the generated HTML together. Data download links use in-memory Blob URLs. Border-data license and bundled library notices are retained. The approved quiz design is retained as an exception to the physics-page template.

Answer maps fit the actual country outlines or city points. City pinning supports up to 64× zoom, mouse wheel, touch pinch, dragging, a zoom slider and keyboard controls; these controls never reveal the correct location before submission. Full question headings include the measure and subject. Laptop layouts use a compact intro, four controls in one row, shorter cards and sticky answer actions. Mobile controls keep their stacked layout. City ranking uses a three-city podium: first place is the largest population, second the middle, third the smallest. Drag cards onto positions or select a city and tap a position; dragging between occupied positions swaps them. Submission requires three unique valid cities. Feedback and populations appear directly on the podium. Country rankings across all 21 measures use the same three-place podium, with country flags and outlines. First place means the highest numerical value, followed by middle and lowest. Country and city podiums share drag, swap and tap/keyboard controls. After submission, each position shows correctness, true rank and source value; the podium scrolls into view. Insertion rounds use a floating country card and highlighted gap targets.

Country coverage is 54 selected countries; city coverage is worldwide. Difficulty is a numerical heuristic, not measured player performance. Dataset years and limitations remain in the in-game Data panel and documentation below.

---

# Atlas Play
A visual geography quiz with nine question styles, 21 numerical measures, relative-gap difficulty, and worldwide city rankings.

## Run and check
- Start: `npm run dev`
- Logic/data checks: `node --experimental-strip-types scripts/check-game.mjs`
- Types: `node node_modules/typescript/bin/tsc --noEmit`

## Difficulty model
Relative gap = `abs(A - B) / max(abs(A), abs(B))`.

For two-country comparisons of population, area and other wide-range measures:
- Hard: gap <=25%.
- Medium: gap >25% and <65%.
- Easy: gap >=65%.

Bounded measures and multi-item questions use within-measure/style thirds from a reproducible seeded bank of 420 eligible sampled questions. Rankings use the closest adjacent gap; insertion uses the closest target-to-anchor gap. Historical questions score gaps between population indices (2000 = 100), while answers compare percentage growth.

City rankings use three different UN country/area entries, meet the selected population threshold, and exclude population gaps below 3%. The default pool has 511 urban areas of at least 1 million people. The advanced pool has 6,172 urban areas of at least 100,000 people, across 180 countries/areas.

Estimates change their stated tolerance by difficulty. World pins accept 700/350/150 km for easy/medium/hard and provide zoom controls. Border rounds are labelled Geography, with no numerical difficulty rating.

These are starting heuristics, not estimates calibrated from player results. City size separately controls obscurity. Numerical guards do not establish statistical significance.

## Data snapshots
| Data | Source and reference period |
|---|---|
| Population, land area, life expectancy, forest, internet use, GDP/person PPP, patents | World Bank 2023; density and patents/million use matching-year denominators |
| Renewable electricity | World Bank 2021, the latest usable common snapshot in this series |
| Alcohol per person aged 15+ | WHO via World Bank 2020; pure alcohol, including abstainers |
| CO₂/person | Global Carbon Budget via OWID 2023; territorial fossil/industry emissions, excluding land-use change |
| HDI | UNDP via OWID 2023 |
| Food energy supply and cattle/person | FAOSTAT via OWID 2023; supply is not food actually eaten; cattle use 2023 population |
| Doctorate attainment | OECD 2024, ages 25-64, both sexes, ISCED 8;29 of 54 quiz countries have observations |
| Fixed/mobile/total internet traffic | ITU via a World Bank public CSV,2024; decimalGB per resident per year, including business traffic |
| Height by sex | NCD-RisC 2016 via OWID; birthcohort 1996, estimated height at age 18 in 2014 |
| Life satisfaction | World Happiness Report 2026;2023-2025 averages and confidence intervals |
| World cities | UN WUP 2025 File 21; midyear 2025 population and population-weighted urban centroids |
| Maps | Natural Earth, public domain |
| Land borders | mledoze/countries, ODbL 1.0; snapshot 7 Nov 2026 |

The source panel contains exact definitions, years, URLs, coverage and attribution. The INSEE French pack remains a labelled legacy reference; current city rounds use UN harmonized urban centres, not city-proper or commuting-area populations. UN city data is CC BY 3.0 IGO, credited to United Nations DESA Population Division.

### Guards and gaps
- Every question compares the same observation year, cohort or period. Missing values are excluded, never zero-filled or borrowed from other years.
- Values that tie after display rounding are excluded.
- Happiness comparisons require nonoverlapping reported 95% confidence intervals.
- Doctorate comparisons require reported standard errors and nonoverlapping approximate 95% intervals (`estimate +/-1.96 SE`), plus the precision guard. This is conservative gameplay filtering, not a formal statistical test. Countries without uncertainty remain eligible for estimates.
- Height data is not current average height of the whole population. No uncertainty intervals are available in this export; comparisons require at least 2 cm separation.
- Traffic is per resident per year, not per subscriber or per month. Conversion is 1 EB=1 billionGB, using 2024 population. Total traffic requires both components.
- Time-use data is excluded because the accessible OECD table mixes national survey years.

## Reproduce / refresh manually
Base preparation: `fetch-data.py`, `prepare-data.py`, `fetch-extra.py`, `prepare-extra.py` in `scripts/`.

Expanded preparation: `fetch-core-new.py`, `fetch-lagged.py`, `fetch-food-hdi.py`, `research-unusual.py`, `research-cities-height.py`, then `prepare-expanded-data.py`.

Verify snapshot years and source metadata together before upgrading. Re-fetchable research caches under `data/raw/core-*`, `new-*` and `unusual-*` remain local and ignored. Normalized datasets, source metadata and reproducible scripts are tracked.

Statistics cover 54 selected countries; the city pool is worldwide. Best score and motion preference stay in the browser. Anime.js transitions respect reduced motion. No automatic refresh or cross-device persistence.


## Visual answer context

- **Electricity:** `public/data/visual-context.json` bundles 2021 World Bank WDI renewable, hydro, non-hydro renewable, coal, gas, oil and nuclear shares, including the published WLD aggregate. Country renewable values match the existing quiz snapshot. Country/world renewable bars use a genuine 0–100% scale; fuel rows are shown as reported. These are electricity output shares, not total energy use.
- Some separately published component series do not reconcile to 100%. No rescaling is applied. Other/unallocated is a positive derived residual only when every component is usable. Negative or over-100 component shares are excluded from the chart and retained in `invalidSourceValues`; missing values remain null. No missing/invalid value is converted to zero, and an over-100 sum is explicitly flagged.
- **Height:** the global means are the source's World observations for the same 1996 birth cohort and sex as the quiz (age 18 in 2014). They are not averages of the 54 quiz countries or current whole-population averages. The silhouette follows the estimate slider, then animates to the source height after answering; the world line stays fixed. Disabling motion updates it immediately.
- Animal silhouettes are scale cues. Labrador 60 cm and elephant 310 cm are illustrative shoulder heights within cited ranges; emperor penguin 110 cm is an illustrative standing height; Thoroughbred 162.56 cm is the exact conversion of the source's 16-hand withers reference. Individual sizes vary, and shoulder/withers and standing measurements are distinguished. Each marker has a source link and definition in the chart.
- Renewable answer visuals support every question style and let players switch between countries in the question. Height estimates have the live figure; other height question results have the same world/animal scale with country tabs. Visuals expose source notes and a downloadable context JSON in the Data panel.

Refresh from this directory with `python -X utf8 scripts/fetch-visual-context.py`, then `python -X utf8 scripts/prepare-visual-context.py`. The fetch script reuses files under ignored `data/raw/context-*`; remove a specific cache file when deliberately refreshing that series. Re-run `npm test` and `npm run build`; review source revisions and any new mismatches before committing normalized data and HTML together.


## Result position scales and ratio layout

Numeric results now include linear reference rulers with themed icons, exact values and a histogram showing counts of reference places per equal-width interval. The full range is the default; a labelled zoom option can isolate the question values without changing the underlying data. This is a value-position chart, not a percentile ranking.

Country population uses 1 million to the highest available 2023 World Bank country/economy observation; smaller highlighted countries sit at the left edge with a below-range label. Life expectancy uses 0–100 years with the published 2023 WLD benchmark (not maximum lifespan). Both reference pools include 217 non-missing country/economy observations, filtering regional/income aggregates using World Bank country metadata. Quiz observations are validated against the reference snapshot. Refresh with `python -X utf8 scripts/fetch-reference-scales.py`; files cache under ignored `data/raw/scale-*`.

City population uses the 2025 UN urban-area pool for the selected 1-million/100,000 threshold and keeps its UN source/period separate from country data. Other numeric measures use the available quiz-country pool, explicitly labelled as partial rather than worldwide. Electricity and human height retain their specialised visual contexts. Pin, border and history questions do not receive unrelated numeric-position charts. Download the global population/life reference JSON from the Data panel.

Ratio rounds now use a `round-gap` container; insertion buttons are separately scoped as `.insert-gap`. This prevents the insertion button's fixed height/flex layout from collapsing the ratio question and overlapping the heading. Ratio headings explicitly show the numerator ÷ denominator.
