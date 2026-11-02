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
| Bread crust / crumb | `#D9964F` / `#FBEBC8` | Breadcrumbs, the slice of bread (the site's picnic too), the chunk in his bill |
| Gold / deep gold (game) | `#FFC56B` / `#F0A43A` | The golden loaf and the HUD's infinity sign: a prize, never "use this" |
| Tummy pink (game) | `#F5B4A0` / `#E99A86`, tube `#F9CDBE`, pouch inside `#FCE3D8` | The goose's stomach, intestine and bowel on the plop HUD; only there |
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
| Results card (game) | A card held in front of the camera, tilted -2°, popping in like a cut-out: a Baloo 2 headline with a squiggle under its last word ("Made *it.*"), two info tiles (TIME, MISHAPS) with their values in Baloo 2 ink, a line in Nunito 800 `ink-soft`, and the primary button's orange pill ("Go again."), after the glyph of the button that does it. No sticker border: it's UI, not a cut-out in the world. |
| Button glyph (game) | Printed on signs and cards, no sticker border, with the press-me look: a 7px ink border at prop scale and a hard ink shadow straight down. Xbox face buttons are round, the letter in Baloo 2 (white with an ink outline; ink on the Y), on muted A green `#6FA350`, B red `#D45A48`, X blue `#4F86C2`, Y yellow `#E9B83E`; PlayStation face buttons are round `paper` stickers with their shapes in muted colour and an ink outline: cross blue `#4F86C2`, circle red `#D45A48`, square pink `#D97FA8`, triangle green `#6FA350`. Both pads' other buttons are `cream-deep`, the D-pad's arm to press in orange, and the stick pushed sideways (for waddling) has an orange arrow either side. Keys are `paper` keycaps, a letter in Baloo 2 or a word in Nunito 800. |

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
- **Paper that flips (game):** the goose's honk turns props over with the same paper flip he turns with
  (half a turn in 0.34s, a small hop, darkening edge-on), rippling out from him, nearest first. A prop
  with a back drawing (a gate shut and open, a sign with a hint on its back) swaps it in as the sheet
  passes edge-on, so neither side is ever seen mirrored. A prop with nothing on the back turns edge-on
  instead, stopping at about 80° so a darkened sliver still shows where it is. Hinged things (a gate)
  swing about their hinge without the hop, and only the moving part turns: posts and fences stay put.
  Something that blocks the path stands across it at an angle (a gate at about 60°), so the goose
  visibly bumps into it, and opens flat against the scenery behind. Props are drawn at the goose's
  density (300 px a metre in the game), so their outlines match his.
- **Things a switch works (game):** they look mechanical, so they don't read as honkable. A door a
  pressure plate opens is a plank door banded with iron, standing across the path at the same angle as
  a gate between two tall posts, and it lifts straight up on a pulley (0.6s) and drops back (0.5s): a
  beam across the post tops carries two pulley wheels that turn as the rope runs, and a "1 TON"
  counterweight sinks as the door rises. Clouds and other things to stand on are one-way: jump up
  through them, land on top, drop down through them.
- **Water (game):** a pond in the stage is a dip filled like a toy theatre's sea: a flat water-blue top,
  with rows of paper waves standing across it, each bobbing round a small loop out of step with the
  others. The waves are flat water-blue (light for the back row, deep for the rows in front), with
  scalloped crests outlined in ink, a soft white highlight under the crest and a few white ripple arcs;
  only the crest line gets a sticker border, so the strips tile seamlessly. The birds float between the
  rows, their lower halves hidden, and rock gently as they paddle. Things landing in the water throw up a
  splash: a crown of water with white droplets, popping up and shrinking away.
- **The koi (game):** the pond's critter is a fat orange koi from the side, with cream patches, a darker
  orange fin and belly fin, a few orange scale arcs, whiskers in ink and a goofy gaping mouth (a round red
  "O") with a big round eye; after a gulp, its mouth shuts with a crumb at its lips and its eye squeezes
  smug. Under the water it shows only as its shadow lying on the surface: the koi seen from above in a
  darker water-blue, with no ink and no sticker border (it's in the water, not on it). Before it leaps the
  shadow swells and white ripple rings spread over the spot. It turns with the paper flip like the birds,
  tilting nose-first along its leap.
- **Dying and coming back (game):** things that hurt are prickly, never gory: brambles are wood-brown
  arching canes with ink thorns, sage leaves and berries (ink when ripe, red when not), standing just
  behind the path. A bird that dies shrinks away like a cut-out leaving and spins back in at the last
  checkpoint. Dying, the goose first freezes for a beat (0.35s) with a scared face: face on, eyes wide and
  white on small pupils, his brows tipped up at the middle, and a bead of sweat (water blue, ink-outlined)
  on the side of his head. A checkpoint is a flag on a wooden pole set back from the path: a plain paper pennant
  hanging limp until a bird passes, when it paper-flips over to its back, an orange pennant flying out
  with a paper stripe. In co-op a bird waits in a bubble: a ring of water blue between ink outlines,
  with a white shine at the top left and see-through in the middle, so the bird shows inside. It pops in
  and pops in like any cut-out. Its partner pops it with an aggressive peck: jumping into it, they crane
  their neck far up and forward (the goose's bill shut and eyes wide; Bill's green neck lengthening, still
  grumpy) and jab, lunging forward 14° and stretching 10%. The pop hits hard: everything holds still for
  0.07s, the bubble swells 25% and bursts, and a "POP!" sticker (a jagged white burst, the word in orange
  Baloo 2 with an ink outline, tilted a little) pops up where it was.
- **The end of a level (game):** a twig nest, reading as a nest at a glance from its silhouette: a thick
  ring of crisscrossed sticks in four wood browns (`#9A6A4A`, `#B9824F`, `#7E5538`, `#A87650`, each outlined
  in ink) over a darker body (`#8A5E40`), their ends poking out all round; a dark hollow (`#5E3E2A`); and
  puffs of white goose down (overlapping blobs with one ink outline and a little shade) round the hollow's
  edge, the touch that says it's a goose's. An orange bow on its front is the touch of orange that says
  "this is where you're going". It's two cut-outs sharing one pivot, its back behind the birds and its
  front in front, kept lined up from wherever the camera is, so they're seen standing in it. Reaching it,
  the goose honks and Bill stares, and the results card pops up (section 5).
- **The golden loaf (game):** one a level, the optional prize. A whole tin loaf, its dome scored three
  times, in sunny gold (`#FFC56B`, its top crust `#F0A43A`) with a bright shine. **Gold means "a prize"**,
  kept apart from orange ("use this"). It **shimmers, sparkles and glows**: every 1.8s a slanted band of
  white light sweeps across it (0.3s, drawn as frames of its sheet); three white four-pointed glints with
  gold middles twinkle around it in turn, each popping up turning and shrinking away in 0.45s somewhere new
  each time; and a soft gold halo (`#FFD978`, about half opaque) breathes behind it. The glow is the one
  soft-edged thing in the paper world besides blob shadows, so keep it mild. It hangs in the air bobbing
  and swaying a little, with no shadow; taken, it shrinks to 55% and trails behind the bird's head,
  still sparkling, until it's kept, then pops away. On the results card it's a sticker slapped on the top right
  corner, tilted and hanging over the edge.
- **The plop HUD (game):** the game's one always-on piece of HUD, in the top left corner: the goose's
  insides as a cute diagram, never gross (no colours of real insides beyond a soft pink, nothing wet). A
  paper panel drawn like the site's cards (paper `#FFFDF8`, 7px ink border at 600 px a metre, round
  corners, a hard ink shadow straight down), with no words on it. From the left: his gullet comes down from
  the top edge into his stomach, a fat pink bean (`#F5B4A0`, deeper `#E99A86` inside its curl, a white
  shine on its belly); an intestine (a pink tube `#F9CDBE`, 26px wide with a 5px ink edge and a dashed
  white shine) wiggles across, two waves; and at its end is the plop bay, his big bowel: a fat pouchy tube in the
  stomach's pink, ink-edged, bunched into a round pouch for each plop he can carry (4), an ink crease at each
  pinch, a shine on each pouch and a pale pink slot (`#FCE3D8`) ringed in dashed ink-soft in each. The things on it
  are the world's own cut-outs, shrunk: the bread he's digesting sits in his stomach, rocking (8°) as the
  stomach churns (4%), and dissolves as it turns into plops (a crumb in 1s, a slice a quarter at a time
  over 4s). Each plop squeezes out from behind the stomach, slides down the intestine wiggling (12°) as it's
  digested and squeezes into the bay, then pops into its slot. A dropped plop pops out of its slot. With
  the golden loaf got, the bay's plops pop out, the loaf sits swaying in the stomach, a gold infinity sign
  (Baloo 2, gold fading to its deep gold, an ink outline and a sticker border) pops on over the bay and a
  plop slides down every 1.2s.
- **The Pond (game):** level 1's world, the site's diorama grown into a side-scroller, on the same bright
  morning: a cream sky with the site's sun and clouds hanging in it, the site's round and tall trees and bushes
  behind the lane, its reeds (with cattails) and white and yellow flowers along it. Those are the site's own
  drawings, exported as they are, so the game's pond is the site's pond. Its own pieces, drawn to match:
  **rocks** in a warm pale grey (`#D4CCBF`, shaded `#B9AFA0`) with a crack or two and a sage tuft of moss,
  in three sizes (a pebble, a step to hop, a wall to jump); a plank **jetty** on wood-brown posts, its boards'
  seams in ink; **lily pads** in sage with a notch and ink-soft veins, some with a white water lily round a
  sunny middle; the **mossy stump** the first nest sits on (bark in wood brown with grain strokes, a pale cut
  top with its rings, moss draped over the rim); and an **overhanging branch** with leafy clumps in the
  trees' "v"-tufted style. Ground and banks are the usual card with grass tops.
- **The sleeping heron (game):** The Pond's critter to honk, a tall heron in pale blue-grey (`#CBD4DA`, its
  wing `#9EAEB9`) with a white neck and head, a black crest stripe trailing a plume, and an orange beak and
  legs (orange: you can use it). Facing left. Asleep it's a hunched lump on one leg, head tucked down on its
  chest, eyes shut in a curve, two ink-soft Baloo 2 "z"s floating up. Honked, it paper-flips to awake: bolt
  upright on both legs, neck straight up, beak in the air, a flat lid over a pale yellow eye (offended, never
  angry), about 3 m tall. In its last second awake it shows its drowsy frame (lids nearly shut, beak sunk
  level) and wobbles, then flips back to asleep.

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
  and side, all facing right. Each has eyes open, blink and honk; the front also has the logo's wink and
  scared (dying, in the game),
  and the 3/4 view has the eating faces (gape, bite, two chews and a gulp) and the peck (neck craned far
  up and forward, bill shut, eyes wide).
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
  foot lands and highest in the hop (bobbing just 8: more reads as jumpy at a run's pace). His near wing
  swings like an arm against his near leg, hanging a little down from the shoulder and swinging about
  18° either way: back as that foot lands in front, forward as it pushes off. The game plays the run at
  16 poses a stride (the 8 frames and an in-between halfway between each), so it stays smooth at speed.
  On top of the frames he leans into the run (about 6°), squashes about 1.5% as each foot lands and
  stretches in the hop: lively, but calm enough to read as a run, not a jitter.
  Holding a direction, he waddles off and breaks into a run after about 0.4s, with a cartoon scramble:
  his legs churn at 6 strides a second, far ahead of how fast he's going, and settle to the ground's
  pace over 0.5s. After that it's paced to the ground like the walk.
- **Neck wobble (game):** always, standing about or on the move, his neck wobbles gently like a tall
  jelly on a plate slid from side to side. Its base leads and each bit higher up lags behind (the top
  0.3 of a sway behind the base), so the sway travels up his neck as a wave; his head is carried along
  as one piece, fixed to the top of his neck, and tips about its middle back against the pull (2.5°).
  It sways about 2 cm either way, one back and forth every 3.3s, and settles while he eats or pecks.
  It's done live, by bending his paper across his neck, not drawn into the frames, so it stays smooth.
- **Skid (game):** let go of a run, or push the other way, and he skids briefly to a stop before turning:
  still facing forwards, body sunk, both feet braced out in front with the toes up, the wing out, and the
  sheet leaning back about 8°. Never a moonwalk: he only turns once stopped.
- **Jump (game):** a snappy arc: about 0.4s up to the top, quicker down, with a moment's hang at the
  top while jump is held. He stretches 8% as he takes off with one wingbeat. Rising, his legs trail
  back from the push-off with the toes pointed and the wing a little up; from near the top he falls
  with his legs dangling and reaching forward, toes up, the wing half up. Landing, he squashes (up to
  14%, less for small drops) and springs straight back.
- **Idle:** blinks for 0.14s every 2–5 seconds. Pauses at the ends of a walk (0.8–2.2s), sometimes honks.
- **Honk:** bill open for 0.65s with a slight squash-and-stretch (6%) and a "HONK!" speech bubble that
  pops in above his head on the side he faces, holds, then folds away (1.1s total). In the game it's
  bigger: his neck stretches up (face on) or bends forward in a curve towards where he's pointing (turned,
  his head reaching well past his chest), his eyes widen (30%) and his brows
  lift, his bill stretches out into a trumpet (face on, a round open bell; turned, a long narrow pipe with
  a flare into a bell, reaching about twice the bill's length), and the sheet stretches up
  6% rather than squashing.
- **The Drop (plop):** tap him and he honks and leaves a plop behind him (opposite the way he faces).
  Plops pop in, stay a few seconds, then shrink away. Few on screen at once (the site keeps 6). In the
  game a plop is a standing cut-out (about 0.4 m tall) just behind his lane: it pops in at his tail, falls
  to the ground, and stays 6 seconds (a small step to land on, a weight sitting on a switch; the birds
  walk straight past it) before shrinking away. Up to 3 are out at once. With nothing in him (game) he
  toots instead: eyes squeezed shut, tail up, and green stink (`#B5C26A`, shade `#9DAE52`, lines between its
  billows `#7F8F3C`) shoots straight back from his tail in a narrow jet and balloons into a little mushroom
  cloud lying on its side, its cap rolling over on itself, rising and bending its stem up, before it pinches
  off, spreads and fades (about 2.6s). It's drawn as one cut-out with the usual ink and sticker border, and
  it's the one cut-out that fades: it's a cloud. Still cute, never gross: no stink lines, no brown.
- **Eating bread (game):** the bread lying about a level is **breadcrumbs**, torn chunks (crumb `#FBEBC8`
  with a few air holes, crust `#D9964F` along an edge or two, jagged where they tore) hanging a little off
  the ground, drawn like the chunk in his bill when he bites. They come in **four shapes**: a corner (crust
  along the top and one side), a long strip off the crust's edge, a round nugget capped with crust and a
  wedge torn across from corner to corner. Each is mirrored or not and tilted up to 12°, and no crumb
  matches the one beside it, so a row never looks stamped out. Bill tosses a whole **slice of bread** from a
  loaf (puffy top, the crust all round). Facing bread and pressing Eat, he stops and turns his head to it
  (3/4) and gapes
  comically wide, jaws thrown open on a mouthful of big, square, shiny white human teeth, the dark of
  his mouth held between the jaws, eyes wide, shuffling to just the right spot
  (0.3s). His neck shoots out and down like a swan's, stretching up, over and down so his head tips
  forward onto the bread where it sits, leaning in (0.17s); he bites it there, a chunk in his bill and
  crumbs flying (0.2s); and pulls back upright holding it (0.1s, then 0.3s held up). He chews twice with
  his cheek puffed out, the second chew baring his teeth (0.72s), then gulps: a lump bulges down the
  front of his neck in three steps, eyes shutting, satisfied, at the end (0.54s). About 2.4s in all.
  A crumb he bolts down: a quicker gape (0.2s) and hold (0.15s), no chews, then the gulp, about 1.4s.
  Gaping he stretches up, biting he squashes. With nothing in reach he snaps at the air.
- **Flap:** the near wing lifts from the shoulder (about 26°) with little hops, for 0.9s. In the game
  it's a full wingbeat, five a second: up (about 51°), middle, down (about 18° below, with the body
  pushed up a little), middle. A jump gets one beat, the mid-air flap three, and holding on after the
  flap keeps the wingbeat going as he glides down.
