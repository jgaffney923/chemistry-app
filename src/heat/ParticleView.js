// The "up close" view: a circle of particles that behaves like a solid, liquid,
// or gas, and moves faster as the temperature (0..1) goes up, even within one
// state. That link between warmth and particle speed is the lesson.
//
// - solid:  each particle jiggles around its own spot in a grid
// - liquid: particles tumble and slide past each other, gathered at the bottom
// - gas:    particles fly fast and fill the whole circle

const COUNT = 36;
const COLS = 6;
const SPACING = 44;
const DOT = 16;
const LIQUID_TOP = 60; // liquid collects below this line (circle coordinates)

export class ParticleView extends Phaser.GameObjects.Container {
  constructor(scene, x, y, radius) {
    super(scene, x, y);
    scene.add.existing(this);
    this.radius = radius;
    this.state = 'solid';
    this.temp = 0;
    this.color = 0x3b8ed8;

    this.add(scene.add.circle(0, 0, radius, 0x1a1533).setStrokeStyle(12, 0xffffff, 0.8));
    this.dots = scene.add.graphics();
    this.add(this.dots);

    const rows = COUNT / COLS;
    this.parts = Array.from({ length: COUNT }, (_, i) => {
      const hx = ((i % COLS) - (COLS - 1) / 2) * SPACING;
      const hy = 60 + (Math.floor(i / COLS) - (rows - 1) / 2) * SPACING;
      return { x: hx, y: hy, hx, hy, vx: 0, vy: 0, phase: Math.random() * Math.PI * 2 };
    });
  }

  // A new material starts as a neat solid grid.
  setMaterial(color) {
    this.color = color;
    this.state = 'solid';
    for (const p of this.parts) {
      p.x = p.hx;
      p.y = p.hy;
      p.vx = p.vy = 0;
    }
  }

  // Boiling scatters particles in every direction (otherwise the ones leaving the
  // liquid together would keep bouncing around as a clump).
  setState(state) {
    this.state = state;
    if (state !== 'gas') return;
    for (const p of this.parts) {
      const a = Math.random() * Math.PI * 2;
      p.vx = Math.cos(a);
      p.vy = Math.sin(a);
    }
  }

  // Called every frame by the scene.
  step(time, dt) {
    dt = Math.min(dt, 0.05);
    const t = this.temp;
    if (this.state === 'solid') this.jiggle(time, dt, t);
    else if (this.state === 'liquid') this.tumble(dt, t);
    else this.fly(dt, t);
    this.draw();
  }

  jiggle(time, dt, t) {
    // Kept strong on purpose: "warmer means more jiggle" should be easy to see.
    const amount = 2 + 45 * t;
    const speed = 0.005 + 0.04 * t;
    for (const p of this.parts) {
      const tx = p.hx + Math.sin(time * speed + p.phase) * amount;
      const ty = p.hy + Math.cos(time * speed * 1.3 + p.phase * 1.7) * amount;
      // Ease toward the spot, so freezing looks like particles settling into place.
      const k = Math.min(1, dt * 12);
      p.x += (tx - p.x) * k;
      p.y += (ty - p.y) * k;
      p.vx = p.vy = 0;
    }
  }

  tumble(dt, t) {
    const maxSpeed = 60 + 170 * t;
    const edge = this.radius - DOT - 6;
    for (const p of this.parts) {
      p.vx += (Math.random() - 0.5) * 900 * dt;
      p.vy += (Math.random() - 0.5) * 900 * dt + 300 * dt; // a little gravity
      limit(p, maxSpeed);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y < LIQUID_TOP) {
        p.y = LIQUID_TOP;
        p.vy = Math.abs(p.vy);
      }
      keepInside(p, edge);
    }
    this.spreadOut(DOT * 2);
  }

  fly(dt, t) {
    const speed = 380 + 420 * t;
    const edge = this.radius - DOT - 6;
    for (const p of this.parts) {
      if (Math.hypot(p.vx, p.vy) < 1) {
        const a = Math.random() * Math.PI * 2;
        p.vx = Math.cos(a);
        p.vy = Math.sin(a);
      }
      const len = Math.hypot(p.vx, p.vy);
      p.vx = (p.vx / len) * speed;
      p.vy = (p.vy / len) * speed;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      keepInside(p, edge);
    }
  }

  // Gently pushes overlapping particles apart, so a liquid looks packed, not piled up.
  spreadOut(minDist) {
    const ps = this.parts;
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const dx = ps[j].x - ps[i].x, dy = ps[j].y - ps[i].y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < minDist) {
          const push = (minDist - d) / 2 / d;
          ps[i].x -= dx * push; ps[i].y -= dy * push;
          ps[j].x += dx * push; ps[j].y += dy * push;
        }
      }
    }
  }

  draw() {
    this.dots.clear();
    this.dots.fillStyle(this.color, 1);
    this.dots.lineStyle(3, 0xffffff, 0.5);
    for (const p of this.parts) {
      this.dots.fillCircle(p.x, p.y, DOT);
      this.dots.strokeCircle(p.x, p.y, DOT);
    }
  }
}

function limit(p, max) {
  const s = Math.hypot(p.vx, p.vy);
  if (s > max) {
    p.vx = (p.vx / s) * max;
    p.vy = (p.vy / s) * max;
  }
}

// Bounces a particle back inside the circle.
function keepInside(p, edge) {
  const d = Math.hypot(p.x, p.y);
  if (d <= edge) return;
  const nx = p.x / d, ny = p.y / d;
  p.x = nx * edge;
  p.y = ny * edge;
  const dot = p.vx * nx + p.vy * ny;
  if (dot > 0) {
    p.vx -= 2 * dot * nx;
    p.vy -= 2 * dot * ny;
  }
}
