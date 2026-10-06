import { W, H } from '../layout.js';
import { floatArt, floatTexture, guessIcon } from '../float/art.js';
import { finishButtons, makeTouchable } from '../float/ui.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { burst } from '../ui/effects.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { addStars, tipShown, markTipShown } from '../systems/save.js';

const TANK = { x: 1290, w: 980, top: 500, surface: 640, bottom: 1300 };
const STAND = { x: 440, y: 620 };
const GUESS_Y = 1110;
const SLOTS = [-320, 0, 320];

// Sink or Float, part 1: guess whether something will float or sink, then drop
// it in the tank and watch. A wrong guess is just a surprise; the tank shows
// the answer. Each thing stays in the tank, so floaters gather at the top and
// sinkers on the bottom. Every round ends with the orange, peel on and peel off.
export default class FloatScene extends Phaser.Scene {
  constructor() {
    super('Float');
  }

  create() {
    this.cfg = this.cache.json.get('float');
    this.byId = Object.fromEntries(this.cfg.items.map((it) => [it.id, it]));
    this.generation = (this.generation || 0) + 1;
    this.events.once('shutdown', stopNarration);
    this.phase = 'busy';
    this.hand = null;
    this.handTimers = [];
    this.slots = { true: 0, false: 0 };

    this.drawTank();
    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu', {}));
    makeRoundButton(this, 350, 130, 90, 0xffffff, addEmoji(this, 0, 0, '💡', 90), () => this.hint());
    makeRoundButton(this, W - 130, 130, 90, 0xffffff, floatArt(this, 'honeyBottle', 0, 0, 120), () => this.scene.start('Layers', {}));
    addLabel(this, TANK.x, 130, 'Float or Sink?', 96);

    this.guessButtons = [true, false].map((floats, i) => {
      const x = STAND.x + (i ? 160 : -160);
      const ring = this.add.circle(x, GUESS_Y, 140).setStrokeStyle(14, 0xffd84d).setVisible(false);
      const button = makeRoundButton(this, x, GUESS_Y, 120, floats ? 0x3ccf6e : 0x4f7cff, guessIcon(this, floats), () => this.guess(floats));
      addLabel(this, x, GUESS_Y + 180, floats ? 'Float' : 'Sink', 64);
      return { floats, button, ring };
    });

    this.queue = pickRound(this.cfg);
    if (!tipShown('float')) {
      markTipShown('float');
      this.later(this.explain(), () => this.nextThing());
    } else {
      this.later(say(this, 'float.welcome'), () => this.nextThing());
    }
  }

  // Runs `then` after a promise, unless the scene was left or restarted meanwhile.
  later(promise, then) {
    const gen = this.generation;
    promise.then(() => {
      if (gen === this.generation && this.sys.isActive()) then();
    });
  }

  drawTank() {
    const left = TANK.x - TANK.w / 2;
    const back = this.add.graphics();
    back.fillStyle(0xffffff, 0.08).fillRect(left, TANK.top, TANK.w, TANK.bottom - TANK.top);
    // The water sits in front of the things in the tank, so whatever is under
    // the surface is seen through it.
    const water = this.add.graphics().setDepth(20);
    water.fillStyle(0x7cc8f0, 0.45).fillRect(left, TANK.surface, TANK.w, TANK.bottom - TANK.surface);
    water.lineStyle(8, 0xd6efff, 0.9).lineBetween(left, TANK.surface, left + TANK.w, TANK.surface);
    const glass = this.add.graphics().setDepth(30);
    glass.lineStyle(14, 0xffffff, 0.9);
    glass.strokePoints([{ x: left, y: TANK.top }, { x: left, y: TANK.bottom }, { x: left + TANK.w, y: TANK.bottom }, { x: left + TANK.w, y: TANK.top }]);
    this.add.circle(STAND.x, STAND.y, 200, 0xfdf6e3).setStrokeStyle(8, 0x2b2350, 0.25);
  }

