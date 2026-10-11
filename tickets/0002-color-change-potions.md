---
id: 0002
title: "New game: Color-Change Potions (M12)"
status: in-progress # todo | in-progress | blocked | review | done
priority: 2         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: any          # claude | copilot | any
plan: done          # the Architect writes a design plan before anyone builds
---

## Goal
A new game in the **Lab** room where kids pour kitchen liquids into cups of purple cabbage juice and see that some things are acids, some are bases, and an indicator shows which by its color.

## Context
- Design: PLAN.md 10.6. Follow §10 "Principles for every new module" (teach before testing, hint button, something to collect, no fail states).
- What kids do: add lemon juice or vinegar (turns **pink or red**), plain water (stays **purple**), or baking soda water (turns **blue or green**) to cups of cabbage juice. Then pour a pink cup into a green one and watch it head back toward purple.
- Introduce the words "acid" and "base" with pictures, not reading.
- **Accuracy (PLAN.md §9, acids and bases):** red cabbage colors exactly as above; never suggest tasting anything or testing household cleaners. Vinegar meeting baking soda really fizzes (the Kitchen Lab already shows this), so if the pink cup is vinegar and the green cup is baking soda water, show bubbles as they mix.
- Reuse the toolkit: Lab pouring and beaker (`src/lab/`), sticker book (`src/lab/StickerBook.js`).
- New-game file pattern: see "New games follow the existing structure" in CLAUDE.md. Suggested id `potions`.
- STATUS.md says the owner wants M9–M11 kid-tested first; the owner is doing that separately, so this ticket can go ahead.

## Design plan

_Written by the Architect (claude-opus-5-5) on 2026-10-11. The owner approves it by merging; builders follow it._

Color-Change Potions is a new game in the Lab room. Four glass cups are full of purple red-cabbage juice. Kids drag (or tap) lemon juice, vinegar, water or baking soda water into a cup and watch it turn pink, stay purple, or turn blue-green. Then they drag a pink cup onto a blue-green cup: it fizzes and the color heads back toward purple. A chart on the right fills in the words "Acid", "Neutral" and "Base" with their colors as the kids find them, and every finding is spoken aloud. There are five stickers to collect in a sticker book, plus a guided first visit and a 💡 hint button. The cups reuse the Kitchen Lab's beaker, including its pouring stream and fizz bubbles. Lemon juice also fizzes with baking soda in real life, so it fizzes here as well as vinegar.

### What the user sees
Game units are 2048x1536, as in every scene; Phaser FIT shows the whole picture on the 1180x820 iPad. Landscape only, like the other games.
- **Top bar**, copied from UnmixScene: 🏠 at (130,130) r90 goes to `Menu` with `{}` and lands back in the Lab room. 💡 at (350,130). 📖 at (570,130) opens the sticker book. The title `Potions` at (1100,130), 96px. The counter `🏅 n / 5` at (W-80,130): 64px, `#ffd84d`, right-aligned.
- **Shelf** (left): a panel like LabScene's shelf (x 40–400, y 270–1430, 0x8d6e4a at alpha 0.35). It holds 4 bottles at (220, 410 / 680 / 950 / 1220): lemon juice, vinegar, water, baking soda water. Each bottle sits on a cream circle r90 (hit area r110), with bottle art at 150 and a printed name tag 115 below it (copy `LabScene.addNameTag`). The supply never runs out: a bottle snaps back to its spot after use, like Lab shelf items.
- **Cups** (middle): 4 cups at x 640 / 920 / 1200 / 1480, y 720. Each is the Lab beaker at scale 0.5 (about 220x300 units, about 110x150 CSS px) filled with purple juice. Under each cup at y 920 is a word tag (48px, white): empty for fresh juice, otherwise "Acid", "Neutral" or "Base".
- **Fresh juice button**: (1060,1180) r110, cream, with a drawn red cabbage. Tapping it refills every cup with purple juice (`potions.fresh`).
- **Indicator chart** (right): a pale panel centred at (1840,760), 280x800. Three rows at y 480 / 760 / 1040, top to bottom Acid, Neutral, Base. Each row is a swatch circle r70 at x 1840 with its word 105 below (48px). Before a row is found it shows a grey swatch with "?"; once found it pulses into its color and word. Tapping a row says `potions.type.<id>`, or `potions.type.unknown` if not yet found.

