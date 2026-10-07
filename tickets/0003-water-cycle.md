---
id: 0003
title: "New game: Water Cycle"
status: todo        # todo | in-progress | blocked | review | done
priority: 2         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: any          # claude | copilot | any
---

## Goal
A new game in the **Lab** room where kids run the water cycle step by step and see that the same water goes round and round.

## Context
- Design: PLAN.md 10.8. Follow §10 "Principles for every new module".
- What kids do, in order:
  1. Warm the sea with the sun: water rises as invisible gas dots.
  2. Cool the air high up: the dots gather into tiny droplets that make a cloud.
  3. The droplets join into rain.
  4. Rivers carry it back to the sea.
- **Room:** goes in the Lab for now. When the Sky & Weather room (PLAN.md 11.3) is built, move it there. Keep the game self-contained so the move is just a `rooms.json` change.
- **Accuracy (PLAN.md §9):** water vapor is invisible; clouds are tiny drops of liquid water, not gas. The sun warms the sea, it doesn't boil it: no bubbling sea. If salt comes up, only the water rises; the salt stays in the sea, so rain is fresh water.
- Reuse the toolkit: the heat and cool buttons, gas dots, particle pictures (`src/heat/ParticleView.js`).
- New-game file pattern: see "New games follow the existing structure" in CLAUDE.md. Suggested id `cycle`.
- **Parallel test:** this ticket and 0004 Crystal Garden will run at the same time in separate worktrees. Add only new files plus the normal registration lines. Don't reorganize shared files (`main.js`, `BootScene.js`, `games.js`, `rooms.json`, `save.js`, `narration.json`), so the merge stays simple.

## Acceptance criteria
- [ ] New `cycle` game in the Lab room, with a home-screen button, icon, and progress badge
- [ ] All four steps work in order and the cycle can go round again
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