- **Personality:** sweet face, zero manners. Round of belly, means well. Mostly.

### Character file (canon)

| | |
| --- | --- |
| Class | Agent of chaos |
| Home | The pond (allegedly) |
| Likes | Bread, puddles, picnics |
| Signature move | The Drop |
| Stats | Honk 9 · Waddle 4 · Charm 10 · Aim ??? |

### Bill (character rules)

The goose's partner in co-op: a deadpan mallard, the straight man who has seen it all and is unimpressed by
every bit of it, the goose most of all. These rules are fixed; changing them needs the creator's sign-off.

- **He is traced from the creator's drawing, and it is his master.** `source/bill/bill-sketch.jpg` is to
  Bill what the logo is to the goose: `tools/trace-bill.html` traces it into `source/bill/bill-34.svg`
  exactly, and everything else is drawn to match it (`source/bill/rig.js`, `tools/bill-model-sheet.html`).
  When unsure, match the drawing.
- **The look.** A green mallard head (`#2B6241`, darker `#174533` on its far side and under the chin,
  lighter `#4C865E` sheen on top) with a small tuft; a long grey-brown neck and body (`#92877E`, wing
  shading `#6E6262`); a pale speckled belly (`#C6C6C6`, shade `#A6A4A7`); a dark maroon patch on his back
  (`#50282A`); green tail curls; a flat orange bill (`#A96226`) and big orange webbed feet (`#D8792D`).
  The goose's ink and outline weight, and his sticker border.
