// Poopy Goose, modelled in code to match the original character render (source/goose-3d.jpg) and
// turnaround video. Proportions below were measured off the render: the goose is 4 units tall
// (1 unit ≈ 369 px of the 2000 px render), feet at y = 0, facing +z.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export const COLORS = {
  feather: '#D8D2CC',   // warm light grey-white body
  head: '#DEDAD5',
  wing: '#C4BEB9',
  wingTip: '#ACA59F',
  wingEdge: '#8C6E5E',  // the brown stroke along the wing's lower edge
  orange: '#F26C10',
  eye: '#3A1A10',
  brow: '#4E2C20',
  sage: '#B7C7AB',
  sageSoft: '#DCE6D3',
  splat: '#A3BE91',
  mouth: '#962A2A',
  tongue: '#D9605B',
};

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---------- silhouette ----------
// Half-width of the goose at each height, measured off the render and the turnaround video.
// Body + neck are one lathe. The head is a second lathe, hinged at the top of the neck, that flares
// out quickly under the cheeks, so the only join is the jawline, in the shadow under the head.
const BODY_PROFILE = [
  [0.001, 0], [0.36, 0.07], [0.63, 0.24], [0.79, 0.5], [0.85, 0.8], [0.83, 1.1], [0.74, 1.38],
  [0.62, 1.6], [0.48, 1.77], [0.4, 1.88], [0.365, 1.98], [0.35, 2.1], [0.345, 2.3], [0.34, 2.5], [0.335, 2.65], [0.3, 2.75], [0.001, 2.8],
];
// Head features (eyes, bill, crest) are authored against this outline and then scaled/moved into
// place with it (HEAD_SCALE, HEAD_BASE), so the head can be resized without re-placing the face.
const HEAD_PROFILE = [
  [0.34, 2.22], [0.37, 2.32], [0.43, 2.43], [0.53, 2.55], [0.65, 2.68], [0.75, 2.83], [0.795, 2.98],
  [0.785, 3.12], [0.74, 3.3], [0.655, 3.48], [0.53, 3.65], [0.38, 3.79], [0.2, 3.9], [0.001, 3.95],
];
const HEAD_DEPTH = 1.04;
const HEAD_SCALE = 1.05;
const HEAD_BASE = 2.38; // where the authored head's y = 2.25 lands
const headY = y => HEAD_BASE + (y - 2.25) * HEAD_SCALE; // authored head height -> final height
// head lathe (final units): starts just inside the neck and funnels out gently into the cheeks (so
// it meets the neck at a shallow angle and the join doesn't show), then follows the head outline
const HEAD_PIVOT = 2.38;
const NECK_HEAD_PROFILE = [
  [0.334, 2.38], [0.341, 2.46], [0.35, 2.54], [0.38, 2.64], [0.44, 2.74], [0.53, 2.84], [0.63, 2.94],
  [0.72, 3.04], [0.785, 3.14], [0.82, 3.24], [0.826, 3.33],
  ...HEAD_PROFILE.filter(([, y]) => y >= 3.3).map(([r, y]) => [r * HEAD_SCALE, headY(y)]),
];
// the neck is deeper front-to-back than it is wide (clear in the turnaround's side views)
const NECK_DEPTH = 1.3;
const neckDepth = y => 1 + (NECK_DEPTH - 1) * smooth(1.55, 1.85, y);
const HEAD_FORWARD = 0.07; // the head sits a little in front of the neck (authored units)
const headForward = y => HEAD_FORWARD * smooth(2.45, 3.0, y);

function profilePoints(profile, n) {
  return new THREE.SplineCurve(profile.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(n);
}
// radius of a profile at height y (linear between sampled points)
function radiusAt(pts, y) {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if ((a.y - y) * (b.y - y) <= 0 && a.y !== b.y) return a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y);
  }
  return 0;
}
// a point on a lathe surface: `deg` degrees round from the front (+ = goose's left = viewer's right)
function onSurface(pts, y, deg, depth = 1, lift = 0, forward = 0) {
  const r = radiusAt(pts, y) + lift, a = THREE.MathUtils.degToRad(deg);
  return new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r * depth + forward);
}

