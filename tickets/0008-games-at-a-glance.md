---
id: 0008
title: "Demo: a games-at-a-glance table in STATUS.md"
status: review      # todo | in-progress | blocked | review | done
priority: 1         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: claude       # claude | copilot | any
model: claude-opus-5-5  # model the runner uses, from the roster in Agent HQ settings.json
---

## Goal
A short table at the end of STATUS.md listing every game, so it's easy to see what exists. It's also a demo of the whole Agent HQ flow for the owner (working agent, a helper visiting its desk, then the reviewer), so keep it small.

## Context
- **Use a helper for the survey:** call the Agent tool once with the Explore helper to look through `src/home/games.js`, the room list, and each game's folder under `src/`, and report for every game: its id, its name as kids see it, which room it's in, and its main source folder. Then write the table yourself from what it reports, checking anything that looks off.
- Add the table under a new heading `## Games at a glance` at the very end of STATUS.md. Columns: Game, Id, Room, Source folder.
- Change nothing else. STATUS.md isn't loaded by the game, so **don't** run `node tools/update-sw.mjs` or bump `APP_VERSION`.

## Acceptance criteria
- [x] STATUS.md ends with the `## Games at a glance` table, with one row for every game in `src/home/games.js` and correct rooms and folders
- [x] No other file changed (apart from this ticket)
- [x] The log says a helper did the survey

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-07 [claude] (opus): created as a demo of the office view, at the owner's request
- 2026-10-07 [claude] (opus-5.5): claimed; plan: Explore helper surveys games, then I verify and add the table to STATUS.md
- 2026-10-07 [claude] (opus-5.5): survey done by an Explore helper (one Agent call). It covered games.js, rooms.json, src/ folders, and scenes. It found 8 games, each in exactly one room, and suggestedOrder matches. I re-checked ids and rooms against games.js and rooms.json, and folders against `src/`. All correct.
- 2026-10-07 [claude] (opus-5.5): helper flagged that games have no on-screen titles (MenuScene draws icon + badge only; confirmed). The Game column uses the names STATUS.md already gives each game, and a note above the table says so. Other things it noted: `undo` has no folder of its own; `air` is a level of `src/builder/`; the `lab` game is in the Kitchen room, not the Lab room; and the Kitchen room's intro line mentions heating while Heat Slider is in the Lab room. I left these as they are, since they're out of scope.
- 2026-10-07 [claude] (opus-5.5): added `## Games at a glance` at the end of STATUS.md. Only STATUS.md and this ticket changed (checked with git diff). The game doesn't load STATUS.md, so I skipped the browser check, update-sw, and APP_VERSION. Ready for review.
