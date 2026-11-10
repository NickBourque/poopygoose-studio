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
// (the legs stretch to reach the ground). contact is the share of a stride a foot is planted; below 0.5
// both feet leave the ground for a moment each step. push tips the toes down as the foot pushes off,
// reach lifts them as it swings forward. The walk is the site's stroll; the run (the game's) is a
// cartoon scamper: long reaching strides, high knees, a bouncing body and a hop between steps.
const GAITS = {
  walk: { stride: 40, stepH: 26, bob: 8, bobAt: 0, rise: 0, contact: 0.5, push: 0.3, reach: 0.12, heel: 12 },
  run: { stride: 180, stepH: 86, bob: 8, bobAt: 0.3, rise: 24, contact: 0.4, push: 0.75, reach: 0.45, heel: 24 },
};
// bobAt shifts the bob: walking he's highest as a leg passes under him; running, in the hop between steps
// Skidding to a stop: body sunk, both feet braced out in front with the toes up, the wing out.
const SKID = { near: { dx: 78, lift: 12, rot: -0.38 }, far: { dx: 50, lift: 10, rot: -0.3 }, rise: -8, flap: 0.6 };
// In the air (the game's jump): rising, legs trailing back from the push-off with the toes pointing down
// and back, the wing a little up; falling, legs dangling well down and reaching forward, toes up ready to
// land (the far foot higher and further ahead), and the wing half up. (A wingbeat lifts it all the way.)
const AIR = {
  rise: { near: { dx: -62, lift: 8, rot: 1.25 }, far: { dx: -48, lift: 22, rot: 1.15 }, flap: 0.3 },
  fall: { near: { dx: 44, lift: -50, rot: -0.35 }, far: { dx: 34, lift: -24, rot: -0.1 }, flap: 0.6 },
};

// Whose legs: where the hips and ankles are, how big the feet, the colours. The goose's by default; other
// birds (Bill) pass their own to drawGooseLegs.
export const GOOSE_LEGS = { hip: HIP, ankleY: ANKLE_Y, footScale: FOOT_SCALE, ink: LEG_INK, orange: ORANGE, width: [34, 15] };

function legAndFoot(g, [hx, hy], ax, ay, rot, side, legs) {
  const fill = legs.orange[side], s = legs.footScale;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = legs.ink; g.lineWidth = legs.width[0]; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ax, ay); g.stroke();
  g.strokeStyle = fill; g.lineWidth = legs.width[1]; g.stroke();
  g.save(); g.translate(ax, ay); g.rotate(rot); g.scale(s, s);
  g.fillStyle = fill; g.fill(FOOT);
  g.save(); g.clip(FOOT); g.fillStyle = side === 'far' ? legs.orange.near : legs.orange.light; g.fill(FOOT_TOP); g.restore();
  g.strokeStyle = legs.ink; g.lineWidth = 17 / s; g.stroke(FOOT); g.lineWidth = 8 / s; g.stroke(TOE_LINES);
  g.restore();
}

// One leg at phase q (0-1): first planted and sliding back as he moves forward (the gait's contact share
// of the stride), then lifted and swinging forward. rot > 0 tips the toes down.
function legPose(q, { stride, stepH, contact, push, reach, heel }) {
  const ease = t => t * t * (3 - 2 * t);
  if (q < contact) {
    const s = q / contact, peel = ease(Math.max(0, (s - 0.7) / 0.3));   // heel peels up at the end
    return { dx: stride - 2 * stride * s, lift: peel * heel, rot: peel * push };
  }
  const s = (q - contact) / (1 - contact);
  return { dx: -stride + 2 * stride * ease(s), lift: Math.sin(Math.PI * s) * stepH, rot: push - (push + reach) * s };
}

// logo px -> sprite frame: his box (x 640-1310, y 432-1368 with feet) scaled to fit the frame
export const TO_FRAME = { s: 0.76, ox: 640, oy: 440, x: 45, y: 44 };

/**
 * Draws his legs and feet for a pose (logo px) and returns how far his body is lifted above them. Shared
 * with other drawings of the goose (the game's vector rig) so they stand on the same legs, and with Bill,
 * who walks the same gaits on his own legs (pass them as legs, in his own px).
 */
