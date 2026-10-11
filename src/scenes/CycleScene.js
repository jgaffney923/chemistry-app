import { W } from '../layout.js';
import { ParticleView } from '../heat/ParticleView.js';
import { drawLandscape, sunArt, cloudOfDrops, raindrop, mountainY, DROP_COLOR } from '../cycle/art.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { burst, changeEffect } from '../ui/effects.js';
import { addStars, getStars, tipShown, markTipShown } from '../systems/save.js';

const UP = { x: 1790, y: 520, r: 240 };
const CLOUD = { x: 1150, y: 430 };
const VAPOR = 0xc3a2ff;
const STATE_STYLE = { liquid: { label: 'Liquid', color: '#3fd0e3' }, gas: { label: 'Gas', color: '#c3a2ff' } };
// Where each token is dropped to count: [minX, maxX, minY, maxY].
const TARGET = {
  warm: [0, 1000, 1000, 1536],
  cool: [850, 1450, 200, 700],
  rain: [1000, 1700, 650, 1300],
  river: [0, 1100, 1100, 1536],
};

// Water Cycle: warm the sea, cool the air, let it rain, and send the river
// home. One token is active at a time; each step plays its own animation.
export default class CycleScene extends Phaser.Scene {
  constructor() {
    super('Cycle');
  }

  create() {
    this.cfg = this.cache.json.get('cycle');
    this.events.once('shutdown', stopNarration);
    this.events.once('shutdown', () => this.clearHand());
    this.guide = !tipShown('cycle');
    this.stepIndex = 0;
    this.phase = 'ready';
    this.hand = null;
    this.voice = 0;
    this.tokens = {};
    this.vapor = [];
    this.cloud = null;

    ({ sea: this.sea, river: this.river, riverPoints: this.riverPoints } = drawLandscape(this));
    this.add.rectangle(0, 0, W, 260, 0x231c44).setOrigin(0);
    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu', {}));
    makeRoundButton(this, 350, 130, 90, 0xffffff, addEmoji(this, 0, 0, '💡', 90), () => this.hint());
    this.counter = addLabel(this, W - 60, 130, '', 64, '#ffd84d').setOrigin(1, 0.5);
    this.updateCounter();

    this.buildUpClose();
    this.tokens.warm = this.makeToken('warm', 300, 430, 130, sunArt(this));
    this.tokens.cool = this.makeToken('cool', 700, 400, 100, addEmoji(this, 0, 0, '❄️', 130));
    this.activate();

    if (this.guide) {
      this.speak('cycle.intro');
      this.pointAtToken();
    } else this.speak('cycle.welcome');
  }

  // --- Up close

  buildUpClose() {
    this.add.circle(UP.x, UP.y, UP.r + 12, 0xffffff, 0.85);
    this.zoom = new ParticleView(this, UP.x, UP.y, UP.r);
    this.zoom.setMaterial(Number(this.cfg.upClose.color));
    this.zoom.setState('liquid');
    this.zoom.temp = this.cfg.upClose.startTemp;
    addLabel(this, UP.x, UP.y + UP.r + 50, 'Up close', 44, '#2b2350');
    this.stateBox = this.add.rectangle(UP.x, UP.y + UP.r + 135, 280, 90, 0x2b2350).setStrokeStyle(4, 0xffffff, 0.6);
    this.stateLabel = addLabel(this, UP.x, UP.y + UP.r + 135, '', 64);
    this.showState('liquid');
    const tick = (time, delta) => this.zoom.step(time, delta / 1000);
    this.events.on('update', tick);
    this.events.once('shutdown', () => this.events.off('update', tick));
    const hit = this.add.circle(UP.x, UP.y, UP.r, 0xffffff, 0.001).setInteractive();
    hit.on('pointerup', () => {
      if (this.phase === 'ready') this.speak(`cycle.zoom.${this.zoom.state}`);
    });
  }

  showState(state) {
    this.stateLabel.setText(STATE_STYLE[state].label).setColor(STATE_STYLE[state].color);
    this.tweens.add({ targets: this.stateLabel, scale: { from: 1.3, to: 1 }, duration: 300 });
  }

  setUpClose(state, temp) {
    this.zoom.setState(state);
    this.showState(state);
    this.tweens.add({ targets: this.zoom, temp, duration: 800 });
  }

  // --- Tokens

  makeToken(id, x, y, r, content) {
    const token = this.add.container(x, y);
    token.add([this.add.circle(0, 0, r, 0xffffff, 0.9).setStrokeStyle(8, 0x2b2350, 0.5), ...[content].flat()]);
    token.setInteractive(new Phaser.Geom.Circle(0, 0, r), Phaser.Geom.Circle.Contains);
    this.enableDrag(token, id, x, y);
    return token;
  }

