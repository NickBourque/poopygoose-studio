# Poopy Goose Studio

The landing page for [poopygoose.studio](https://poopygoose.studio): a cozy-chaos game about a very cute
goose with a very bad habit. The page is a static site (HTML, CSS and JavaScript, no build step). Its
hero is a small paper diorama, made with [three.js](https://threejs.org), where Poopy Goose waddles about
as a flat sticker, Paper Mario style.

The look, motion and voice (for the site and the game) are written down in [DESIGN.md](DESIGN.md).

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
| `site/robots.txt`, `site/sitemap.xml`, `site/llms.txt` | For search engines and AI assistants (see "Search and AI"). |
| `site/devlog/` | The dev diary: its list (`index.html`), one folder per diary, their stickers (`img/`) and the RSS feed, which also holds each diary's email (`feed.xml`). |
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

## Shared with the game

The game ([poopygoose-game](https://github.com/NickBourque/poopygoose-game)) is checked out next to this
repo, and its art export pages (`Tools/ArtExport/` there) read this repo straight off disk through its
local server (served at `/studio/`). So this repo is **upstream** for everything both of them draw, and a
change here reaches the game the next time its art is exported.

| Lives here (the game reads it) | Lives in the game (documented here) |
| --- | --- |
| `DESIGN.md`: how everything looks, moves and sounds, the site and the game | `GAME.md`: how the game plays (moves, rules, numbers, story) |
| `site/paper-art.js`: the ink, the palettes, the sticker border, the goose's legs, wing and walk cycle; the plop and the bread (breadcrumbs, the story's slice, Bill's blueberry scone, the golden loaf and its glints) and the cloud, which its props use; and the scenery (trees, bush, reeds, flowers, sun), which The Pond exports as it is | The other props' drawings (`Tools/ArtExport/props.html`), The Pond's own scenery and the heron (`scenery.html`), giving up's crumple, Phil D. Bin and his bin (`giving-up.html`), the results card, the plop HUD and the button glyphs |
| `source/goose/`, `source/bill/`: both characters' vector art and rigs | The exported sheets in `Assets/Art/`, and everything Unity |

Keeping them in step:

- **A change to the look goes into DESIGN.md**, wherever the work happens. A game feature with a look
  (a prop, a HUD, a character pose, a sound direction) is written up here in the same piece of work, and so
  is motion the game does in its own code with nothing to change here (the neck wobble, the tail shake,
  Bill's fidgets): its rule and numbers belong in DESIGN.md.
- **Change shared art here, then re-export it in the game** (its README lists each export page), and
  commit both repos together, with matching messages. A new pose or face in a rig is a new frame in the
  game's sheet, with its frame number set there too.
- **`site/paper-art.js` draws the site and the game alike**: a change to the goose's legs, feet or wing
  changes both. Undoing an experiment undoes it in both repos, the game's re-exported sheets included.
- **Draw a thing once.** Something the site and the game both show is drawn here and imported by both.
  The game's names are the canon: breadcrumbs (a level's bread), a scone (Bill's, a blueberry one), the golden loaf,
  plops.
- **The site's copy follows the game's facts**: the character file, the moves and the loop
  (Honk ✦ Waddle ✦ Plop ✦ Repeat) shouldn't promise anything GAME.md doesn't.

## Publishing

The site is hosted on GitHub Pages at <https://poopygoose.studio>. Any push to `main` that changes `site/`
publishes it again (`.github/workflows/pages.yml`); it's live a minute or two later. The domain's DNS,
at Squarespace, points to GitHub Pages.

## Sign-ups

The "Join the flock" form adds people to the mailing list on [Kit](https://kit.com). It posts to the Kit form
whose ID is `KIT_FORM_ID` in `site/main.js` (the number in the form's embed code). Kit sends the
confirmation email and keeps the list. While the ID is empty, the form opens an email to
hello@poopygoose.studio instead.

Studio mail (hello@poopygoose.studio) is on Google Workspace. The domain's DNS is managed at Squarespace.

## Dev diary

The dev diary lives at <https://poopygoose.studio/devlog/>, and each one is also emailed to the flock as a
Kit broadcast, sent by hand. (Kit's RSS-to-email automation would send them by itself, but it needs a paid
Kit plan.) `site/devlog/feed.xml` is the diary's RSS feed, for feed readers, and it also holds each diary's
email version.

To add one:

1. Copy a diary's folder (say `site/devlog/two-birds-one-backpack/`) to a new short slug, and write the new
   one in it: its title, description, canonical and `og:` links, number and date. Game art goes in
   `site/devlog/img/`, cut from the game's exported sheets.
2. Add a card for it at the top of the list in `site/devlog/index.html` (newest first).
3. Add an `<item>` for it at the top of `site/devlog/feed.xml`, and bump `lastBuildDate`. Its
   `<content:encoded>` is the email: the same words as the page, in plain HTML, with full
   `https://poopygoose.studio/...` links and image URLs and each image's `width` and `height` set. Its
   `<guid>` is the diary's URL and must never change, or feed readers show it as new again.
4. Add it to search and AI (see "Search and AI" below): a `<url>` in `site/sitemap.xml`, its `@id` in the
   Blog's `blogPost` list in `site/devlog/index.html`, a line under "Dev diaries" in `site/llms.txt`, and its
   own BlogPosting data (copied from the last diary's `<head>`, with its URL, headline, dates and image changed).
5. Push to `main`, and wait the minute or two until the diary is live (the email's images load from the site).
6. Open `tools/devlog-email.html` through the local server and pick the diary. In Kit, start a new
   broadcast, then copy the subject, the preview text and the email across with its buttons. Send a test
   to yourself before sending it to the flock.

What the diary says follows the same rule as the rest of the site: nothing GAME.md doesn't back up.

## Search and AI

The site is written to be found by search engines and to be quoted correctly by AI answers (Google's AI
Overviews, ChatGPT, Claude, Perplexity). Plain, well-ranked HTML is still the base of it; on top of that:

| Where | What it does |
| --- | --- |
| `site/robots.txt` | Lets every crawler in, naming the AI ones (search, answer and training bots) so it's plain they're welcome, and points to the sitemap. To keep a bot out, give it its own group with `Disallow: /`. |
| `site/sitemap.xml` | Every page, with when its words last changed. |
| `site/llms.txt` | The facts in Markdown for language models: what the game is, the characters, the FAQ and every page and diary. |
| JSON-LD in each page's `<head>` | Says who's who, linked by `@id`: the studio (`/#studio`), Nick (`/#nick`), the game (`/#game`, a VideoGame), the site, the FAQ, the diary (`/devlog/#blog`) and each diary (a BlogPosting), with breadcrumbs. |
| The FAQ on the home page | Questions as headings, each answered in one paragraph of 40 to 60 words that makes sense on its own, so answer boxes and AI can lift it whole. |

Keeping it true:

- **The FAQ's words live in three places**: the FAQ section, the FAQPage data in the home page's `<head>` and
  `site/llms.txt`. Change all three together (search engines check the data against the page). Like the rest
  of the site, nothing there that GAME.md doesn't back up, and platforms and dates stay "to be honked" until
  they're announced.
- **When a fact changes** (a platform's announced, a store page goes up, a new character), change it in the FAQ,
  the VideoGame data and `llms.txt`, and bump the page's `lastmod` in the sitemap.
- **Profiles corroborate who we are.** When the studio gets a Steam page, social accounts, a press kit or a
  Wikidata entry, add their URLs to the studio's `sameAs` in the home page's data (and the game's store page
  to the VideoGame's `sameAs` and `url`s), and link them from the footer.
- After a big change, check the pages with Google's Rich Results Test, and resubmit the sitemap in Google
  Search Console and Bing Webmaster Tools (Bing's index feeds ChatGPT's and Copilot's search).

## Large files

`image-to-3d/generated/` (raw models from the image-to-3D tool, about 68 MB) is left out of the repo.
`image-to-3d/README.md` explains how to make them again.
