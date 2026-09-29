# Status (last updated 2026-09-28)

## Where things stand
- **M0 (app shell)** built. Pushed to https://github.com/jgaffney923/chemistry-app (public; commits use the GitHub noreply email `282106827+jgaffney923@users.noreply.github.com`, set in this repo's git config). GitHub Pages: owner is turning it on; site will be https://jgaffney923.github.io/chemistry-app/
- **M1 (menu + State Sorter)** built, plus two additions requested during M1:
  - a "try it first" warm-up before the first round (solid block, pouring juice, gas jar), then a guided first round;
  - a 💡 button in the Sorter that replays the warm-up.
- **M2 (Sorter polish)** partly done:
  - done: all Sorter items drawn in code (`src/art/items.js`), Level 2 heating/cooling chains (unlock at 6 stars, 🔥/❄️ buttons, level picker).
  - voice: owner recorded 2 of 144 lines; the other 142 use a stand-in computer voice (Zira, marked `"placeholder": true` in narration.json) until recorded. Owner asked for this on 2026-09-28 so every line has a voice for now.
  - not done: owner's remaining recordings, real sound effects (current ones are generated beeps), UI icons are still emoji.
- **M3 Kitchen Lab** built (2026-09-28): shelf of 11 items, hot plate, freezer, beaker, spoon, magnifying glass, 15 discovery stickers + sticker book, guided first visit. Code in `src/lab/` and `src/scenes/LabScene.js`, data in `src/data/lab.json`. Tested in Edge only.
- **M3 follow-ups (2026-09-28):** Lab 💡 hint button; vinegar/baking soda alone now nudge toward each other (owner reported "a bottle that doesn't do anything").
- **M4 Molecule Builder** built (2026-09-28): H/O/C atoms with wiggling yellow bond-spot nubs, join by dropping near, pull apart to break, push together for double bonds, 5 recipe cards (water, hydrogen, oxygen, carbon dioxide, methane) that snap into real shapes, unnamed complete molecules praised without a made-up name, guided first build (water). Code in `src/builder/` and `src/scenes/BuilderScene.js`, data in `src/data/molecules.json`. Tested in Edge only.
- **Builder fixes from owner testing (2026-09-28):** + button on bonds for double bonds (plus a one-time explanation), pushing counts when atoms just touch, instant completion feedback. Also fixed a drag lag in every game: dragged things trailed ~24 units behind the finger.
- **M6 Science House** built (2026-09-28): the home screen is now a house with a Kitchen room (Sorter, Kitchen Lab) and a Lab room (Molecule Builder). Built before M5 at the owner's request, since it doesn't depend on kid feedback.
- **M7 Can It Be Undone?** built (2026-09-29) in the Kitchen room: watch a change, guess can-undo / can't-undo, then the game tests it by trying to reverse it. 10 changes, 9 new drawings. Built before M5 at the owner's request ("lets continue").
- **M5 kid test** done (2026-09-29): the owner played it with their kids, and they liked it. Their feedback: label the Lab's bottles and boxes so kids can read them (done: name tags under every shelf item).
- **Roadmap (2026-09-28):** PLAN.md section 10 now lists 15 more modules in three tiers, a scalable "Science House" home screen, and milestones M6-M16. Owner asked for the expansion before M5; the order is to be revisited after kid testing. Section 11 adds rooms for other sciences (Workshop/physics, Garden/life science, Sky & Weather/earth and space) with their own accuracy guardrails, to come after chemistry Tier 1.

## Tested
In Edge on the PC with automated Playwright runs (Sorter rounds, warm-up, Level 2, parent corner, offline reload, all 15 Lab discoveries + magnifier, all Builder recipes and double bonds, Science House navigation, a full Can It Be Undone? round). The owner has also played each game on the PC or iPad as it shipped.
On the real iPad: installs from GitHub Pages and plays; the owner's recorded voice plays. Not yet played by the kids.

## Next steps (owner's choice)
1. M5: play it with the kids and note where they get stuck or bored.
2. Or keep building: M8 Heat Slider is next in PLAN.md section 10.
3. Owner records narration whenever convenient; stand-in voice until then.

## Quick look without GitHub
Serve the folder (`python -m http.server 8080` from this folder) and open `http://localhost:8080`, or `http://<PC's Wi-Fi IP>:8080` on the iPad on the same Wi-Fi (no offline mode that way).

## Decisions made along the way
- Phaser pinned at 3.90.0 (last v3) even though Phaser 4 exists.
- Heat is a flame, not a sun (sunshine can't boil water into steam).
- Liquids are drawn as the liquid itself (not a carton/jar, which is a solid); gases carry purple "gas dots".
- Stars reward finishing, never go down.
- Game units are 2048x1536; `MIN_TOUCH` = 200 units (~96 CSS px).
- Always pass data to `scene.start()`; Phaser reuses the last run's data otherwise.
