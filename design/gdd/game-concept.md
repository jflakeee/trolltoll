# Troll Toll — Game Concept (existing prototype)

**Status:** Baseline concept reconstructed from the existing implementation and project decisions. This is not a claim that all planned features are shipped.

## Vision and platform

- **Genre:** Mobile-first survival / idle action RPG with gathering, construction, crafting and equipment progression.
- **View:** 2.5D isometric-style Canvas rendering; no engine migration in this onboarding.
- **Platforms:** Browser playable now; Android packaging planned, not yet validated.
- **Input:** Direct touch-drag movement and keyboard WASD/arrows; attacks automatically select nearby enemies.
- **Persistence:** Browser local storage with versioned migration.

## Core gameplay loop

1. Move through an area and automatically attack nearby enemies.
2. Gain XP and permanent stats immediately on kills (no required pickup step).
3. Gather wood, stone and iron from map resources.
4. Construct workbench/forge, craft equipment and upgrade the main weapon.
5. Defeat regional bosses, unlock the next area and repeat with stronger enemies.

## Existing playable systems

- Three regions with guardian/boss gates, respawning enemies and resources.
- Automatic combat, progression and persistent saves.
- Resource collection and workbench/forge construction.
- Crafting recipes and enhancement/protection stones.
- Weapon enhancement through +15, with costs, probability, downgrade/protection and pity.
- Mobile HUD, touch controls and desktop keyboard support.
- GitHub Pages deployment with regression and mobile visual verification workflows.

## Next milestones (not yet shipped)

1. Audit the complete progression from a new save through the third boss on real mobile devices.
2. Improve small-screen HUD, touch target sizes, safe-area handling and movement/target feedback.
3. Add structured onboarding, accessibility and reduced-motion controls.
4. Validate performance and save migration across mobile browsers.
5. Plan and test Android packaging, without replacing the existing web runtime.

## Quality gates

- Existing `npm test` suite must pass before merge.
- `npm run build` must succeed with the current PixelFX adapter.
- GitHub Pages workflow must deploy and verify the live `game.js`.
- Mobile visual CI is additional evidence; it does not substitute for real-device QA.
- Every completed change gets a Git commit and verified deployment report.
- Never replace the current game with the studio's default Vite/TypeScript scaffold.

## Open decisions

- Final Android packaging technology (WebView/Capacitor or alternative).
- Target frame-rate and performance budgets on low-end Android devices.
- Final game economy and enhancement balancing.
- UX acceptance criteria for one-handed play and accessibility.

## P2 verification checkpoint / P3 proposed audit

- P2 automated regression and Pages deployment: passed at b4f9b6921c9cf354e867380695aa0f1c70b778b1 (run 44628549071).
- Mobile Chromium workflow: passed (run 44628549282).
- Physical phone playthrough, human screenshot review and Android packaging remain unverified. Final GDD approval is withheld.

### P3 audit order (proposed, not approved balance changes)

1. Establish reproducible new-save progression baselines through all three bosses: elapsed simulated time, kills, resource costs, unlocks and equipment.
2. Compare manual and automatic play for bottlenecks, reward cadence and idle fallback behavior.
3. Audit enhancement costs, failure/protection/pity and permanent growth against region difficulty. Preserve v3 saves and current rules until evidence supports a change.
4. Review onboarding, feedback and one-handed accessibility; avoid adding content before baseline analysis.
5. Propose measured tuning with regression criteria and separate physical-device acceptance.

### P3-01 static economy baseline (source audit)

All eight permanent construction/equipment recipes together require wood 58, stone 57, iron 40 and relics 2, excluding enhancements. Boss HP/attack: 420/12, 900/20, 1800/32. Every kill grants 3 gold; first boss clears additionally grant one relic, +5 attack, +3 defense and +20 maximum HP. The current progression test directly injects resources and invokes gain(), so it is a functional unlock test rather than a pacing measurement.

The no-failure +0 to +15 enhancement attempt cost totals 24,150 gold, 264 iron and 109 enhancement stones, excluding protection and stone crafting. At 3 gold per kill this is equivalent to 8,050 kills before starting balances or other gold costs. Actual runtime pacing and probability-adjusted expenditure remain to be measured. Do not tune prices or rewards before collecting those measurements.

### P3-01 measured automatic pacing baseline

CI run 44629123621, commit b41a5da88aa00576c38b197c0f8ddee51c2ec69d, seed 123456, 0.1-second update steps, automatic movement and affordable permanent crafting, no enhancement attempts.

| Minutes | Kills | Level | ATK | DEF | Max HP | Gold | Wood | Stone | Iron | Boss clears |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|5|14|6|21|13|161|42|37|27|0|1|
|15|33|10|21|13|211|99|214|183|0|1|
|30|62|14|21|13|281|186|475|415|0|1|
|60|120|20|21|13|415|360|997|881|0|1|

Observed stagnation: ATK/DEF flat after minute 5; boss1 never defeated; no iron; excessive wood/stone accumulation. Nearest-target selection is a candidate cause, not yet proven. Compare combat-priority and goal-directed policies over identical seeds before changing gameplay. Single-seed VM simulation is not physical-device play or a human pacing measurement. Both deployment and mobile Chromium workflows passed for the baseline commit.
