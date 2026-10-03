import { W } from '../layout.js';
import { toolArt, grainArt, vessel, waterArt, prepareUnmixArt } from '../unmix/art.js';
import { addItemArt } from '../art/items.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { makeDraggable, returnTo } from '../systems/drag.js';
import { openStickerBook } from '../lab/StickerBook.js';
import { say, sfx, stopNarration } from '../systems/audio.js';
import { burst } from '../ui/effects.js';
import { hasUnmixSticker, addUnmixSticker, unmixStickerCount, tipShown, markTipShown } from '../systems/save.js';

const SOURCE = { x: 1024, y: 790 };
const TOOL_Y = 1250;

export default class UnmixScene extends Phaser.Scene {
  constructor() {
    super('Unmix');
  }

  create() {
    this.cfg = this.cache.json.get('unmix');
    prepareUnmixArt(this);
    this.itemsById = Object.fromEntries(this.cfg.items.map(item => [item.id, item]));
    this.events.once('shutdown', stopNarration);
    this.events.once('shutdown', () => this.clearHand());
    this.guide = !tipShown('unmix');
    this.phase = 'ready';
    this.hand = null;
    this.book = null;
    this.actionVoice = null;
    this.tools = {};
    this.pickers = {};
    this.experiment = null;
    this.zoomLayer = null;

    makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => this.scene.start('Menu', {}));
    makeRoundButton(this, 350, 130, 90, 0xffffff, addEmoji(this, 0, 0, '💡', 90), () => this.hint());
    makeRoundButton(this, 570, 130, 90, 0xffffff, addEmoji(this, 0, 0, '📖', 90), () => {
      if (this.book?.active) return;
      this.actionVoice = null;
      this.book = openStickerBook(this, this.cfg.stickers, this.itemsById, {
        hasSticker: hasUnmixSticker, narrationPrefix: 'unmix.disc', intro: 'unmix.stickers',
      });
    });
    addLabel(this, 1100, 130, 'Unmix!', 96);
    this.counter = addLabel(this, W - 80, 130, '', 64, '#ffd84d').setOrigin(1, 0.5);
    this.updateCounter();

