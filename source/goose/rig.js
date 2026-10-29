// Poopy Goose's vector rig: puts the goose together from the SVG art in this folder for any view and face.
// Used by tools/goose-model-sheet.html and by the game's frame exporter. All coordinates are logo px.
//
// Views: 'front' (traced from the logo), 'half' (the front turned 15°, made by bending the front's face
// round his head), '34' (turned 30°) and 'side' (profile). All face right. Faces: open eyes, blink, honk,
// in front only the logo's wink, and in 3/4 only eating bread (eat: 'gape', 'bite', 'chew-a' or 'chew-b';
// gulp: 1-3, the lump on its way down his neck; lunge: 0.5 or 1, his neck bent down to reach bread; peck,
// his neck stretched up and forward to pop a bubble with his bill). Legs aren't here: site/paper-art.js
// draws them.

// the logo's goose box, widened on the right for the side view's bill, the honk's reach and the lunge, and
// raised for the honk's neck
export const VIEWBOX = { x: 600, y: 340, w: 1060, h: 940 };
export const VIEWS = ['front', 'half', '34', 'side'];
const NECK_Y = 795;                      // the drawn heads replace everything above this
const FACE_X = 1027;                     // the front's bill centre line, for mirroring an eye
const HEAD = { cx: 1025, r: 180, billR: 132, billAhead: 128 };   // the head as a sphere, the bill ahead of it
const HALF_TURN = 15;
// Eating bread (3/4 view): the gape, the bite and two chews (goose-head-34.svg), then a gulp: a lump going
// down the front of his neck, at each of these points on its outline in turn (logo px).
const EAT_FACES = ['gape', 'bite', 'chew-a', 'chew-b'];
const GULP = [[1100, 838], [1114, 876], [1129, 914]];
// Reaching for bread where it sits (lunge: 0.5 on the way, 1 there), his neck stretches and bends up, over
// and down like a swan's, ending in a curl so his head tips forward rather than upside down:
// [stretch, how far it bends over (°), the head's tilt at the end (°)]. The bread in his bill sits at
// BITE_POINT (the bite face's chunk, logo px), so the game knows where his bill reaches.
const LUNGE = { 0.5: [1.7, 60, 28], 1: [2.3, 125, 48] };
const SHOULDER = [1029, 915];
const BITE_POINT = [1255, 695];
// Honking, his neck stretches: the head moves up and towards where he's pointing [dx, up] (logo px), far
// forward when he's turned, his eyes widen and his brows lift. The neck stretches between NECK_BASE (his
// shoulders stay put) and NECK_Y, easing into a curve.
const HONK_STRETCH = { front: [0, 46], half: [16, 46], '34': [84, 38], side: [96, 32] };
const HONK_EYES = 1.3, HONK_BROWS = 10;
const NECK_BASE = 915;
// Pecking (3/4: popping a co-op bubble with the tip of his bill), his neck stretches up and forward like the
// honk's, [dx, up] (logo px), his bill shut and his eyes wide on what he's aiming at.
const PECK_STRETCH = [150, 95];

const FILES = { front: 'goose-front.svg', extras: 'goose-front-extras.svg', '34': 'goose-head-34.svg', side: 'goose-head-side.svg' };