export function drawGooseLegs(g, pose = {}, legs = GOOSE_LEGS) {
  const { walk, run, skid = false, air } = pose;
  const gait = run !== undefined ? GAITS.run : walk !== undefined ? GAITS.walk : null;
  const phase = run ?? walk;
  // body rises as each leg passes under him (twice a cycle), on top of the gait's lift
  const lift = gait ? gait.rise + gait.bob * Math.sin(2 * Math.PI * (phase + gait.bobAt)) ** 2 : skid ? SKID.rise : 0;
  for (const [side, offset] of [['far', 0.5], ['near', 0]]) {
    const p = gait ? legPose((phase + offset) % 1, gait) : air ? AIR[air][side] : skid ? SKID[side] : { dx: 0, lift: 0, rot: 0 };
    const [hx, hy] = legs.hip[side];
    legAndFoot(g, [hx, hy - lift], hx + p.dx, legs.ankleY[side] - p.lift, p.rot, side, legs);
  }
  return lift;
}

/**
 * Draws his near wing for a pose with draw(): lifted about the shoulder when flapping (or skidding), with
 * the top edge it shows when lifted.
 */
export function drawGooseWing(g, pose, draw) {
  const flap = pose.flap ?? (pose.skid ? SKID.flap : pose.air ? AIR[pose.air].flap : 0);
  g.save();
  if (flap) { g.translate(...WING_PIVOT); g.rotate(flap * 0.45); g.translate(-WING_PIVOT[0], -WING_PIVOT[1]); }
  draw();
  if (flap) { g.strokeStyle = INK; g.lineWidth = 18; g.lineCap = 'round'; g.stroke(path(WING_TOP)); }
  g.restore();
}

/**
 * Draws one frame of the goose in logo pixels.
 * pose: { walk or run: phase 0-1 (or neither to stand), skid, air ('rise' or 'fall'), blink, honk, flap (0-1),
 *   hop (logo px) }
 */
