# MeetingIdle — Hearthroot 🌿

**Current playable experiment: Survival Farming.** Keep five settlers fed on a floating island while crops grow and wild vegetation spreads.

**[Play Hearthroot](https://ersoykadir.github.io/MeetingIdle/)**

**Reset anytime:** click **Reset game** beside **Improvements** to immediately return to day 1 with five settlers, 12 food and the original fields.

**Temporary playtest mode:** every opening or page refresh starts a fresh settlement. Existing game saves are cleared and new progress is not saved. Zoom and panel preferences are retained.

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

During playtesting, game progress only lasts while the page remains open. Refresh or reopen to restart with five settlers, 12 food, no Seeds or upgrades, and the original fields.

## Daily food rules and verification

- Harvest first, then consume up to `settlers × 2` food. Food never becomes negative.
- Each shortfall day costs `ceil(15 × missing food / daily need)` hope, down to a minimum of 5; a fully fed day restores 1 hope, up to 100. No deaths or deferred food debt.
- Arrival checks happen after the fifth daily meal. A new settler eats from the following day. Arrival does not spend food.
- Forecasts simulate the next five harvests and meals using current crops, upgrades, weeds and weather, holding population fixed. They show any shortfall even if later harvests refill the pantry.
- Temporary `RESET_ON_LOAD` mode ignores and clears saved game progress on every load and disables new game saves. Camera zoom, panel and help preferences remain stored. Suspending and returning to the same open page still simulates at most ten days.

Run `node tests/survival-sim.cjs`. The suite covers a 120-day food ledger, growth conditions, forecast accuracy, shortages, reset behavior with old/new saves, suspended-tab catch-up, upgrades, zoom, rotation and UI updates. The Pages workflow runs this suite before deployment.


## Developer console

Open **Developer console** above Improvements. It provides:

- **Pause** and **1×, 2×, 5×, 10×, 25×, 100×** game speeds (normal speed is 16.5 seconds/day). The selected speed remains active after closing the panel.
- **+1, +5, +10, +30 days**, using the normal harvest, daily meal, weather, hope and arrival simulation, including while paused. Day skipping restarts the day timer.
- Editable **pantry food, Seeds, settlers and hope** with an **Apply values** button. Forecasts and daily consumption update immediately. **Read current values** refreshes the inputs without applying edits.
- **Reset game**, restoring the starting settlement and 1× speed while keeping the console open.
- Live day, speed, food consumption and last-dusk results.

Edits are session-only. They preserve the current review period's shortfall history; use Reset game for a clean test. Resource counts accept whole numbers: pantry/Seeds 0–1,000,000,000; settlers 1–10,000; hope 5–100. Invalid edits change nothing. The regular zoom, rotation and improvement controls remain available after closing the console.
