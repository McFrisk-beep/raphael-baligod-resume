# Raphael Baligod — CV

Single-page CV for **Raphael Baligod**, Oracle Certified NetSuite Developer &
Game Producer based in Wakayama, Japan. Live at
<https://raphael-baligod-resume.pages.dev/>.

Plain HTML, CSS and vanilla JS: no framework, no build step, no dependencies.

## What it does

- **The CV is an open project in an editor.** Each section is a file
  (`README.md`, `experience.ts`, `skills.json`, `education.yml`, …) with line
  numbers and syntax colours. The tabs and the explorer are the navigation, the
  status bar shows the open file, and the contact page is a terminal.
- **Current projects.** `projects/friskription.tsx` shows the source next to a
  live preview: a looping screen recording of
  [friskription.com](https://friskription.com/), user count, rating and a link.
- **Builds itself in front of you.** Fourteen "agent" cursors (Layout, Copy,
  Design and QA; five of them Copy) fill in each file as it scrolls into view.
- **Hover only where it does something.** Links, buttons and the clickable
  cards react to the mouse; static content doesn't.
- **English / 日本語** toggle in the status bar (or the ☰ menu on phones), remembered
  between visits. On screen, the agents retype the text and rename the files in
  the tabs and explorer; everything else switches instantly.
- **No hotlinked images.** Logos, badges, flags and game art all live in `assets/img/`.
- **Degrades safely.** With `prefers-reduced-motion`, or if the script fails to
  load, the whole CV is simply visible. Prints as a plain page.

## Structure

```
index.html                     markup + content (English)
assets/css/styles.css          theme, layout, build animation
assets/js/main.js              Japanese strings, language toggle, scroll-spy, build engine
assets/media/friskription.*    Friskription screen recording (MP4) + poster
assets/img/logos/              employer marks (from each company's own site)
assets/img/icons/              skill badges: Simple Icons (CC0), Lucide (ISC), Devicon/Lobe (MIT)
assets/img/flags/              flag-icons (MIT)
assets/img/games/              Sugardew Island key art
_headers                       security headers for Cloudflare Pages
```

## Run it

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Customize

- **Content** lives in `index.html`; Japanese translations are the `JP` object
  in `main.js`, keyed by each element's `data-i18n`.
- **Friskription stats** (users, rating, "as of" date) are plain text in the
  `#projects` section of `index.html`; the star fill follows `--r`.
- **Colours** are the variables at the top of `styles.css`; `--hot` is the accent.
- **What the agents build**: any element with `data-b="layout|copy|design"` is
  a layer. Add `class="rise"` to display headings, and `data-qa` to a block
  that should get a QA stamp once everything inside it is built.
