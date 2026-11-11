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
npm install --no-audit --no-fund
npm run build
node --check game.js
npm test
```

This repository currently has no `package-lock.json`, so use `npm install` rather than `npm ci` until a lockfile is generated and committed. The GitHub Actions Pages workflow builds PixelFX, checks JavaScript syntax, and runs the complete `npm test` regression suite before deploying. This includes save recovery, enhancement, PixelFX alpha, combat/gathering, and Game Studios configuration checks. Automated checks are **not** substitutes for real mobile/browser playtesting. A committed workflow change does not itself prove that Actions or Pages deployment succeeded.

## Outstanding design and QA

- [ ] Test gameplay on real Android and iOS devices, including short landscape screens and browser safe areas.
- [ ] Verify progression end-to-end from new save through all three bosses, including material costs, death and respawn.
- [ ] Check mobile boss HP bar and crafting menu on 320px-wide devices after v4.4 placement fix.
- [ ] Tune enemy and boss difficulty using playtest timings, resource collection speed and attack/defense scaling.
- [ ] Improve navigation, enemy AI, combat feedback, item visuals and tutorial/onboarding.
- [ ] Add accessibility controls and reduce motion option.
- [x] Add automated progression, save restoration and malformed-save recovery tests (headless Node VM; not device validation).
- [x] Simulate v1-to-v2 save migration and storage-disabled browser environments; verify the persistent storage warning across three viewport sizes (headless tests).
- [ ] Verify migration from an actual legacy v1 save sample on a real browser/device.

The repository currently contains a playable prototype and this checklist, **not** a comprehensive original game-design specification. Completing the checklist does not automatically imply an external design has been fully implemented.

## Claude Code Game Studios

This repository includes **Claude Code Game Studios v1.3.0** development tools
(agents, skills, hooks and project templates) without replacing the existing
web game or the PixelFX skill. To start a Claude Code session, install the
Claude Code CLI on your computer, open this repository root, then run
`/start` and select the existing-game workflow.

See [Claude Code Game Studios setup](docs/CLAUDE_GAME_STUDIOS.md).
