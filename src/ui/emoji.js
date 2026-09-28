// Placeholder art: emoji drawn as text. Replaced by real sprites in M2.
const FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

export function addEmoji(scene, x, y, emoji, size) {
  return scene.add.text(x, y, emoji, {
    fontFamily: FONT,
    fontSize: `${size}px`,
    padding: { x: size * 0.15, y: size * 0.15 },
  }).setOrigin(0.5);
}

export function addLabel(scene, x, y, text, size, color = '#ffffff') {
  return scene.add.text(x, y, text, {
    fontFamily: '"Arial Rounded MT Bold", "Nunito", system-ui, sans-serif',
    fontSize: `${size}px`,
    fontStyle: 'bold',
    color,
  }).setOrigin(0.5);
}