// Lathe whose texture v follows height, with the seam at the back and smooth normals across it.
function latheMesh(pts, deform, mat, vRange) {
  const geo = new THREE.LatheGeometry(pts, 128, Math.PI);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const v = deform(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
    uv.setY(i, (pos.getY(i) - vRange[0]) / (vRange[1] - vRange[0]));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  // average the duplicated seam column so there is no hard line down the back
  const n = geo.attributes.normal, rows = pts.length, last = 128 * rows;
  for (let j = 0; j < rows; j++) {
    const a = j, b = last + j;
    const v = new THREE.Vector3(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize();
    n.setXYZ(a, v.x, v.y, v.z); n.setXYZ(b, v.x, v.y, v.z);
  }
  return new THREE.Mesh(geo, mat);
}

// ---------- surface paint ----------
// Body texture: u wraps round the goose (0.5 = front), v = height / 2.6.
function bodyTexture() {
  return canvasTexture(2048, 1024, (g, w, h) => {
    const X = u => u * w, Y = y => (1 - y / 2.6) * h; // y in model units
    g.fillStyle = COLORS.feather; g.fillRect(0, 0, w, h);
    // the neck shares the head's slightly lighter tone
    const neckFade = g.createLinearGradient(0, Y(2.3), 0, Y(1.75));
    neckFade.addColorStop(0, COLORS.head); neckFade.addColorStop(1, COLORS.feather);
    g.fillStyle = neckFade; g.fillRect(0, 0, w, Y(1.75));
    // soft warm-grey shading low on the body, like the render's ambient occlusion
    const shade = g.createLinearGradient(0, Y(0.9), 0, Y(0));
    shade.addColorStop(0, 'rgba(150,135,125,0)'); shade.addColorStop(1, 'rgba(150,135,125,0.28)');
    g.fillStyle = shade; g.fillRect(0, Y(0.9), w, h);

    // painterly grey brush strokes across the chest and neck base
    g.lineCap = 'round';
    const stroke = (u0, y0, u1, y1, wd, col) => { g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.moveTo(X(u0), Y(y0)); g.lineTo(X(u1), Y(y1)); g.stroke(); };
    g.filter = 'blur(6px)';
    for (const [u0, y0, u1, y1, wd] of [[0.4, 1.75, 0.44, 1.5, 26], [0.43, 1.85, 0.46, 1.62, 18], [0.57, 1.8, 0.6, 1.55, 24], [0.62, 1.6, 0.66, 1.35, 20], [0.36, 1.45, 0.39, 1.2, 22]]) {
      stroke(u0, y0, u1, y1, wd, 'rgba(170,163,158,0.5)');
    }
    // brownish smudges where the wing tucks into the body
    for (const [u0, y0, u1, y1] of [[0.3, 0.75, 0.38, 0.55], [0.64, 0.75, 0.7, 0.55]]) stroke(u0, y0, u1, y1, 30, 'rgba(140,110,94,0.35)');
    g.filter = 'none';

    // grey scalloped feathers across the lower back (u = 0/1 is the back), as in the turnaround's back view
    const feather = (u, y, rx, ry, col) => {
      for (const off of [0, -1, 1]) {
        g.fillStyle = col; g.beginPath(); g.ellipse(X(u + off), Y(y), rx, ry, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(120,110,104,0.55)'; g.lineWidth = 3; g.beginPath(); g.ellipse(X(u + off), Y(y), rx, ry, 0, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
      }
    };
    g.filter = 'blur(1.5px)';
    for (const [row, y, n, spread, col] of [[0, 1.05, 4, 0.2, '#CFC9C4'], [1, 0.82, 5, 0.24, '#C4BEB9'], [2, 0.58, 6, 0.27, '#B8B1AC']]) {
      for (let k = 0; k < n; k++) {
        const u = -spread / 2 + (k + 0.5) * spread / n + (row % 2 ? 0.01 : 0);
        feather((u + 1) % 1, y, 46, 60, col);
      }
    }
    g.filter = 'none';

    // the sage splat: one big blob low on the belly, fingers reaching up-left, a drip above, white spots
    const cx = X(0.535), cy = Y(0.7);
    g.filter = 'blur(1px)';
    g.fillStyle = g.strokeStyle = COLORS.splat;
    g.beginPath(); g.ellipse(cx, cy, 175, 215, 0.15, 0, Math.PI * 2); g.fill();
    for (const [dx, dy, wd] of [[-150, -190, 56], [-50, -290, 50], [85, -240, 54], [190, -90, 50], [-215, -20, 50], [180, 110, 56], [-140, 175, 54]]) {
      g.lineWidth = wd; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx, cy + dy); g.stroke();
      g.beginPath(); g.arc(cx + dx, cy + dy, wd * 0.62, 0, Math.PI * 2); g.fill();
    }
    // teardrop drip above the splat
    const dx = cx + 40, dy = cy - 400;
    g.beginPath(); g.moveTo(dx, dy - 50); g.quadraticCurveTo(dx + 32, dy, dx, dy + 22); g.quadraticCurveTo(dx - 32, dy, dx, dy - 50); g.fill();
    g.fillStyle = COLORS.feather;
    for (const [sx, sy, rx, ry] of [[50, 100, 32, 22], [-50, 185, 21, 16], [135, 40, 20, 15], [120, 185, 15, 11], [-120, 75, 14, 11], [15, -60, 17, 12], [185, 150, 10, 9], [-15, 260, 16, 12]]) {
      g.beginPath(); g.ellipse(cx + sx, cy + sy, rx, ry, 0.3, 0, Math.PI * 2); g.fill();
    }
    g.filter = 'none';
  });
}

// ---------- parts ----------
// A spatula-shaped bill: a sphere stretched along +z, flaring from base to a wide rounded tip.
// `baseW` is the width of the top (the bridge between the eyes); `baseWBottom` the width along the
// mouth line, which on the original is much wider so the smile runs back into the cheeks.
function billGeometry({ length, baseW, baseWBottom = baseW, tipW, baseH, tipH, droop = 0, flatTop = 1 }) {
  let geo = new THREE.SphereGeometry(1, 64, 40);
  geo.deleteAttribute('uv'); geo.deleteAttribute('normal');
  geo = mergeVertices(geo);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i); const z = p.getZ(i), t = (z + 1) / 2;
    const top = baseW + (tipW - baseW) * Math.pow(t, 0.55), bottom = baseWBottom + (tipW - baseWBottom) * Math.pow(t, 0.8);
    x *= bottom + (top - bottom) * smooth(-0.4, 0.6, y);
    y *= (baseH + (tipH - baseH) * t) * (y > 0 ? flatTop : 1);
    p.setXYZ(i, x, y - droop * t * t, t * length);
  }
  geo.computeVertexNormals();
  return geo;
}

