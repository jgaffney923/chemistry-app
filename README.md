# Chemistry Play

A touch-first chemistry game for kids 6-8. It runs offline on an iPad as a home-screen web app. See [PLAN.md](PLAN.md) for the design and milestones.

- Engine: Phaser **3.90.0**, vendored at `vendor/phaser.min.js` (no CDN, no build step).
- Current milestone: **M0** (app shell: tap to start, offline, installable).

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
2. Rename it to the line's id, e.g. `boot.welcome.m4a`, and put it in `assets/audio/narration/`.
3. Set `"recorded": true` for that line in `src/data/narration.json`.
4. Run `node tools/make-narration-script.mjs` to update the checklist, then deploy.

Lines that aren't recorded yet are read by the iPad's built-in voice, so nothing breaks while you record.

## Dev tools (`tools/`, never loaded by the game)
- `update-sw.mjs`: offline file list + cache version.
- `make-narration-script.mjs`: regenerates `narration-script.md`.
- `make-icons.mjs`: redraws the placeholder app icons.