**Play**
1. **Drag a bottle into a cup**, or **tap a bottle**. Tapping says `potions.name.<id>` and pours into the leftmost fresh-juice cup. If there is none, it says `potions.needFresh` and the hand points at the cabbage. The cup's `pour()` stream falls in **the liquid's own color** (lemon pale yellow, vinegar 0xf1e6c4, water pale blue, baking soda water cloudy white). After about 500 ms, the cup's juice fades over about 1000 ms to the indicator color, the tag word appears, and then the discovery line plays.
2. **Drag a cup onto another cup** to pour it in. The source cup moves above the target and tilts 45° toward it. The target gets a stream in the source's color, and the source's juice fades out. The source then goes home empty, and after about 800 ms it refills with fresh purple juice through a purple `pour()` stream. A cup dropped anywhere else goes back with `returnTo`.
3. **Acid meets base** (cup into cup, or bottle into cup) gives `fizz()` bubbles from the Beaker. The color moves base → blue 0x3f6fd0 → violet 0x6a4cc0 (or acid → violet the same way), and `potions.disc.mix` plays.
4. **Tap a cup**: it says `potions.cup.<kind>`.
- Pours are spaced out: while one is animating (`this.busy`, about 1.8 s, or about 3 s with fizz), anything dropped bounces back silently and 💡 is ignored.

**Guided first visit** (`!tipShown('potions')`): `potions.intro` plays and a 👇 hand points at the lemon juice. When it is picked up, the hand points at the first cup. After each discovery line finishes, `guideNext()` checks the cups and moves on:
- no acid cup: point at the lemon juice;
- else no base cup: say `potions.guide.base` and point at the baking soda water;
- else: say `potions.guide.mix` and point at the acid cup, then the base cup.

The guide finishes on the first `mix`: `markTipShown('potions')`, then `potions.free`, and the 📖 button pulses. Any order of play still moves forward. **Later visits** say `potions.welcome`.

**💡 hint**: points at the first sticker not yet found, in the order lemon, vinegar, water, bakingSoda, mix. It says `potions.hint.<id>` and points at the bottle, then at a fresh cup (or the cabbage button if there is none). For `mix` it points at an acid cup and a base cup if both exist, otherwise at the lemon juice and the baking soda water. With all stickers found it says `potions.allFound`.

### Files
**New**
- `src/scenes/PotionsScene.js` (key `'Potions'`): layout, shelf, cups, chart, drop handling (`cupAt(x,y)` returns the nearest cup whose `contains` is true), discoveries, sticker fly-to-📖 (copy `LabScene.discover`), guide, hint, `pointAt`/`clearHand`/`pointAtEach` (copy UnmixScene's 👇 version plus LabScene's `pointAtEach`). Target about 300 lines; move helpers into `src/potions/` if it grows.
- `src/potions/Cup.js`: `class Cup extends Beaker` (from `src/lab/Beaker.js`).
  - Constructor: `setScale(0.5)`, juice `this.water.setFillStyle(juice, 0.9)`, and `setSize(440,600).setInteractive()` as LabScene does.
  - It holds `kind` (`juice` | `acid` | `neutral` | `base` | `mixed`) and `color`.
  - Methods: `tintTo(color, ms, via)` (a counter tween with `Phaser.Display.Color.Interpolate.ColorWithColor` and `GetColor`), `empty()`, `refill()`, `setTag(word)`.
  - Override `contains(x,y)`: |dx| < 150 and y between cup.y-260 and cup.y+200.
  - Inherited unchanged: `pour(color)` and `fizz()`. Never call the inherited `reset(true)`: it sets the water alpha to 0.4.
- `src/potions/rules.js`: `combine(cupKind, addedType)` returns `{ kind, fizz }`. `juice`, `neutral` and `mixed` all count as neutral. Acid + base (either way round) gives `{ kind: 'mixed', fizz: true }`; added acid gives acid; added base gives base; added neutral leaves the kind alone (except the water bottle into a `juice` cup, which gives `neutral`). For the new color: acid into a non-acid cup takes the added liquid's color (a cup source passes its own color); an acid cup stays its color; base gives the base color; mixed gives violet.
- `src/potions/art.js`:
  - `bottleArt(scene,id,x,y,size)`: one bottle style, liquid and cap colors from JSON, and a small mark: lemon slice, plain (vinegar), water drop, orange box.
  - `cupArt(scene,color,x,y,size,bubbles)`: a small glass with colored liquid.
  - `cabbageArt(scene,x,y,size)`: a purple ball with pale curved veins. **Not 🥬**: that emoji is green lettuce.
  - `preparePotionArt(scene,cfg)`: draws an `item-<sticker.icon>` texture for each sticker from `cupArt` in that sticker's color (mix gets bubbles), the way `prepareUnmixArt` does, so `openStickerBook` and `addItemArt` find them.
  - Each drawing is cached as a texture under a `potions-...` key.
