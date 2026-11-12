// Bill the duck's rig: puts him together from his traced master (bill-34.svg, traced from the creator's
// drawing bill-sketch.jpg by tools/trace-bill.html) for a pose and a face. Used by tools/bill-model-sheet.html
// and, later, the game's frame exporter. Coordinates are Bill px (his drawing at half size), facing right.
//
// His body stays turned 3/4 (his master's view) and the paper flip turns him round; his head can also turn to
// face us ('front', drawn to match the master: standing about, like the goose) or halfway ('half'). Poses:
// 'crossed' (wings folded across his chest, the master: standing about) and
// 'free' (wings folded at his sides, for moving: a torso drawn to match the master, under its head, neck,
// tail and feet). Faces: 'grumpy' (the master's: lids low over his pupils), 'blink', 'stare' (The Stare:
// eyes opened flat on pinprick pupils), 'roll' (rolling his eyes, for the Bread Toss) and 'cough' (in the
// goose's stink: eyes popped wide and round, his bill dropped open on his tongue and swinging uvula),
// 'glance-left' and 'glance-right' (shifty: his pupils slid to one side under his scowl and, face on, his face
// turned partway after them, looking about) and 'brow' (brows up, cross: both lids lifted and scowling harder
// over open round eyes), 'chew' and 'chew-shut' (the master's look, chewing the goose's bread: his bill open on
// it, and shut with crumbs at its corner), 'wide' (the cough's popped eyes with his bill shut: a plop just landed
// on him), 'gag' (eyes screwed shut, his bill dropped open as for a cough: gagging on it) and 'squeeze' (eyes
// screwed shut, bill shut: shaking it off). New
// faces are drawn over his eyes, on patches of his head's green. Free, he can also peck (popping a co-op
// bubble with the tip of his bill): his neck stretches up and forward. Coughing, his near wing comes up in a
// fist in front of his bill, as a proper duck's does: fist(). On the move, it's bent at the elbow to a little fist
// and pumps like any bloke jogging: runArm().

import { mapPathPoints } from '../goose/rig.js';

export const VIEWBOX = { x: 0, y: 0, w: 671, h: 1000 };
export const POSES = ['crossed', 'free'];
export const FACES = ['grumpy', 'blink', 'stare', 'roll', 'cough', 'scared', 'glance-left', 'glance-right', 'brow',
  'chew', 'chew-shut', 'wide', 'gag', 'squeeze'];
