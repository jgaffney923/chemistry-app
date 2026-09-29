import { W, H } from '../layout.js';
import { Atom, bondLength } from '../builder/Atom.js';
import { moleculeShape, drawMolecule, drawBond } from '../builder/shapes.js';
import { makeAtom } from '../art/atoms.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { burst } from '../ui/effects.js';
import { makeDraggable } from '../systems/drag.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { addMolecule, hasMolecule, isBuilderIntroSeen, markBuilderIntroSeen, tipShown, markTipShown } from '../systems/save.js';

const TRAY_TOP = 1290;
const TRAY_Y = 1410;
const CARD_Y = 150;
const JOIN_REACH = 150; // how close (beyond touching) a dropped atom must be to join
const BREAK_STRETCH = 230; // how far past bond length a pull breaks the bond
const MAX_ATOMS = 30;

// Molecule Builder: drag atoms from the tray; drop one near another to join them.
// Pull an atom away to break its bonds. Two joined atoms that both still have a
// free spot get a + button on their bond: tap it (or push them together) for a
// double bond. When every bond spot in a molecule is used, it's complete: named
// molecules snap into their real shape and fly into their recipe card.
// The first visit is guided: build water.
export default class BuilderScene extends Phaser.Scene {
  constructor() {
    super('Builder');
  }

