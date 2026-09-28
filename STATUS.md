# Status (last updated 2026-09-28)

## Where things stand
- **M0 (app shell)** built. Pushed to https://github.com/jgaffney923/chemistry-app (public; commits use the GitHub noreply email `282106827+jgaffney923@users.noreply.github.com`, set in this repo's git config). GitHub Pages: owner is turning it on; site will be https://jgaffney923.github.io/chemistry-app/
- **M1 (menu + State Sorter)** built, plus two additions requested during M1:
  - a "try it first" warm-up before the first round (solid block, pouring juice, gas jar), then a guided first round;
  - a 💡 button in the Sorter that replays the warm-up.
- **M2 (Sorter polish)** partly done:
  - done: all Sorter items drawn in code (`src/art/items.js`), Level 2 heating/cooling chains (unlock at 6 stars, 🔥/❄️ buttons, level picker).
  - not done: owner's voice recordings (62 lines in `narration-script.md`), real sound effects (current ones are generated beeps), UI icons are still emoji.
- **M3 Kitchen Lab, M4 Molecule Builder, M5 kid test:** not started.

## Tested
Only in Edge on the PC, with automated Playwright runs (full rounds, warm-up, Level 2 unlock and chains, parent corner, offline reload).
**Never tried on the real iPad**: real touch, the iPad's voice, and Apple emoji are unchecked.

## Next steps (owner's choice)
1. Confirm GitHub Pages is live, then test on the iPad (install to home screen, airplane-mode check).
2. Or keep building: finish M2 (sound effects), then M3 Kitchen Lab.
3. Owner records narration whenever convenient; the game falls back to the device voice until then.

## Quick look without GitHub
Serve the folder (`python -m http.server 8080` from this folder) and open `http://localhost:8080`, or `http://<PC's Wi-Fi IP>:8080` on the iPad on the same Wi-Fi (no offline mode that way).

## Decisions made along the way
- Phaser pinned at 3.90.0 (last v3) even though Phaser 4 exists.
- Heat is a flame, not a sun (sunshine can't boil water into steam).
- Liquids are drawn as the liquid itself (not a carton/jar, which is a solid); gases carry purple "gas dots".
- Stars reward finishing, never go down.
- Game units are 2048x1536; `MIN_TOUCH` = 200 units (~96 CSS px).
- Always pass data to `scene.start()`; Phaser reuses the last run's data otherwise.