  enableDrag(token, id, homeX, homeY) {
    token.home = { x: homeX, y: homeY };
    makeDraggable(this, token, {
      onTap: () => this.run(id),
      onPickUp: () => this.clearHand(),
      onDrop: (dx, dy) => {
        returnTo(this, token, homeX, homeY);
        const [x0, x1, y0, y1] = TARGET[id];
        if (dx >= x0 && dx <= x1 && dy >= y0 && dy <= y1) this.run(id);
        else if (this.phase === 'ready') this.pointAtToken(true);
      },
    });
  }

  currentId() {
    return this.cfg.steps[this.stepIndex].id;
  }

  // Only the current token is bright, pulsing and tappable.
  activate() {
    for (const [id, token] of Object.entries(this.tokens)) {
      const on = id === this.currentId();
      this.tweens.killTweensOf(token);
      token.setScale(1).setAlpha(on ? 1 : 0.4);
      token.input.enabled = on;
      if (on) this.tweens.add({ targets: token, scale: 1.08, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  // Where the hand points: the token, or (after a wrong drop) its target.
  pointAtToken(target = false) {
    const token = this.tokens[this.currentId()];
    if (!token) return;
    if (!target) return this.pointAt(token.x, token.y - 160);
    const [x0, x1, y0, y1] = TARGET[this.currentId()];
    this.pointAt((x0 + x1) / 2, Math.min((y0 + y1) / 2, 1300) - 100);
  }

  // --- Steps

  run(id) {
    if (this.phase !== 'ready' || id !== this.currentId()) return;
    this.phase = 'busy';
    this.clearHand();
    const token = this.tokens[id];
    this.tweens.killTweensOf(token);
    token.setScale(1).setPosition(token.home.x, token.home.y);
    const done = { warm: () => this.warm(), cool: () => this.cool(), rain: () => this.rain(), river: () => this.flow() }[id]();
    this.speak(this.cfg.steps[this.stepIndex].line);
    this.time.delayedCall(done, () => this.finishStep());
  }

  // Each step method starts its animation and returns how long it takes (ms).
  warm() {
    const sun = this.tokens.warm;
    this.tweens.add({ targets: sun, scale: 1.3, duration: 700, yoyo: true, repeat: 2 });
    changeEffect(this, 500, 1350, 160, 'heat');
    this.tweens.add({ targets: this.sea, alpha: 0.75, duration: 450, yoyo: true, repeat: 5 });
    for (let i = 0; i < this.cfg.counts.vaporDots; i++) {
      const dot = this.add.circle(100 + Math.random() * 800, 1230, 12, VAPOR).setAlpha(0);
      this.vapor.push(dot);
      this.tweens.add({
        targets: dot, x: 950 + Math.random() * 400, y: 330 + Math.random() * 230, alpha: 0.9,
        duration: 2200, delay: i * 80, ease: 'Sine.easeOut',
        onComplete: () => this.tweens.add({ targets: dot, x: dot.x + 30, y: dot.y - 20, duration: 700, yoyo: true, repeat: -1 }),
      });
    }
    this.tweens.addCounter({ from: 0.3, to: 0.7, duration: 1500, onUpdate: (tw) => { this.zoom.temp = tw.getValue(); } });
    this.time.delayedCall(1500, () => this.setUpClose('gas', 0.7));
    return 3800;
  }

  cool() {
    changeEffect(this, CLOUD.x, CLOUD.y, 220, 'cool');
    this.setUpClose('liquid', 0.15);
    this.vapor.forEach((dot, i) => {
      this.tweens.killTweensOf(dot);
      this.tweens.add({
        targets: dot, x: CLOUD.x + (Math.random() - 0.5) * 200, y: CLOUD.y + (Math.random() - 0.5) * 120,
        duration: 1400, delay: i * 30, ease: 'Sine.easeInOut',
        onComplete: () => dot.setFillStyle(DROP_COLOR).setRadius(14),
      });
    });
    this.time.delayedCall(2400, () => {
      this.vapor.forEach((dot) => dot.destroy());
      this.vapor = [];
      this.cloud = cloudOfDrops(this, CLOUD.x, CLOUD.y, this.cfg.counts.cloudDrops).setAlpha(0);
      this.tweens.add({ targets: this.cloud, alpha: 1, duration: 300 });
      this.tokens.rain = this.cloud;
      this.enableDrag(this.cloud, 'rain', CLOUD.x, CLOUD.y);
    });
    return 3000;
  }

  rain() {
    const cloud = this.cloud;
    const grey = 0xaab4c2;
    cloud.drops.forEach((drop, i) => {
      if (i % 4 === 0) this.tweens.add({ targets: drop, scale: 1.8, duration: 700 });
      else this.tweens.add({ targets: drop, alpha: 0.4, duration: 700 });
      drop.setFillStyle(i % 4 === 0 ? 0xdde6f0 : grey);
    });
    const total = this.cfg.counts.raindrops;
    for (let i = 0; i < total; i++) {
      const x = 1100 + Math.random() * 280;
      const drop = raindrop(this, x, CLOUD.y + 60).setAlpha(0);
      const wave = i < total / 2 ? 0 : 1100;
      this.tweens.add({
        targets: drop, y: mountainY(x) - 20, alpha: 1, duration: 1000, delay: 700 + wave + (i % (total / 2)) * 60, ease: 'Quad.easeIn',
        onComplete: () => this.tweens.add({ targets: drop, alpha: 0, scale: 1.8, duration: 200, onComplete: () => drop.destroy() }),
      });
    }
    this.time.delayedCall(2900, () => {
      this.tweens.add({ targets: cloud, alpha: 0.15, duration: 800 });
      this.tokens.river = this.makeToken('river', 1290, 850, 100, addEmoji(this, 0, 0, '💧', 120));
    });
    return 3800;
  }

  flow() {
    this.tweens.add({ targets: this.river, alpha: 1, duration: 600 });
    for (let i = 0; i < 10; i++) {
      const drop = raindrop(this, this.riverPoints[0].x, this.riverPoints[0].y).setScale(1.3);
      this.tweens.addCounter({
        from: 0, to: 1, duration: 2000, delay: i * 180,
        onUpdate: (tw) => drop.setPosition(...along(this.riverPoints, tw.getValue())),
        onComplete: () => drop.destroy(),
      });
    }
    this.time.delayedCall(2400, () => {
      this.tweens.add({ targets: this.sea, alpha: 0.75, duration: 300, yoyo: true, repeat: 3 });
      for (let k = 0; k < 2; k++) {
        const ring = this.add.circle(960, 1230, 20).setStrokeStyle(8, 0xffffff, 0.8);
        this.tweens.add({ targets: ring, scale: 6, alpha: 0, duration: 1000, delay: k * 400, onComplete: () => ring.destroy() });
      }
    });
    return 3800;
  }

  finishStep() {
    if (this.stepIndex === this.cfg.steps.length - 1) {
      this.lapComplete();
      return;
    }
    this.stepIndex++;
    this.phase = 'ready';
    this.activate();
    this.afterVoice(() => {
      if (!this.guide) return;
      this.speak(this.cfg.steps[this.stepIndex].prompt);
      this.pointAtToken();
    });
  }

  lapComplete() {
    this.tokens.river?.destroy();
    delete this.tokens.river;
    addStars('cycle', 1);
    sfx(this, 'star');
    burst(this, 700, 1300, [0xffd84d, 0xffffff, 0x7cc8f0]);
    const fly = addEmoji(this, 700, 1300, '💧', 140).setDepth(950);
    this.tweens.add({
      targets: fly, x: W - 150, y: 130, duration: 1000, ease: 'Sine.easeInOut',
      onComplete: () => {
        fly.destroy();
        this.updateCounter();
      },
    });
    this.speak('cycle.lap').then(() => {
      if (this.sys.isActive()) this.reset();
    });
  }

  // Back to the start, ready to go round again.
  reset() {
    this.cloud?.destroy();
    this.cloud = null;
    delete this.tokens.rain;
    this.tweens.add({ targets: this.river, alpha: 0.35, duration: 600 });
    this.zoom.setState('liquid');
    this.showState('liquid');
    this.zoom.temp = this.cfg.upClose.startTemp;
    this.stepIndex = 0;
    this.phase = 'ready';
    this.activate();
    if (this.guide) {
      this.guide = false;
      markTipShown('cycle');
    }
  }

  // --- Voice, help and the hand

  speak(id) {
    this.voice++;
    this.currentLine = say(this, id);
    return this.currentLine;
  }

  // Runs `fn` when the line that is playing now finishes (not if it was replaced).
  afterVoice(fn) {
    const mine = this.voice;
    Promise.resolve(this.currentLine).then(() => {
      if (this.sys.isActive() && this.voice === mine && this.phase === 'ready') fn();
    });
  }

  hint() {
    if (this.phase !== 'ready') return;
    this.speak(this.cfg.steps[this.stepIndex].prompt);
    this.pointAtToken();
    this.time.delayedCall(3500, () => this.clearHand());
  }

  updateCounter() {
    this.counter.setText(`💧 ${getStars('cycle')}`);
  }

  pointAt(x, y) {
    this.clearHand();
    this.hand = addEmoji(this, x, y, '👇', 100).setDepth(3000);
    this.tweens.add({ targets: this.hand, y: y + 35, duration: 500, yoyo: true, repeat: -1 });
  }

  clearHand() {
    if (!this.hand) return;
    this.tweens.killTweensOf(this.hand);
    this.hand.destroy();
    this.hand = null;
  }
}

// A point part-way (0..1) along a polyline, by length.
function along(points, t) {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  let left = t * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (left <= lengths[i] || i === lengths.length - 1) {
      const f = Math.min(left / lengths[i], 1);
      return [points[i].x + (points[i + 1].x - points[i].x) * f, points[i].y + (points[i + 1].y - points[i].y) * f];
    }
    left -= lengths[i];
  }
}