  create() {
    const { atoms, tray, molecules } = this.cache.json.get('molecules');
    this.atomInfo = atoms;
    this.molecules = molecules;
    this.atoms = new Set();
    this.announced = new Set();
    this.plusButtons = new Map();
    this.nextId = 0;
    this.dragging = false;
    this.events.once('shutdown', stopNarration);

    this.bondLines = this.add.graphics().setDepth(5);
    this.events.on('update', this.redraw, this);
    this.events.once('shutdown', () => this.events.off('update', this.redraw, this));

    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu'));
    makeRoundButton(this, W - 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🧹', 90), () => this.clearBoard());
    this.buildCards();
    this.buildTray(tray);

    this.hand = null;
    this.guide = isBuilderIntroSeen() ? null : { step: 'placeO' };
    if (this.guide) {
      say(this, 'builder.intro');
      this.pointAt(this.trayAtoms.O);
    }
  }

  redraw(time) {
    this.bondLines.clear();
    for (const atom of this.atoms) {
      for (const [other, order] of atom.bonds) {
        if (atom.x < other.x || (atom.x === other.x && atom.y < other.y)) drawBond(this.bondLines, atom, other, order, 16, 22);
      }
      atom.drawNubs(time);
    }
    this.syncPlusButtons(time);
  }

  // A + sits on every bond whose two atoms both still have a free spot.
  // Tapping it joins them once more (a double bond). Hidden while dragging.
  syncPlusButtons(time) {
    const wanted = new Map();
    if (!this.dragging) {
      for (const a of this.atoms) {
        for (const [b, order] of a.bonds) {
          if (a.id < b.id && !a.done && order < 3 && a.free() > 0 && b.free() > 0) wanted.set(`${a.id}-${b.id}`, [a, b]);
        }
      }
    }
    for (const [key, button] of this.plusButtons) {
      if (!wanted.has(key)) {
        button.destroy();
        this.plusButtons.delete(key);
      }
    }
    for (const [key, [a, b]] of wanted) {
      const button = this.plusButtons.get(key) || this.makePlus(key, a, b);
      button.setPosition((a.x + b.x) / 2, (a.y + b.y) / 2).setScale(1 + Math.sin(time / 180) * 0.08);
    }
  }

  makePlus(key, a, b) {
    const button = this.add.container(0, 0).setDepth(12);
    button.add([
      this.add.circle(0, 0, 38, 0xffe066).setStrokeStyle(6, 0x2b2350),
      addLabel(this, 0, -3, '+', 70, '#2b2350'),
    ]);
    button.setInteractive(new Phaser.Geom.Circle(0, 0, 75), Phaser.Geom.Circle.Contains);
    button.on('pointerup', () => {
      if (this.strengthen(a, b)) this.checkComplete(a);
    });
    this.plusButtons.set(key, button);

    // The first + ever: explain double bonds, with a hand pointing at it.
    if (!tipShown('plus') && !this.guide) {
      markTipShown('plus');
      say(this, 'builder.plusTip');
      this.pointAt({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, 'below');
      this.time.delayedCall(5000, () => this.clearHand());
    }
    return button;
  }

  // --- Recipe cards: the molecules to make, drawn in their real shapes.

  buildCards() {
    this.cards = {};
    this.molecules.forEach((mol, i) => {
      const x = 450 + i * 290;
      const card = this.add.container(x, CARD_Y);
      const bg = this.add.rectangle(0, 0, 250, 220, 0xffffff, 0.1).setStrokeStyle(6, 0xffffff, 0.35);
      const pic = drawMolecule(this, mol, this.atomInfo, 0, -18, 0.26);
      const label = addLabel(this, 0, 86, mol.label, 40);
      card.add([bg, pic, label]);
      card.setSize(250, 220).setInteractive();
      card.on('pointerup', () => say(this, `recipe.${mol.id}`));
      card.pic = pic;
      card.label = label;
      this.cards[mol.id] = card;
      this.markCard(mol.id, hasMolecule(mol.id));
    });
  }

  markCard(id, made) {
    const card = this.cards[id];
    card.pic.setAlpha(made ? 1 : 0.35);
    card.label.setAlpha(made ? 1 : 0.35);
    if (made && !card.check) {
      card.check = addEmoji(this, 95, -85, '✅', 60);
      card.add(card.check);
    }
  }

  // --- Tray: an endless supply of each atom.

  buildTray(tray) {
    this.add.rectangle(W / 2, (TRAY_TOP + H) / 2, W, H - TRAY_TOP, 0xffffff, 0.06).setStrokeStyle(6, 0xffffff, 0.2);
    this.trayAtoms = {};
    tray.forEach((symbol, i) => {
      const x = W / 2 + (i - (tray.length - 1) / 2) * 400;
      const info = this.atomInfo[symbol];
      const atom = this.add.container(x, TRAY_Y);
      atom.add(makeAtom(this, 0, 0, info.element, info.radius));
      atom.setInteractive(new Phaser.Geom.Circle(0, 0, Math.max(info.radius + 20, 100)), Phaser.Geom.Circle.Contains);
      this.trayAtoms[symbol] = atom;
      makeDraggable(this, atom, {
        onTap: () => say(this, `atom.${symbol}`),
        onDrop: (x2, y2) => {
          atom.setPosition(x, TRAY_Y).setDepth(0).setScale(0);
          this.tweens.add({ targets: atom, scale: 1, duration: 250, ease: 'Back.easeOut' });
          if (y2 < TRAY_TOP && this.atoms.size < MAX_ATOMS) this.placeNew(symbol, x2, y2);
        },
      });
    });
  }

  placeNew(symbol, x, y) {
    const atom = new Atom(this, x, Math.max(y, 330), symbol, this.atomInfo[symbol]);
    atom.id = this.nextId++;
    this.atoms.add(atom);
    sfx(this, 'pop');
    makeDraggable(this, atom, {
      onPickUp: () => { this.dragging = true; },
      onTap: () => say(this, `atom.${symbol}`),
      onDrop: () => {
        this.dragging = false;
        this.dropped(atom);
      },
    });
    this.dropped(atom);
    if (this.guide?.step === 'placeO' && symbol === 'O') {
      this.guide.step = 'addH';
      say(this, 'builder.addH');
      this.pointAt(this.trayAtoms.H);
    }
  }

  // --- The bonding rules, applied whenever an atom is let go.

  dropped(atom) {
    atom.setDepth(10);
    if (atom.y > TRAY_TOP) {
      this.removeAtom(atom);
      return;
    }

    let changed = false;
    for (const [other, order] of [...atom.bonds]) {
      const d = Phaser.Math.Distance.Between(atom.x, atom.y, other.x, other.y);
      if (d < atom.radius + other.radius + 20) {
        // Pushed up against a partner (touching counts): join them once more.
        if (this.strengthen(atom, other)) changed = true;
        this.moveTo(atom, other);
      } else if (d > bondLength(atom, other) + BREAK_STRETCH) {
        this.setBond(atom, other, 0);
        sfx(this, 'boing');
        say(this, 'builder.broken');
        changed = true;
      }
    }

    const target = this.nearestPartner(atom);
    if (target && target.free() > 0 && atom.free() > 0) {
      const alone = atom.bonds.size === 0;
      this.setBond(atom, target, 1);
      sfx(this, 'pop');
      if (alone) this.moveTo(atom, target);
      changed = true;
      this.guideJoined(atom, target);
    } else if (target) {
      say(this, 'builder.full');
    } else if (atom.bonds.size === 1) {
      // Let go at a stretch: spring back to a normal bond length.
      this.moveTo(atom, [...atom.bonds.keys()][0]);
    }

    if (changed) this.checkComplete(atom);
  }

  // The closest atom in another molecule that this one is near enough to join.
  nearestPartner(atom) {
    const mine = atom.group();
    let best = null, bestD = Infinity;
    for (const other of this.atoms) {
      if (mine.has(other) || other.done) continue;
      const d = Phaser.Math.Distance.Between(atom.x, atom.y, other.x, other.y);
      if (d < atom.radius + other.radius + JOIN_REACH && d < bestD) {
        best = other;
        bestD = d;
      }
    }
    return best;
  }

  // Adds one more bond between two joined atoms, if both have a free spot.
  strengthen(a, b) {
    const order = a.bonds.get(b);
    if (!order || order >= 3 || a.free() === 0 || b.free() === 0) return false;
    this.setBond(a, b, order + 1);
    sfx(this, 'good');
    burst(this, (a.x + b.x) / 2, (a.y + b.y) / 2, [0xffe066, 0xffffff]);
    say(this, order + 1 === 2 ? 'builder.double' : 'builder.triple');
    return true;
  }

  setBond(a, b, order) {
    if (order > 0) {
      a.bonds.set(b, order);
      b.bonds.set(a, order);
    } else {
      a.bonds.delete(b);
      b.bonds.delete(a);
    }
  }

  // Slides `atom` to a normal bond length from `anchor`, keeping its direction.
  moveTo(atom, anchor) {
    let angle = Math.atan2(atom.y - anchor.y, atom.x - anchor.x);
    if (atom.x === anchor.x && atom.y === anchor.y) angle = 0;
    const len = bondLength(atom, anchor);
    this.tweens.add({
      targets: atom,
      x: Phaser.Math.Clamp(anchor.x + Math.cos(angle) * len, 120, W - 120),
      y: Phaser.Math.Clamp(anchor.y + Math.sin(angle) * len, 330, TRAY_TOP - 90),
      duration: 220,
      ease: 'Back.easeOut',
    });
  }

  removeAtom(atom) {
    for (const other of [...atom.bonds.keys()]) this.setBond(atom, other, 0);
    this.atoms.delete(atom);
    this.tweens.killTweensOf(atom);
    this.tweens.add({ targets: atom, scale: 0, alpha: 0, duration: 200, onComplete: () => atom.destroy() });
    sfx(this, 'pop');
  }

  clearBoard() {
    for (const atom of [...this.atoms]) this.removeAtom(atom);
    say(this, 'builder.cleared');
  }

  // --- Finished molecules

  checkComplete(atom) {
    const group = [...atom.group()];
    if (group.length < 2 || group.some((a) => a.free() > 0)) return;

    const counts = {};
    for (const a of group) counts[a.symbol] = (counts[a.symbol] || 0) + 1;
    const molecule = this.molecules.find((m) => sameFormula(m.formula, counts));
    if (molecule) {
      this.celebrate(group, molecule);
      return;
    }
    // Complete, but not one on the list: praise it without inventing a name.
    const key = Object.entries(counts).sort().map(([s, n]) => s + n).join('');
    burst(this, atom.x, atom.y, [0xffd84d, 0xffffff]);
    sfx(this, 'star');
    if (!this.announced.has(key)) {
      this.announced.add(key);
      say(this, 'builder.complete');
    }
  }

  celebrate(group, molecule) {
    if (!this.guide) this.clearHand();
    group.forEach((a) => {
      a.done = true;
      a.disableInteractive();
    });
    const center = group.reduce((c, a) => ({ x: c.x + a.x / group.length, y: c.y + a.y / group.length }), { x: 0, y: 0 });
    center.x = Phaser.Math.Clamp(center.x, 450, W - 450);
    center.y = Phaser.Math.Clamp(center.y, 560, TRAY_TOP - 300);

    // Snap into the real shape.
    let lowest = center.y;
    for (const [a, spot] of assignToShape(group, moleculeShape(molecule, this.atomInfo))) {
      const y = center.y + spot.uy * spot.len;
      lowest = Math.max(lowest, y + a.radius);
      this.tweens.add({ targets: a, x: center.x + spot.ux * spot.len, y, duration: 500, ease: 'Back.easeOut' });
    }
    // Everything that says "done!" happens right away; the voice explains while it shows.
    sfx(this, 'star');
    burst(this, center.x, center.y, [0xffd84d, 0xffffff, 0x8fd3ff]);
    const label = addLabel(this, center.x, lowest + 70, molecule.label, 72, '#ffd84d').setDepth(20).setAlpha(0);
    this.tweens.add({ targets: label, alpha: 1, duration: 300, delay: 200 });

    const firstTime = !hasMolecule(molecule.id);
    addMolecule(molecule.id);
    const card = this.cards[molecule.id];
    this.markCard(molecule.id, true);
    this.tweens.add({ targets: card, scale: 1.15, duration: 150, yoyo: true, repeat: 1 });
    const told = say(this, `mol.${molecule.id}`);

    // After a short look, the molecule flies into its card (the voice keeps going).
    this.time.delayedCall(2200, () => {
      label.destroy();
      // Skip any atoms the broom already cleared away.
      group.filter((a) => this.atoms.has(a)).forEach((a) => {
        this.atoms.delete(a);
        for (const other of [...a.bonds.keys()]) this.setBond(a, other, 0);
        this.tweens.add({
          targets: a, x: card.x, y: card.y, scale: 0.2, alpha: 0, duration: 600, ease: 'Quad.easeIn',
          onComplete: () => a.destroy(),
        });
      });
    });

    told.then(() => {
      if (!this.sys.isActive()) return;
      if (this.guide) this.finishGuide();
      else if (firstTime && this.molecules.every((m) => hasMolecule(m.id))) say(this, 'builder.allMade');
    });
  }

  // --- First visit: build water.

  guideJoined(a, b) {
    if (this.guide?.step !== 'addH') return;
    const pair = [a.symbol, b.symbol].sort().join('');
    if (pair === 'HO') {
      this.guide.step = 'addH2';
      if ([a, b].find((x) => x.symbol === 'O').free() > 0) say(this, 'builder.addH2');
    }
  }

  finishGuide() {
    this.guide = null;
    this.clearHand();
    markBuilderIntroSeen();
    say(this, 'builder.free');
  }

  // Points from the right (tray atoms), or up from below (things between atoms).
  pointAt(target, from = 'right') {
    this.clearHand();
    const below = from === 'below';
    this.hand = addEmoji(this, target.x + (below ? 0 : 150), target.y + (below ? 150 : 0), below ? '👆' : '👈', 120).setDepth(3000);
    const nudge = below ? { y: this.hand.y + 40 } : { x: this.hand.x + 40 };
    this.tweens.add({ targets: this.hand, ...nudge, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  clearHand() {
    if (!this.hand) return;
    this.tweens.killTweensOf(this.hand);
    this.hand.destroy();
    this.hand = null;
  }
}

function sameFormula(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => (a[k] || 0) === (b[k] || 0));
}

// Matches each atom to a spot in the shape: the center atom to the center, the
// others to the nearest free spot by angle, so atoms don't cross over.
function assignToShape(group, shape) {
  const result = new Map();
  const spots = shape.atoms.map((s) => ({ ...s }));
  const centerSpot = spots.find((s) => s.ux === 0 && s.uy === 0);
  let center = null;
  if (centerSpot) {
    center = group.find((a) => a.symbol === centerSpot.symbol && a.bonds.size === spots.length - 1)
      || group.find((a) => a.symbol === centerSpot.symbol);
    result.set(center, { ...centerSpot, len: 0 });
  }
  const cx = center ? center.x : group.reduce((s, a) => s + a.x, 0) / group.length;
  const cy = center ? center.y : group.reduce((s, a) => s + a.y, 0) / group.length;
  const open = spots.filter((s) => s !== centerSpot);
  for (const a of group.filter((g) => g !== center)) {
    const angle = Math.atan2(a.y - cy, a.x - cx);
    let best = null, bestGap = Infinity;
    for (const s of open) {
      if (s.symbol !== a.symbol) continue;
      const gap = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(s.uy, s.ux) - angle));
      if (gap < bestGap) {
        bestGap = gap;
        best = s;
      }
    }
    open.splice(open.indexOf(best), 1);
    const partner = center || group.find((g) => g !== a);
    result.set(a, { ...best, len: bondLength(a, partner) });
  }
  return result;
}
