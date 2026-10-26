# Making a sculpted Poopy Goose with an image-to-3D tool

> **Archived approach.** The live site now uses the paper style (`site/paper-art.js`,
> `site/paper-diorama.js`). The 3D goose code and the optimised model moved to
> `explorations/3d-goose/` (`goose3d.js`, `goose.glb`). Paths below that say `site/assets/goose.glb`
> or `site/index.html` refer to that earlier setup; to use a model again, copy `goose3d.js` back into
> `site/` and point it at the file. The steps are still useful for 3D game assets.

Goal: turn the original render into a properly sculpted 3D model (`.glb`), then drop it into the
landing page in place of the code-built goose.

## 1. Pick an input

All in `inputs/`, made from your originals:

| File | Use it for |
| --- | --- |
| `render-white.png` | **Start here.** The render, cut out and centred on white, 2048 × 2048. Most tools work best with one clean, front-ish view on a plain background. |
| `render-transparent.png` | Same, with a transparent background, for tools that prefer that. |
| `view-front.jpg`, `view-right-side.jpg`, `view-back.jpg`, `view-left-side.jpg` | Four angles from the turnaround video (1024 × 1024, on the studio backdrop). Use these in a tool's **multi-view** mode if the single-image result gets the back or sides wrong. They're softer than the render (the video is only 720p), so the render stays the main reference. |

"Right side" means the goose's own right side (its bill points to the left of the picture).

## 2. Generate the model

Each of these works the same way: upload, generate, check it from every angle, regenerate if
needed, download as **GLB**. Interfaces change often, so treat the menu names as approximate.

**Meshy** (meshy.ai): *Image to 3D* → upload `render-white.png` → turn texturing on (PBR if offered)
→ generate. If it offers a multi-image upload, add the four `view-*` images. Before downloading, use
its remesh / polycount option to bring it down to roughly 30–50k triangles. Download as GLB.

**Tripo** (tripo3d.ai): *Image to 3D* with `render-white.png`, or the *multi-view* mode with front /
left / back / right slots (multi-view sits on a paid tier). *Smart Low Poly* is useful for a web
model. Download as GLB.

**Rodin** (hyper3d.ai): upload `render-white.png`, and optionally the `view-*` images as extra
references → generate → export GLB. It tends to produce the cleanest textures of the three.

What to check before downloading:
- The face: two eyes, an open smiling bill, brows. Tools often blur small details; regenerate or try another tool.
- The back and underside: they're invented, so look for odd blobs. Multi-view input fixes most of these.
- The feet, and the belly splat with its white spots.

## 3. Keep the file web-friendly

Aim for **under about 5 MB**: up to about 80k triangles with 1024–2048 px textures. Use the tool's
low-poly / remesh option and a smaller texture size at export. The site also reads compressed GLBs
(Draco or meshopt), so a free optimiser such as gltf.report can shrink it further.

Or use `tools/optimize-model.html` (run through the local preview server). It simplifies the mesh with
meshoptimizer without breaking texture seams, shrinks the textures to JPEG and saves the result:
`tools/optimize-model.html?src=/image-to-3d/generated/base_basic_pbr.glb&out=site/assets/goose.glb&tris=80000`
That's how the current `site/assets/goose.glb` was made (1,000,000 → 80,000 triangles, 36 MB → 3.9 MB).
Below about 60k triangles this model starts to look faceted. `tools/model-viewer.html?src=…&src2=…`
shows two models side by side to compare.

The page fades the model in once it's downloaded. If it can't load, the built-in code goose shows instead.

## 4. Swap it into the site

1. Save the file as `site/assets/goose.glb`.
2. Preview it before committing to it. Run the site through any local web server (opening
   `index.html` straight from disk won't load the model) and visit:
   `index.html?model=assets/goose.glb`
   If he faces sideways or backwards, add a turn: `&yaw=1.57`, `&yaw=3.14` or `&yaw=-1.57`.
3. When it looks right, open `site/index.html` and set the two lines near the bottom:
   ```js
   const GOOSE_MODEL = 'assets/goose.glb';
   const GOOSE_MODEL_YAW = 0; // or whichever yaw looked right in the preview
   ```
4. Deploy as usual.

The page scales the model to the same height as the built-in goose, centres it and stands it on the
pond, so you shouldn't need to adjust the camera. If the file fails to load, the built-in goose stays.

What changes with a generated model: it's one solid piece, with no separate bill, wings or feet. So
the moves become whole-body versions (honk = lean in and squash, flap = hop and wobble, wiggle = rock),
and there's no blinking. Getting those back means rigging the model in Blender (a goose isn't one of
the humanoid or four-legged rigs that auto-riggers handle), which is also what you'd need for the game.

## 5. Licence: check before you ship

For a game you plan to sell, use a **paid plan** on whichever tool you pick:
- Free-tier models are typically public, and their terms vary: CC BY 4.0 (credit required) or non-commercial only.
- Paid plans are the ones that offer private models and commercial use.

Read the tool's current terms page before shipping anything, because these change.
