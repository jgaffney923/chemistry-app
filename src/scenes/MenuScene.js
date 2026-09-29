import { W, H } from '../layout.js';
import { APP_VERSION } from '../version.js';
import { makeWater } from '../art/atoms.js';
import { addItemArt } from '../art/items.js';
import { hotPlateTexture } from '../lab/props.js';
import { GAMES, suggestedGame } from '../home/games.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { addParentCorner } from '../ui/parentCorner.js';
import { say, sfx, whenQuiet } from '../systems/audio.js';
import { tipShown, markTipShown } from '../systems/save.js';

const WALLS = { x: 364, y: 560, w: 1320, h: 840 };
const HOUSE_TOP = 190;
const GAP = 40;
const GLOW = 0xffe066;

// The Science House: the home screen. The house shows one window per room;
// tapping a room zooms into it, where each game is a big button. Games return
// here with their home button, and land back in the room they came from.
// Nothing is locked; a soft glow suggests what to try next.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.home = this.cache.json.get('rooms');
    this.layer = null;
    this.tiles = {};
    this.gameButtons = {};

    const room = this.registry.get('room');
    if (room && this.roomById(room)) this.showRoom(room, false);
    else this.showHouse(false);

    addParentCorner(this, () => this.scene.restart());
    this.add.text(W - 40, H - 40, APP_VERSION, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(1, 1).setAlpha(0.3);

    // First visit: welcome, once the start screen's greeting has finished.
    if (!tipShown('house')) {
      markTipShown('house');
      whenQuiet().then(() => {
        if (this.sys.isActive()) say(this, 'house.intro');
      });
    }
  }

  roomById(id) {
    return this.home.rooms.find((r) => r.id === id);
  }

  // --- Switching between the house and a room

  showHouse(animate = true) {
    this.registry.remove('room');
    this.swap(() => this.buildHouse(), animate);
  }

  showRoom(id, animate = true) {
    this.registry.set('room', id);
    this.swap(() => this.buildRoom(this.roomById(id)), animate);
  }

  swap(build, animate) {
    const rebuild = () => {
      this.layer?.destroy();
      this.tiles = {};
      this.gameButtons = {};
      // Below the parent-corner gear, which stays put across views.
      this.layer = this.add.container(0, 0).setDepth(-1);
      build();
    };
    if (!animate) {
      rebuild();
      return;
    }
    const cam = this.cameras.main;
    cam.fadeOut(160, 35, 28, 68);
    cam.once('camerafadeoutcomplete', () => {
      rebuild();
      cam.fadeIn(160, 35, 28, 68);
    });
  }

  // --- The house

  buildHouse() {
    this.layer.add(this.add.image(W / 2, HOUSE_TOP, houseTexture(this)).setOrigin(0.5, 0));
    const next = suggestedGame(this, this.home.suggestedOrder);
    const rooms = this.home.rooms;
    const cols = Math.min(rooms.length, 3);
    const rows = Math.ceil(rooms.length / cols);
    const w = (WALLS.w - 80 - GAP * (cols - 1)) / cols;
    const h = (WALLS.h - 80 - GAP * (rows - 1)) / rows;

    rooms.forEach((room, i) => {
      const x = WALLS.x + 40 + w / 2 + (i % cols) * (w + GAP);
      const y = WALLS.y + 40 + h / 2 + Math.floor(i / cols) * (h + GAP);
      const glowing = room.games.includes(next);
      this.tiles[room.id] = this.roomTile(room, x, y, w, h, glowing);
    });
  }

  roomTile(room, x, y, w, h, glowing) {
    const color = Number(room.color);
    const tile = this.add.container(x, y);
    tile.add([
      this.add.rectangle(0, 0, w, h, color).setStrokeStyle(14, 0x2b2350),
      this.add.rectangle(0, -h / 2 + 70, w - 60, 20, 0xffffff, 0.25),
      ...roomArt(this, room.id, 0, -60),
      addLabel(this, 0, h / 2 - 130, room.label, 72),
      addLabel(this, 0, h / 2 - 55, this.progressText(room), 52, '#ffd84d'),
    ]);
    if (glowing) {
      // On the house, "try this next" is a gentle bob and a twinkling star
      // (a glow outline disappears against the cream walls).
      const star = addEmoji(this, w / 2 - 55, -h / 2 + 55, '✨', 90);
      tile.add(star);
      this.tweens.add({ targets: star, scale: { from: 0.8, to: 1.2 }, angle: { from: -10, to: 10 }, duration: 600, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: tile, scale: 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    tile.setSize(w, h).setInteractive();
    tile.on('pointerdown', () => {
      this.tweens.killTweensOf(tile);
      this.tweens.add({ targets: tile, scale: 0.96, duration: 80 });
    });
    tile.on('pointerout', () => tile.setScale(1));
    tile.on('pointerup', () => {
      tile.setScale(1);
      sfx(this, 'pop');
      say(this, `room.${room.id}`);
      this.showRoom(room.id);
    });
    this.layer.add(tile);
    return tile;
  }

  progressText(room) {
    return room.games.map((id) => GAMES[id].progress(this).label).filter(Boolean).join('    ');
  }

  // --- Inside a room

  buildRoom(room) {
    const color = Number(room.color);
    this.layer.add([
      this.add.rectangle(W / 2, H / 2, W, H, color, 0.3),
      addLabel(this, W / 2, 140, room.label, 96),
    ]);
    this.layer.add(makeRoundButton(this, 130, 130, 90, 0xffffff, addEmoji(this, 0, 0, '🏠', 90), () => {
      say(this, 'room.back');
      this.showHouse();
    }));

    const next = suggestedGame(this, this.home.suggestedOrder);
    const y = H / 2 - 20;
    const spacing = 640;
    room.games.forEach((id, i) => {
      const game = GAMES[id];
      const x = W / 2 + (i - (room.games.length - 1) / 2) * spacing;
      if (id === next) this.layer.add(this.glow(this.add.circle(x, y, 300).setStrokeStyle(18, GLOW)));
      const button = makeRoundButton(this, x, y, 260, game.color, game.icon(this), () => game.start(this));
      button.setScale(0);
      this.tweens.add({ targets: button, scale: 1, duration: 400, delay: i * 120, ease: 'Back.easeOut' });
      this.layer.add([button, addLabel(this, x, y + 350, game.progress(this).label, 80, '#ffd84d')]);
      this.gameButtons[id] = button;
    });
  }

  // A soft pulse that says "try this next".
  glow(shape) {
    this.tweens.add({ targets: shape, alpha: { from: 1, to: 0.25 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return shape;
  }
}

// A little picture for each room's window.
function roomArt(scene, id, x, y) {
  if (id === 'kitchen') {
    return [
      scene.add.image(x, y + 40, hotPlateTexture(scene)).setScale(0.8),
      addItemArt(scene, { id: 'ice', emoji: '🧊' }, x, y - 60, 170),
    ];
  }
  if (id === 'lab') return [makeWater(scene, x, y + 20, 110)];
  return [addEmoji(scene, x, y, '🔬', 200)];
}

// The house drawn once into a texture: chimney, roof, and walls.
function houseTexture(scene) {
  const key = 'home-house';
  if (scene.textures.exists(key)) return key;
  const top = HOUSE_TOP;
  const width = 1480, height = WALLS.y + WALLS.h - top + 20;
  const left = W / 2 - width / 2;
  const g = scene.make.graphics({ add: false });
  const X = (x) => x - left;
  const Y = (y) => y - top;
  // Chimney (behind the roof).
  g.fillStyle(0x9a4a3a, 1).fillRect(X(1400), Y(250), 110, 240);
  g.lineStyle(10, 0x2b2350, 1).strokeRect(X(1400), Y(250), 110, 240);
  // Roof.
  const roof = [{ x: X(284), y: Y(WALLS.y + 10) }, { x: X(W / 2), y: Y(top + 10) }, { x: X(W - 284), y: Y(WALLS.y + 10) }];
  g.fillStyle(0xc0503f, 1).fillPoints(roof, true);
  g.lineStyle(12, 0x2b2350, 1).strokePoints(roof, true, true);
  // Walls.
  g.fillStyle(0xf3e3c3, 1).fillRect(X(WALLS.x), Y(WALLS.y), WALLS.w, WALLS.h);
  g.lineStyle(12, 0x2b2350, 1).strokeRect(X(WALLS.x), Y(WALLS.y), WALLS.w, WALLS.h);
  // A round attic window.
  g.fillStyle(0xbfe8ff, 1).fillCircle(X(W / 2), Y(430), 55);
  g.lineStyle(10, 0x2b2350, 1).strokeCircle(X(W / 2), Y(430), 55);
  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}