// Webbed foot with three round toes, like a rubber toy. Toes point +y in the shape's plane.
function footGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.09, 0);
  s.quadraticCurveTo(-0.2, 0.18, -0.27, 0.36);
  s.absarc(-0.19, 0.42, 0.11, Math.PI * 1.05, Math.PI * 0.2, true);
  s.quadraticCurveTo(-0.07, 0.43, -0.08, 0.5);
  s.absarc(0, 0.5, 0.12, Math.PI, 0, true);
  s.quadraticCurveTo(0.07, 0.43, 0.1, 0.46);
  s.absarc(0.19, 0.42, 0.11, Math.PI * 0.8, -Math.PI * 0.05, true);
  s.quadraticCurveTo(0.2, 0.18, 0.09, 0);
  s.quadraticCurveTo(0, -0.06, -0.09, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 8, curveSegments: 24 });
  geo.translate(0, 0, -0.04);
  return geo;
}

// Folded wing: a flattened oval with a brown edge along the front/bottom, plus layered feather tips at the back.
function buildWing(side, mats) {
  const pivot = new THREE.Group();
  pivot.position.set(side * 0.76, 1.45, 0.25);
  pivot.rotation.set(0, side * -0.08, side * 0.06);

  let geo = new THREE.SphereGeometry(1, 64, 40);
  geo.deleteAttribute('uv'); geo.deleteAttribute('normal');
  geo = mergeVertices(geo);
  const p = geo.attributes.position, colors = [];
  const base = new THREE.Color(COLORS.wing), edge = new THREE.Color(COLORS.wingEdge), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) * side, y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(y, z); // 0 = front, -PI/2 = bottom
    const rim = (1 - smooth(0.25, 0.62, x)) * smooth(-0.35, 0.0, x);   // the outline band seen from outside
    const arc = smooth(0.9, 0.3, a) * smooth(-2.9, -2.2, a);           // front and underside only
    c.copy(base).lerp(edge, rim * arc * 0.85);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const main = new THREE.Mesh(geo, mats.wing);
  // the wing lies along the body's side: long front-to-back, back end lifted towards the tail
  main.scale.set(0.21, 0.6, 1.0);
  main.position.set(side * 0.12, -0.5, -0.55);
  main.rotation.x = 0.28;
  pivot.add(main);

  // layered flight feathers at the back of the wing, fanning back and up (rounded ends, like the render)
  for (let k = 0; k < 4; k++) {
    const tip = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), k % 2 ? mats.wingTip : mats.wingTip2);
    tip.scale.set(0.07, 0.14, 0.44 - k * 0.04);
    tip.position.set(side * (0.14 - k * 0.012), -0.12 - k * 0.15, -1.32 + k * 0.1);
    tip.rotation.x = -0.6 + k * 0.2;
    pivot.add(tip);
  }
  // covert feathers: three soft scallops across the top of the wing, as on the render's near wing
  for (let k = 0; k < 3; k++) {
    const cov = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), k % 2 ? mats.wingTip : mats.wingTip2);
    cov.scale.set(0.08, 0.2, 0.34);
    cov.position.set(side * 0.28, -0.32 - k * 0.06, -0.55 - k * 0.27);
    cov.rotation.set(0.45, 0, side * -0.15);
    pivot.add(cov);
  }
  pivot.userData.restZ = pivot.rotation.z;
  pivot.userData.side = side;
  return pivot;
}

