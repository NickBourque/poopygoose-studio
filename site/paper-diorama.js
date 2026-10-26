// A Paper Mario-style diorama: a paper island in 3D with flat sticker cutouts standing on it, and
// the 2D goose waddling about. When he turns, the sheet flips round and its reverse side (the same
// drawing, mirrored) shows him facing the other way.
import * as THREE from 'three';
import { gooseAtlas, loadGoose, GOOSE_FRAME, scenery, PAL } from './paper-art.js';

const tex = canvas => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const smooth = p => p * p * (3 - 2 * p);

function blobShadow(width, depth = width * 0.32, strength = 0.32) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(60,40,25,${strength})`); grad.addColorStop(1, 'rgba(60,40,25,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.05; m.renderOrder = 1;
  return m;
}

// A paper cutout standing on the ground: its bottom edge (groundPx) sits at y = 0.
// Cutouts are unlit (flat paper at the art's true colours).
function standee(canvas, height, { groundPx = canvas.height * 0.97, shadow = 0.6 } = {}) {
  const w = height * canvas.width / canvas.height;
  const geo = new THREE.PlaneGeometry(w, height);
  geo.translate(0, height / 2 - height * (1 - groundPx / canvas.height), 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex(canvas), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }));
  const group = new THREE.Group(); group.add(mesh);
  if (shadow) group.add(blobShadow(w * shadow));
  group.userData.sheet = mesh;
  return group;
}

// Grass texture: soft paper fibres and little blade marks, tiled across the island top.
function grassTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = PAL.grass; g.fillRect(0, 0, 512, 512);
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 1400; k++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.07})`; g.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 3, 1 + rnd() * 3); }
  g.strokeStyle = 'rgba(74,36,24,0.28)'; g.lineWidth = 3; g.lineCap = 'round';
  for (let k = 0; k < 26; k++) {
    const x = rnd() * 512, y = rnd() * 512;
    g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x - 2, y - 10); g.moveTo(x + 1, y); g.lineTo(x + 3, y - 13); g.moveTo(x + 6, y); g.lineTo(x + 9, y - 8); g.stroke();
  }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.22, 0.22);
  return t;
}

function waterTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(256, 128, 20, 256, 128, 260);
  grad.addColorStop(0, PAL.water); grad.addColorStop(1, PAL.waterDeep);
  g.fillStyle = grad; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 6; g.lineCap = 'round';
  for (const [x, y, r] of [[180, 100, 40], [180, 100, 70], [340, 160, 30], [340, 160, 55]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  return tex(c);
}

function gingham() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#FFF6EA'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = 'rgba(254,137,32,0.45)';
  for (let k = 0; k < 256; k += 64) { g.fillRect(k, 0, 32, 256); g.fillRect(0, k, 256, 32); }
  g.strokeStyle = '#4A2418'; g.lineWidth = 10; g.strokeRect(5, 5, 246, 246);
  return tex(c);
}

// Flat island of card: grass on top, cream card edges.
function island(shape, depth) {
  const bevel = 0.06;
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 48 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -(depth + bevel), 0); // after the rotation the extrusion runs upward; sink it so the top is at y = 0
  const top = new THREE.MeshBasicMaterial({ map: grassTexture() });
  const side = new THREE.MeshLambertMaterial({ color: '#F2E4CC' });
  return new THREE.Mesh(geo, [top, side]);
}

function blobShape(rx, rz, wobble = 0.08, seed = 1) {
  const s = new THREE.Shape(), n = 64;
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI * 2, r = 1 + wobble * Math.sin(a * 3 + seed) + wobble * 0.5 * Math.sin(a * 5 + seed * 2);
    const x = Math.cos(a) * rx * r, y = Math.sin(a) * rz * r;
    k ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  return s;
}

// Pond: water with a white paper rim and an ink outline, laid flat on the grass.
function pond(rx, rz) {
  const g = new THREE.Group();
  const layer = (grow, y, mat) => { const m = new THREE.Mesh(new THREE.ShapeGeometry(blobShape(rx + grow, rz + grow * 0.7, 0.06, 2), 64), mat); m.rotation.x = -Math.PI / 2; m.position.y = y; g.add(m); return m; };
  layer(0.24, 0.01, new THREE.MeshBasicMaterial({ color: '#4A2418' }));
  layer(0.16, 0.02, new THREE.MeshBasicMaterial({ color: '#FFFFFF' }));
  const water = layer(0, 0.03, new THREE.MeshBasicMaterial({ map: waterTexture() }));
  // ShapeGeometry UVs are in shape units; map them to 0..1 across the pond
  const uv = water.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / (2 * rx) + 0.5, uv.getY(i) / (2 * rz) + 0.5);
  return g;
}

