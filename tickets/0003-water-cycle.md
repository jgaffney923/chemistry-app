---
id: 0003
title: "New game: Water Cycle"
status: todo        # todo | in-progress | blocked | review | done
priority: 2         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: any          # claude | copilot | any
plan: done          # the Architect writes a design plan before anyone builds
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

## Design plan

_Written by the Architect (claude-opus-5-5) on 2026-10-10. The owner approves it by merging; builders follow it._

Water Cycle is a new game in the Lab where kids take some sea water all the way round, one step at a time: tap the sun to warm the sea (invisible water vapor rises, shown as purple dots), tap the cold button high in the sky (the vapor turns into tiny liquid drops that make a cloud), tap the cloud (the drops join and fall as rain), then send the water down the river to the sea. A round "up close" window, reused from Heat Slider, shows the water's tiny particles changing from liquid to gas and back to liquid, so kids see that a cloud is liquid water, not gas. Every trip round earns a water drop 💧 that is saved and shown on the Lab button. Progress is saved through the game's existing star system, so nothing changes in the shared save file. That keeps the merge simple while three other new games are being built at the same time.

### What the user sees
Game units are 2048x1536, the same as every other scene (Phaser FIT puts the whole picture on the 1180x820 iPad screen with thin side bars). The landscape is one picture. Only one thing can be tapped at a time: the current step's **token** pulses, and the other tokens are dimmed (alpha 0.4) and can't be tapped.

- **Top strip** (y 0–260, the dark game background, so the labels keep their contrast): 🏠 at (130,130) r90 goes to `Menu` with `{}`; 💡 at (350,130) r90; counter `💧 n` at (W-60,130), right-aligned, 64px, `#ffd84d`. This matches HeatScene and UnmixScene.
- **Sky** y 260–1180, light blue. **Cold band** at the top of the sky (y 260–600), a slightly deeper blue. **Sea** at bottom left (x 0–1000, y 1180–1536). **Land and mountain** on the right: peak about (1300,820), filling to the right edge. **River** polyline from about (1290,880) down to the sea edge at (1000,1200), drawn faint (alpha 0.35) while dry. These are starting coordinates; adjust them so nothing overlaps.
- **Up close**: a `ParticleView` at (1790,520) with r240 (keep r ≥ 240: its liquid line `LIQUID_TOP` is fixed). It sits on a white backing circle 12px larger (alpha 0.85) so the window reads clearly against the sky. Under it: the label "Up close" (44px, dark `#2b2350`) and a state label "Liquid" (`#3fd0e3`) or "Gas" (`#c3a2ff`), 64px, on a small dark rounded plate so it keeps its contrast. Tapping the circle says `cycle.zoom.liquid` or `cycle.zoom.gas`.

Steps (each token can be **tapped** or **dragged** onto its target; a drop anywhere else bounces back with `returnTo` and the hand points at the target):
1. **Warm** – the sun token at (300,430), r130. Target: the sea. The sun grows a little and glows; `changeEffect(…,'heat')` plays over the sea; the sea shimmers (a gentle colour/alpha tween, **no bubbles**). 18 purple dots (0xc3a2ff, r12) rise from the sea surface and drift up into the cold band around x 950–1350, wobbling. Up close: `temp` goes 0.3→0.7, then `setState('gas')`. Line: `cycle.warm`.
2. **Cool** – a ❄️ token in the cold band at (700,400), r100. Target: the dots. `changeEffect(…,'cool')` plays over the dots; they slow and gather at (1150,430), and each one turns into a small pale drop (white or very light blue, r14, **not purple**). About 30 drops pack together into the cloud. Up close: `setState('liquid')`, temp 0.15. Line: `cycle.cool`.
3. **Rain** – the cloud itself is the token (hit circle ≥ r150). Tap it, or drag it downward. The drops pull into about 8 bigger drops and the cloud greys a little. Then about 24 raindrops fall in two waves onto the mountain slope, and the cloud fades to a thin wisp. Line: `cycle.rain`. At the end a 💧 river token (r100) fades in at the top of the river.
4. **River** – drag the 💧 token down to the sea, or tap it. Blue drops run along the river polyline into the sea, the river goes to full alpha, and the sea ripples. Line: `cycle.river`.
5. **Lap complete**: `addStars('cycle', 1)`, `burst` and `sfx('star')`, a 💧 flies from the sea to the counter, the counter updates, and `cycle.lap` plays. When that line ends, reset: the river goes faint, the cloud is cleared, up close goes back to liquid at temp 0.3, and the sun token is active again. The cycle can go round forever.

