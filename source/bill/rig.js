// Bill the duck's rig: puts him together from his traced master (bill-34.svg, traced from the creator's
// drawing bill-sketch.jpg by tools/trace-bill.html) for a pose and a face. Used by tools/bill-model-sheet.html
// and, later, the game's frame exporter. Coordinates are Bill px (his drawing at half size), facing right.
//
// He stays turned 3/4 (his master's view): his grumpy side-long look is his character, and the paper flip
// turns him round. Poses: 'crossed' (wings folded across his chest, the master: standing about) and
// 'free' (wings folded at his sides, for moving: a torso drawn to match the master, under its head, neck,
// tail and feet). Faces: 'grumpy' (the master's: lids low over his pupils), 'blink', 'stare' (The Stare:
// eyes opened flat on pinprick pupils), 'roll' (rolling his eyes, for the Bread Toss) and 'cough' (in the
// goose's stink: eyes popped wide and round, his bill dropped open on his tongue and swinging uvula). New
// faces are drawn over his eyes, on patches of his head's green. Free, he can also peck (popping a co-op
// bubble with the tip of his bill): his neck stretches up and forward. Coughing, his near wing comes up in a
// fist in front of his bill, as a proper duck's does: fist().

import { mapPathPoints } from '../goose/rig.js';

export const VIEWBOX = { x: 0, y: 0, w: 671, h: 1000 };
export const POSES = ['crossed', 'free'];
export const FACES = ['grumpy', 'blink', 'stare', 'roll', 'cough'];
// Where he stands: his feet's soles (Bill px), and his body's middle, over them.
export const GROUND_Y = 980, CENTRE_X = 400;
// His legs, for site/paper-art.js's drawGooseLegs (he walks the goose's gaits): hips up inside his body,
// ankles placed so the feet land where the master's do, his orange.
export const LEGS = {
  hip: { near: [520, 848], far: [385, 844] }, ankleY: { near: 936, far: 930 }, footScale: 1.1, ink: '#512c1e',
  orange: { near: '#d8792d', far: '#b8601f', light: '#ec9a55' }, width: [30, 14],
};
// His near wing (the free pose's) turns about his shoulder to flap and to toss a crust.
export const WING_PIVOT = [540, 600];

const INK = '#512c1e', GREEN = '#2b6141', WHITE = '#f2f2ee';
const BODY = '#92877e', BODY_LIGHT = '#b5aaa3', WING = '#8b8079', WING_SHADE = '#6e6262';
const BELLY = '#c6c6c6', BELLY_SHADE = '#a6a4a7', MAROON = '#50282a', MAROON_LIGHT = '#835b59', SPECKLE = '#786a69';

// His eyes on the master (Bill px): each a thick lid bar with a half-round pupil under it.
const EYES = {
  near: { lid: [304, 200, 380, 210], pupil: [343, 211, 13], patch: [298, 194, 386, 231] },
  far: { lid: [472, 201, 535, 211], pupil: [503, 211, 11], patch: [466, 195, 537, 229] },
};
// Where the master's parts are, for the free pose: the head and neck above NECK_Y, the feet below FEET_Y,
// and the tail inside TAIL: its green curls and pale underside, cut along the ink line where its
// underside meets his body, down to his belly.
const NECK_Y = 521, FEET_Y = 866;
// Pecking, everything above HEAD_Y (his head) moves by PECK_STRETCH [dx, up] (Bill px), and his green neck
// between there and NECK_Y stretches, easing into it, so its outlines keep one smooth curve.
const HEAD_Y = 380, PECK_STRETCH = [110, 90];
const TAIL = [[0, 520], [176, 520], [176, 580], [160, 600], [150, 640], [142, 660], [112, 676], [152, 690],
  [160, 705], [130, 720], [148, 735], [196, 750], [244, 765], [250, 792], [0, 792]];

// The free pose's torso outline (the ink's centre line), measured off the master so it meets its neck,
// tail and feet: from the left of his neck, down his back to the tail (under it), round his lower left as
// the master does, under him and up his front.
const TORSO = [[329, 500], [320, 509], [300, 523], [280, 532], [260, 539], [240, 546], [220, 554], [200, 563],
  [180, 573], [168, 580], [150, 620], [110, 660], [90, 700], [80, 762], [100, 801], [120, 828], [140, 847],
  [160, 861], [180, 861], [240, 862], [300, 863],
  [360, 862], [420, 861], [470, 858], [500, 850], [520, 845], [540, 833], [560, 815], [580, 788], [600, 752],
  [620, 730], [634, 690], [632, 656], [620, 614], [600, 590], [580, 571], [560, 553], [540, 529], [521, 500]];

