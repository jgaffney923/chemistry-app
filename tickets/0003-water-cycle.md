---
id: 0003
title: "New game: Water Cycle"
status: in-progress # todo | in-progress | blocked | review | done
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

Water Cycle is a new game in a new **Sky & Weather** room, the third room on the Science House. Kids take some sea water all the way round, one step at a time: tap the sun to warm the sea (invisible water vapor rises, shown as purple dots), tap the cold button high in the sky (the vapor turns into tiny liquid drops that make a cloud), tap the cloud (the drops join and fall as rain), then send the water down the river to the sea. A round "up close" window, reused from Heat Slider, shows the water's tiny particles changing from liquid to gas and back to liquid, so kids see that a cloud is liquid water, not gas. Every trip round earns a water drop 💧, saved and shown on the Sky & Weather room. A small change to the house screen makes three rooms fit side by side, with room names and progress that stay inside their windows.

### What the user sees
Game units are 2048x1536, as in every scene (Phaser FIT shows it all on the 1180x820 iPad).

**Science House:** three room windows in one row: Kitchen, Lab, **Sky & Weather** (new, dark sky blue, with a picture of a cloud, sun and drop). Tapping it says `room.sky` and zooms in. Inside, Water Cycle is the room's only game: one big button in the middle (the existing one-game layout, r260), with a `💧 n` badge under it. The Lab no longer gets a fourth game from this ticket, so it tops out at 6 when 0002, 0004 and 0005 land, which still fits.

**Game screen:** one landscape picture. Only the current step's **token** can be tapped. It pulses; the other tokens are dimmed (alpha 0.4) and inactive.
- **Top strip** (y 0–260, the dark background): 🏠 at (130,130) r90, which goes to `Menu` with `{}` and lands back in the Sky room (the registry already does this); 💡 at (350,130) r90; the counter `💧 n` at (W-60,130), right-aligned, 64px, `#ffd84d`. This matches HeatScene and UnmixScene.
- **Sky** y 260–1180, light blue. **Cold band** at the top of the sky (y 260–600), a deeper blue. **Sea** at bottom left (x 0–1000, y 1180–1536). **Land and mountain** on the right (peak about (1300,820)). **River** polyline from about (1290,880) to the sea edge at (1000,1200), faint (alpha 0.35) while dry. These are starting coordinates; adjust them so nothing overlaps.
- **Up close**: a `ParticleView` at (1790,520), r240 (keep r ≥ 240: `LIQUID_TOP` is fixed), on a white backing circle 12px larger (alpha 0.85). Under it: "Up close" (44px, `#2b2350`) and a state word, "Liquid" (`#3fd0e3`) or "Gas" (`#c3a2ff`), 64px, on a small dark rounded plate. Tapping the circle says `cycle.zoom.liquid` or `cycle.zoom.gas`.

Steps (each token is **tapped**, or **dragged** onto its target; a drop anywhere else bounces back with `returnTo` and the hand points at the target):
1. **Warm** – the sun token at (300,430), r130. Target: the sea. The sun grows and glows; `changeEffect(…,'heat')` plays over the sea; the sea shimmers (a colour/alpha tween, **no bubbles**). 18 purple dots (0xc3a2ff, r12) rise and drift up into the cold band around x 950–1350. Up close: `temp` 0.3→0.7, then `setState('gas')`. Line: `cycle.warm`.
2. **Cool** – a ❄️ token in the cold band at (700,400), r100. Target: the dots. `changeEffect(…,'cool')` plays over the dots; they slow, gather at (1150,430), and each turns into a pale drop (white or very light blue, r14, **not purple**). About 30 drops pack together into the cloud. Up close: `setState('liquid')`, temp 0.15. Line: `cycle.cool`.
3. **Rain** – the cloud is the token (hit circle ≥ r150). Tap it, or drag it down. The drops merge into about 8 bigger drops and the cloud greys. About 24 raindrops fall in two waves onto the mountain, and the cloud fades to a wisp. Line: `cycle.rain`. At the end a 💧 river token (r100) appears at the top of the river.
4. **River** – drag the 💧 token to the sea, or tap it. Drops run along the river polyline into the sea, the river goes to full alpha, and the sea ripples. Line: `cycle.river`.
5. **Lap complete**: `addStars('cycle', 1)`, `burst` and `sfx('star')`, a 💧 flies to the counter, and `cycle.lap` plays. When the line ends, reset: the river goes faint, the cloud is cleared, up close goes back to liquid at temp 0.3, and the sun is active again. It goes round forever.

