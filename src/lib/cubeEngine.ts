// Rubik's Cube Engine - Authentic 3x3 mechanics
export type Color = 'W' | 'Y' | 'R' | 'O' | 'B' | 'G';
export type FaceDir = 'U' | 'D' | 'R' | 'L' | 'F' | 'B';

export interface Cubie {
  x: number; y: number; z: number;
  colors: Partial<Record<FaceDir, Color>>;
}

const SOLVED: Record<FaceDir, Color> = {
  U: 'W', D: 'Y', F: 'B', B: 'G', R: 'R', L: 'O',
};

export function createSolvedCube(): Cubie[] {
  const cubies: Cubie[] = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        const c: Partial<Record<FaceDir, Color>> = {};
        if (y === 1) c.U = SOLVED.U;
        if (y === -1) c.D = SOLVED.D;
        if (x === 1) c.R = SOLVED.R;
        if (x === -1) c.L = SOLVED.L;
        if (z === 1) c.F = SOLVED.F;
        if (z === -1) c.B = SOLVED.B;
        cubies.push({ x, y, z, colors: c });
      }
  return cubies;
}

export interface MoveDefinition {
  axis: 'x' | 'y' | 'z';
  layer: number;
  dir: 1 | -1;
  angle: number;
}

export const MOVES: Record<string, MoveDefinition> = {
  'R':  { axis: 'x', layer: 1, dir: -1, angle: 90 },
  "R'": { axis: 'x', layer: 1, dir: 1, angle: 90 },
  'R2': { axis: 'x', layer: 1, dir: -1, angle: 180 },
  'L':  { axis: 'x', layer: -1, dir: 1, angle: 90 },
  "L'": { axis: 'x', layer: -1, dir: -1, angle: 90 },
  'U':  { axis: 'y', layer: 1, dir: -1, angle: 90 },
  "U'": { axis: 'y', layer: 1, dir: 1, angle: 90 },
  'U2': { axis: 'y', layer: 1, dir: -1, angle: 180 },
  'D':  { axis: 'y', layer: -1, dir: 1, angle: 90 },
  "D'": { axis: 'y', layer: -1, dir: -1, angle: 90 },
  'F':  { axis: 'z', layer: 1, dir: -1, angle: 90 },
  "F'": { axis: 'z', layer: 1, dir: 1, angle: 90 },
  'B':  { axis: 'z', layer: -1, dir: 1, angle: 90 },
  "B'": { axis: 'z', layer: -1, dir: -1, angle: 90 },
};

function rotatePos(x: number, y: number, z: number, axis: 'x'|'y'|'z', dir: number): [number, number, number] {
  const r = (v1: number, v2: number): [number, number] => [
    Math.round(v1 * 0 - v2 * dir),
    Math.round(v1 * dir + v2 * 0)
  ];
  if (axis === 'x') { const [ny, nz] = r(y, z); return [x, ny, nz]; }
  if (axis === 'y') { const [nz, nx] = r(z, x); return [y, nz, nx]; /* y stays */ }
  // z
  const [nx, ny] = r(x, y);
  return [nx, ny, z];
}

// Fix rotatePos for y-axis
function rotatePosCorrect(x: number, y: number, z: number, axis: 'x'|'y'|'z', dir: number): [number, number, number] {
  if (axis === 'x') {
    // Rotate around x: y,z rotate
    return [x, Math.round(-dir * z), Math.round(dir * y)];
  }
  if (axis === 'y') {
    // Rotate around y: x,z rotate
    return [Math.round(dir * z), y, Math.round(-dir * x)];
  }
  // axis === 'z': x,y rotate
  return [Math.round(-dir * y), Math.round(dir * x), z];
}

const FACE_REMAP: Record<string, Record<FaceDir, FaceDir>> = {
  'x1': { U: 'F', F: 'D', D: 'B', B: 'U', R: 'R', L: 'L' },   // CW from +x (dir=-1 for R)
  'x-1': { U: 'B', B: 'D', D: 'F', F: 'U', R: 'R', L: 'L' },
  'y1': { F: 'R', R: 'B', B: 'L', L: 'F', U: 'U', D: 'D' },    // CW from +y
  'y-1': { F: 'L', L: 'B', B: 'R', R: 'F', U: 'U', D: 'D' },
  'z1': { U: 'L', L: 'D', D: 'R', R: 'U', F: 'F', B: 'B' },    // CW from +z
  'z-1': { U: 'R', R: 'D', D: 'L', L: 'U', F: 'F', B: 'B' },
};