/** Loads the art. base: the URL of this folder (defaults to where this module lives). */
export async function loadGooseRig(base = new URL('./', import.meta.url)) {
  const docs = {};
  for (const [key, file] of Object.entries(FILES)) {
    const text = await (await fetch(new URL(`${file}?${Date.now()}`, base))).text();
    docs[key] = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
  }
  const group = (doc, id) => doc.querySelector(`g#${id}`);
  const html = el => (el ? el.outerHTML : '');

  // Front face pieces, as path markup that can be mirrored or bent.
  const frontPiece = id => group(docs.front, id) ?? group(docs.extras, id);
  const mapGroup = (el, fx) => {
    if (!el) return '';
    const copy = el.cloneNode(true);
    copy.removeAttribute('display');
    for (const p of copy.querySelectorAll('path')) p.setAttribute('d', mapPath(p.getAttribute('d'), fx));
    return copy.outerHTML;
  };
  const mirror = x => 2 * FACE_X - x;
  const same = x => x;

  // The front's face for one expression: brows, eyes, then the bill (and its honk) on top. Turned, the
  // eyes and brows bend round the head and the bill round its own front.
  // The logo winks with its far eye: open eyes mirror the near one across the bill, and a blink puts the
  // wink on both.
  function frontFace({ blink, honk, wink }, turn = 0) {
    const eyeFx = turn ? bendEye(turn) : same, billFx = turn ? bendBill(turn) : same;
    const open = frontPiece('eye-near'), winking = frontPiece('eye-far');
    const near = blink ? mapGroup(winking, x => eyeFx(mirror(x))) : mapGroup(open, eyeFx);
    const far = blink || wink ? mapGroup(winking, eyeFx) : mapGroup(open, x => eyeFx(mirror(x)));
    const brows = mapGroup(frontPiece('brow-near'), eyeFx) + mapGroup(frontPiece('brow-far'), eyeFx);
    const [ex, ey] = FRONT_EYE;
    return [
      honk ? `<g transform="translate(0 ${-HONK_BROWS})">${brows}</g>` : brows,
      honk ? `<g transform="${widen(eyeFx(ex), ey)}">${near}</g><g transform="${widen(eyeFx(mirror(ex)), ey)}">${far}</g>` : near + far,
      mapGroup(frontPiece('bill'), billFx),
      honk ? mapGroup(frontPiece('bill-honk'), billFx) : '',
    ].join('\n');
  }

  // A drawn head (3/4 or side) with its layers switched for the expression. Eating (3/4 only) swaps the
  // bill for the gape, bite or a chew, and chewing puffs his cheek; the gape, the bite and a gulp in
  // progress widen his eyes like a honk.
  function drawnHead(doc, view, { blink, honk, eat, gulp, peck }) {
    const copy = doc.cloneNode(true);
    const get = id => copy.querySelector(`g#${id}`);
    const show = (id, on) => { const g = get(id); if (!g) return; if (on) g.removeAttribute('display'); else g.remove(); };
    show('eye-near', !blink); show('eye-far', !blink); show('eye-near-shut', blink); show('eye-far-shut', blink);
    show('bill-lower', !honk && !eat); show('bill-upper', !honk && !eat); show('bill-honk', honk);
    for (const id of EAT_FACES) show(`bill-${id}`, eat === id);
    show('cheek-puff', eat === 'chew-a' || eat === 'chew-b');
    const wide = !blink && (honk || peck || eat === 'gape' || eat === 'bite' || gulp > 0);
    if (wide) {
      for (const [id, [cx, cy]] of Object.entries(DRAWN_EYES[view])) get(id)?.setAttribute('transform', widen(cx, cy));
      for (const id of ['brow-near', 'brow-far']) get(id)?.setAttribute('transform', `translate(0 ${-HONK_BROWS})`);
    }
    return [...copy.children].map(html).join('\n');
  }

  const bodyGroup = html(group(docs.front, 'body'));
  const wingGroup = html(group(docs.front, 'wing'));
  const clipped = (id, y, h, markup) =>
    `<defs><clipPath id="${id}"><rect x="${VIEWBOX.x}" y="${y}" width="${VIEWBOX.w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${markup}</g>`;

  // Stretches his neck: everything above NECK_Y moves by (dx, -up) and his shoulders stay. The points of
  // every path between are eased from one to the other, so the neck's outlines and shading bend in one
  // smooth curve and keep their thickness. The face's eyes, brows and trumpet (anything transformed or
  // drawn as an ellipse) sit above the neck and just move.
  function stretchNeck(markup, dx, up) {
    const ease = t => t * t * (3 - 2 * t);
    const warp = (x, y) => {
      const t = ease(Math.max(0, Math.min(1, (NECK_BASE - y) / (NECK_BASE - NECK_Y))));
      return [x + dx * t, y - up * t];
    };
    return warpMarkup(markup, warp, `translate(${dx} ${-up})`);
  }

  // Moves every path point of markup with warp, and gives anything drawn rigidly (transformed, or an
  // ellipse, circle or rect: parts of the face) the transform rigid instead.
  function warpMarkup(markup, warp, rigid) {
    const root = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`, 'image/svg+xml').documentElement;
    const isRigid = el => el.hasAttribute('transform') || el.querySelector('[transform], ellipse, circle, rect');
    const visit = el => {
      for (const child of el.children) {
        const tag = child.tagName;
        if (tag !== 'defs' && tag !== 'clipPath' && isRigid(child)) child.setAttribute('transform', `${rigid} ${child.getAttribute('transform') ?? ''}`);
        else if (tag === 'path') child.setAttribute('d', mapPathPoints(child.getAttribute('d'), warp));
        else visit(child);
      }
    };
    visit(root);
    return [...root.children].map(html).join('\n');
  }

  // Reaching for bread (3/4): the body below his neck, with the neck bent (neckBend) and its top cut off
  // where his head joins, and the head carried to the end of the neck.
  function lunge(head, amount) {
    const bend = neckBend(...LUNGE[amount]);
    // the body's neck band, a little wider than the neck where it meets his shoulders, cut off at its top
    const [cx] = SHOULDER, band = [];
    for (let y = NECK_BASE; y >= NECK_Y; y -= 4) band.push([cx - 130 + 38 * (NECK_BASE - y) / (NECK_BASE - NECK_Y), y]);
    for (let x = cx - 92; x <= cx + 92; x += 8) band.push([x, NECK_Y]);
    for (let y = NECK_Y; y <= NECK_BASE; y += 4) band.push([cx + 92 + 40 * (y - NECK_Y) / (NECK_BASE - NECK_Y), y]);
    const right = VIEWBOX.x + VIEWBOX.w, bottom = VIEWBOX.y + VIEWBOX.h;
    const outline = [[VIEWBOX.x, bottom], [VIEWBOX.x, NECK_BASE], ...band.map(([x, y]) => bend.warp(x, y)), [right, NECK_BASE], [right, bottom]];
    const d = 'M' + outline.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';
    return `<defs><clipPath id="rig-lunge-neck"><path d="${d}"/></clipPath></defs>` +
      `<g clip-path="url(#rig-lunge-neck)">${warpMarkup(bodyGroup, bend.warp, bend.matrix)}</g>` +
      `<g transform="${bend.matrix}">${head}</g>`;
  }

  return {
    /** Markup for his body and head in a view, with a face: { blink, honk, wink, eat, gulp, lunge, peck }. */
    figure(view, face = {}) {
      const front = view === 'front' || view === 'half';
      const peck = face.peck && view === '34';
      const [dx, up] = face.honk ? HONK_STRETCH[view] : peck ? PECK_STRETCH : [0, 0];
      const stretch = markup => (face.honk || peck ? stretchNeck(markup, dx, up) : markup);
      const head = view === 'front' ? frontFace(face)
        : view === 'half' ? frontFace({ ...face, wink: false }, HALF_TURN)
        : drawnHead(docs[view], view, face);
      if (view === '34' && face.lunge) return lunge(head, face.lunge);
      // a drawn head replaces the traced one above the neck (whose line rises with the stretch)
      const body = front ? stretch(bodyGroup) : clipped('rig-below-neck', NECK_Y - up, VIEWBOX.h, stretch(bodyGroup));
      return body + stretch(head) + (view === '34' && face.gulp ? gulpLump(...GULP[face.gulp - 1]) : '');
    },
    wing: () => wingGroup,
    /** Where the bread in his bill is (logo px) when he's reached for it (lunge 0.5 or 1). */
    bitePoint: amount => neckBend(...LUNGE[amount]).rigid(...BITE_POINT),
    /** Where the tip of his bill is (logo px) pecking: the shut bill's furthest point, carried by the stretch. */
    peckTip() {
      let tip = [-Infinity, 0];
      for (const p of docs['34'].querySelectorAll('g#bill-upper path')) {
        mapPathPoints(p.getAttribute('d'), (x, y) => { if (x > tip[0]) tip = [x, y]; return [x, y]; });
      }
      return [tip[0] + PECK_STRETCH[0], tip[1] - PECK_STRETCH[1]];
    },
    /** The whole goose (no legs) as one SVG document. */
    svg(view, face = {}, viewBox = VIEWBOX) {
      return svgDoc(this.figure(view, face) + this.wing(), viewBox);
    },
  };
}

// His neck bent for a lunge. Its centre line runs from his shoulders (SHOULDER, the bottom of the neck)
// stretch times as long as the neck, turning steadily clockwise to `over` degrees, then curling back to
// `tilt` at the top, where the head joins at that tilt. warp moves a point of the body's neck along it
// (keeping its distance from the centre line, so outlines keep their thickness); points above the neck
// move rigidly with the head (rigid, or the SVG transform matrix).
function neckBend(stretch, over, tilt) {
  const neck = SHOULDER[1] - NECK_Y, length = neck * stretch, steps = 80, rad = Math.PI / 180;
  const smooth = t => t * t * (3 - 2 * t);
  const angle = s => (s < 0.7 ? over * s / 0.7 : over + (tilt - over) * smooth((s - 0.7) / 0.3)) * rad;
  const centre = [[...SHOULDER]];
  for (let i = 0; i < steps; i++) {
    const a = angle((i + 0.5) / steps), [x, y] = centre[i];
    centre.push([x + Math.sin(a) * length / steps, y - Math.cos(a) * length / steps]);
  }
  const along = s => {
    const f = s * steps, i = Math.min(steps - 1, Math.floor(f)), k = f - i;
    return [centre[i][0] + (centre[i + 1][0] - centre[i][0]) * k, centre[i][1] + (centre[i + 1][1] - centre[i][1]) * k];
  };
  const [ex, ey] = centre[steps], cos = Math.cos(tilt * rad), sin = Math.sin(tilt * rad);
  const [jx, jy] = [SHOULDER[0], NECK_Y];
  const rigid = (x, y) => [ex + (x - jx) * cos - (y - jy) * sin, ey + (x - jx) * sin + (y - jy) * cos];
  const warp = (x, y) => {
    if (y >= SHOULDER[1]) return [x, y];
    if (y <= NECK_Y) return rigid(x, y);
    const s = (SHOULDER[1] - y) / neck, a = angle(s), [cx, cy] = along(s), u = x - SHOULDER[0];
    return [cx + u * Math.cos(a), cy + u * Math.sin(a)];
  };
  const r = n => Math.round(n * 1e4) / 1e4;
  const matrix = `matrix(${r(cos)} ${r(sin)} ${r(-sin)} ${r(cos)} ${r(ex - jx * cos + jy * sin)} ${r(ey - jx * sin - jy * cos)})`;
  return { warp, rigid, matrix };
}

// A swallowed mouthful bulging the front of his neck at (x, y), a point on its outline: skin over the
// outline there, and a rounder outline bulging out round it, like an Adam's apple.
function gulpLump(x, y) {
  const r = 34, cx = x + 12, a = 1.95;  // the arc runs from just above to just below, round the front
  const [x0, y0, x1, y1] = [cx + r * Math.cos(-a), y + r * Math.sin(-a), cx + r * Math.cos(a), y + r * Math.sin(a)];
  return `<circle fill="${SKIN}" cx="${x}" cy="${y}" r="${r - 3}"/>
    <path fill="${SKIN}" stroke="${INK}" stroke-width="16" stroke-linecap="round"
      d="M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 1 1 ${x1.toFixed(1)} ${y1.toFixed(1)}"/>`;
}
const INK = '#462418', SKIN = '#f4f5f4';

/** Wraps markup in an SVG document over the given box (logo px). */
export function svgDoc(markup, { x, y, w, h } = VIEWBOX) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${markup}</svg>`;
}

/** Loads SVG markup as an image (for drawing onto a canvas, where it stays sharp at any scale). */
export async function svgImage(svg) {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode();
  return img;
}

// eye centres, for widening them about their middles
const FRONT_EYE = [939, 578];            // the near eye; the far one is its mirror
const DRAWN_EYES = { '34': { 'eye-near': [1018, 577], 'eye-far': [1180, 572] }, side: { 'eye-near': [1076, 572] } };
const widen = (cx, cy) => `translate(${cx} ${cy}) scale(${HONK_EYES}) translate(${-cx} ${-cy})`;

// ---- bending the front face round his head ----
const clampU = u => Math.max(-1, Math.min(1, u));
// eyes and brows sit on the head's sphere
function bendEye(deg) {
  const t = deg * Math.PI / 180;
  return x => HEAD.cx + HEAD.r * Math.sin(Math.min(Math.PI / 2, Math.asin(clampU((x - HEAD.cx) / HEAD.r)) + t));
}
// the bill wraps round its own rounded front, set ahead of the face
function bendBill(deg) {
  const t = deg * Math.PI / 180;
  return x => HEAD.cx + HEAD.billAhead * Math.sin(t) + HEAD.billR * Math.sin(Math.min(Math.PI / 2, Math.asin(clampU((x - HEAD.cx) / HEAD.billR)) + t));
}

/** Maps the x of every point in path data made of absolute M, L, Q, C and Z commands. */
export function mapPath(d, fx) {
  return mapPathPoints(d, (x, y) => [fx(x), y]);
}

/** Maps every point (x, y) => [x, y] in path data made of absolute M, L, Q, C and Z commands. */
export function mapPathPoints(d, fxy) {
  const out = [];
  const tokens = d.match(/[MLQCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  let cmd = null, nums = [];
  const round = v => Math.round(v * 10) / 10;
  const flush = () => {
    if (!cmd) return;
    const mapped = [];
    for (let i = 0; i < nums.length; i += 2) mapped.push(...fxy(nums[i], nums[i + 1]).map(round));
    out.push(cmd + mapped.join(' '));
    nums = [];
  };
  for (const t of tokens) {
    if (/[MLQCZ]/i.test(t)) { flush(); cmd = t.toUpperCase(); if (cmd === 'Z') { out.push('Z'); cmd = null; } }
    else nums.push(parseFloat(t));
  }
  flush();
  return out.join('');
}
