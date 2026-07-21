# WorkLife Balance

A localhost tool for calculating and visualizing quality-of-life trade-offs across different career paths. Users set obligations, job characteristics, and financial parameters, then see a composite QoL score and visualization showing where the optimal trade-off lives.

## Quick Start

```bash
npm install
npm run dev  # localhost:5173
```

## Architecture

Three layers — read ARCHITECTURE.md for full design rationale.

- **Layer 1 (Config):** `src/config/defaults.yaml` defines all default values. Loaded via Vite `?raw` import + `js-yaml`. Edit YAML → Vite hot-reloads.
- **Layer 2 (Engine):** `src/engine/` — pure TypeScript functions, no React. All calculation logic lives here. This is the code users want to read and tweak directly.
- **Layer 3 (UI):** `src/components/` — React components that render config, call engine, pipe results to visualizations.

**Key rule:** UI components never contain formulas. They call engine functions and display results.

## What Exists (as of initial scaffold)

- **Obligations system:** fully working. Default obligations from YAML (sleep, hygiene, meals, commute, cleaning, errands, childcare, exercise). Users can add/remove custom obligations, toggle active/inactive, edit hours, view in day/week/month/year, see defaults with reset-to-default, see cost-to-eliminate badges.
- **Time breakdown:** free time = 24hrs - work - sum(active obligations). Visualized as a stacked color bar + big free-time number.
- **LabeledSlider:** reusable slider with labeled stops at fixed points. The primitive for all future parameter sliders.
- **Period toggle:** day/week/month/year conversion throughout the UI.
- **Tab layout:** visualization top half, tabbed editor bottom half. Obligations tab works; Work Profile and Financial tabs are placeholders.

## What Needs Building Next

See ARCHITECTURE.md "Roadmap" section for detailed specs on Work Profile and Financial tabs, and how they combine into the composite QoL score.

## Code Conventions

- `js-yaml` must be imported as `import * as yaml from 'js-yaml'` (no default export)
- YAML files imported via `?raw` suffix — type declarations in `src/config/yaml.d.ts`
- Engine functions are pure: `(inputs) → outputs`, no side effects, no React
- All time values stored internally as hours-per-day, converted for display only
- CSS uses BEM-ish naming: `component__element--modifier`
- CSS variables for theming defined in `src/index.css` (supports light/dark)
