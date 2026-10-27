# Poopy Goose Studio

The landing page for [poopygoose.studio](https://poopygoose.studio): a cozy-chaos game about a very cute
goose with a very bad habit. The page is a static site (HTML, CSS and JavaScript, no build step). Its
hero is a small paper diorama, made with [three.js](https://threejs.org), where Poopy Goose waddles about
as a flat sticker, Paper Mario style.

## Run it locally

The site needs a web server; opening `index.html` straight from disk won't load its scripts. From the
repo root on Windows:

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

then open <http://localhost:8765/site/>. Any static server pointed at the repo root works for the site
itself, but the dev pages in `tools/` save their output through `serve.ps1`.

## What's where

| Path | What it is |
| --- | --- |
| `site/` | The website. Deploy this folder. |
| `site/paper-art.js` | The paper art: the goose (head and body cut from the logo, plus drawn walking legs) and the scenery. |
| `site/paper-diorama.js` | The 3D paper world: island, pond, camera, and the goose's walking, turning, honking and flapping. |
| `site/assets/goose-sprite.png` | The goose sprite, generated from `source/logo.jpg` (see below). |
| `site/main.js` | Sign-up form, footer year, header shadow. |
| `source/` | The original artwork: logo, 3D render, turnaround video. |
| `tools/` | Dev pages for building and checking the art (open them through the local server). |
| `assets-3d/`, `image-to-3d/`, `explorations/` | The earlier 3D-goose experiments, kept for reference. |

## Rebuilding the goose

The goose's head and body come straight from the logo's pixels, so they match it exactly. If the logo
or the cut changes, with the local server running:

1. `tools/make-goose-sprite.html`: cuts the goose from `source/logo.jpg` and saves `site/assets/goose-sprite.png`.
2. `tools/make-paper-assets.html`: rebuilds the still images (`site/assets/goose-paper.png` and `site/og-image.jpg`).
3. `tools/paper-compare.html`: checks the goose against the logo, pixel by pixel.

`tools/paper-art-preview.html` shows every frame of the goose and every piece of scenery.

## Sign-ups

The "Join the flock" form adds people to the mailing list on [Kit](https://kit.com). It posts to the Kit form
whose ID is `KIT_FORM_ID` in `site/main.js` (the number in the form's embed code). Kit sends the
confirmation email and keeps the list. While the ID is empty, the form opens an email to
hello@poopygoose.studio instead.

Studio mail (hello@poopygoose.studio) is on Google Workspace. The domain's DNS is managed at Squarespace.

## Large files

`image-to-3d/generated/` (raw models from the image-to-3D tool, about 68 MB) is left out of the repo.
`image-to-3d/README.md` explains how to make them again.
