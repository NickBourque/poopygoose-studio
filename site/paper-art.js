// Paper-style 2D art: the goose (cut from the logo) and the paper scenery, drawn in the logo's style
// (thick brown outlines, white, orange and sage). Everything gets the logo's white sticker border.

export const INK = '#4A2418';
export const PAL = {
  white: '#FFFFFF', shade: '#E1E6DC', sage: '#AFC8A1', sageDeep: '#8FAE80',
  orange: '#FE8920', orangeDark: '#E06A10', orangeLight: '#FFC08A', mouth: '#B83A2E', tongue: '#F07C70',
  grass: '#B7C7AB', grassDeep: '#98B08A', trunk: '#9A6A4A', water: '#A9D3D8', waterDeep: '#86BFC6',
  cream: '#F6F1E7', sky: '#FFFFFF',
};
const LW = 13; // outline width at goose-frame scale

const path = d => new Path2D(d);
function fillStroke(g, p, fill, lw = LW) {
  g.fillStyle = fill; g.fill(p);
  g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(p);
}
function clipFill(g, clip, draw) { g.save(); g.clip(clip); draw(); g.restore(); }

// ---------- the goose ----------
// His head and body are cut straight from the logo, so they match it exactly:
// tools/make-goose-sprite.html builds assets/goose-sprite.png from source/logo.jpg. It holds the goose
// without his near wing and the logo's (sitting) feet ("under"), plus the pieces the animation moves.
// Legs and feet are drawn here in the logo's style so he can walk. All coordinates are logo pixels.
export const GOOSE_SRC = { x: 600, y: 400, w: 740, h: 880 };      // the goose's box in the logo
export const GOOSE_PARTS = {
  under: GOOSE_SRC,
  wing: { x: 688, y: 958, w: 296, h: 220 },
  blink: { x: 900, y: 535, w: 262, h: 95 },   // face patch with both eyes shut
  honk: { x: 925, y: 680, w: 200, h: 130 },   // face patch with the bill open
};
// the logo's own feet, which the sprite tool takes off (the walking feet replace them)
export const LOGO_FEET = [
  'M 895 1274 L 895 1186 L 906 1168 L 925 1161 L 945 1153 L 962 1144 L 980 1133 L 1002 1133 L 1022 1145 L 1048 1160 L 1066 1172 L 1066 1274 Z',
  'M 1196 1250 L 1196 1152 L 1230 1150 L 1260 1145 L 1282 1150 L 1298 1166 L 1302 1192 L 1314 1210 L 1314 1250 Z',
];
// The near wing (cut along this outline) lifts about the shoulder; when lifted it gets a top edge.
export const WING_OUTLINE = `M 800 982 L 775 988 L 748 1000 L 731 1016 L 729 1032 L 712 1046 L 694 1058 L 694 1074
  L 712 1090 L 725 1100 L 720 1116 L 722 1134 L 738 1152 L 775 1166 L 830 1170 L 885 1165 L 925 1150
  L 955 1125 L 972 1085 L 976 1040 L 968 1000 L 955 982 L 920 968 L 870 972 L 830 980 Z`;
const WING_PIVOT = [955, 992];
const WING_TOP = 'M 788 988 Q 874 952 957 991';
const PIECES = ['wing', 'blink', 'honk'];

/** Where each part sits in goose-sprite.png: "under" on top, the pieces in a row below it. */
export function goosePartsLayout() {
  const parts = { under: { x: 0, y: 0 } };
  let x = 0;
  for (const name of PIECES) { parts[name] = { x, y: GOOSE_SRC.h }; x += GOOSE_PARTS[name].w + 4; }
  return { parts, w: GOOSE_SRC.w, h: GOOSE_SRC.h + Math.max(...PIECES.map(n => GOOSE_PARTS[n].h)) };
}

let gooseSprite = null;
/** Loads the goose sprite; await it before drawGoose / gooseAtlas. */
export async function loadGoose(url = new URL('./assets/goose-sprite.png', import.meta.url).href) {
  if (!gooseSprite) gooseSprite = await createImageBitmap(await (await fetch(url)).blob());
  return gooseSprite;
}