    this.cfg.mixtures.forEach((mixture, index) => {
      const x = 424 + index * 300;
      const ring = this.add.circle(x, 350, 105).setStrokeStyle(10, 0xffd84d);
      const button = makeRoundButton(this, x, 350, 90, 0xfdf6e3,
        addItemArt(this, this.itemsById[mixture.icon], 0, 0, 125), () => this.select(mixture.id));
      addLabel(this, x, 480, mixture.short, 44);
      this.pickers[mixture.id] = { button, ring };
    });
    this.title = addLabel(this, SOURCE.x, 560, '', 64);
    this.buildTools();
    makeRoundButton(this, SOURCE.x, 1070, 80, 0xffffff, addLabel(this, 0, 0, '↺', 100, '#352d4d'), () => {
      if (this.phase !== 'busy') this.select(this.mixture.id, false);
    });
    this.zoomButton = makeRoundButton(this, 1780, 760, 100, 0xffffff, addEmoji(this, 0, 0, '🔍', 100), () => this.inspect());
    this.select(this.cfg.mixtures[0].id, false);
    if (this.guide) {
      say(this, 'unmix.intro');
      this.pointAt(this.tools.filter.x, TOOL_Y - 180);
    } else say(this, 'unmix.welcome');
  }

  buildTools() {
    this.cfg.tools.forEach((tool, index) => {
      const x = 304 + index * 360;
      const button = this.add.container(x, TOOL_Y);
      button.add([this.add.circle(0, 0, 110, Number(tool.color)), toolArt(this, tool.id)]);
      button.setInteractive(new Phaser.Geom.Circle(0, 0, 110), Phaser.Geom.Circle.Contains);
      addLabel(this, x, TOOL_Y + 170, tool.label, 44);
      makeDraggable(this, button, {
        onTap: () => this.useTool(tool.id),
        onPickUp: () => this.clearHand(),
        onDrop: (dropX, dropY) => {
          returnTo(this, button, x, TOOL_Y);
          if (Math.abs(dropX - SOURCE.x) < 380 && Math.abs(dropY - SOURCE.y) < 260) this.useTool(tool.id);
          else if (this.phase === 'ready') this.pointAt(SOURCE.x + 320, SOURCE.y);
        },
      });
      this.tools[tool.id] = button;
    });
  }

  select(id, speak = true) {
    if (this.phase === 'busy' || this.book?.active) return;
    const mixture = this.cfg.mixtures.find(entry => entry.id === id);
    if (!mixture) return;
    this.actionVoice = null;
    this.clearHand();
    this.zoomLayer?.destroy();
    this.zoomLayer = null;
    this.experiment?.destroy();
    this.experiment = this.add.container(0, 0);
    this.mixture = mixture;
    this.phase = 'ready';
    this.title.setText(mixture.label);
    for (const [key, picker] of Object.entries(this.pickers)) picker.ring.setVisible(key === id);
    this.zoomButton.setVisible(mixture.parts.includes('salt'));
    this.source = vessel(this, SOURCE.x, SOURCE.y);
    this.experiment.add(this.source);
    this.water = null;
    this.grains = [];
    if (mixture.parts.includes('water')) {
      this.water = waterArt(this, 0, 40);
      this.source.addAt(this.water, 0);
    }
    for (const kind of mixture.parts.filter(part => part !== 'water')) {
      const count = kind === 'sand' ? 28 : 12;
      for (let index = 0; index < count; index++) {
        const x = -170 + (index % 7) * 53;
        const y = kind === 'cork' ? -55 : 70 + Math.floor(index / 7) * 18;
        const grain = grainArt(this, kind, x, y);
        grain.setVisible(kind !== 'salt');
        this.source.add(grain);
        this.grains.push({ kind, grain });
      }
    }
    if (speak) say(this, `unmix.pick.${id}`);
    if (this.guide) this.pointAt(this.tools[mixture.tool].x, TOOL_Y - 180);
  }

  useTool(id) {
    if (this.phase !== 'ready' || this.book?.active) return;
    if (!this.cfg.tools.some(tool => tool.id === id)) return;
    this.clearHand();
    this.zoomLayer?.destroy();
    this.zoomLayer = null;
    if (id !== this.mixture.tool) {
      const special = this.mixture.id === 'evaporate' && id === 'filter';
      say(this, special ? 'unmix.filterSalt' : `unmix.try.${id}`);
      const probe = toolArt(this, id, SOURCE.x, SOURCE.y - 170, 1.5);
      this.experiment.add(probe);
      this.phase = 'busy';
      this.tweens.add({ targets: probe, y: SOURCE.y - 120, duration: 450, yoyo: true, repeat: 1,
        onComplete: () => {
          probe.destroy();
          this.phase = 'ready';
          if (this.guide) this.pointAt(this.tools[this.mixture.tool].x, TOOL_Y - 180);
        },
      });
      return;
    }
    this.phase = 'busy';
    this.actionVoice = say(this, `unmix.action.${id}`);
    const activeTool = toolArt(this, id, SOURCE.x, SOURCE.y - 210, 1.6);
    this.experiment.add(activeTool);
    if (id === 'sieve') this.tweens.add({ targets: activeTool, angle: { from: -6, to: 6 }, duration: 120, yoyo: true, repeat: 5 });
    if (id === 'evaporate') this.evaporate(activeTool);
    else this.separate(activeTool);
  }

  separate(activeTool) {
    const id = this.mixture.id;
    const leftX = 650;
    const rightX = 1400;
    const left = vessel(this, leftX, SOURCE.y, 420);
    const right = vessel(this, rightX, SOURCE.y, 420);
    this.experiment.add([left, right]);
    left.setAlpha(0);
    right.setAlpha(0);
    this.tweens.add({ targets: [left, right], alpha: 1, duration: 600 });
    this.source.list.find(child => child.type === 'Graphics').setAlpha(0.2);
    if (this.water) this.tweens.add({ targets: this.water, x: leftX - SOURCE.x, scaleX: 0.75, duration: 1700, delay: 450 });
    for (const [index, { kind, grain }] of this.grains.entries()) {
      const retained = kind === 'pebbles' || kind === 'iron' || kind === 'sand' && id === 'filter' || kind === 'cork';
      const destination = retained ? rightX : leftX;
      const targetX = destination - SOURCE.x + grain.x * 0.75;
      const targetY = kind === 'cork' ? 90 : grain.y;
      const delay = index * 18;
      if (retained) {
        const lift = id === 'magnet' ? -230 : id === 'skim' ? -100 : -180;
        this.tweens.add({ targets: grain, x: grain.x * 0.5, y: lift, duration: 650, delay,
          onComplete: () => this.tweens.add({ targets: grain, x: targetX, y: targetY, duration: 1000 }),
        });
      } else this.tweens.add({ targets: grain, x: targetX, duration: 1700, delay: 450 + delay });
    }
    this.tweens.add({ targets: activeTool, x: rightX, duration: 900, delay: 650 });
    this.time.delayedCall(2800, () => {
      activeTool.destroy();
      this.source.list.find(child => child.type === 'Graphics').setVisible(false);
      this.experiment.add([
        addLabel(this, leftX, 1000, this.mixture.left, 56),
        addLabel(this, rightX, 1000, this.mixture.right, 56),
      ]);
      this.complete();
    });
  }

  evaporate(activeTool) {
    this.tweens.add({ targets: activeTool, angle: { from: -6, to: 6 }, duration: 500, yoyo: true, repeat: 2 });
    this.tweens.add({ targets: this.water, scaleY: 0, y: 135, duration: 2600 });
    for (let index = 0; index < 16; index++) {
      const dot = this.add.circle(SOURCE.x - 160 + index % 6 * 60, SOURCE.y - 50, 8, 0xc3a2ff).setAlpha(0);
      this.experiment.add(dot);
      this.tweens.add({ targets: dot, y: SOURCE.y - 300, alpha: { from: 0.8, to: 0 }, duration: 1100, delay: index * 100,
        onComplete: () => dot.destroy(),
      });
    }
    for (const { grain } of this.grains) {
      grain.setVisible(true).setAlpha(0);
      this.tweens.add({ targets: grain, alpha: 1, duration: 1400, delay: 1200 });
    }
    this.time.delayedCall(3000, () => {
      activeTool.destroy();
      this.experiment.add(addLabel(this, SOURCE.x, 1000, 'Salt', 56));
      this.complete();
    });
  }

  complete() {
    this.phase = 'done';
    const fresh = addUnmixSticker(this.mixture.id);
    const actionVoice = this.actionVoice;
    actionVoice?.then(() => {
      if (!this.sys.isActive() || this.actionVoice !== actionVoice || this.phase !== 'done' || this.book?.active) return;
      this.actionVoice = null;
      say(this, `unmix.disc.${this.mixture.id}`);
    });
    if (fresh) {
      sfx(this, 'star');
      burst(this, SOURCE.x, SOURCE.y - 150, [0xffd84d, 0xffffff]);
    } else sfx(this, 'good');
    this.updateCounter();
    if (this.guide) {
      this.guide = false;
      markTipShown('unmix');
      const next = this.cfg.mixtures.find(mixture => !hasUnmixSticker(mixture.id));
      if (next) this.pointAt(this.pickers[next.id].button.x, 510);
    }
  }

  inspect() {
    if (this.phase === 'busy' || this.book?.active) return;
    this.actionVoice = null;
    if (this.zoomLayer) {
      this.zoomLayer.destroy();
      this.zoomLayer = null;
      return;
    }
    this.zoomLayer = this.add.container(1760, 1010);
    this.zoomLayer.add(this.add.circle(0, 0, 125, 0x39536e).setStrokeStyle(8, 0xffffff));
    for (let index = 0; index < 12; index++) {
      const x = (index % 4 - 1.5) * 45;
      const y = (Math.floor(index / 4) - 1) * 45;
      this.zoomLayer.add(this.phase === 'done' ? grainArt(this, 'salt', x, y, 0.8) : this.add.circle(x, y, 8, 0xffffff));
    }
    say(this, this.phase === 'done' ? 'unmix.crystals' : 'unmix.zoom');
  }

  hint() {
    if (this.phase === 'busy' || this.book?.active) return;
    this.actionVoice = null;
    if (this.phase === 'done') {
      const next = this.cfg.mixtures.find(mixture => !hasUnmixSticker(mixture.id));
      if (next) {
        say(this, `unmix.pick.${next.id}`);
        this.pointAt(this.pickers[next.id].button.x, 510);
      } else say(this, 'unmix.allFound');
    } else {
      say(this, `unmix.hint.${this.mixture.id}`);
      this.pointAt(this.tools[this.mixture.tool].x, TOOL_Y - 180);
    }
  }

  updateCounter() {
    this.counter.setText(`🏅 ${unmixStickerCount()} / ${this.cfg.stickers.length}`);
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