# Poopy Goose design system

The look, feel and voice of Poopy Goose: the studio site (poopygoose.studio) and the game. This file is
the source of truth. The landing page in `site/` is its reference implementation, and the game (built in
Unity) carries it forward. When the game adds something new (a character, a UI pattern, a colour), add
it here too, so the site and the game stay one world.

In one line: **a cozy little world made of paper and stickers, drawn in thick chocolate-brown ink, starring
a sweet goose with no manners.**

---

## 1. Principles

1. **Everything is paper.** Characters, props and scenery are flat cut-outs of card, standing in a small
   3D diorama (think Paper Mario). Things are flat and turn like sheets of card; they never become
   rounded 3D models.
2. **Stickers with ink outlines.** Every cut-out has a thick dark-brown outline and a white sticker
   border around its silhouette, like the logo.
3. **The logo is the master.** Colours were sampled from the logo, and the goose is cut from the logo's
   own pixels. When in doubt, match the logo.
4. **Cozy first, chaos second.** Soft cream backgrounds, rounded shapes, gentle motion. The mischief is
   in what the goose does, not in harsh visuals.
5. **Bouncy, tactile interaction.** Buttons press down like card on a table, things pop in with a little
   overshoot, sheets flip with a hop.
6. **Cheeky but clean.** Poop humour stays cute and implied ("The Drop", a plop with googly eyes),
   never gross.

---

## 2. Colour

All values are sRGB hex. The UI palette and the art palette are the same family; a few art colours are
a touch different because they were tuned against the logo's pixels.

### UI palette (site CSS variables)

