import { W, H } from '../layout.js';
import { floatArt, guessIcon, LIQUID_COLORS } from '../float/art.js';
import { finishButtons, makeTouchable } from '../float/ui.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { burst } from '../ui/effects.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { addStars, tipShown, markTipShown } from '../systems/save.js';

const GLASS = { x: 1024, w: 440, top: 420, bottom: 1300 };
const LAYER_H = 230;
const ROWS = [470, 820, 1170];
const BOTTLES_X = 330;
const DROPS_X = 1720;
const LABEL = { honey: 'Honey', water: 'Water', oil: 'Oil' };

// Sink or Float, part 2: pour honey, water, and oil into a tall glass in any
// order. Each one ends up in its place (honey at the bottom, oil on top),
// because each floats on the liquids that are heavier for their size. Then
// drop in a cork, a grape, and a coin and watch where each one stops.
export default class LayersScene extends Phaser.Scene {
  constructor() {
    super('Layers');
  }

  create() {
    this.cfg = this.cache.json.get('float');
    this.generation = (this.generation || 0) + 1;
    this.events.once('shutdown', stopNarration);
    this.busy = false;
    this.hand = null;
    this.layers = []; // poured liquids, in the order they were poured
    this.dropped = [];
    this.guide = !tipShown('layers');

    this.drawGlass();
    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu', {}));
    makeRoundButton(this, 350, 130, 90, 0xffffff, addEmoji(this, 0, 0, '💡', 90), () => this.hint());
    makeRoundButton(this, W - 130, 130, 90, 0xfdf6e3, guessIcon(this, true).setScale(0.8), () => this.scene.start('Float', {}));
    addLabel(this, GLASS.x, 130, 'Liquid Tower', 96);

    this.bottles = this.cfg.liquids.map((id, i) => {
      const bottle = floatArt(this, `${id}Bottle`, BOTTLES_X, ROWS[i], 220);
      bottle.liquid = id;
      makeTouchable(bottle, bottle.scale);
      makeDraggable(this, bottle, {
        onTap: () => this.pour(bottle),
        onPickUp: () => this.clearHand(),
        onDrop: (x, y) => (this.overGlass(x, y) ? this.pour(bottle) : returnTo(this, bottle, BOTTLES_X, ROWS[i])),
      });
      addLabel(this, BOTTLES_X, ROWS[i] + 150, LABEL[id], 52);
      return bottle;
    });

    this.drops = this.cfg.drops.map((drop, i) => {
      const thing = floatArt(this, drop.id, DROPS_X, ROWS[i], drop.height * 1.4).setVisible(false);
      thing.drop = drop;
      thing.home = { x: DROPS_X, y: ROWS[i] };
      thing.label = addLabel(this, DROPS_X, ROWS[i] + 130, drop.label, 52).setVisible(false);
      makeTouchable(thing, thing.scale);
      thing.disableInteractive();
      makeDraggable(this, thing, {
        onTap: () => this.dropIn(thing),
        onPickUp: () => this.clearHand(),
        onDrop: (x, y) => (this.overGlass(x, y) ? this.dropIn(thing) : returnTo(this, thing, DROPS_X, ROWS[i])),
      });
      return thing;
    });

    if (this.guide) {
      say(this, 'layers.intro');
      this.pointAt(BOTTLES_X + 200, ROWS[0]);
    } else {
      say(this, 'layers.welcome');
    }
  }

  // Runs `then` after a promise, unless the scene was left or restarted meanwhile.
  later(promise, then) {
    const gen = this.generation;
    promise.then(() => {
      if (gen === this.generation && this.sys.isActive()) then();
    });
  }

  drawGlass() {
    const left = GLASS.x - GLASS.w / 2;
    this.add.graphics().fillStyle(0xffffff, 0.08).fillRect(left, GLASS.top, GLASS.w, GLASS.bottom - GLASS.top);
    const glass = this.add.graphics().setDepth(30);
    glass.lineStyle(14, 0xffffff, 0.9);
    glass.strokePoints([{ x: left, y: GLASS.top }, { x: left, y: GLASS.bottom }, { x: left + GLASS.w, y: GLASS.bottom }, { x: left + GLASS.w, y: GLASS.top }]);
    glass.lineStyle(8, 0xffffff, 0.35).lineBetween(left + 30, GLASS.top + 40, left + 30, GLASS.bottom - 40);
  }

