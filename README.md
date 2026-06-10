# Calculus 3D Explorer

Interactive 3D web app that teaches calculus playfully — from secants and tangents to Riemann sums, solids of revolution and gradient ascent. Seven game-like levels, bilingual EN/DE, built with Three.js + KaTeX, zero build step.

> **Built from a single prompt.** The core app was developed autonomously by Anthropic's **Fable 5** running in **Claude Code loop mode**: 8 self-paced iterations, one level per iteration, each verified by an automated smoke test before moving on. Bilingual support was added with one follow-up prompt.

## Quick start

No build step, nothing to install — any static file server works:

```bash
git clone https://github.com/pianomanstride/calculus.git
cd calculus
python3 -m http.server 8741
# open http://localhost:8741
```

Three.js and KaTeX load from a CDN, so an internet connection is required.

## The journey — 7 levels

Each level pairs an interactive 3D scene with a short explanation, live KaTeX formulas, and a small mission. Completing a mission unlocks the next level (progress is stored in `localStorage`).

| # | Level | Concept | Mission |
|---|-------|---------|---------|
| 1 | Feel the Slope | Secant & average rate of change | Set the secant to a slope of exactly 1.2 |
| 2 | The Tangent | Limit of the difference quotient | Shrink h below 0.05 and reveal the hidden tangent |
| 3 | The Derivative Function | f′(x) as a function of its own | Trace the full derivative curve yourself (≥ 95 % coverage) |
| 4 | Area Under the Curve | Riemann sums → definite integral | Stack blocks until the error drops below 0.5 % |
| 5 | Solids of Revolution | Disk method, V = π·∫f² | Spin the area 360° and capture the volume (error < 1 %) |
| 6 | Landscapes: f(x, y) | Partial derivatives on a surface | Find a critical point — peak, valley or saddle |
| 7 | The Gradient | Steepest ascent, ∇f | Summit game — with a local-maximum trap and a neural-network punchline |

Tip for reviewers: unlock everything at once via the browser console — `localStorage.setItem('calculus3d.unlocked','7')` — and reload.

## Controls

- **Rotate / zoom** the 3D scene with the mouse (OrbitControls)
- **Sliders and buttons** in the right panel drive each level's interaction
- **EN | DE** toggle at the top left switches the entire UI language (persisted)

## Architecture

```
├── index.html        # entry point, CDN import map, layout
├── style.css         # dark theme
├── main.js           # app shell: level registry, unlock logic, language switch
├── lib/
│   ├── scene.js      # shared Three.js stage + reusable 3D building blocks
│   ├── math.js       # pure math helpers (sampling, numeric derivative)
│   ├── ui.js         # KaTeX rendering, slider factory
│   └── i18n.js       # EN/DE dictionary, t() lookup
└── levels/           # one self-contained ES module per level
```

Each level exports `init(ctx)` and receives the shared stage (a Three.js scene with a disposable level group), the side-panel DOM slots, and a `complete()` callback. Levels are lazy-loaded via dynamic `import()`.

**Stack:** Three.js 0.165 (ES modules via CDN import map), KaTeX 0.16, vanilla JavaScript. No bundler, no framework, no dependencies to install.

## How it was built

The app was created inside a [Claude Code](https://claude.com/claude-code) session using `/loop` (dynamic, self-paced mode) with a single instruction, roughly: *"Build a 3D browser app that explains calculus playfully, from simple to advanced — one level or one well-scoped improvement per iteration, smoke-test each iteration, done when all 7 levels are playable."*

Fable 5 then ran 8 autonomous iterations: scaffold + level 1, then one level per wake-up, then a final full-app verification pass — each iteration syntax-checked all modules, verified import resolution and confirmed every file serves over HTTP before scheduling its own next run.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