// Glancing, his pupils slide this far either way under his lids (Bill px) and, face on, his face turns this far
// towards where he's looking (as a share of turning halfway round); raising his brows, both lids lift this far
// and scowl this many times as hard, over open round eyes.
const GLANCE = 24, GLANCE_TURN = 0.7, BROW_LIFT = 16, BROW_SCOWL = 1.8;
// Where he stands: his feet's soles (Bill px), and his body's middle, over them.
export const GROUND_Y = 980, CENTRE_X = 400;
// His legs, for site/paper-art.js's drawGooseLegs (he walks the goose's gaits): hips up inside his body,
// ankles placed so the feet land where the master's do, his orange.
export const LEGS = {
  hip: { near: [520, 848], far: [385, 844] }, ankleY: { near: 936, far: 930 }, footScale: 1.1, ink: '#512c1e',
  orange: { near: '#d8792d', far: '#b8601f', light: '#ec9a55' }, width: [30, 14],
};
// His near wing (the free pose's) turns about his shoulder to flap and to toss a crust; on the move, his arm
// (runArm) pumps about its shoulder, high on his chest right under his neck. ARM_BACK and ARM_UP are how far
// back and up from his crossed pose's arm (where it's drawn) it hangs, to sit there.
// (ARM_UP below 0: it hangs a little lower than that, under the backpack's strap over his shoulder.)
export const WING_PIVOT = [540, 600];
const ARM_BACK = 130, ARM_UP = -5;
export const ARM_PIVOT = [528 - ARM_BACK, 520 - ARM_UP];

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
     * uvula (the cough face) swings his uvula this far, in radians (+ swings it forward). view: '34' (the
     * master's head), 'front' (his head turned to face us: standing about) or 'half' (halfway between, as it
     * turns); face on, his faces are grumpy, blink and stare.
     */
    figure(pose = 'crossed', face = 'grumpy', { feet = true, wing = true, peck = false, uvula = 0, view = '34' } = {}) {
      const turned = view !== '34' && !peck;
      const chewing = face === 'chew' || face === 'chew-shut';
      const eyes = turned ? '' : (face === 'grumpy' || chewing ? '' : drawEyes(face))
        + (face === 'cough' || face === 'gag' ? coughMouth(uvula) : chewing ? chewMouth(face === 'chew') : '');
      // face on, the master's head is cut away above HEAD_CUT and his drawn one stands on his neck
      const top = turned ? HEAD_CUT : 0, head = turned ? frontHead(face, view === 'half') : '';
      if (pose === 'crossed') {
        return clipped('bill-crossed', box(0, top, VIEWBOX.w, feet ? VIEWBOX.h : FEET_Y), master) + eyes + head;
      }
      // free: the drawn torso, then the master's tail, head and neck (and feet) over it
      const [dx, up] = peck ? PECK_STRETCH : [0, 0];
      return torso(wing)
        + clipped('bill-tail', 'M' + TAIL.map(p => p.join(' ')).join('L') + 'Z', master)
        + clipped('bill-head', box(0, turned ? top : -up, VIEWBOX.w + dx, NECK_Y), peck ? stretchNeck(master) : master)
        + (feet ? clipped('bill-feet', box(0, FEET_Y, VIEWBOX.w, VIEWBOX.h), master) : '')
        + (peck && eyes ? `<g transform="translate(${dx} ${-up})">${eyes}</g>` : eyes) + head;
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
    /** On the move, his near wing bent at the elbow to a little fist, for pumping about ARM_PIVOT (in place of wing()). */
    runArm: () => runArmMarkup(),
    /** His arm straight (forearm in line with his upper arm) to the same fist, for flapping about ARM_PIVOT. */
    flapArm: () => runArmMarkup(true),
    /**
     * His upper arm's whole outline, inked (the top of it, where it melts into his chest, isn't drawn on runArm):
     * for edging the arm where it's laid over something worn across his shoulder (the backpack's strap).
     */
    armOutline: () => `<path fill="none" stroke="${INK}" stroke-width="15" stroke-linejoin="round" ` +
      `transform="translate(${-ARM_BACK} ${-ARM_UP})" d="${BICEP}"/>`,
    /** Where the middle of his fist is (Bill px) with his arm hanging, bent (runArm) or straight (flapArm). */
    fistAt(straight = false) {
      const [ex, ey] = ELBOW, [fx, fy] = FIST;
      const [x, y] = straight ? [ex - (fy - ey), ey + (fx - ex)] : [fx, fy];
      return [x - ARM_BACK, y - ARM_UP];
    },
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

// His head turned to face us (standing about): his head is the master's, exactly its shape (MASTER_HEAD), and
// only his features turn to face us: his lids low over half-round pupils either side, tipped down at their inner
// ends (a scowl), and his bill seen end on between them (his master's bill turned to face us: a round dome flaring
// to a wide round end, its mouth set in a frown); a darker green under his chin. Halfway round, his eyes and
// bill slide towards the way he's turning,
// the far side squeezed. Scared (dying, or waiting in a co-op bubble), his tuft stands on end, his lids shoot up
// and tip the other way, his eyes pop round on pinprick pupils, and his bill's edges wobble.
const HEAD_CUT = 405;
const GREEN_LIGHT = '#4f8660', GREEN_DEEP = '#184533', BILL_LIP = '#8e5221';
// How his face-on head is drawn (Bill px, x as offsets from cx): its outline (the master's), his eyes (centred
// eyeX either side of cx, the lids' top at eyeY), and his bill (its dome billTop either side of its middle where
// it meets his face at billY, flaring to billWide either side at its end, billLong below). Exported so a tool can
// try other proportions.
// His head's outline in the master (the centre of its ink line), measured off it row by row, with the stretch
// where his bill pokes out filled in along the line of his head: face on, his head keeps exactly this shape,
// only his eyes and bill turn to face us.
const MASTER_HEAD = [[405, 72], [458, 77], [500, 92], [527, 113], [540, 140], [549, 180], [553, 210], [557, 240],
  [559, 268], [556, 296], [548, 322], [538, 340], [511, 360], [490, 380], [491, 400], [347, 400], [342, 380],
  [313, 360], [296, 350], [273, 330], [259, 310], [252, 290], [249, 270], [248, 250], [250, 230], [254, 200],
  [263, 160], [279, 120], [294, 100], [307, 90], [327, 80], [356, 77]];
export const FRONT = {
  cx: 403, neck: [347, 491], scowl: 9,
  head: MASTER_HEAD.map(([x, y]) => [x - 403, y]),
  eyeX: 62, eyeY: 200, lid: [82, 14], pupil: 13,
  billY: 244, billTop: 28, billWide: 96, billLong: 96,
};
function frontHead(face, half) {
  const { cx, neck: [n0, n1], scowl, eyeX, eyeY, lid: [lw, lh], pupil, billY, billTop, billWide, billLong } = FRONT;
  const scared = face === 'scared';
  // Turning (1 halfway round to his right, -1 to his left; glancing, partway): the eye he turns from and the bill
  // slide further than the eye he turns towards, which tucks in, and the bill's side he turns towards widens as
  // the other squeezes.
  const turn = half ? 1 : face === 'glance-left' ? -GLANCE_TURN : face === 'glance-right' ? GLANCE_TURN : 0;
  const right = Math.max(0, turn), left = Math.max(0, -turn);
  const near = cx - eyeX + 34 * right - 16 * left, far = cx + eyeX + 16 * right - 34 * left, bx = cx + 34 * turn;
  const squeeze = 1 - 0.18 * right + 0.1 * left, grow = 1 + 0.1 * right - 0.18 * left;
  const head = smooth(FRONT.head.map(([x, y]) => [cx + x, y]));
  const tuft = scared
    // standing on end: three spikes
    ? [[-34, -40, -18], [0, -58, 0], [34, -40, 18]].map(([dx, up, lean]) =>
      `<path fill="${GREEN_LIGHT}" stroke-width="10" d="M${cx + dx - 14} 84L${cx + dx + lean} ${70 + up}L${cx + dx + 14} 84Z"/>`).join('')
    : `<path fill="${GREEN_LIGHT}" stroke-width="10" d="M${cx - 4} 82C${cx - 14} 44 ${cx} 22 ${cx + 18} 30C${cx + 12} 48 ${cx + 18} 64 ${cx + 26} 80Z"/>
       <path fill="${GREEN_LIGHT}" stroke-width="10" d="M${cx + 18} 80C${cx + 28} 42 ${cx + 50} 32 ${cx + 62} 44C${cx + 50} 54 ${cx + 44} 68 ${cx + 40} 84Z"/>`;
  // His bill, his master's turned to face us: a round dome where it meets his face between his eyes, flaring out
  // and down to a wide round end; the groove along its top curving down either side, two slanted nostrils, his
  // mouth's line across its lower part (turned down at its corners) and a lip of his lower bill under it.
  const [tl, tr] = [billTop * squeeze, billTop * grow], [wl, wr] = [billWide * squeeze, billWide * grow];
  const bottom = billY + billLong, edge = bottom - 18;
  const billPath = `M${bx} ${billY - 6}` +
    // the dome, then on round into the flare without a corner (the flare starts the way the dome is heading),
    // out to the end's widest, and round the end
    `C${bx + tr * 0.9} ${billY - 6} ${bx + tr * 1.2} ${billY + 10} ${bx + tr * 1.35} ${billY + 28}` +
    `C${bx + tr * 1.5} ${billY + 46} ${bx + wr} ${billY + 40} ${bx + wr} ${edge - 4}` +
    `C${bx + wr} ${bottom - 2} ${bx + wr * 0.75} ${bottom + 3} ${bx} ${bottom + 3}` +
    `C${bx - wl * 0.75} ${bottom + 3} ${bx - wl} ${bottom - 2} ${bx - wl} ${edge - 4}` +
    `C${bx - wl} ${billY + 40} ${bx - tl * 1.5} ${billY + 46} ${bx - tl * 1.35} ${billY + 28}` +
    `C${bx - tl * 1.2} ${billY + 10} ${bx - tl * 0.9} ${billY - 6} ${bx} ${billY - 6}Z`;
  const lip = `M${bx - wl + 8} ${edge + 2}Q${bx} ${edge - 6} ${bx + wr - 8} ${edge + 2}` +
    `C${bx + wr * 0.6} ${bottom + 4} ${bx - wl * 0.6} ${bottom + 4} ${bx - wl + 8} ${edge + 2}Z`;
  const groove = `M${bx - tl * 1.35} ${billY + 30}Q${bx - wl * 0.72} ${billY + 48} ${bx - wl + 10} ${billY + 66}` +
    `M${bx + tr * 1.35} ${billY + 30}Q${bx + wr * 0.72} ${billY + 48} ${bx + wr - 10} ${billY + 66}`;
  const mouth = scared
    // wobbling: a wavy line across his bill
    ? `M${bx - wl + 4} ${edge}` + Array.from({ length: 6 }, (_, i) => `Q${bx - wl + 4 + (wl + wr - 8) * (i + 0.5) / 6} ${edge + (i % 2 ? 9 : -9)} ${bx - wl + 4 + (wl + wr - 8) * (i + 1) / 6} ${edge}`).join('')
    : `M${bx - wl + 2} ${edge + 8}Q${bx - wl + 10} ${edge - 2} ${bx - wl + 26} ${edge - 2}Q${bx} ${edge - 8} ${bx + wr - 26} ${edge - 2}` +
      `Q${bx + wr - 10} ${edge - 2} ${bx + wr - 2} ${edge + 8}`;
  const nostril = (x, turn) => `<ellipse fill="${INK}" stroke="none" cx="${x}" cy="${billY + 22}" rx="4.5" ry="8.5" transform="rotate(${turn} ${x} ${billY + 22})"/>`;
  const eyeDefs = Object.fromEntries([['near', near], ['far', far]].map(([side, ex]) =>
    [side, { lid: [ex - lw / 2, eyeY, ex + lw / 2, eyeY + lh], pupil: [ex + 4 * turn, eyeY + lh, pupil] }]));
  return `<defs><clipPath id="bill-front-head"><path d="${head}"/></clipPath></defs>
    <g stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">
      ${tuft}
      <path fill="${GREEN}" stroke-width="15" d="${head}"/>
      <g clip-path="url(#bill-front-head)" stroke="none">
        <ellipse fill="${GREEN_DEEP}" cx="${cx}" cy="400" rx="150" ry="58"/>
        <path fill="none" stroke="${GREEN_LIGHT}" stroke-width="14" d="M${cx - 120} 190C${cx - 116} 140 ${cx - 84} 100 ${cx - 40} 90"/>
      </g>
      <path fill="${GREEN}" stroke="none" d="M${n0 + 7} 372L${n1 - 7} 372L${n1 - 7} ${HEAD_CUT + 8}L${n0 + 7} ${HEAD_CUT + 8}Z"/>
      <path fill="${GREEN_DEEP}" stroke="none" d="M${n0 + 7} 372L${n1 - 7} 372L${n1 - 7} 384Q${cx} 396 ${n0 + 7} 384Z"/>
      <path fill="none" stroke-width="15" d="M${n0} 386L${n0} ${HEAD_CUT + 8}M${n1} 386L${n1} ${HEAD_CUT + 8}"/>
      <path fill="${BILL}" stroke-width="12" d="${billPath}"/>
      <path fill="${BILL_LIP}" stroke="none" d="${lip}"/>
      <path fill="none" stroke-width="6" d="${groove}"/>
      ${nostril(bx - 16, 22)}${nostril(bx + 16, -22)}
      <path fill="none" stroke-width="9" d="${mouth}"/>
      <path fill="none" stroke-width="12" d="${billPath}"/>
    </g>` + drawEyes(face, eyeDefs, false,
    ['grumpy', 'blink', 'glance-left', 'glance-right', 'brow'].includes(face) ? scowl : scared ? -scowl : 0);
}

// A new pair of eyes, over the master's (his head's green patched over the old ones) or wherever eyes says (face
// on), then the face. tilt (degrees) tips each lid down at its inner end (+, a scowl) or up (-, worried).
function drawEyes(face, eyes = EYES, patch = true, tilt = 0) {
  const out = [];
  for (const side of ['near', 'far']) {
    const { lid: [x0, y0, x1, y1], pupil: [px, py, r] } = eyes[side];
    const lidBar = `<path fill="${INK}" d="M${x0 + 5} ${y0}L${x1 - 5} ${y0}Q${x1} ${y0} ${x1} ${(y0 + y1) / 2}Q${x1} ${y1} ${x1 - 5} ${y1}L${x0 + 5} ${y1}Q${x0} ${y1} ${x0} ${(y0 + y1) / 2}Q${x0} ${y0} ${x0 + 5} ${y0}Z"/>`;
    if (patch) {
      const [a, b, c, d] = eyes[side].patch;
      out.push(`<rect fill="${GREEN}" x="${a}" y="${b}" width="${c - a}" height="${d - b}" rx="10"/>`);
    }
    const start = out.length;
    let turnBy = side === 'near' ? tilt : -tilt;
    if (face === 'grumpy' || face === 'glance-left' || face === 'glance-right') {
      // the master's look: the lid low over a half-round pupil (glancing, slid to one side under it)
      const gx = px + (face === 'glance-left' ? -GLANCE : face === 'glance-right' ? GLANCE : 0);
      out.push(lidBar);
      out.push(`<path fill="${INK}" d="M${gx - r} ${y1}A${r} ${r} 0 0 0 ${gx + r} ${y1}Z"/>`);
    } else if (face === 'brow') {
      // brows up, cross: both lids lifted and scowling harder over open round eyes
      out.push(lidBar.replace(`d="M${x0 + 5} ${y0}`, `transform="translate(0 ${-BROW_LIFT})" d="M${x0 + 5} ${y0}`));
      out.push(`<circle fill="${INK}" cx="${px}" cy="${y1 + 2}" r="${r}"/>`);
      turnBy *= BROW_SCOWL;
    } else if (face === 'blink') {
      // shut: the lid comes down, a little crease under it
      out.push(lidBar.replace(`d="M${x0 + 5} ${y0}`, `transform="translate(0 6)" d="M${x0 + 5} ${y0}`));
      out.push(`<path fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" d="M${x0 + 10} ${y1 + 10}Q${px} ${y1 + 15} ${x1 - 10} ${y1 + 9}"/>`);
    } else if (face === 'stare') {
      // The Stare: lids up, eyes open flat and wide on pinprick pupils
      const rx = (x1 - x0) / 2 - 4, cx = (x0 + x1) / 2, cy = y1 + 4;
      out.push(`<ellipse fill="${WHITE}" stroke="${INK}" stroke-width="6" cx="${cx}" cy="${cy}" rx="${rx}" ry="${r + 3}"/>`);
      out.push(`<circle fill="${INK}" cx="${px + 2}" cy="${cy + 2}" r="${r * 0.42}"/>`);
      out.push(lidBar.replace(`d="M${x0 + 5} ${y0}`, `transform="translate(0 -4)" d="M${x0 + 5} ${y0}`));
    } else if (face === 'gag' || face === 'squeeze') {
      // screwed shut: each eye a chevron pointing in towards the other (> <), a crease above it
      const cx = (x0 + x1) / 2, cy = y1 + 2, w = ((x1 - x0) / 2 - 8) * (side === 'near' ? 1 : -1), h = 11;
      out.push(`<path fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" d="M${cx - w} ${cy - h}L${cx + w} ${cy}L${cx - w} ${cy + h}"/>`);
      out.push(`<path fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" d="M${x0 + 6} ${y0 - 6}Q${cx} ${y0 - 14} ${x1 - 6} ${y0 - 4}"/>`);
    } else if (face === 'cough' || face === 'wide') {
      // coughing (or a plop just landed on him): lids shot up, eyes popped wide and round on small pupils
      const rx = (x1 - x0) / 2 - 2, ry = side === 'near' ? 21 : 16, cx = (x0 + x1) / 2, cy = y1 + 2;
      out.push(`<ellipse fill="${WHITE}" stroke="${INK}" stroke-width="6" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`);
      out.push(`<circle fill="${INK}" cx="${px + 3}" cy="${cy}" r="${r * 0.5}"/>`);
      out.push(lidBar.replace(`d="M${x0 + 5} ${y0}`, `transform="translate(0 ${cy - ry - 4 - y1})" d="M${x0 + 5} ${y0}`));
    } else if (face === 'scared') {
      // scared (face on): lids shot right up, eyes popped round on pinprick pupils
      const rx = (x1 - x0) / 2 - 8, ry = 24, cx = (x0 + x1) / 2, cy = y1 + 8;
      out.push(`<ellipse fill="${WHITE}" stroke="${INK}" stroke-width="6" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`);
      out.push(`<circle fill="${INK}" cx="${cx}" cy="${cy + 2}" r="${r * 0.35}"/>`);
      out.push(lidBar.replace(`d="M${x0 + 5} ${y0}`, `transform="translate(0 ${cy - ry - 8 - y1})" d="M${x0 + 5} ${y0}`));
    } else if (face === 'roll') {
      // rolling his eyes: whites showing, the pupils rolled up under the lids
      const rx = (x1 - x0) / 2 - 6, cx = (x0 + x1) / 2, cy = y1 + 3;
      out.push(`<ellipse fill="${WHITE}" stroke="${INK}" stroke-width="6" cx="${cx}" cy="${cy}" rx="${rx}" ry="${r}"/>`);
      out.push(`<circle fill="${INK}" cx="${px + 4}" cy="${y1}" r="${r * 0.7}"/>`);
      out.push(lidBar);
    }
    if (turnBy) {
      const [cx, cy] = [(x0 + x1) / 2, (y0 + y1) / 2];
      out.push(`<g transform="rotate(${turnBy} ${cx} ${cy})">${out.splice(start).join('')}</g>`);
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

// Chewing the goose's bread, deadpan (his master's grumpy lids, 3/4): open, his lower bill dropped a little on
// a lump of bread on his tongue; shut, a crumb or two at the corner of his bill. Over the master, like the cough's.
const CHEW_DROP = 13, CRUST = '#c98a3e', CRUMB = '#f6d999';
function chewMouth(open) {
  const [hx, hy] = BILL_HINGE, turn = a => `rotate(${a} ${hx} ${hy})`;
  const crumbs = `<g fill="${CRUMB}" stroke-width="5">
      <path d="M520 326L534 322L538 334L526 338Z"/><path d="M500 340L510 337L512 346L503 348Z"/></g>`;
  if (!open) return `<g stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">${crumbs}</g>`;
  return `<g stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">
      <path fill="${MOUTH}" stroke-width="7" d="M${hx - 4} ${hy}L534 302L526 312L500 340L${hx} ${hy + 6}Z"/>
      <g transform="${turn(CHEW_DROP * 0.5)}">
        <path fill="${CRUMB}" stroke-width="6" d="M420 300C432 286 470 284 492 292C500 298 496 310 486 312L428 312C418 310 414 306 420 300Z"/>
        <path fill="none" stroke="${CRUST}" stroke-width="8" d="M430 294C450 287 474 287 488 293"/>
      </g>
      <g transform="${turn(CHEW_DROP)}">
        <path fill="${TONGUE}" stroke-width="5" d="M392 304C420 292 470 290 506 298L506 306L392 306Z"/>
        <path fill="${BILL}" stroke-width="8" d="M358 302L520 302C528 306 530 318 522 326C490 338 430 338 392 330C372 324 362 314 358 302Z"/>
      </g>${crumbs}</g>`;
}

// On the move, like any bloke out for a jog: his arm hangs from his shoulder (ARM_PIVOT) to his elbow,
// bent there, the forearm forward to a fist out in front. The game turns it about his shoulder to pump it.
// Straight (flapping), the forearm carries on down from the elbow in line with his upper arm, its feather tips
// trailing off its back, to the same fist: his real arm, flapped like a wing.
function runArmMarkup(straight = false) {
  // The upper arm is his crossed pose's: a hefty bicep hung from high on his chest at the base of his neck,
  // swelling to a fat round bulge in front and rounding off at the elbow, his body's grey with a shade down
  // its back, a crease where it bunches over the elbow and the master's speckles. Its top reaches up into his
  // chest and melts into it: its outline only starts below his shoulder, front and back.
  const bicep = BICEP;
  const bicepEdge = 'M600 548C626 580 642 620 642 660C642 706 622 738 596 750C568 762 530 758 512 738' +
    'C500 712 494 672 494 630';
  // The forearm is as thick as his crossed pose's, a band of wing feathers forward from the elbow, swelling
  // into a fist: a rounded mitten of feathers, their tips curled under as knuckles, a thumb feather over the
  // top; feather tips hang off its underside.
  const forearm = 'M586 688L664 680C700 666 734 688 734 716C734 746 704 760 674 756L596 758Z';
  // straight, the forearm turns down about the elbow
  const [ex, ey] = ELBOW;
  return `<g stroke="${INK}" stroke-linejoin="round" stroke-linecap="round" transform="translate(${-ARM_BACK} ${-ARM_UP})">
      <g${straight ? ` transform="rotate(90 ${ex} ${ey})"` : ''}>
      <path fill="${BODY}" stroke-width="14" d="${forearm}"/>
      <path fill="none" stroke="${WING_SHADE}" stroke-width="10" d="M604 746L664 744"/>
      <path fill="none" stroke-width="7" d="M616 758Q622 774 634 758M640 758Q646 774 658 758"/>
      <path fill="none" stroke-width="7" d="M716 690Q732 694 730 708M722 710Q736 714 732 728M716 730Q728 736 722 748M672 684Q696 688 706 704"/></g>
      <path fill="${BODY}" stroke="none" d="${bicep}"/>
      <path fill="none" stroke="${WING_SHADE}" stroke-width="12" d="M512 600C506 640 506 690 522 728"/>
      <g fill="${SPECKLE}" stroke="none"><ellipse cx="604" cy="628" rx="9" ry="6"/><ellipse cx="620" cy="652" rx="6" ry="4"/></g>
      ${straight ? '' : '<path fill="none" stroke-width="7" d="M574 722Q596 714 612 694"/>'}
      <path fill="none" stroke-width="15" d="${bicepEdge}"/></g>`;
}
// Where his forearm bends from his upper arm, and the middle of his fist, bent (runArm), in the arm's own px
// (before it's hung back at his shoulder): a slice of bread he's holding is held there.
const ELBOW = [590, 720], FIST = [700, 716];
// His upper arm (runArm's), in the arm's own px.
const BICEP = 'M490 514C510 504 550 504 572 516C612 540 642 596 642 660C642 706 622 738 596 750' +
  'C568 762 530 758 512 738C496 700 486 600 490 514Z';

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
