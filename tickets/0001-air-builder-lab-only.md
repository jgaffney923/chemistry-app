---
id: 0001
title: Air Builder only in the Lab, and in the suggested order
status: todo        # todo | in-progress | blocked | review | done
priority: 1         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: any          # claude | copilot | any
---

## Goal
Air Builder shows up only in the Lab room, and the home screen can suggest it like every other game.

## Context
- M11 added `air` to both rooms in `src/data/rooms.json`, but the M11 commit and PLAN.md 10.9 ("As built") both say it belongs in the Lab. The owner confirmed: Lab only.
- `air` is missing from `suggestedOrder` in the same file, so `suggestedGame()` in `src/home/games.js` never suggests it.
- Room menus lay out two or three games in one row and four to six in two rows (STATUS.md, "Pre-M9 menu readiness"). After this change the Kitchen has five games and the Lab three.
- `rooms.json` is a cached file, so this ticket ends with the release step in CLAUDE.md.

## Acceptance criteria
- [ ] `rooms.json`: Kitchen lists `sorter, lab, undo, unmix, float`; Lab lists `heat, builder, air`
- [ ] `suggestedOrder` has `air` right after `float`
- [ ] Kitchen and Lab menus look right (no gaps or overlaps) and every button opens its game and comes back
- [ ] `node tools/update-sw.mjs` run and `APP_VERSION` bumped (e.g. `0.13.2 (air)`)
- [ ] App builds (or serves) and runs locally with no console errors, and existing features still work
- [ ] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-07 [claude] (opus): created from the starter ticket list
