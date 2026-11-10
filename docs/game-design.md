# MeetingIdle — Living Wild Garden
> **Status:** Design exploration / working direction (not yet an implementation specification)  
> **Last updated:** 2026-11-10  
> **Theme:** *The player starts the garden. Nature completes it.*

## 1. Vision

MeetingIdle is a cozy, low-attention idle game about growing a tiny wild garden on a floating island.

The player introduces species and gently shapes the ecosystem; the environment then develops on its own. A return after a meeting might reveal thick grass filling bare earth, a vine crawling off the island's side, a sapling turning into a little tree, or an entire neglected corner becoming dense with ferns.

**The fantasy is not to maximize production. It is to tend a place that feels alive and slightly beyond your control.**

The distinctive emotional loop:

1. **Cultivate:** Introduce a plant, influence a patch, or prune a small area.
2. **Release:** Stop watching. Plants interact and spread without player input.
3. **Return:** Notice a meaningful, sometimes surprising transformation.
4. **Respond:** Accept the wildness, guide it, or reclaim part of the garden.

This is a back-and-forth between **human cultivation** and **nature reclaiming space**, rather than a factory-style clicker or micromanaged farm.

### The garden as a living screen companion

The player is creating **a little garden they want to see resting on their screen**—something personally appealing to glance at while working, relaxing, or using their phone. This is not just a garden to optimize or complete; it is a small place whose appearance matters to its owner.

But the garden does **not** stay exactly as designed. Left to itself, nature takes over in small or significant ways: grass spreads, vines creep into carefully cleared spaces, saplings cast new shade, and wild plants establish themselves. Those changes may be beautiful discoveries, or they may alter an arrangement the player preferred.

**The player's taste and nature's independent direction can diverge.** The interesting question is then not simply whether the garden is healthier or more productive, but: *Do I like what it has become? Should I embrace the new wildness, gently redirect it, or restore the look I wanted?*

This creates a quiet, recurring tension between **personal aesthetics, cultivation, and an ecosystem with a life of its own**. The goal is a companion that can surprise even when that surprise isn't immediately welcome—not a screen decoration that stays frozen, and not a hostile simulation that destroys work at random.

### Intended experience

- Calm enough to leave open while working or attending a meeting.
- Useful interactions in seconds, not minutes; no urgency to keep clicking.
- A clear sense of ownership without needing to place every blade of grass.
- Surprises when returning after a period away—including changes the player might love **or dislike**, while keeping meaningful ways to respond.
- Beauty, discovery, and a changing place as primary rewards.

## 2. Visual direction

### Agreed direction

- **Cozy pixel art** with the slightly mysterious, handcrafted language of an overgrown fantasy garden, but **not heavy on ruins or stone**.
- **Full-screen world view:** the island itself is the game, **no permanently visible HUD, panels, resource bars, or grid-button interface**.
- **2.5D / isometric-ish perspective**, viewed from above at an angle so the surface and exposed sides are both visible.
- A **single connected floating landmass** made of Minecraft Skyblock-like earth blocks, not disconnected cards pretending to be tiles.
- Grassy and mossy edges, visible rich soil beneath, hanging roots, creeping vines.
- Plants in organic clusters: grass, clover, ferns, wildflowers, shrubs, saplings, small trees, mushrooms and ivy.
- Sky and distant clouds beyond/below the island; atmospheric natural light.
- Natural growth should conceal the internal grid. **Simulation can use tiles; art should read as an organic patchwork.**
- **Contextual interaction inside the world** (tap/click plant or ground), rather than persistent on-screen controls.

### Art priorities

1. Silhouette of one continuous floating island, readable from phone-sized dimensions.
2. Charming species sprites and layered, lush ground cover.
3. Visible before/after changes in density, height, and overgrowth.
4. Eventually add gentle motion: drifting spores, grass swaying in wind, hanging vines reacting.
5. Eventually explore sunlight, clouds, fog, rain, and seasonal variation.

The earliest art should be **an original composition/mockup of the same island at different growth stages**, not implementation-first styling. We should agree on visuals before the next major art rewrite.

### Phone companion idea (later)

The garden should remain recognizable on a small, portrait screen. A future iOS Home Screen or Lock Screen companion could show a snapshot or appropriately constrained view of the garden. Persistent full-color, continuously animated Lock Screen gameplay should **not** be assumed possible: iOS widgets and Live Activities have platform limits. Start with a responsive browser game and investigate native companion surfaces later.

## 3. Gameplay: hybrid authorship

**Settled direction:** The player introduces species and guides growth; nature fills the spaces.

### Player verbs

- **Introduce** a species into a patch or near a target species.
- **Encourage** a patch through light tending (e.g. watering, soil care, supporting growth).
- **Shape** a patch by marking a desired identity (fern corner, clover meadow, vine edge, tiny grove).
- **Prune / reclaim** excessively dense areas.
- **Observe** changes and discover why a new species or form appeared.
- **Respond** to weather or environmental changes, if these mechanics are adopted later.