**Guided first visit** (`!tipShown('cycle')`): `cycle.intro` plays and the hand points at the sun. After each step's line finishes, `cycle.do.<nextStep>` plays and the hand points at the next token. After the first lap, `markTipShown('cycle')`. **Later visits**: `cycle.welcome`. The next token activates as soon as its animation ends. **💡** (ignored while busy): `cycle.do.<currentStep>` plus the hand for 3.5 s.

### Files
New:
- `src/scenes/CycleScene.js` – scene key `'Cycle'`. It holds the step machine (`step` = warm | cool | rain | river, `phase` = ready | busy), the tokens, the guide, the hint, the counter and up close. Aim for under ~300 lines.
- `src/cycle/art.js` – `drawLandscape(scene)` (returns `{ sea, river, riverPoints }`), `sunArt`, `cloudOfDrops(scene,x,y,count)`, `raindrop`.
- `src/data/cycle.json` – `steps` (in order: id, token emoji, narration ids), `counts` (vaporDots 18, cloudDrops 30, raindrops 24), `upClose` (`color` "0x3b8ed8", start temp 0.3).

Shared files: registration lines only, no reordering:
- `src/main.js`: add `import CycleScene from './scenes/CycleScene.js';` after the `LayersScene` import, and append `CycleScene` to the **end** of the `scene: [...]` array.
- `src/scenes/BootScene.js`: add `this.load.json('cycle', 'src/data/cycle.json');` after the `float` line.
- `src/home/games.js`: add a `cycle` entry after `air`, with no new imports: `color: 0x4fb3e8`; `icon` = [addEmoji ☁️ (0,-40) 170, 💧 (-70,90) 80, ☀️ (90,80) 80]; `start` → `scene.scene.start('Cycle', {})`; `progress` → `stars = getStars('cycle')`, returning `{ label: stars ? \`💧 ${stars}\` : '', fraction: Math.min(stars / 3, 1) }`.
- `src/data/rooms.json`: add a third room after `lab`, `{ "id": "sky", "label": "Sky & Weather", "color": "0x2a6fb0", "games": ["cycle"] }`, and append `"cycle"` to the end of `suggestedOrder`. **Don't touch the Lab line.**
- `src/scenes/MenuScene.js` (house view only; no other open ticket touches this file):
  - `roomArt()`: add one branch before the 🔬 fallback: `if (id === 'sky') return [addEmoji ☁️ (x, y) 180, ☀️ (x+95, y-85) 100, 💧 (x-80, y+95) 80];`.
  - `roomTile()`: make text fit the narrower windows. With 3 rooms each window is about 387x760 (it was 580 wide), and "Sky & Weather" at 72px, or a full Kitchen progress line, would spill into the next window.
    - Room label: after creating it, if `label.width > w - 40`, `setScale((w - 40) / label.width)`.
    - Progress: 48px, origin (0.5, 0), `setWordWrapWidth(w - 40)`. Build each game's label with non-breaking spaces (` `) inside it, so a wrap only breaks *between* games; `progressText()` still joins with normal spaces.
    - Positions as fractions of `h`: room art centre `-0.22*h`, label `-0.01*h`, progress top `0.07*h`. In the one-row layout (h 760) that gives about -167, -8 and +53, which leaves room for 5 wrapped progress lines inside the window. The 🏠 button, the glow, the tap and the room view are unchanged.