**Guided first visit** (`!tipShown('cycle')`): `cycle.intro` plays and the hand points at the sun. After each step's line finishes, `cycle.do.<nextStep>` plays and the hand points at the next token. After the first lap, `markTipShown('cycle')`. **Later visits**: `cycle.welcome`. The next token becomes active as soon as its animation ends (it pulses, with no prompt). **💡** (ignored while busy): `cycle.do.<currentStep>`, plus the hand for 3.5 s.

### Files
New:
- `src/scenes/CycleScene.js` – scene key `'Cycle'`. It holds the step machine (`step` = warm | cool | rain | river, `phase` = ready | busy), the tokens, the guide, the hint, the counter and the up-close view. Aim for under ~300 lines.
- `src/cycle/art.js` – drawing helpers that return game objects: `drawLandscape(scene)` (sky, cold band, sea, land, river; returns `{ sea, river, riverPoints }`), `sunArt`, `cloudOfDrops(scene, x, y, count)`, `raindrop`. Purely visual, so the scene file stays small.
- `src/data/cycle.json` – content: `steps` (in order: id, token emoji, narration ids), `counts` (vaporDots 18, cloudDrops 30, raindrops 24), `upClose` (`color` "0x3b8ed8", start temp), `fullAfterLaps` 3.

Shared files: registration lines only, no reordering:
- `src/main.js`: add `import CycleScene from './scenes/CycleScene.js';` after the `LayersScene` import, and append `CycleScene` at the **end** of the `scene: [...]` array.
- `src/scenes/BootScene.js`: add `this.load.json('cycle', 'src/data/cycle.json');` after the `float` line.
- `src/home/games.js`: add a `cycle` entry after `air` and before the closing `};`. It needs no new imports (it uses `addEmoji` and `getStars`, already imported): `color: 0x4fb3e8`, `icon` = [☁️ (0,-40) 170, 💧 (-70,90) 80, ☀️ (90,80) 80], `start` → `scene.scene.start('Cycle', {})`, `progress` → `stars = getStars('cycle')`, `{ label: stars ? \`💧 ${stars}\` : '', fraction: Math.min(stars / 3, 1) }`.
- `src/data/rooms.json`: append `"cycle"` to the Lab `games` and to the end of `suggestedOrder`.
- `src/data/narration.json`: one new block of `cycle.*` lines with `"recorded": false`, inserted after the `air.*` block (before `"house.intro"`), separated by blank lines.
- Regenerated by tools: `narration-script.md` (`node tools/make-narration-script.mjs`) and `sw.js` (`node tools/update-sw.mjs`).
- `src/version.js`: `APP_VERSION = '0.14.0 (cycle)'` (or the next free minor version if another game merged first).
- `STATUS.md`: one "Where things stand" bullet and one "Games at a glance" row (`Water Cycle | cycle | Lab | src/cycle/`). `README.md`: the line 6 game list, plus iPad test step 11 (Water Cycle check).
- **Not changed:** `save.js`, `MenuScene.js`, `ParticleView.js`, `effects.js`.

### Data and storage
- Collectible: `stars.cycle` in the existing save (`chemistry-save-v1`), through `addStars('cycle', 1)` and `getStars('cycle')`, the same way FloatScene does it. `load()` already merges `stars`, so old saves keep working and nothing is migrated.
- First visit: `tipShown('cycle')` / `markTipShown('cycle')`.
- Narration ids (draft wording, keep it simple and accurate):
  - `cycle.intro`: "Let's follow some water on a trip! Tap the sun, or drag it over the sea."
  - `cycle.welcome`: "Let's send the water round again! Start with the sun."
  - `cycle.do.warm` / `cycle.do.cool` / `cycle.do.rain` / `cycle.do.river`: short "tap the sun / tap the snowflake to cool the air high up / tap the cloud / drag the water down the river" prompts.
  - `cycle.warm`: "The sun warms the sea. Some water turns into water vapor, an invisible gas, and floats up. The dots show where it goes. The salt stays in the sea!"
  - `cycle.cool`: "High up, the air is cold. The water vapor cools and turns back into tiny drops of liquid water. Lots of tiny drops make a cloud!"
  - `cycle.rain`: "The tiny drops bump together and join into bigger drops. When they're heavy, they fall as rain. Rain is fresh water, because the salt stayed in the sea."
  - `cycle.river`: "Rain runs downhill into rivers, and the river carries the water back to the sea!"
  - `cycle.lap`: "The water went all the way round! The same water goes round and round. Here's a water drop for you!"
  - `cycle.zoom.liquid`: "Up close, liquid water's tiny particles stay close together and slide around."
  - `cycle.zoom.gas`: "Up close, water vapor's tiny particles fly far apart. It's a gas!"

