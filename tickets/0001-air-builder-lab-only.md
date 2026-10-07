---
id: 0001
title: Air Builder only in the Lab, and in the suggested order
status: done          # todo | in-progress | blocked | review | done
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
- [x] `rooms.json`: Kitchen lists `sorter, lab, undo, unmix, float`; Lab lists `heat, builder, air`
- [x] `suggestedOrder` has `air` right after `float`
- [x] Kitchen and Lab menus look right (no gaps or overlaps) and every button opens its game and comes back
- [x] `node tools/update-sw.mjs` run and `APP_VERSION` bumped (e.g. `0.13.2 (air)`)
- [x] App builds (or serves) and runs locally with no console errors, and existing features still work
- [x] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-07 [claude] (opus): created from the starter ticket list
- 2026-10-07 [claude] (opus): claimed; plan: edit rooms.json, check both room menus in headless Edge, then update-sw and version bump
- 2026-10-07 [claude] (opus): rooms.json: removed air from the Kitchen, added air after float in suggestedOrder; headless Edge check: both rooms show the right games, every game opens and its home button returns to its room, no console errors
- 2026-10-07 [claude] (opus): ready for review. Done: Kitchen lists sorter, lab, undo, unmix, float; Lab lists heat, builder, air; air follows float in suggestedOrder; ran update-sw (file list unchanged, cache 23 -> 24), APP_VERSION 0.13.2 (air); STATUS.md notes the release. Checked: headless Edge at 1366x1024 against a local server: both room menus show the right games, their round buttons fit on screen without overlapping, all 8 game buttons open their game and each home button returns to the same room, no console errors. Not checked: on the real iPad, and by touch (no input code changed). Left over: nothing
