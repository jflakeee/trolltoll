# Troll Toll — six game-development tools

This is an **additive, pinned, existing-game integration**. It preserves the Canvas JavaScript game, v3 saves, Git history, existing Claude Code Game Studios setup and Pages deployment. It does not replace `game.js`, `CLAUDE.md`, `.claude/settings.json` or `project.yaml`.

## Tool inventory (2026-11-20)

| Source | Pinned upstream revision | Installation in this repository | Runtime effect |
|---|---|---|---|
| [Awesome GameDev Agent Skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | `c6ca6c41c839b68319ffc08430b99ab768debc32` | Full source git submodule plus eight relevant complete skills vendored under `.claude/skills/`. Install its full 79-skill plugin locally using the script below. | None |
| [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) | `abc0de79d6ceb0b5d7aa693945849b3937afbe6a` (existing v1.3.0) | Already installed: `CLAUDE.md`, `project.yaml`, `.claude/`. Leave unchanged. | None |
| [Claude GameDev Kit](https://github.com/dudwns0921/claude-gamedev-kit) | `86b5b6ddd33a542ef4ca1cc2de067feb82763cc2` | Full source git submodule; install its project-scoped plugin using the script below. | None |
| [Dream Loop](https://github.com/achimala/dream-loop) | `9bddb901f7d071cfefdd21e264267c757177a9df` | Source git submodule plus `.claude/skills/dream-loop/SKILL.md` and reference workflows. | None; requires image generation/critic tools for use |
| [PlinkFX](https://github.com/maximilianfeix/plinkfx) | `7e5f6a477037679a29df9c5141e9853b1267e7d8` | Source git submodule, `.claude/skills/plinkfx/SKILL.md`, `reference.md`. | **No sound added to the live game**; npm package and sound hooks intentionally not yet installed |
| [PixelFX](https://github.com/patch-gg/pixelfx) | Current project dependency in `package.json` | Already installed, `src/pixelfx-entry.js`, `.claude/skills/pixelfx/SKILL.md`. | Existing game visuals unchanged |

Gitlinks under `tools/agent-sources/` are pinned to the upstream revisions above. They are source references, not copies embedded in this repository's Git history.

## Install on the development machine

Prerequisites: Git, Claude Code CLI (for the project plugins), Node.js 22+, Python 3.9+, and Git Bash on Windows. In the Troll Toll repository root:

```bash
git submodule update --init --recursive
bash scripts/install-game-dev-tools.sh
npm install
npm test
npm run build
```

The script installs Awesome GameDev Agent Skills and Claude GameDev Kit through their **official Claude plugin marketplaces**, with project scope. It installs no global plugins. Dream Loop, PlinkFX and eight relevant GameDev Agent Skills are already checked in as standalone Claude Code skills and do not require marketplace installation. The full GameDev Agent Skills catalog is enabled only **after** the local Claude CLI script succeeds.

**Command collision precaution:** existing Game Studios `/start`, `/next-step` and `/map-systems` remain authoritative. Invoke GameDev Kit using namespaced commands such as `/gamedev-kit:playtest`, `/gamedev-kit:board`, and `/gamedev-kit:gdd-sync`. Do not run GameDev Kit's initialization or generated scaffolding over the existing game.

## Validation and security

- Running the GitHub Actions suite verifies the checked-in skill files, submodule mapping, existing PixelFX wiring and existing game regressions. It does **not** prove a developer's local Claude CLI marketplace installation works.
- GitHub Actions does not need to check out the development-only submodules to build the browser game; a developer must run `git submodule update --init --recursive`.
- Review the upstream hooks, execution permissions and scripts before allowing the plugins to operate on sensitive local environments. Do not automatically execute all submodule contents.
- Dream Loop's `.dream-loop/` scratch directory and `node_modules/` are gitignored.
- No new gameplay systems, sound effects, changes to existing saves or Android packages are part of this installation.
- License notices are in `docs/third-party/`, including PlinkFX's MIT code license and CC0 sound definitions.
- Human mobile testing, local plugin activation and actual Playwright screenshot inspection remain separate from CI's automated pass result.

## Next steps

1. Open the project in Claude Code and run `bash scripts/install-game-dev-tools.sh` in a terminal to activate the two additional marketplaces locally.
2. Review `claude plugin list` in the local CLI and confirm no skill name collisions or unintended hook permissions.
3. Implement PlinkFX runtime sound only as a separate feature with mute/volume, user-gesture unlock, tests and explicit sound acceptance.
4. Continue Troll Toll P3 goal-directed auto-play work independently of this tools installation.
