import { W, H } from './layout.js';
import { installAudioGuards } from './systems/audio.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#231c44',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: W,
    height: H,
  },
  input: { activePointers: 4 }, // several small fingers at once
  scene: [BootScene, MenuScene],
});

installAudioGuards(game);
