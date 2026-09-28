import { W, H } from '../layout.js';
import { APP_VERSION } from '../version.js';
import { makeWater } from '../art/atoms.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji, addLabel } from '../ui/emoji.js';
import { addParentCorner } from '../ui/parentCorner.js';
import { say } from '../systems/audio.js';
import { getStars } from '../systems/save.js';

const RADIUS = 260;

// Home screen: one big button per mini-game. Games not built yet are faded.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const y = H / 2 - 40;
    const games = [
      {
        x: W / 2 - 640,
        color: 0x4f7cff,
        icon: () => this.sorterIcon(),
        ready: true,
        onTap: () => this.scene.start('Sorter'),
      },
      { x: W / 2, color: 0x1fb5c9, icon: () => addEmoji(this, 0, 0, '🧪', 230), ready: false },
      { x: W / 2 + 640, color: 0xa77cf2, icon: () => makeWater(this, 0, 30, 85), ready: false },
    ];

    games.forEach((game, i) => {
      const button = makeRoundButton(this, game.x, y, RADIUS, game.color, game.icon(), () => {
        if (game.ready) game.onTap();
        else say(this, 'menu.soon');
      });
      if (!game.ready) button.setAlpha(0.4);
      button.setScale(0);
      this.tweens.add({ targets: button, scale: 1, duration: 450, delay: i * 120, ease: 'Back.easeOut' });
    });

    const stars = getStars('sorter');
    if (stars > 0) {
      addLabel(this, games[0].x, y + RADIUS + 90, `⭐ ${stars}`, 80, '#ffd84d');
    }

    addParentCorner(this, () => this.scene.restart());

    this.add.text(W - 40, H - 40, APP_VERSION, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(1, 1).setAlpha(0.3);
  }

  // Ice, water, and a balloon: one of each state.
  sorterIcon() {
    return [
      addEmoji(this, -120, 40, '🧊', 130),
      addEmoji(this, 0, -80, '💧', 130),
      addEmoji(this, 120, 40, '🎈', 130),
    ];
  }
}
