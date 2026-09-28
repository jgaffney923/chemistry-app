import { W, H } from '../layout.js';
import { Beaker } from '../lab/Beaker.js';
import { Station } from '../lab/Station.js';
import { Magnifier } from '../lab/Magnifier.js';
import { openStickerBook } from '../lab/StickerBook.js';
import { addItemArt } from '../art/items.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { burst, changeEffect } from '../ui/effects.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { addSticker, stickerCount, isLabIntroSeen, markLabIntroSeen } from '../systems/save.js';

const SHELF = { x: 40, y: 250, w: 520, h: 1250 };
const SHELF_R = 88;
const PLACED_SIZE = 200;
const HOME = { spoon: { x: 1870, y: 640 }, magnifier: { x: 1840, y: 1010 } };

// Kitchen Lab: a free-play sandbox. Drag things from the shelf onto the hot plate,
// into the freezer, or into the beaker; stir with the spoon; look closely with the
// magnifying glass. Every new change found earns a discovery sticker.
// The first visit is guided: melt the ice on the hot plate.
export default class LabScene extends Phaser.Scene {
  constructor() {
    super('Lab');
  }

  create() {
    this.lab = this.cache.json.get('lab');
    this.itemsById = Object.fromEntries(this.lab.items.map((it) => [it.id, it]));
    this.events.once('shutdown', stopNarration);

    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu'));
    this.stickerButton = makeRoundButton(this, W - 130, 130, 90, 0xf2b01e, addEmoji(this, 0, 0, '🏅', 90),
      () => openStickerBook(this, this.lab.stickers, this.itemsById));
    this.stickerLabel = addLabel(this, W - 270, 130, '', 64, '#ffd84d').setOrigin(1, 0.5);
    this.updateStickerLabel();

    this.buildShelf();
    this.stations = [new Station(this, 880, 600, 'heat'), new Station(this, 880, 1170, 'cool')];
    this.stations.forEach((station) => {
      station.on('pointerup', () => {
        if (station.item) this.work(station);
        else say(this, station.kind === 'heat' ? 'lab.hotPlate' : 'lab.freezer');
      });
    });

    this.beaker = new Beaker(this, 1420, 800);
    this.beaker.setSize(440, 600).setInteractive();
    this.beaker.on('pointerup', () => say(this, 'lab.beaker'));
    makeRoundButton(this, 1420, 1290, 80, 0x4fb3ff, addEmoji(this, 0, 0, '🚰', 90), () => {
      this.beaker.reset();
      say(this, 'lab.freshWater');
    });

    this.buildSpoon();
    this.magnifier = new Magnifier(this, HOME.magnifier.x, HOME.magnifier.y, this.beaker, {
      onTap: () => say(this, 'lab.magnifier'),
      onLook: (type) => say(this, `lab.magnify.${type}`),
    });

    this.guide = null;
    if (!isLabIntroSeen()) this.startGuide();
  }

  // --- Shelf: an endless supply of each item. Dragging one out leaves a fresh one behind.

