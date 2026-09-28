import { W, H } from '../layout.js';
import { addEmoji, addLabel } from './emoji.js';
import { isSoundOn, setSoundOn, resetProgress } from '../systems/save.js';
import { setMuted } from '../systems/audio.js';

const HOLD_MS = 3000;

// A small gear in the corner. Holding it for 3 seconds opens the parent panel:
// sound on/off and reset progress. A quick tap does nothing, so kids won't wander in.
export function addParentCorner(scene, onReset) {
  const x = W - 110, y = 110;
  const gear = addEmoji(scene, x, y, '⚙️', 70).setAlpha(0.45);
  const ring = scene.add.graphics();
  gear.setInteractive(new Phaser.Geom.Circle(gear.width / 2, gear.height / 2, 80), Phaser.Geom.Circle.Contains);

  let timer = null;
  const cancel = () => {
    timer?.remove();
    timer = null;
    ring.clear();
  };

  gear.on('pointerdown', () => {
    cancel();
    timer = scene.time.addEvent({
      delay: HOLD_MS,
      callback: () => {
        cancel();
        openPanel(scene, onReset);
      },
    });
  });
  gear.on('pointerup', cancel);
  gear.on('pointerout', cancel);

  const drawRing = () => {
    if (!timer) return;
    ring.clear();
    ring.lineStyle(10, 0xffffff, 0.8);
    ring.beginPath();
    ring.arc(x, y, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * timer.getProgress());
    ring.strokePath();
  };
  // Scene event listeners outlive a restart, so remove this one on shutdown.
  scene.events.on('update', drawRing);
  scene.events.once('shutdown', () => scene.events.off('update', drawRing));
}

function openPanel(scene, onReset) {
  const layer = scene.add.container(0, 0).setDepth(5000);

  const shade = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setInteractive();
  const panel = scene.add.rectangle(W / 2, H / 2, 1100, 900, 0xffffff).setStrokeStyle(8, 0xdddddd);
  const title = addLabel(scene, W / 2, H / 2 - 340, 'Grown-ups', 72, '#231c44');
  layer.add([shade, panel, title]);

  const soundLabel = () => `Sound: ${isSoundOn() ? 'On' : 'Off'}`;
  const sound = rectButton(scene, W / 2, H / 2 - 150, soundLabel(), 0x3ccf6e, () => {
    const on = !isSoundOn();
    setSoundOn(on);
    setMuted(scene.game, !on);
    sound.label.setText(soundLabel());
  });

  let armed = false;
  const reset = rectButton(scene, W / 2, H / 2 + 50, 'Reset progress', 0xf0a030, () => {
    if (!armed) {
      armed = true;
      reset.label.setText('Tap again to erase stars');
      reset.bg.setFillStyle(0xe8453c);
      return;
    }
    resetProgress();
    reset.label.setText('Progress reset');
    reset.disableInteractive();
    onReset?.();
  });

  const close = rectButton(scene, W / 2, H / 2 + 280, 'Done', 0x4f7cff, () => layer.destroy());
  layer.add([sound, reset, close]);
}

function rectButton(scene, x, y, text, color, onTap) {
  const w = 760, h = 150;
  const button = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, w, h, color).setStrokeStyle(6, 0x000000, 0.15);
  const label = addLabel(scene, 0, 0, text, 56);
  button.add([bg, label]);
  button.setSize(w, h).setInteractive();
  button.on('pointerup', onTap);
  button.bg = bg;
  button.label = label;
  return button;
}
