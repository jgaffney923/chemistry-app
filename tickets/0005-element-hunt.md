---
id: 0005
title: "New game: Element Hunt"
status: todo        # todo | in-progress | blocked | review | done
priority: 3         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: copilot       # builder tool: claude | copilot | any
model: gpt-5.5       # builder model
reviewer: claude     # review tool: claude | copilot | any
review_model: claude-sonnet-5-5  # reviewer model
---

## Goal
A new game in the **Kitchen** room where kids explore a picture of a house, tap everyday objects, and collect element cards. They learn that an element is one kind of atom, and everything is made of elements, alone or joined together.

## Context
- Design: PLAN.md 10.10. Follow §10 "Principles for every new module".
- Objects and their cards:
  - party balloon: helium
  - pencil middle: carbon (graphite)
  - soda can: aluminum
  - frying pan: iron
  - ring: gold
  - wire inside a cable: copper
  - table salt: sodium and chlorine
  - water: hydrogen and oxygen
  - air: nitrogen and oxygen
  - fun fact: a diamond is carbon too
- **Accuracy (PLAN.md §9, elements):**
  - Pencil "lead" is carbon (graphite), not lead.
  - Table salt is sodium and chlorine joined together; don't call it a molecule.
  - Water is hydrogen and oxygen joined together.
  - Air is a *mix* of nitrogen and oxygen, not joined together.
- Reuse the toolkit: atom art with one color per element (`src/art/atoms.js`; keep existing colors and add new ones for the new elements), the sticker book pattern for the cards.
- Art-heavy: draw the house and objects in code like the existing art, unless a ticket comment says otherwise.
- New-game file pattern: see "New games follow the existing structure" in CLAUDE.md. Suggested id `elements`.

## Acceptance criteria
- [ ] New `elements` game in the Kitchen room, with a home-screen button, icon, and progress badge
- [ ] All ten objects can be found, each giving the correct card with a spoken explanation
- [ ] Cards are collected in a book that survives closing and reopening
- [ ] Guided first visit and 💡 hint button
- [ ] Every spoken line is in `narration.json`; `narration-script.md` regenerated
- [ ] Checked against PLAN.md §9; guardrails named in the log
- [ ] Works by touch at iPad size; STATUS.md and the README's iPad test steps updated
- [ ] `node tools/update-sw.mjs` run and `APP_VERSION` bumped
- [ ] App builds (or serves) and runs locally with no console errors, and existing features still work
- [ ] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-07 [claude] (opus): created from the starter ticket list
- 2026-10-08 [claude] (claude-opus-5-5) coordinator: builder copilot gpt-5.5, reviewer claude claude-sonnet-5-5 (new game with science content; keeps the build split two each)