// Builds the goose facing +z, sitting on y = 0, 4 units tall.
export function buildGoose() {
  const mat = {
    body: new THREE.MeshStandardMaterial({ map: bodyTexture(), roughness: 0.62 }),
    head: new THREE.MeshStandardMaterial({ color: COLORS.head, roughness: 0.6 }),
    wing: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.66 }),
    wingTip: new THREE.MeshStandardMaterial({ color: COLORS.wingTip, roughness: 0.66 }),
    wingTip2: new THREE.MeshStandardMaterial({ color: COLORS.wing, roughness: 0.66 }),
    orange: new THREE.MeshStandardMaterial({ color: COLORS.orange, roughness: 0.42 }),
    eye: new THREE.MeshStandardMaterial({ color: COLORS.eye, roughness: 0.12 }),
    shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    brow: new THREE.MeshStandardMaterial({ color: COLORS.brow, roughness: 0.7 }),
    mouth: new THREE.MeshStandardMaterial({ color: COLORS.mouth, roughness: 0.7 }),
    tongue: new THREE.MeshStandardMaterial({ color: COLORS.tongue, roughness: 0.5 }),
    nostril: new THREE.MeshStandardMaterial({ color: '#C4520E', roughness: 0.6 }),
  };

  const root = new THREE.Group(); root.name = 'PoopyGoose';
  const body = new THREE.Group(); body.name = 'body'; root.add(body);

  // Body + neck. The body is an egg that runs longer at the back (where the tail sits) than the front.
  const bodyPts = profilePoints(BODY_PROFILE, 120);
  const trunk = latheMesh(bodyPts, v => {
    // from the side the original is a long egg: much deeper at the back, rising into the tail
    const belly = smooth(1.75, 1.0, v.y) * smooth(0.0, 0.4, v.y);
    if (v.z < 0) { v.z *= 1 + 0.8 * belly; v.y += 0.24 * belly * (-v.z) * smooth(0.25, 1.1, v.y); }
    else v.z *= 1 + 0.22 * belly; // a full chest
    v.x *= 1 + 0.17 * belly;       // and a wider, bottom-heavy body seen from the front
    v.z *= neckDepth(v.y);
    return v;
  }, mat.body, [0, 2.6]);
  trunk.name = 'trunk';
  body.add(trunk);

  // Tail: three short feathers flicking up at the back
  for (const [x, ry, s] of [[0, 0, 1], [-0.17, 0.35, 0.85], [0.17, -0.35, 0.85]]) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), mat.wingTip);
    f.scale.set(0.24 * s, 0.17 * s, 0.55 * s);
    f.position.set(x, 1.2, -1.42);
    f.rotation.set(-0.7, ry, 0);
    body.add(f);
  }

  const wings = [buildWing(-1, mat), buildWing(1, mat)];
  wings.forEach(w => body.add(w));

  // Feet: wide apart at the front, toes up and splayed out (legs hidden, as in the render)
  const feet = [];
  const footGeo = footGeometry();
  for (const side of [-1, 1]) {
    const foot = new THREE.Group();
    foot.position.set(side * 0.56, 0.12, 0.64);
    foot.rotation.order = 'YXZ';
    foot.rotation.set(Math.PI / 2 - 0.95, side * 0.55, 0);
    foot.scale.setScalar(1.15);
    foot.add(new THREE.Mesh(footGeo, mat.orange));
    foot.userData.restX = foot.rotation.x;
    root.add(foot);
    feet.push(foot);
  }

  // Head: its own lathe hinged at the top of the neck so it can bob and honk.
  const neckTop = new THREE.Group(); neckTop.name = 'neckTop';
  neckTop.position.set(0, HEAD_PIVOT, 0);
  body.add(neckTop);
  const head = new THREE.Group(); head.name = 'head';
  head.position.set(0, -HEAD_PIVOT, 0); // parts are authored in body space; this cancels the pivot offset
  neckTop.add(head);

  const skull = latheMesh(profilePoints(NECK_HEAD_PROFILE, 140), v => {
    // as deep as the neck where it starts, blending into the rounder head; the head also sits a touch forward
    const k = smooth(2.5, headY(2.85), v.y);
    v.z = v.z * (NECK_DEPTH + (HEAD_DEPTH - NECK_DEPTH) * k) + headForward(2.25 + (v.y - HEAD_BASE) / HEAD_SCALE) * HEAD_SCALE;
    return v;
  }, mat.head, [1.7, 4.0]);
  head.add(skull);

  // Face features are authored against the unscaled head outline, then scaled into place with it.
  const face = new THREE.Group();
  face.scale.setScalar(HEAD_SCALE);
  face.position.set(0, HEAD_BASE - 2.25 * HEAD_SCALE, 0);
  head.add(face);
  const headPts = profilePoints(HEAD_PROFILE, 110);

  // small crest of head feathers, slightly back of the crown (seen in the turnaround video)
  for (const [x, rz, h] of [[0, 0, 0.2], [-0.06, 0.5, 0.12], [0.06, -0.5, 0.12]]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.06, h, 20), mat.head);
    cone.position.set(x, 3.92 + h * 0.3, -0.12);
    cone.rotation.set(-0.45, 0, rz);
    face.add(cone);
  }

  // Eyes: small, dark brown, taller than wide, either side of the bill's root
  const eyes = [];
  for (const side of [-1, 1]) {
    const at = onSurface(headPts, 3.32, side * 34, HEAD_DEPTH, 0, HEAD_FORWARD);
    const normal = new THREE.Vector3(at.x, 0.1, (at.z - HEAD_FORWARD) / HEAD_DEPTH).normalize();
    const eye = new THREE.Group();
    eye.position.copy(at);
    eye.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), mat.eye);
    ball.scale.set(0.108, 0.138, 0.064);
    eye.add(ball);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mat.shine);
    shine.scale.set(0.03, 0.033, 0.012);
    shine.position.set(side * 0.025, 0.042, 0.054);
    eye.add(shine);
    face.add(eye);
    eyes.push(eye);

    // Brows: short, thick brown arcs just above and outside the eyes
    const browAt = onSurface(headPts, 3.56, side * 38, HEAD_DEPTH, 0.01, HEAD_FORWARD);
    const brow = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.034, 10, 24, 1.1), mat.brow);
    brow.position.copy(browAt);
    brow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(browAt.x, 0.35, browAt.z - HEAD_FORWARD).normalize());
    brow.rotateZ(Math.PI / 2 - 0.55 + side * 0.12); // arc bulges upward, inner end a touch higher
    brow.translateY(-0.1);
    face.add(brow);
  }

  // Bill: a narrow bridge rising between the eyes, flaring to a broad rounded tip; the mouth line is
  // wide so the open smile runs back into the cheeks, with a thick lower lip just below.
  const bill = new THREE.Group();
  bill.position.set(0, 3.38, 0.44);
  bill.rotation.x = 0.36; // the bridge starts high between the eyes and the bill runs forward and a little down
  face.add(bill);
  const upper = new THREE.Mesh(billGeometry({ length: 0.92, baseW: 0.14, baseWBottom: 0.42, tipW: 0.47, baseH: 0.3, tipH: 0.12, droop: 0.08, flatTop: 1 }), mat.orange);
  bill.add(upper);
  for (const side of [-1, 1]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mat.nostril);
    nostril.scale.set(0.03, 0.016, 0.044);
    nostril.position.set(side * 0.08, 0.1, 0.38);
    nostril.rotation.x = -0.2;
    bill.add(nostril);
    // smile corners curling up into the cheeks
    const corner = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat.orange);
    corner.scale.set(0.06, 0.05, 0.13);
    corner.position.set(side * 0.37, -0.1, 0.12);
    corner.rotation.set(0, side * 0.5, side * 0.7);
    bill.add(corner);
  }
  // mouth interior sits under the upper bill; the jaw hinges open below it
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), mat.mouth);
  mouth.scale.set(0.31, 0.15, 0.3);
  mouth.position.set(0, -0.22, 0.46);
  bill.add(mouth);
  const jaw = new THREE.Group();
  jaw.position.set(0, -0.2, 0.22);
  bill.add(jaw);
  const lower = new THREE.Mesh(billGeometry({ length: 0.56, baseW: 0.34, tipW: 0.3, baseH: 0.12, tipH: 0.1, flatTop: 0.55 }), mat.orange);
  lower.position.set(0, -0.08, 0);
  jaw.add(lower);
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat.tongue);
  tongue.scale.set(0.13, 0.035, 0.13);
  tongue.position.set(0, 0.04, 0.26);
  jaw.add(tongue);
  jaw.rotation.x = 0.28; // resting open: the original goose is mid-laugh
  jaw.userData.restX = jaw.rotation.x;

  return { root, parts: { body, neckTop, head, jaw, wings, feet, eyes } };
}

