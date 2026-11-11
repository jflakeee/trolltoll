# Systems Index: Troll Toll Clone

> **Status**: Draft — inferred from implementation; human review pending
> **Created**: 2026-11-11
> **Last Updated**: 2026-11-11
> **Source Concept**: design/gdd/game-concept.md
> **Workflow**: Standard / guided; existing Web JavaScript game

---

## Overview

Troll Toll is a mobile-first isometric-style browser RPG built around moving, automatically fighting, gaining immediate permanent stats, gathering regenerating resources, constructing facilities, crafting gear, enhancing a weapon and unlocking three regions by defeating bosses. The following **22 systems** were mapped from `game.js`, `src/rules/`, `data/enhancement.json`, tests and the concept. **Implemented** means an observable code path exists, not that its GDD is approved or that real-device QA is complete.

**01 Game loop & state:** Frame updates, cooldowns and transient player state are orchestrated in the single browser runtime; this is the technical backbone, not a separate engine.

**02 Input & movement:** Touch drag, keyboard and auto-movement share movement state. Direction transforms and mobile controls must remain consistent.

**03 World projection & camera:** Isometric-style transforms, camera centering and zone boundaries determine what players can see and reach.

**04 Enemy spawning & AI:** Enemy types, attack windups, death timers and respawn determine combat pacing and fairness.

**05 Auto combat & damage:** The proximity-based attack loop and defense/damage rules define the game's hands-free combat identity.

**06 XP and levels with immediate stats:** Kills grant XP and stat gains without a pickup step, making growth immediately visible.

**07 Resource nodes & gathering:** Trees, stone and iron nodes replenish over time and yield materials through automatic interaction.

**08 Resource inventory & currencies:** Gold, wood, stone, iron, relics and special stones connect combat, gathering, crafting and enhancement.

**09 Save/load & migration:** Browser localStorage stores legacy state and versioned progression; migration and corruption handling protect continuity.

**10 Crafting & equipment:** Recipe gates consume materials to create gear that affects combat and gathering performance.

**11 Construction & facility unlocks:** Workbench and forge construction unlocks crafting and enhancement options.

**12 Regions, bosses & relics:** Three bosses gate the quarry and mine; first-clear relic rewards drive area progression.

**13 Enhancement & protection:** Main-weapon +0 to +15, probabilistic success, protection stones, downgrade and pity create a long-term sink; pure rules and browser logic require parity checks.

**14 Reward drops & pity:** Enemy kills and gathering actions yield enhancement materials, with counters for rare outcomes.

**15 Auto navigation & target modes:** Optional auto-movement prioritizes enemies or resources and must respect locked zones and touch input.

**16 Responsive HUD & crafting UI:** Canvas panels, selection and touch hit areas expose the systems on short landscape and portrait screens.

**17 Combat/gather VFX & feedback:** PixelFX, damage indicators and notices provide clarity, but must not obscure touch controls.

**18 Onboarding & objective guidance:** A basic next-goal hint exists; structured first-session teaching is not established.

**19 Accessibility & input settings:** Reduced motion, configurable controls, scalable text and safe-area rules are inferred release needs, not shipped features.

**20 Android packaging & device QA:** A future wrapper/build and real-device verification depend on stable web runtime and input behavior.

**21 Audio & music:** A minimal audio feedback layer is a potential polish feature; no existing audio implementation was verified.

**22 Economy & balance telemetry:** Offline balancing simulations and optional privacy-respecting analytics can help tune progression; no production telemetry is assumed.

### Evidence and interpretation