  buildShelf() {
    const { x, y, w, h } = SHELF;
    this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x8d6e4a, 0.35).setStrokeStyle(8, 0x8d6e4a, 0.8);
    this.shelfItems = {};
    this.lab.shelf.forEach((id, i) => {
      const slot = { x: x + 135 + (i % 2) * 250, y: y + 110 + Math.floor(i / 2) * 206 };
      const item = this.add.container(slot.x, slot.y);
      item.add([this.add.circle(0, 0, SHELF_R, 0xfdf6e3).setStrokeStyle(6, 0x000000, 0.1), addItemArt(this, this.itemsById[id], 0, 0, 140)]);
      item.setInteractive(new Phaser.Geom.Circle(0, 0, SHELF_R + 12), Phaser.Geom.Circle.Contains);
      this.shelfItems[id] = item;
      makeDraggable(this, item, {
        onPickUp: () => this.guideStep('picked', id),
        onTap: () => say(this, `item.${id}.name`),
        onDrop: (dx, dy) => {
          item.setPosition(slot.x, slot.y).setDepth(0).setScale(0);
          this.tweens.add({ targets: item, scale: 1, duration: 250, ease: 'Back.easeOut' });
          this.drop(id, dx, dy);
        },
      });
    });
  }

  // Something let go at (x, y). Returns true if it was used.
  drop(id, x, y) {
    const station = this.stations.find((s) => s.contains(x, y));
    if (station) {
      this.place(station, id);
      return true;
    }
    if (this.beaker.contains(x, y)) return this.intoBeaker(id);
    return false;
  }

  // --- Hot plate and freezer

  place(station, id) {
    if (station.item) this.poof(station.item);
    const placed = this.add.container(station.slot.x, station.slot.y);
    placed.art = addItemArt(this, this.itemsById[id], 0, 0, PLACED_SIZE);
    placed.add(placed.art);
    placed.id = id;
    placed.setInteractive(new Phaser.Geom.Circle(0, 0, 110), Phaser.Geom.Circle.Contains);
    station.item = placed;
    sfx(this, 'pop');

    makeDraggable(this, placed, {
      onTap: () => say(this, `item.${placed.id}.name`),
      onDrop: (x, y) => {
        const target = this.stations.find((s) => s.contains(x, y));
        if (target === station) {
          returnTo(this, placed, station.slot.x, station.slot.y);
        } else if (target) {
          station.item = null;
          placed.destroy();
          this.place(target, placed.id);
        } else if (this.beaker.contains(x, y) && this.intoBeaker(placed.id)) {
          station.item = null;
          placed.destroy();
        } else if (this.beaker.contains(x, y)) {
          returnTo(this, placed, station.slot.x, station.slot.y);
        } else {
          station.item = null;
          this.poof(placed);
        }
      },
    });
    this.guideStep('placed', id, station);
    this.work(station);
  }

  // Heat or cool whatever is on the station.
  work(station) {
    const placed = station.item;
    const { kind } = station;
    station.glow();
    changeEffect(this, station.slot.x, station.slot.y, 100, kind);
    sfx(this, kind === 'heat' ? 'good' : 'star');
    placed.disableInteractive();

    this.time.delayedCall(1100, () => {
      if (station.item !== placed) return;
      placed.setInteractive();
      const result = this.lab[kind][placed.id];
      if (!result) {
        say(this, 'lab.nothing');
        return;
      }
      if (result.to === 'steam') {
        station.item = null;
        this.steamAway(placed);
      } else if (result.to !== placed.id) {
        this.swapArt(placed, result.to);
      }
      this.discover(result.sticker, station.slot.x, station.slot.y);
    });
  }

  swapArt(placed, to) {
    const old = placed.art;
    placed.art = addItemArt(this, this.itemsById[to], 0, 0, PLACED_SIZE).setAlpha(0);
    placed.add(placed.art);
    placed.id = to;
    this.tweens.add({ targets: old, alpha: 0, duration: 600, onComplete: () => old.destroy() });
    this.tweens.add({ targets: placed.art, alpha: 1, duration: 600 });
  }

  // Boiled water rises away as gas (drawn as the gas dots used everywhere else).
  steamAway(placed) {
    const { x, y } = placed;
    this.tweens.add({ targets: placed, alpha: 0, duration: 400, onComplete: () => placed.destroy() });
    for (let i = 0; i < 12; i++) {
      const dot = this.add.circle(x + Phaser.Math.Between(-60, 60), y + Phaser.Math.Between(-20, 40), 14, 0xa77cf2)
        .setStrokeStyle(4, 0x2b2350).setDepth(1100);
      this.tweens.add({
        targets: dot,
        x: dot.x + Phaser.Math.Between(-220, 220),
        y: y - Phaser.Math.Between(280, 480),
        alpha: 0,
        duration: 2200,
        delay: i * 60,
        ease: 'Sine.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  poof(obj) {
    this.tweens.killTweensOf(obj);
    this.tweens.add({ targets: obj, scale: 0, alpha: 0, duration: 250, onComplete: () => obj.destroy() });
  }

  // --- Beaker

  intoBeaker(id) {
    const result = this.beaker.addIngredient(id);
    if (result.rejected) {
      say(this, result.line);
      return false;
    }
    sfx(this, 'pop');
    if (result.line === 'lab.stir') this.spoon.hint();
    const { x, y } = this.beaker;
    if (result.stickers.length) {
      // Give the bubbles or the floating a moment to show before explaining.
      this.time.delayedCall(id === 'bakingSoda' || id === 'vinegar' ? 1200 : 700, () => {
        result.stickers.forEach((s) => this.discover(s, x, y - 150));
      });
    } else if (result.line) {
      say(this, result.line);
    }
    return true;
  }

  buildSpoon() {
    const { x, y } = HOME.spoon;
    const spoon = this.add.container(x, y);
    spoon.add(addItemArt(this, { id: 'spoon', emoji: '🥄' }, 0, 0, 220));
    spoon.setInteractive(new Phaser.Geom.Circle(0, 0, 115), Phaser.Geom.Circle.Contains);
    spoon.hint = () => this.tweens.add({ targets: spoon, angle: { from: -12, to: 12 }, duration: 160, yoyo: true, repeat: 5, onComplete: () => spoon.setAngle(0) });
    makeDraggable(this, spoon, {
      onTap: () => say(this, 'lab.spoon'),
      onDrop: (dx, dy) => {
        if (!this.beaker.contains(dx, dy)) {
          returnTo(this, spoon, x, y);
          return;
        }
        spoon.disableInteractive();
        this.tweens.add({
          targets: spoon, x: this.beaker.x + 40, y: this.beaker.surfaceY - 30, angle: 25, duration: 200,
          onComplete: () => this.tweens.add({
            targets: spoon, x: this.beaker.x - 60, angle: -25, duration: 200, yoyo: true, repeat: 2,
            onComplete: () => {
              spoon.setInteractive();
              spoon.setAngle(0);
              returnTo(this, spoon, x, y);
            },
          }),
        });
        const stickers = this.beaker.stir();
        sfx(this, 'pop');
        if (stickers.length) {
          this.time.delayedCall(1400, () => stickers.forEach((s) => this.discover(s, this.beaker.x, this.beaker.y)));
        } else {
          say(this, 'lab.stirred');
        }
      },
    });
    this.spoon = spoon;
  }

  // --- Discoveries

  discover(id, x, y) {
    const isNew = addSticker(id);
    const told = say(this, `disc.${id}`);
    burst(this, x, y, [0xffd84d, 0xffffff]);
    if (!isNew) return;

    sfx(this, 'star');
    const sticker = this.add.container(x, y).setDepth(3000);
    sticker.add([
      this.add.circle(0, 0, 80, 0xffffff).setStrokeStyle(10, 0xf2b01e),
      addItemArt(this, this.itemsById[this.lab.stickers.find((s) => s.id === id).icon], 0, 0, 120),
    ]);
    sticker.setScale(0);
    this.tweens.chain({
      targets: sticker,
      tweens: [
        { scale: 1.3, duration: 350, ease: 'Back.easeOut' },
        { scale: 1.3, duration: 700 },
        { x: this.stickerButton.x, y: this.stickerButton.y, scale: 0.3, duration: 600, ease: 'Quad.easeIn' },
      ],
      onComplete: () => {
        sticker.destroy();
        this.updateStickerLabel();
        this.tweens.add({ targets: this.stickerButton, scale: 1.25, duration: 150, yoyo: true });
      },
    });

    if (this.guide) this.finishGuide(told);
  }

  updateStickerLabel() {
    const n = stickerCount();
    this.stickerLabel.setText(n ? `${n} / ${this.lab.stickers.length}` : '');
  }

  // --- First visit: point at the ice, then at the hot plate.

  startGuide() {
    this.guide = { hand: null };
    this.pointAt(this.shelfItems.ice);
    say(this, 'lab.intro');
  }

  guideStep(event, id) {
    if (!this.guide || id !== 'ice') return;
    if (event === 'picked') this.pointAt(this.stations[0], -80);
    if (event === 'placed') this.clearHand();
  }

  finishGuide(told) {
    this.clearHand();
    this.guide = null;
    markLabIntroSeen();
    told.then(() => {
      if (!this.sys.isActive()) return;
      say(this, 'lab.free');
      this.tweens.add({ targets: this.stickerButton, scale: 1.2, duration: 300, yoyo: true, repeat: 3 });
    });
  }

  pointAt(target, dy = 0) {
    this.clearHand();
    const hand = addEmoji(this, target.x + 150, target.y + dy, '👈', 120).setDepth(3000);
    this.tweens.add({ targets: hand, x: hand.x + 40, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.guide.hand = hand;
  }

  clearHand() {
    if (!this.guide?.hand) return;
    this.tweens.killTweensOf(this.guide.hand);
    this.guide.hand.destroy();
    this.guide.hand = null;
  }
}
