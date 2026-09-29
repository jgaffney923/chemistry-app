import { addEmoji, addLabel } from '../ui/emoji.js';

const TUBE_W = 90;
const HANDLE_R = 62;
const RED = 0xe8453c;

// A big draggable thermometer. `value` runs 0 (cold, bottom) to 1 (hot, top).
// Drag the handle, or tap anywhere on the tube to jump there.
// `marks` are picture-and-word labels down the left side (no numbers).
export class Thermometer extends Phaser.GameObjects.Container {
  constructor(scene, x, top, bottom, marks, onChange) {
    super(scene, x, 0);
    scene.add.existing(this);
    this.top = top;
    this.bottom = bottom;
    this.onChange = onChange;
    this.value = 0;

    const tube = scene.add.graphics();
    tube.fillStyle(0xffffff, 0.15).fillRect(-TUBE_W / 2, top - 40, TUBE_W, bottom - top + 80);
    tube.lineStyle(10, 0xffffff, 0.9).strokeRect(-TUBE_W / 2, top - 40, TUBE_W, bottom - top + 80);
    // Full height from the bulb to the top; scaled to show the temperature.
    this.fullHeight = bottom + 60 - (top - 30);
    this.mercury = scene.add.rectangle(0, bottom + 60, TUBE_W - 34, this.fullHeight, RED).setOrigin(0.5, 1);
    const bulb = scene.add.circle(0, bottom + 95, 85, RED).setStrokeStyle(10, 0xffffff, 0.9);
    this.add([tube, this.mercury, bulb]);

    for (const m of marks) {
      const y = this.yFor(m.t);
      this.add([
        scene.add.rectangle(-TUBE_W / 2 - 20, y, 30, 6, 0xffffff, 0.8),
        addEmoji(scene, -150, y - 20, m.emoji, 64),
        addLabel(scene, -150, y + 32, m.label, 30),
      ]);
    }

    this.handle = scene.add.container(0, bottom);
    this.handle.add([
      scene.add.circle(0, 0, HANDLE_R, 0xffffff).setStrokeStyle(10, RED),
      addLabel(scene, 0, 0, '↕', 56, '#e8453c'),
    ]);
    this.add(this.handle);
    this.handle.setInteractive(new Phaser.Geom.Circle(0, 0, HANDLE_R + 40), Phaser.Geom.Circle.Contains);
    scene.input.setDraggable(this.handle);
    this.handle.on('drag', (pointer) => this.setFromY(pointer.worldY));

    // Tapping the tube jumps the handle there.
    const hit = scene.add.rectangle(0, (top + bottom) / 2, TUBE_W + 80, bottom - top + 120, 0x000000, 0.001);
    this.addAt(hit, 0);
    hit.setInteractive();
    hit.on('pointerdown', (pointer) => this.setFromY(pointer.worldY));
  }

  yFor(value) {
    return this.bottom - value * (this.bottom - this.top);
  }

  setFromY(y) {
    this.setValue(Phaser.Math.Clamp((this.bottom - y) / (this.bottom - this.top), 0, 1));
  }

  // Moves the handle; `quiet` skips the change callback (e.g. when resetting).
  setValue(value, quiet = false) {
    this.value = value;
    const y = this.yFor(value);
    this.handle.y = y;
    this.mercury.scaleY = (this.bottom + 60 - y) / this.fullHeight;
    if (!quiet) this.onChange(value);
  }
}
