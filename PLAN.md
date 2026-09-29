# Kids Chemistry Game (PWA) — Build Plan

## 1. Goal
A touch-first game for kids ages 6-8 that teaches early chemistry concepts through play. It runs as a Progressive Web App on an iPad (Safari, "Add to Home Screen"), works fully offline, and is tested first with the owner's own kids.

**Design principle:** the play IS the chemistry. No quizzes bolted onto a game. Kids learn by doing (sorting, heating, mixing, building), and the game responds with visible, accurate cause and effect.

## 2. Constraints (non-negotiable)
- **Target device:** iPad, Safari, landscape primary. Portrait must stay playable, because iOS ignores the manifest's orientation lock (see section 5).
- **No build server needed to play.** Static files only, hosted on GitHub Pages (HTTPS).
- **Offline-first:** after first load, everything works with no network. No CDN dependencies at runtime (vendor all libraries locally).
- **Kid-safe:** no ads, no analytics, no trackers, no accounts, no external network requests, no links out, no text input. Progress is saved locally only (localStorage).
- **Minimal reading:** every instruction is spoken (recorded audio) and shown with icons. Any on-screen text is short, large, and simple.
- **Scientifically accurate.** Simplify, but never state something false. See section 9.
- **Never punishing.** No failure states, no lost progress, no score that goes down. Stars reward finishing, not accuracy.