- Runtime: `game.js` contains the game loop, input, enemy/boss/resource state, crafting actions, progression, HUD and save calls.
- Pure modules: `src/rules/enhancement.cjs` and `src/rules/save-v3.cjs`; configuration: `data/enhancement.json`.
- Automated coverage: `tests/simulation.cjs`, `tests/progression.cjs`, enhancement and save tests, browser tests and mobile visual CI.
- **No individual system GDD is present yet.** The game concept is not counted as an approved system GDD.
- **Code/design parity concern:** the browser enhancement implementation and pure rule module are separate; verify probabilities, costs, pity and inventory semantics before treating one as canonical.
- The studio's own Web scaffold uses Vite/TypeScript; this project intentionally keeps its working JavaScript/Canvas/esbuild setup.

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Game loop & state | Core | MVP | Implemented | — | — |
| 2 | Input & player movement | Core | MVP | Implemented | — | Game loop & state |
| 3 | World projection & camera | Core | MVP | Implemented | — | Game loop & state, Input & player movement |
| 4 | Enemy spawning & AI | Gameplay | MVP | Implemented | — | Game loop & state, World projection & camera |
| 5 | Auto combat & damage | Gameplay | MVP | Implemented | — | Game loop & state, Input & player movement, Enemy spawning & AI |
| 6 | XP and levels with immediate stats | Progression | MVP | Implemented | — | Auto combat & damage |
| 7 | Resource nodes & auto gathering | Gameplay | MVP | Implemented | — | Game loop & state, Input & player movement, World projection & camera |
| 8 | Resource inventory & currencies | Economy | MVP | Implemented | — | XP and levels with immediate stats, Resource nodes & auto gathering |
| 9 | Save/load & migration | Persistence | MVP | Implemented | — | — |
| 10 | Crafting & equipment | Economy | Vertical Slice | Implemented | — | Resource inventory & currencies |
| 11 | Construction & facility unlocks | Gameplay | Vertical Slice | Implemented | — | Resource nodes & auto gathering, Resource inventory & currencies |
| 12 | Regions, boss gates & relics | Progression | Vertical Slice | Implemented | — | Enemy spawning & AI, Auto combat & damage, XP and levels with immediate stats |
| 13 | Enhancement & protection | Progression | Vertical Slice | Implemented | — | Resource inventory & currencies, Save/load & migration, Crafting & equipment, Construction & facility unlocks |
| 14 | Reward drops & pity | Economy | Vertical Slice | Implemented | — | Auto combat & damage, Resource nodes & auto gathering, Resource inventory & currencies |
| 15 | Auto navigation & target modes | Gameplay | Vertical Slice | Implemented | — | Input & player movement, World projection & camera, Enemy spawning & AI, Resource nodes & auto gathering |
| 16 | Responsive HUD & crafting UI | UI | Vertical Slice | Implemented | — | Input & player movement, XP and levels with immediate stats, Resource inventory & currencies, Crafting & equipment, Enhancement & protection |
| 17 | Combat/gather VFX & feedback | UI | Alpha | Implemented | — | Auto combat & damage, Resource nodes & auto gathering, Responsive HUD & crafting UI |
| 18 | Onboarding & objective guidance (inferred) | Meta | Alpha | Not Started | — | XP and levels with immediate stats, Crafting & equipment, Construction & facility unlocks, Regions, boss gates & relics, Responsive HUD & crafting UI |
| 19 | Accessibility & input settings (inferred) | Meta | Full Vision | Not Started | — | Input & player movement, Responsive HUD & crafting UI |
| 20 | Android packaging & device QA (inferred) | Meta | Full Vision | Not Started | — | Game loop & state, Input & player movement, Save/load & migration, Responsive HUD & crafting UI |
| 21 | Audio & music (inferred) | Audio | Full Vision | Not Started | — | Game loop & state, Auto combat & damage, Resource nodes & auto gathering |
| 22 | Economy & balance telemetry (inferred) | Meta | Full Vision | Not Started | — | XP and levels with immediate stats, Resource inventory & currencies, Regions, boss gates & relics, Enhancement & protection, Reward drops & pity |

> “Implemented” is an implementation observation, not a design approval. #18 has partial in-game goal hints but is marked Not Started because a dedicated onboarding flow is absent.

---

## Categories

| Category | Description |
|---|---|
| Core | Runtime, input, world transform and enemy foundations |
| Gameplay | Combat, resource interaction, construction and navigation |
| Progression | XP, unlocks, regions and enhancement |
| Economy | Inventory, crafting and material rewards |
| Persistence | Versioned save state |
| UI | HUD, interaction and feedback |
| Meta | Onboarding, accessibility, platform packaging and balance |
| Audio | Optional sound and music layer |

---

## Priority Tiers

| Tier | Definition | Target Milestone | Design Urgency |
|---|---|---|---|
| MVP | Required to exercise combat, growth, gathering and saving | Existing playable loop | FIRST |
| Vertical Slice | Complete one-area progression, crafting, bosses, enhancement and usable HUD | Mobile demo | SECOND |
| Alpha | Feedback and first-session clarity | Feature-complete prototype | THIRD |
| Full Vision | Accessibility, Android packaging and optional polish | Release planning | LATER |

