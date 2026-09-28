// Drag helpers. Works with touch and mouse through Phaser's pointer input.

// How far (game units) a finger can wobble and still count as a tap.
const TAP_SLOP = 24;

// Makes a container draggable, with a lift effect while held.
// Calls onTap if it was touched without moving, onDrop when released after a drag.
export function makeDraggable(scene, obj, { onTap, onDrop, onPickUp }) {
  scene.input.setDraggable(obj);
  scene.input.dragDistanceThreshold = TAP_SLOP;

  obj.on('dragstart', () => {
    scene.tweens.killTweensOf(obj);
    obj.setDepth(1000);
    scene.tweens.add({ targets: obj, scale: 1.12, duration: 100 });
    onPickUp?.();
  });
  obj.on('drag', (pointer, x, y) => {
    obj.setPosition(x, y);
  });
  obj.on('dragend', () => {
    scene.tweens.add({ targets: obj, scale: 1, duration: 100 });
    onDrop(obj.x, obj.y);
  });
  obj.on('pointerup', (pointer) => {
    if (pointer.getDistance() < TAP_SLOP) onTap?.();
  });
}

// Puts an object back where it came from with a bounce.
export function returnTo(scene, obj, x, y) {
  scene.tweens.add({ targets: obj, x, y, duration: 450, ease: 'Back.easeOut' });
}
