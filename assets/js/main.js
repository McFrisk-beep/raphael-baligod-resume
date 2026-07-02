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

  /* ---------- i18n (EN / JP) ---------- */
  let lang = "en";
  const i18nCache = new Map();
  const NAMES_JP = {
    Home: "ホーム", About: "プロフィール", Experience: "経歴", Skills: "スキル",
    Education: "学歴", Credentials: "資格", Games: "ゲーム", Contact: "お問い合わせ",
  };
  const JP = {
    "nav-about": "プロフィール", "nav-exp": "経歴", "nav-skills": "スキル",
    "nav-games": "ゲーム", "nav-contact": "お問い合わせ", "nav-edu": "学歴", "nav-creds": "資格",

    "hero-loc": "和歌山県・日本", "hero-avail": "お仕事募集中",
    "hero-lead": "NetSuite認定<strong>開発者</strong>、インディー<strong>ゲームプロデューサー</strong>、<strong>マーケティングアナリスト</strong> — カスタム自動化、システム連携、そして心温まるゲームづくりに取り組んでいます。",
    "hero-btn": "お問い合わせ", "scroll": "スクロール",

    "about-title": "これまでの歩み",
    "about-p1": "カスタム自動化、スクリプト開発、Advanced PDFテンプレート、システムの導入・移行を通じて、クライアントの業務効率化を支援するフリーランスのNetSuite開発者。NetSuite API、REST連携、Node.js、MVCアーキテクチャに6年以上携わってきたOracle認定資格保持者です。",
    "about-p2": "JLPT N2を取得しており、英語でも日本語でも要件のやり取りができます。日本語の会話力はまだビジネスレベルには達していませんが、日々上達に努めています。現在は大阪の<em>南海電気鉄道</em>でデジタルマーケティングアナリストとしても勤務しています。",
    "about-p3": "その傍ら、インディーゲームプロデューサーとしても活動しています。<em>Sugardew Island</em>をリリースし、現在は新作を制作中です。",
    "stat-career": "通算経験年数", "stat-clients": "担当クライアント", "stat-years": "NetSuite歴", "stat-jlpt": "日本語能力試験",

    "exp-title": "職務経歴",
    "exp1-date": "2024年2月 — 現在", "exp1-sub": "2年3ヶ月 · 大阪、日本",
    "exp1-role": "デジタルマーケティングアナリスト · 南海電気鉄道",
    "exp1-b1": "観光データを分析し、トレンドの把握と需要予測を実施",
    "exp1-b2": "CMSを管理・運用し、円滑なコンテンツ更新を実現",
    "exp1-b3": "観光協会や地方自治体と連携",
    "exp1-b4": "OTAと協働し、ツアーパッケージを企画・販促",
    "exp2-date": "2022年5月 — 2024年10月", "exp2-sub": "2年6ヶ月 · リモート",
    "exp2-role": "フリーランス NetSuite開発者",
    "exp2-b1": "クライアント向けの自動化、スクリプト最適化、Advanced PDFカスタマイズ",
    "exp2-b2": "サンドボックスから本番環境への移行と稼働後サポート",
    "exp2-b3": "計8社のクライアント導入を完遂",
    "exp3-date": "2021年7月 — 2022年3月", "exp3-sub": "9ヶ月 · マニラ首都圏・フィリピン",
    "exp3-role": "シニア NetSuite開発者",
    "exp3-b1": "Shopify・WooCommerce・MagentoとのPOSシステム連携",
    "exp3-b2": "Zoku POSとNetSuite間のデータ同期を担うAzure DBの運用",
    "exp3-b3": "ZOKU POS環境でのTypeScript開発",
    "exp4-date": "2019年8月 — 2021年7月", "exp4-sub": "2年 · マニラ首都圏・フィリピン",
    "exp4-role": "NetSuite開発者",
    "exp4-b1": "SuiteCommerce Advanced (SCA) のWebストア4サイトを設計・公開",
    "exp4-b2": "柔軟に設定可能な分割払い処理システムをゼロから設計",
    "exp4-b3": "今後のプロジェクトの開発時間を約40%削減するカスタムモジュールを構築",
    "exp5-date": "2015年9月 — 2019年8月", "exp5-sub": "4年 · マニラ・フィリピン",
    "exp5-role": "プログラミングサポート → シニアTSE → サービスデリバリーコンサルタント",
    "exp5-b1": "24時間365日の技術サポートと危機管理を担当、顧客維持率90%以上",
    "exp5-b2": "プログラミングサポートエンジニア4名を育成・指導",
    "exp5-b3": "NetSuite SCISリテールシステム向けの技術記事を30本以上執筆",
    "exp5-b4": "継続的デリバリーの取り組みによりリードタイムを30%以上短縮",

    "skills-title": "技術とツール",
    "sk-label-1": "NetSuite", "sk-label-2": "開発", "sk-label-3": "マーケティング・データ", "sk-label-4": "言語",
    "sk-impl": "実装・移行", "sk-data": "データ分析", "sk-cms": "CMS管理",
    "sk-pub": "デジタルパブリッシング", "sk-tour": "観光戦略",
    "sk-eng": "英語（ネイティブ）", "sk-tag": "タガログ語（ネイティブ）",

    "edu-title": "これまでの学び",
    "edu1-degree": "日本語学科 専門課程", "edu1-loc": "和歌山, 日本",
    "edu2-degree": "コンピュータサイエンス学士（ゲーム開発専攻）", "edu2-loc": "ラグナ, フィリピン",

    "certs-title": "資格・認定", "cert-cg": "コンピュータグラフィックス基礎", "cert-jq": "jQuery入門コース",
    "pub-label": "発表論文",
    "pub-desc": "ライブカメラ映像から肌色を抽出し、隠れマルコフモデルを用いて基本的な手話ジェスチャーをリアルタイムに認識する手法を提案した共著論文。電気通信・電子・コンピュータ工学ジャーナル（JTEC）に掲載。",
    "pub-link": "JTECで読む →",

    "games-title": "発売・開発中の作品",
    "sugardew-tag": "2025年発売 · rokaplay", "sugardew-role": "担当：パブリッシャー",
    "sugardew-desc": "動物の世話をし、作物を育て、森の妖精たちに商品を売りながら、眠っていた島に再び活気を取り戻す、ほのぼのとした牧場ショップ・シミュレーション。rokaplayが開発・販売した、名作農業ゲームへの愛情あふれる一作。",
    "game-steam": "Steamで見る →",
    "otc-status": "開発中", "otc-title": "未公開タイトル", "otc-tag": "開発中・近日公開",
    "otc-role": "担当：エグゼクティブプロデューサー",
    "otc-desc": "現在開発中の新作アクションゲーム。重厚なダークファンタジーの世界が舞台です。詳細はまだ秘密です。続報をお楽しみに！",

    "contact-title": "お気軽にご連絡を",
    "contact-sub": "フリーランスのNetSuite案件、海外とのコラボレーション、そして面白いお話、いつでも歓迎しています。",
    "c-email": "メール", "c-phone": "電話", "footer-loc": "和歌山・日本", "back-top": "トップへ戻る ↑",
  };

  function applyLang(l) {
    lang = l === "jp" ? "jp" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!i18nCache.has(el)) i18nCache.set(el, el.innerHTML);
      if (lang === "jp" && JP[key] != null) el.innerHTML = JP[key];
      else el.innerHTML = i18nCache.get(el);
    });
    document.documentElement.lang = lang === "jp" ? "ja" : "en";
    document.body.classList.toggle("is-jp", lang === "jp");
    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === lang);
    });
    try { localStorage.setItem("rb-lang", lang); } catch (e) {}
    updatePagerLabels();
    syncUI(current);
  }
  function updatePagerLabels() {
    if (!pager) return;
    Array.prototype.forEach.call(pager.children, (dot, i) => {
      const tip = dot.querySelector(".pager__tip");
      if (tip) {
        const n = panels[i].dataset.name || "";
        tip.textContent = lang === "jp" && NAMES_JP[n] ? NAMES_JP[n] : n;
      }
    });
  }
  function initI18N() {
    document.querySelectorAll("[data-i18n]").forEach((el) => i18nCache.set(el, el.innerHTML));
    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.addEventListener("click", () => applyLang(b.dataset.lang));
    });
    let saved = "en";
    try { saved = localStorage.getItem("rb-lang") || "en"; } catch (e) {}
    applyLang(saved);
  }

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
    const rawName = panels[i].dataset.name || "";
    const name = lang === "jp" && NAMES_JP[rawName] ? NAMES_JP[rawName] : rawName;
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
        else panels[i].scrollIntoView({ behavior: "smooth" });
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
    // Plain document scroll + reveal-on-scroll + scroll-spy for the pager/counter.
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
    initI18N();
    initMediaFallbacks();
    splitHeroTitle();
    initMagnetic();
    initTilt();
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    if (!paged) {
      // No intro wipe in reduced-motion mode (CSS hides it); use normal scroll.
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