/** Loads his master. base: the URL of this folder (defaults to where this module lives). */
export async function loadBillRig(base = new URL('./', import.meta.url)) {
  const text = await (await fetch(new URL(`bill-34.svg?${Date.now()}`, base))).text();
  const master = text.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<!--[\s\S]*?-->/g, '');
  const clipped = (id, d, markup) => `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${markup}</g>`;
  const box = (x0, y0, x1, y1) => `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`;

  return {
    /**
     * Markup for Bill in a pose with a face. feet: false leaves his feet off (legs drawn separately); wing:
     * false leaves the free pose's near wing off (drawn separately, to turn: wing()); peck (free only)
     * stretches his neck, raising his head by up to PECK_STRETCH (above the VIEWBOX: draw into a taller box).
     * uvula (the cough face) swings his uvula this far, in radians (+ swings it forward).
     */
    figure(pose = 'crossed', face = 'grumpy', { feet = true, wing = true, peck = false, uvula = 0 } = {}) {
      const eyes = (face === 'grumpy' ? '' : drawEyes(face)) + (face === 'cough' ? coughMouth(uvula) : '');
      if (pose === 'crossed') {
        return (feet ? master : clipped('bill-no-feet', box(0, 0, VIEWBOX.w, FEET_Y), master)) + eyes;
      }
      // free: the drawn torso, then the master's tail, head and neck (and feet) over it
      const [dx, up] = peck ? PECK_STRETCH : [0, 0];
      return torso(wing)
        + clipped('bill-tail', 'M' + TAIL.map(p => p.join(' ')).join('L') + 'Z', master)
        + clipped('bill-head', box(0, -up, VIEWBOX.w + dx, NECK_Y), peck ? stretchNeck(master) : master)
        + (feet ? clipped('bill-feet', box(0, FEET_Y, VIEWBOX.w, VIEWBOX.h), master) : '')
        + (peck && eyes ? `<g transform="translate(${dx} ${-up})">${eyes}</g>` : eyes);
    },
    /** Where the tip of his bill is (Bill px) pecking: his head's furthest point forward, carried by the stretch. */
    peckTip() {
      let tip = [-Infinity, 0];
      for (const [, d] of master.matchAll(/ d="([^"]*)"/g)) {
        mapPathPoints(d, (x, y) => { if (y < HEAD_Y && x > tip[0]) tip = [x, y]; return [x, y]; });
      }
      return [tip[0] + PECK_STRETCH[0], tip[1] - PECK_STRETCH[1]];
    },
    /** The free pose's near wing on its own, for turning about WING_PIVOT. */
    wing: () => wingMarkup(),
    /** Coughing, his near wing raised in a fist a short way in front of his bill (in place of wing()). */
    fist: () => fistMarkup(),
  };
}

// Stretches his neck for a peck (every point of the master's paths: the head clip keeps only the head and neck).
function stretchNeck(markup) {
  const [dx, up] = PECK_STRETCH, ease = t => t * t * (3 - 2 * t);
  const warp = (x, y) => {
    const t = ease(Math.max(0, Math.min(1, (NECK_Y - y) / (NECK_Y - HEAD_Y))));
    return [x + dx * t, y - up * t];
  };
  return markup.replace(/ d="([^"]*)"/g, (_, d) => ` d="${mapPathPoints(d, warp)}"`);
}

