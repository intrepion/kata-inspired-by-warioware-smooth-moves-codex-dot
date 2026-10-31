# Wiggle Ritual

A rapid-fire microgame arcade inspired by the pose cues, quick reactions and escalating tempo of *WarioWare: Smooth Moves*. This independent project uses original art, code and sounds; it is not affiliated with or endorsed by Nintendo.

## Play locally

Run a local server from this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visit http://127.0.0.1:8000/ in a browser. No build or installation is required.

Read the form cue, then complete the task before the timer runs out. You have four chances. The pace increases every seven rounds, and every eighth round is a two-part boss. The ordinary microgames are shuffled; the run continues until all chances are gone.

Use a mouse or finger on the play area, or the on-screen arrow and action buttons. On a keyboard use the left/right arrow keys (or A/D) and Space/Enter. Each form displays its own instructions. Sound can be toggled at the top. No motion sensors or permissions are used.

This is a compact interpretation with seven regular microgames and one boss, not a reproduction of the original's hundreds of microgames, physical Wii Remote forms, characters or multiplayer modes. Its graphics are drawn in Canvas 2D; no 3D library is needed for these abstract scenes.

## Credits

Game design and original assets created for this kata. The OS ignore patterns are from GitHub's [Linux](https://github.com/github/gitignore/blob/main/Global/Linux.gitignore), [Windows](https://github.com/github/gitignore/blob/main/Global/Windows.gitignore), and [macOS](https://github.com/github/gitignore/blob/main/Global/macOS.gitignore) global templates (CC0). Research: [Nintendo's description](https://www.nintendo.com/en-gb/Games/Wii/WarioWare-Smooth-Moves-283850.html).

MIT licensed; see LICENSE.
