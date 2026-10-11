import { W } from '../layout.js';
import { Cup } from '../potions/Cup.js';
import { combine, colorAfter, typeOf } from '../potions/rules.js';
import { bottleArt, cabbageArt, preparePotionArt } from '../potions/art.js';
import { addItemArt } from '../art/items.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { openStickerBook } from '../lab/StickerBook.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { burst } from '../ui/effects.js';
import { hasPotionSticker, addPotionSticker, potionStickerCount, tipShown, markTipShown } from '../systems/save.js';

const SHELF = { x: 40, y: 270, w: 360, h: 1160 };
const BOTTLE_X = 220;
const BOTTLE_Y = [410, 680, 950, 1220];
const CUP_X = [640, 920, 1200, 1480];
const CUP_Y = 720;
const FRESH = { x: 1060, y: 1180 };
const CHART_X = 1840;
const CHART_ROWS = [{ id: 'acid', y: 480 }, { id: 'neutral', y: 760 }, { id: 'base', y: 1040 }];
const ROW_STICKERS = { acid: ['lemon', 'vinegar'], neutral: ['water'], base: ['bakingSoda'] };
const TAG_WORDS = { acid: 'Acid', neutral: 'Neutral', mixed: 'Neutral', base: 'Base' };

// Color-Change Potions: pour kitchen liquids into cups of purple cabbage juice and
// see which are acids, bases or neither. Acid meets base: fizz, and back toward purple.
export default class PotionsScene extends Phaser.Scene {
  constructor() {
    super('Potions');
  }

  create() {
    this.cfg = this.cache.json.get('potions');
    preparePotionArt(this, this.cfg);
    this.itemsById = Object.fromEntries(this.cfg.items.map((item) => [item.id, item]));
    this.palette = {
      juice: Number(this.cfg.juice),
      via: Number(this.cfg.mixVia),
      mixed: Number(this.cfg.mixed),
      base: Number(this.cfg.types.base.color),
    };
    this.events.once('shutdown', stopNarration);
    this.events.once('shutdown', () => this.clearHand());
    this.guide = !tipShown('potions');
    this.hand = null;
    this.handTimers = [];
    this.book = null;
    this.told = null;

    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu', {}));
    makeRoundButton(this, 350, 130, 90, 0xffffff, addEmoji(this, 0, 0, '💡', 90), () => this.hint());
    this.bookButton = makeRoundButton(this, 570, 130, 90, 0xffffff, addEmoji(this, 0, 0, '📖', 90), () => this.openBook());
    addLabel(this, 1100, 130, 'Potions', 96);
    this.counter = addLabel(this, W - 80, 130, '', 64, '#ffd84d').setOrigin(1, 0.5);
    this.updateCounter();

    this.buildShelf();
    this.buildCups();
    makeRoundButton(this, FRESH.x, FRESH.y, 110, 0xfdf6e3, cabbageArt(this, 0, 0, 150), () => this.freshJuice());
    this.buildChart();

    if (this.guide) {
      this.speak('potions.intro');
      this.pointAt(this.bottles.lemon);
    } else this.speak('potions.welcome');
  }

  speak(id) {
    this.told = say(this, id);
    return this.told;
  }

  // --- Layout

