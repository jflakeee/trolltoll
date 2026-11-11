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