export function drawGooseParts(g, pose = {}) {
  if (!gooseSprite) throw new Error('drawGoose: await loadGoose() first');
  const { blink = false, honk = false, hop = 0 } = pose;
  const layout = goosePartsLayout().parts;
  const part = name => { const r = GOOSE_PARTS[name], a = layout[name]; g.drawImage(gooseSprite, a.x, a.y, r.w, r.h, r.x, r.y, r.w, r.h); };
  g.save(); g.translate(0, -hop);
  g.translate(0, -drawGooseLegs(g, pose));
  part('under');
  drawGooseWing(g, pose, () => part('wing'));
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
// setSceneryDetail(2) draws each one with twice the px in each direction, the same picture for wherever it's going to
// be big (the game's storybook, exported at 4K): whoever places it then says what size to draw it.
let sceneryDetail = 1;
export const setSceneryDetail = detail => { sceneryDetail = detail; };
function canvasOf(w, h, draw, border = 14) {
  const c = document.createElement('canvas'); c.width = Math.ceil(w * sceneryDetail); c.height = Math.ceil(h * sceneryDetail);
  const g = c.getContext('2d'); g.scale(sceneryDetail, sceneryDetail); g.lineJoin = 'round'; g.lineCap = 'round';
  draw(g);
  return border ? sticker(c, border * sceneryDetail) : c;
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
  cloud: () => canvasOf(480, 240, g => drawCloud(g)),
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
  slice: () => canvasOf(200, 210, g => drawSlice(g)),
  breadcrumb: (shape = 0) => canvasOf(128, 124, g => drawBreadcrumb(g, BREADCRUMB_SHAPES[shape])),
  honk: () => canvasOf(360, 230, g => {
    const bubble = path('M 40 30 L 320 22 C 344 22 350 40 348 60 L 340 150 C 338 170 322 178 300 178 L 150 180 L 90 222 L 104 180 L 50 180 C 28 180 18 166 20 146 L 20 52 C 20 36 28 30 40 30 Z');
    fillStroke(g, bubble, PAL.white, 11);
    g.fillStyle = INK; g.textAlign = 'center'; g.font = '800 92px "Baloo 2", system-ui'; g.fillText('HONK!', 184, 136);
  }, 12),
  plop: () => canvasOf(160, 140, g => drawPlop(g), 10),
};

// ---------- bread and plops (shared with the game) ----------
// Drawn once here: the site's scenery above and the game's art export (poopygoose-game's
// Tools/ArtExport/props.html) both use these, so the two never drift. Each draws into its own box (given
// with it) without a sticker border; the caller adds the border and any scale. lw is the ink line's width.

// The plop's colours: goose-poop olive with an off-white cap, the logo's chest splash grown up, and a halo
// halfway between them so the cap blends in without a line. Other foods swap all three (DESIGN.md).
export const PLOP = { body: '#7F9A5A', halo: '#B9C59E', cap: '#F4F1E2' };

// A plop, sitting on its bottom (y 124), in a 160 x 140 box: a low splat of rounded lobes stepping down to
// each side, its dome pulled up into a single peak flicked over to the right, a droplet flung off to the left.
// The pale cap fills the peak and fades into the body through the halo, with no ink between them. White googly
// eyes, pink cheeks and a little smile on the splat.
export function drawPlop(g, lw = 9, colours = PLOP) {
  const k = lw / 9;
  const body = path('M 19.6 124 C 9 124 9 107.2 21.7 107.2 C 23.8 97.6 30.2 92.8 38.7 92.8 C 34.4 80.8 42.9 73.6 51.4 78.4 C 55.6 66.4 63 60.4 70.5 58 C 74.7 47.2 81.1 40 89.5 35.2 C 86.4 42.4 85.3 49.6 87.4 58 C 95.9 60.4 104.4 67.6 106.5 78.4 C 115 71.2 125.6 76 123.5 88 C 131.9 88 138.3 97.6 136.2 107.2 C 148.9 107.2 151 124 138.3 124 Z');
  g.fillStyle = colours.body; g.fill(body);
  g.save(); g.clip(body);
  g.fillStyle = colours.halo; g.fill(path('M 40.8 95.2 C 40.8 66.4 62 11.2 81.1 11.2 C 100.1 11.2 117.1 66.4 117.1 92.8 C 108.6 90.4 104.4 100 95.9 96.4 C 87.4 92.8 81.1 102.4 70.5 97.6 C 59.9 92.8 49.3 102.4 40.8 95.2 Z'));
  g.fillStyle = colours.cap; g.fill(path('M 51.4 85.6 C 53.5 66.4 68.3 20.8 81.1 20.8 C 93.8 20.8 104.4 66.4 106.5 83.2 C 100.1 80.8 95.9 90.4 89.5 86.8 C 83.2 83.2 76.8 91.6 68.3 86.8 C 62 83.2 55.6 90.4 51.4 85.6 Z'));
  g.restore();
  g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(body);
  // the droplet flung off the left lobe
  g.beginPath(); g.arc(17.5, 85.6, 5, 0, Math.PI * 2);
  g.fillStyle = colours.body; g.fill(); g.lineWidth = lw * 0.6; g.stroke();
  // the face, its eyes 14 either side of x 80, y 106
  g.fillStyle = '#F5B4A0'; g.beginPath(); g.ellipse(51.4, 113.2, 7.5, 4.5, 0, 0, Math.PI * 2); g.ellipse(108.6, 113.2, 7.5, 4.5, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(66.2, 106, 7, 0, Math.PI * 2); g.moveTo(100.8, 106); g.arc(93.8, 106, 7, 0, Math.PI * 2);
  g.fillStyle = PAL.white; g.fill(); g.lineWidth = 2 * k; g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(67.2, 108, 3.5, 0, Math.PI * 2); g.arc(94.8, 108, 3.5, 0, Math.PI * 2); g.fill();
  g.lineWidth = 3.5 * k; g.stroke(path('M 73.6 114.4 Q 80 121.6 86.4 114.4'));
}

// The colours of each food's plops (GAME.md section 15): a new food is a new row here, and every frame below
// draws in it. Gold for the golden loaf, purple for blueberries.
export const PLOP_FOODS = {
  plain: PLOP,
  golden: { body: '#F0A43A', halo: '#FFC56B', cap: '#FFF3D6' },
  blueberry: { body: '#7E5A9B', halo: '#B9A5BE', cap: '#F4F1E2' },
};

// A plop's frames, in the order the game's sheets hold them: sitting (drawPlop), falling, squashed as it
// lands, splashed out flat the instant after, and splatted face on against a wall. All share the sitting
// plop's box and ground (y 124, middle x 80) but spill out of it: the splash is wider and the fall taller.
// The wall splat is centred on PLOP_WALL_CENTRE, where it hit. Same rules as the sitting one: rounded lobes,
// the pale cap blending in through the halo where the plop is thickest, ink only round the outside.
export const PLOP_FRAMES = ['rest', 'fall', 'squash', 'splash', 'wall'];
export const PLOP_WALL_CENTRE = { x: 80, y: 64 };

// The plop's face at (x, y): googly eyes `spread` either side, pupils pushed by `look`, cheeks, and a mouth:
// 'smile', 'o' (falling, delighted), 'squeeze' (eyes screwed shut as it lands), 'dazed' (crossed eyes, wobbly
// mouth) or 'oops' (a flat little line, looking down at its drips).
function plopFace(g, x, y, k, { spread = 13.8, eye = 7, look = [1, 2], mouth = 'smile' } = {}) {
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillStyle = '#F5B4A0'; g.beginPath();
  g.ellipse(x - spread * 2.07, y + 7.2, 7.5, 4.5, 0, 0, Math.PI * 2); g.ellipse(x + spread * 2.07, y + 7.2, 7.5, 4.5, 0, 0, Math.PI * 2);
  g.fill();
  if (mouth === 'squeeze') {
    g.lineWidth = 3 * k;
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(x + s * spread + s * 4, y - 4); g.lineTo(x + s * spread - s * 4, y); g.lineTo(x + s * spread + s * 4, y + 4); g.stroke();
    }
  } else {
    g.beginPath(); g.arc(x - spread, y, eye, 0, Math.PI * 2); g.moveTo(x + spread + eye, y); g.arc(x + spread, y, eye, 0, Math.PI * 2);
    g.fillStyle = PAL.white; g.fill(); g.lineWidth = 2 * k; g.stroke();
    const crossed = mouth === 'dazed', [lx, ly] = crossed ? [3, 0] : look;
    g.fillStyle = INK; g.beginPath();
    g.arc(x - spread + lx, y + ly, eye / 2, 0, Math.PI * 2); g.arc(x + spread + (crossed ? -lx : lx), y + ly, eye / 2, 0, Math.PI * 2);
    g.fill();
  }
  g.lineWidth = 3.5 * k; g.beginPath();
  if (mouth === 'smile') { g.moveTo(x - 6.4, y + 8.4); g.quadraticCurveTo(x, y + 15.6, x + 6.4, y + 8.4); g.stroke(); }
  else if (mouth === 'o') { g.ellipse(x, y + 12, 3.5, 4.5, 0, 0, Math.PI * 2); g.fillStyle = PAL.mouth; g.fill(); g.lineWidth = 2.5 * k; g.stroke(); }
  else if (mouth === 'squeeze') { g.moveTo(x - 7, y + 10); g.quadraticCurveTo(x, y + 17, x + 7, y + 10); g.stroke(); }
  else if (mouth === 'dazed') { g.moveTo(x - 8, y + 11); g.quadraticCurveTo(x - 4, y + 7, x, y + 11); g.quadraticCurveTo(x + 4, y + 15, x + 8, y + 11); g.stroke(); }
  else if (mouth === 'oops') { g.moveTo(x - 4.5, y + 11); g.lineTo(x + 4.5, y + 11); g.stroke(); }
}

// Fills a plop's body, with its halo and cap clipped inside it, and inks round the outside.
function plopBody(g, lw, colours, body, halo, cap) {
  g.fillStyle = colours.body; g.fill(body);
  g.save(); g.clip(body);
  g.fillStyle = colours.halo; g.fill(halo);
  g.fillStyle = colours.cap; g.fill(cap);
  g.restore();
  g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(body);
}
// Little flung droplets: [x, y, r] each.
function plopDrops(g, lw, colours, drops) {
  g.fillStyle = colours.body; g.strokeStyle = INK; g.lineWidth = lw * 0.6;
  for (const [x, y, r] of drops) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke(); }
}

