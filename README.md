# Raphael Baligod — Interactive CV

A lightweight, single-page interactive CV/portfolio site for **Raphael Baligod**,
Oracle Certified NetSuite Developer & Game Producer based in Wakayama, Japan.

Inspired by the sleek, editorial feel of studio sites like
[matarellis.gr](https://www.matarellis.gr/en/) — smooth intro wipe,
reveal-on-scroll transitions, and refined typography — but built to stay **fast
and light**: no frameworks, no build step, no runtime dependencies.

## Highlights

- **Pure static** — plain HTML, CSS, and vanilla JS. Just open it.
- **Sleek transitions** — full-screen intro wipe, staggered hero reveal,
  scroll-triggered fades, animated marquee, and hover micro-interactions.
- **Light footprint** — only two Google fonts; everything else is hand-rolled.
- **Responsive** — adapts from mobile (with a full-screen menu) to large screens.
- **Accessible** — semantic markup, keyboard-friendly, and full
  `prefers-reduced-motion` support (animations disabled for users who ask).

## Structure

```
index.html              # markup + content
assets/css/styles.css   # warm editorial styling + animations
assets/js/main.js        # intro, scroll reveal, progress bar, nav, menu
```

## Run it

It's fully static — open `index.html` in a browser, or serve the folder:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit <http://localhost:8000>.

## Deploy

Drop the folder onto any static host — GitHub Pages, Netlify, Vercel, Cloudflare
Pages, etc. No configuration required.

## Customize

- **Content** lives directly in `index.html`.
- **Colors / fonts** are CSS custom properties at the top of `styles.css`
  (`--bg`, `--ink`, `--accent`, `--serif`, `--sans`, …).
- **Timing** of the intro is the `setTimeout` in `runIntro()` (`main.js`).