## 3. Tech stack
- **Language:** plain JavaScript (ES modules). No framework, no bundler required.
- **Game engine:** Phaser 3.90.0 (the final v3 release), vendored at `/vendor/phaser.min.js`. Loaded as a classic script before the ES modules; it exposes the global `Phaser`.
- **PWA:** `manifest.webmanifest` + hand-written service worker (`sw.js`) with a versioned cache name.
- **Audio:** pre-recorded narration and SFX as `.m4a` or `.mp3` (NOT `.ogg`, which iOS Safari does not play). Use `speechSynthesis` only as a temporary placeholder during development.
- **Narration voice:** recorded by the owner (a parent's voice). Every narration line has a stable ID; `narration-script.md` lists each ID with its exact words so recording is one sitting per milestone. Missing recordings fall back to `speechSynthesis`, so the game never blocks on audio.
- **Local dev:** VS Code Live Server (or `npx serve`) for desktop testing. Use browser devtools' device emulation (iPad).
- **Hosting:** GitHub Pages, repo `chemistry-app`. All asset paths must be **relative** (the site is served from `/chemistry-app/`).

## 4. Project structure
```
/
├── index.html
├── manifest.webmanifest
├── sw.js
├── README.md
├── PLAN.md
├── narration-script.md      # every narration ID + exact words, for recording
├── vendor/
│   └── phaser.min.js
├── src/
│   ├── main.js              # Phaser config, scene registration
│   ├── scenes/
│   │   ├── BootScene.js     # "Tap to begin" (unlocks audio), preload
│   │   ├── MenuScene.js     # Big-icon home screen, one button per mini-game
│   │   ├── SorterScene.js   # Mini-game 1
│   │   ├── LabScene.js      # Mini-game 2
│   │   └── BuilderScene.js  # Mini-game 3
│   ├── systems/
│   │   ├── audio.js         # play narration/SFX, mute, queue, speech fallback
│   │   ├── save.js          # localStorage wrapper (stars, unlocks), try/catch safe
│   │   └── drag.js          # shared drag/snap helpers
│   └── data/
│       ├── items.json       # matter items and their states/behaviors
│       └── molecules.json   # atoms, bond rules, known molecules
├── assets/
│   ├── img/
│   ├── audio/narration/     # <narration-id>.m4a
│   ├── audio/sfx/
│   └── icons/               # 180, 192, 512 px app icons
└── tools/                   # dev-only helper scripts (never loaded by the game)
```

## 5. PWA and iOS requirements
- `index.html` head:
  - `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">`
  - `<meta name="apple-mobile-web-app-capable" content="yes">` (plus `mobile-web-app-capable`)
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
  - `<link rel="apple-touch-icon" href="assets/icons/icon-180.png">`
  - `<link rel="manifest" href="manifest.webmanifest">`
- Manifest: `display: "standalone"`, `orientation: "landscape"` (Android honors it; **iOS ignores it**), relative `start_url` and `scope`, icons at 192 and 512.
- Portrait: layouts must remain usable. Until a scene has a real portrait layout, show a friendly "turn me sideways" picture (no text needed).
- CSS: `touch-action: none`, `user-select: none`, `-webkit-touch-callout: none`, `overscroll-behavior: none` on the game container so drags never scroll or zoom the page.
- Phaser scale mode `FIT` with `autoCenter`, so it fills the iPad screen and respects safe areas.
- Keep drop targets and important buttons away from the screen edges (bottom home-indicator swipe, side swipes).
- Enable multi-touch (at least 3 active pointers): siblings will touch at the same time.
- **Audio unlock:** iOS blocks audio until a user tap. BootScene shows a big "tap to start" button; audio context is resumed inside that tap handler.
- **Service worker:** precache all files in the app shell and assets. Use a `CACHE_VERSION` constant; on `activate`, delete old caches. Cache-first for assets, network-first for `index.html` so updates arrive. Show no update UI to the kids (silent update on next launch).
- Handle iOS quirks: audio must not autoplay after backgrounding without a tap; pause game on `visibilitychange`.
- The installed home-screen app has **separate storage** from Safari tabs. Progress earned in a Safari tab does not carry into the installed app.
- Service workers only run over HTTPS or `localhost`. Real offline testing on the iPad is done from GitHub Pages, not from Live Server over LAN.

## 6. Mini-games

### 6.1 State Sorter ("Solid, Liquid, or Gas?") — build first
- **Warm-up first ("try it, then sort").** Before the first round, the kid does one small thing per state and sees the rule happen:
  - Solid: drag a block from a glass into a bowl; it stays a block.
  - Liquid: pour juice from the glass into the bowl; it spreads to fill the bottom of the bowl.
  - Gas: tap a jar packed with gas dots; they spread to fill the whole box (narration notes most gases are invisible, so dots show where it is).
  - A mini bin appears after each step, so the bins already mean something when sorting starts.
  - Plays automatically the first time (and again after "reset progress"); a 💡 button in the Sorter replays it.
- **Guided first round:** right after the warm-up, the first three items are one easy example per state (ice, water, air in a balloon) with the right bin glowing. The rest of the round plays normally.
- Items drop in one at a time (ice cube, rock, juice, milk, water, steam from a kettle, balloon of air, honey, spoon, etc.).
- Kid drags each item into one of three big bins, each with an icon and a narrated name.
- Correct: happy sound, item settles in bin, short narrated fact ("Ice is a solid. It keeps its shape!").
- Wrong: gentle "hmm, try again" and the item bounces back. Never punishing, no failure state.
- Round = 6 items. Finishing a round earns its stars (not reduced by wrong tries), saved locally.
- Level 1 uses only unambiguous items. Leave out sand, sugar, toothpaste, jelly, slime, whipped cream (they pour or squish and confuse the categories).
- Steam: show a kettle spout; narration says steam is water as a gas (see section 9).
- **Level 2: heating and cooling.** Unlocks at 6 Sorter stars (two rounds); the finish screen announces it, and from then on the Sorter asks which game to play. A round is 3 "change chains" from `items.json`: sort the item, it comes back out, tap the 🔥 (heat) or ❄️ (cool) button, watch it change, and sort the new form. Chains: ice → water → steam, steam → water → ice, chocolate → melted → hard again, butter → melted.
  - Heat is a flame, not a sun: sunshine melts ice, but it can't boil water into steam.
- Data-driven: all items defined in `items.json` (name, sprite, state, narration ID, fun fact).

### 6.2 Kitchen Lab (sandbox) — build second
- Sandbox with a table, a beaker of water, a heater, a freezer, a spoon, a **magnifying glass**, and a shelf of safe kitchen items (ice, sugar, salt, sand, chocolate, butter, oil, bread, baking soda, vinegar).
- Kid drags an item into the beaker or onto the heater/freezer and watches it respond with animation and particles.
- **Physical changes (can be undone):**
  - Ice + heater -> melts to water. Water + freezer -> ice. Water + heater -> steam.
  - Chocolate/butter + heater -> melts; + freezer -> solid again.
  - Sugar or salt + water + stir -> dissolves. The water stays **clear** (no tint). Holding the magnifying glass over it shows tiny particles spread through the water: "it's still there."
  - Sand + water + stir -> does NOT dissolve (sinks). The magnifier shows grains sitting at the bottom.
  - Oil + water -> oil floats on top, does not mix.
- **Chemical changes (make something new):**
  - Baking soda + vinegar -> fizzing bubbles. The bubbles are carbon dioxide gas (a molecule the kid later builds in Molecule Builder).
  - Bread + heater -> toast. The freezer does not turn toast back into bread. This contrast with chocolate teaches "some changes can't be undone."
- A 💡 button hints at the next undiscovered sticker (spoken hint + a hand pointing at what to use). Vinegar or baking soda added alone nudges toward the other.
- Goal-free play plus optional "discovery stickers" collected for each new change found (15 in all, saved locally; a sticker book shows found ones, tap to hear the explanation again). No fail states.
- **First visit is guided** (teach before free play): a pointing hand walks the kid through melting the ice on the hot plate, then "try anything you like".
- Each discovery is narrated as it happens, so the explanation arrives at the moment of cause and effect.
- Data-driven via `items.json` (a table of `item x action -> result`).

### 6.3 Molecule Builder — build third
- Atoms as big, colored, friendly balls with cartoon faces: **H (white), O (red), C (black/gray), and later N (blue)**.
- Each atom shows its bond points (H: 1, O: 2, C: 4, N: 3), rendered as little snap nubs.
- Kid drags atoms so bond points connect; snapping has generous tolerance and satisfying feedback.
- **Double bonds:** when two atoms are already joined and both still have a free nub, pushing them together again forms a second bond (drawn as a double line). Needed for O2 (O=O) and CO2 (O=C=O). Triple bonds (N2) come with N, later.
- **Recognizing molecules:** a molecule is complete when every nub is used. It is then identified by its atom counts from `molecules.json`.
  - Named molecules: water (H2O), hydrogen gas (H2), oxygen gas (O2), carbon dioxide (CO2), methane (CH4); later others.
  - A complete molecule not in the list still gets celebrated ("You made a real molecule!"). Never imply a valid build is wrong.
- When a named molecule is built, celebrate, narrate its everyday name first ("You made WATER!"), then reveal the formula as a small secondary label.
- Incomplete combos never "fail." Open bonds simply wiggle/glow to invite completion.
- Data-driven via `molecules.json` (atom types, valence, molecules, names, narration IDs).
- **Recipe cards** across the top show each target molecule in its real shape (faded until made, then checked). Tapping one says its recipe.
- **Pull apart / push together:** pulling an atom far from a partner breaks the bond; pushing joined atoms together adds a bond (double bond) if both have a free spot. Dropping an atom back on the tray removes it; the broom clears the board.
- **First visit is guided** (teach before free play): build water step by step, then free play.

### 6.4 Parent corner
- Hidden behind a long-press (about 3 seconds) on a small corner icon on the menu. Kids won't find it by accident.
- Contains only: sound on/off, and "reset progress" (with a second confirm).
- Tip for the README: iPad **Guided Access** keeps a kid inside the app.

## 7. Milestones (each ends with something playable on the iPad)
| # | Milestone | Acceptance criteria |
|---|-----------|--------------------|
| M0 | Skeleton + PWA shell | Blank Phaser scene loads; "tap to start" works; installable from Safari; loads offline in airplane mode; deployed on GitHub Pages |
| M1 | Menu + State Sorter MVP | Menu with 3 big icons (2 disabled); warm-up + guided first round; Sorter playable end-to-end with placeholder art and speech-fallback narration; stars saved; parent corner |
| M2 | Sorter polish | Real art, owner-recorded narration, particle/sound feedback, level 2 state-change items |
| M3 | Kitchen Lab | All changes in 6.2 working (physical and chemical), magnifier, discovery stickers saved |
| M4 | Molecule Builder | H2, H2O, O2, CO2, CH4 buildable; double bonds; valence rules enforced; unnamed complete molecules celebrated |
| M5 | Kid-test pass | Play with real kids, log issues, fix top 5 |

Ship after **every** milestone so it can be tested on the real iPad. Each milestone that adds narration also updates `narration-script.md`.

## 8. Agent working rules
- Work milestone by milestone. Do not start the next until the current one's acceptance criteria are met.
- Keep files small and single-purpose. Content lives in JSON, not hard-coded in scenes.
- Use placeholder art (simple shapes, emoji sprites, flat colors) until M2. Do not block on assets.
- No new dependencies without asking. No CDN links. No analytics or network calls of any kind.
- Every drag interaction must work with **touch** (Pointer Events), not just mouse. Touch targets at least 96px.
- Bump `CACHE_VERSION` in `sw.js` on every deploy that changes cached files, and add any new file to its precache list.
- Add a short "how to test on iPad" section to `README.md` and keep it current.
- After each milestone, summarize: what was built, what was tested, what's next.

## 9. Science accuracy guardrails
- Say "tiny building blocks" for atoms. Atoms may have cartoon faces, but narration never says they are alive, have feelings, or "want" anything ("oxygen has two bond spots," not "oxygen wants two friends").
- Ice floats and melts at warm temps; steam is invisible water vapor (the visible cloud is tiny water droplets). Simplify, don't say anything false.
- Dissolving is not disappearing: the sugar is still in the water. Narration and visuals (clear water, magnifier particles) should reflect this.
- Air is a gas (a mix, mostly nitrogen and oxygen); a balloon of air is "gas."
- Only use safe, familiar kitchen materials. No "try this at home" instructions involving real chemicals, heat, or anything hazardous.
- Formulas are always secondary to everyday names.

## 10. Out of scope (for now)
App Store distribution, accounts or cloud sync, multiplayer, in-app purchases, ads, parent dashboard (beyond the parent corner in 6.4), localization.
