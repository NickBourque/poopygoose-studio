// Poopy Goose's vector rig: puts the goose together from the SVG art in this folder for any view and face.
// Used by tools/goose-model-sheet.html and by the game's frame exporter. All coordinates are logo px.
//
// Views: 'front' (traced from the logo), 'half' (the front turned 15°, made by bending the front's face
// round his head), '34' (turned 30°) and 'side' (profile). All face right. Faces: open eyes, blink, honk,
// and in front only the logo's wink. Legs aren't here: site/paper-art.js draws them.

// the logo's goose box, widened on the right for the side view's bill and the honk's reach, and raised for
// the honk's neck
export const VIEWBOX = { x: 600, y: 340, w: 960, h: 940 };
export const VIEWS = ['front', 'half', '34', 'side'];
const NECK_Y = 795;                      // the drawn heads replace everything above this
const FACE_X = 1027;                     // the front's bill centre line, for mirroring an eye
const HEAD = { cx: 1025, r: 180, billR: 132, billAhead: 128 };   // the head as a sphere, the bill ahead of it
const HALF_TURN = 15;
// Honking, his neck stretches: the head moves up and towards where he's pointing [dx, up] (logo px), far
// forward when he's turned, his eyes widen and his brows lift. The neck stretches between NECK_BASE (his
// shoulders stay put) and NECK_Y, easing into a curve.
const HONK_STRETCH = { front: [0, 46], half: [16, 46], '34': [84, 38], side: [96, 32] };
const HONK_EYES = 1.3, HONK_BROWS = 10;
const NECK_BASE = 915;

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

  // A drawn head (3/4 or side) with its layers switched for the expression.
  function drawnHead(doc, view, { blink, honk }) {
    const copy = doc.cloneNode(true);
    const get = id => copy.querySelector(`g#${id}`);
    const show = (id, on) => { const g = get(id); if (!g) return; if (on) g.removeAttribute('display'); else g.remove(); };
    show('eye-near', !blink); show('eye-far', !blink); show('eye-near-shut', blink); show('eye-far-shut', blink);
    show('bill-lower', !honk); show('bill-upper', !honk); show('bill-honk', honk);
    if (honk) {
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
    const root = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`, 'image/svg+xml').documentElement;
    const rigid = el => el.hasAttribute('transform') || el.querySelector('[transform], ellipse, circle, rect');
    const visit = el => {
      for (const child of el.children) {
        const tag = child.tagName;
        if (tag !== 'defs' && tag !== 'clipPath' && rigid(child)) child.setAttribute('transform', `translate(${dx} ${-up}) ${child.getAttribute('transform') ?? ''}`);
        else if (tag === 'path') child.setAttribute('d', mapPathPoints(child.getAttribute('d'), warp));
        else visit(child);
      }
    };
    visit(root);
    return [...root.children].map(html).join('\n');
  }

  return {
    /** Markup for his body and head in a view, with a face: { blink, honk, wink }. */
    figure(view, face = {}) {
      const front = view === 'front' || view === 'half';
      const [dx, up] = face.honk ? HONK_STRETCH[view] : [0, 0];
      const stretch = markup => (face.honk ? stretchNeck(markup, dx, up) : markup);
      const head = view === 'front' ? frontFace(face)
        : view === 'half' ? frontFace({ ...face, wink: false }, HALF_TURN)
        : drawnHead(docs[view], view, face);
      // a drawn head replaces the traced one above the neck (whose line rises with the stretch)
      const body = front ? stretch(bodyGroup) : clipped('rig-below-neck', NECK_Y - up, VIEWBOX.h, stretch(bodyGroup));
      return body + stretch(head);
    },
    wing: () => wingGroup,
    /** The whole goose (no legs) as one SVG document. */
    svg(view, face = {}, viewBox = VIEWBOX) {
      return svgDoc(this.figure(view, face) + this.wing(), viewBox);
    },
  };
}

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
