import { W, H } from '../layout.js';
import { Bin, BIN_W } from '../sorter/Bin.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji } from '../ui/emoji.js';
import { addItemArt } from '../art/items.js';
import { burst, changeEffect } from '../ui/effects.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { addStars, getStars } from '../systems/save.js';

const SPAWN = { x: W / 2, y: 420 };
const PLATE = 170;
const ACTIONS = {
  heat: { emoji: '🔥', color: 0xff7a3d },
  cool: { emoji: '❄️', color: 0x8fd3ff },
};

// State Sorter: drag each item into the Solid, Liquid, or Gas bin.
// Wrong drops just bounce back; after two misses the right bin glows.
//
// Level 1 sorts single items. A guided round (right after the warm-up) starts
// with one easy item per state, with the right bin glowing from the start.
// Level 2 (unlocked by stars) sorts "change chains": sort the item, heat or cool
// it, watch it change state, and sort the new form.
export default class SorterScene extends Phaser.Scene {
  constructor() {
    super('Sorter');
  }

  create(data = {}) {
    const { states, sorter } = this.cache.json.get('items');
    this.config = sorter;
    this.itemsById = Object.fromEntries([...sorter.items, ...sorter.changeItems].map((it) => [it.id, it]));
    this.generation = (this.generation || 0) + 1;
    this.events.once('shutdown', stopNarration);

    const stateIds = Object.keys(states);
    const gap = (W - stateIds.length * BIN_W) / (stateIds.length + 1);
    this.bins = stateIds.map((id, i) => {
      const bin = new Bin(this, gap + BIN_W / 2 + i * (BIN_W + gap), H - 400, id, states[id]);
      bin.on('pointerup', () => say(this, `state.${id}`));
      return bin;
    });

    this.homeButton = makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.goHome());
    makeRoundButton(this, W - 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '💡', 90),
      () => this.scene.start('SorterIntro', { replay: true }));

    if (!data.level && !data.guided && this.level2Unlocked()) {
      this.showLevelPicker();
      return;
    }
    this.level = data.level || 1;

    this.guidedLeft = 0;
    if (this.level === 2) {
      const { chains, chainsPerRound } = sorter.level2;
      this.queue = Phaser.Utils.Array.Shuffle(chains.slice()).slice(0, chainsPerRound).map((c) => this.parseChain(c));
    } else if (data.guided) {
      const easy = sorter.items.filter((it) => sorter.guided.includes(it.id));
      const rest = sorter.items.filter((it) => !sorter.guided.includes(it.id));
      this.queue = [
        ...Phaser.Utils.Array.Shuffle(easy),
        ...pickRound(rest, sorter.roundSize - easy.length, stateIds),
      ].map((it) => ({ items: [it], actions: [] }));
      this.guidedLeft = easy.length;
    } else {
      this.queue = pickRound(sorter.items, sorter.roundSize, stateIds).map((it) => ({ items: [it], actions: [] }));
    }

    this.later(say(this, this.level === 2 ? 'level2.intro' : 'sorter.intro'), () => this.nextChain());
  }

  // ["ice", "heat", "water"] -> { items: [ice, water], actions: ["heat"] }
  parseChain(list) {
    return {
      items: list.filter((_, i) => i % 2 === 0).map((id) => this.itemsById[id]),
      actions: list.filter((_, i) => i % 2 === 1),
    };
  }

  level2Unlocked() {
    return getStars('sorter') >= this.config.level2.unlockStars;
  }

  // Runs `then` after a promise, unless the scene was left or restarted meanwhile.
  later(promise, then) {
    const gen = this.generation;
    promise.then(() => {
      if (gen === this.generation && this.sys.isActive()) then();
    });
  }

  showLevelPicker() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setDepth(2000).setInteractive();
    const art = (id, x, y) => addItemArt(this, this.itemsById[id], x, y, 150);
    const buttons = [
      makeRoundButton(this, W / 2 - 330, H / 2 - 80, 250, 0x4f7cff,
        [art('ice', -95, 45), art('water', 0, -75), art('balloon', 95, 45)],
        () => this.scene.restart({ level: 1 })),
      makeRoundButton(this, W / 2 + 330, H / 2 - 80, 250, 0xff7a3d,
        [addEmoji(this, -70, 0, '🔥', 150), addEmoji(this, 75, 0, '❄️', 150)],
        () => this.scene.restart({ level: 2 })),
    ];
    buttons.forEach((b, i) => {
      b.setDepth(2001).setScale(0);
      this.tweens.add({ targets: b, scale: 1, duration: 400, delay: i * 120, ease: 'Back.easeOut' });
    });
    this.homeButton.setDepth(2001);
    say(this, 'sorter.pickLevel');
  }

  nextChain() {
    this.chain = this.queue.shift();
    if (!this.chain) {
      this.finishRound();
      return;
    }
    this.step = 0;
    this.spawnItem(this.chain.items[0]);
  }

  spawnItem(info) {
    const item = this.add.container(SPAWN.x, SPAWN.y);
    const plate = this.add.circle(0, 0, PLATE, 0xfdf6e3).setStrokeStyle(8, 0x000000, 0.1);
    item.art = addItemArt(this, info, 0, 0);
    item.add([plate, item.art]);
    item.setInteractive(new Phaser.Geom.Circle(0, 0, PLATE), Phaser.Geom.Circle.Contains);
    item.info = info;
    item.misses = 0;
    this.current = item;

    item.setScale(0);
    this.tweens.add({ targets: item, scale: 1, duration: 400, ease: 'Back.easeOut' });
    say(this, `item.${info.id}.name`);
    if (this.guidedLeft > 0) {
      this.guidedLeft -= 1;
      this.binFor(info.state).pulse(true);
    }

    makeDraggable(this, item, {
      onTap: () => say(this, `item.${item.info.id}.name`),
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
    sfx(this, 'good');
    bin.bounce();
    burst(this, bin.x, bin.y - 60, [bin.color, 0xffffff]);
    const fact = say(this, `item.${item.info.id}.fact`);

    if (this.step < this.chain.actions.length) {
      // More changes to come: dip into the bin, then come back out to be changed.
      this.tweens.add({ targets: item, x: bin.x, y: bin.y - 40, scale: 0.55, duration: 350, ease: 'Quad.easeIn' });
      this.later(fact, () => this.offerChange(item));
      return;
    }

    const slot = bin.nextSlot();
    this.tweens.add({ targets: item, x: slot.x, y: slot.y, scale: 0.4, duration: 350, ease: 'Quad.easeIn' });
    this.later(fact, () => {
      this.time.delayedCall(400, () => this.nextChain());
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

  // Level 2: bring the item back and show the heat or cool button beside it.
  offerChange(item) {
    const action = this.chain.actions[this.step];
    const { emoji, color } = ACTIONS[action];
    this.tweens.add({ targets: item, x: SPAWN.x, y: SPAWN.y, scale: 1, duration: 450, ease: 'Back.easeOut' });

    const button = makeRoundButton(this, SPAWN.x + 380, SPAWN.y, 130, color, addEmoji(this, 0, 0, emoji, 140), () => {
      this.changeButton = null;
      button.destroy();
      this.change(item, action);
    });
    this.changeButton = button;
    button.setScale(0);
    this.tweens.add({ targets: button, scale: 1, duration: 350, delay: 300, ease: 'Back.easeOut' });
    this.tweens.add({ targets: button, angle: { from: -8, to: 8 }, duration: 400, yoyo: true, repeat: -1, delay: 700 });
    say(this, `level2.${action}`);
  }

  change(item, action) {
    const from = item.info;
    const to = this.chain.items[this.step + 1];
    this.step += 1;

    sfx(this, action === 'heat' ? 'good' : 'star');
    changeEffect(this, SPAWN.x, SPAWN.y, PLATE, action);
    this.tweens.add({ targets: item, angle: { from: -6, to: 6 }, duration: 90, yoyo: true, repeat: 7, onComplete: () => item.setAngle(0) });

    const oldArt = item.art;
    item.art = addItemArt(this, to, 0, 0).setAlpha(0);
    item.add(item.art);
    this.tweens.add({ targets: oldArt, alpha: 0, duration: 700, delay: 500, onComplete: () => oldArt.destroy() });
    this.tweens.add({
      targets: item.art,
      alpha: 1,
      duration: 700,
      delay: 500,
      onComplete: () => {
        item.info = to;
        item.misses = 0;
        this.input.enable(item);
        say(this, `change.${from.id}.${to.id}`);
      },
    });
  }

  finishRound() {
    const count = this.level === 2 ? this.config.level2.starsPerRound : this.config.starsPerRound;
    const wasUnlocked = this.level2Unlocked();
    addStars('sorter', count);
    const justUnlocked = !wasUnlocked && this.level2Unlocked();

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
      const level = this.level;
      // With a new game to offer, spread the buttons out to make room for it in the middle.
      const spread = justUnlocked ? 420 : 220;
      makeRoundButton(this, W / 2 - spread, H / 2 + 220, 140, 0x3ccf6e, addEmoji(this, 0, 0, '🔄', 130),
        () => this.scene.restart({ level })).setDepth(2001);
      makeRoundButton(this, W / 2 + spread, H / 2 + 220, 140, 0x4f7cff, addEmoji(this, 0, 0, '🏠', 130),
        () => this.goHome()).setDepth(2001);
      if (justUnlocked) this.showUnlock();
    });
  }

  showUnlock() {
    const button = makeRoundButton(this, W / 2, H / 2 + 220, 190, 0xff7a3d,
      [addEmoji(this, -60, 0, '🔥', 130), addEmoji(this, 65, 0, '❄️', 130)],
      () => this.scene.restart({ level: 2 }));
    button.setDepth(2001).setScale(0);
    this.tweens.add({ targets: button, scale: 1, duration: 450, ease: 'Back.easeOut' });
    this.tweens.add({ targets: button, angle: { from: -6, to: 6 }, duration: 350, yoyo: true, repeat: -1, delay: 500 });
    sfx(this, 'star');
    say(this, 'level2.unlocked');
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
