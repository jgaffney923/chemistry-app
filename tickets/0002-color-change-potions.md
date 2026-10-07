---
id: 0002
title: "New game: Color-Change Potions (M12)"
status: todo        # todo | in-progress | blocked | review | done
priority: 2         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: any          # claude | copilot | any
---

## Goal
A new game in the **Lab** room where kids pour kitchen liquids into cups of purple cabbage juice and see that some things are acids, some are bases, and an indicator shows which by its color.

## Context
- Design: PLAN.md 10.6. Follow §10 "Principles for every new module" (teach before testing, hint button, something to collect, no fail states).
- What kids do: add lemon juice or vinegar (turns **pink or red**), plain water (stays **purple**), or baking soda water (turns **blue or green**) to cups of cabbage juice. Then pour a pink cup into a green one and watch it head back toward purple.
- Introduce the words "acid" and "base" with pictures, not reading.
- **Accuracy (PLAN.md §9, acids and bases):** red cabbage colors exactly as above; never suggest tasting anything or testing household cleaners. Vinegar meeting baking soda really fizzes (the Kitchen Lab already shows this), so if the pink cup is vinegar and the green cup is baking soda water, show bubbles as they mix.
- Reuse the toolkit: Lab pouring and beaker (`src/lab/`), sticker book (`src/lab/StickerBook.js`).
- New-game file pattern: see "New games follow the existing structure" in CLAUDE.md. Suggested id `potions`.
- STATUS.md says the owner wants M9–M11 kid-tested first; the owner is doing that separately, so this ticket can go ahead.

## Acceptance criteria
- [ ] New `potions` game in the Lab room, with a home-screen button, icon, and progress badge
- [ ] All three liquids give the correct indicator color; mixing acid into base moves toward purple (with fizz for vinegar + baking soda)
- [ ] Guided first visit, 💡 hint button, and something to collect (stickers or similar) that survives closing and reopening
- [ ] Every spoken line is in `narration.json`; `narration-script.md` regenerated
- [ ] Checked against PLAN.md §9; guardrails named in the log
- [ ] Works by touch (drag and tap) at iPad size; STATUS.md and the README's iPad test steps updated
- [ ] `node tools/update-sw.mjs` run and `APP_VERSION` bumped
- [ ] App builds (or serves) and runs locally with no console errors, and existing features still work
- [ ] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-07 [claude] (opus): created from the starter ticket list