// A soft round shadow and the little sage pond the goose sits on.
function ground(withPond = true) {
  const g = new THREE.Group();
  g.name = 'ground';
  const pond = new THREE.Mesh(
    new THREE.CircleGeometry(2.5, 96),
    new THREE.MeshBasicMaterial({ map: canvasTexture(512, 512, (c, w) => {
      const grad = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      grad.addColorStop(0, COLORS.sageSoft); grad.addColorStop(0.8, COLORS.sage); grad.addColorStop(0.985, COLORS.sage); grad.addColorStop(1, 'rgba(183,199,171,0)');
      c.fillStyle = grad; c.fillRect(0, 0, w, w);
    }), transparent: true, depthWrite: false }),
  );
  pond.rotation.x = -Math.PI / 2;
  pond.scale.set(0.82, 0.7, 1);
  pond.visible = withPond;
  g.add(pond);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 3.2),
    new THREE.MeshBasicMaterial({ map: canvasTexture(256, 256, (c, w) => {
      const grad = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      grad.addColorStop(0, 'rgba(72,35,25,0.55)'); grad.addColorStop(0.45, 'rgba(72,35,25,0.28)'); grad.addColorStop(1, 'rgba(72,35,25,0)');
      c.fillStyle = grad; c.fillRect(0, 0, w, w);
    }), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  shadow.scale.set(0.95, 0.85, 1);
  g.add(shadow);
  return g;
}

/**
 * Loads a goose from a .glb file (for example one made by an image-to-3D tool) and normalises it to
 * match the code-built goose: 4 units tall, centred, feet on y = 0. `yaw` turns it to face +z if the
 * file faces another way. Draco- and meshopt-compressed files both work.
 */
export async function loadGooseModel(url, { yaw = 0 } = {}) {
  const loader = new GLTFLoader();
  loader.setDRACOLoader(new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/'));
  loader.setMeshoptDecoder(MeshoptDecoder);
  const model = (await loader.loadAsync(url)).scene;
  const wrap = new THREE.Group(); wrap.name = 'PoopyGoose';
  wrap.add(model);
  model.rotation.y = yaw;
  const box = new THREE.Box3().setFromObject(wrap);
  model.scale.multiplyScalar(4 / (box.max.y - box.min.y));
  box.setFromObject(wrap);
  const centre = box.getCenter(new THREE.Vector3());
  model.position.set(-centre.x, -box.min.y, -centre.z);
  return wrap;
}

// A loaded model is one solid mesh (no separate jaw, wings or feet), so it gets stand-in parts and
// its moves become whole-body ones: lean-and-squash for honk, hop for flap, rock for wiggle.
const solidParts = model => {
  const stub = () => Object.assign(new THREE.Group(), { userData: { restX: 0, restZ: 0 } });
  return { body: model, neckTop: stub(), head: stub(), jaw: stub(), wings: [], feet: [], eyes: [] };
};

/**
 * Renders a live, interactive goose into `container`.
 * opts: { spin: idle turntable, yaw: starting angle, sway: gentle look-around instead of spinning,
 *         pond: false to drop the sage pond (shadow stays), camera: { fov, y, z, target } overrides,
 *         model: url of a .glb to show instead of the code-built goose, modelYaw: turn for that file }
 * Dispatches a `goose:tap` event on the container when tapped (not dragged).
 */
export function mountGoose(container, opts = {}) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  // soft studio lighting like the render: strong key from upper left, gentle fill, rim from behind
  const key = new THREE.DirectionalLight('#fff3e4', 2.2); key.position.set(-6, 6, 4); scene.add(key);
  const rim = new THREE.DirectionalLight('#e4ecff', 0.6); rim.position.set(5, 4, -6); scene.add(rim);
  scene.add(new THREE.HemisphereLight('#ffffff', '#e9dccd', 0.4));
  const bounce = new THREE.DirectionalLight('#ffe9d2', 0.3); bounce.position.set(0, -3, 6); scene.add(bounce); // warm light off the ground

  const cam = { fov: 26, y: 3.2, z: 11.6, target: 1.85, ...opts.camera };
  const camera = new THREE.PerspectiveCamera(cam.fov, 1, 0.1, 100);
  camera.position.set(0, cam.y, cam.z);
  camera.lookAt(0, cam.target, 0);

  scene.add(ground(opts.pond !== false));
  // With a .glb, start empty and fade the model in once it has loaded (falling back to the
  // code-built goose if it can't load); otherwise show the code-built goose straight away.
  let root, parts, rest, solid = false;
  const turntable = new THREE.Group();
  scene.add(turntable);
  const use = (r, p, isSolid) => {
    if (root) turntable.remove(root);
    root = r; parts = p; solid = isSolid;
    rest = { headPos: parts.head.position.clone(), neckRot: parts.neckTop.rotation.clone() };
    turntable.add(root);
  };
  const useBuilt = () => { const built = buildGoose(); use(built.root, built.parts, false); };
  if (opts.model) {
    const placeholder = new THREE.Group();
    use(placeholder, solidParts(placeholder), true);
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity .5s ease';
    loadGooseModel(opts.model, { yaw: opts.modelYaw || 0 })
      .then(model => use(model, solidParts(model), true))
      .catch(err => { console.warn('Could not load goose model, using the built-in one:', err); useBuilt(); })
      .finally(() => { renderer.domElement.style.opacity = '1'; });
  } else {
    useBuilt();
  }

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();

  // --- interaction: drag to spin with a little inertia, tap for a honk ---
  let yaw = opts.yaw || 0, velocity = 0, dragging = false, lastX = 0, lastT = 0, downX = 0, moved = 0;
  const idleSpin = opts.spin && !reduceMotion ? 0.45 : 0; // radians per second
  container.addEventListener('pointerdown', e => {
    dragging = true; moved = 0; velocity = 0; lastX = downX = e.clientX; lastT = e.timeStamp;
    container.classList.add('dragging');
    try { container.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
  });
  container.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dt = Math.max(1, e.timeStamp - lastT), k = 5 / container.clientWidth;
    yaw += dx * k;
    velocity = (dx * k) / (dt / 1000);
    moved = Math.max(moved, Math.abs(e.clientX - downX));
    lastX = e.clientX; lastT = e.timeStamp;
  });
  const endDrag = e => {
    if (!dragging) return;
    dragging = false;
    container.classList.remove('dragging');
    if (e.timeStamp - lastT > 80) velocity = 0;
    velocity = THREE.MathUtils.clamp(velocity, -8, 8);
    if (moved < 6 && e.type === 'pointerup') tap();
  };
  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);
  container.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { yaw -= 0.25; e.preventDefault(); }
    if (e.key === 'ArrowRight') { yaw += 0.25; e.preventDefault(); }
    if (e.key === 'Enter' || e.key === ' ') { tap(); e.preventDefault(); }
  });
  function tap() { honk(); container.dispatchEvent(new CustomEvent('goose:tap', { bubbles: true })); }

  // --- animations: each is a short clip layered over the idle pose ---
  const clips = [];
  const play = (name, dur) => { for (let i = clips.length - 1; i >= 0; i--) if (clips[i].name === name) clips.splice(i, 1); clips.push({ name, t0: performance.now(), dur }); };
  const honk = () => play('honk', 650);
  const flap = () => play('flap', 1100);
  const wiggle = () => play('wiggle', 1200);
  const blink = () => play('blink', 160);
  let nextBlink = performance.now() + 1500;

  let visible = true, last = performance.now();
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(frame); } }).observe(container);

  function pose(now) {
    const t = now / 1000;
    const { body, neckTop, head, jaw, wings, feet, eyes } = parts;
    // idle: breathe, bob, blink
    const breathe = reduceMotion ? 0 : Math.sin(t * 2.2);
    body.scale.set(1 + breathe * 0.008, 1 + breathe * 0.01, 1 + breathe * 0.008);
    neckTop.rotation.set(rest.neckRot.x + (reduceMotion ? 0 : Math.sin(t * 1.3) * 0.025), reduceMotion ? 0 : Math.sin(t * 0.7) * 0.07, reduceMotion ? 0 : Math.sin(t * 0.9) * 0.04);
    head.position.copy(rest.headPos);
    head.rotation.set(0, 0, 0);
    jaw.rotation.x = jaw.userData.restX + (reduceMotion ? 0 : Math.sin(t * 1.7) * 0.03);
    root.position.y = 0; root.rotation.x = 0; root.rotation.z = 0;
    for (const w of wings) w.rotation.z = w.userData.restZ;
    for (const f of feet) f.rotation.x = f.userData.restX;
    for (const e of eyes) e.scale.y = 1;
    if (!reduceMotion && now > nextBlink) { blink(); nextBlink = now + 2200 + Math.random() * 3200; }

    for (let i = clips.length - 1; i >= 0; i--) {
      const c = clips[i], p = (now - c.t0) / c.dur;
      if (p >= 1) { clips.splice(i, 1); continue; }
      const env = Math.sin(p * Math.PI);
      if (c.name === 'honk') {
        const s = Math.sin(Math.min(1, p * 1.6) * Math.PI) * (p < 0.62 ? 1 : 0);
        jaw.rotation.x += 0.45 * s;
        neckTop.rotation.x += 0.14 * s; // neck hinges forward from the shoulders
        body.scale.y *= 1 - 0.035 * s;
        if (solid) { root.rotation.x += 0.12 * s; body.scale.y *= 1 - 0.04 * s; } // no jaw: lean in and squash
      } else if (c.name === 'flap') {
        const beat = Math.abs(Math.sin(p * Math.PI * 3)) * env;
        for (const w of wings) w.rotation.z += w.userData.side * 1.0 * beat;
        root.position.y += (solid ? 0.25 : 0.12) * beat;
        if (solid) root.rotation.z += 0.06 * Math.sin(p * Math.PI * 6) * env;
        jaw.rotation.x += 0.15 * env;
      } else if (c.name === 'wiggle') {
        root.rotation.z += 0.13 * Math.sin(p * Math.PI * 4) * env;
        if (feet.length) {
          feet[0].rotation.x -= 0.35 * Math.max(0, Math.sin(p * Math.PI * 4)) * env;
          feet[1].rotation.x -= 0.35 * Math.max(0, -Math.sin(p * Math.PI * 4)) * env;
        }
        neckTop.rotation.z += 0.1 * Math.sin(p * Math.PI * 4 + 0.6) * env;
      } else if (c.name === 'blink') {
        for (const e of eyes) e.scale.y = 1 - 0.88 * env;
      }
    }
  }

  function frame(now) {
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!dragging) {
      yaw += (velocity + idleSpin) * dt;
      velocity *= Math.pow(0.04, dt); // fling settles back to the idle spin
    }
    turntable.rotation.y = yaw + (opts.sway && !reduceMotion ? Math.sin(now / 1600) * 0.25 : 0);
    pose(now);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    honk, flap, wiggle, blink, renderer, scene, camera,
    get root() { return root; }, get parts() { return parts; },
    setYaw: v => { yaw = v; velocity = 0; },
  };
}
