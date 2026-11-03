# Poopy Goose Studio (the website and the design system)

This repo has a sibling, `poopygoose-game` (the Unity game), checked out next to it (`../poopygoose-game`).
Its art export pages (`Tools/ArtExport/`) read DESIGN.md's art straight from here: `site/paper-art.js` and
both characters' rigs in `source/`. So a change here to shared art changes the game's sprites (once they're
re-exported there) as well as the site.

Before finishing anything that touches shared art, read **"Shared with the game"** in README.md and keep
the two in step: re-export the game's sheets, update DESIGN.md, and commit both repos together. Undoing an
experiment undoes it in both.