/**
 * Mounts the diorama in `container`.
 * opts.mode: 'scene' (the island with the goose waddling about) or 'solo' (just the goose on a little
 * grass disc, for close-ups). Returns { honk, flip, waddle, flap } for buttons.
 */
export async function mountPaperGoose(container, opts = {}) {
  const mode = opts.mode || 'scene';
  // the sign and speech bubble use the site fonts; the goose is a sprite cut from the logo
  await Promise.all([document.fonts.ready, loadGoose()]);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight('#ffffff', '#d8c8ae', 1.55));
  const sun = new THREE.DirectionalLight('#fff6e8', 0.8); sun.position.set(-4, 8, 6); scene.add(sun);

  const FOV = mode === 'solo' ? 24 : 28;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  const lookAt = mode === 'solo' ? new THREE.Vector3(0, 1.35, 0) : new THREE.Vector3(0, 1.2, -0.4);
  // camera direction (from the target) and the minimum distance; it pulls back further on narrow
  // containers so the whole stage (fitW wide, fitH tall) stays in view
  const camDir = (mode === 'solo' ? new THREE.Vector3(0, 1.05, 8.3) : new THREE.Vector3(0, 4.9, 15.1)).normalize();
  // the scene camera frames about 11 units and pans along with the goose, like a game camera
  const minDist = mode === 'solo' ? 6.4 : 11.5, fitW = mode === 'solo' ? 4.8 : 11, fitH = mode === 'solo' ? 3.3 : 6.2;
  const camBase = new THREE.Vector3();
  let follow = 0;

  const sway = []; // standees that wobble gently, like card in a breeze
  const add = (obj, x, z, { rotY = 0, sway: s = 0.015 } = {}) => {
    obj.position.set(x, 0, z); obj.rotation.y = rotY; scene.add(obj);
    if (s) sway.push({ obj: obj.userData.sheet || obj, amp: s, phase: Math.random() * 6 });
    return obj;
  };

  // ---------- world ----------
  let walkMin = -3.6, walkMax = 3.4, walkZ = 1.5;
  if (mode === 'scene') {
    scene.add(island(blobShape(7.4, 4.1, 0.05, 1), 0.5));
    const p = pond(2.2, 1.1); p.position.set(2.1, 0, -1.4); scene.add(p);
    add(standee(scenery.tree(0), 3.9), -5.4, -2.3, { rotY: 0.15 });
    add(standee(scenery.tree(1), 3.0), -3.4, -3.1, { rotY: 0.05 });
    add(standee(scenery.tree(0), 3.4), 5.7, -2.1, { rotY: -0.2 });
    add(standee(scenery.reeds(), 1.8), 4.3, -1.0, { rotY: -0.15, sway: 0.03 });
    add(standee(scenery.reeds(), 1.4), 0.1, -2.0, { rotY: 0.1, sway: 0.03 });
    add(standee(scenery.bush(), 1.15), -6.3, 0.9, { rotY: 0.25 });
    add(standee(scenery.bush(), 1.0), 6.3, 1.1, { rotY: -0.3 });
    add(standee(scenery.sign(), 1.7), -5.0, 2.2, { rotY: 0.35, sway: 0.008 });
    // picnic blanket with a loaf of bread: the goose's natural target
    const blanket = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.5), new THREE.MeshBasicMaterial({ map: gingham() }));
    blanket.rotation.set(-Math.PI / 2, 0, 0.12); blanket.position.set(-1.9, 0.03, -1.7); scene.add(blanket);
    add(standee(scenery.bread(), 0.7), -1.9, -1.6, { rotY: 0.1, sway: 0 });
    for (const [x, z, c, h] of [[-3.0, 2.9, PAL.white, 0.65], [-0.6, 3.1, '#FFC56B', 0.55], [1.5, 2.8, PAL.white, 0.7], [4.7, 2.6, '#FFC56B', 0.6], [-6.4, -0.5, PAL.white, 0.62], [6.7, -0.1, PAL.white, 0.55]]) {
      add(standee(scenery.flower(c), h, { shadow: 0.4 }), x, z, { rotY: (Math.random() - 0.5) * 0.4, sway: 0.04 });
    }
    // sky pieces hang behind the island
    const cloud1 = add(standee(scenery.cloud(), 1.4, { shadow: 0 }), -1.6, -5.2, { sway: 0 }); cloud1.position.y = 3.2;
    const cloud2 = add(standee(scenery.cloud(), 1.0, { shadow: 0 }), 3.2, -5.6, { sway: 0 }); cloud2.position.y = 3.8;
    const sunCut = add(standee(scenery.sun(), 1.3, { shadow: 0 }), 6.2, -5.8, { sway: 0 }); sunCut.position.y = 3.5;
    sway.push({ obj: cloud1, amp: 0, drift: 0.25, phase: 0 }, { obj: cloud2, amp: 0, drift: 0.2, phase: 2 }, { obj: sunCut, amp: 0, spin: true, phase: 0 });
  } else {
    const disc = island(blobShape(2.4, 1.2, 0.04, 3), 0.3);
    scene.add(disc);
    for (const [x, z, c] of [[-1.7, -0.4, PAL.white], [1.8, -0.2, '#FFC56B'], [1.3, 0.6, PAL.white]]) add(standee(scenery.flower(c), 0.55, { shadow: 0.4 }), x, z, { sway: 0.04 });
    walkMin = -0.9; walkMax = 0.9; walkZ = 0.25;
  }

  // ---------- the goose ----------
  const atlas = gooseAtlas({ scale: 0.75 });
  const gooseTex = tex(atlas.canvas);
  gooseTex.repeat.set(1 / atlas.cols, 1 / atlas.rows);
  const H = mode === 'solo' ? 2.3 : 2.5, W = H * GOOSE_FRAME.w / GOOSE_FRAME.h;
  const sheetGeo = new THREE.PlaneGeometry(W, H);
  // put his feet at y = 0 and his body's centre on the turning axis
  sheetGeo.translate(W * (0.5 - GOOSE_FRAME.centerX / GOOSE_FRAME.w), H / 2 - H * (1 - GOOSE_FRAME.groundY / GOOSE_FRAME.h), 0);
  const sheet = new THREE.Mesh(sheetGeo, new THREE.MeshBasicMaterial({ map: gooseTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }));
  const goose = new THREE.Group(); goose.add(sheet);
  const shadow = blobShadow(W * 0.62, W * 0.2, 0.4); scene.add(shadow);
  goose.position.set(mode === 'solo' ? 0 : -2.5, 0, walkZ);
  scene.add(goose);
  const setFrame = name => {
    const i = atlas.frames.indexOf(name);
    gooseTex.offset.set((i % atlas.cols) / atlas.cols, 1 - (Math.floor(i / atlas.cols) + 1) / atlas.rows);
  };
  setFrame('idle');

  // speech bubble and plops are cutouts that pop in
  const bubble = standee(scenery.honk(), 0.95, { shadow: 0 }); bubble.visible = false; scene.add(bubble);
  const plopCanvas = scenery.plop();
  const plops = [];

  // ---------- behaviour ----------
  // states: walk, pause, turn. dir: +1 facing right (front of the sheet), -1 facing left (reverse side)
  let state = mode === 'solo' ? 'pause' : 'walk', dir = 1, t = 0, stateT = 0, pauseFor = 1.2, turnFrom = 0;
  let honkUntil = -1, flapUntil = -1, blinkUntil = -1, nextBlink = 1.5, waddleUntil = -1, walkPhase = 0;
  const startTurn = () => { state = 'turn'; stateT = 0; turnFrom = goose.rotation.y; };

  function honk() {
    honkUntil = t + 0.65;
    bubble.visible = true; bubble.userData.t0 = t;
    if (mode === 'scene') {
      const p = standee(plopCanvas, 0.42, { shadow: 0.5 });
      p.position.set(goose.position.x - dir * 0.55, 0, goose.position.z - 0.05);
      p.userData.t0 = t; scene.add(p); plops.push(p);
      while (plops.length > 6) scene.remove(plops.shift());
    }
  }
  const flip = () => { if (state !== 'turn') startTurn(); };
  const flap = () => { flapUntil = t + 0.9; };
  const waddle = () => { waddleUntil = t + 2.2; };

  // tap / click the goose (or anywhere on a small stage) to honk; in the scene he plops too
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  renderer.domElement.addEventListener('pointerdown', e => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (mode === 'solo' || ray.intersectObject(sheet).length) honk();
  });
  // the camera leans a little towards the pointer, so the depth reads
  let lean = new THREE.Vector2(), leanTarget = new THREE.Vector2();
  container.addEventListener('pointermove', e => {
    const r = container.getBoundingClientRect();
    leanTarget.set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  });
  container.addEventListener('pointerleave', () => leanTarget.set(0, 0));

  function update(dt) {
    t += dt; stateT += dt;
    const walkSpeed = 0.85; // matches his stride, so planted feet don't slide on the grass
    let walking = false;

    if (state === 'walk' && mode === 'scene') {
      walking = true;
      goose.position.x += dir * walkSpeed * dt;
      if ((dir > 0 && goose.position.x >= walkMax) || (dir < 0 && goose.position.x <= walkMin)) { state = 'pause'; stateT = 0; pauseFor = 0.8 + Math.random() * 1.4; if (Math.random() < 0.5) honkUntil = t + 0.65, bubble.visible = true, bubble.userData.t0 = t; }
    } else if (state === 'pause' && !reduceMotion && stateT > pauseFor && mode === 'scene') {
      startTurn();
    } else if (state === 'pause' && mode === 'solo' && stateT > 4 && t >= waddleUntil && !reduceMotion) {
      startTurn(); // in the close-up he just turns to face the other way now and then
    }
    if (state === 'turn') {
      // the Paper Mario flip: the sheet spins half a turn with a little hop
      const p = Math.min(1, stateT / 0.34);
      goose.rotation.y = turnFrom + Math.PI * smooth(p);
      goose.position.y = Math.sin(p * Math.PI) * 0.22;
      if (p >= 1) { dir = -dir; goose.rotation.y = dir > 0 ? 0 : Math.PI; goose.position.y = 0; state = mode === 'scene' ? 'walk' : 'pause'; stateT = 0; }
    }
    if (t < waddleUntil && state !== 'turn') {
      // waddle forwards, the way he's facing; at the edge he turns round and carries on the other way
      walking = true;
      goose.position.x = THREE.MathUtils.clamp(goose.position.x + dir * walkSpeed * dt, walkMin, walkMax);
      if ((dir > 0 && goose.position.x >= walkMax) || (dir < 0 && goose.position.x <= walkMin)) startTurn();
    }

    // frame choice
    if (walking) walkPhase += dt * 8.5;
    let frame = 'idle';
    if (t < honkUntil) frame = 'honk';
    else if (t < flapUntil) frame = Math.floor(t * 10) % 2 ? 'flap' : 'idle';
    else if (walking && state !== 'turn') frame = `walk${Math.floor(walkPhase * 2) % 8}`; // 4 phase units per stride cycle
    else if (t < blinkUntil) frame = 'blink';
    if (t > nextBlink) { blinkUntil = t + 0.14; nextBlink = t + 2 + Math.random() * 3; }
    setFrame(frame);

    // the walk frames bob his body over his feet; a hop when flapping, squash when honking
    if (state !== 'turn') goose.position.y = t < flapUntil ? Math.abs(Math.sin(t * 9)) * 0.18 : 0;
    const squash = t < honkUntil ? Math.sin(Math.min(1, (honkUntil - t) / 0.65) * Math.PI) * 0.06 : 0;
    sheet.scale.set(1 + squash, 1 - squash, 1);
    sheet.rotation.z = walking ? Math.sin(walkPhase * Math.PI / 2) * 0.025 : 0; // a slight waddle, foot to foot
    // the sheet darkens a touch as it turns edge-on, so the flip reads as card catching the light
    sheet.material.color.setScalar(1 - 0.28 * Math.abs(Math.sin(goose.rotation.y)));
    shadow.position.set(goose.position.x, 0.025, goose.position.z);
    shadow.scale.setScalar(1 - goose.position.y * 0.8);

    // bubble pops in above his head, then folds away
    if (bubble.visible) {
      const age = t - bubble.userData.t0;
      const s = age < 0.15 ? smooth(age / 0.15) * 1.1 : age < 0.9 ? 1 : Math.max(0, 1 - (age - 0.9) / 0.2);
      bubble.scale.setScalar(Math.max(0.001, s));
      bubble.position.set(goose.position.x + dir * 0.55, H * 0.95, goose.position.z + 0.05);
      if (age > 1.1) bubble.visible = false;
    }
    for (const p of plops) {
      const age = t - p.userData.t0;
      p.scale.setScalar(age < 0.2 ? smooth(age / 0.2) : age > 7 ? Math.max(0.001, 1 - (age - 7) / 0.4) : 1);
    }
    for (const s of sway) {
      if (s.drift) s.obj.position.x += Math.sin(t * 0.2 + s.phase) * s.drift * dt;
      else if (s.spin) s.obj.userData.sheet.rotation.z = Math.sin(t * 0.5) * 0.08;
      else s.obj.rotation.z = Math.sin(t * 1.3 + s.phase) * s.amp;
    }

    // camera: follows the goose sideways (scene only) and leans towards the pointer
    if (mode === 'scene') follow += (THREE.MathUtils.clamp(goose.position.x * 0.6, -2.4, 2.4) - follow) * (1 - Math.pow(0.25, dt));
    lean.lerp(leanTarget, 1 - Math.pow(0.02, dt));
    camera.position.set(camBase.x + follow + lean.x * (mode === 'solo' ? 0.8 : 1.4), camBase.y - lean.y * 0.5, camBase.z);
    camera.lookAt(lookAt.x + follow, lookAt.y, lookAt.z);
  }

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const tanV = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const dist = Math.max(minDist, fitW / 2 / (tanV * camera.aspect), fitH / 2 / tanV);
    camBase.copy(lookAt).addScaledVector(camDir, dist);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container); resize();

  let visible = true, last = performance.now();
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(frame); } }).observe(container);
  function frame(now) {
    if (!visible) return;
    update(Math.min(0.05, (now - last) / 1000)); last = now;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return { honk, flip, waddle, flap, renderer, scene, camera, goose, _update: update };
}
