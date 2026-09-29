import { makeWater } from '../art/atoms.js';
import { addItemArt } from '../art/items.js';
import { addEmoji } from '../ui/emoji.js';
import { getStars, isSorterIntroSeen, stickerCount, moleculeCount } from '../systems/save.js';

// Every game the Science House can open: its button picture, how to start it,
// and how far the kid has got (label for the badge, fraction 0..1 for "try next").
// Scenes are always started with data: with none, Phaser reuses the last run's.
export const GAMES = {
  sorter: {
    color: 0x4f7cff,
    icon(scene) {
      const items = scene.cache.json.get('items').sorter.items;
      const art = (id, x, y) => addItemArt(scene, items.find((it) => it.id === id), x, y, 170);
      return [art('ice', -120, 50), art('water', 0, -85), art('balloon', 120, 50)];
    },
    start(scene) {
      scene.scene.start(isSorterIntroSeen() ? 'Sorter' : 'SorterIntro', {});
    },
    progress(scene) {
      const stars = getStars('sorter');
      const unlock = scene.cache.json.get('items').sorter.level2.unlockStars;
      return { label: stars ? `⭐ ${stars}` : '', fraction: Math.min(stars / unlock, 1) };
    },
  },

  lab: {
    color: 0x1fb5c9,
    icon(scene) {
      return addEmoji(scene, 0, 0, '🧪', 230);
    },
    start(scene) {
      scene.scene.start('Lab', {});
    },
    progress(scene) {
      const found = stickerCount();
      const total = scene.cache.json.get('lab').stickers.length;
      return { label: found ? `🏅 ${found} / ${total}` : '', fraction: found / total };
    },
  },

  undo: {
    color: 0x3ccf6e,
    icon(scene) {
      const items = { bread: { id: 'bread', emoji: '🍞' }, toast: { id: 'toast', emoji: '🍞' } };
      return [
        addItemArt(scene, items.bread, -95, 0, 160),
        addEmoji(scene, 0, 0, '➜', 70),
        addItemArt(scene, items.toast, 95, 0, 160),
        addEmoji(scene, 0, 150, '🔄', 70),
      ];
    },
    start(scene) {
      scene.scene.start('Undo', {});
    },
    progress() {
      const stars = getStars('undo');
      // Two rounds counts as having explored it.
      return { label: stars ? `⭐ ${stars}` : '', fraction: Math.min(stars / 6, 1) };
    },
  },

  builder: {
    color: 0xa77cf2,
    icon(scene) {
      return makeWater(scene, 0, 30, 85);
    },
    start(scene) {
      scene.scene.start('Builder', {});
    },
    progress(scene) {
      const made = moleculeCount();
      const total = scene.cache.json.get('molecules').molecules.length;
      return { label: made ? `✅ ${made} / ${total}` : '', fraction: made / total };
    },
  },
};

// The game to gently suggest: the first one not started yet, otherwise the
// least-finished one. None once everything is done.
export function suggestedGame(scene, order) {
  const fractions = order.map((id) => [id, GAMES[id].progress(scene).fraction]);
  const fresh = fractions.find(([, f]) => f === 0);
  if (fresh) return fresh[0];
  const open = fractions.filter(([, f]) => f < 1).sort((a, b) => a[1] - b[1]);
  return open.length ? open[0][0] : null;
}
