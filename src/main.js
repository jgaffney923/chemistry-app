import { W, H } from './layout.js';
import { installAudioGuards, setMuted } from './systems/audio.js';
import { isSoundOn } from './systems/save.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import SorterScene from './scenes/SorterScene.js';
import SorterIntroScene from './scenes/SorterIntroScene.js';
import LabScene from './scenes/LabScene.js';
import BuilderScene from './scenes/BuilderScene.js';
import UndoScene from './scenes/UndoScene.js';
import HeatScene from './scenes/HeatScene.js';

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
  scene: [BootScene, MenuScene, SorterIntroScene, SorterScene, LabScene, BuilderScene, UndoScene, HeatScene],
});

installAudioGuards(game);
setMuted(game, !isSoundOn());

// Lets automated browser tests on this PC look inside the game.
if (location.hostname === 'localhost') window.__game = game;
