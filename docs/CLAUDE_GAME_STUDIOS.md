# Claude Code Game Studios — Troll Toll integration

This repository vendors **Claude Code Game Studios v1.3.0** as development tooling.
The original project is https://github.com/Donchitos/Claude-Code-Game-Studios and
the pinned upstream commit is `abc0de79d6ceb0b5d7aa693945849b3937afbe6a`.
The framework is MIT licensed; see `docs/third-party/Claude-Code-Game-Studios-LICENSE`.

## Getting started

Install [Claude Code](https://code.claude.com/docs/en/setup) on your **own computer**
and make sure Git, Python 3, Git Bash (on Windows), and Chrome/Edge are available.
Node.js 22+ is recommended for this web game. Claude Code CLI is distinct from
the checked-in framework; committing the framework does **not** install the CLI
or log you in.

```bash
git clone https://github.com/jflakeee/trolltoll.git
cd trolltoll
claude
```

Open Claude Code from the repository root, where `CLAUDE.md`, `project.yaml`,
and `.claude/` are located. Start with:

```text
/start
/project-stage-detect
/next-step
```

Select **existing game / existing code** in the setup flow; this is **not** a
blank prototype. Review any generated proposals before replacing project files.

## Troll Toll preservation rules

- Main playable entry: `index.html` + `game.js` (web Canvas).
- Browser build: `npm run build` creates `vendor/pixelfx.js`.
- Regression tests: `npm test`.
- Existing project-specific skill: `.claude/skills/pixelfx/SKILL.md` was retained.
- Keep all changes to the playable game deliberate, tested and committed.
- `src/rules/` contains the existing progression rules. The game entry is at
  repository root, **not** `src/main.ts`; configure the framework accordingly.
- GitHub Pages deploys only `index.html`, `game.js`, and the PixelFX browser
  bundle. Studio agents, hooks, templates and tests are not published in Pages.
- Do not commit credentials, OAuth tokens, secrets, or machine-specific settings.

## Maintenance

The studio snapshot is pinned to v1.3.0 instead of automatically tracking
`main`, for reproducibility. Check upstream `UPGRADING.md` before merging
changes; never overwrite the existing Troll Toll game, its design history,
PixelFX custom skill or `project.yaml` customizations blindly.

Claude Code instructions and event hooks come from the upstream project;
review `.claude/settings.json` and `.claude/hooks/` before trusting them
with sensitive local environments or credentials.