export function applyMove(cubies: Cubie[], moveName: string): Cubie[] {
  const move = MOVES[moveName];
  if (!move) return cubies;

  const result = cubies.map(c => {
    const axisVal = move.axis === 'x' ? c.x : move.axis === 'y' ? c.y : c.z;
    if (axisVal !== move.layer) return { ...c, colors: { ...c.colors } };

    const times = move.angle === 180 ? 2 : 1;
    let nx = c.x, ny = c.y, nz = c.z;
    let colors = { ...c.colors };

    for (let i = 0; i < times; i++) {
      [nx, ny, nz] = rotatePosCorrect(nx, ny, nz, move.axis, move.dir);
      const key = `${move.axis}${move.dir}` as keyof typeof FACE_REMAP;
      const remap = FACE_REMAP[key];
      const newColors: Partial<Record<FaceDir, Color>> = {};
      for (const [face, color] of Object.entries(colors)) {
        newColors[remap[face as FaceDir]] = color as Color;
      }
      colors = newColors;
    }

    return { x: nx, y: ny, z: nz, colors };
  });

  return result;
}

// The cinematic move sequence - authentic speedcubing algorithms
export const MOVE_SEQUENCE: { move: string; start: number; end: number }[] = [
  // Beat A: 0-0.20 — TURN PRECISION (slow, deliberate first moves)
  { move: 'R',  start: 0.02, end: 0.065 },
  { move: 'U',  start: 0.075, end: 0.12 },
  { move: "R'", start: 0.13, end: 0.175 },
  { move: "U'", start: 0.185, end: 0.23 },
  { move: 'F',  start: 0.24, end: 0.275 },

  // Beat B: 0.25-0.45 — CONTROLLED CHAOS
  { move: 'R',  start: 0.285, end: 0.33 },
  { move: 'U',  start: 0.34, end: 0.385 },
  { move: "R'", start: 0.395, end: 0.44 },
  { move: "U'", start: 0.45, end: 0.495 },
  { move: "F'", start: 0.505, end: 0.545 },
  { move: 'L',  start: 0.555, end: 0.595 },
  { move: "U'", start: 0.605, end: 0.645 },
  { move: "L'", start: 0.655, end: 0.695 },

  // Beat C: 0.50-0.70 — PURE MECHANICS (rapid advanced algorithms)
  { move: 'R',  start: 0.705, end: 0.745 },
  { move: 'U',  start: 0.755, end: 0.795 },
  { move: "R'", start: 0.805, end: 0.845 },
  { move: 'U',  start: 0.855, end: 0.895 },
  { move: 'R',  start: 0.905, end: 0.945 },
  { move: 'U2', start: 0.955, end: 1.01 },
  { move: "R'", start: 1.02, end: 1.06 },
  { move: "L'", start: 1.07, end: 1.11 },
  { move: "U'", start: 1.12, end: 1.16 },

  // Beat D: 0.75-0.95 — MASTER THE FLOW
  { move: 'F',  start: 1.17, end: 1.21 },
  { move: 'R',  start: 1.22, end: 1.26 },
  { move: 'U',  start: 1.27, end: 1.31 },
  { move: "R'", start: 1.32, end: 1.36 },
  { move: "U'", start: 1.37, end: 1.41 },
  { move: "F'", start: 1.42, end: 1.46 },
];

// Get cube state at a specific scroll progress
export function getCubeStateAtProgress(progress: number): {
  cubies: Cubie[];
  animatingMove: MoveDefinition | null;
  animationProgress: number;
} {
  let cubies = createSolvedCube();
  let animatingMove: MoveDefinition | null = null;
  let animationProgress = 0;

  for (const seq of MOVE_SEQUENCE) {
    if (progress < seq.start) break;

    if (progress >= seq.end) {
      // Move complete
      cubies = applyMove(cubies, seq.move);
    } else {
      // Move in progress
      const t = (progress - seq.start) / (seq.end - seq.start);
      // Ease in-out
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      animatingMove = MOVES[seq.move];
      animationProgress = eased;
      break;
    }
  }

  return { cubies, animatingMove, animationProgress };
}