// Draws one of PLOP_FRAMES.
export function drawPlopFrame(g, frame, lw = 9, colours = PLOP) {
  const k = lw / 9;
  if (frame === 'rest') return drawPlop(g, lw, colours);
  if (frame === 'fall') {
    // a fat drop, round at the bottom, its peak streaming up behind it and flicked over, two drops trailing
    plopBody(g, lw, colours,
      path('M 80 124 C 58 124 47 111 48 94 C 49 78 62 66 71 52 C 77 43 80 33 88 20 C 87 31 89 42 94 52 C 102 66 113 78 112 94 C 111 111 102 124 80 124 Z'),
      path('M 58 90 C 62 72 76 56 82 30 C 88 52 102 70 103 90 C 94 86 88 94 80 90 C 72 86 66 94 58 90 Z'),
      path('M 66 80 C 70 66 80 54 84 38 C 88 54 96 68 96 80 C 90 78 86 84 80 81 C 74 78 70 84 66 80 Z'));
    plopDrops(g, lw, colours, [[70, 24, 5], [102, 30, 3.5]]);
    plopFace(g, 80, 100, k, { spread: 12, eye: 7.5, look: [0, 3], mouth: 'o' });
    return;
  }
  if (frame === 'squash') {
    // landed: squashed into a wide pancake of lobes, the peak pushed down to a nub
    plopBody(g, lw, colours,
      path('M 14 124 C 2 124 2 108 14 107 C 18 99 28 96 38 99 C 44 92 56 89 66 91 C 72 85 80 82 88 83 C 86 86 86 89 88 92 C 100 90 112 93 118 99 C 128 95 140 100 140 108 C 152 108 156 124 144 124 Z'),
      path('M 30 110 C 40 96 64 88 84 87 C 104 88 120 98 128 110 C 110 108 104 114 92 111 C 80 108 72 114 60 111 C 48 108 40 114 30 110 Z'),
      path('M 46 104 C 56 95 72 90 84 90 C 98 92 108 98 112 104 C 104 102 98 107 90 105 C 82 103 74 107 66 105 C 58 103 52 107 46 104 Z'));
    plopFace(g, 80, 108, k, { spread: 15, mouth: 'squeeze' });
    return;
  }
  if (frame === 'splash') {
    // the instant after: spread flat in a puddle, round-headed splashes thrown up out of it and drops flying off
    plopBody(g, lw, colours,
      path('M -4 124 C -15 124 -14 110 -2 111 C 4 105 12 104 18 107 C 16 98 18 88 26 88 C 34 88 34 98 34 106 C 42 101 50 100 56 101 C 54 90 58 76 68 76 C 78 76 78 90 76 100 C 84 98 90 98 96 100 C 94 90 98 82 106 82 C 114 82 116 92 112 102 C 120 102 128 104 132 108 C 132 100 136 94 142 94 C 148 94 150 102 146 111 C 156 109 168 113 164 124 Z'),
      path('M 22 116 C 40 104 66 99 82 100 C 100 100 122 105 140 116 C 120 120 44 120 22 116 Z'),
      path('M 44 112 C 56 105 70 103 82 103 C 96 103 110 106 120 112 C 102 115 62 115 44 112 Z'));
    plopDrops(g, lw, colours, [[8, 78, 5], [46, 64, 4], [90, 56, 3.5], [124, 58, 5], [160, 82, 4]]);
    plopFace(g, 80, 110, k, { spread: 14, eye: 6.5, mouth: 'dazed' });
    return;
  }
  if (frame === 'wall') {
    // face on, stuck where it hit: a ring of rounded lobes about its middle, two drips running down, the pale
    // cap where it hit hardest. The drips are joined to it (inked behind, filled over), so it's all one shape.
    const { x: cx, y: cy } = PLOP_WALL_CENTRE, valley = 33;
    const lobes = [[0, 44], [0.7, 50], [1.35, 40], [2.0, 48], [2.65, 42], [3.3, 50], [3.95, 44], [4.6, 40], [5.3, 49]];
    const at = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const outline = new Path2D();
    lobes.forEach(([a0, reach], i) => {
      const a1 = i + 1 < lobes.length ? lobes[i + 1][0] : lobes[0][0] + Math.PI * 2;
      if (i === 0) outline.moveTo(...at(a0, valley));
      outline.bezierCurveTo(...at(a0 + (a1 - a0) * 0.1, reach * 1.18), ...at(a1 - (a1 - a0) * 0.1, reach * 1.18), ...at(a1, valley));
    });
    outline.closePath();
    const parts = [outline, path('M 61 96 L 61 112 C 61 122 73 122 73 112 L 73 96 Z'), path('M 94 94 L 94 104 C 94 111 102 111 102 104 L 102 94 Z')];
    g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = lw * 1.5;
    for (const p of parts) g.stroke(p);
    g.fillStyle = colours.body;
    for (const p of parts) g.fill(p);
    g.save(); g.clip(outline);
    g.fillStyle = colours.halo; g.beginPath(); g.ellipse(cx + 4, cy - 8, 30, 24, -0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = colours.cap; g.beginPath(); g.ellipse(cx + 6, cy - 11, 19, 14, -0.3, 0, Math.PI * 2); g.fill();
    g.restore();
    plopDrops(g, lw, colours, [[18, 40, 5], [146, 82, 4], [138, 22, 3.5]]);
    plopFace(g, cx, cy + 8, k, { spread: 13, look: [0, 3], mouth: 'oops' });
    return;
  }
  throw new Error(`no plop frame '${frame}'`);
}

// Bread's colours, shared with the chunk in the goose's bill (source/goose/goose-head-34.svg).
export const BREAD = { crust: '#D9964F', crumb: '#FBEBC8', pore: '#EDD3A2' };

// Breadcrumbs: torn chunks with crust on an edge or two, like the chunk in his bill when he bites. Several
// shapes, so a row of them never looks stamped out: a corner, a strip of the crust's edge, a round nugget and
// a wedge torn across. Each sits on y 104, its middle at x 64, in a 128 x 124 box.
export const BREADCRUMB_SHAPES = [
  { // a corner, crust along the top and right
    outline: 'M 24 40 L 86 28 C 102 26 110 36 108 52 L 102 100 L 90 94 L 80 102 L 66 95 L 54 103 L 42 96 L 28 100 L 31 86 L 21 76 L 29 64 L 19 52 Z',
    crust: 'M 24 40 L 86 28 C 102 26 110 36 108 52 L 102 100 L 90 94 L 95 54 C 96 45 92 41 84 42 L 26 54 Z',
    pores: [[50, 66, 5, 3], [72, 60, 4, 3], [62, 82, 6, 4], [40, 84, 4, 3]], shine: [44, 36, 64, 30, 82, 30],
  },
  { // a long strip off the crust's edge
    outline: 'M 12 60 L 102 50 C 114 49 120 58 116 68 L 112 98 L 100 91 L 88 100 L 74 93 L 60 101 L 46 94 L 32 101 L 20 93 L 10 99 L 14 84 L 8 72 Z',
    crust: 'M 12 60 L 102 50 C 114 49 120 58 116 68 L 113 80 L 104 74 C 104 67 101 64 95 64 L 11 74 Z',
    pores: [[34, 84, 5, 3], [62, 80, 6, 4], [90, 84, 4, 3]], shine: [26, 56, 52, 52, 82, 50],
  },
  { // a round nugget, crust capping its top
    outline: 'M 40 46 C 58 34 84 36 94 50 C 104 62 100 80 96 98 L 84 91 L 72 101 L 60 93 L 46 101 L 36 91 C 26 80 26 58 40 46 Z',
    crust: 'M 40 46 C 58 34 84 36 94 50 C 98 56 99 62 98 68 C 90 56 70 50 46 58 C 40 60 34 64 32 70 C 32 60 34 52 40 46 Z',
    pores: [[56, 76, 5, 3], [78, 72, 4, 3], [66, 88, 4, 3]], shine: [50, 46, 62, 40, 78, 41],
  },
  { // a wedge torn across from corner to corner, crust along the top and right
    outline: 'M 18 46 L 94 34 C 106 33 110 42 108 52 L 104 100 L 92 95 L 84 100 L 78 88 L 66 87 L 60 76 L 46 73 L 40 63 L 26 62 L 22 54 Z',
    crust: 'M 18 46 L 94 34 C 106 33 110 42 108 52 L 104 100 L 92 95 L 96 58 C 97 51 93 48 87 49 L 22 58 Z',
    pores: [[60, 64, 5, 3], [80, 70, 5, 3], [86, 86, 4, 3]], shine: [36, 42, 60, 36, 80, 36],
  },
];
export function drawBreadcrumb(g, shape, lw = 9) {
  const outline = path(shape.outline);
  g.fillStyle = BREAD.crumb; g.fill(outline);
  g.fillStyle = BREAD.crust; g.fill(path(shape.crust));
  g.fillStyle = BREAD.pore;
  for (const [x, y, rx, ry] of shape.pores) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
  g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(outline);
  const [x0, y0, cx, cy, x1, y1] = shape.shine;
  g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
}

// A whole slice of bread from a loaf: a puffy top, square sides, a flat bottom (y 190) and crust all round,
// its middle at x 100, in a 200 x 210 box. The goose's bread in the story; Bill tosses them in the game.
export function drawSlice(g, lw = 9) {
  fillStroke(g, path('M 40 190 L 40 84 C 10 74 10 24 50 22 C 70 10 130 10 150 22 C 190 24 190 74 160 84 L 160 190 Z'), BREAD.crust, lw);
  g.fillStyle = BREAD.crumb; g.fill(path('M 56 176 L 56 74 C 32 66 32 36 60 35 C 78 25 122 25 140 35 C 168 36 168 66 144 74 L 144 176 Z'));
  // air holes in the crumb, and a little shine on the crust
  g.fillStyle = BREAD.pore;
  for (const [x, y, rx, ry] of [[80, 70, 6, 4], [118, 58, 5, 3], [100, 104, 7, 4], [74, 132, 5, 4], [124, 140, 6, 4], [96, 158, 4, 3], [130, 96, 4, 3]]) {
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(64, 27); g.quadraticCurveTo(82, 20, 104, 20); g.stroke();
}

// The golden loaf, the game's prize: a whole tin loaf in sunny gold (gold means "a prize", never "use this"),
// sitting on y 234, its middle at x 160, in a 320 x 260 box. shimmer 0 is the plain loaf; 1 to steps is a band
// of light sweeping across it, left to right.
export const GOLD = { gold: '#FFC56B', deep: '#F0A43A' };
export function drawGoldenLoaf(g, shimmer = 0, steps = 6, lw = 9) {
  const outline = path('M 44 222 L 44 140 C 44 82 96 58 160 58 C 224 58 276 82 276 140 L 276 222 Q 276 234 264 234 L 56 234 Q 44 234 44 222 Z');
  g.fillStyle = GOLD.gold; g.fill(outline);
  // the domed top crust, baked darker
  g.fillStyle = GOLD.deep; g.fill(path('M 44 140 C 44 82 96 58 160 58 C 224 58 276 82 276 140 C 214 124 106 124 44 140 Z'));
  if (shimmer > 0) {
    // the band of light, slanted, clipped to the loaf
    const x = shimmer * 300 / (steps + 1) + 10;
    g.save(); g.clip(outline);
    g.fillStyle = 'rgba(255,255,255,0.65)';
    g.fill(path(`M ${x + 30} 40 L ${x + 76} 40 L ${x - 6} 250 L ${x - 52} 250 Z`));
    g.restore();
  }
  // the baker's scores, a shine on the dome and down the side, and the ink outline over it all
  g.strokeStyle = INK; g.lineWidth = 7; g.lineCap = 'round';
  for (const [x, y] of [[104, 86], [152, 76], [200, 82]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 18, y + 28); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 8;
  g.beginPath(); g.moveTo(68, 116); g.quadraticCurveTo(82, 82, 120, 70); g.stroke();
  g.beginPath(); g.moveTo(66, 156); g.lineTo(66, 208); g.stroke();
  g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(outline);
}

// A four-pointed glint that twinkles around the golden loaf, its middle at (40, 40) in an 80 x 80 box.
export function drawGlint(g) {
  fillStroke(g, path('M 40 10 Q 40 40 70 40 Q 40 40 40 70 Q 40 40 10 40 Q 40 40 40 10 Z'), PAL.white, 5);
  g.fillStyle = GOLD.gold; g.beginPath(); g.arc(40, 40, 5, 0, Math.PI * 2); g.fill();
}

// ---------- clouds (shared with the game) ----------
// A puffy white cloud with a soft grey belly, sitting on y 214, its middle at x 240, in a 480 x 240 box. The
// site hangs them in the sky; the game's honkable cloud (props.html) and its sky are this drawing too.
export function drawCloud(g, lw = 11) {
  const c = path('M 70 190 C 20 190 20 120 70 116 C 70 60 150 40 190 80 C 220 30 320 30 340 90 C 400 70 450 120 420 170 C 440 200 400 214 370 200 Z');
  fillStroke(g, c, PAL.white, lw);
  clipFill(g, c, () => { g.fillStyle = '#EEF1EE'; g.beginPath(); g.ellipse(240, 230, 220, 50, 0, 0, Math.PI * 2); g.fill(); });
  g.lineWidth = lw; g.strokeStyle = INK; g.stroke(c);
}
