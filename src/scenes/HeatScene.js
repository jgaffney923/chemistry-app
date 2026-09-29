import { W } from '../layout.js';
import { Thermometer } from '../heat/Thermometer.js';
import { ParticleView } from '../heat/ParticleView.js';
import { addItemArt } from '../art/items.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { burst } from '../ui/effects.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { addHeatFound, heatFound, heatFoundCount, tipShown, markTipShown } from '../systems/save.js';

const THERMO = { x: 380, top: 330, bottom: 1230 };
const REAL = { x: 1000, y: 620, size: 360 };
const ZOOM = { x: 1590, y: 620, r: 300 };
const PICKER_Y = 1300;
const MARGIN = 0.012; // how far past a melting/boiling point before it changes (no flicker)
const STATE_STYLE = {
  solid: { label: 'Solid', color: '#6f98ff' },
  liquid: { label: 'Liquid', color: '#3fd0e3' },
  gas: { label: 'Gas', color: '#c3a2ff' },
};
const CHANGE_KIND = { 'solid>liquid': 'melt', 'liquid>solid': 'freeze', 'liquid>gas': 'boil', 'gas>liquid': 'condense' };

// Heat Slider: drag a thermometer and watch one material two ways at once: as
// you'd see it, and "up close" as moving particles. Warmer means faster
// particles; past its melting or boiling point a material changes state. Each
// melting and boiling point gets a little marker on the thermometer, so kids
// can see that different things change at different temperatures.
export default class HeatScene extends Phaser.Scene {
  constructor() {
    super('Heat');
  }

  create() {
    this.cfg = this.cache.json.get('heat');
    this.itemsById = Object.fromEntries(this.cfg.items.map((it) => [it.id, it]));
    this.events.once('shutdown', stopNarration);

    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu'));
    makeRoundButton(this, 350, 130, 90, 0xffffff, addEmoji(this, 0, 0, '💡', 90), () => this.hint());
    this.counter = addLabel(this, W - 60, 130, '', 64, '#ffd84d').setOrigin(1, 0.5);
    this.updateCounter();

    this.thermo = new Thermometer(this, THERMO.x, THERMO.top, THERMO.bottom, this.cfg.marks, (v) => this.setTemp(v));
    this.pins = this.add.container(0, 0);
    this.drawPins();

    // The real-world view and the up-close view, side by side.
    this.add.circle(REAL.x, REAL.y, 250, 0xfdf6e3).setStrokeStyle(10, 0x2b2350, 0.3);
    this.stateLabel = addLabel(this, REAL.x, REAL.y + 330, '', 84);
    this.zoom = new ParticleView(this, ZOOM.x, ZOOM.y, ZOOM.r);
    addLabel(this, ZOOM.x, ZOOM.y + 350, 'Up close', 48).setAlpha(0.8);
    addEmoji(this, (REAL.x + ZOOM.x) / 2, REAL.y, '🔍', 90);
    const tick = (time, delta) => this.zoom.step(time, delta / 1000);
    this.events.on('update', tick);
    this.events.once('shutdown', () => this.events.off('update', tick));

    this.buildPicker();
    this.hand = null;
    this.select('water', false);

    if (!tipShown('heat')) {
      markTipShown('heat');
      this.guide = true;
      say(this, 'heat.intro');
      this.pointAt({ x: THERMO.x + 150, y: THERMO.bottom - 40 });
      this.thermo.handle.once('dragstart', () => this.clearHand());
    } else {
      say(this, 'heat.pick.water');
    }
  }

  // --- Choosing what to heat

  buildPicker() {
    this.pickButtons = {};
    Object.entries(this.cfg.materials).forEach(([id, mat], i) => {
      const x = 760 + i * 280;
      const ring = this.add.circle(x, PICKER_Y, 110).setStrokeStyle(12, 0xffe066).setVisible(false);
      const button = makeRoundButton(this, x, PICKER_Y, 90, 0xfdf6e3,
        addItemArt(this, this.itemsById[mat.icon], 0, 0, 130), () => this.select(id));
      addLabel(this, x, PICKER_Y + 135, mat.label, 40);
      this.pickButtons[id] = { button, ring };
    });
  }

  // A fresh start: the chosen material, cold and solid.
  select(id, speak = true) {
    this.material = id;
    this.mat = this.cfg.materials[id];
    for (const [key, { ring }] of Object.entries(this.pickButtons)) ring.setVisible(key === id);
    this.state = 'solid';
    this.zoom.setMaterial(Number(this.mat.color));
    this.showArt('solid', false);
    this.thermo.setValue(this.cfg.start, true);
    this.zoom.temp = this.cfg.start;
    if (speak) say(this, `heat.pick.${id}`);
  }

