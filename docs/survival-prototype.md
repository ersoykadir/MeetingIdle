# Survival Farming — First playable experiment

Working title: **Hearthroot**. This is the gameplay-first interpretation of [Issue #2](https://github.com/ersoykadir/MeetingIdle/issues/2), not a permanent rejection of the original [wild garden direction](game-design.md).

## Core premise

Five settlers live on a floating island. Plant useful species, allow the crops to harvest automatically, and meet a **55-food ration target every five game-days**. Keep nature under control without clearing away the whole forest. Shortages reduce hope, but never cause an immediate game over.

## Implemented

- Connected, irregular **104-tile** floating terrain with simple trees, wild thickets, farmland, and a cottage.
- Procedurally drawn, orthographic-style **2.5D** scene with **four horizontal 90-degree viewing angles**. This is not yet a true 3D renderer.
- Crops: **grain** (5 food in about 2 days), **roots** (8 food in about 3 days; tolerate frost better), and **berries** (11 food in about 4 days).
- Automatic crop harvest and regrowth; meadow planting, thicket clearing, and in-world tile inspection.
- Sunny weather, rain, wind, and frost. Rain helps growth and natural spread; frost slows most crops; wild thickets can encroach on crops and reduce yield.
- Local saves and capped offline simulation (up to 10 game-days).
- An accelerated game clock of **16.5 real seconds per game-day**, meant for rapid testing, not the final intended idle pacing.
- Minimal overlay UI for the settlement's food, hope, day, and target. Mouse/touch controls, including horizontal drag rotation.

## Art direction

![Survival farming art baseline](art/survival-farming-baseline.webp)

The image is a **reference concept**, not a screenshot or tileset. Our goal is rich, cozy-dark pixel-art with detailed vegetation, buildings, and a real **3D world rendered through a fixed-tilt orthographic camera**. The current game canvas is deliberately temporary and simpler.

## Controls

Plant using the Grain, Roots, or Berries tools. Clear wild vegetation or crops with Clear, and inspect the selected tile with Inspect. Drag horizontally or use the rotation arrows to view the island from other sides. The Help button describes the rules.

## Important questions to test

1. Is the five-day production target fun or does it create pressure unsuitable for an idle game?
2. Should wild growth offer **benefits** (soil, resilience, pollination) as well as obstacles?
3. Should we have a visible weather forecast and protective interventions?
4. Are shortages too forgiving or too punishing?
5. Is the farming settlement visually compelling enough to keep on a phone screen?
6. Can we create the approved art quality with reusable 3D assets and crisp pixel rendering, rather than static illustrations?

## Testing and limitations

A minimal Node smoke test lives at [tests/survival-sim.cjs](../tests/survival-sim.cjs). It covers initialization, planting, day progression, rations, rotation and a renderer call using a stubbed canvas. **Full browser visual QA has not yet been completed.** Individual citizens, production buildings, morale events, long-term seasons, meaningful ecological benefits, and polished 3D art are future work.

The original [Understory wild garden](../archive/understory-v0.2.html) remains playable for comparison.

## Prototype readability update

- Render the scene at **at least the display's CSS pixel resolution** rather than rendering tiny and scaling up on high-density phones.
- Strengthen terrain face edges, crop rows and distinct tree/thicket silhouettes so tiles can be recognized during prototyping.
- The day-cycle progress indicator now sits in the bottom control stack **above**, not behind, the tool dock.
- The five-settler ration mission defaults to a compact badge and expands/collapses on tap, saving that preference locally.
- Phone (390×844) and desktop (1024×768) layouts and mission/rotation interactions were smoke-tested in Chromium. This remains placeholder art, not the final 3D pixel-art implementation.