// A new pair of eyes over the master's: his head's green over the old ones, then the face.
function drawEyes(face) {
  const out = [];
  for (const side of ['near', 'far']) {
    const { lid: [x0, y0, x1, y1], pupil: [px, py, r], patch: [a, b, c, d] } = EYES[side];
    const lidBar = `<path fill="${INK}" d="M${x0 + 5} ${y0}L${x1 - 5} ${y0}Q${x1} ${y0} ${x1} ${(y0 + y1) / 2}Q${x1} ${y1} ${x1 - 5} ${y1}L${x0 + 5} ${y1}Q${x0} ${y1} ${x0} ${(y0 + y1) / 2}Q${x0} ${y0} ${x0 + 5} ${y0}Z"/>`;
    out.push(`<rect fill="${GREEN}" x="${a}" y="${b}" width="${c - a}" height="${d - b}" rx="10"/>`);
    if (face === 'blink') {
      // shut: the lid comes down, a little crease under it
      out.push(lidBar.replace(`d="M${x0 + 5} ${y0}`, `transform="translate(0 6)" d="M${x0 + 5} ${y0}`));
      out.push(`<path fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" d="M${x0 + 10} ${y1 + 10}Q${px} ${y1 + 15} ${x1 - 10} ${y1 + 9}"/>`);
    } else if (face === 'stare') {
      // The Stare: lids up, eyes open flat and wide on pinprick pupils
      const rx = (x1 - x0) / 2 - 4, cx = (x0 + x1) / 2, cy = y1 + 4;
      out.push(`<ellipse fill="${WHITE}" stroke="${INK}" stroke-width="6" cx="${cx}" cy="${cy}" rx="${rx}" ry="${r + 3}"/>`);
      out.push(`<circle fill="${INK}" cx="${px + 2}" cy="${cy + 2}" r="${r * 0.42}"/>`);
      out.push(lidBar.replace(`d="M${x0 + 5} ${y0}`, `transform="translate(0 -4)" d="M${x0 + 5} ${y0}`));
    } else if (face === 'cough') {
      // coughing: lids shot up, eyes popped wide and round on small pupils
      const rx = (x1 - x0) / 2 - 2, ry = side === 'near' ? 21 : 16, cx = (x0 + x1) / 2, cy = y1 + 2;
      out.push(`<ellipse fill="${WHITE}" stroke="${INK}" stroke-width="6" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`);
      out.push(`<circle fill="${INK}" cx="${px + 3}" cy="${cy}" r="${r * 0.5}"/>`);
      out.push(lidBar.replace(`d="M${x0 + 5} ${y0}`, `transform="translate(0 ${cy - ry - 4 - y1})" d="M${x0 + 5} ${y0}`));
    } else if (face === 'roll') {
      // rolling his eyes: whites showing, the pupils rolled up under the lids
      const rx = (x1 - x0) / 2 - 6, cx = (x0 + x1) / 2, cy = y1 + 3;
      out.push(`<ellipse fill="${WHITE}" stroke="${INK}" stroke-width="6" cx="${cx}" cy="${cy}" rx="${rx}" ry="${r}"/>`);
      out.push(`<circle fill="${INK}" cx="${px + 4}" cy="${y1}" r="${r * 0.7}"/>`);
      out.push(lidBar);
    }
  }
  return out.join('');
}

// His bill dropped open for a cough, over the master's: the lower half (redrawn from the master's) turned down
// about its hinge at the back of his bill, his mouth showing behind it, his tongue on it, and his uvula hanging
// from the roof of his mouth, swung by swing (radians, + forward).
const BILL_HINGE = [364, 302], JAW_DROP = 25, UVULA = [446, 300];
const MOUTH = '#b83a2e', THROAT = '#7a2420', TONGUE = '#f07c70', BILL = '#a76228';
function coughMouth(swing) {
  const [hx, hy] = BILL_HINGE, turn = a => `rotate(${a} ${hx} ${hy})`;
  const deg = swing * 180 / Math.PI;
  return `<g stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">
      <path fill="${MOUTH}" stroke-width="7" d="M${hx - 4} ${hy}L566 301L558 314L505 368L${hx} ${hy + 8}Z"/>
      <ellipse fill="${THROAT}" stroke="none" cx="400" cy="314" rx="26" ry="11" transform="${turn(JAW_DROP * 0.5)}"/>
      <path fill="${TONGUE}" stroke-width="5" transform="rotate(${deg} ${UVULA[0]} ${UVULA[1]})"
        d="M${UVULA[0] - 7} ${UVULA[1]}C${UVULA[0] - 8} ${UVULA[1] + 14} ${UVULA[0] - 10} ${UVULA[1] + 24} ${UVULA[0]} ${UVULA[1] + 28}C${UVULA[0] + 10} ${UVULA[1] + 24} ${UVULA[0] + 8} ${UVULA[1] + 14} ${UVULA[0] + 7} ${UVULA[1]}Z"/>
      <g transform="${turn(JAW_DROP)}">
        <path fill="${TONGUE}" stroke-width="5" d="M392 304C420 290 470 288 506 298L506 306L392 306Z"/>
        <path fill="${BILL}" stroke-width="8" d="M358 302L520 302C528 306 530 318 522 326C490 338 430 338 392 330C372 324 362 314 358 302Z"/>
      </g></g>`;
}

