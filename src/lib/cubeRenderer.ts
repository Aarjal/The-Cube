// 3D Rubik's Cube Canvas Renderer
import { Cubie, MoveDefinition, Color } from './cubeEngine';

type Vec3 = [number, number, number];
type Vec2 = [number, number];

const COLOR_MAP: Record<Color, string> = {
  W: '#FFFFFF',
  Y: '#FFD500',
  R: '#C41E3A',
  O: '#FF5800',
  B: '#0051BA',
  G: '#009E60',
};

// 3x3 rotation matrix application
function rotX(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0], v[1]*c - v[2]*s, v[1]*s + v[2]*c];
}
function rotY(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0]*c + v[2]*s, v[1], -v[0]*s + v[2]*c];
}
function rotZ(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0]*c - v[1]*s, v[0]*s + v[1]*c, v[2]];
}

function rotateAroundAxis(v: Vec3, axis: 'x'|'y'|'z', angle: number): Vec3 {
  if (axis === 'x') return rotX(v, angle);
  if (axis === 'y') return rotY(v, angle);
  return rotZ(v, angle);
}

function project(v: Vec3, w: number, h: number, fov: number): Vec2 {
  const d = fov;
  const scale = d / (d + v[2]);
  return [v[0] * scale + w/2, -v[1] * scale + h/2];
}

interface FaceQuad {
  verts3d: Vec3[];
  color: string;
  depth: number;
  isSticker: boolean;
}

// Camera angles
const CAM_ELEV = -0.45; // radians (~25 deg looking down)
const CAM_AZI = 0.65;   // radians (~37 deg rotation)

function applyCameraRotation(v: Vec3): Vec3 {
  let r = rotY(v, CAM_AZI);
  r = rotX(r, CAM_ELEV);
  return r;
}

const CUBIE_SIZE = 0.92;
const STICKER_SIZE = 0.82;
const GAP = (1 - CUBIE_SIZE) / 2;

interface FaceDef {
  normal: Vec3;
  dir: 'U'|'D'|'R'|'L'|'F'|'B';
  corners: (cx: number, cy: number, cz: number, offset: number, size: number) => Vec3[];
}

const FACE_DEFS: FaceDef[] = [
  { dir: 'U', normal: [0,1,0], corners: (x,y,z,o,s) => [
    [x-s, y+o, z-s], [x+s, y+o, z-s], [x+s, y+o, z+s], [x-s, y+o, z+s]
  ]},
  { dir: 'D', normal: [0,-1,0], corners: (x,y,z,o,s) => [
    [x-s, y-o, z+s], [x+s, y-o, z+s], [x+s, y-o, z-s], [x-s, y-o, z-s]
  ]},
  { dir: 'R', normal: [1,0,0], corners: (x,y,z,o,s) => [
    [x+o, y-s, z-s], [x+o, y-s, z+s], [x+o, y+s, z+s], [x+o, y+s, z-s]
  ]},
  { dir: 'L', normal: [-1,0,0], corners: (x,y,z,o,s) => [
    [x-o, y-s, z+s], [x-o, y-s, z-s], [x-o, y+s, z-s], [x-o, y+s, z+s]
  ]},
  { dir: 'F', normal: [0,0,1], corners: (x,y,z,o,s) => [
    [x-s, y-s, z+o], [x+s, y-s, z+o], [x+s, y+s, z+o], [x-s, y+s, z+o]
  ]},
  { dir: 'B', normal: [0,0,-1], corners: (x,y,z,o,s) => [
    [x+s, y-s, z-o], [x-s, y-s, z-o], [x-s, y+s, z-o], [x+s, y+s, z-o]
  ]},
];

