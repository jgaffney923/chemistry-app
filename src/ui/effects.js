// Shared particle effects: celebration bursts and heating/cooling.

const CHANGE = {
  heat: [0xff7a3d, 0xffc53d, 0xff4d2e],
  cool: [0xffffff, 0xbfe8ff, 0x8fd3ff],
};

// Sparks flying out in a ring.
export function burst(scene, x, y, colors) {
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14;
    const spark = scene.add.circle(x, y, 18, colors[i % colors.length]).setDepth(900);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * 260,
      y: y + Math.sin(angle) * 260,
      alpha: 0,
      scale: 0.3,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => spark.destroy(),
    });
  }
}

// Heat: warm sparks rise from below. Cool: snowflakes drift down from above.
export function changeEffect(scene, x, y, radius, action) {
  const heat = action === 'heat';
  const colors = CHANGE[action];
  for (let i = 0; i < 26; i++) {
    const px = x + Phaser.Math.Between(-radius * 1.2, radius * 1.2);
    const startY = heat ? y + radius + 40 : y - radius - 60;
    const p = scene.add.circle(px, startY, Phaser.Math.Between(10, 20), colors[i % colors.length])
      .setDepth(1100).setAlpha(0);
    scene.tweens.add({
      targets: p,
      y: heat ? y - radius : y + radius,
      x: px + Phaser.Math.Between(-40, 40),
      alpha: { from: 0.9, to: 0 },
      duration: 1000,
      delay: i * 35,
      ease: heat ? 'Quad.easeOut' : 'Sine.easeIn',
      onComplete: () => p.destroy(),
    });
  }
}
