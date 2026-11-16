# Raphael Baligod — CV

Single-page CV for **Raphael Baligod**, Oracle Certified NetSuite Developer &
Game Producer based in Wakayama, Japan. Live at
<https://raphael-baligod-resume.pages.dev/>.

Plain HTML, CSS and vanilla JS: no framework, no build step, no dependencies.

## What it does

- **Builds itself in front of you.** Twelve "agent" cursors (three each of
  Layout, Copy, Design and QA) assemble the page: the hero on load, every later
  section as it scrolls into view. A status bar shows progress and offers
  **Skip** / **Replay**.
- **Poster type** on ink, paper and vermilion, with the motion language of
  [friskription.com](https://friskription.com/): headline lines rising through
  a mask, crossing marquee bands that swing as you scroll, cycling roles, and a
  scroll-progress rule under the header.
- **English / 日本語** toggle, remembered between visits.
- **Degrades safely.** With `prefers-reduced-motion`, or if the script fails to
  load, the whole CV is simply visible. Prints as a plain black-on-white page.

## Structure

```
index.html              markup + content (English)
assets/css/styles.css   theme, layout, animations
assets/js/main.js       Japanese strings, language toggle, build engine
_headers                security headers for Cloudflare Pages
```

## Run it

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Customize

- **Content** lives in `index.html`; Japanese translations are the `JP` object
  in `main.js`, keyed by each element's `data-i18n`.
- **Accent colour** is `--hot` at the top of `styles.css`.
- **What the agents build**: any element with `data-b="layout|copy|design"` is
  a layer. Add `class="rise"` to display headings, and `data-qa` to a block
  that should get a QA stamp once everything inside it is built.
- **How many agents**: `PER_ROLE` in `main.js`.