export function renderCube(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cubies: Cubie[],
  animatingMove: MoveDefinition | null,
  animationProgress: number,
) {
  ctx.clearRect(0, 0, width, height);
  
  const fov = 8;
  const scale = Math.min(width, height) * 0.28;
  const faces: FaceQuad[] = [];

  for (const cubie of cubies) {
    const cx = cubie.x, cy = cubie.y, cz = cubie.z;
    
    // Check if this cubie is part of the animating layer
    let isAnimating = false;
    let moveAngle = 0;
    if (animatingMove) {
      const axisVal = animatingMove.axis === 'x' ? cx : animatingMove.axis === 'y' ? cy : cz;
      if (axisVal === animatingMove.layer) {
        isAnimating = true;
        moveAngle = animatingMove.dir * animationProgress * (animatingMove.angle * Math.PI / 180);
      }
    }

    const hs = CUBIE_SIZE / 2;
    const shs = STICKER_SIZE / 2;

    for (const fd of FACE_DEFS) {
      // Body face (black border)
      const bodyCorners = fd.corners(cx, cy, cz, hs, hs);
      let transformedBody = bodyCorners.map(v => {
        let tv: Vec3 = [v[0], v[1], v[2]];
        if (isAnimating) {
          // Rotate around the move axis (centered at origin)
          tv = rotateAroundAxis(tv, animatingMove!.axis, moveAngle);
        }
        tv = applyCameraRotation(tv);
        return tv;
      });

      const projBody = transformedBody.map(v => {
        const p = project(v, 0, 0, fov);
        return [p[0] * scale + width/2, p[1] * scale + height/2] as Vec2;
      });
      const depthBody = transformedBody.reduce((s, v) => s + v[2], 0) / 4;

      faces.push({
        verts3d: transformedBody,
        color: '#111111',
        depth: depthBody,
        isSticker: false,
      });

      // Sticker face
      const stickerColor = cubie.colors[fd.dir];
      if (stickerColor) {
        // Place sticker slightly outside the body face to ensure proper depth sorting
        const stickerCorners = fd.corners(cx, cy, cz, hs + 0.005, shs);
        let transformedSticker = stickerCorners.map(v => {
          let tv: Vec3 = [v[0], v[1], v[2]];
          if (isAnimating) {
            tv = rotateAroundAxis(tv, animatingMove!.axis, moveAngle);
          }
          tv = applyCameraRotation(tv);
          return tv;
        });

        const depthSticker = transformedSticker.reduce((s, v) => s + v[2], 0) / 4;

        // Lighting
        const sn = crossProduct(
          sub(transformedSticker[1], transformedSticker[0]),
          sub(transformedSticker[2], transformedSticker[0])
        );
        const snLen = Math.sqrt(sn[0]*sn[0] + sn[1]*sn[1] + sn[2]*sn[2]);
        const lightDir: Vec3 = [0.3, 0.6, 0.7];
        const lLen = Math.sqrt(lightDir[0]**2 + lightDir[1]**2 + lightDir[2]**2);
        const dot = (sn[0]*lightDir[0] + sn[1]*lightDir[1] + sn[2]*lightDir[2]) / (snLen * lLen);
        const brightness = 0.65 + 0.35 * Math.max(0, dot);

        faces.push({
          verts3d: transformedSticker,
          color: adjustBrightness(COLOR_MAP[stickerColor], brightness),
          depth: depthSticker,
          isSticker: true,
        });
      }
    }
  }

  // Sort by depth (painter's algorithm - far to near)
  faces.sort((a, b) => b.depth - a.depth);

  // Draw
  for (const face of faces) {
    const proj = face.verts3d.map(v => {
      const p = project(v, 0, 0, fov);
      return [p[0] * scale + width/2, p[1] * scale + height/2] as Vec2;
    });

    ctx.beginPath();
    ctx.moveTo(proj[0][0], proj[0][1]);
    for (let i = 1; i < proj.length; i++) {
      ctx.lineTo(proj[i][0], proj[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle = face.color;
    ctx.fill();
    
    if (face.isSticker) {
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}

function crossProduct(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1]*b[2] - a[2]*b[1],
    a[2]*b[0] - a[0]*b[2],
    a[0]*b[1] - a[1]*b[0],
  ];
}

function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgb(${Math.round(r*factor)},${Math.round(g*factor)},${Math.round(b*factor)})`;
}

// Particle system
export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export function createParticles(count: number, w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.3,
      life: Math.random() * 200,
      maxLife: 200 + Math.random() * 300,
    });
  }
  return particles;
}

export function updateAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number, h: number,
  intensity: number
) {
  for (const p of particles) {
    p.x += p.vx + Math.sin(p.life * 0.01) * 0.15;
    p.y += p.vy + Math.cos(p.life * 0.013) * 0.1;
    p.life++;

    if (p.life > p.maxLife || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.life = 0;
      p.maxLife = 200 + Math.random() * 300;
    }

    const lifeRatio = p.life / p.maxLife;
    const fadeIn = Math.min(lifeRatio * 5, 1);
    const fadeOut = Math.max(1 - (lifeRatio - 0.8) * 5, 0);
    const alpha = p.opacity * intensity * fadeIn * fadeOut;

    if (alpha > 0.005) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.8 + intensity * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }
  }
}