| Token | Hex | Use |
| --- | --- | --- |
| `cream` | `#F6F1E7` | Page background, the "table" everything sits on |
| `cream-deep` | `#ECE5D8` | Meter tracks, recessed areas |
| `paper` | `#FFFDF8` | Cards, inputs, ghost buttons (white card stock) |
| `ink` | `#482319` | Text, outlines, borders, hard shadows, dark bands (the logo's drippy brown) |
| `ink-soft` | `#6E4A3E` | Secondary text |
| `navy` | `#26394E` | Small labels, "STUDIO", accents (from the logo's "STUDIO") |
| `orange` | `#FE8920` | Primary buttons, highlights, focus ring (beak and feet) |
| `orange-deep` | `#E06F0B` | Eyebrow labels, orange on cream when it must be readable |
| `sage` | `#B7C7AB` | Sign-up band, blobs, grass (the belly splotch) |
| `sage-soft` | `#DCE6D3` | Soft circles behind sage areas |

Orange hover: `#FF9A3D`. Placeholder text: `#A08A80`.

### Art palette (paper world)

| Name | Hex | Use |
| --- | --- | --- |
| Ink | `#4A2418` | Outlines on all art (legs and feet use `#452319`, the logo's own outline) |
| White | `#FFFFFF` | Sticker borders, goose body, clouds, pond rim, flowers |
| Shade | `#E1E6DC` | Shading on white |
| Sage | `#AFC8A1` / deep `#8FAE80` | Goose belly splotch and similar |
| Orange | `#FE8920`, dark `#E06A10`, light `#FFC08A` | Beak, feet, orange details |
| Feet | near `#F68C28`, far `#E2741E`, lit top `#FCB25C` | Legs and feet (far leg darker) |
| Mouth / tongue | `#B83A2E` / `#F07C70` | Open bill |
| Grass | `#B7C7AB`, deep `#98B08A` | Island top, canopies, bushes, reeds |
| Trunk / wood | `#9A6A4A` | Tree trunks, sign posts, reed heads |
| Water | `#A9D3D8` → deep `#86BFC6` | Pond (radial gradient, light in the middle) |
| Card edge | `#F2E4CC` | Sides of the island (the thickness of the card) |
| Sunny yellow | `#FFC56B` | Sun, flower centres, yellow flowers |
| Sign board | `#E9C79A` | Wooden sign face |
| Bread | `#E7B47A` | Loaf |
| Plop | `#7A4A32` | The poop (always with white googly eyes) |
| Gingham | `#FFF6EA` + orange at 45% | Picnic blanket, with an ink border |
| Shadow | `rgba(60,40,25, .32–.40)` | Soft blob shadows on the ground |

**Ratios to keep:** cream and white dominate; ink for structure; orange is the one loud accent (use it
for the thing to click or look at); sage is the calm secondary; navy only in small doses.

---

## 3. Typography

| Role | Font | Weight | Notes |
| --- | --- | --- | --- |
| Display (headings, big words, signs, "HONK!") | **Baloo 2** | 800 (700 for small headings) | line-height 1.02, tracking -0.01em |
| Body and UI | **Nunito** | 400 body, 700–800 for labels and buttons | line-height 1.6 |

Both are free Google Fonts (SIL Open Font License), so they can ship in the game.

- **Sizes on the site:** hero h1 2.9–5.4rem; h2 2.1–3.2rem; h3 1.55rem; body 1.075rem.
- **Eyebrow label:** Nunito 800, 0.8rem, uppercase, tracking 0.14em, `orange-deep`.
- **Small caps labels** (fact titles, "STUDIO"): Nunito 800, uppercase, tracking 0.12–0.28em, `navy`.
- **Squiggle emphasis:** a wavy orange underline under one key word ("Zero *manners.*").
- **Marquee and shouty words:** Baloo 2 800, uppercase, with an orange ✦ between words.

---

## 4. Shape, depth and texture

- **Rounded everything.** Buttons and inputs are full pills. Cards have a 28px radius, small tiles
  16px. Organic blobs (wobbly circles) instead of rectangles for decoration.
- **Hard ink shadows for things you press.** Buttons and cards cast a solid ink shadow straight down
  with no blur (buttons 5px, small buttons 3px, cards 8px), with a 3px ink border (2.5px on small
  buttons). They read as card sitting on the table.
- **Soft shadows for things that float.** Feature tiles and art use a soft brown drop shadow:
  `0 2px 0 rgba(72,35,25,.08), 0 18px 40px -18px rgba(72,35,25,.35)`.
- **Slight tilts.** Siblings tilt ±1° (feature tiles), the logo sits at -3°, like stickers placed by hand.
- **Drippy bands.** Dark ink bands have a gentle wave along the top edge and chocolate drips
  hanging off the bottom (uneven lengths, round drip ends, a stray droplet or two).

---

## 5. UI components (site reference)

| Component | Recipe |
| --- | --- |
| Primary button | Orange pill, ink text (Nunito 800), 3px ink border, hard ink shadow 5px. Hover: lifts 2px, shadow 7px, `#FF9A3D`. Press: drops 4px, shadow 1px. 0.12s transitions. |
| Ghost button | Same, `paper` background. |
| Small button / move button | Paper pill, 2.5–3px border, 3px shadow; hover lift 2px, press 3px. |
| Card | Paper, 3px ink border, 28px radius, hard 8px ink shadow. |
| Info tile | Cream, 16px radius; small uppercase navy label over a bold value. |
| Stat meter | Pill track in `cream-deep` with 2px ink border, orange fill. An unknown stat ("Aim ???") is an animated sage/cream diagonal stripe. |
| Badge pill | Paper pill, faint navy border, pulsing orange dot ("A game in the nest"). |
| Text input | Paper pill, 3px ink border, Nunito 700. |
| Nav | Cream, slightly see-through with a blur; a faint ink hairline appears once scrolled. Links get an orange 3px underline that grows on hover. |
| Brand mark | Goose-head sticker + "Poopy Goose" (Baloo 2) over "STUDIO" (Nunito, tracked, navy). On hover the head tips -10° and grows 8%, with a bounce. |
| Focus | 3px orange outline, 3px offset. Always visible for keyboard use. |
| Decorative blob | Sage at ~55%, wobbling shape and slow 12° rotation over 12s. |

**Layout:** content 1080–1240px wide; side gutters 16–48px; sections breathe (48–104px vertical);
two-column sections stack below 900px; buttons go full width below 560px.

---

## 6. Motion

| What | Timing |
| --- | --- |
| Press feedback | 0.12s ease |
| Playful pop (hover on stickers, tiles) | 0.25s `cubic-bezier(.3, 1.6, .5, 1)` (overshoots) |
| Pop-in of a cut-out (bubble, plop) | scale 0 → 1.1 over 0.15s (smoothstep), then settle to 1 |
| Ambient sway of standing cut-outs | rotate ±0.015 rad (~1°) at ~1.3 rad/s; reeds and flowers ±0.03–0.04 |
| Clouds | drift slowly side to side; the sun rocks ±0.08 rad |
| Marquee | 52s per loop, linear, seamless |
| Pulses and blobs | 2s pulse; 12s wobble |

Respect reduced-motion settings: stop ambient loops and the goose's automatic turning, keep only
direct responses to the player.

---

## 7. The paper world

The two little "windows into the world" on the site (the island in the hero, and the close-up in Meet
Poopy Goose) are the template for the game's look.

### Building blocks

- **Cut-outs (standees):** flat sheets with the art on them, standing upright on the ground with their
  bottom edge at ground level. **Unlit**: they show the art's true colours whatever the lighting. Alpha
  cut-out at 0.4 (crisp paper edges, no soft fringes). Two-sided: from behind you see the same drawing,
  mirrored.
- **Ground:** a flat island of card. Top: grass `#B7C7AB` with soft paper fibres (faint white flecks)
  and scattered little three-stroke grass marks in ink at ~28% opacity. Sides: cream card `#F2E4CC`,
  the only lit surface, with a small rounded bevel. Wobbly blob outline, not a rectangle.
- **Flat decals on the ground:** pond (ink outline ring → white paper rim → water with a light centre
  and white ripple arcs), picnic blanket (orange gingham with an ink border), plops.
- **Shadows:** soft brown radial blobs under each standee, not real cast shadows. The goose's shadow
  shrinks as he hops.
- **Sky:** clouds and a sun are cut-outs hanging behind the island, not a painted sky. The background
  is the page's cream (in the game: cream or a paper backdrop).
- **Lighting:** a soft warm hemisphere light (white sky, `#D8C8AE` ground) plus a warm key light
  (`#FFF6E8`) from upper left. Only the card edges really show it.
- **Framing:** the edges of the stage fade out softly rather than cutting off hard.

### Drawing new art (characters, props, scenery)

- Simple, chunky shapes with **thick ink outlines** with round caps and joins (about 2% of the
  object's width; the goose is ~13px on a 600px frame, small props 6–12px).
- **Flat fills** from the art palette, plus at most one soft highlight (white at ~35%) or one shade
  shape. No gradients except water.
- A **white sticker border** around the whole silhouette: about 2.5% of the frame width (16px on the
  600px goose frame, 10–14px on props), smooth and rounded, following the outline.
- Details are drawn as short ink strokes: leaf tufts as little "v" marks, bread scores as slashes,
  toe lines on feet.
- Signs and speech bubbles use the site fonts (Baloo 2 800 for the big word, Nunito 800 navy for
  small text). Speech bubbles are white with an ink outline and a tail; "HONK!" is the standard.
- Things the player can interact with get a touch of orange.

### Camera

- Perspective, narrow field of view (28° vertical for the wide shot, 24° for close-ups), looking slightly
  down (about 18°) at the diorama, like peering into a shoebox stage.
- Follows the goose sideways, lagging and covering only about 60% of his movement, within limits.
- Leans a little towards the pointer so the depth reads.

---

## 8. Poopy Goose (character rules)

These rules are fixed. Changing them needs the creator's sign-off.

- **He is drawn to his model sheet, and the logo is its master.** His vector art lives in
  `source/goose/`: the front view is traced from the logo (`tools/trace-goose.html`), so it matches it
  exactly; the 3/4 and side heads are drawn to match it (same outline weight, colours and shading). New
  views, faces and poses are drawn to the sheet (`tools/goose-model-sheet.html`) and checked against the
  front. Don't restyle him or drift from the logo: when unsure, match the front view. The site still
  uses the pixel cut-out (`site/assets/goose-sprite.png`, from `tools/make-goose-sprite.html`).
- **Views and faces.** Front (face on), half turn (15°, the front's face bent round his head), 3/4 (30°)
  and side, all facing right. Each has eyes open, blink and honk; the front also has the logo's wink.
  His everyday face has both eyes open; the wink is an expression.
- **Head turn (game).** Standing he faces us. On the move his head turns to the 3/4 view, passing
  through the half turn for a moment as he sets off and stops (about 0.12s each way).
- **Legs and feet are the exception.** They are drawn in the logo's style (thick outline, orange, lighter
  top, toe lines, the far leg a shade darker) so he can walk. They should match in style, not exactly.
- **He is a flat paper sticker.** He never becomes a 3D model.
- **Turning is a paper flip.** The sheet spins half a turn around his body's centre in 0.34s with a
  smooth ease and a small hop (about 9% of his height). It darkens slightly as it goes edge-on (up to
  28%), like card catching the light. Facing left shows the reverse of the sheet.
- **He only walks the way he faces. No moonwalking, ever.** At an edge or obstacle he flips round and
  carries on the other way.
- **Walk cycle:** 8 frames per stride. Each leg is planted and slides back while the other swings
  forward with a lift; the heel peels up at the end of the push. His body bobs up as each leg passes
  under him and rocks slightly foot to foot. Move him at the speed his feet travel, so planted feet
  don't slide (about 0.34 of his height per second at the site's stroll; in the game the legs cycle
  faster as he speeds up, still at the ground's pace).
- **Run (game):** a cartoon scamper in the same 8-frame cycle: long reaching strides (each foot travels
  180 logo px either side of its hip) with high knees (lifting 86), toes pointing down as a foot pushes
  off and lifting as it reaches forward, and a hop between steps where both feet are off the ground
  (each foot is planted for 40% of a stride). His body rides up on his toes (lifted 24 px), lowest as a
  foot lands and highest in the hop (bobbing 20). On top of the frames he leans into the run (about 6°),
  squashes about 5% as each foot lands and stretches in the hop: lively, but still a paper sticker.
  Holding a direction, he waddles off and breaks into a run after about 0.4s, with a cartoon scramble:
  his legs churn at 6 strides a second, far ahead of how fast he's going, and settle to the ground's
  pace over 0.5s. After that it's paced to the ground like the walk.
- **Skid (game):** let go of a run, or push the other way, and he skids briefly to a stop before turning:
  still facing forwards, body sunk, both feet braced out in front with the toes up, the wing out, and the
  sheet leaning back about 8°. Never a moonwalk: he only turns once stopped.
- **Idle:** blinks for 0.14s every 2–5 seconds. Pauses at the ends of a walk (0.8–2.2s), sometimes honks.
- **Honk:** bill open for 0.65s with a slight squash-and-stretch (6%) and a "HONK!" speech bubble that
  pops in above his head on the side he faces, holds, then folds away (1.1s total). In the game it's
  bigger: his neck stretches up (face on) or bends forward in a curve towards where he's pointing (turned,
  his head reaching well past his chest), his eyes widen (30%) and his brows
  lift, his bill stretches out into a trumpet (face on, a round open bell; turned, a long narrow pipe with
  a band that flares into a bell, reaching about twice the bill's length), and the sheet stretches up
  6% rather than squashing.
- **The Drop (plop):** tap him and he honks and leaves a plop behind him (opposite the way he faces).
  Plops pop in, stay a few seconds, then shrink away. Few on screen at once (the site keeps 6).
- **Flap:** the near wing lifts from the shoulder (about 26°) with little hops, for 0.9s.
- **Personality:** sweet face, zero manners. Round of belly, means well. Mostly.

### Character file (canon)

| | |
| --- | --- |
| Class | Agent of chaos |
| Home | The pond (allegedly) |
| Likes | Bread, puddles, picnics |
| Signature move | The Drop |
| Stats | Honk 9 · Waddle 4 · Charm 10 · Aim ??? |

---

## 9. Voice and copy

**Tone:** warm, playful, a little deadpan. Short sentences. Goose puns are welcome when they're
light; one per line at most. Cozy chaos, never mean, never gross.

**Patterns to reuse:**
- Goose words replace everyday ones: *to be honked* (announced), *the flock* (the community or mailing
  list), *hatching* / *in the nest* (in development), *waddle along* (follow along), *honks* (updates).
- A plain statement, then a wink: "Poopy Goose means well. Mostly." / "absolutely not to be trusted near
  a freshly washed car."
- The rhythm loop: **Honk ✦ Waddle ✦ Plop ✦ Repeat**.
- Headline shape: two short lines, the second with the twist: "One goose. / Zero manners."
- Buttons are eager and short: "Count me in", "Join the flock", "Meet the goose", "Honk", "Flip",
  "Waddle", "Flap".
- Friendly states: loading "Honking…", success "You're in the flock!", input error "That email looks a
  bit scrambled. Try again?", failure "Something went sideways." followed by what to do next, a check
  "to make sure you're not a robot goose."
- Footer-style asides: "Made with bread crumbs and questionable decisions." "No spam, just goose."

**Avoid:** crude words for poop (it's "the Drop", "a plop", "leave your mark"), sarcasm aimed at the
player, long paragraphs, exclamation marks on everything (one big one: "HONK!").

---

## 10. Assets

| File | What |
| --- | --- |
| `source/logo.jpg` | The master logo; the goose's model sheet is traced from it |
| `source/goose/` | The goose's vector art: front (traced), 3/4 and side heads, front extras, and `rig.js`, which puts him together for any view and face |
| `site/assets/goose-sprite.png` | The goose cut-out plus his moving pieces (wing, blink, open bill) |
| `site/assets/goose-head-sticker.png` | Head sticker, used as the brand mark and favicon |
| `site/assets/logo-*.png/.webp` | The logo at web sizes |
| `site/assets/goose-paper.png` | A still of the paper goose |
| `site/paper-art.js` | Palette, goose drawing (legs, walk cycle, sticker border), all scenery art |
| `site/paper-diorama.js` | The paper world: island, pond, standees, camera, goose behaviour and timings |
| `site/styles.css` | UI tokens and components |

---

## 11. Carrying it into Unity

The game is built in Unity. How the pieces above map across:

- **Colour:** enter the hex values as-is in Unity's colour pickers (they are sRGB; Unity converts them
  when the project uses Linear colour space). Import art textures as sRGB.
- **Cut-outs:** sprites or quads with an **unlit** shader (URP `Unlit` or `Sprite-Unlit-Default`), alpha
  clipping at 0.4, rendered on both sides (Render Face: Both). Set each sprite's pivot at the bottom
  centre where it touches the ground. For the goose frame (600×780), the feet are at y 746 from the top,
  so the pivot is (0.5, 0.044).
- **Outlines and sticker borders are baked into the textures**, as on the site, not added by a shader.
  This keeps them exactly like the logo. Export new art with its border already on.
- **The flip:** rotate the goose's Y by 180° over 0.34s with smoothstep, add the hop
  (sin(π·t) × 0.088 × his height), and multiply the material colour by 1 − 0.28·|sin(Y rotation)|.
  A two-sided sprite shows the mirrored drawing from behind, which is exactly the facing-left look.
- **Frames:** the game exports the goose's frames with its own page (`Tools/ArtExport/goose-frames.html`
  in the game repo): the vector art from `source/goose/rig.js` on the legs from `site/paper-art.js`, with
  the sticker border added. Idle, blink, honk and flap face on; the walk and run cycles (each also
  honking), the skid, and idle, flap and honk for moving through the air in the 3/4 view; idle and honk
  in the half turn. Then animate them with the timings in section 8. Keep the rule: he only moves in the
  direction he faces.
- **Ground:** an extruded blob mesh: unlit grass texture on top, a simple lit material (`#F2E4CC`) on
  the bevelled sides. Ground decals (pond, blanket, plops) are flat unlit quads just above it.
- **Shadows:** blob-shadow decals (soft radial brown, 32–40% opacity), not real-time shadows.
- **Lighting:** a warm ambient (sky white, ground `#D8C8AE`) and one warm directional light from upper left.
- **Camera:** perspective, FOV 28 (close-ups 24), pitched about 18° down, following the goose
  sideways at ~60% with smoothing.
- **Fonts:** Baloo 2 and Nunito as TextMeshPro font assets (both are OFL).
- **UI:** pill buttons with 3px ink borders and hard ink drop shadows (9-sliced sprites), the press and
  hover offsets from section 5, cream and paper panels, orange for the primary action.