// ---- legs and feet, in the logo's style: brown outline, orange, a lighter top ----
const LEG_INK = 'rgb(69,35,25)';                       // the logo's outline colour
const ORANGE = { near: 'rgb(246,140,40)', far: 'rgb(226,116,30)', light: 'rgb(252,178,92)' };
// webbed foot from the side, toes forward (right), ankle at the origin
const FOOT = path(`M -20 -6 C -8 -16 22 -16 46 -12 C 66 -9 82 -4 90 4 C 98 12 92 20 83 20 C 91 27 86 37 76 35
  C 74 44 62 46 54 39 L 6 33 C -12 33 -25 24 -25 11 C -25 3 -24 -2 -20 -6 Z`);
const FOOT_TOP = path('M -30 -30 L 100 -30 L 100 4 C 70 2 30 4 -30 10 Z');   // lit top of the foot
const TOE_LINES = path('M 82 20 C 72 18 63 16 55 15 M 75 35 C 66 31 57 28 48 27');
// hips sit up inside his body (which covers the top of each leg); ankles rest above the ground
const HIP = { near: [985, 1252], far: [1098, 1246] }, ANKLE_Y = { near: 1308, far: 1302 };
const FOOT_SCALE = 1.35;
// Gaits: stride is how far each foot travels either side of its hip, stepH how high it lifts, bob how
// far his body rises as each leg passes under him, rise how far the whole body is lifted off the hips
// (the legs stretch to reach the ground). The walk is the site's stroll; the run (the game's) takes
// long, high strides with his body up on his toes.
const GAITS = {
  walk: { stride: 40, stepH: 26, bob: 8, rise: 0 },
  run: { stride: 110, stepH: 52, bob: 14, rise: 20 },
};
// Skidding to a stop: body sunk, both feet braced out in front with the toes up, the wing out.
const SKID = { near: { dx: 78, lift: 12, rot: -0.38 }, far: { dx: 50, lift: 10, rot: -0.3 }, rise: -8, flap: 0.6 };

function legAndFoot(g, [hx, hy], ax, ay, rot, fill) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = LEG_INK; g.lineWidth = 34; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ax, ay); g.stroke();
  g.strokeStyle = fill; g.lineWidth = 15; g.stroke();
  g.save(); g.translate(ax, ay); g.rotate(rot); g.scale(FOOT_SCALE, FOOT_SCALE);
  g.fillStyle = fill; g.fill(FOOT);
  g.save(); g.clip(FOOT); g.fillStyle = fill === ORANGE.far ? ORANGE.near : ORANGE.light; g.fill(FOOT_TOP); g.restore();
  g.strokeStyle = LEG_INK; g.lineWidth = 17 / FOOT_SCALE; g.stroke(FOOT); g.lineWidth = 8 / FOOT_SCALE; g.stroke(TOE_LINES);
  g.restore();
}

// One leg at walk phase q (0-1): first half planted and sliding back as he moves forward, second half
// lifted and swinging forward. rot > 0 tips the toes down.
function legPose(q, { stride, stepH }) {
  const ease = t => t * t * (3 - 2 * t);
  if (q < 0.5) {
    const s = q / 0.5, push = ease(Math.max(0, (s - 0.7) / 0.3));   // heel peels up at the end
    return { dx: stride - 2 * stride * s, lift: push * 12, rot: push * 0.3 };
  }
  const s = (q - 0.5) / 0.5;
  return { dx: -stride + 2 * stride * ease(s), lift: Math.sin(Math.PI * s) * stepH, rot: 0.3 - 0.42 * s };
}

// logo px -> sprite frame: his box (x 640-1310, y 432-1368 with feet) scaled to fit the frame
export const TO_FRAME = { s: 0.76, ox: 640, oy: 440, x: 45, y: 44 };

/**
 * Draws one frame of the goose in logo pixels.
 * pose: { walk or run: phase 0-1 (or neither to stand), skid, blink, honk, flap (0-1), hop (logo px) }
 */
