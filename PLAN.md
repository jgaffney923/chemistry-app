# Kids Chemistry Game (PWA) — Build Plan

## 1. Goal
A touch-first game for kids ages 6-8 that teaches early chemistry concepts through play. It runs as a Progressive Web App on an iPad (Safari, "Add to Home Screen"), works fully offline, and is tested first with the owner's own kids.

It starts with chemistry and later grows into other sciences as new rooms of a "Science House" (sections 10 and 11).

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
  - A complete molecule not in the list still gets celebrated ("All the bond spots are filled! That's a complete molecule."). It is never called wrong, and never given an invented name: not every combination that fits the bonding rules is a real, stable molecule.
- Completion feedback is instant (card check, sparkles, sound), and the molecule flies into its card after about 2 seconds while the voice finishes. (Waiting for the whole sentence felt like the game had hesitated.)
- When a named molecule is built, celebrate, narrate its everyday name first ("You made WATER!"), then reveal the formula as a small secondary label.
- Incomplete combos never "fail." Open bonds simply wiggle/glow to invite completion.
- Data-driven via `molecules.json` (atom types, valence, molecules, names, narration IDs).
- **Recipe cards** across the top show each target molecule in its real shape (faded until made, then checked). Tapping one says its recipe.
- **Pull apart / double bonds:** pulling an atom far from a partner breaks the bond. When two joined atoms both still have a free spot, a yellow **+** appears on their bond: tap it for a double bond (pushing them until they touch works too). The first + ever comes with a spoken explanation and a pointing hand. (Owner testing found push-only double bonds too hard.) Dropping an atom back on the tray removes it; the broom clears the board.
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
| M6 | Science House home screen (10.1) | Rooms map replaces the 3-button menu; all existing games reachable; progress badges; "try this next" glow |
| M7 | Can It Be Undone? (10.3) | Change sorter with undo/can't-undo bins; guided first round; reversible changes can be played backward |
| M8 | Heat Slider (10.2) | Slider drives particle view and real-world view together for water, chocolate, butter; correct melting order |
| M9 | Unmix (10.4) | Five separating tools working; evaporation brings back the salt; stickers |
| M10 | Sink or Float + Layers (10.5) | Guess-then-drop tank; three-layer liquid tower; objects settle between layers correctly |
| M11 | Air Builder (10.9) | Nitrogen atom and triple bond; N2 recipe; fill the balloon with the real air mix |
| M12 | Color-Change Potions (10.6) | Cabbage-juice indicator with correct acid/neutral/base colors; mixing back toward purple |
| M13 | Water Cycle (10.8) | Kid drives evaporate, condense, rain, flow back; clouds shown as droplets |
| M14 | Crystal Garden (10.7) | Crystals grow over visits or fast-forward; salt cubes, sugar crystals, six-sided snowflakes |
| M15 | Element Hunt (10.10) | House scene with at least 10 objects and their element cards |
| M16+ | Tier 3 ideas (10.11 onward) and new rooms (section 11) | Chosen after kid testing of the above; one module at a time |