---

## Dependency Map

Dependency arrows always point from the dependent to its prerequisite. Cross-layer dependencies are listed in the enumeration; **save/load is treated as a standalone serialization contract** to avoid a cycle with every system that persists state.

### Foundation Layer

- **1. Game loop & state** — independent contract / no gameplay prerequisite
- **9. Save/load & migration** — independent contract / no gameplay prerequisite

### Core Layer

- **2. Input & player movement** — depends on Game loop & state
- **3. World projection & camera** — depends on Game loop & state, Input & player movement
- **4. Enemy spawning & AI** — depends on Game loop & state, World projection & camera
- **5. Auto combat & damage** — depends on Game loop & state, Input & player movement, Enemy spawning & AI

### Feature Layer

- **6. XP and levels with immediate stats** — depends on Auto combat & damage
- **7. Resource nodes & auto gathering** — depends on Game loop & state, Input & player movement, World projection & camera
- **8. Resource inventory & currencies** — depends on XP and levels with immediate stats, Resource nodes & auto gathering
- **10. Crafting & equipment** — depends on Resource inventory & currencies
- **11. Construction & facility unlocks** — depends on Resource nodes & auto gathering, Resource inventory & currencies
- **12. Regions, boss gates & relics** — depends on Enemy spawning & AI, Auto combat & damage, XP and levels with immediate stats
- **13. Enhancement & protection** — depends on Resource inventory & currencies, Save/load & migration, Crafting & equipment, Construction & facility unlocks
- **14. Reward drops & pity** — depends on Auto combat & damage, Resource nodes & auto gathering, Resource inventory & currencies
- **15. Auto navigation & target modes** — depends on Input & player movement, World projection & camera, Enemy spawning & AI, Resource nodes & auto gathering

### Presentation Layer

- **16. Responsive HUD & crafting UI** — depends on Input & player movement, XP and levels with immediate stats, Resource inventory & currencies, Crafting & equipment, Enhancement & protection
- **17. Combat/gather VFX & feedback** — depends on Auto combat & damage, Resource nodes & auto gathering, Responsive HUD & crafting UI

### Polish Layer

- **18. Onboarding & objective guidance (inferred)** — depends on XP and levels with immediate stats, Crafting & equipment, Construction & facility unlocks, Regions, boss gates & relics, Responsive HUD & crafting UI
- **19. Accessibility & input settings (inferred)** — depends on Input & player movement, Responsive HUD & crafting UI
- **20. Android packaging & device QA (inferred)** — depends on Game loop & state, Input & player movement, Save/load & migration, Responsive HUD & crafting UI
- **21. Audio & music (inferred)** — depends on Game loop & state, Auto combat & damage, Resource nodes & auto gathering
- **22. Economy & balance telemetry (inferred)** — depends on XP and levels with immediate stats, Resource inventory & currencies, Regions, boss gates & relics, Enhancement & protection, Reward drops & pity

### Dependency bottlenecks

