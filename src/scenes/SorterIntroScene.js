import { W } from '../layout.js';
import { Bin } from '../sorter/Bin.js';
import { makeGlass, makeBowl, makeBlock, makeJar, BOWL_R } from '../intro/props.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji } from '../ui/emoji.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { markSorterIntroSeen } from '../systems/save.js';

const GLASS = { x: 620, y: 640 };
const BOWL = { x: 1360, y: 620 };
const ROOM = { x: W / 2, y: 650, w: 1300, h: 800 };
const BIN_Y = 1320;
const BIN_SCALE = 0.45;
const CANCELLED = Symbol('left the scene');

// Warm-up before the first Sorter round: the kid tries one thing per state
// and sees the rule happen. A mini bin appears after each step.
export default class SorterIntroScene extends Phaser.Scene {
  constructor() {
    super('SorterIntro');
  }

  create(data) {
    this.replay = Boolean(data?.replay);
    this.generation = (this.generation || 0) + 1;
    this.states = this.cache.json.get('items').states;
    this.events.once('shutdown', stopNarration);

    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu'));

    this.run().catch((e) => {
      if (e !== CANCELLED) throw e;
    });
  }

  async run() {
    await this.solidStep();
    await this.liquidStep();
    await this.gasStep();
    await this.guard(say(this, 'intro.done'));
    markSorterIntroSeen();
    this.scene.start('Sorter', { guided: !this.replay });
  }

  // --- Solid: move the block from the glass to the bowl. It stays a block.
  async solidStep() {
    this.glass = makeGlass(this, GLASS.x, GLASS.y);
    this.bowl = makeBowl(this, BOWL.x, BOWL.y);
    const block = makeBlock(this, GLASS.x, GLASS.y + 160 - 65 - 12);
    block.setInteractive(new Phaser.Geom.Rectangle(-110, -110, 220, 220), Phaser.Geom.Rectangle.Contains);

    const hand = this.pointAt(block.x + 150, block.y);
    say(this, 'intro.solid.try');
    await this.until((done) => makeDraggable(this, block, {
      onTap: () => say(this, 'intro.solid.try'),
      onDrop: (x, y) => {
        if (this.nearBowl(x, y)) done();
        else returnTo(this, block, GLASS.x, GLASS.y + 160 - 65 - 12);
      },
    }));

    hand.destroy();
    block.disableInteractive();
    sfx(this, 'good');
    // Its corners rest on the curve: a square in a round bowl, gaps underneath.
    const half = block.size / 2;
    const restY = BOWL.y + Math.sqrt(BOWL_R ** 2 - half ** 2) - 6 - half;
    await this.tween({ targets: block, x: BOWL.x, y: restY, angle: 0, duration: 350, ease: 'Bounce.easeOut' });
    await this.guard(say(this, 'intro.solid'));
    await this.showBin('solid', 0);
    await this.tween({ targets: block, alpha: 0, duration: 300 });
    block.destroy();
  }

  // --- Liquid: pour the glass into the bowl. It takes the bowl's shape.
  async liquidStep() {
    const glass = this.glass;
    glass.setFill(0);
    await this.tween({
      targets: { v: 0 }, v: 1, duration: 500,
      onUpdate: (tw, target) => glass.setFill(target.v),
    });

    glass.setInteractive();
    const hand = this.pointAt(glass.x + 170, glass.y);
    say(this, 'intro.liquid.try');
    await this.until((done) => makeDraggable(this, glass, {
      onTap: done,
      onDrop: (x, y) => {
        if (this.nearBowl(x, y)) done();
        else returnTo(this, glass, GLASS.x, GLASS.y);
      },
    }));

    hand.destroy();
    glass.disableInteractive();
    await this.pour(glass);
    await this.guard(say(this, 'intro.liquid'));
    await this.showBin('liquid', 1);
    await this.tween({ targets: [glass, this.bowl], alpha: 0, duration: 300 });
    glass.destroy();
    this.bowl.destroy();
  }

  async pour(glass) {
    await this.tween({ targets: glass, x: BOWL.x - 260, y: BOWL.y - 300, duration: 400, ease: 'Quad.easeOut' });
    await this.tween({ targets: glass, angle: 75, duration: 350 });

    const stream = this.add.rectangle(BOWL.x - 110, BOWL.y - 250, 36, 330, 0xffa62b).setOrigin(0.5, 0).setScale(1, 0);
    await this.tween({ targets: stream, scaleY: 1, duration: 200 });
    sfx(this, 'good');
    await this.tween({
      targets: { v: 0 }, v: 1, duration: 1400,
      onUpdate: (tw, target) => {
        glass.setFill(1 - target.v);
        this.bowl.setLevel(target.v);
      },
    });
    stream.destroy();
    await this.tween({ targets: glass, angle: 0, x: GLASS.x, y: GLASS.y, duration: 400 });
  }

