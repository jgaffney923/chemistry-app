# Notes for agents: Chemistry Play

Read these first: [README.md](README.md) (run, deploy, iPad testing), [PLAN.md](PLAN.md) (design and milestones), and [STATUS.md](STATUS.md) (where things stand).

## App design rules

The rules live in PLAN.md. Follow them there rather than copying them here:

- **§2 Constraints (non-negotiable):** iPad Safari, offline-first, kid-safe, minimal reading, accurate, never punishing.
- **§8 Agent working rules:** small files, content in JSON, touch input, no new dependencies, service-worker cache, README test steps.
- **§9 Science accuracy guardrails**, plus §11.4 for non-chemistry rooms.
- **§10 "Principles for every new module":** teach before testing, always a way forward, something to collect.

The short version (PLAN.md wins if these ever differ):

- **Ages 6–8:** big touch targets (`MIN_TOUCH`, about 96 CSS px), very little reading, bright and friendly visuals, encouraging feedback. Never a harsh "wrong" screen.
- **iPad Safari, offline once installed.** Landscape is the main layout. **Portrait is a goal, not yet true:** today portrait shows a rotate prompt (STATUS.md, next steps). Don't make portrait worse; only build portrait layouts when a ticket asks for them.
- **No accounts, ads, external links, analytics, or data collection.**
- **Chemistry is simple but accurate.** Never include instructions for real experiments with household chemicals.
- **New games follow the existing structure:**
  - scene in `src/scenes/<Name>Scene.js`, registered in `src/main.js`
  - game code in `src/<game>/`, content in `src/data/<game>.json` (loaded in `src/scenes/BootScene.js`)
  - home-screen entry in `src/home/games.js`, listed in a room (and `suggestedOrder`) in `src/data/rooms.json`
  - progress saved through `src/systems/save.js`
  - every spoken line in `src/data/narration.json`, then `node tools/make-narration-script.mjs`

## Tickets

When working a ticket, follow `tickets/PROTOCOL.md`.

What's specific to this repo:

- **Tickets and milestones.** PLAN.md §8 says to work milestone by milestone. A ticket is the unit of work. It may be a whole milestone (such as a new game) or part of one. Do only what the ticket asks, and don't start other milestone work. The summary §8 asks for after a milestone goes in the ticket's final log entry. Update STATUS.md (and the README's iPad test steps) when a ticket adds or changes a game.
- **Done means it serves and loads with no console errors.** There is no build step. Serve the folder (`npx serve .`), open it in the browser, and check:
  - The game loads and the changed parts work, by mouse and touch emulation.
  - The console shows no errors.
  - The other games still open from the Science House.
- **Merging to `main` deploys to the kids' iPad** (GitHub Pages publishes `main`). Never commit to, push to, or merge into `main`; the owner reviews every ticket first. Because a merge goes live, finish each ticket release-ready. If it changes any file the game loads, run `node tools/update-sw.mjs` and bump `APP_VERSION` in `src/version.js` as the last step. If another ticket was merged first, these two files may conflict; say so in the log.
- **This repo is public.** Tickets, logs, and commit messages must never contain personal information: no names, ages, or photos of the kids or family, no addresses, emails, or locations. Say "the owner" and "the kids".
- **New spoken lines** play with the iPad's built-in voice until the owner runs `node tools/make-placeholder-voices.mjs` on the Windows PC. Note new lines in the log; don't try to generate voices.
- **Science content:** when a ticket adds or changes what the game teaches, check it against PLAN.md §9 and name the guardrails you checked in the log.
