# Chemistry Play

A touch-first chemistry game for kids 6-8. It runs offline on an iPad as a home-screen web app. See [PLAN.md](PLAN.md) for the design and milestones.

- Engine: Phaser **3.90.0**, vendored at `vendor/phaser.min.js` (no CDN, no build step).
- Current milestone: **M11** (Science House with eight games: State Sorter, Kitchen Lab, Can It Be Undone?, Unmix!, and Sink or Float in the Kitchen; Heat Slider, Molecule Builder, and Air Builder in the Lab). Next: kid-test M9-M11 together, then M12 Color-Change Potions.
- Adding a game to the home screen: give it an entry in `src/home/games.js` and list it in a room in `src/data/rooms.json`.

## Run it on the PC
Open the folder in VS Code and use **Live Server** on `index.html`, or run `npx serve .`.
Chrome/Edge devtools → device toolbar → iPad, landscape.

On `localhost` the offline service worker is switched off, so edits show up on reload.
To test offline mode locally, open the page with `?sw=1` on the end of the URL.

### Automated browser check
`node tools/browser-check.mjs` serves the game itself, opens it in a headless browser, and prints `ok` or `FAIL` for each check. It exits non-zero if anything fails. It checks that:
- the game loads to the Science House and every room opens,
- every game in `src/home/games.js` starts,
- the service worker caches every file in its precache list.

Any page error or console error fails the check it happened in. The tool needs Playwright, which is installed outside the app (no new dependency): run `npm install -g playwright` then `npx playwright install chromium` once. Set `PW_CHANNEL=msedge` to use the installed Edge instead, or `PW_BROWSER=webkit` for Safari's engine (after `npx playwright install webkit`).

## Deploy (GitHub Pages)
1. `node tools/update-sw.mjs` (refreshes the offline file list and bumps `CACHE_VERSION`).
2. Bump `APP_VERSION` in `src/version.js` (shown faintly in the corner so you can tell which build the iPad has).
3. Commit and push to `main`. Pages publishes in a minute or two at
   `https://<your-github-name>.github.io/chemistry-app/`.

## How to test on the iPad
Service workers only run over HTTPS, so test on the iPad from the GitHub Pages URL, not from Live Server over Wi-Fi.

1. Open the Pages URL in **Safari**.
2. Share button → **Add to Home Screen**.
3. Launch it from the home screen, tap the green button, and check you hear the voice.
4. **Offline check:** turn on Airplane Mode, close the app fully (swipe it away), reopen it. It should still work.
5. **Update check:** after a deploy, open the app once with Wi-Fi on, close it fully, reopen. The corner version number should change.
6. **Heat Slider check:** warm and cool water, switch to chocolate and butter, and try the hint button. Watch whether the child can discover both directions without help.
7. **Interaction check:** leave and reopen the app, then tap before expecting audio. Try two fingers on controls and confirm dragging still works. Portrait currently shows a rotation prompt; playable portrait layouts are pending.
8. **Unmix check:** try all five mixtures by tapping or dragging tools. Filtering salt water should not earn a sticker; the magnifier shows dissolved parts while the ordinary water stays clear. The windowsill should leave salt crystals. Check five stickers survive closing/reopening, and tap them in the book to hear their explanations.
9. **Sink or Float check:** guess Float or Sink by tapping, then drag the thing into the tank (or tap it). Dragging before guessing should bounce back and ask for a guess. Every round ends with the orange, then the peeled orange. Then tap the bottle button (top right) for the Liquid Tower: pour the three bottles in different orders, and check honey always ends at the bottom and oil on top. Then drop the cork (stops on the oil), grape (stops on the honey), and coin (bottom).
10. **Air Builder check** (light-blue button in the Lab): the first visit walks through nitrogen: two nitrogen atoms, then the + sign twice for a triple bond. Finished nitrogen and oxygen float into the balloon until it holds 4 nitrogen and 1 oxygen; a 5th nitrogen should be turned away ("enough nitrogen"). The full balloon floats off and a new one arrives. Build ammonia (one nitrogen, three hydrogens) too.

Notes:
- The home-screen app keeps its own storage, separate from Safari tabs. Progress from a Safari tab won't appear in the installed app.
- If there's no sound, check the iPad's side switch / silent mode and volume.
- **Guided Access** (Settings → Accessibility → Guided Access) keeps a kid inside the app: triple-click the side/home button to start it.

## Recording narration
Narration is recorded in a parent's voice. Every line is listed, with its file name, in [narration-script.md](narration-script.md).

1. Record each line with the iPhone **Voice Memos** app (it saves `.m4a`).
2. Save it into `recordings-raw/` (kept on this PC only, never published).
3. Run `node tools/prepare-narration.mjs "recordings-raw/<file>.m4a" <line-id>`.
   It trims the quiet (and the phone's start click), evens out the volume, saves
   `assets/audio/narration/<line-id>.m4a`, and marks the line as recorded.
   Needs ffmpeg on PATH, or `FFMPEG` set to its full path.
4. Run `node tools/make-narration-script.mjs` to update the checklist, then deploy.

Until you record a line, it plays a stand-in computer voice (Microsoft Zira), made with
`node tools/make-placeholder-voices.mjs` (Windows only). Run it again after adding new
lines to the game. Recording a line for real replaces its stand-in. Any line with no
file at all falls back to the iPad's built-in voice.

The 97 new Unmix, Sink or Float, and Air Builder lines currently use the built-in voice: the
stand-in tool needs Windows (for the Zira voice) and ffmpeg. Once ffmpeg is on
PATH (or `FFMPEG` points to it), run `node tools/make-placeholder-voices.mjs`,
regenerate the narration checklist, and deploy. Check the built-in voice offline
on the actual iPad until those files are generated.

## Replacing a drawing with a real picture
Sorter items are drawn in code (`src/art/items.js`). To use a picture instead
(a photo, or one of the kids' drawings): save it as a PNG with a transparent or
plain background in `assets/img/`, then add `"image": "assets/img/<name>.png"` to
that item in `src/data/items.json`. Any item without an image keeps its drawing.

## Dev tools (`tools/`, never loaded by the game)
- `browser-check.mjs`: runs the game in a headless browser and reports errors (see above).
- `update-sw.mjs`: offline file list + cache version.
- `make-narration-script.mjs`: regenerates `narration-script.md`.
- `make-icons.mjs`: redraws the placeholder app icons.
- `prepare-narration.mjs`: cleans up a recording and adds it to the game.
- `make-placeholder-voices.mjs`: stand-in computer voice for every unrecorded line.