  // --- Gas: open the jar. The gas spreads out to fill the whole box.
  async gasStep() {
    const color = Number(this.states.gas.color);
    const room = this.add.rectangle(ROOM.x, ROOM.y, ROOM.w, ROOM.h, 0xffffff, 0.06)
      .setStrokeStyle(12, 0xffffff, 0.8);
    const jar = makeJar(this, ROOM.x, ROOM.y + 150);

    // Packed in the jar at first.
    const dots = [];
    for (let i = 0; i < 16; i++) {
      const dx = ((i % 4) - 1.5) * 40, dy = Math.floor(i / 4) * 40 - 60;
      dots.push(this.add.circle(jar.x + dx, jar.y + 40 + dy, 17, color));
    }
    this.children.bringToTop(jar);

    jar.setInteractive();
    const hand = this.pointAt(jar.x + 180, jar.y);
    say(this, 'intro.gas.try');
    await this.until((done) => jar.once('pointerup', done));

    hand.destroy();
    jar.disableInteractive();
    sfx(this, 'pop');
    this.tweens.add({ targets: jar.lid, y: -400, angle: 40, alpha: 0, duration: 500, ease: 'Quad.easeOut' });

    const left = ROOM.x - ROOM.w / 2 + 50, right = ROOM.x + ROOM.w / 2 - 50;
    const top = ROOM.y - ROOM.h / 2 + 50, bottom = ROOM.y + ROOM.h / 2 - 50;
    dots.forEach((dot, i) => {
      this.children.bringToTop(dot);
      this.tweens.add({
        targets: dot,
        x: Phaser.Math.Between(left, right),
        y: Phaser.Math.Between(top, bottom),
        duration: 1400,
        delay: i * 40,
        ease: 'Quad.easeOut',
        onComplete: () => this.drift(dot, left, right, top, bottom),
      });
    });
    await this.pause(900);
    await this.guard(say(this, 'intro.gas'));
    await this.showBin('gas', 2);
    await this.tween({ targets: [room, jar, ...dots], alpha: 0, duration: 300 });
  }

  // Gas particles keep moving around the box.
  drift(dot, left, right, top, bottom) {
    this.tweens.add({
      targets: dot,
      x: Phaser.Math.Clamp(dot.x + Phaser.Math.Between(-160, 160), left, right),
      y: Phaser.Math.Clamp(dot.y + Phaser.Math.Between(-160, 160), top, bottom),
      duration: Phaser.Math.Between(900, 1600),
      ease: 'Sine.easeInOut',
      onComplete: () => this.drift(dot, left, right, top, bottom),
    });
  }

  // --- Helpers

  async showBin(state, slot) {
    const bin = new Bin(this, W / 2 + (slot - 1) * 600, BIN_Y, state, this.states[state]);
    bin.baseScale = BIN_SCALE;
    bin.setScale(0);
    bin.on('pointerup', () => say(this, `state.${state}`));
    sfx(this, 'star');
    await this.tween({ targets: bin, scale: BIN_SCALE, duration: 400, ease: 'Back.easeOut' });
    await this.pause(500);
  }

  pointAt(x, y) {
    const hand = addEmoji(this, x, y, '👈', 130).setDepth(3000);
    this.tweens.add({ targets: hand, x: x + 40, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return hand;
  }

  nearBowl(x, y) {
    return Phaser.Math.Distance.Between(x, y, BOWL.x, BOWL.y) < BOWL_R + 150;
  }

  // Resolves with the promise, or stops the script if the kid left the scene.
  guard(promise) {
    const gen = this.generation;
    return promise.then((value) => {
      if (gen !== this.generation || !this.sys.isActive()) throw CANCELLED;
      return value;
    });
  }

  until(setup) {
    return this.guard(new Promise((resolve) => setup(() => resolve())));
  }

  tween(config) {
    return this.guard(new Promise((resolve) => this.tweens.add({ ...config, onComplete: resolve })));
  }

  pause(ms) {
    return this.guard(new Promise((resolve) => this.time.delayedCall(ms, resolve)));
  }
}
