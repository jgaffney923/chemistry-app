# Status (last updated 2026-10-06)

## Where things stand
- **M0 (app shell)** built. Pushed to https://github.com/jgaffney923/chemistry-app (public; commits use the GitHub noreply email `282106827+jgaffney923@users.noreply.github.com`, set in this repo's git config). GitHub Pages is enabled and publishes the repository root from `main` at https://jgaffney923.github.io/chemistry-app/
- **M1 (menu + State Sorter)** built, plus two additions requested during M1:
  - a "try it first" warm-up before the first round (solid block, pouring juice, gas jar), then a guided first round;
  - a 💡 button in the Sorter that replays the warm-up.
- **M2 (Sorter polish)** partly done:
  - done: all Sorter items drawn in code (`src/art/items.js`), Level 2 heating/cooling chains (unlock at 6 stars, 🔥/❄️ buttons, level picker).
  - voice: the current catalog has 283 lines; 2 are owner recordings, 199 use a stand-in computer voice (Zira, marked `"placeholder": true` in narration.json), and 82 new Unmix and Sink or Float lines use device speech. Converting them to stand-in recordings needs `tools/make-placeholder-voices.mjs` run on the Windows PC (it uses the Zira voice).
  - not done: owner's remaining recordings, real sound effects (current ones are generated beeps), UI icons are still emoji.
- **M3 Kitchen Lab** built (2026-09-28): shelf of 11 items, hot plate, freezer, beaker, spoon, magnifying glass, 15 discovery stickers + sticker book, guided first visit. Code in `src/lab/` and `src/scenes/LabScene.js`, data in `src/data/lab.json`. Tested in Edge only.
- **M3 follow-ups (2026-09-28):** Lab 💡 hint button; vinegar/baking soda alone now nudge toward each other (owner reported "a bottle that doesn't do anything").
- **M4 Molecule Builder** built (2026-09-28): H/O/C atoms with wiggling yellow bond-spot nubs, join by dropping near, pull apart to break, push together for double bonds, 5 recipe cards (water, hydrogen, oxygen, carbon dioxide, methane) that snap into real shapes, unnamed complete molecules praised without a made-up name, guided first build (water). Code in `src/builder/` and `src/scenes/BuilderScene.js`, data in `src/data/molecules.json`. Tested in Edge only.
- **Builder fixes from owner testing (2026-09-28):** + button on bonds for double bonds (plus a one-time explanation), pushing counts when atoms just touch, instant completion feedback. Also fixed a drag lag in every game: dragged things trailed ~24 units behind the finger.
- **M6 Science House** built (2026-09-28): the home screen is now a house with a Kitchen room (Sorter, Kitchen Lab) and a Lab room (Molecule Builder). Built before M5 at the owner's request, since it doesn't depend on kid feedback.
- **M7 Can It Be Undone?** built (2026-09-29) in the Kitchen room: watch a change, guess can-undo / can't-undo, then the game tests it by trying to reverse it. 10 changes, 9 new drawings. Built before M5 at the owner's request ("lets continue").
- **M5 kid test** done (2026-09-29): the owner played it with their kids, and they liked it. Their feedback: label the Lab's bottles and boxes so kids can read them (done: name tags under every shelf item).
- **M8 Heat Slider** built (2026-09-29) in the Lab room: drag a thermometer, see water/chocolate/butter as-is and up close as particles; markers pinned where each melts or boils; 8 changes to find.
- **Pre-M9 menu readiness** done (2026-10-03): room menus use two centered rows for four to six games, preserving the existing layout for two or three. Checked button/icon bounds and populated progress badges for two through six games in the browser, plus Kitchen Lab navigation and return at 1366x1024.
- **M9 Unmix!** gameplay built (2026-10-03): sieve, magnet, paper filter, sunny windowsill with accelerated evaporation, and skimmer; five mixtures, five separately saved stickers, reusable sticker book, guided first filter experiment, hints, tap/drag tool use, replay, and a salt-water magnifier. Data in `src/data/unmix.json`; scene in `src/scenes/UnmixScene.js`; custom tool/particle art in `src/unmix/art.js`. Browser checks cover all five separations, salt-water filtering without a sticker, salt recovery, hinting, replay without duplicate stickers, busy-state guards, sticker-book access, and Kitchen navigation. Real-iPad kid testing is pending. New narration uses device speech until ffmpeg is available.
- **M10 Sink or Float** built (2026-10-06) in the Kitchen, on branch `m10-sink-or-float`. Built before the M9 kid test at the owner's request. Two parts: the **tank** (guess Float or Sink, drop it in; 2 floaters + 2 sinkers per round from 9 things, always ending with the orange, which floats with its peel and sinks without it) and the **Liquid Tower** (pour honey, water, and oil in any order and they settle honey / water / oil; then a cork floats on the oil, a grape stops on the honey, a coin sinks to the bottom). 3 stars per tank round or tower. A big log was added to the plan's list of objects to show that big, heavy things can float. Scenes `src/scenes/FloatScene.js` and `LayersScene.js`, data `src/data/float.json`, art `src/float/`. 50 new lines use device speech. Release `0.12.0 (float)`, cache version 21.
- **Roadmap (2026-09-28):** PLAN.md section 10 now lists 15 more modules in three tiers, a scalable "Science House" home screen, and milestones M6-M16. Owner asked for the expansion before M5; the order is to be revisited after kid testing. Section 11 adds rooms for other sciences (Workshop/physics, Garden/life science, Sky & Weather/earth and space) with their own accuracy guardrails, to come after chemistry Tier 1.

