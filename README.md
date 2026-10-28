# Troll Toll — Mobile Survival Idle RPG

[Play on GitHub Pages](https://jflakeee.github.io/trolltoll/)

A lightweight, browser-only HTML5 Canvas prototype. Korean UI; keyboard movement (WASD/arrows) and touch drag movement. Game progress is stored locally in the browser.

## Implemented

- Three regions: meadow, quarry and mine. First clears of the meadow guardian and quarry giant unlock the next region.
- Automatic combat, XP/leveling, permanent stat gains from kills, enemy respawns and three regional bosses with telegraphed special attacks.
- Wood, stone and iron collection; resource respawns; workbench and forge construction.
- Crafting: wooden club, stone armor, iron pickaxe, reinforced axe, forged sword and guardian sword.
- First boss kills grant relics; guardian sword requires relics.
- Mobile HUD collapse, paginated crafting menu, action-mode toggle, boss compass and progression hints.
- Local save for stats, materials, equipment, boss clears and player position.

## Test and deployment

```sh
node --check game.js
node tests/smoke.cjs
```

The GitHub Actions Pages workflow checks syntax and runs the headless smoke test before deploying. The smoke test covers startup, one render frame, HUD touch interaction and save serialization; it is **not** a substitute for real mobile/browser playtesting.

## Outstanding design and QA

- [ ] Test gameplay on real Android and iOS devices, including short landscape screens and browser safe areas.
- [ ] Verify progression end-to-end from new save through all three bosses, including material costs, death and respawn.
- [ ] Tune enemy and boss difficulty using playtest timings, resource collection speed and attack/defense scaling.
- [ ] Improve navigation, enemy AI, combat feedback, item visuals and tutorial/onboarding.
- [ ] Add accessibility controls and reduce motion option.
- [ ] Add automated progression and save-migration tests.

The repository currently contains a playable prototype and this checklist, **not** a comprehensive original game-design specification. Completing the checklist does not automatically imply an external design has been fully implemented.
