---
id: 0004
title: "New game: Crystal Garden"
status: todo        # todo | in-progress | blocked | review | done
priority: 3         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: claude        # builder tool: claude | copilot | any
model: claude-opus-5-5  # builder model
reviewer: copilot    # review tool: claude | copilot | any
review_model: gpt-5.5  # reviewer model
---

## Goal
A new game in the **Lab** room where kids dissolve salt or sugar, hang a string, and watch crystals grow. They learn that dissolved things come back out as crystals when the water leaves, and that crystals have regular shapes.

## Context
- Design: PLAN.md 10.7. Follow §10 "Principles for every new module".
- What kids do: dissolve lots of salt or sugar in warm water, hang a string, and check back. Crystals grow a little each time the app is opened, or straight away with a fast-forward sun button. The magnifier shows their shapes: salt makes little cubes, sugar makes chunky rock-candy crystals, and frost on a window makes snowflakes that always have six sides.
- **Never punishing (PLAN.md §2):** crystals only ever grow. Kids never have to wait, because the sun button always works. A changed device clock must never shrink or reset anything.
- Save the growth and last-visit time through `src/systems/save.js`.
- **Accuracy (PLAN.md §9):** dissolving is not disappearing; the salt or sugar is still in the water until the water leaves. Warm water comes from warm tap water or a hot plate in the game, never a flame, and nothing reads as "try this at home".
- Reuse the toolkit: Lab dissolving, the magnifier (`src/lab/Magnifier.js`), the particle grid.
- New-game file pattern: see "New games follow the existing structure" in CLAUDE.md. Suggested id `crystal`.
- **Parallel test:** this ticket and 0003 Water Cycle will run at the same time in separate worktrees. Add only new files plus the normal registration lines. Don't reorganize shared files (`main.js`, `BootScene.js`, `games.js`, `rooms.json`, `save.js`, `narration.json`), so the merge stays simple.

## Acceptance criteria
- [ ] New `crystal` game in the Lab room, with a home-screen button, icon, and progress badge
- [ ] Salt, sugar, and frost each grow their correct shape, seen through the magnifier
- [ ] Growth carries over between visits, never goes backwards, and the sun button makes it work without waiting
- [ ] Guided first visit, 💡 hint button, and something to collect that survives closing and reopening
- [ ] Every spoken line is in `narration.json`; `narration-script.md` regenerated
- [ ] Checked against PLAN.md §9; guardrails named in the log
- [ ] Works by touch (drag and tap) at iPad size; STATUS.md and the README's iPad test steps updated
- [ ] `node tools/update-sw.mjs` run and `APP_VERSION` bumped
- [ ] App builds (or serves) and runs locally with no console errors, and existing features still work
- [ ] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-07 [claude] (opus): created from the starter ticket list
- 2026-10-08 [claude] (claude-opus-5-5) coordinator: builder claude claude-opus-5-5, reviewer copilot gpt-5.5 (new game with save and timer logic; parallel with 0003)