- `src/data/narration.json`: one new block after the `air.*` block (before `"house.intro"`), containing `room.sky` and all `cycle.*` lines, each with `"recorded": false`.
- Generated: `narration-script.md` (`node tools/make-narration-script.mjs`) and `sw.js` (`node tools/update-sw.mjs`). `src/version.js`: `'0.14.0 (cycle)'`, or the next free minor version if another game merged first.
- `STATUS.md`: a "Where things stand" bullet (the Sky & Weather room started, with Water Cycle) and a "Games at a glance" row `Water Cycle | cycle | Sky & Weather | src/cycle/`. `README.md`: the line 6 list (three rooms), and iPad test step 11 (Water Cycle check, including the new room). `PLAN.md` §11.5: add "(started with Water Cycle, ticket 0003)" after the Sky & Weather line.
- **Not changed:** `save.js`, `ParticleView.js`, `effects.js`, `games.js` entries of other games.

### Data and storage
- Collectible: `stars.cycle` in the existing save (`chemistry-save-v1`), through `addStars('cycle', 1)` and `getStars('cycle')`, as FloatScene does it. `load()` already merges `stars`; nothing to migrate. The room tile and in-room badge read it through `GAMES.cycle.progress`.
- First visit: `tipShown('cycle')` / `markTipShown('cycle')`. Room id `sky`, stored in the registry's `room` like the others.
- Narration (draft wording; keep it simple and accurate):
  - `room.sky`: "Sky and weather! Let's find out where rain comes from."
  - `cycle.intro`: "Let's follow some water on a trip! Tap the sun, or drag it over the sea."
  - `cycle.welcome`: "Let's send the water round again! Start with the sun."
  - `cycle.do.warm` / `.cool` / `.rain` / `.river`: short prompts: "Tap the sun", "Tap the snowflake to cool the air high up", "Tap the cloud", "Drag the water down the river".
  - `cycle.warm`: "The sun warms the sea. Some water turns into water vapor, an invisible gas, and floats up. The dots show where it goes. The salt stays in the sea!"
  - `cycle.cool`: "High up, the air is cold. The water vapor cools and turns back into tiny drops of liquid water. Lots of tiny drops make a cloud!"
  - `cycle.rain`: "The tiny drops bump together and join into bigger drops. When they're heavy, they fall as rain. Rain is fresh water, because the salt stayed in the sea."
  - `cycle.river`: "Rain runs downhill into rivers, and the river carries the water back to the sea!"
  - `cycle.lap`: "The water went all the way round! The same water goes round and round. Here's a water drop for you!"
  - `cycle.zoom.liquid`: "Up close, liquid water's tiny particles stay close together and slide around."
  - `cycle.zoom.gas`: "Up close, water vapor's tiny particles fly far apart. It's a gas!"

### Reuse
- `ParticleView` (`src/heat/ParticleView.js`): `new ParticleView(scene,x,y,240)`, then `setMaterial(color)` and **then** `setState('liquid')` (setMaterial starts as a solid). Set `.temp` directly; call `step(time, delta/1000)` from `events.on('update')`, removed on shutdown, as HeatScene does.
- `changeEffect` and `burst` (`src/ui/effects.js`); `makeRoundButton` (`src/ui/button.js`); `addEmoji` and `addLabel` (`src/ui/emoji.js`).
- `makeDraggable` and `returnTo` (`src/systems/drag.js`) with `onTap`, `onDrop` and `onPickUp: clearHand`, following `UnmixScene.buildTools`. Each token is a container with a circle hit area of at least `MIN_TOUCH/2`.
- `say`, `sfx` and `stopNarration` (`src/systems/audio.js`). Guard each `say().then` with `this.sys.isActive()`.
- `pointAt` / `clearHand`: copy UnmixScene's 👇 version. Vapor dot colour 0xc3a2ff, as in Unmix's evaporation.
- The house: the existing `MenuScene` grid (`cols = min(rooms, 3)`) already lays out three rooms; only the text fitting is new.