- `src/data/potions.json`: see Data.

**Shared files: registration lines only, no reordering**
- `src/main.js`: `import PotionsScene from './scenes/PotionsScene.js';` after the `LayersScene` import; append `PotionsScene` to the **end** of `scene: [...]`.
- `src/scenes/BootScene.js`: `this.load.json('potions', 'src/data/potions.json');` after the `float` line.
- `src/home/games.js`:
  - Two **new** import lines under the existing imports, rather than editing shared lines: `import { cupArt } from '../potions/art.js';` and `import { potionStickerCount } from '../systems/save.js';`.
  - A `potions` entry after `air`:
    - `color: 0xf06292`;
    - `icon` = three `cupArt`s: acid (-110,30,150), juice (0,-20,170) and base (110,30,150), colors read from `scene.cache.json.get('potions')`;
    - `start` → `scene.scene.start('Potions', {})`;
    - `progress` as in `unmix`, with label `🏅 n / total`.
- `src/data/rooms.json`: add `"potions"` to the end of the Lab `games`, and add `"potions"` to the end of `suggestedOrder`. The Lab then has 4 games, which the room menu shows as two rows of 2.
- `src/systems/save.js`: in DEFAULTS, `potionsFound: [], // Color-Change Potions stickers` after `airFilled`. After `addAirFilled`: `hasPotionSticker(id)`, `potionStickerCount()`, `addPotionSticker(id)` (returns true if new), copied from the unmix trio.
- `src/data/narration.json`: one `potions.*` block placed just before `"house.intro"`, each line `"recorded": false`.
- **Not touched:** `MenuScene.js` (ticket 0003 changes it), `Beaker.js`, `StickerBook.js`, `items.js`, `effects.js`.
- **Docs and release:**
  - `STATUS.md`: an M12 bullet, and a games-at-a-glance row `Color-Change Potions | potions | Lab | src/potions/`.
  - `README.md`: the line-6 game list, and iPad test step 11 (a Potions check).
  - `PLAN.md` §10.6: an "As built (M12)" line.
  - Run `node tools/make-narration-script.mjs` and `node tools/update-sw.mjs`.
  - `src/version.js` → `'0.14.0 (potions)'`, or the next free minor version if another game merged first.

### Data and storage
`potions.json`:
- `juice` "0x7b3fa0", `mixVia` "0x3f6fd0", `mixed` "0x6a4cc0".
- `liquids` (each with `id`, `label`, `type`, `pour`, `color`, `cap`):
  - `lemon`: "Lemon juice", acid, pour 0xfff3a0, color 0xe0245e (red-pink);
  - `vinegar`: "Vinegar", acid, pour 0xf1e6c4, color 0xf0609a (pink);
  - `water`: "Water", neutral, pour 0xcfeaff, color = juice;
  - `bakingSoda`: "Baking soda water", base, pour 0xf4f4f4, color 0x2794b0 (blue-green).
- `types`: acid "Acid" 0xf0609a; neutral "Neutral" juice color; base "Base" 0x2794b0.
- `stickers` (each with `id`, `icon` such as `potion-lemon`, `color`): lemon, vinegar, water, bakingSoda, mix. The book shows 5 in one row.
- `items`: `{ id: 'potion-<x>', emoji: '🧪' }` as a fallback for the book.

**Sticker rule:** a bottle earns its sticker when its pour changes a cup to that bottle's type (water: poured into a fresh-juice cup). Any acid-meets-base pour earns `mix`. Chart rows light up from the saved stickers: acid = lemon or vinegar, neutral = water, base = bakingSoda.

**Save:** `potionsFound` in `chemistry-save-v1`. `load()` merges DEFAULTS, so old saves get `[]`; `resetProgress` clears it. The first visit uses `tipShown('potions')`.

**Narration** (draft wording; no line mentions taste, drinking, or trying it at home):
- `potions.intro`: "These cups hold purple juice from red cabbage. It's a color-changer! In a lab we look, but we never taste. Drag the lemon juice into a cup and watch!"
- `potions.welcome`, `potions.free`, `potions.stickers`, `potions.allFound`, `potions.fresh`, `potions.needFresh`, `potions.guide.base`, `potions.guide.mix`.
- `potions.name.<4 liquids>`.
- `potions.cup.juice|acid|neutral|base|mixed`. Mixed: "The acid and the base cancelled each other out. It went back toward purple!"
- `potions.still.acid|neutral|base`, for a pour that doesn't change the kind ("Still pink. It's still an acid!").
- `potions.disc.lemon`: "Lemon juice turned the cabbage juice pink! Lemon juice is an acid. Acids turn it pink or red."
- `potions.disc.vinegar`: "Vinegar is an acid too!"
- `potions.disc.water`: "It stays purple. Water is neutral: not an acid and not a base."
- `potions.disc.bakingSoda`: "Blue-green! Baking soda is a base. Bases turn cabbage juice blue or green."
- `potions.disc.mix`: "Fizz! The acid and the base cancel each other out, so the color heads back toward purple. The bubbles are a gas called carbon dioxide."
- `potions.hint.<5 stickers>`.
- `potions.type.acid|neutral|base|unknown`.