The player should seldom need to repeat trivial actions. A single intervention should create a lasting tendency.

### Nature's verbs

- Colonize empty spaces adjacent to established plants.
- Self-seed and fill ground cover.
- Compete for light, space, or moisture.
- Establish mixed clusters where compatible species meet.
- Climb edges with vines and eventually form groves.
- Become progressively wilder when an area is left alone.
- Respond to habitat and weather without needing player clicks.

The player should feel like a **gardener/ecologist**, not a machine operator.

## 4. Cultivation ↔ wilderness

A possible core system is **rewilding / overgrowth**. Each patch tends along a continuum:

| State | What it looks like | Player relationship |
|---|---|---|
| Cultivated | Open, intentionally arranged, maintained | Most control |
| Loosely tended | Healthy mixtures; some self-seeding | Shared control |
| Natural | Spontaneous plant communities, layered cover | Nature leads |
| Overgrown | Dense shrubs, long grass, sprawling vines | May invite pruning or acceptance |

These are **candidate simulation states**, not necessarily discrete labels shown to the player.

### The surprise we want

A player steps away, returns, and sees an area that was visibly sparse becoming unexpectedly lush. Examples:

- Bare ground becomes a meadow of grass and clover.
- Ferns spread under a young tree as its shade grows.
- A climbing vine reaches across the edge of several earth blocks.
- Wildflowers show up inside an established clover patch.
- An ignored corner becomes a dense little thicket.

**Early wild growth should feel intriguing, not mechanically punishing.** It can still be aesthetically unwelcome: a vine may disrupt a carefully composed corner, or a dense patch may hide a favorite flower. That disagreement between the player's intended garden and nature's version of it is part of the core appeal. Later, modest ecological trade-offs—such as shade or competition for space—can deepen the tension.

### Fair surprise, not arbitrary chaos

Ecological outcomes should be discoverable and broadly legible:

- Nearness to other species matters.
- Shade, space, moisture, or habitat matters.
- Time unattended matters.
- Weather may matter later.
- Species have different spread patterns and levels of assertiveness.

The exact details can be unpredictable; the underlying tendencies should become understandable through observation.

Avoid the frustrating outcome where the player returns to find their favorite area destroyed for opaque reasons.

## 5. Proposed planting layers

A simulation tile or patch can hold several visually overlapping layers rather than one exclusive plant:

| Layer | Example occupants | Purpose |
|---|---|---|
| Ground cover | Grass, moss, clover | Fills empty space and makes the island lush |
| Main vegetation | Fern, flowers, shrub, sapling, tree, mushrooms | Defines a patch's character and ecological relationships |
| Spreading/edge overlay | Vines, roots, long grass, petals | Connects patches and makes wild takeover visible |

Examples:

- Moss ground cover + young tree + vine at island edge.
- Clover ground cover + wildflowers + scattered long grass.
- Grass ground cover + ferns + mushrooms in shade.

**Architecture principle:** Grid-based logic is acceptable; the visual composition should not look like one plant locked inside each square.

## 6. Initial species ideas

These are behavioral identities to prototype, **not balanced stats**.

| Species | Identity / likely behavior | Visual role |
|---|---|---|
| Moss | Slow, steady spread; likes moisture and shade | Soft, old-looking green cover |
| Clover | Friendly colonizer; may support wildflowers | Rich low carpet, flowers nearby |
| Grass | Natural fast filler for open areas | Gives a clear sense of reclaimed space |
| Fern | Prefers damp or partly shaded areas | Dense, layered wild corners |
| Vine / ivy | Crawls along edges, soil faces, or adjacent plants | Dramatic vertical takeover |
| Wildflowers | Appear under favorable conditions; less dominant | Rewarding unexpected color |
| Shrub | Takes space and increases patch density | Creates thickets and subtle competition |
| Sapling → tree | Slow, meaningful growth; creates shade | Long-term landmark and grove anchor |
| Mushrooms | Possible later addition in damp or shaded spots | Surprise/discovery in sheltered niches |

We should choose only **5–6 starter species** for the first systemic prototype.

## 7. Weather and climate (future system)

Weather should be more than a visual filter. It could tilt the ecosystem while remaining calm and fair.

| Weather | Possible ecological effect | Potential visual response |
|---|---|---|
| Sunny stretch | Encourages grass, flowers, and saplings; prolonged dryness challenges moisture lovers | Warm light, long soft shadows |
| Rain | Accelerates moss, ferns, and general growth | Wet ground, ripples, droplets |
| Wind | Scatters seeds toward new space | Grass sway, seed/spore motes |
| Fog / damp period | Favors moss, mushrooms, and ferns | Gentle haze, cooler colors |
| Frost / freeze | Slows or stresses exposed plants; hardy species resist | Pale frost dusting, slowed growth |

**Freeze is a future difficulty idea**, not a default penalty for the MVP. Climate should create new responses and ecology rather than force time-critical maintenance.