- **The grump.** Thick, flat lids pulled low over half-round pupils, a flat bill with a frown at the corner
  of the mouth, and, standing about, his wings crossed over his chest like folded arms. He never smiles.
- **Head turn (game), like the goose's.** Standing about he faces us: his head keeps exactly its shape from
  his master, and only his features turn to face us: his lids low and scowling (tipped down at their inner
  ends) over half-round pupils either side, his bill seen end on between them (his own bill turned to face us:
  a round dome where it meets his face, flaring out and down to a wide round end, the groove along its top,
  two slanted nostrils, a lip of his lower bill under its
  mouth's line, set in a frown), a darker green under his chin. On the move his head turns to his
  master's 3/4, passing through a halfway frame (his eyes and bill slid towards the way he's turning).
  Coughing and tossing a slice he keeps his head turned aside. The paper flip still turns him round. His body
  stays as traced.
- **Poses.** Wings crossed (standing about) and wings folded at his sides (moving: a torso drawn to match
  the master under its head, neck, tail and feet).
- **Faces.** Grumpy (the master's), blink (the lids come down), The Stare (lids up, eyes open flat and wide
  on pinprick pupils), rolling his eyes (whites showing, pupils rolled up under the lids, for the Bread
  Toss), scared (game: dying and in a co-op bubble, face on: his tuft standing on end in three spikes, his lids
  shot right up and tipped worried, his eyes popped round on pinprick pupils, a wobbly line along his bill: not
  the goose's sweat, his own) and coughing (lids shot up, eyes popped wide and round on small pupils, his bill dropped open on his
  mouth `#B83A2E`, tongue and uvula `#F07C70`).
