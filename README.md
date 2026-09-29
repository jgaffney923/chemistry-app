# Chemistry Play

A touch-first chemistry game for kids 6-8. It runs offline on an iPad as a home-screen web app. See [PLAN.md](PLAN.md) for the design and milestones.

- Engine: Phaser **3.90.0**, vendored at `vendor/phaser.min.js` (no CDN, no build step).
- Current milestone: **M7** (Science House with four games: State Sorter, Kitchen Lab, Can It Be Undone?, Molecule Builder). Next: M5, testing with the kids, or M8 Heat Slider.
- Adding a game to the home screen: give it an entry in `src/home/games.js` and list it in a room in `src/data/rooms.json`.

## Run it on the PC
Open the folder in VS Code and use **Live Server** on `index.html`, or run `npx serve .`.
Chrome/Edge devtools → device toolbar → iPad, landscape.

On `localhost` the offline service worker is switched off, so edits show up on reload.
To test offline mode locally, open the page with `?sw=1` on the end of the URL.

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

## Replacing a drawing with a real picture
Sorter items are drawn in code (`src/art/items.js`). To use a picture instead
(a photo, or one of the kids' drawings): save it as a PNG with a transparent or
plain background in `assets/img/`, then add `"image": "assets/img/<name>.png"` to
that item in `src/data/items.json`. Any item without an image keeps its drawing.

## Dev tools (`tools/`, never loaded by the game)
- `update-sw.mjs`: offline file list + cache version.
- `make-narration-script.mjs`: regenerates `narration-script.md`.
- `make-icons.mjs`: redraws the placeholder app icons.
- `prepare-narration.mjs`: cleans up a recording and adds it to the game.
- `make-placeholder-voices.mjs`: stand-in computer voice for every unrecorded line.
