import { W, H } from '../layout.js';
import { Bin, BIN_W } from '../sorter/Bin.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji } from '../ui/emoji.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { addStars } from '../systems/save.js';

const SPAWN = { x: W / 2, y: 420 };
const PLATE = 170;

// State Sorter: drag each item into the Solid, Liquid, or Gas bin.
// Wrong drops just bounce back; after two misses the right bin glows.
// A guided round (right after the warm-up) starts with one easy item per state,
// with the right bin glowing from the start.
export default class SorterScene extends Phaser.Scene {
  constructor() {
    super('Sorter');
  }

  create(data) {
    const { states, sorter } = this.cache.json.get('items');
    this.config = sorter;
    this.generation = (this.generation || 0) + 1;

    const stateIds = Object.keys(states);
    const gap = (W - stateIds.length * BIN_W) / (stateIds.length + 1);
    this.bins = stateIds.map((id, i) => {
      const bin = new Bin(this, gap + BIN_W / 2 + i * (BIN_W + gap), H - 400, id, states[id]);
      bin.on('pointerup', () => say(this, `state.${id}`));
      return bin;
    });

    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.goHome());
    makeRoundButton(this, W - 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '💡', 90),
      () => this.scene.start('SorterIntro', { replay: true }));

    this.guidedLeft = 0;
    if (data?.guided) {
      const easy = sorter.items.filter((it) => sorter.guided.includes(it.id));
      const rest = sorter.items.filter((it) => !sorter.guided.includes(it.id));
      this.queue = [
        ...Phaser.Utils.Array.Shuffle(easy),
        ...pickRound(rest, sorter.roundSize - easy.length, stateIds),
      ];
      this.guidedLeft = easy.length;
    } else {
      this.queue = pickRound(sorter.items, sorter.roundSize, stateIds);
    }
    this.events.once('shutdown', stopNarration);

    this.later(say(this, 'sorter.intro'), () => this.nextItem());
  }

  // Runs `then` after a promise, unless the scene was left or restarted meanwhile.
  later(promise, then) {
    const gen = this.generation;
    promise.then(() => {
      if (gen === this.generation && this.sys.isActive()) then();
    });
  }

  nextItem() {
    const data = this.queue.shift();
    if (!data) {
      this.finishRound();
      return;
    }

    const item = this.add.container(SPAWN.x, SPAWN.y);
    const plate = this.add.circle(0, 0, PLATE, 0xffffff, 0.95).setStrokeStyle(8, 0x000000, 0.1);
    item.add([plate, addEmoji(this, 0, 0, data.emoji, 200)]);
    item.setInteractive(new Phaser.Geom.Circle(0, 0, PLATE), Phaser.Geom.Circle.Contains);
    item.info = data;
    item.misses = 0;
    this.current = item;

    item.setScale(0);
    this.tweens.add({ targets: item, scale: 1, duration: 400, ease: 'Back.easeOut' });
    say(this, `item.${data.id}.name`);
    if (this.guidedLeft > 0) {
      this.guidedLeft -= 1;
      this.binFor(data.state).pulse(true);
    }

    makeDraggable(this, item, {
      onTap: () => say(this, `item.${data.id}.name`),
      onDrop: (x, y) => this.drop(item, x, y),
    });
  }

  drop(item, x, y) {
    const bin = this.bins.find((b) => b.contains(x, y));
    if (!bin) {
      returnTo(this, item, SPAWN.x, SPAWN.y);
    } else if (bin.state === item.info.state) {
      this.correct(item, bin);
    } else {
      this.wrong(item);
    }
  }

  correct(item, bin) {
    bin.stopPulse();
    item.disableInteractive();
    this.current = null;
    const slot = bin.nextSlot();
    this.tweens.add({ targets: item, x: slot.x, y: slot.y, scale: 0.4, duration: 350, ease: 'Quad.easeIn' });
    sfx(this, 'good');
    bin.bounce();
    this.burst(bin.x, bin.y - 60, bin.color);
    this.later(say(this, `item.${item.info.id}.fact`), () => {
      this.time.delayedCall(400, () => this.nextItem());
    });
  }

  wrong(item) {
    item.misses += 1;
    sfx(this, 'boing');
    returnTo(this, item, SPAWN.x, SPAWN.y);
    if (item.misses >= 2) {
      say(this, 'sorter.hint');
      this.binFor(item.info.state).pulse();
    } else {
      say(this, 'sorter.tryAgain');
    }
  }

  burst(x, y, color) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14;
      const spark = this.add.circle(x, y, 18, i % 2 ? 0xffffff : color).setDepth(900);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 260,
        y: y + Math.sin(angle) * 260,
        alpha: 0,
        scale: 0.3,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  finishRound() {
    const count = this.config.starsPerRound;
    addStars('sorter', count);

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setDepth(2000).setInteractive();
    for (let i = 0; i < count; i++) {
      const star = addEmoji(this, W / 2 + (i - (count - 1) / 2) * 300, H / 2 - 180, '⭐', 220).setDepth(2001).setScale(0);
      this.tweens.add({
        targets: star,
        scale: 1,
        duration: 400,
        delay: i * 250,
        ease: 'Back.easeOut',
        onStart: () => sfx(this, 'star'),
      });
    }

    this.later(say(this, 'sorter.done'), () => {
      makeRoundButton(this, W / 2 - 220, H / 2 + 220, 140, 0x3ccf6e, addEmoji(this, 0, 0, '🔄', 130), () => this.scene.restart({}))
        .setDepth(2001);
      makeRoundButton(this, W / 2 + 220, H / 2 + 220, 140, 0x4f7cff, addEmoji(this, 0, 0, '🏠', 130), () => this.goHome())
        .setDepth(2001);
    });
  }

  binFor(state) {
    return this.bins.find((b) => b.state === state);
  }

  goHome() {
    this.scene.start('Menu');
  }
}

// An equal share of each state, shuffled, so every round covers all three.
function pickRound(items, size, stateIds) {
  const per = Math.floor(size / stateIds.length);
  const picked = stateIds.flatMap((state) =>
    Phaser.Utils.Array.Shuffle(items.filter((it) => it.state === state)).slice(0, per));
  return Phaser.Utils.Array.Shuffle(picked);
}