### Reuse
- `ParticleView` (`src/heat/ParticleView.js`): `new ParticleView(scene,x,y,240)`, then `setMaterial(color)` and **then** `setState('liquid')` (setMaterial starts as a solid). Set `.temp` directly, and call `step(time, delta/1000)` from `events.on('update')`, removed on shutdown, exactly as HeatScene does.
- `changeEffect` and `burst` (`src/ui/effects.js`); `makeRoundButton` (`src/ui/button.js`) for 🏠/💡; `addEmoji` and `addLabel` (`src/ui/emoji.js`).
- `makeDraggable` and `returnTo` (`src/systems/drag.js`) for tokens, with `onTap`, `onDrop` and `onPickUp: clearHand`, following `UnmixScene.buildTools`. Each token is a container with a circle hit area of at least `MIN_TOUCH/2`.
- `say`, `sfx` and `stopNarration` (`src/systems/audio.js`). `say()` returns a promise; guard each `.then` with `this.sys.isActive()`, as UnmixScene does.
- `pointAt` / `clearHand`: copy UnmixScene's 👇 version.
- The vapor dot colour 0xc3a2ff is the same as Unmix's evaporation dots.

### Rules
- **§9 accuracy:** water vapor is an invisible gas, drawn as the game's usual purple gas dots, and the line says so. The cloud is drawn as liquid drops (pale, never purple), and up close switches to liquid at the cool step. The sun *warms*: no bubbling, no boiling. Heat comes only from the sun. The salt stays in the sea, so rain is fresh water. Rivers run downhill. Never say "steam", "clouds are gas", or that water "disappears". No home-experiment instructions. The ❄️ is a "cool" button; no line says it snows.
- **§10 principles:** guided first lap with a pointing hand; 💡 always works; drops anywhere else bounce back with a hand, never a fail; 💧 collected and shown on the home badge; each line plays as its change happens; one idea; replayable.
- **Kid-safe / reading:** no text needed to play; every instruction is spoken.
- **Accessibility:** tokens r100–130 (≥ 96 CSS px). The next step is shown by a pulse **and** the hand, not by colour alone. Up close shows a word as well as a colour. Labels are dark-on-light or sit on dark plates.
- **Parallel work:** new files plus single registration lines; `save.js` untouched.
- **Self-contained:** everything lives in `src/cycle/`, `CycleScene.js` and `cycle.json`, so moving the game to Sky & Weather later is a `rooms.json` change.
- **Release:** narration script regenerated, `update-sw.mjs` run, `APP_VERSION` bumped as the last step, `node tools/browser-check.mjs` passes, STATUS and README updated. Log the new device-voice lines and name the §9 guardrails checked.

### Build order
1. Write `cycle.json` and add the Boot load line; add an empty `CycleScene` (landscape plus 🏠) with the `main.js` lines; add the `games.js` entry and the `rooms.json` ids. The button opens a static picture.
2. `src/cycle/art.js`: landscape, sun, cloud and raindrop drawing.
3. Up-close `ParticleView`, its labels, and tap-to-explain.
4. Step machine with tokens: warm → cool → rain → river (tap first, then drag targets and bounce-back).
5. Lap complete: stars, counter, fly-to-counter, reset, and going round again.
6. Narration lines, guided first lap, and 💡 hint.
7. STATUS and README; `make-narration-script`; `browser-check`; then `update-sw` and `APP_VERSION` last.

