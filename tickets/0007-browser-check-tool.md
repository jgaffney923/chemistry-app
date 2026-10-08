---
id: 0007
title: "Browser-check tool so agents can catch console errors"
status: todo        # todo | in-progress | blocked | review | done
priority: 2         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: any          # claude | copilot | any
---

## Goal
Add `tools/browser-check.mjs`: one command that serves the game, opens it in a real (headless) browser, and reports any page errors. Agents working tickets can't open a browser themselves, so this is how they'll check "runs with no console errors" before handing a ticket in.

## Context
- Model it on the reading app's `tools/browser-check.mjs` (repo jgaffney923/reading-lab). Copy its plumbing: the tiny static server on `localhost`, finding Playwright locally or in the global npm folder, the `check(name, fn)` helper that collects `pageerror` messages, and the ok/FAIL summary with a non-zero exit code on failure.
- `src/main.js` already sets `window.__game` when served from `localhost`, so checks can wait for scenes the same way the reading app does.
- Checks to start with:
  - the game loads to the home screen with no page errors or console errors
  - every game listed in `src/home/games.js` starts its scene without errors
  - the service worker caches every file in its precache list
- Keep the checks general. Game-specific checks can come in later tickets.
- **No new dependencies** (PLAN.md §8): Playwright stays outside the app, installed globally like the reading app (`npm install -g playwright`). It isn't installed on the owner's PC yet. If you can't run the tool, say so in the log and the owner will install it and run it.
- Document the command in the README (next to how to run the game), and add a line to CLAUDE.md's "Done means it serves and loads with no console errors" rule saying to run it.
- Once this is merged, the owner adds `node tools/browser-check.mjs` to chem's allowed commands in Agent HQ's `apps.json` so headless agents may run it.

## Acceptance criteria
- [ ] `node tools/browser-check.mjs` serves the game, runs the checks above, prints ok/FAIL per check, and exits non-zero on any failure
- [ ] It passes on the current game
- [ ] README and CLAUDE.md mention it; no new dependency in the repo
- [ ] App builds (or serves) and runs locally with no console errors, and existing features still work
- [ ] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-07 [claude] (opus): created at the owner's request, so agents can check for console errors themselves