### Reuse
- `Beaker` (`src/lab/Beaker.js`): glass texture, `pour(color)`, `fizz()` (it fades `bakingSoda` grains that don't exist, which is harmless).
- `openStickerBook(scene, stickers, itemsById, { hasSticker: hasPotionSticker, narrationPrefix: 'potions.disc', intro: 'potions.stickers' })` from `src/lab/StickerBook.js`.
- `makeDraggable` / `returnTo` (`src/systems/drag.js`). After a drop, set `setDepth(0)` as the Lab shelf does.
- `makeRoundButton` (`src/ui/button.js`); `addEmoji` and `addLabel` (`src/ui/emoji.js`); `burst` (`src/ui/effects.js`); `say`, `sfx` and `stopNarration` (`src/systems/audio.js`); `addItemArt` (`src/art/items.js`).
- Patterns to copy: `prepareUnmixArt` (pre-made `item-*` textures), `LabScene.discover` (sticker fly), `LabScene.pointAtEach`, `UnmixScene` (top bar, counter, guard on `book?.active`).

### Rules
- **§9 acids and bases:**
  - Red cabbage colors: acid pink or red, neutral purple, base blue or green.
  - The stream shows the liquid's own color, so the change visibly comes from the indicator.
  - Mixing heads *toward* purple (ends violet).
  - Fizz only when acid meets baking soda. That includes lemon juice, because real lemon juice and baking soda fizz too. Once mixed, the baking soda is used up, so adding more acid doesn't fizz.
  - Bubbles are named as carbon dioxide.
  - The cabbage is drawn purple, not 🥬.
  - Never taste, no cleaners, no home-experiment wording. Only lemon juice, vinegar, water and baking soda.
- **§10:** guided first visit with a hand; 💡 always works; no wrong answers (every pour does something real); 5 stickers saved and shown on the Lab badge; each line plays as its change happens.
- **Accessibility:** bottle hit area r110 and cups about 220x300 (both at least `MIN_TOUCH`). Never color alone: the tag words, the chart words and the spoken lines all carry the meaning. Chart words are white on a dark backing.
- **Kid-safe:** no text input, no links, data stays on the device.
- **Release:** narration script regenerated. Then run `update-sw.mjs`, then bump `APP_VERSION`, then run `node tools/browser-check.mjs` **after** both. Log the about 35 new device-voice lines and the §9 guardrails checked.

### Build order
1. `potions.json` and the Boot line; a `PotionsScene` stub with the top bar; the `main.js`, `games.js` (simple emoji icon for now) and `rooms.json` lines. The game opens from the Lab.
2. `art.js`: bottles, cups, cabbage, sticker textures. Swap in the real home icon.
3. `Cup.js` and `rules.js`. Lay out the cups, shelf, fresh button and chart.
4. Bottle drag and tap pours with color changes and tags.
5. Cup-into-cup pours, fizz, mixing toward purple, empty and refill.
6. Save functions; stickers, counter, sticker book, chart lighting.
7. Narration block; guided first visit; 💡 hint; cup and chart taps.
8. STATUS, README, PLAN; `make-narration-script`; `update-sw`; `APP_VERSION`; then `browser-check`.

### Risks
- **Merge hotspots, keep both** in each:
  - the `main.js` import and scene array;
  - the `BootScene` load lines;
  - `games.js` imports and the entries after `air` (0003 adds `cycle` there);
  - the `rooms.json` Lab line (0004 adds `crystal`) and the end of `suggestedOrder` (0003 and 0004 append too);
  - `save.js` DEFAULTS and the functions after `addAirFilled` (0004 will likely add growth fields);
  - the `narration.json` block before `house.intro` (0003 adds `cycle.*`);
  - the STATUS and README lists.

  For `sw.js`, `version.js` and `narration-script.md`, re-run the tools rather than hand-merging, and take the next version.
- The Beaker is drawn at scale 0.5: check that the stream, foam and bubbles look right inside a cup. If the 70-bubble fizz is too busy when small, add an optional bubble count to `Cup`, not to `Beaker`.
- Color tweens on a Rectangle: use `setFillStyle` each update; `fillColor` alone won't redraw.
- Leaving mid-pour: use `this.time` and tweens only (Phaser clears them on shutdown); guard every `say().then` with `this.sys.isActive()`.

### For the Tester
- `node tools/browser-check.mjs` passes, including `"potions" game starts`, with no console errors.
- At 1180x820 with touch emulation: the Lab shows 4 games in 2 rows; the Potions button has three colored cups and a `🏅` badge once played.
- First visit: you hear the intro and the hand points at the lemon juice, then the baking soda water, then the pink cup and the blue-green cup. Try doing things out of order: the guide still finishes after the first mix.
- Colors: lemon is red-pink, vinegar pink, water stays purple, baking soda water blue-green. Each stream shows the liquid's own color first. The tag words and chart rows match.
- Pour a pink cup onto a blue-green cup: bubbles appear, the color passes through blue to violet, and the poured cup refills purple. Lemon + baking soda also fizzes. More vinegar into the mixed cup turns it pink with **no** fizz. Water into a pink cup stays pink.
- Tapping a bottle pours into the leftmost fresh cup. With no fresh cup, the hand points at the cabbage, and the cabbage refills every cup.
- 💡 at each stage points at the right things. Dropping a bottle or cup anywhere else bounces back. 🏠 or 💡 during a pour causes no errors.
- All 5 stickers survive closing and reopening; book taps replay their lines; the second visit says welcome. Reset progress in the parent corner clears them.
- Listen to every `potions.*` line: no tasting or drinking, no "try at home", the correct color words.
- The other games still open from the Kitchen and the Lab.

### Questions for the owner

- Should the intro say a short lab-safety line: "In a lab we look, but we never taste!"? I recommend yes: it fits the no-tasting rule, and the word "potions" can sound like something to drink. The plan includes it until you say otherwise.
- Should the purple color be named "Neutral" (spoken as "neutral: not an acid and not a base") alongside "Acid" and "Base"? I recommend yes, since water needs a name on the chart. The plan assumes yes; the alternative is to leave the purple row without a word and only speak "not an acid and not a base".

### Notes from the plan check (gpt-5.5)

- .plan-check/plan.md says the Potions shelf is "like LabScene's shelf (x 40-400, y 270-1430)", but src/scenes/LabScene.js actually defines SHELF as x 40, y 250, w 520, h 1250, so it spans x 40-560 and y 250-1500; SHELF_R is 80 with a hit radius of 100. This is only a wording/precision issue because the proposed narrower Potions shelf can still work. Suggested: Clarify whether Potions intentionally uses its own narrower shelf, or change the reference to the real LabScene dimensions so the builder does not copy the wrong numbers by accident.
- .plan-check/plan.md build order step 1 says to add the home-screen entry with a simple emoji icon before step 2 creates src/potions/art.js, while the Files section tells the builder to import cupArt from ../potions/art.js in src/home/games.js. If followed literally with the import before art.js exists, the app will fail to load until step 2 is complete. Suggested: Either create src/potions/art.js with a minimal cupArt stub in step 1, or say the cupArt import/home icon swap happens in step 2 after art.js exists.
- .plan-check/plan.md says the Potions home button goes to Menu with {} and lands back in the Lab room. That works in the normal path because src/scenes/MenuScene.js stores the current room in this.registry under 'room'; the {} data is not what causes the room return. Direct starts, such as browser-check calling GAMES.potions.start from the house view, would return to the house. Suggested: Add a short note that MenuScene's registry room is what preserves the Lab-room return, matching the existing Unmix/Float pattern.

## Acceptance criteria
- [ ] New `potions` game in the Lab room, with a home-screen button, icon, and progress badge
- [ ] All three liquids give the correct indicator color; mixing acid into base moves toward purple (with fizz for vinegar + baking soda)
- [ ] Guided first visit, 💡 hint button, and something to collect (stickers or similar) that survives closing and reopening
- [ ] Every spoken line is in `narration.json`; `narration-script.md` regenerated
- [ ] Checked against PLAN.md §9; guardrails named in the log
- [ ] Works by touch (drag and tap) at iPad size; STATUS.md and the README's iPad test steps updated
- [ ] `node tools/update-sw.mjs` run and `APP_VERSION` bumped
- [ ] App builds (or serves) and runs locally with no console errors, and existing features still work
- [ ] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
- 2026-10-07 [claude] (opus): created from the starter ticket list
- 2026-10-11 [claude] (opus-5-5): design plan written by the Architect; waiting for the owner's OK
- 2026-10-11 [claude] (sonnet-5-5): claimed; starting the build from the design plan