  buildShelf() {
    const { x, y, w, h } = SHELF;
    this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x8d6e4a, 0.35).setStrokeStyle(8, 0x8d6e4a, 0.8);
    this.bottles = {};
    this.cfg.liquids.forEach((liquid, index) => {
      const homeY = BOTTLE_Y[index];
      const bottle = this.add.container(BOTTLE_X, homeY);
      bottle.add([this.add.circle(0, 0, 90, 0xfdf6e3).setStrokeStyle(6, 0x000000, 0.1), bottleArt(this, liquid.id, 0, 0, 150)]);
      bottle.setInteractive(new Phaser.Geom.Circle(0, 0, 110), Phaser.Geom.Circle.Contains);
      this.bottles[liquid.id] = bottle;
      this.addNameTag(BOTTLE_X, homeY + 115, liquid.label);
      makeDraggable(this, bottle, {
        onTap: () => this.tapBottle(liquid),
        onPickUp: () => {
          this.clearHand();
          const fresh = this.cups.find((cup) => cup.kind === 'juice');
          if (this.guide && fresh) this.pointAt(fresh);
        },
        onDrop: (dropX, dropY) => {
          this.tweens.killTweensOf(bottle);
          bottle.setPosition(BOTTLE_X, homeY).setDepth(0).setScale(0);
          this.tweens.add({ targets: bottle, scale: 1, duration: 250, ease: 'Back.easeOut' });
          this.dropBottle(liquid, dropX, dropY);
        },
      });
    });
  }

  // A little printed name under each bottle, for kids who are starting to read.
  addNameTag(x, y, text) {
    const label = addLabel(this, x, y, text, 30, '#2b2350');
    this.add.rectangle(x, y, label.width + 28, 48, 0xffffff).setStrokeStyle(4, 0x2b2350, 0.6);
    this.children.bringToTop(label);
  }

  buildCups() {
    this.cups = CUP_X.map((x) => {
      const cup = new Cup(this, x, CUP_Y, this.palette.juice);
      makeDraggable(this, cup, {
        onTap: () => this.tapCup(cup),
        onPickUp: () => {
          this.clearHand();
          this.tweens.killTweensOf(cup);
          this.tweens.add({ targets: cup, scale: 0.56, duration: 100 });
        },
        onDrop: (dropX, dropY) => this.dropCup(cup, dropX, dropY),
      });
      return cup;
    });
  }

  buildChart() {
    this.add.rectangle(CHART_X, 800, 280, 880, 0xfdf6e3, 0.9).setStrokeStyle(8, 0xe0c890);
    this.chart = CHART_ROWS.map(({ id, y }) => {
      const swatch = this.add.circle(CHART_X, y, 70, 0xb9b3a6).setStrokeStyle(8, 0x2b2350);
      const mark = addLabel(this, CHART_X, y, '?', 90, '#ffffff');
      const word = addLabel(this, CHART_X, y + 105, this.cfg.types[id].label, 48)
        .setBackgroundColor('#2b2350').setPadding(16, 4).setVisible(false);
      swatch.setInteractive().on('pointerup', () => this.tapRow(id));
      return { id, swatch, mark, word, shown: false };
    });
    this.refreshChart(false);
  }

  refreshChart(pulse) {
    for (const row of this.chart) {
      const found = ROW_STICKERS[row.id].some(hasPotionSticker);
      if (!found || row.shown) continue;
      row.shown = true;
      row.swatch.setFillStyle(Number(this.cfg.types[row.id].color));
      row.mark.setVisible(false);
      row.word.setVisible(true);
      if (pulse) this.tweens.add({ targets: [row.swatch, row.word], scale: 1.25, duration: 200, yoyo: true, repeat: 1 });
    }
  }

  updateCounter() {
    this.counter.setText(`🏅 ${potionStickerCount()} / ${this.cfg.stickers.length}`);
  }

  openBook() {
    if (this.book?.active) return;
    this.book = openStickerBook(this, this.cfg.stickers, this.itemsById, {
      hasSticker: hasPotionSticker, narrationPrefix: 'potions.disc', intro: 'potions.stickers',
    });
  }

  // --- Taps

  tapBottle(liquid) {
    if (this.book?.active) return;
    this.clearHand();
    this.speak(`potions.name.${liquid.id}`);
    const cup = this.cups.find((entry) => entry.kind === 'juice' && !entry.busy);
    if (cup) this.pourBottle(liquid, cup);
    else {
      this.speak('potions.needFresh');
      this.pointAt(FRESH);
    }
  }

  tapCup(cup) {
    if (this.book?.active || cup.kind === 'empty') return;
    this.speak(`potions.cup.${cup.kind}`);
  }

  tapRow(id) {
    if (this.book?.active) return;
    this.speak(`potions.type.${ROW_STICKERS[id].some(hasPotionSticker) ? id : 'unknown'}`);
  }

  freshJuice() {
    if (this.book?.active) return;
    this.clearHand();
    const cups = this.cups.filter((cup) => cup.kind !== 'juice' && cup.kind !== 'empty' && !cup.busy);
    cups.forEach((cup) => cup.refill());
    this.speak('potions.fresh');
  }

  // --- Dropping

  // The nearest cup under (x, y), not counting `except` or a cup waiting to refill.
  cupAt(x, y, except = null) {
    const hits = this.cups.filter((cup) => cup !== except && cup.kind !== 'empty' && cup.contains(x, y));
    hits.sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x));
    return hits[0] || null;
  }

  dropBottle(liquid, x, y) {
    const cup = this.cupAt(x, y);
    if (!cup || this.book?.active) return;
    if (cup.busy) this.wiggle(cup);
    else this.pourBottle(liquid, cup);
  }

  dropCup(source, x, y) {
    source.settleScale();
    const target = this.cupAt(x, y, source);
    if (!target || this.book?.active || source.kind === 'empty' || source.busy || target.busy) {
      source.setDepth(0);
      returnTo(this, source, source.home.x, source.home.y);
      if (target?.busy) this.wiggle(target);
      return;
    }
    this.pourCup(source, target);
  }

  // --- Pouring

  pourBottle(liquid, cup) {
    this.clearHand();
    this.applyPour(cup, {
      id: liquid.id, type: liquid.type, color: Number(liquid.color), pour: Number(liquid.pour),
    });
  }

  // A friendly little shake for a cup that is still busy, so a tap never seems ignored.
  wiggle(cup) {
    if (cup.wiggling) return;
    cup.wiggling = true;
    this.tweens.add({
      targets: cup, angle: { from: -6, to: 6 }, duration: 90, yoyo: true, repeat: 2,
      onComplete: () => {
        cup.setAngle(0);
        cup.wiggling = false;
      },
    });
  }

  pourCup(source, target) {
    this.clearHand();
    const sign = source.x < target.x ? 1 : -1;
    const added = { id: null, type: typeOf(source.kind), color: source.color, pour: source.color };
    source.busy = true;
    target.busy = true;
    source.setEnabled(false);
    source.setDepth(1000);
    this.tweens.add({
      targets: source, x: target.x - sign * 170, y: target.y - 330, angle: sign * 45, duration: 500, ease: 'Sine.easeInOut',
    });
    this.time.delayedCall(550, () => {
      source.empty();
      this.applyPour(target, added);
    });
    this.time.delayedCall(1500, () => {
      this.tweens.add({ targets: source, x: source.home.x, y: source.home.y, angle: 0, duration: 450, ease: 'Sine.easeInOut' });
    });
    this.time.delayedCall(2750, () => {
      source.refill();
      source.setDepth(0);
      source.busy = false;
      source.setEnabled(true);
    });
  }

  // Pours `added` into `cup`, changes its color after the stream lands, then explains.
  // Returns how long (ms) until the explanation starts.
  applyPour(cup, added) {
    const before = cup.kind;
    cup.busy = true;
    cup.setTag('');
    const result = combine(before, added.type, added.id === 'water');
    const color = colorAfter(this.palette, result, cup, added.color);
    cup.pour(added.pour);
    if (result.fizz) this.time.delayedCall(300, () => cup.fizz());
    this.time.delayedCall(500, () => cup.tintTo(color, result.fizz ? 1800 : 1000, result.fizz ? this.palette.via : null));
    cup.kind = result.kind;
    const settle = result.fizz ? 2400 : 1500;
    this.time.delayedCall(settle, () => {
      cup.busy = false;
      cup.setTag(TAG_WORDS[result.kind] || '');
      this.explain(cup, before, result, added);
    });
    return settle;
  }

  explain(cup, before, result, added) {
    const spot = { x: cup.x, y: cup.y - 120 };
    let sticker = null;
    if (result.fizz) sticker = 'mix';
    else if (added.id && result.kind === added.type && (added.id !== 'water' || before === 'juice')) sticker = added.id;
    let told;
    if (sticker) told = this.discover(sticker, spot.x, spot.y);
    else if (result.kind !== before) told = this.speak(`potions.cup.${result.kind}`);
    else told = this.speak(`potions.still.${typeOf(result.kind)}`);
    this.afterLine(told, result.fizz);
  }

  discover(id, x, y) {
    const isNew = addPotionSticker(id);
    const told = this.speak(`potions.disc.${id}`);
    burst(this, x, y, [0xffd84d, 0xffffff]);
    this.refreshChart(isNew);
    if (!isNew) return told;

    sfx(this, 'star');
    const sticker = this.add.container(x, y).setDepth(3000);
    sticker.add([
      this.add.circle(0, 0, 80, 0xffffff).setStrokeStyle(10, 0xf2b01e),
      addItemArt(this, this.itemsById[this.cfg.stickers.find((entry) => entry.id === id).icon], 0, 0, 120),
    ]);
    sticker.setScale(0);
    this.tweens.chain({
      targets: sticker,
      tweens: [
        { scale: 1.3, duration: 350, ease: 'Back.easeOut' },
        { scale: 1.3, duration: 700 },
        { x: this.bookButton.x, y: this.bookButton.y, scale: 0.3, duration: 600, ease: 'Quad.easeIn' },
      ],
      onComplete: () => {
        sticker.destroy();
        this.updateCounter();
        this.tweens.add({ targets: this.bookButton, scale: 1.25, duration: 150, yoyo: true });
      },
    });
    return told;
  }

  // --- Guide and hints

  // After a line has finished, the first-visit guide moves on to the next step.
  afterLine(told, mixed) {
    if (!this.guide) return;
    told.then(() => {
      if (!this.sys.isActive() || !this.guide || this.told !== told || this.book?.active) return;
      const acid = this.cups.find((cup) => cup.kind === 'acid');
      const base = this.cups.find((cup) => cup.kind === 'base');
      if (mixed) this.finishGuide();
      else if (!acid) this.pointAt(this.bottles.lemon);
      else if (!base) {
        this.speak('potions.guide.base');
        this.pointAt(this.bottles.bakingSoda);
      } else {
        this.speak('potions.guide.mix');
        this.pointAtEach([acid, base]);
      }
    });
  }

  finishGuide() {
    this.guide = false;
    markTipShown('potions');
    this.clearHand();
    this.speak('potions.free');
    this.tweens.add({ targets: this.bookButton, scale: 1.2, duration: 300, yoyo: true, repeat: 3 });
  }

  hint() {
    if (this.book?.active) return;
    const next = this.cfg.stickers.find((sticker) => !hasPotionSticker(sticker.id));
    if (!next) {
      this.speak('potions.allFound');
      return;
    }
    this.speak(`potions.hint.${next.id}`);
    if (next.id === 'mix') {
      const acid = this.cups.find((cup) => cup.kind === 'acid');
      const base = this.cups.find((cup) => cup.kind === 'base');
      this.pointAtEach(acid && base ? [acid, base] : [this.bottles.lemon, this.bottles.bakingSoda]);
    } else {
      const fresh = this.cups.find((cup) => cup.kind === 'juice');
      this.pointAtEach([this.bottles[next.id], fresh || FRESH]);
    }
  }

  // --- The pointing hand

  pointAt(target) {
    this.removeHand();
    if (target instanceof Cup) {
      const y = target.y - 280;
      this.hand = addEmoji(this, target.x, y, '👇', 100).setDepth(3000);
      this.tweens.add({ targets: this.hand, y: y + 35, duration: 500, yoyo: true, repeat: -1 });
      return;
    }
    // Bottles sit near the top buttons, so the hand stands beside the bottle and points at it.
    const x = target.x + 150;
    this.hand = addEmoji(this, x, target.y, '👈', 100).setDepth(3000);
    this.tweens.add({ targets: this.hand, x: x + 35, duration: 500, yoyo: true, repeat: -1 });
  }

  // Points at each target in turn, then goes away.
  pointAtEach(targets) {
    this.clearHand();
    targets.forEach((target, index) => {
      this.handTimers.push(this.time.delayedCall(index * 1800, () => this.pointAt(target)));
    });
    this.handTimers.push(this.time.delayedCall(targets.length * 1800 + 600, () => this.clearHand()));
  }

  // Removes the hand and cancels any hint still stepping through its targets.
  clearHand() {
    this.handTimers.forEach((timer) => timer.remove());
    this.handTimers = [];
    this.removeHand();
  }

  removeHand() {
    if (!this.hand) return;
    this.tweens.killTweensOf(this.hand);
    this.hand.destroy();
    this.hand = null;
  }
}