Every module from M7 on ends with a short kid-test with the owner's children before the next starts.

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
- Heat comes from a hot plate, the sun, or warm water. Never show burning or open flames as something to do.
- **Floating:** say "heavy for its size" (or "lighter than the same amount of water"). Never "heavy things sink": a big log floats.
- **Clouds, fog and the "steam" you can see** are tiny drops of liquid water. Water vapor itself is an invisible gas.
- **Acids and bases:** use correct indicator colors (red cabbage: acid pink or red, neutral purple, base blue or green). Never suggest tasting things or testing household cleaners.
- **Temperatures:** if things change at different temperatures, keep the real order (ice melts before chocolate or butter; water boils much later). No numbers needed; if numbers appear, they must be correct.
- **Rust** is iron joining with oxygen, and it needs water too. It's a new material, so it can't be undone.
- **Elements:** an element is one kind of atom. Pencil "lead" is carbon (graphite), not lead. Table salt is sodium and chlorine joined together (don't call it a molecule).
- **Living things:** yeast really is alive (a tiny fungus), unlike atoms, which never are.

## 10. Expansion roadmap (after M5)

The first three games cover states of matter, changes, and molecules. This roadmap grows the app into a full "science house" of short, replayable modules for ages 6-8. Order and scope get revisited after each kid-test.

### Principles for every new module
Learned from building M1-M4:
- **Teach before testing.** A short guided first visit where the kid does it once with a pointing hand, then free play or rounds.
- **Always a way forward:** a 💡 hint button, spoken help, gentle bounce-backs. Never a fail state or lost progress.
- **Something to collect** (stars, stickers, cards, checks), shown on the home screen.
- **Explain at the moment of cause and effect:** narration fires as the change happens, not before.
- **Reuse the toolkit:** drag and snap, bins, the hot plate and freezer, beaker, magnifier, gas dots and particle pictures, atom balls, sticker book, stand-in voice pipeline.
- **Content in JSON.** Every spoken line goes in `narration.json` (stand-in voice until recorded).
- **One idea per module, 3-10 minutes to play**, replayable.

### 10.1 Science House (home screen that scales) — built as M6
- The 3-button menu becomes a picture of a house with rooms. Each room holds related games:
  - **Kitchen:** Sorter, Kitchen Lab, Can It Be Undone?, Sink or Float, Unmix
  - **Lab:** Molecule Builder, Heat Slider, Air Builder, Color-Change Potions, Crystal Garden, Element Hunt
  - **Sky & Weather:** Water Cycle (more rooms for other sciences come later; see section 11)
- Tap a room to zoom in, and tap a game to play it.
- **No locks.** Everything is open. A soft glow suggests "try this next" in a sensible order.
- Each room shows its progress (stars, stickers, checks).
- As built: rooms and their games come from `src/data/rooms.json`; each game's button, start, and progress live in `src/home/games.js`. A game's home button returns to the room it was opened from. On the house, the suggested room bobs gently with a ✨ (an outline glow was invisible on the cream walls); inside a room, the suggested game has a pulsing ring. A one-time welcome waits for the start greeting to finish.

### Tier 1: builds directly on what kids just learned

#### 10.2 Heat Slider ("Particle Zoom")
- **Kids do:** move a big thermometer slider. One thing (ice, chocolate, butter) is shown two ways side by side: the real-world view and a zoomed-in particle view.
  - Cold: particles jiggle in a tight grid (solid).
  - Warmer: they slide past each other (liquid).
  - Hot: they fly apart (gas, water only).
- **Teaches:** temperature is how fast particles move; melting and boiling are particles breaking free; different materials change at different temperatures (ice melts first, then chocolate and butter; water boils much later).
- **Builds on:** the bins' particle pictures, Sorter Level 2, the magnifier.
- **Size:** small to medium.

#### 10.3 Can It Be Undone? (reversible and irreversible changes) — built as M7
- **Kids do:** watch a short before-and-after change, then sort it into ↺ "can undo" or ✗ "can't undo". For "can undo", a reverse button plays it backward (water freezes back into ice).
  - **Can undo:** ice melting, chocolate melting, water freezing, sugar dissolving (dry the water and the sugar comes back).
  - **Can't undo:** bread toasting, egg cooking, cake baking, an apple slice turning brown, a nail rusting.
- **Teaches:** the difference between changes that can be reversed and ones that make a new material. An optional second level introduces the words "physical change" and "chemical change".
- **As built: predict, then test.** Every guess is followed by a real test: the game tries to reverse the change (cool the toast, warm the ice, let the sun dry the sugar water, dry the rusty nail) and shows what happens. A wrong guess gets "Surprise!" and the card slides into the right box; there is no failing. Data in `src/data/changes.json`; 10 changes, 5 each way; rounds of 6 (3 + 3).
- **Builds on:** the Sorter engine (bins, rounds, stars, warm-up); Lab toast and chocolate.
- **Size:** small (mostly new art and data).

#### 10.4 Unmix! (separating mixtures)
- **Kids do:** get a messy mixture and pick the right tool:
  - sieve: pebbles out of sand
  - magnet: iron filings out of sand
  - filter paper: sand out of water
  - sunny windowsill (fast-forward): salt water dries, and salt crystals are left behind
  - skim the top: floating cork bits
- **Teaches:** in a mixture, the parts are still themselves, so they can be separated using what makes them different (size, magnetism, floating, dissolving). The evaporation step proves the Lab's claim: the salt was in the water all along.
- **Builds on:** the Lab beaker, magnifier, stations.
- **Size:** medium.

#### 10.5 Sink or Float + Liquid Layers
- **Part 1:** guess 👍 float or 👎 sink, then drop the object in a water tank and watch. Objects: cork, rock, coin, apple, grape, ice, plastic duck, metal spoon, and an orange with its peel (floats) and without it (sinks: the peel is full of tiny air pockets). Guessing wrong is fine; the tank shows the answer.
- **Part 2:** pour honey, water, and oil into a tall glass. They stack in layers. Drop objects that settle at different layers.
- **Teaches:** whether something floats depends on how heavy it is for its size; liquids can stack in layers for the same reason.
- **Builds on:** the Sorter's guess-and-reveal flow, the Lab's pouring.
- **Size:** medium.

### Tier 2: new chemistry ideas

#### 10.6 Color-Change Potions (red cabbage indicator)
- **Kids do:** add kitchen liquids to cups of purple cabbage juice and watch the color change:
  - lemon juice or vinegar: pink or red
  - plain water: stays purple
  - baking soda water: blue or green

  Then mix a pink cup into a green one and watch it head back toward purple.
- **Teaches:** some things are acids and some are bases; an indicator shows which by its color; acids and bases can cancel each other out. The words "acid" and "base" are introduced with pictures.
- **Builds on:** the Lab pouring and beaker, sticker book.
- **Watch out:** no tasting, no household cleaners, colors must be correct (section 9).
- **Size:** medium.

#### 10.7 Crystal Garden
- **Kids do:** dissolve lots of salt or sugar in warm water, hang a string, and check back. Crystals grow a little each time the app is opened, or with a fast-forward sun button. The magnifier shows their shapes:
  - salt: little cubes
  - sugar: chunky rock-candy crystals
  - a frosty window: snowflakes always have six sides
- **Teaches:** when the water leaves, dissolved things come back out as crystals, and crystals have regular shapes because their particles line up in patterns.
- **Builds on:** Lab dissolving, the magnifier, the particle grid. A gentle reason to come back tomorrow.
- **Size:** medium.

#### 10.8 Water Cycle
- **Kids do:** run the cycle step by step:
  1. Warm the sea with the sun: water rises as invisible gas dots.
  2. Cool the air high up: the dots gather into tiny droplets that make a cloud.
  3. The droplets join into rain.
  4. Rivers carry it back to the sea.
- **Teaches:** evaporation, condensation, and rain; the same water goes round and round; clouds are liquid droplets, not gas.
- **Builds on:** the heat and cool buttons, gas dots.
- **Size:** small to medium.

#### 10.9 Air Builder (Molecule Builder, level 2)
- **Kids do:** get a nitrogen atom (blue, three bond spots) and learn the triple bond (N≡N).
  - New recipes: nitrogen gas, plus ammonia (NH₃: "used to make plant food").
  - Then "fill the balloon with real air": about 8 nitrogen molecules for every 2 oxygen.
- **Teaches:** air is a mixture of gases, mostly nitrogen; atoms can share three bonds.
- **Builds on:** the Builder (triple bonds already supported).
- **Size:** small.

#### 10.10 Element Hunt (what are things made of?)
- **Kids do:** explore a picture of a house, tap objects, and collect element cards:
  - party balloon: helium
  - pencil middle: carbon (graphite)
  - soda can: aluminum
  - frying pan: iron
  - ring: gold
  - wire inside a cable: copper
  - table salt: sodium and chlorine
  - water: hydrogen and oxygen
  - air: nitrogen and oxygen
  - fun fact: a diamond is carbon too
- **Teaches:** an element is one kind of atom, and everything around us is made of elements, alone or joined together.
- **Builds on:** atom art (a color per element), the sticker book.
- **Size:** medium (art-heavy).

### Tier 3: longer-term ideas (chosen after kid testing)
- **10.11 Bubble Lab:** gases you can make.
  - Baking soda and vinegar in a bottle blow up a balloon (carbon dioxide).
  - Yeast, sugar, and warm water slowly blow one up (yeast is alive, and it makes carbon dioxide).
  - Opening a fizzy drink lets dissolved gas escape.
- **10.12 Soap and Oil:** a Lab add-on. Dish soap breaks oil into tiny droplets that can mix with water, which is how soap washes grease away.
- **10.13 Kitchen Recipes:** make pancakes step by step. Mixing can be undone; bubbles from baking powder make them rise; heat sets them for good.
- **10.14 Rust Race:** nails in dry air, in water, and in damp air (fast-forward). Only the one with both water and air rusts fast.
- **10.15 My Science Journal:** one book collecting everything from every module (stars, stickers, molecules, crystals, element cards), each with its spoken explanation. Optionally a friendly scientist guide character (a person, not an atom) as the app's one voice.
- **10.16 Explorer Mode (ages 8+):** a parent-corner switch that shows formulas larger, adds counting challenges ("build a molecule with exactly 3 atoms"), and introduces science words (evaporate, dissolve, density, acid, base) with pictures.

### Cross-cutting improvements
- **Owner narration** in batches per module; stand-in voice until then.
- **Real sound effects** to replace the generated beeps.
- **Accessibility:**
  - atoms also show their letter (color-blind safe)
  - optional captions for spoken lines
  - layouts that work for left- and right-handed kids
- **Offline size budget:** about 6 MB now. Keep each module under about 5 MB and the whole app under about 40 MB. If it grows past that, cache per room.
- **Grown-ups page:** a simple list in the parent corner of the ideas the child has explored. Still not a dashboard (see section 12).

### Suggested build order after M5
Science House (10.1) → Can It Be Undone? (10.3) → Heat Slider (10.2) → Unmix (10.4) → Sink or Float (10.5) → Air Builder (10.9) → Color-Change Potions (10.6) → Water Cycle (10.8) → Crystal Garden (10.7) → Element Hunt (10.10) → Tier 3.

Cheap wins that reuse existing engines come first. Each one also sets up the next: particles, then mixtures, then density, then gases, then acids.

## 11. Beyond chemistry: more rooms (after chemistry Tier 1)

School science for ages 6-8 mixes matter, forces, living things, weather, and the sky, and kids don't separate them either. After the chemistry Tier 1 modules prove the Science House and the module pattern, the house grows new rooms for other sciences. Chemistry stays the core.

**Rules for adding a room:**
- Each room starts with **3-4 candidate modules**. Build one, kid-test it, then decide on the next. Depth beats breadth.
- Each room gets **its own accuracy guardrails** (below), because every science has myths that simple explanations easily repeat.
- Everything from section 10's principles applies: teach before testing, hints, something to collect, no fail states, reuse the toolkit.
- **The next room is chosen from kid-testing:** whatever the kids ask about or light up at.
- When the first non-chemistry room ships, the app is **renamed** (e.g. "Science Play"): title, manifest name, icon, and this plan's title.

### 11.1 Workshop (physics: forces, magnets, light, sound)

#### Magnet Hunt
- **Kids do:** sweep a magnet over a table of things and see what jumps to it:
  - **Sticks:** iron nail, paper clip, steel screw
  - **Doesn't stick:** aluminum foil, copper wire, a gold ring, wood, plastic, a coin (depends on the coin, so leave coins out)

  Then play with two magnets: they pull together one way and push apart the other.
- **Teaches:** magnets pull on some metals (ones with iron in them), not all metals; magnetism works through thin paper; magnets have two ends (poles).
- **Builds on:** the Sorter (sticks or doesn't), drag, the sticker book. Unmix already has a magnet tool.

#### Ramps and Rolling
- **Kids do:** set a ramp's height and surface (carpet, wood, ice), then let a ball or toy car go and see how far it gets. Guess first, then watch.
- **Teaches:** pushes and pulls make things move; steeper ramps give more speed; rough surfaces slow things down (friction).
- **Builds on:** Sink or Float's guess-then-see flow.

#### Light and Shadows
- **Kids do:** move a flashlight around a toy and watch its shadow grow, shrink, and swing. Test window glass, wax paper, and wood to see which let light through.
- **Teaches:** light travels in straight lines, and a shadow is where light is blocked. Some materials let light through, some let a little through, and some block it.

#### Sound Makers
- **Kids do:** pluck rubber bands (thick ones sound low, thin ones high), tap a drum with rice on top and watch the rice jump, and try a tin-can phone.
- **Teaches:** sound is things shaking back and forth (vibrations); bigger shakes are louder; sound needs something to travel through.

### 11.2 Garden (life science: plants, animals, living things)

#### Seed to Plant
- **Kids do:** plant a seed and give it water, light, and soil. It grows a little each visit, or with fast-forward. Without light it grows pale and floppy; without water it wilts. Give them back and it recovers.
- **Teaches:** plants need water, light, and air to grow. They make their own food from light, air, and water, and the air part is carbon dioxide (the molecule from the Builder!).
- **Builds on:** the Crystal Garden's grow-over-visits timer, the Lab stations.

#### Life Cycles
- **Kids do:** put picture cards in order and watch each stage animate:
  - butterfly: egg, caterpillar, chrysalis, butterfly
  - frog: egg, tadpole, froglet, frog
  - chicken: egg, chick, hen
  - bean plant: seed, sprout, plant, flower, new seeds
- **Teaches:** living things grow and change in a cycle, and make new living things.

#### Living or Not?
- **Kids do:** sort things into living, once living, and never living:
  - **Living:** a dog, a tree, a mushroom, a seed
  - **Once living:** a wooden spoon, a fallen leaf
  - **Never living:** a rock, a cloud, a robot, fire (tricky: it "grows" and "eats", but it isn't alive)
- **Teaches:** living things need food and water, grow, and make more of themselves.
- **Builds on:** the Sorter engine, with three bins.

#### Homes for Animals (habitats)
- **Kids do:** help animals find where they live (ocean, desert, forest, snowy Arctic) by what they need: food, water, shelter, the right temperature.
- **Teaches:** living things live where their needs are met.

### 11.3 Sky & Weather (earth and space science)

#### Water Cycle
Moved here from 10.8. It's the bridge room: it's chemistry (states of matter) and weather at once.

#### Weather Maker
- **Kids do:** turn temperature up or down and add clouds and wind to make sun, rain, snow, or a storm. Then dress a character for the weather.
- **Teaches:** weather is what the air is doing (temperature, clouds, wind, rain or snow), and it changes.

#### Rocks, Sand, and Soil
- **Kids do:** break big rocks into pebbles, then sand, by rubbing, rushing water, and freezing ice (fast-forward). Mix sand with bits of dead leaves to make soil. Bonus: a fossil dig.
- **Teaches:** rocks slowly break down into sand and soil; soil is broken rock plus bits of things that were once living.
- **Builds on:** Unmix (sieving sand from pebbles), the magnifier.

#### Day, Night, and the Moon
- **Kids do:** spin the Earth to move day and night around it, then move the Moon around the Earth and watch its shape in our sky change.
- **Teaches:** day and night happen because Earth spins; the Moon's shape changes because we see different amounts of its sunlit half.

### 11.4 Accuracy guardrails for the new rooms
The chemistry guardrails in section 9 still apply. In addition:

**Workshop (physics)**
- Not all metals stick to magnets: aluminum, copper, and gold don't. Many coins and some stainless steel spoons don't either, so leave them out rather than risk a wrong answer.
- Heavier things don't fall faster on their own. A feather falls slowly because of the air, not because it's light.
- Sound needs something to travel through: there's no sound in space.
- Light travels in straight lines; shadows are where light is blocked.

**Garden (life science)**
- Plants make their own food from light, air, and water. Soil gives them water and some nutrients, not their food.
- Seeds are alive, just resting. Fire is not alive.
- Butterflies make a chrysalis (moths make cocoons).
- Tadpoles breathe underwater with gills; grown frogs breathe air.

**Sky & Weather (earth and space)**
- Day and night come from Earth spinning, not from the Sun moving around the Earth.
- Moon phases come from how much of the Moon's sunlit half we can see, **not** from Earth's shadow.
- If seasons are ever added: they come from Earth's tilt, not from Earth getting closer to the Sun.
- Clouds and fog are tiny liquid droplets (as in section 9).

### 11.5 How the house grows
- **Kitchen (chemistry):** Sorter, Kitchen Lab, Can It Be Undone?, Sink or Float, Unmix
- **Lab (chemistry):** Molecule Builder, Heat Slider, Air Builder, Color-Change Potions, Crystal Garden, Element Hunt
- **Sky & Weather:** Water Cycle first; the rest later
- **Workshop** and **Garden:** added when the kids are ready for them

Build order: chemistry Tier 1 (section 10) first. Then whichever new room the kid-tests point to, one module at a time, alternating with the remaining chemistry modules so chemistry stays the deepest part of the app.

## 12. Out of scope (for now)
App Store distribution, accounts or cloud sync, multiplayer, in-app purchases, ads, parent dashboard (beyond the parent corner in 6.4), localization.
