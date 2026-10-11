---
id: 0009
title: "Water Cycle polish: tokens, visibility, river"
status: todo        # todo | in-progress | blocked | review | done
priority: 2         # 1 = high, 2 = normal, 3 = low
depends_on: [0003]  # e.g. [0001, 0002]
agent: any          # claude | copilot | any
model:              # e.g. opus, sonnet, gpt-5.5; leave empty and Agent HQ's assign-tickets proposes one
plan:               # needed = the Architect writes a design plan before anyone builds; done = it has one
---

## Goal
In Water Cycle, only the token for the current step reacts to touch, the water dots and drops are easy to see on the iPad, and the river token no longer covers the mountain's snow cap or the start of the river, which is easier to see.

## Context
- Ticket 0003 (done) built the game; read it first. Code: src/scenes/CycleScene.js, src/cycle/art.js, counts in src/data/cycle.json. No new features, no new spoken lines, no new libraries.
- 1) Input: makeToken (CycleScene.js ~line 95) calls setInteractive, so tokens created mid-step (the river token, created in rain(), and the cloud token, enabled in cool() via enableDrag) can be dragged while an animation plays. Start them with input off (like activate() does with token.input.enabled) and let activate() turn it on only for the current step. Keep the warm and cool starting tokens working as before.
- 2) Visibility: vapor dots (radius 12, in warm()), cloud drops (radius 14, DROP_COLOR 0xeaf6ff in art.js), and raindrops (radius 10, RAIN_COLOR in art.js) are small and pale on the light sky (0xbfe6ff / 0x8fc4f0). Make them bigger and higher contrast (darker fill and/or a darker outline). Check that the cool() step still changes vapor dots into cloud drops and that the rain() step still enlarges/greys the cloud drops, since those set colours and radii directly.
- Keep the science (PLAN.md §9): water vapor is an invisible gas, so vapor dots stay faint, ghost-like and clearly different from the liquid cloud drops, which are solid and visible. Do not make vapor look like liquid drops.
- 3) River: the river token sits at (1290, 850), on the mountain PEAK (1300, 820) and the snow cap drawn in drawLandscape. Move it clear of the peak (also check it stays inside the 1180x820 landscape screen, the game uses a taller 1536-high world, so look at W and the layout files) and keep its drop target TARGET.river and the hand pointer (pointAtToken) sensible after the move. Make the river line (lineStyle 36, colour 0x4fa6e8, alpha 0.35 in drawLandscape, and the alpha tweens in flow() and lapComplete) thicker, darker or more opaque so it is easy to see against the green mountain.
- Also check that the flowing drops in flow() and the zoom/close-up still look right.
- Assumption: exact sizes and colours are the builder's call; the owner will judge by eye on the iPad.
- After changing files the game loads, run node tools/update-sw.mjs and bump APP_VERSION in src/version.js as the last step (CLAUDE.md). Run node tools/browser-check.mjs. Update STATUS.md only if something it says changes.

## Acceptance criteria
- [ ] During the warm, cool, rain and river animations, a tap or drag on the cloud token or river token does nothing; only the token for the current step can be picked up.
- [ ] At each step, the right token still works by tap and by drag to its target, and the full lap (warm, cool, rain, river) still finishes with the star.
- [ ] On the iPad-size screen (1180x820 landscape), vapor dots, cloud drops and raindrops are clearly visible against the sky, noticeably bigger and with stronger contrast than before.
- [ ] Vapor still looks like a faint, invisible-gas style, and the cloud still looks like solid liquid drops; the vapor-to-cloud change is still clear.
- [ ] The river token no longer covers the mountain peak, snow cap or the start of the river, and is still big enough to touch easily (about 96 CSS px or more) and fully on screen.
- [ ] The river line is easy to see against the mountain before, during and after the river step.
- [ ] Service-worker file list and APP_VERSION are updated, and node tools/browser-check.mjs passes with no console errors
- [ ] App builds (or serves) and runs locally with no console errors, and existing features still work
- [ ] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-11 [claude] (sonnet-5-5): created by the Ticket writer from the owner's request