- **Motion (game).** He walks and runs the goose's gaits (the same strides, lift and bounce) on his own
  short legs and big feet; his near wing beats, rises and falls as the goose's does (running, it swings
  like an arm, about 20° either way from his side: a stiff, grumpy march), and tossing a slice he
  flings it up over his head, rolling his eyes. He blinks only standing about. Caught in the goose's stink
  he coughs like a very proper duck: standing, his near wing comes up in a fist a short way in front of his
  open bill, and his uvula swings back at each hack and forward again. The game's frames are exported from
  his rig by the game repo's `Tools/ArtExport/bill-frames.html`.

| | |
| --- | --- |
| Class | The straight man |
| Home | The pond (he was here first) |
| Likes | Quiet. Order. Not being honked at |
| Signature move | The Stare |

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
- In the game, deaths are **mishaps**, counted proudly, never as a scolding. The results card's line
  under them is a deadpan aside that gets drier as they pile up: "Not a feather out of place." (none),
  "Only a little worse for wear.", "Bill has notes.", "Means well. Mostly." (lots).
- Button prompts in the game put the glyph first and never say "press", "click" or "tap", so they read right
  on any device: "[X] Honk at paper.", "[A] to jump".
- **Signs in the game** are deadpan, with a dash of sarcasm or goofiness: a plain statement, then a
  sideways look. "Nothing here. What were you expecting?" They can tease the player a little, the way a
  friend would; never mean, never scolding.

