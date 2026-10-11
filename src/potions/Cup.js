import { Beaker } from '../lab/Beaker.js';
import { addLabel } from '../ui/emoji.js';

const { IntegerToColor, GetColor, Interpolate } = Phaser.Display.Color;

function blend(from, to, progress) {
  const { r, g, b } = Interpolate.ColorWithColor(IntegerToColor(from), IntegerToColor(to), 100, Math.round(progress * 100));
  return GetColor(r, g, b);
}

// A small Lab beaker full of cabbage juice that can change color.
// kind: juice | acid | neutral | base | mixed (or empty while it waits to refill).
export class Cup extends Beaker {
  constructor(scene, x, y, juice) {
    super(scene, x, y);
    this.setScale(0.5);
    this.juice = juice;
    this.home = { x, y };
    this.kind = 'juice';
    this.color = juice;
    this.water.setFillStyle(juice, 0.9);
    this.setSize(440, 600).setInteractive();
    this.tag = addLabel(scene, x, y + 200, '', 48).setBackgroundColor('#2b2350').setPadding(16, 4).setVisible(false);
  }

  contains(x, y) {
    return Math.abs(x - this.x) < 150 && y > this.y - 260 && y < this.y + 200;
  }

  setEnabled(on) {
    if (this.input) this.input.enabled = on;
  }

  settleScale() {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({ targets: this, scale: 0.5, duration: 100 });
  }

  // Fades the juice to a new color, passing through `via` first if given.
  tintTo(color, ms, via = null) {
    const from = this.color;
    this.color = color;
    this.tintTween?.stop();
    if (color === from && !via) return;
    const progress = { t: 0 };
    this.tintTween = this.scene.tweens.add({
      targets: progress,
      t: 1,
      duration: ms,
      onUpdate: () => {
        const t = progress.t;
        const shade = via ? (t < 0.5 ? blend(from, via, t * 2) : blend(via, color, (t - 0.5) * 2)) : blend(from, color, t);
        this.water.setFillStyle(shade, 0.9);
      },
      onComplete: () => this.water.setFillStyle(color, 0.9),
    });
  }

  empty(ms = 900) {
    this.kind = 'empty';
    this.setTag('');
    this.scene.tweens.add({ targets: this.water, alpha: 0, duration: ms });
  }

  refill() {
    this.pour(this.juice);
    if (this.kind === 'empty') {
      this.tintTween?.stop();
      this.water.setFillStyle(this.juice, 0.9);
      this.scene.tweens.add({ targets: this.water, alpha: { from: 0, to: 1 }, duration: 600, delay: 400 });
    } else {
      this.tintTo(this.juice, 800);
    }
    this.kind = 'juice';
    this.color = this.juice;
    this.setTag('');
  }

  setTag(word) {
    this.tag.setText(word).setVisible(word !== '');
  }
}