### Rules
- **§9 and §11.4 (Sky & Weather) accuracy:** water vapor is an invisible gas, drawn as the game's usual purple gas dots and said aloud. Clouds are tiny liquid drops (pale, never purple; up close switches to liquid). The sun *warms*: no bubbling or boiling. Heat comes only from the sun. The salt stays in the sea, so rain is fresh water. Rivers run downhill. Never say "steam", "clouds are gas", or that water "disappears". No home experiments. The ❄️ means "cool"; no line says it snows.
- **§10 principles:** guided first lap with a hand; 💡 always works; wrong drops bounce back, never a fail; 💧 collected and shown on the house; each line plays as its change happens; one idea; replayable.
- **Kid-safe / reading:** nothing needs reading; every instruction is spoken; the room picture shows what the room is.
- **Accessibility:** tokens r100–130 (≥ 96 CSS px). Room windows are about 187 CSS px wide, so still large targets. The next step is shown by a pulse **and** the hand, not by colour. Up close shows a word as well as a colour. White room label on 0x2a6fb0 has about 5:1 contrast; the house text now stays inside its window.
- **Parallel work:** new files, registration lines, one new room line, and a small MenuScene change no other ticket touches. `save.js` is untouched.
- **Release:** narration script regenerated, `update-sw.mjs` run, `APP_VERSION` bumped last, `node tools/browser-check.mjs` passes (it opens every room, including `sky`), STATUS, README and PLAN §11.5 updated. Log the new device-voice lines (`room.sky` plus `cycle.*`) and name the §9 and §11.4 guardrails checked.

### Build order
1. `cycle.json` and the Boot load line; an empty `CycleScene` (landscape plus 🏠); the `main.js` lines; the `games.js` entry; the `sky` room and `suggestedOrder` in `rooms.json`; `room.sky` in narration. The new room opens a static picture.
2. MenuScene: `roomArt` sky branch and text fitting. Check the house with empty and full progress (temporarily set stars in the console, then reset).
3. `src/cycle/art.js`: landscape, sun, cloud and raindrop drawing.
4. Up-close `ParticleView`, its labels, and tap-to-explain.
5. Step machine with tokens: warm → cool → rain → river (tap first, then drag targets and bounce-back).
6. Lap complete: stars, counter, fly-to-counter, reset, going round again.
7. `cycle.*` narration, guided first lap, 💡 hint.
8. STATUS, README and PLAN; `make-narration-script`; `browser-check`; then `update-sw` and `APP_VERSION` last.

