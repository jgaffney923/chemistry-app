import { W, H } from '../layout.js';
import { addItemArt } from '../art/items.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { burst, changeEffect } from '../ui/effects.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { addStars, tipShown, markTipShown } from '../systems/save.js';

const CARD = { x: W / 2, y: 470, w: 660, h: 340 };
const BIN = { w: 760, h: 520, y: 1150 };
const ART = 230;

// Can It Be Undone? Watch a change happen, guess which box it belongs in
// (can undo / can't undo), then the game tests it by trying to reverse it.
// A wrong guess isn't a failure: the test shows what really happens, and the
// card slides into the right box. Predict, then test.
export default class UndoScene extends Phaser.Scene {
  constructor() {
    super('Undo');
  }

  create() {
    const cfg = this.cache.json.get('changes');
    this.cfg = cfg;
    this.itemsById = Object.fromEntries(cfg.items.map((it) => [it.id, it]));
    this.generation = (this.generation || 0) + 1;
    this.events.once('shutdown', stopNarration);

    this.bins = [
      this.makeBin(W / 2 - 430, true, '🔄', 'Can undo', 0x3ccf6e),
      this.makeBin(W / 2 + 430, false, '➡️', "Can't undo", 0xf28c28),
    ];
    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu'));
    makeRoundButton(this, W - 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '💡', 90), () => this.explain());