**Avoid:** crude words for poop (it's "the Drop", "a plop", "leave your mark"), sarcasm with a sting (a
sign's light tease is fine; mocking the player for failing isn't), long paragraphs, exclamation marks on
everything (one big one: "HONK!").

---

## 10. Assets

| File | What |
| --- | --- |
| `source/logo.jpg` | The master logo; the goose's model sheet is traced from it |
| `source/goose/` | The goose's vector art: front (traced), 3/4 and side heads, front extras, and `rig.js`, which puts him together for any view and face |
| `source/bill/` | Bill's master drawing (`bill-sketch.jpg`), its trace (`bill-34.svg`) and `rig.js`, which puts him together for a pose and face |
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
  the bevelled sides. Ground decals (pond, blanket) are flat unlit quads just above it. Plops stand up
  as cut-outs, since the birds can stand on them.
- **Shadows:** blob-shadow decals (soft radial brown, 32–40% opacity), not real-time shadows.
- **Lighting:** a warm ambient (sky white, ground `#D8C8AE`) and one warm directional light from upper left.
- **Camera:** perspective, FOV 28 (close-ups 24), pitched about 18° down, following the goose
  sideways at ~60% with smoothing.
- **Fonts:** Baloo 2 and Nunito as TextMeshPro font assets (both are OFL).
- **UI:** pill buttons with 3px ink borders and hard ink drop shadows (9-sliced sprites), the press and
  hover offsets from section 5, cream and paper panels, orange for the primary action.

---

## 12. Sound

The world is made of paper, and it sounds like it. Nick sources the game's sounds and music; the list of
everything needed, with where each came from, is `AUDIO.md` in the game repo.

- **Music: plucky and acoustic.** A small, warm ensemble: ukulele, acoustic guitar, pizzicato strings,
  glockenspiel or celesta, a woodwind or two, and hand percussion (woodblock, shaker). Bouncy, never
  frantic, with room for a comic beat. Cozy chaos with grown-up wit: it could be a clever indie film's
  score, not a toddler's TV show.
- **Sound effects are paper or a real honk.** Everything physical is card and paper: footsteps are soft
  paper pats, turning is a card swish, flips are crisp card flips, landings are pats, menus are paper
  ticks and page turns. The one exception is the honk: a real goose, cleaned up and comic.
- **Cute and implied:** the plop is a soft "plop" and the toot short and squeaky, never gross (section 1).
- **Bill is deadpan in sound too:** dry and minimal, a flat "hmm" at most. His cough is three proper
  little hacks.
- **Warnings cut through:** a sound a player relies on (the koi's tell, a frozen thing about to thaw) is
  clear over the music, and always has a visual tell as well, so the game plays with the sound off.
- **Night and weather** keep the same instruments, softer and sparser.
