/* =========================================================
   Raphael Baligod — CV site
   Full-screen "curtain cover" deck · vanilla, no deps
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Pointer-driven effects (magnetic, tilt, parallax) only on real cursors.
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const DURATION = 950; // keep in sync with --curtain in CSS

  const panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  const header = document.getElementById("header");
  const headerLinks = Array.prototype.slice.call(document.querySelectorAll(".header__nav a"));
  const pager = document.getElementById("pager");
  const counterCur = document.getElementById("counterCur");
  const counterTotal = document.getElementById("counterTotal");
  const counterName = document.getElementById("counterName");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  let current = 0;
  let animating = false;
  const paged = !reduceMotion; // reduced-motion users get plain document scroll

  const pad = (n) => String(n).padStart(2, "0");
  const indexOfId = (id) => panels.findIndex((p) => "#" + p.id === id || p.id === id);

  /* ---------- Reveal handling ---------- */
  function showReveals(panel) {
    const els = panel.querySelectorAll(".reveal");
    els.forEach((el, k) => {
      el.style.transitionDelay = 250 + k * 90 + "ms";
      el.classList.add("is-visible");
    });
  }
  function hideReveals(panel) {
    panel.querySelectorAll(".reveal").forEach((el) => {
      el.style.transitionDelay = "0ms";
      el.classList.remove("is-visible");
    });
  }

  /* ---------- Enhancements: micro-interactions & depth ---------- */

  // Split the hero title into per-letter spans for a staggered rise.
  function splitHeroTitle() {
    if (reduceMotion) return; // line/letter reveal is disabled under reduced motion
    const title = document.querySelector(".hero__title");
    if (!title) return;
    let ci = 0;
    title.querySelectorAll(".line > span").forEach((span) => {
      const text = span.textContent;
      span.textContent = "";
      Array.prototype.forEach.call(text, (ch) => {
        const s = document.createElement("span");
        s.className = "char";
        if (ch === " ") s.innerHTML = "&nbsp;";
        else s.textContent = ch;
        s.style.setProperty("--ci", ci++);
        span.appendChild(s);
      });
    });
    title.classList.add("is-split");
  }

  // Count the About stats up from zero the first time the panel is shown.
  function animateStats() {
    document.querySelectorAll("#about .stat b").forEach((el) => {
      if (el.dataset.done) return;
      const m = el.textContent.trim().match(/^(\d+)(.*)$/);
      el.dataset.done = "1";
      if (!m) return; // non-numeric (e.g. "N2") — leave as-is
      const target = parseInt(m[1], 10);
      const suffix = m[2] || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const dur = 1100;
      const start = performance.now();
      (function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    });
  }

  // Hook fired whenever a panel becomes the active one (paged or static).
  function onPanelActive(i) {
    if (panels[i] && panels[i].id === "about") animateStats();
  }

  // Magnetic pull on buttons toward the cursor.
  function initMagnetic() {
    if (reduceMotion || !finePointer) return;
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + x * 0.4 + "px," + y * 0.4 + "px)";
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  // Subtle 3D tilt on cards following the cursor.
  function initTilt() {
    if (reduceMotion || !finePointer) return;
    const MAX = 7; // degrees
    document.querySelectorAll(".game-card, .edu-card, .pub-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (-py * MAX).toFixed(2) +
          "deg) rotateY(" + (px * MAX).toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Persistent UI ---------- */
  function buildPager() {
    if (!pager) return;
    panels.forEach((panel, i) => {
      const btn = document.createElement("button");
      btn.className = "pager__dot";
      btn.type = "button";
      btn.setAttribute("aria-label", "Go to " + (panel.dataset.name || "section " + (i + 1)));
      const tip = document.createElement("span");
      tip.className = "pager__tip";
      tip.textContent = panel.dataset.name || "";
      btn.appendChild(tip);
      btn.addEventListener("click", () => goTo(i));
      pager.appendChild(btn);
    });
    if (counterTotal) counterTotal.textContent = pad(panels.length);
  }

  function syncUI(i) {
    const name = panels[i].dataset.name || "";
    if (counterCur) counterCur.textContent = pad(i + 1);
    if (counterName) counterName.textContent = name;
    if (pager) {
      Array.prototype.slice.call(pager.children).forEach((dot, k) => {
        dot.classList.toggle("is-current", k === i);
      });
    }
    headerLinks.forEach((a) => {
      a.classList.toggle("is-current", indexOfId(a.getAttribute("href")) === i);
    });
    document.body.classList.toggle("on-dark", panels[i].classList.contains("panel--dark"));
  }

  /* ---------- Core: move the curtain ---------- */
  function goTo(i, instant) {
    i = Math.max(0, Math.min(panels.length - 1, i));
    if (i === current && !instant) return;
    if (animating) return;

    const prev = current;
    current = i;

    // Curtain rule: panels above the target slide down/out; target & below sit in place.
    // z-index ordering (set in init) keeps later panels covering earlier ones.
    panels.forEach((panel, k) => {
      panel.classList.toggle("is-stacked", k > i);
      if (k === i) {
        hideReveals(panel);
        showReveals(panel);
      } else if (k !== prev) {
        hideReveals(panel);
      }
    });
    // The panel we just left keeps its reveals until it has slid away.
    if (prev !== i) {
      const left = panels[prev];
      window.setTimeout(() => {
        if (current !== prev) hideReveals(left);
      }, DURATION);
    }

    syncUI(i);
    onPanelActive(i);

    if (!instant) {
      animating = true;
      window.setTimeout(() => { animating = false; }, DURATION);
    }
  }

  const next = () => goTo(current + 1);
  const back = () => goTo(current - 1);

  /* ---------- Input: wheel / keys / touch ---------- */
  function atBoundary(panel, goingDown) {
    const canScroll = panel.scrollHeight > panel.clientHeight + 1;
    if (!canScroll) return true;
    const atTop = panel.scrollTop <= 1;
    const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
    return goingDown ? atBottom : atTop;
  }

  function onWheel(e) {
    if (animating) { e.preventDefault(); return; }
    const goingDown = e.deltaY > 0;
    const panel = panels[current];
    // Let tall panels scroll internally until they hit an edge.
    if (!atBoundary(panel, goingDown)) return;
    e.preventDefault();
    if (Math.abs(e.deltaY) < 8) return;
    goingDown ? next() : back();
  }

  let touchY = 0;
  let touchPanel = null;
  function onTouchStart(e) {
    touchY = e.touches[0].clientY;
    touchPanel = panels[current];
  }
  function onTouchEnd(e) {
    if (animating || !touchPanel) return;
    const delta = touchY - e.changedTouches[0].clientY; // +down / -up
    if (Math.abs(delta) < 45) return;
    const goingDown = delta > 0;
    if (!atBoundary(touchPanel, goingDown)) return;
    goingDown ? next() : back();
  }

  function onKey(e) {
    if (animating) return;
    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
      case " ":
        e.preventDefault(); next(); break;
      case "ArrowUp":
      case "PageUp":
        e.preventDefault(); back(); break;
      case "Home": e.preventDefault(); goTo(0); break;
      case "End": e.preventDefault(); goTo(panels.length - 1); break;
    }
  }

  /* ---------- Navigation links ---------- */
  function initLinks() {
    document.querySelectorAll("[data-go]").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const i = indexOfId(href);
        if (i < 0) return;
        e.preventDefault();
        closeMenu();
        if (paged) goTo(i);
        else panels[i].scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  function closeMenu() {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("is-locked");
  }
  function initMenu() {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      mobileMenu.classList.toggle("is-open", open);
      document.body.classList.toggle("is-locked", open);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- Static (reduced-motion) fallback ---------- */
  function initStatic() {
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
              const i = panels.indexOf(entry.target);
              if (i >= 0) { syncUI(i); onPanelActive(i); }
            }
          });
        }, { threshold: 0.4 })
      : null;

    if (io) panels.forEach((p) => io.observe(p));
    else panels.forEach((p) => p.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible")));

    if (header) {
      window.addEventListener("scroll", () => {
        header.classList.toggle("is-scrolled", window.scrollY > 40);
      }, { passive: true });
    }
  }

  /* Stagger the train pass so it feels less predictable. */
  function initTrain() {
    if (reduceMotion) return;
    const train = document.getElementById("skylineTrain");
    if (!train) return;
    const offset = Math.floor(Math.random() * 40);
    train.style.animationDelay = "-" + offset + "s";
  }

  /* Roaming cat — nudge nearby headings when it walks past. */
  function initCat() {
    if (reduceMotion) return;
    if (window.matchMedia("(max-width: 860px)").matches) return;
    const cat = document.getElementById("spriteCat");
    if (!cat) return;
    cat.style.animationDelay = "-" + Math.floor(Math.random() * 38) + "s";

    const bumpables = document.querySelectorAll(
      ".section__title, .hero__title, .about__lead, .contact__lead, .stat b, .hero__lead p"
    );

    let frame = 0;
    function tick() {
      frame++;
      if (frame % 4 === 0) {
        const catRect = cat.getBoundingClientRect();
        if (catRect.width) {
          const cx = catRect.left + catRect.width * 0.5;
          const cy = catRect.top + catRect.height * 0.5;
          const activePanel = paged ? panels[current] : null;

          bumpables.forEach((el) => {
            if (activePanel && !activePanel.contains(el)) {
              el.classList.remove("sprite-bump");
              return;
            }
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) {
              el.classList.remove("sprite-bump");
              return;
            }
            const near =
              cx > r.left - 36 && cx < r.right + 36 &&
              cy > r.top - 28 && cy < r.bottom + 28;
            if (near) {
              const dir = cx < r.left + r.width * 0.5 ? -1 : 1;
              el.classList.add("sprite-bump");
              el.style.setProperty("--bump-x", dir * 4 + "px");
            } else {
              el.classList.remove("sprite-bump");
            }
          });
        }
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ---------- Graceful media fallbacks (CSP-safe; no inline handlers) ---------- */
  function initMediaFallbacks() {
    // Trailer embed: if it can't load, drop it so the poster image shows.
    const video = document.querySelector(".game-video");
    if (video) video.addEventListener("error", () => video.remove());
  }

  /* ---------- Boot ---------- */
  function boot() {
    buildPager();
    initLinks();
    initMenu();
    initMediaFallbacks();
    initTrain();
    initCat();
    splitHeroTitle();
    initMagnetic();
    initTilt();
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    if (!paged) {
      document.body.classList.add("is-ready");
      initStatic();
      return;
    }

    document.body.classList.add("is-paged");
    // z-index so later panels always cover earlier ones during the slide.
    panels.forEach((panel, i) => { panel.style.zIndex = String(i + 1); });

    // Start with everything below the hero stacked off-screen.
    goTo(0, true);
    hideReveals(panels[0]);
    animating = true; // lock input until the intro finishes

    // Input listeners (wheel needs passive:false so we can preventDefault at edges).
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    // Play the intro, then reveal the hero.
    const intro = document.getElementById("intro");
    document.body.classList.add("is-locked");
    window.setTimeout(() => {
      document.body.classList.remove("is-locked");
      document.body.classList.add("is-ready");
      if (intro) intro.classList.add("is-done");
      showReveals(panels[0]);
      animating = false;
    }, 1500);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