export function drawGooseParts(g, pose = {}) {
  if (!gooseSprite) throw new Error('drawGoose: await loadGoose() first');
  const { walk, run, skid = false, blink = false, honk = false, hop = 0 } = pose;
  const flap = pose.flap ?? (skid ? SKID.flap : 0);
  const layout = goosePartsLayout().parts;
  const part = name => { const r = GOOSE_PARTS[name], a = layout[name]; g.drawImage(gooseSprite, a.x, a.y, r.w, r.h, r.x, r.y, r.w, r.h); };
  const gait = run !== undefined ? GAITS.run : walk !== undefined ? GAITS.walk : null;
  const phase = run ?? walk;
  // body rises as each leg passes under him (twice a cycle), on top of the gait's lift
  const lift = gait ? gait.rise + gait.bob * Math.sin(2 * Math.PI * phase) ** 2 : skid ? SKID.rise : 0;
  g.save(); g.translate(0, -hop);
  for (const [side, offset] of [['far', 0.5], ['near', 0]]) {
    const p = gait ? legPose((phase + offset) % 1, gait) : skid ? SKID[side] : { dx: 0, lift: 0, rot: 0 };
    const [hx, hy] = HIP[side];
    legAndFoot(g, [hx, hy - lift], hx + p.dx, ANKLE_Y[side] - p.lift, p.rot, ORANGE[side]);
  }
  g.translate(0, -lift);
  part('under');
  g.save();
  if (flap) { g.translate(...WING_PIVOT); g.rotate(flap * 0.45); g.translate(-WING_PIVOT[0], -WING_PIVOT[1]); }
  part('wing');
  if (flap) { g.strokeStyle = INK; g.lineWidth = 18; g.lineCap = 'round'; g.stroke(path(WING_TOP)); }
  g.restore();
  if (blink) part('blink');
  if (honk) part('honk');
  g.restore();
}

/** Draws one frame of the goose into a 600 x 780 frame (see drawGooseParts for the pose). */
export function drawGoose(g, pose = {}) {
  g.save();
  g.translate(TO_FRAME.x, TO_FRAME.y); g.scale(TO_FRAME.s, TO_FRAME.s); g.translate(-TO_FRAME.ox, -TO_FRAME.oy);
  drawGooseParts(g, pose);
  g.restore();
}

// The goose's frames, in atlas order: standing ones, then an 8-step walk cycle (walk0-walk7).
export const WALK_FRAMES = 8;
export const GOOSE_FRAMES = [
  { name: 'idle' },
  { name: 'blink', blink: true },
  { name: 'honk', honk: true },
  { name: 'flap', flap: 1, hop: 10 },
  ...Array.from({ length: WALK_FRAMES }, (_, i) => ({ name: `walk${i}`, walk: i / WALK_FRAMES })),
];

// ---------- sticker border ----------
// Grows a white border round everything drawn on `src`, like the logo's sticker outline.
export function sticker(src, border = 16) {
  const w = src.width, h = src.height;
  const mask = document.createElement('canvas'); mask.width = w; mask.height = h;
  const mg = mask.getContext('2d');
  mg.filter = `blur(${border * 0.55}px)`; mg.drawImage(src, 0, 0); mg.filter = 'none';
  // threshold the blurred alpha into a smooth, grown silhouette
  const d = mg.getImageData(0, 0, w, h), px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3] / 255, t = Math.min(1, Math.max(0, (a - 0.04) / 0.1));
    px[i] = px[i + 1] = px[i + 2] = 255; px[i + 3] = Math.round(t * t * (3 - 2 * t) * 255);
  }
  mg.putImageData(d, 0, 0);
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const o = out.getContext('2d');
  o.drawImage(mask, 0, 0);
  o.drawImage(src, 0, 0);
  return out;
}

// Frame box and where his feet touch the ground (px), for standing the sprite on the floor.
export const GOOSE_FRAME = { w: 600, h: 780, groundY: 746, centerX: 300 };