- **Game loop (#1)** anchors simulation, input and rendering.
- **Auto combat (#5)** and **gathering (#7)** supply growth and materials for most later systems.
- **Inventory (#8)** feeds construction, crafting, enhancement and rewards.
- **Save/load (#9)** is a persistence boundary used by all durable systems; it must remain an interface, not a cyclic gameplay dependency.
- **HUD (#16)** is the primary player-facing integration surface and a mobile regression hotspot.

---

## Recommended Design Order

The order below is for **reverse-documenting and reviewing existing systems**, not rebuilding them. Effort estimates refer to GDD/review sessions, not implementation days.

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|---|---|---|---|---|---|
| 1 | Game loop & state | MVP | Core | lead-programmer, game-designer | M |
| 2 | Save/load & migration | MVP | Foundation | lead-programmer, game-designer | L |
| 3 | Input & player movement | MVP | Core | lead-programmer, game-designer | M |
| 4 | World projection & camera | MVP | Core | lead-programmer, game-designer | M |
| 5 | Enemy spawning & AI | MVP | Core | game-designer, lead-programmer | L |
| 6 | Auto combat & damage | MVP | Core | game-designer, lead-programmer | L |
| 7 | XP and levels with immediate stats | MVP | Feature | game-designer, lead-programmer | M |
| 8 | Resource nodes & auto gathering | MVP | Feature | game-designer, lead-programmer | M |
| 9 | Resource inventory & currencies | MVP | Feature | game-designer, lead-programmer | M |
| 10 | Construction & facility unlocks | Vertical Slice | Feature | game-designer, lead-programmer | M |
| 11 | Crafting & equipment | Vertical Slice | Feature | game-designer, lead-programmer | M |
| 12 | Regions, boss gates & relics | Vertical Slice | Feature | game-designer, lead-programmer | L |
| 13 | Reward drops & pity | Vertical Slice | Feature | game-designer, lead-programmer | M |
| 14 | Enhancement & protection | Vertical Slice | Feature | game-designer, lead-programmer | L |
| 15 | Auto navigation & target modes | Vertical Slice | Feature | game-designer, lead-programmer | M |
| 16 | Responsive HUD & crafting UI | Vertical Slice | Presentation | ui-designer, game-designer | L |
| 17 | Combat/gather VFX & feedback | Alpha | Presentation | ui-designer, game-designer | M |
| 18 | Onboarding & objective guidance (inferred) | Alpha | Polish | game-designer, lead-programmer | M |
| 19 | Accessibility & input settings (inferred) | Full Vision | Polish | game-designer, lead-programmer | M |
| 20 | Android packaging & device QA (inferred) | Full Vision | Polish | game-designer, lead-programmer | L |
| 21 | Audio & music (inferred) | Full Vision | Polish | game-designer, lead-programmer | M |
| 22 | Economy & balance telemetry (inferred) | Full Vision | Polish | game-designer, lead-programmer | M |

---

## Circular Dependencies

- **No cycles in the documented prerequisite graph.** A common apparent cycle is gameplay ↔ save/load: gameplay calls persistence, while persistence serializes gameplay state. Resolve through a versioned save DTO/contract; do not model serialization as requiring gameplay initialization.
- **Potential UI ↔ gameplay coupling:** Canvas pointer handlers directly invoke crafting/enhancement logic. Keep UI as a consumer of gameplay commands and state, rather than making gameplay depend on panel layout.

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|---|---|---|---|
| Enhancement & protection | Technical / Economy | Browser and CommonJS rules can diverge in chance, pity, costs or protection | Add parity fixtures and shared rule contracts before refactoring |
| Save/load & migration | Technical | Dual legacy/v3 writes and invalid data may lose progression | Migration fixtures, roundtrip tests, corrupt-save and rollback cases |
| Responsive HUD & crafting UI | UX | Short landscape screens and pointer hit targets can overlap | Test portrait/landscape, safe areas and real-device touch targets |
| Auto navigation & target modes | UX / Technical | Stuck targeting, locked regions and manual override may confuse players | Boundary, selection and interruption simulations |
| Regions, bosses & relics | Design | Repeat kills and unlock gates may yield unintended rewards | First-clear/repeat-clear regression scenarios |
| Android packaging & device QA | Scope / Technical | No Android artifact or real-device evidence | Separate proof-of-concept after web input and save stability |
| Economy & balance | Design | Long-term resource rates and enhancement cost may create grind spikes | Deterministic Monte Carlo simulations and player-session budgets |

### Review gates

- **TD-SYSTEM-BOUNDARY:** NOT ASSESSED — no Claude Code specialist-agent execution in this GitHub connector session.
- **PR-SCOPE:** NOT ASSESSED — team capacity and target milestone dates are unspecified.
- **User enumeration/priority approval:** Pending. The explicit user request authorizes a draft index and verification, not an assertion of final design approval.

---

## Progress Tracker

| Metric | Count |
|---|---|
| Total systems identified | 22 |
| Systems with identifiable existing code paths | 17 |
| Inferred/not fully implemented systems | 5 |
| Individual system design docs started | 0 |
| Design docs reviewed | 0 |
| Design docs approved | 0 |
| MVP systems designed | 0/9 |
| Vertical Slice systems designed | 0/7 |

---

## Next Steps

- [ ] Review and approve the 22-system enumeration and dependencies.
- [ ] Reverse-document game loop, save/load and combat contracts first, then inventory and progression.
- [ ] Author per-system GDDs and run `/design-review` on each.
- [ ] Add enhancement parity, responsive HUD and save migration regression cases.
- [ ] Run the Studio's director/producer review gates locally if available.
- [ ] Run `/gate-check` only after required design evidence exists.