  // How to play, with a hand pointing at each guess button and then the tank.
  explain() {
    this.clearHand();
    this.handTimers = [
      this.time.delayedCall(2600, () => this.pointAt(this.guessButtons[0].button.x, GUESS_Y - 200)),
      this.time.delayedCall(3800, () => this.pointAt(this.guessButtons[1].button.x, GUESS_Y - 200)),
      this.time.delayedCall(5600, () => this.pointAt(TANK.x, TANK.surface - 60)),
      this.time.delayedCall(7600, () => this.clearHand()),
    ];
    return say(this, 'float.intro');
  }

  // --- One thing at a time

  nextThing() {
    const item = this.queue.shift();
    if (!item) {
      this.finishRound();
      return;
    }
    this.item = item;
    this.guessButtons.forEach((b) => b.ring.setVisible(false));

    if (item.peeledFrom && this.thing?.item.id === item.peeledFrom) {
      this.peel(item);
      return;
    }
    const thing = floatArt(this, item.id, STAND.x, STAND.y, item.height * 1.4);
    thing.item = item;
    thing.restScale = thing.scale;
    thing.setScale(0);
    this.tweens.add({ targets: thing, scale: thing.restScale, duration: 350, ease: 'Back.easeOut' });
    makeTouchable(thing, thing.restScale);
    makeDraggable(this, thing, {
      onTap: () => this.tapThing(thing),
      onPickUp: () => this.clearHand(),
      onDrop: (x, y) => this.dropAt(thing, x, y),
    });
    this.thing = thing;
    this.askGuess();
  }

  askGuess() {
    this.phase = 'guess';
    say(this, `float.ask.${this.item.id}`);
  }

  // The orange comes back out of the tank, loses its peel, and is tested again.
  peel(item) {
    const thing = this.thing;
    this.tweens.killTweensOf(thing);
    this.slots[true]--;
    thing.setDepth(1000);
    this.tweens.add({
      targets: thing, x: STAND.x, y: STAND.y, duration: 700, ease: 'Sine.easeInOut',
      onComplete: () => {
        for (let i = 0; i < 8; i++) {
          const bit = this.add.circle(thing.x, thing.y, 18, 0xf28c28).setStrokeStyle(4, 0x2b2350).setDepth(1001);
          const angle = (Math.PI * 2 * i) / 8;
          this.tweens.add({ targets: bit, x: bit.x + Math.cos(angle) * 220, y: bit.y + Math.sin(angle) * 220, alpha: 0, duration: 700, onComplete: () => bit.destroy() });
        }
        sfx(this, 'pop');
        thing.setTexture(floatTexture(this, item.id));
        thing.item = item;
        thing.restScale = (item.height * 1.4) / thing.height;
        thing.setScale(thing.restScale).setAngle(0);
        makeTouchable(thing, thing.restScale);
        this.askGuess();
      },
    });
  }

  tapThing(thing) {
    if (thing !== this.thing) return;
    if (this.phase === 'guess') say(this, `float.ask.${thing.item.id}`);
    else if (this.phase === 'drop') this.drop(thing);
  }

  guess(floats) {
    if (this.phase !== 'guess') return;
    this.clearHand();
    this.guessFloats = floats;
    this.guessButtons.forEach((b) => b.ring.setVisible(b.floats === floats));
    this.phase = 'drop';
    say(this, floats ? 'float.guess.float' : 'float.guess.sink');
    if (!tipShown('floatDrop')) this.pointAt(TANK.x, TANK.surface - 60);
  }

  dropAt(thing, x, y) {
    const inTank = Math.abs(x - TANK.x) < TANK.w / 2 + 80 && y > TANK.top - 200 && y < TANK.bottom;
    if (this.phase === 'drop' && inTank) {
      this.drop(thing);
      return;
    }
    returnTo(this, thing, STAND.x, STAND.y);
    if (this.phase === 'guess') {
      say(this, 'float.guessFirst');
      this.pointAt(STAND.x, GUESS_Y - 200);
    }
  }

