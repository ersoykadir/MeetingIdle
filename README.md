# MeetingIdle — Hearthroot 🌿

**Current playable experiment: Survival Farming.** Keep five settlers fed on a floating island while crops grow and wild vegetation spreads.

**[Play Hearthroot](https://ersoykadir.github.io/MeetingIdle/)**

Choose grain, roots, or berries and click grassy tiles to plant; harvests happen automatically. Start with five settlers, each eating 2 food every game-day after harvest (10 food/day initially). Shortages lower hope. The settlement badge shows pantry supply, daily meals and a five-day harvest forecast. There is no extra five-day food charge. Every five completed days, one settler can join after a fully fed period if hope is at least 70 and stored food covers five days for the larger population. Seeds earned from harvests buy lasting farm improvements. Weather and spreading thickets affect production. Drag horizontally or press the arrows to rotate the island.

**This is a mechanics-first prototype.** The in-browser rendering is procedural orthographic-style 2.5D placeholder artwork—not the final true 3D pixel-art direction.

[Prototype details](docs/survival-prototype.md) · [Farming visual baseline](docs/art/survival-farming-baseline.webp) · [Archived Understory prototype](archive/understory-v0.2.html) · [Wild garden design](docs/game-design.md)

---

## Previous Understory prototype

**Understory** — a quiet, lightweight idle ecosystem game for short breaks between meetings.

**Play:** Once GitHub Pages is enabled, visit `https://ersoykadir.github.io/MeetingIdle/`.

## How to play

Start with two moss patches. Let your garden generate dew, plant more species, and discover ways to combine neighboring plants. Expand into a bigger garden, collect spores and glimmers, and experiment with plant arrangements.

- Idle resource accumulation and up to 8 hours of catch-up while away
- Four species with adjacency bonuses
- Permanent upgrades and expansion to a 7 × 7 garden
- Quiet view for discreet, low-attention play
- Autosave in your own browser using `localStorage`
- Responsive for mobile and desktop; no accounts or dependencies

## Run locally

Open `index.html` in a modern browser. There are no build steps or packages to install.

## Publish to GitHub Pages

1. Make the repository **Public** in **Settings → General → Danger Zone → Change repository visibility**, if using GitHub Free.
2. Under **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. Open **Actions** and (if needed) run **Deploy Hearthroot to GitHub Pages** manually. The workflow also deploys on each push to `main`.
4. Visit `https://ersoykadir.github.io/MeetingIdle/` after the deployment completes.

## Development

This is a dependency-free JavaScript prototype. UI, styles, save/load, and gameplay logic are contained in `index.html` for easy modification.

Game progress is stored per browser and per site origin. Progress saved in a local HTML file is not automatically transferred to the GitHub Pages URL.

## Daily food rules and verification

- Harvest first, then consume up to `settlers × 2` food. Food never becomes negative.
- Each shortfall day costs `ceil(15 × missing food / daily need)` hope, down to a minimum of 5; a fully fed day restores 1 hope, up to 100. No deaths or deferred food debt.
- Arrival checks happen after the fifth daily meal. A new settler eats from the following day. Arrival does not spend food.
- Forecasts simulate the next five harvests and meals using current crops, upgrades, weeds and weather, holding population fixed. They show any shortfall even if later harvests refill the pantry.
- Existing quota-era saves retain food, crops, Seeds, upgrades, hope, day and camera settings. They migrate to five settlers with no retroactive daily charges. New-format saves simulate at most ten offline days.

Run `node tests/survival-sim.cjs`. The suite covers a 120-day food ledger, growth conditions, forecast accuracy, shortages, old/new saves, catch-up, upgrades, zoom, rotation and UI updates. The Pages workflow runs this suite before deployment.