### Risks
- **Lab overflow:** the Lab has 3 games. Tickets 0002, 0003, 0004 and 0005 each add one, making 7. `MenuScene.buildRoom` fits at most 6 (with 7 it makes 3 rows; the top row covers the title and the bottom badges go off screen). Whoever merges the 7th game will break the room screen; see the owner question. The builder should note the Lab count in the log.
- **Merge hotspots, keep both** in each: the `main.js` import and scene array, the `BootScene` load lines, the end of `games.js` after `air`, the `rooms.json` Lab `games` and `suggestedOrder` lines (same line in all four tickets), the `narration.json` block after `air.*`, `sw.js`, `src/version.js`, the STATUS and README lists, and `narration-script.md`. If another ticket merged first, re-run `update-sw.mjs` and `make-narration-script.mjs` and take the next version, rather than hand-merging the generated files.
- **ParticleView** at r < 240 will look crowded. Leaving mid-animation must not throw: put everything on one container, and guard `say().then`.
- Long lines on the guided lap could feel slow; later laps don't wait for speech.

### For the Tester
- Run `node tools/browser-check.mjs`; the `"cycle" game starts` check must pass with no console errors.
- At the iPad size (1180x820, touch emulation): Science House → Lab → Water Cycle button with its ☁️ icon. First visit: you hear the intro and the hand points at the sun.
- Do all four steps by **tap**, then a full lap by **drag**. Drop each token somewhere wrong: it bounces back and the hand points. Only the current token responds.
- Check the pictures: no bubbles in the sea; the vapor is purple dots; the cloud is pale drops; up close says Gas after warming and Liquid after cooling; rain lands on the mountain; water runs down the river into the sea.
- The counter goes up by 1 per lap. Close and reopen: the 💧 count stays, both in the game and on the Lab badge, and the second visit says "welcome", not the intro.
- 💡 at each step names that step and points. Tap 💡 and 🏠 during an animation: there are no errors, and the other games still open.
- Listen to every `cycle.*` line for accuracy (no "steam", no "boil", no "clouds are gas").

### Questions for the owner

- Room crowding: if all four new games (Potions, Water Cycle, Crystal Garden, Element Hunt) are merged, the Lab will have 7 games, and its screen only fits 6 (the top row would cover the title). Do you want to start the Sky & Weather room now with just Water Cycle in it (a small extra change: a new room on the house and its window picture), or keep it in the Lab and have a follow-up ticket make rooms fit 7 or more? I recommend starting Sky & Weather now, since the plan already puts Water Cycle there. Until you answer, the plan puts it in the Lab as the ticket says.
- What kids collect: the plan gives one water drop 💧 for each full trip round, counted on the Lab button (like the stars in Sink or Float). Would you rather have a set of stickers instead, for example the rain landing somewhere different each trip? That would be more work. Until you answer, the plan uses the 💧 count.

### Notes from the plan check (gpt-5.5)

- The build order says to run browser-check before update-sw and the APP_VERSION bump. Since browser-check also verifies the service worker cache behavior, a builder could change sw.js after the check and not verify the final cached release files. Suggested: Keep APP_VERSION as the final file edit if desired, but make the final validation explicit: run node tools/update-sw.mjs, bump src/version.js, then run node tools/browser-check.mjs again or clearly log why it could not be rerun.
- The up-close ParticleView position at x=1790 with r=240 leaves only about 18 game units, roughly 9 CSS pixels, between the tappable circle and the right edge of the 2048-wide game. That is tighter than the repo's safe-edge guidance for iPad gestures, even though it is not a core gameplay control. Suggested: Tell the builder to move the up-close window left if testing shows edge crowding, for example around x=1720 while keeping r at least 240, and adjust the landscape art around it.
- The plan notes Lab overflow if several parallel tickets merge, and that risk is real: MenuScene.buildRoom uses up to three columns and 580-unit row spacing, so seven Lab games would create a third row that overlaps the title and pushes badges off-screen. This ticket alone only brings Lab to four games, and ticket 0004 would bring it to five, so it is not a blocker for 0003 by itself. Suggested: Have the builder keep the Water Cycle change self-contained exactly as planned, and log the Lab count after rebasing. Whoever makes the merge that reaches seven Lab games should handle the room-layout or Sky & Weather follow-up before release.
- The plan says to aim for CycleScene.js under about 300 lines, but the requested scene includes landscape drawing, four animated steps, tap and drag paths, bounce-back guidance, ParticleView integration, narration sequencing, hints, saving, and reset behavior. Compressing all of that too hard could make the implementation fragile. Suggested: Treat the 300-line target as a soft goal. Keep the scene readable, and move reusable visual construction or step-animation helpers into src/cycle/art.js or another small src/cycle/ helper if needed.

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
- 2026-10-10 [claude] (opus-5-5): design plan written by the Architect; waiting for the owner's OK
