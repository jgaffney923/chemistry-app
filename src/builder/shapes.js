import { makeAtom } from '../art/atoms.js';

// Space between two joined atoms' edges, so bond lines (and double bonds) show.
export const BOND_GAP = 64;

// The real shape of each named molecule, as unit offsets from its center.
// Water is bent (about 104.5 degrees), carbon dioxide is straight, and methane
// is drawn as a flat cross (really it's a 3D tetrahedron).
const ANGLES = {
  line: [180, 0],
  bent: [90 + 104.5 / 2, 90 - 104.5 / 2],
  cross: [0, 90, 180, 270],
};

// Returns { atoms: [{ symbol, ux, uy }], bonds: [[i, j, order]] } in bond-length units.
export function moleculeShape(molecule, atomInfo) {
  const symbols = Object.entries(molecule.formula).flatMap(([s, n]) => Array(n).fill(s));
  if (!molecule.center) {
    // Two of the same atom, side by side, sharing all their bond spots.
    return {
      atoms: [{ symbol: symbols[0], ux: -0.5, uy: 0 }, { symbol: symbols[1], ux: 0.5, uy: 0 }],
      bonds: [[0, 1, atomInfo[symbols[0]].valence]],
    };
  }
  const outers = [...symbols];
  outers.splice(outers.indexOf(molecule.center), 1);
  const angles = ANGLES[molecule.layout];
  return {
    atoms: [
      { symbol: molecule.center, ux: 0, uy: 0 },
      ...outers.map((symbol, i) => {
        const a = Phaser.Math.DegToRad(angles[i]);
        return { symbol, ux: Math.cos(a), uy: Math.sin(a) };
      }),
    ],
    bonds: outers.map((symbol, i) => [0, i + 1, atomInfo[symbol].valence]),
  };
}

// Draws a small picture of a molecule (for the recipe cards).
export function drawMolecule(scene, molecule, atomInfo, x, y, scale) {
  const shape = moleculeShape(molecule, atomInfo);
  const radius = (a) => atomInfo[a.symbol].radius;
  // Outer atoms sit one bond length from the center atom (or from each other, for a pair).
  const partner = shape.atoms.find((a) => a.ux === 0 && a.uy === 0) || shape.atoms[1];
  const pic = scene.add.container(x, y);
  const lines = scene.add.graphics();
  pic.add(lines);
  const pos = shape.atoms.map((a) => {
    const len = (radius(a) + radius(a === partner ? shape.atoms[0] : partner) + BOND_GAP) * scale;
    return { x: a.ux * len, y: a.uy * len };
  });
  for (const [i, j, order] of shape.bonds) drawBond(lines, pos[i], pos[j], order, 10 * scale + 2, 12 * scale + 3);
  shape.atoms.forEach((a, i) => {
    const info = atomInfo[a.symbol];
    pic.add(makeAtom(scene, pos[i].x, pos[i].y, info.element, info.radius * scale));
  });
  return pic;
}

// A single, double, or triple bond: parallel lines between two points.
export function drawBond(g, a, b, order, width, gap) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  g.lineStyle(width, 0xe8e6f5, 1);
  for (let k = 0; k < order; k++) {
    const off = (k - (order - 1) / 2) * gap;
    g.lineBetween(a.x + nx * off, a.y + ny * off, b.x + nx * off, b.y + ny * off);
  }
}