  overGlass(x, y) {
    return Math.abs(x - GLASS.x) < GLASS.w / 2 + 160 && y > GLASS.top - 300 && y < GLASS.bottom;
  }

  // Where a liquid's layer sits: honey, water, oil from the bottom, counting
  // only the liquids that are in the glass.
  layerY(id) {
    const order = this.cfg.liquids.filter((l) => this.layers.some((layer) => layer.liquid === l));
    return GLASS.bottom - LAYER_H * (order.indexOf(id) + 0.5);
  }

  // The top of the liquid in the glass.
  surfaceY() {
    return GLASS.bottom - LAYER_H * this.layers.length;
  }

  // --- Pouring

  pour(bottle) {
    const { liquid } = bottle;
    const home = { x: BOTTLES_X, y: ROWS[this.cfg.liquids.indexOf(liquid)] };
    if (this.layers.some((l) => l.liquid === liquid)) {
      returnTo(this, bottle, home.x, home.y);
      say(this, 'layers.poured');
      return;
    }
    if (this.busy) {
      returnTo(this, bottle, home.x, home.y);
      return;
    }
    this.busy = true;
    this.clearHand();
    const line = this.pourLine(liquid);
    const color = LIQUID_COLORS[liquid];
    bottle.disableInteractive().setDepth(1000);

    this.tweens.add({
      targets: bottle, x: GLASS.x - 120, y: GLASS.top - 150, angle: 110, duration: 500, ease: 'Sine.easeInOut',
      onComplete: () => {
        // A stream falls from the bottle; the new liquid lands on top of what's there.
        const stream = this.add.rectangle(GLASS.x - 40, GLASS.top - 110, 34, this.surfaceY() - (GLASS.top - 110), color)
          .setOrigin(0.5, 0).setDepth(25).setScale(1, 0);
        this.tweens.add({ targets: stream, scaleY: 1, duration: 350 });
        const layer = this.add.rectangle(GLASS.x, this.surfaceY() - LAYER_H / 2, GLASS.w - 14, LAYER_H, color, 0.85).setDepth(20).setAlpha(0);
        layer.liquid = liquid;
        this.tweens.add({ targets: layer, alpha: 1, duration: 900, delay: 250 });
        this.layers.push(layer);
        sfx(this, 'pop');

        this.time.delayedCall(1200, () => {
          stream.destroy();
          this.tweens.add({
            targets: bottle, x: home.x, y: home.y, angle: 0, duration: 500,
            onComplete: () => {
              // Empty now; tapping it again says it's already in the glass.
              bottle.setAlpha(0.35).setDepth(0);
              bottle.input.enabled = true;
            },
          });
          this.settle(layer);
          this.later(say(this, line), () => this.afterPour());
        });
      },
    });
  }

  // Every layer slides to its place: the new one sinks through anything lighter
  // for its size, and the lighter ones rise above it.
  settle(layer) {
    for (const each of this.layers) {
      this.tweens.add({ targets: each, y: this.layerY(each.liquid), duration: 1600, ease: 'Sine.easeInOut' });
    }
    const target = this.layerY(layer.liquid);
    if (target <= layer.y) return;
    // Drops of the sinking liquid falling through the layers above its place.
    for (let i = 0; i < 8; i++) {
      const drop = this.add.circle(GLASS.x + Phaser.Math.Between(-150, 150), layer.y, 18, LIQUID_COLORS[layer.liquid]).setDepth(21);
      this.tweens.add({ targets: drop, y: target, duration: 1300, delay: i * 90, ease: 'Sine.easeIn', onComplete: () => drop.destroy() });
    }
  }

  // What to say depends on what's already in the glass.
  pourLine(liquid) {
    const has = (id) => this.layers.some((l) => l.liquid === id);
    if (!this.layers.length) return `layers.${liquid}.first`;
    if (liquid === 'honey') return 'layers.honey.under';
    if (liquid === 'oil') return 'layers.oil.top';
    if (has('honey') && has('oil')) return 'layers.water.middle';
    return has('honey') ? 'layers.water.onHoney' : 'layers.water.underOil';
  }