/** Renders the goose frames into one atlas canvas (cols x rows). */
export function gooseAtlas({ frameW = GOOSE_FRAME.w, frameH = GOOSE_FRAME.h, cols = 4, scale = 1 } = {}) {
  const fw = frameW * scale, fh = frameH * scale;
  const rows = Math.ceil(GOOSE_FRAMES.length / cols);
  const atlas = document.createElement('canvas'); atlas.width = fw * cols; atlas.height = fh * rows;
  const ag = atlas.getContext('2d');
  GOOSE_FRAMES.forEach((pose, i) => {
    const f = document.createElement('canvas'); f.width = fw; f.height = fh;
    const g = f.getContext('2d'); g.scale(scale, scale);
    drawGoose(g, pose);
    ag.drawImage(sticker(f, 16 * scale), (i % cols) * fw, Math.floor(i / cols) * fh);
  });
  return { canvas: atlas, cols, rows, frames: GOOSE_FRAMES.map(f => f.name) };
}

// ---------- scenery ----------
// Each returns a canvas already given a sticker border; sizes are in px (scaled into the scene later).
function canvasOf(w, h, draw, border = 14) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.lineJoin = 'round'; g.lineCap = 'round';
  draw(g);
  return border ? sticker(c, border) : c;
}

export const scenery = {
  tree: (variant = 0) => canvasOf(420, 560, g => {
    fillStroke(g, path('M 196 540 L 206 330 L 226 330 L 236 540 Z'), PAL.trunk, 11);
    const canopy = variant ? path('M 210 40 C 300 40 360 110 350 190 C 380 230 370 320 300 340 C 260 370 160 370 120 340 C 50 320 40 230 72 190 C 62 110 122 40 210 40 Z')
      : path('M 210 30 C 310 30 380 120 370 210 C 366 300 300 360 210 360 C 120 360 54 300 50 210 C 40 120 110 30 210 30 Z');
    fillStroke(g, canopy, variant ? PAL.grassDeep : PAL.grass, 12);
    clipFill(g, canopy, () => { g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(160, 120, 90, 60, -0.4, 0, Math.PI * 2); g.fill(); });
    g.lineWidth = 12; g.strokeStyle = INK; g.stroke(canopy);
    // little leaf tufts (three-stroke "v" marks)
    g.lineWidth = 7;
    for (const [x, y] of [[140, 230], [270, 150], [262, 280], [110, 150]]) {
      g.beginPath(); g.moveTo(x - 16, y - 10); g.quadraticCurveTo(x - 6, y + 6, x, y + 10); g.quadraticCurveTo(x + 6, y + 6, x + 16, y - 10); g.stroke();
    }
  }),
  bush: () => canvasOf(360, 220, g => {
    const b = path('M 30 200 C 10 140 60 100 100 110 C 110 50 190 40 210 90 C 250 50 330 80 320 140 C 350 160 340 210 310 200 Z');
    fillStroke(g, b, PAL.grassDeep, 11);
    g.fillStyle = PAL.orange; for (const [x, y] of [[110, 140], [200, 120], [260, 160]]) { g.beginPath(); g.arc(x, y, 10, 0, Math.PI * 2); g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
  }),
  reeds: () => canvasOf(300, 420, g => {
    for (const [x, h, lean] of [[70, 300, -0.12], [130, 380, 0.04], [180, 330, 0.12], [215, 250, 0.2]]) {
      g.save(); g.translate(x, 410); g.rotate(lean);
      g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h); g.stroke();
      g.strokeStyle = PAL.grassDeep; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h); g.stroke();
      fillStroke(g, path(`M -14 ${-h + 30} C -14 ${-h - 30} 14 ${-h - 30} 14 ${-h + 30} C 14 ${-h + 70} -14 ${-h + 70} -14 ${-h + 30} Z`), PAL.trunk, 9);
      g.restore();
    }
    for (const [x, lean] of [[90, -0.5], [150, 0.4]]) {
      g.save(); g.translate(x, 410); g.rotate(lean);
      fillStroke(g, path('M 0 0 C -16 -80 -10 -150 6 -200 C 14 -150 16 -80 10 0 Z'), PAL.grass, 8);
      g.restore();
    }
  }),
  cloud: () => canvasOf(480, 240, g => {
    const c = path('M 70 190 C 20 190 20 120 70 116 C 70 60 150 40 190 80 C 220 30 320 30 340 90 C 400 70 450 120 420 170 C 440 200 400 214 370 200 Z');
    fillStroke(g, c, PAL.white, 11);
    clipFill(g, c, () => { g.fillStyle = '#EEF1EE'; g.beginPath(); g.ellipse(240, 230, 220, 50, 0, 0, Math.PI * 2); g.fill(); });
    g.lineWidth = 11; g.strokeStyle = INK; g.stroke(c);
  }),
  sun: () => canvasOf(300, 300, g => {
    g.strokeStyle = INK; g.lineWidth = 10;
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; g.beginPath(); g.moveTo(150 + Math.cos(a) * 92, 150 + Math.sin(a) * 92); g.lineTo(150 + Math.cos(a) * 128, 150 + Math.sin(a) * 128); g.stroke(); }
    fillStroke(g, path('M 150 70 A 80 80 0 1 1 149.9 70 Z'), '#FFC56B', 11);
  }),
  sign: () => canvasOf(520, 360, g => {
    fillStroke(g, path('M 240 340 L 250 170 L 278 170 L 288 340 Z'), PAL.trunk, 10);
    const board = path('M 40 50 L 480 40 L 488 190 L 36 200 Z');
    fillStroke(g, board, '#E9C79A', 11);
    g.fillStyle = INK; g.textAlign = 'center';
    g.font = '800 64px "Baloo 2", system-ui'; g.fillText('Poopy Goose', 262, 128);
    g.font = '800 30px "Nunito", system-ui'; g.fillStyle = '#26394E'; g.fillText('POND  →', 262, 172);
  }),
  flower: (color = PAL.white) => canvasOf(120, 200, g => {
    g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(60, 190); g.lineTo(60, 80); g.stroke();
    g.strokeStyle = PAL.grassDeep; g.lineWidth = 5; g.beginPath(); g.moveTo(60, 190); g.lineTo(60, 80); g.stroke();
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; fillStroke(g, path(`M ${60 + Math.cos(a) * 26} ${60 + Math.sin(a) * 26} m -16 0 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0`), color, 6); }
    fillStroke(g, path('M 60 60 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0'), '#FFC56B', 6);
  }, 10),
  bread: () => canvasOf(260, 180, g => {
    const loaf = path('M 30 150 C 20 90 60 40 130 40 C 200 40 240 90 230 150 Z');
    fillStroke(g, loaf, '#E7B47A', 11);
    g.strokeStyle = INK; g.lineWidth = 8; for (const x of [90, 130, 170]) { g.beginPath(); g.moveTo(x - 14, 70); g.lineTo(x + 8, 100); g.stroke(); }
  }),
  honk: () => canvasOf(360, 230, g => {
    const bubble = path('M 40 30 L 320 22 C 344 22 350 40 348 60 L 340 150 C 338 170 322 178 300 178 L 150 180 L 90 222 L 104 180 L 50 180 C 28 180 18 166 20 146 L 20 52 C 20 36 28 30 40 30 Z');
    fillStroke(g, bubble, PAL.white, 11);
    g.fillStyle = INK; g.textAlign = 'center'; g.font = '800 92px "Baloo 2", system-ui'; g.fillText('HONK!', 184, 136);
  }, 12),
  plop: () => canvasOf(160, 140, g => {
    const p = path('M 80 18 C 92 34 86 44 76 50 C 104 46 118 64 110 80 C 136 82 146 106 128 122 L 32 124 C 12 108 22 84 46 82 C 38 62 52 46 72 46 C 76 36 80 28 80 18 Z');
    fillStroke(g, p, '#7A4A32', 9);
    g.fillStyle = PAL.white; g.beginPath(); g.arc(66, 98, 7, 0, Math.PI * 2); g.arc(96, 98, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = INK; g.beginPath(); g.arc(68, 99, 3.5, 0, Math.PI * 2); g.arc(98, 99, 3.5, 0, Math.PI * 2); g.fill();
  }, 10),
};