    this.queue = pickRound(cfg.changes, cfg.roundSize);
    this.hand = null;
    this.handTimers = [];
    if (!tipShown('undo')) {
      markTipShown('undo');
      this.later(this.explain(), () => this.nextCard());
    } else {
      this.nextCard();
    }
  }

  // Runs `then` after a promise, unless the scene was left or restarted meanwhile.
  later(promise, then) {
    const gen = this.generation;
    promise.then(() => {
      if (gen === this.generation && this.sys.isActive()) then();
    });
  }

  // How the game works, with a hand pointing at each box in turn.
  explain() {
    this.clearHand();
    this.handTimers = [
      ...this.bins.map((bin, i) => this.time.delayedCall(2500 + i * 2200, () => this.pointAt(bin))),
      this.time.delayedCall(7200, () => this.clearHand()),
    ];
    return say(this, 'undo.intro');
  }

  makeBin(x, reversible, icon, label, color) {
    const bin = this.add.container(x, BIN.y);
    bin.add([
      this.add.rectangle(0, 10, BIN.w, BIN.h, 0x000000, 0.25),
      this.add.rectangle(0, 0, BIN.w, BIN.h, color).setStrokeStyle(10, 0x2b2350),
      addEmoji(this, 0, -150, icon, 130),
      addLabel(this, 0, -40, label, 72),
    ]);
    bin.reversible = reversible;
    bin.filled = 0;
    bin.setSize(BIN.w, BIN.h).setInteractive();
    bin.on('pointerup', () => say(this, reversible ? 'undo.binYes' : 'undo.binNo'));
    bin.contains = (px, py) => Math.abs(px - x) < BIN.w / 2 + 60 && Math.abs(py - BIN.y) < BIN.h / 2 + 80;
    return bin;
  }

  // --- One change at a time

  nextCard() {
    const change = this.queue.shift();
    if (!change) {
      this.finishRound();
      return;
    }
    const card = this.add.container(CARD.x, CARD.y);
    card.add(this.add.rectangle(0, 0, CARD.w, CARD.h, 0xfdf6e3).setStrokeStyle(8, 0x2b2350, 0.25));
    card.before = addItemArt(this, this.itemsById[change.before], 0, 0, ART + 40);
    card.add(card.before);
    card.change = change;
    this.current = card;
    card.setScale(0);
    this.tweens.add({ targets: card, scale: 1, duration: 350, ease: 'Back.easeOut' });

    // Show the change happening, then let the kid guess.
    this.later(say(this, `chg.${change.id}.do`), () => {
      this.act(card, change.do, card.before, () => this.showAfter(card));
    });
  }

  // Plays an action (heat, cool, stir, sun, wait) on the card with its icon.
  act(card, action, target, done) {
    const { emoji, effect } = this.cfg.actions[action];
    const icon = addEmoji(this, card.x + CARD.w / 2 + 70, card.y, emoji, 130).setDepth(1200).setScale(0);
    this.tweens.add({ targets: icon, scale: 1, duration: 250, ease: 'Back.easeOut' });
    if (effect === 'heat' || effect === 'cool') {
      changeEffect(this, card.x + target.x * card.scaleX, card.y, 130, effect);
      sfx(this, effect === 'heat' ? 'good' : 'star');
    } else if (effect === 'stir') {
      this.tweens.add({ targets: icon, angle: { from: -30, to: 30 }, duration: 150, yoyo: true, repeat: 4 });
      sfx(this, 'pop');
    } else {
      // Waiting: the clock spins round while time passes.
      this.tweens.add({ targets: icon, angle: 720, duration: 1100 });
      sfx(this, 'pop');
    }
    this.tweens.add({ targets: target, angle: { from: -4, to: 4 }, duration: 90, yoyo: true, repeat: 5, onComplete: () => target.setAngle(0) });
    this.time.delayedCall(1150, () => {
      this.tweens.add({ targets: icon, alpha: 0, duration: 250, onComplete: () => icon.destroy() });
      done();
    });
  }

  // Before (small) → after (big), then the card can be dragged into a box.
  showAfter(card) {
    const { change } = card;
    card.arrow = addLabel(this, 10, 0, '➜', 90, '#2b2350').setAlpha(0);
    card.after = addItemArt(this, this.itemsById[change.after], 170, 0, ART).setAlpha(0);
    card.add([card.arrow, card.after]);
    this.tweens.add({ targets: card.before, x: -190, scale: card.before.scale * 0.7, duration: 400 });
    this.tweens.add({ targets: [card.arrow, card.after], alpha: 1, duration: 400, delay: 150 });

    card.setInteractive(new Phaser.Geom.Rectangle(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h), Phaser.Geom.Rectangle.Contains);
    makeDraggable(this, card, {
      onTap: () => say(this, `chg.${change.id}.do`),
      onDrop: (x, y) => {
        const bin = this.bins.find((b) => b.contains(x, y));
        if (bin) this.test(card, bin);
        else returnTo(this, card, CARD.x, CARD.y);
      },
    });
    say(this, 'undo.ask');
  }

  // --- The test: try to reverse the change and see what happens.

  test(card, guessBin) {
    const { change } = card;
    card.disableInteractive();
    this.tweens.add({ targets: card, x: guessBin.x, y: guessBin.y - 330, scale: 0.8, duration: 300, ease: 'Quad.easeOut' });
    this.later(say(this, 'undo.test'), () => {
      this.act(card, change.undo, card.after, () => {
        if (change.reversible) {
          // It really goes back: the "after" picture turns back into the "before".
          const back = addItemArt(this, this.itemsById[change.undoTo], card.after.x, 0, ART).setAlpha(0);
          card.add(back);
          this.tweens.add({ targets: card.after, alpha: 0, duration: 500 });
          this.tweens.add({ targets: back, alpha: 1, duration: 500 });
          burst(this, card.x + 170 * card.scaleX, card.y, [0xffd84d, 0xffffff]);
        } else {
          // Nothing changes back: a little "nope" shake.
          this.tweens.add({ targets: card.after, x: card.after.x + 14, duration: 70, yoyo: true, repeat: 3 });
        }
        this.time.delayedCall(700, () => this.reveal(card, guessBin));
      });
    });
  }

  reveal(card, guessBin) {
    const { change } = card;
    const right = guessBin.reversible === change.reversible;
    const bin = right ? guessBin : this.bins.find((b) => b !== guessBin);
    sfx(this, right ? 'good' : 'boing');
    if (right) burst(this, bin.x, bin.y - 60, [0xffd84d, 0xffffff]);
    else this.tweens.add({ targets: card, x: bin.x, duration: 500, ease: 'Sine.easeInOut' });

    const told = say(this, right ? 'undo.right' : 'undo.surprise')
      .then(() => (this.sys.isActive() ? say(this, `chg.${change.id}.result`) : null));

    this.later(told, () => {
      // Tuck the card into its box and bring the next change.
      const slot = bin.filled++;
      this.tweens.add({
        targets: card,
        x: bin.x + ((slot % 3) - 1) * 230,
        y: bin.y + 110 + Math.floor(slot / 3) * 90,
        scale: 0.3,
        duration: 400,
        ease: 'Quad.easeIn',
      });
      this.time.delayedCall(500, () => this.nextCard());
    });
  }

  finishRound() {
    const count = this.cfg.starsPerRound;
    addStars('undo', count);
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setDepth(2000).setInteractive();
    for (let i = 0; i < count; i++) {
      const star = addEmoji(this, W / 2 + (i - (count - 1) / 2) * 300, H / 2 - 180, '⭐', 220).setDepth(2001).setScale(0);
      this.tweens.add({ targets: star, scale: 1, duration: 400, delay: i * 250, ease: 'Back.easeOut', onStart: () => sfx(this, 'star') });
    }
    this.later(say(this, 'undo.done'), () => {
      makeRoundButton(this, W / 2 - 220, H / 2 + 220, 140, 0x3ccf6e, addEmoji(this, 0, 0, '🔄', 130),
        () => this.scene.restart({})).setDepth(2001);
      makeRoundButton(this, W / 2 + 220, H / 2 + 220, 140, 0x4f7cff, addEmoji(this, 0, 0, '🏠', 130),
        () => this.scene.start('Menu')).setDepth(2001);
    });
  }

  pointAt(target) {
    this.removeHand();
    this.hand = addEmoji(this, target.x, target.y + BIN.h / 2 + 10, '👆', 120).setDepth(3000);
    this.tweens.add({ targets: this.hand, y: this.hand.y - 40, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  // Removes the hand and cancels any pointing still scheduled.
  clearHand() {
    this.handTimers?.forEach((t) => t.remove());
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

// Half can be undone and half can't, shuffled.
function pickRound(changes, size) {
  const half = Math.floor(size / 2);
  const pick = (rev) => Phaser.Utils.Array.Shuffle(changes.filter((c) => c.reversible === rev)).slice(0, half);
  return Phaser.Utils.Array.Shuffle([...pick(true), ...pick(false)]);
}