  afterPour() {
    this.busy = false;
    if (this.layers.length < this.cfg.liquids.length) {
      if (this.guide) this.pointAt(BOTTLES_X + 200, this.nextBottle().y);
      return;
    }
    // The tower is built: the things to drop in appear.
    this.drops.forEach((thing, i) => {
      const scale = thing.scale;
      thing.setVisible(true).setScale(0);
      thing.label.setVisible(true);
      this.tweens.add({ targets: thing, scale, duration: 400, delay: i * 150, ease: 'Back.easeOut' });
      thing.input.enabled = true;
    });
    this.later(say(this, 'layers.full'), () => {
      if (this.guide) this.pointAt(DROPS_X - 200, ROWS[0]);
    });
  }

  nextBottle() {
    return this.bottles.find((b) => !this.layers.some((l) => l.liquid === b.liquid));
  }

  // --- Dropping things in

  dropIn(thing) {
    if (this.busy || this.dropped.includes(thing)) {
      if (!this.dropped.includes(thing)) returnTo(this, thing, thing.home.x, thing.home.y);
      return;
    }
    this.busy = true;
    this.clearHand();
    this.dropped.push(thing);
    thing.disableInteractive();
    this.tweens.killTweensOf(thing);
    const { drop } = thing;
    const x = GLASS.x + (this.dropped.length - 2) * 120;
    const scale = drop.height / thing.height;
    const h = drop.height;
    const rest = this.restY(drop.rests, h);

    this.tweens.add({
      targets: thing, x, y: GLASS.top - 120, scale, duration: 450, ease: 'Sine.easeOut',
      onComplete: () => {
        thing.setDepth(10);
        sfx(this, 'pop');
        // The coin goes all the way through the thick, slow honey.
        this.tweens.add({
          targets: thing, y: rest, duration: drop.rests === 'bottom' ? 2200 : 1400, ease: 'Sine.easeOut',
          onComplete: () => {
            if (drop.rests === 'top') this.tweens.add({ targets: thing, y: rest + 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            burst(this, thing.x, thing.y, [0xffd84d, 0xffffff]);
            sfx(this, 'good');
          },
        });
        this.later(say(this, `layers.drop.${drop.id}`), () => this.afterDrop());
      },
    });
  }

  // Floating on the oil sits mostly above it; resting on the honey dips in a little.
  restY(rests, h) {
    const honeyTop = GLASS.bottom - LAYER_H;
    if (rests === 'top') return this.surfaceY() + h * (0.3 - 0.5);
    if (rests === 'honey') return honeyTop + h * (0.7 - 0.5);
    return GLASS.bottom - 10 - h / 2;
  }

  afterDrop() {
    this.busy = false;
    if (this.dropped.length < this.drops.length) {
      if (this.guide) this.pointAt(DROPS_X - 200, this.drops.find((d) => !this.dropped.includes(d)).y);
      return;
    }
    if (this.guide) {
      this.guide = false;
      markTipShown('layers');
    }
    this.finish();
  }

  finish() {
    const count = this.cfg.starsPerRound;
    addStars('float', count);
    this.busy = true;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setDepth(2000).setInteractive();
    for (let i = 0; i < count; i++) {
      const star = addEmoji(this, W / 2 + (i - (count - 1) / 2) * 300, H / 2 - 180, '⭐', 220).setDepth(2001).setScale(0);
      this.tweens.add({ targets: star, scale: 1, duration: 400, delay: i * 250, ease: 'Back.easeOut', onStart: () => sfx(this, 'star') });
    }
    this.later(say(this, 'layers.done'), () => finishButtons(this, 'Layers'));
  }

  hint() {
    if (this.busy) return;
    const bottle = this.nextBottle();
    if (bottle) {
      say(this, 'layers.hint.pour');
      this.pointAt(BOTTLES_X + 200, bottle.y);
      return;
    }
    const thing = this.drops.find((d) => !this.dropped.includes(d));
    if (thing) {
      say(this, 'layers.hint.drop');
      this.pointAt(DROPS_X - 200, thing.y);
    }
  }

  // A hand beside the target, pointing at it sideways.
  pointAt(x, y) {
    this.clearHand();
    const fromLeft = x > W / 2;
    this.hand = addEmoji(this, x, y, fromLeft ? '👉' : '👈', 110).setDepth(3000);
    this.tweens.add({ targets: this.hand, x: x + (fromLeft ? 30 : -30), duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  clearHand() {
    if (!this.hand) return;
    this.tweens.killTweensOf(this.hand);
    this.hand.destroy();
    this.hand = null;
  }
}
