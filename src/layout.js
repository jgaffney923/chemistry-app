// Game units. 2048x1536 is the iPad's 4:3 shape at Retina resolution,
// so shapes and text stay sharp. On most iPads 1 CSS pixel is about 2 game units.
export const W = 2048;
export const H = 1536;

// Smallest touch target: 96 CSS px from the plan, in game units.
export const MIN_TOUCH = 200;

export const COLORS = {
  bg: 0x231c44,
  go: 0x3ccf6e,
  white: 0xffffff,
  hydrogen: 0xf4f4f4,
  oxygen: 0xe8453c,
  carbon: 0x4a4a4a,
  nitrogen: 0x3b6fe0,
};