  showArt(state, animate = true) {
    const old = this.art;
    this.art = addItemArt(this, this.itemsById[this.mat.art[state]], REAL.x, REAL.y, REAL.size);
    const style = STATE_STYLE[state];
    this.stateLabel.setText(style.label).setColor(style.color);
    if (!animate) {
      old?.destroy();
      return;
    }
    this.art.setAlpha(0);
    this.tweens.add({ targets: this.art, alpha: 1, duration: 500 });
    if (old) this.tweens.add({ targets: old, alpha: 0, duration: 500, onComplete: () => old.destroy() });
    this.tweens.add({ targets: this.stateLabel, scale: { from: 1.3, to: 1 }, duration: 300 });
  }

  // --- Temperature and changes of state

  setTemp(value) {
    this.zoom.temp = value;
    const { melt, boil } = this.mat;
    // Step through each point crossed, so a big jump (a tap high on the tube)
    // still passes through liquid on its way to gas.
    const steps = [];
    let state = this.state;
    for (;;) {
      let next = null;
      if (state === 'solid' && value > melt + MARGIN) next = 'liquid';
      else if (state === 'liquid' && value < melt - MARGIN) next = 'solid';
      else if (state === 'liquid' && boil && value > boil + MARGIN) next = 'gas';
      else if (state === 'gas' && value < boil - MARGIN) next = 'liquid';
      if (!next) break;
      steps.push([state, next]);
      state = next;
    }
    if (!steps.length) return;
    this.state = state;
    this.zoom.setState(state);
    this.showArt(state);
    sfx(this, 'good');
    const kinds = steps.map(([from, to]) => CHANGE_KIND[`${from}>${to}`]);
    kinds.forEach((kind) => this.discover(`${this.material}.${kind}`));
    // Explain the last change (the one the kid ends up looking at).
    const last = `${this.material}.${kinds[kinds.length - 1]}`;
    const told = say(this, `heat.${last}`);
    this.compareIfNew(told, kinds);
  }

  discover(id) {
    if (!addHeatFound(id)) return;
    burst(this, ZOOM.x, ZOOM.y, [0xffd84d, 0xffffff]);
    sfx(this, 'star');
    this.updateCounter();
    this.drawPins();
    if (this.guide) {
      this.guide = false;
      this.clearHand();
    }
  }

  // The first time chocolate or butter melts after ice has, point out the markers.
  compareIfNew(told, kinds) {
    const id = this.material;
    if (id === 'water' || !kinds.includes('melt') || !heatFound('water.melt') || tipShown(`heat.compare.${id}`)) return;
    markTipShown(`heat.compare.${id}`);
    told.then(() => {
      if (!this.sys.isActive()) return;
      say(this, `heat.compare.${id}`);
      // Pulse each marker relative to its own size.
      this.pins.each((pin) => {
        const s = pin.scaleX;
        this.tweens.add({ targets: pin, scaleX: { from: s * 1.4, to: s }, scaleY: { from: s * 1.4, to: s }, duration: 400, repeat: 2 });
      });
    });
  }

  // Little pictures on the thermometer where each thing has melted or boiled.
  drawPins() {
    this.pins.removeAll(true);
    for (const [id, mat] of Object.entries(this.cfg.materials)) {
      const points = [[`${id}.melt`, mat.melt, mat.art.solid]];
      if (mat.boil) points.push([`${id}.boil`, mat.boil, mat.art.liquid]);
      for (const [found, t, art] of points) {
        if (!heatFound(found)) continue;
        const y = this.thermo.yFor(t);
        // Butter and chocolate melt close together: nudge them apart sideways.
        const x = THERMO.x + 110 + (id === 'chocolate' ? 95 : 0);
        this.pins.add([
          this.add.rectangle(THERMO.x + 55, y, x - THERMO.x - 55, 5, 0xffffff, 0.7).setOrigin(0, 0.5),
          addItemArt(this, this.itemsById[art], x + 40, y, 80),
        ]);
      }
    }
  }

  updateCounter() {
    this.counter.setText(`🌡️ ${heatFoundCount()} / ${this.cfg.changes.length}`);
  }

  // --- Help

  hint() {
    const next = this.cfg.changes.find((c) => !heatFound(c.id));
    if (!next) {
      say(this, 'heat.allFound');
      return;
    }
    say(this, `heat.hint.${next.id}`);
    const target = next.material === this.material
      ? { x: THERMO.x + 150, y: this.thermo.yFor(this.thermo.value) }
      : { x: this.pickButtons[next.material].button.x + 150, y: PICKER_Y };
    this.pointAt(target);
    this.time.delayedCall(3500, () => this.clearHand());
  }

  pointAt(target) {
    this.clearHand();
    this.hand = addEmoji(this, target.x, target.y, '👈', 120).setDepth(3000);
    this.tweens.add({ targets: this.hand, x: this.hand.x + 40, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  clearHand() {
    if (!this.hand) return;
    this.tweens.killTweensOf(this.hand);
    this.hand.destroy();
    this.hand = null;
  }
}