### Risks
- **House text fitting:** Phaser's word wrap splits on normal spaces only; check that the non-breaking spaces keep "🏅 15 / 15" together. If they don't, build the progress lines by hand (pack labels into lines no wider than `w - 40`, joined with `\n`).
- **Merge hotspots, keep both** in each: the `main.js` import and scene array, the `BootScene` load lines, the end of `games.js` after `air`, `rooms.json` (other tickets edit the Lab line and `suggestedOrder`; this one adds a room line and ends `suggestedOrder`, so keep every id), the `narration.json` block after `air.*`, `sw.js`, `src/version.js`, the STATUS and README lists, and `narration-script.md`. If another ticket merged first, re-run `update-sw.mjs` and `make-narration-script.mjs` and take the next version, rather than hand-merging the generated files.
- The house suggestion may now glow on Sky & Weather when Water Cycle is the first unplayed game in `suggestedOrder` (it's last, so only after the others are started). That's expected.
- Leaving mid-animation must not throw: keep everything on one container and guard `say().then`.

### For the Tester
- Run `node tools/browser-check.mjs`: every room opens (including `sky`), `"cycle" game starts`, and there are no console errors.
- At 1180x820 with touch emulation, the **house** shows three windows in a row. "Sky & Weather" and every progress line stay inside their windows, both on a fresh save and after progress is earned (the Kitchen's line wraps rather than spilling). Tapping Sky & Weather speaks and opens a room with one big Water Cycle button. The Lab still shows only its own games.
- First visit: you hear the intro and the hand points at the sun. Do all four steps by **tap**, then a full lap by **drag**. A wrong drop bounces back and the hand points. Only the current token responds.
- Check the pictures: no bubbles in the sea; the vapor is purple dots; the cloud is pale drops; up close says Gas after warming and Liquid after cooling; rain lands on the mountain; water runs down the river into the sea.
- The counter goes up by 1 per lap. 🏠 returns to the Sky room. Close and reopen: the 💧 count shows in the game, on the room badge and on the house window, and the second visit says "welcome", not the intro.
- 💡 at each step names that step and points. Tapping 💡 or 🏠 during an animation causes no errors. The other games still open from Kitchen and Lab.
- Listen to `room.sky` and every `cycle.*` line for accuracy (no "steam", no "boil", no "clouds are gas").

### Owner's decisions (2026-10-10)

- Room: start the Sky & Weather room now with only Water Cycle. The plan adds a `sky` room to rooms.json (the Lab line is left alone), a `room.sky` spoken line, a sky picture in MenuScene.roomArt, and text fitting in MenuScene.roomTile so three narrower windows keep their names and progress inside. The Lab-overflow risk is gone, and PLAN §11.5 gets a note.
- Collectible: one 💧 per full trip, saved as stars.cycle. Unchanged, except the badge now shows on the Sky & Weather room and its house window instead of the Lab.

### Notes from the plan check (gpt-5.5)

- The build order says to run browser-check before update-sw and the APP_VERSION bump. Since browser-check also verifies the service worker cache behavior, a builder could change sw.js after the check and not verify the final cached release files. Suggested: Keep APP_VERSION as the final file edit if desired, but make the final validation explicit: run node tools/update-sw.mjs, bump src/version.js, then run node tools/browser-check.mjs again or clearly log why it could not be rerun.
- The up-close ParticleView position at x=1790 with r=240 leaves only about 18 game units, roughly 9 CSS pixels, between the tappable circle and the right edge of the 2048-wide game. That is tighter than the repo's safe-edge guidance for iPad gestures, even though it is not a core gameplay control. Suggested: Tell the builder to move the up-close window left if testing shows edge crowding, for example around x=1720 while keeping r at least 240, and adjust the landscape art around it.
- The plan notes Lab overflow if several parallel tickets merge, and that risk is real: MenuScene.buildRoom uses up to three columns and 580-unit row spacing, so seven Lab games would create a third row that overlaps the title and pushes badges off-screen. This ticket alone only brings Lab to four games, and ticket 0004 would bring it to five, so it is not a blocker for 0003 by itself. Suggested: Have the builder keep the Water Cycle change self-contained exactly as planned, and log the Lab count after rebasing. Whoever makes the merge that reaches seven Lab games should handle the room-layout or Sky & Weather follow-up before release.
- The plan says to aim for CycleScene.js under about 300 lines, but the requested scene includes landscape drawing, four animated steps, tap and drag paths, bounce-back guidance, ParticleView integration, narration sequencing, hints, saving, and reset behavior. Compressing all of that too hard could make the implementation fragile. Suggested: Treat the 300-line target as a soft goal. Keep the scene readable, and move reusable visual construction or step-animation helpers into src/cycle/art.js or another small src/cycle/ helper if needed.

## Acceptance criteria
- [ ] New `cycle` game in a new Sky & Weather room (`sky`) on the Science House, with a room picture, a home-screen button, an icon, and a progress badge; the house's room names and progress text fit inside their windows with three rooms
- [ ] All four steps work in order and the cycle can go round again
- [ ] Guided first visit, 💡 hint button, and a 💧 for each full trip that survives closing and reopening
- [ ] Every spoken line (including `room.sky`) is in `narration.json`; `narration-script.md` regenerated
- [ ] Checked against PLAN.md §9 and the Sky & Weather guardrails in §11.4; guardrails named in the log
- [ ] Works by touch (drag and tap) at iPad size; STATUS.md, the README's iPad test steps, and PLAN.md §11.5 updated
- [ ] `node tools/update-sw.mjs` run and `APP_VERSION` bumped
- [ ] App builds (or serves) and runs locally with no console errors, and existing features still work
- [ ] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-07 [claude] (opus): created from the starter ticket list
- 2026-10-10 [claude] (opus-5-5): design plan written by the Architect; waiting for the owner's OK
- 2026-10-10 [claude] (opus-5-5): plan revised with the owner's answers to its questions
- 2026-10-10 [claude] (sonnet-5-5): claimed the ticket; tried to start the build, but the session's shell commands (git commit, running checks) were denied because nobody can approve them here
