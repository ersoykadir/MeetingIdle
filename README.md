# MeetingIdle — Hearthroot 🌿

**Current playable experiment: Survival Farming.** Keep five settlers fed on a floating island while crops grow and wild vegetation spreads.

**[Play Hearthroot](https://ersoykadir.github.io/MeetingIdle/)**

Choose grain, roots, or berries and click grassy tiles to plant; harvests happen automatically. Every five game-days, the settlement consumes 55 food, and shortages lower hope. Weather and spreading thickets affect production. Drag horizontally or press the arrows to rotate the island.

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
3. Open **Actions** and (if needed) run **Deploy Understory to GitHub Pages** manually. The workflow also deploys on each push to `main`.
4. Visit `https://ersoykadir.github.io/MeetingIdle/` after the deployment completes.

## Development

This is a dependency-free JavaScript prototype. UI, styles, save/load, and gameplay logic are contained in `index.html` for easy modification.

Game progress is stored per browser and per site origin. Progress saved in a local HTML file is not automatically transferred to the GitHub Pages URL.