  // Into the tank: splash, then it bobs up to float or settles on the bottom.
  drop(thing) {
    if (this.phase !== 'drop') return;
    this.phase = 'busy';
    this.clearHand();
    markTipShown('floatDrop');
    thing.disableInteractive();
    this.tweens.killTweensOf(thing);
    const { item } = thing;
    const x = TANK.x + SLOTS[this.slots[item.floats]++ % SLOTS.length];
    const h = item.height * 1.4 * 0.75;
    const scale = thing.restScale * 0.75;

    this.tweens.add({
      targets: thing, x, y: TANK.top - 140, scale, angle: 0, duration: 450, ease: 'Sine.easeOut',
      onComplete: () => {
        thing.setDepth(10);
        this.tweens.add({
          targets: thing, y: TANK.surface, duration: 300, ease: 'Quad.easeIn',
          onComplete: () => {
            this.splash(x);
            if (item.floats) this.bobUp(thing, h);
            else this.sinkDown(thing, h);
          },
        });
      },
    });
  }

  bobUp(thing, h) {
    const y = TANK.surface + h * (thing.item.under - 0.5);
    this.tweens.add({
      targets: thing, y: y + 90, duration: 300, ease: 'Quad.easeOut',
      onComplete: () => this.tweens.add({
        targets: thing, y, duration: 700, ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({ targets: thing, y: y + 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
          this.reveal(thing);
        },
      }),
    });
  }

  sinkDown(thing, h) {
    this.tweens.add({ targets: thing, angle: { from: -8, to: 8 }, duration: 300, yoyo: true, repeat: 2 });
    this.tweens.add({
      targets: thing, y: TANK.bottom - 10 - h / 2, duration: 1300, ease: 'Sine.easeIn',
      onComplete: () => {
        thing.setAngle(0);
        this.reveal(thing);
      },
    });
  }

  splash(x) {
    sfx(this, 'pop');
    for (let i = 0; i < 10; i++) {
      const drop = this.add.circle(x, TANK.surface, Phaser.Math.Between(10, 18), 0xd6efff).setDepth(25);
      this.tweens.add({
        targets: drop,
        x: x + Phaser.Math.Between(-160, 160),
        y: TANK.surface - Phaser.Math.Between(80, 200),
        alpha: 0,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => drop.destroy(),
      });
    }
  }

  reveal(thing) {
    const { item } = thing;
    const right = this.guessFloats === item.floats;
    sfx(this, right ? 'good' : 'boing');
    if (right) burst(this, thing.x, thing.y, [0xffd84d, 0xffffff]);
    const told = say(this, right ? 'float.right' : 'float.surprise')
      .then(() => (this.sys.isActive() ? say(this, `float.fact.${item.id}`) : null));
    this.later(told, () => this.time.delayedCall(400, () => this.nextThing()));
  }

  finishRound() {
    const count = this.cfg.starsPerRound;
    addStars('float', count);
    this.phase = 'done';
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setDepth(2000).setInteractive();
    for (let i = 0; i < count; i++) {
      const star = addEmoji(this, W / 2 + (i - (count - 1) / 2) * 300, H / 2 - 180, '⭐', 220).setDepth(2001).setScale(0);
      this.tweens.add({ targets: star, scale: 1, duration: 400, delay: i * 250, ease: 'Back.easeOut', onStart: () => sfx(this, 'star') });
    }
    this.later(say(this, 'float.done'), () => finishButtons(this, 'Float'));
  }

  hint() {
    if (this.phase === 'guess') {
      say(this, 'float.hint.guess');
      this.pointAt(STAND.x, GUESS_Y - 200);
    } else if (this.phase === 'drop') {
      say(this, 'float.hint.drop');
      this.pointAt(TANK.x, TANK.surface - 60);
    }
  }

  pointAt(x, y) {
    this.removeHand();
    this.hand = addEmoji(this, x, y, '👇', 110).setDepth(3000);
    this.tweens.add({ targets: this.hand, y: y + 35, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  // Removes the hand and cancels any pointing still scheduled.
  clearHand() {
    this.handTimers.forEach((t) => t.remove());
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

// A few floaters and sinkers, shuffled, then the orange with and without its peel.
function pickRound(cfg) {
  const regular = cfg.items.filter((it) => !it.finale);
  const pick = (floats, n) => Phaser.Utils.Array.Shuffle(regular.filter((it) => it.floats === floats)).slice(0, n);
  const round = Phaser.Utils.Array.Shuffle([...pick(true, cfg.floatersPerRound), ...pick(false, cfg.sinkersPerRound)]);
  return [...round, ...cfg.items.filter((it) => it.finale)];
}
