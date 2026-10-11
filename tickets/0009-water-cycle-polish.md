---
id: 0009
title: "Water Cycle polish: tokens, visibility, river"
status: done        # todo | in-progress | blocked | review | done
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
- [x] During the warm, cool, rain and river animations, a tap or drag on the cloud token or river token does nothing; only the token for the current step can be picked up.
- [x] At each step, the right token still works by tap and by drag to its target, and the full lap (warm, cool, rain, river) still finishes with the star.
- [x] On the iPad-size screen (1180x820 landscape), vapor dots, cloud drops and raindrops are clearly visible against the sky, noticeably bigger and with stronger contrast than before.
- [x] Vapor still looks like a faint, invisible-gas style, and the cloud still looks like solid liquid drops; the vapor-to-cloud change is still clear.
- [x] The river token no longer covers the mountain peak, snow cap or the start of the river, and is still big enough to touch easily (about 96 CSS px or more) and fully on screen.
- [x] The river line is easy to see against the mountain before, during and after the river step.
- [x] Service-worker file list and APP_VERSION are updated, and node tools/browser-check.mjs passes with no console errors
- [x] App builds (or serves) and runs locally with no console errors, and existing features still work
- [x] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-11 [claude] (sonnet-5-5): created by the Ticket writer from the owner's request
- 2026-10-11 [claude] (sonnet-5-5): claimed. The shell blocked multi-command calls, so the claim commit was not made separately; everything is in one commit.
- 2026-10-11 [claude] (sonnet-5-5): changes. (1) Tokens start with input off (makeToken) and the cloud token is created with input off in cool(); activate() turns on only the current step's token. (2) Vapor dots radius 12 to 20, faint (alpha 0.55) lilac with a darker purple outline, so they stay ghost-like; cloud drops radius 14 to 20, solid near-white with a dark-blue outline; cool() now sets the outline, radius 20 and full alpha when vapor becomes liquid; raindrops radius 10 to 16, darker blue with a white outline; rain() fade of cloud drops now 0.55 instead of 0.4 so they stay visible. (3) River token moved from (1290, 850) to (1480, 740) in the sky right of the peak: clear of the peak, snow cap and river start, 200 units wide (about 107 CSS px on the iPad), fully on screen, clear of the Up close circle; TARGET.river and pointAtToken unchanged and still sensible. River line 36 to 56 wide, darker (0x1f6fc8), idle alpha 0.35 to 0.7 (RIVER_IDLE_ALPHA in art.js, also used by reset()), 1 during/after the river step.
- 2026-10-11 [claude] (sonnet-5-5): checks. Tester play on the iPad-size screen with touch: one full lap warm, cool, rain, river reached the star (counter 0 to 1) with no page errors; 8/8 checks passed, including cloud/cool/river tokens having input off during the animations and on only for their own step. I looked at screenshots of the vapor, cloud, rain, river token, flowing and end states. I did not test dragging a token mid-animation with a real finger, only the input flag. node tools/browser-check.mjs passed for every game with no console errors. update-sw run (CACHE_VERSION 31) and APP_VERSION 0.15.1 (water cycle polish). Science guardrails (PLAN.md section 9): vapor stays faint and see-through-looking, clearly different from solid liquid drops. No new spoken lines. STATUS.md unchanged. Left over: the river line's top end still slightly overlaps the bottom edge of the snow cap (as before, a little wider now); the owner can judge by eye on the iPad.
- 2026-10-11 [agent-hq] (merge manager): merged with the owner's approval (PR #18)
