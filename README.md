# MeetingIdle — Hearthroot 🌿

**Playable prototype: Survival Farming.** Keep a floating settlement fed while crops grow, weather changes, and wild vegetation spreads.

**[Play Hearthroot](https://ersoykadir.github.io/MeetingIdle/)** · [Game design](docs/survival-prototype.md) · [Visual baseline](docs/art/survival-farming-baseline.webp) · [Archived Understory prototype](archive/understory-v0.2.html)

## Core economy

Harvested crops are the resources themselves. There is **no separate Seeds currency or planting stock**:

| Crop | Typical unupgraded harvest | Plant new field | Sell 1 crop |
| --- | ---: | ---: | ---: |
| 🌾 Grain | 5 grain / ~2 days | 2 grain | 1 coin |
| 🥕 Roots | 8 roots / ~3 days | 3 roots | 2 coins |
| 🫐 Berries | 11 berries / ~4 days | 4 berries | 3 coins |

A harvest adds its yield to that crop's inventory. All crop inventories count toward the **Pantry** supply, together with unprocessed starting rations.

You can spend each harvested crop in three competing ways:

1. **Replant** it on a free tile, paying the matching crop's planting cost. Existing planted fields continue to regrow at no additional cost.
2. **Sell** surplus in **Market & upgrades** (1 or 5 units per sale) to earn Coins.
3. **Feed settlers.** At each dusk, settlers automatically consume stored rations first, then grain, roots, and berries in that order. Food sold or planted is no longer available to eat.

Coins can be reinvested in two ways:

- **Crop-specific irrigation:** increases the growth speed of one crop species by 20% per level (maximum five levels). Prices increase per level.
- **Field quality:** select **Inspect**, tap an individual crop plot, and purchase a quality improvement for that field (maximum five levels). Each level increases that plot's harvest yield by 25%. The first upgrade costs 8 Coins; later costs increase. Clearing or replacing the field discards its invested quality.

This creates an explicit survival-versus-expansion decision: preserving produce keeps the settlement fed, but selling or replanting some of it increases future production.

## Survival

- Start on day 1 with five settlers, **12 stored rations**, zero harvested crops, zero Coins, and five established fields.
- Each settler eats **2 food per game-day**. The harvest is processed before the daily meal. Food and inventories never go negative.
- Shortages reduce hope by up to 15/day proportional to the shortfall; fully fed days restore +1 hope.
- Every fifth completed day, one settler may arrive if the preceding period was fully fed, hope is at least 70%, and pantry food covers five days for the larger population. There is no extra ration bill.
- Weather affects growing crops. Wild thickets spread and can reduce crop productivity.
- Tap the compact settlement badge to see the five-day food forecast; it uses the same harvest-and-meals simulation and does not mutate the live inventory.

## Controls

Choose Grain, Roots, or Berries on the toolbar, then tap a grassy tile to plant; their buttons show **units stored**, not available planting counts. If the inventory cannot cover planting cost, the tool is disabled. Use **Clear** for a plot/thicket or **Inspect** to examine and improve a planted field.

Use **Market & upgrades** to see inventory, sell produce, or improve irrigation. Drag horizontally or use ↶ ↷ to rotate the island. Use ±, mouse wheel or pinch to zoom.

The **Developer console** offers Pause, 1×–100× speed, +1/+5/+10/+30 day skips, and editable rations, Coins, settlers, hope and the three crop inventories.

## Temporary playtest rules

**Every refresh/reopen starts a new settlement.** Gameplay saves are intentionally cleared and not written for now. Zoom, mission panel and help preferences persist. The same open page simulates up to ten days after suspension. **Reset game** immediately restarts day 1 and returns the clock to 1×.

This is mechanics-first placeholder art. The intended final direction is an orthographic 3D world with crisp, detailed pixel rendering.

## Development and deployment

The prototype is dependency-free; open index.html in a browser. Most UI, simulation and rendering logic is there.

Run:

    node tests/survival-sim.cjs

The simulation tests cover meals, conservation, harvest resource attribution, purchasing, planting, selling, field quality, crop speed, forecasting, 120-day economic accounting, controls, reset behavior, and session catch-up.

GitHub Pages deploys from the main branch through the workflow in .github/workflows/pages.yml. The test workflow runs for pull requests before merge.