## Tested
In Edge on the PC with automated Playwright runs (Sorter rounds, warm-up, Level 2, parent corner, offline reload, all 15 Lab discoveries + magnifier, all Builder recipes and double bonds, Science House navigation, a full Can It Be Undone? round). The owner has also played each game on the PC or iPad as it shipped.
M10 browser checks (Chromium, Playwright, 1024x768): a full tank round by mouse and by touch, including drag-before-guess bouncing back, the orange peel step, hints, and 3 stars saved; the Liquid Tower poured in oil, water, honey order (it settles honey / water / oil), drag and tap pouring, the "already poured" tap, all three drops at their layers, 3 more stars, and the Kitchen badge; leaving either scene mid-animation without errors. No console errors. Not yet tried on the iPad.
M9 browser checks also passed for touch-emulated dragging, all five stickers surviving reload, and an offline launch with browser networking disabled. The M9 release is `0.11.0 (unmix)` with cache version 20. Recorded-audio playback and device-speech fallback still need a real-iPad check.
On the real iPad: installs from GitHub Pages and plays; the owner's recorded voice plays. M5 kid testing was reported on 2026-09-29, but the device used was not recorded. A focused installed-iPad test of M8 and the updated menus is still pending.

## Next steps
1. Kid-test Heat Slider in the installed iPad app: heating and cooling, material switching, hints, offline launch, background/resume audio, and simultaneous touches.
2. Kid-test M9 Unmix! and M10 Sink or Float on the installed iPad before starting M11 Air Builder. For Sink or Float, watch whether kids understand the Float and Sink button pictures, and whether they try different pour orders in the Liquid Tower.
   For M9 Unmix!: Check tool recognition, dragging, all five stickers, offline narration, and replay. Then run `node tools/make-placeholder-voices.mjs` on the Windows PC to give the 82 new lines the stand-in voice.
3. Schedule playable portrait layouts; the current rotation prompt remains a temporary fallback, not the final portrait experience.
4. Record introductions, hints, and discovery explanations first; stand-in voice remains available for the rest.
5. Future development: Azure neural narration is deferred at the owner's request (2026-10-03). Compare a five-line voice sample before adding a developer-only MP3 generation tool and player support. Keep the current audio implementation for this release; see PLAN.md's cross-cutting improvements.

## Quick look without GitHub
Serve the folder (`python -m http.server 8080` from this folder) and open `http://localhost:8080`, or `http://<PC's Wi-Fi IP>:8080` on the iPad on the same Wi-Fi (no offline mode that way).

## Decisions made along the way
- Phaser pinned at 3.90.0 (last v3) even though Phaser 4 exists.
- Heat is a flame, not a sun (sunshine can't boil water into steam).
- Liquids are drawn as the liquid itself (not a carton/jar, which is a solid); gases carry purple "gas dots".
- Stars reward finishing, never go down.
- Game units are 2048x1536; `MIN_TOUCH` = 200 units (~96 CSS px).
- Always pass data to `scene.start()`; Phaser reuses the last run's data otherwise.