Optional later exploration: plants or small wildlife arriving unexpectedly, microhabitats, seasons, emergent plant associations, and environmental storytelling.

## 8. Offline growth and the return moment

The game should simulate growth while not being watched, within a sensible offline-time budget. This is essential to the premise.

The return should feel like opening a little terrarium:

- A glance at the island immediately reveals the overall difference.
- Subtle world animation can draw attention to what changed.
- There might eventually be a lightweight, optional way to inspect *why* a patch transformed.
- No loud rewards, intrusive pop-ups, or demand to acknowledge accumulated production.
- Surprises should be meaningful but bounded; they must not invalidate all prior choices.

Design for **5–10 seconds of attention every few minutes** and equally enjoyable returns after much longer absences.

## 9. Design pillars

1. **Gentle authorship:** The player influences rather than specifies every detail.
2. **Surprise through ecology:** Interesting changes occur when the player is absent.
3. **Wild beauty over efficiency:** A richer garden is its own reward.
4. **Calm first, tension second:** Nature can challenge plans and personal aesthetic preferences without becoming a chore.
5. **One living island:** The world itself is the interface.
6. **Coherent causality:** Ecological behavior can surprise while remaining understandable.
7. **Readable at a glance:** The experience works on desktop and a compact phone view.

## 10. First playable design prototype (proposal)

### Visual slice

- One small, connected floating earth island.
- Fixed or lightly adjustable 2.5D camera.
- Original cozy pixel-art terrain and plant sprites.
- A handful of visible growth states for each species.
- Full-screen scene with in-world contextual interaction.
- The same island represented at sparse, growing, and overgrown stages.

### Simulation slice

- 5–6 species selected from the table above.
- Adjacency-based natural spread.
- Ground cover and main vegetation as separate layers.
- Localized rewilding state or equivalent density measure.
- Introduce species and prune/reclaim actions.
- Save/load and meaningful offline progress.
- One weather condition only **if** it proves central to demonstrating the loop; otherwise defer.

### Success criterion

After planting one or two species and leaving the game for a while, the player returns and thinks:

> “Wow, that corner has changed. Do I like it better this way?”

Sometimes the answer is **yes** (“that corner became beautiful”); sometimes it is **no** (“I liked my little clearing”). Both should lead naturally to a meaningful but low-pressure choice: leave it wild, redirect it, or reclaim the original look.

The transformation should be noticeable and causally plausible without opening a menu.

## 11. Open design decisions

These are **not settled**, even when a default is recommended.

- **Strength of wild takeover:** low decorative spread, medium noticeable patch transformation, or high reshaping. *Current leaning: medium.*
- **Aesthetic disagreement and recovery:** how far can nature alter a carefully arranged patch, and how easily can the player recover a preferred appearance without eliminating surprise?
- **Cost of pruning:** easy and reversible at first vs. strategic expenditure later. *Current leaning: easy initially.*
- **Plant placement model:** exact tile placement, area targeting, or introducing a species to a region. The visual should always be organic.
- **How natural competition works:** merely shifts density vs. meaningfully replaces sensitive species.
- **Pacing:** what changes in 30 seconds, 5 minutes, 1 hour, a day, and a week?
- **Camera and island expansion:** fixed composition or grow the landmass into additional connected blocks?
- **Interface:** best in-world interaction on mouse, touch, and compact phone displays.
- **Weather timing:** MVP or iteration after a believable baseline ecology.
- **Narrative flavor:** whether the floating garden has an origin, secrets, or environmental storytelling.
- **Resource economy:** whether traditional idle currencies are needed at all; prefer ecological decisions over a production dashboard.
- **Wildlife:** optional later dimension, not an MVP requirement.

## 12. What we are *not* building right now

- A standard Cookie Clicker-style upgrade economy as the central experience.
- A farming spreadsheet or busy HUD.
- A rigid grid of isolated clickable plant cards.
- Heavy ruins, buildings, or excessive stone motifs.
- Aggressive timers that punish the player for attending to work.
- Complex weather, seasons, frost survival, or wildlife simulation before the garden feels alive.

## 13. Next steps

1. Create **original pixel-art mockups** in the agreed visual direction, including sparse and overgrown versions of the **same** island.
2. Decide how much takeover is desirable and what intervention feels enjoyable.
3. Prototype patch ecology and offline growth independently of visuals; confirm return surprises.
4. Bring art and simulation together in a full-screen, HUD-free experience.
5. Add richer ambient motion and weather only after the basic loop is satisfying.

---

### Related context

- [Current prototype](../index.html) — an earlier implementation, **not yet** representative of this direction.
- [Visual direction gallery](art-directions.md) — archived first tile-based trial and newer dark-fantasy wild-garden concepts.
- [Visual and weather backlog issue #1](https://github.com/ersoykadir/MeetingIdle/issues/1) — ambient spores, wind, sky, weather and frost.

*This document records the design conversation and should evolve as ideas are tested; recommendations are not final commitments.*