// Coughing, his near wing comes up from his shoulder, bent at the elbow, its feathers hanging off the inside of
// his forearm, to a fist held a short way in front of his bill: its feather tips curled towards his mouth, a
// thumb feather over the top.
function fistMarkup() {
  return `<g stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">
      <path fill="${WING}" stroke-width="15" d="M492 566C540 560 614 566 640 602C662 560 662 470 648 392L606 392C604 416 600 430 592 442C580 440 572 450 576 462C564 466 560 478 564 490C552 494 548 506 552 518C538 526 532 540 536 554C522 560 506 562 492 566Z"/>
      <path fill="none" stroke="${WING_SHADE}" stroke-width="10" d="M616 588C636 540 640 470 630 404"/>
      <path fill="none" stroke-width="7" d="M590 470Q600 462 612 466M576 500Q588 492 600 496M562 530Q574 522 586 526"/>
      <path fill="${WING}" stroke-width="14" d="M606 402C584 394 576 368 580 346C584 320 606 304 634 304C662 304 682 324 682 352C682 380 662 402 634 404Z"/>
      <path fill="none" stroke-width="9" d="M604 324Q584 328 586 344Q592 354 606 348M600 352Q580 356 582 372Q588 382 602 376M604 380Q588 386 594 398M620 312Q650 304 672 328"/></g>`;
}

// The free pose's near wing, folded at his side.
function wingMarkup() {
  return `<g stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">
      <path fill="${WING}" stroke-width="15" d="M556 604C520 560 410 556 320 584C240 610 170 650 112 690C190 712 330 716 440 696C520 682 572 644 556 604Z"/>
      <path fill="none" stroke="${WING_SHADE}" stroke-width="10" d="M150 696C240 708 350 708 456 690"/>
      <path fill="none" stroke-width="7" d="M168 676Q190 664 210 686M210 688Q232 676 252 698"/></g>`;
}

// The free pose's torso: his body, belly and back patch, speckles, and (unless it's drawn separately) a
// wing folded at his side.
function torso(withWing = true) {
  const d = smooth(TORSO);
  const inside = markup => `<defs><clipPath id="bill-torso"><path d="${d}"/></clipPath></defs><g clip-path="url(#bill-torso)">${markup}</g>`;
  return `<path fill="${BODY}" d="${d}"/>` + inside(`
    <path fill="${BELLY}" d="M110 706C260 726 480 716 660 690L660 900L110 900Z"/>
    <path fill="${BELLY_SHADE}" d="M110 806C260 856 460 856 660 766L660 900L110 900Z"/>
    <path fill="${BODY_LIGHT}" d="M306 520C292 552 288 590 296 630C304 594 314 560 334 528Z"/>
    <path fill="${MAROON}" d="M190 566C240 548 300 530 336 524C318 568 262 600 204 616Z"/>
    <path fill="none" stroke="${MAROON_LIGHT}" stroke-width="9" stroke-linecap="round" d="M220 576C252 562 282 552 306 546"/>
    <g fill="${SPECKLE}"><ellipse cx="496" cy="536" rx="9" ry="6"/><ellipse cx="520" cy="556" rx="5" ry="4"/>
      <ellipse cx="600" cy="660" rx="7" ry="5"/><ellipse cx="380" cy="690" rx="6" ry="4"/></g>
    <g fill="${BELLY_SHADE}"><ellipse cx="250" cy="760" rx="10" ry="6"/><ellipse cx="330" cy="790" rx="7" ry="4"/>
      <ellipse cx="470" cy="770" rx="9" ry="5"/><ellipse cx="540" cy="740" rx="6" ry="4"/><ellipse cx="400" cy="820" rx="8" ry="5"/></g>`)
    + `<path fill="none" stroke="${INK}" stroke-width="16" stroke-linejoin="round" d="${d}"/>`
    + (withWing ? wingMarkup() : '');
}

// A smooth closed path through points (Catmull-Rom as cubic Béziers).
function smooth(pts) {
  const n = pts.length, r = v => Math.round(v * 10) / 10;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)} ${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d + 'Z';
}
