/* =========================================================
   Raphael Baligod — CV site
   i18n (EN / JP) + "which file is open" scroll-spy + agents
   that build the page live · vanilla, no deps
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Set before first paint (this script is in <head>) so unbuilt layers never flash.
  if (!reduceMotion) root.classList.add("build");

  /* ---------- i18n (EN / JP) ---------- */
  const i18nCache = new Map();
  const JP = {
    "hero-loc": "大阪府・日本", "hero-status": "プロジェクト進行中",
    "hero-lead": "NetSuite認定<strong>開発者</strong>、インディー<strong>ゲームプロデューサー</strong>、<strong>マーケティングアナリスト</strong> — カスタム自動化、システム連携、そして心温まるゲームづくりに取り組んでいます。",
    "hero-btn": "お問い合わせ", "hero-btn2": "プロジェクトを見る",
    "stat-career": "通算経験年数", "stat-clients": "担当クライアント", "stat-years": "NetSuite歴", "stat-jlpt": "日本語能力試験",

    "about-title": "これまでの歩み",
    "about-p1": "カスタム自動化、スクリプト開発、Advanced PDFテンプレート、システムの導入・移行を通じて、クライアントの業務効率化を支援するフリーランスのNetSuite開発者。NetSuite API、REST連携、Node.js、MVCアーキテクチャに6年以上携わってきたOracle認定資格保持者です。",
    "about-p2": "JLPT N2を取得しており、英語でも日本語でも要件のやり取りができます。日本語の会話力はまだビジネスレベルには達していませんが、日々上達に努めています。現在は大阪の<em>南海電気鉄道</em>でデジタルマーケティングアナリストとしても勤務しています。",
    "about-p3": "その傍ら、インディーゲームプロデューサーとしても活動しています。<em>Sugardew Island</em>をリリースし、現在は新作を制作中です。",

    "exp-title": "職務経歴",
    "exp1-date": "2024年2月 — 現在", "exp1-sub": "大阪、日本",
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
    "sk-label-ai": "AI・自動化", "sk-ai-dev": "AI支援開発", "sk-ai-prompt": "プロンプトエンジニアリング",
    "sk-ai-stt": "音声認識 · ElevenLabs", "sk-ai-mcp": "MCP連携",

    "edu-title": "これまでの学び",
    "edu1-degree": "日本語学科 専門課程", "edu1-loc": "和歌山, 日本",
    "edu2-degree": "コンピュータサイエンス学士（ゲーム開発専攻）", "edu2-loc": "ラグナ, フィリピン",

    "certs-title": "資格・認定", "cert-cg": "コンピュータグラフィックス基礎", "cert-jq": "jQuery入門コース",
    "pub-label": "発表論文",
    "pub-desc": "ライブカメラ映像から肌色を抽出し、隠れマルコフモデルを用いて基本的な手話ジェスチャーをリアルタイムに認識する手法を提案した共著論文。電気通信・電子・コンピュータ工学ジャーナル（JTEC）に掲載。",
    "pub-link": "JTECで読む ↗",

    "proj-title": "現在のプロジェクト",
    "frisk-kind": "Chrome拡張機能",
    "frisk-desc": "配信・動画・講義にリアルタイムで翻訳字幕を表示。タブの音声を聞き取るので、字幕のないコンテンツでも使えます — Twitch、YouTube Live、Kick、ニコニコ、Netflixなど、47言語に対応。",
    "frisk-live": "● 公開中", "frisk-users": "アクティブユーザー", "frisk-rating": "Chrome ウェブストア評価",
    "frisk-asof": "2026年11月時点", "frisk-cta": "friskription.comを見る",

    "games-title": "発売・開発中の作品",
    "sugardew-tag": "2025年発売 · rokaplay", "sugardew-role": "担当：パブリッシャー",
    "sugardew-desc": "動物の世話をし、作物を育て、森の妖精たちに商品を売りながら、眠っていた島に再び活気を取り戻す、ほのぼのとした牧場ショップ・シミュレーション。rokaplayが開発・販売した、名作農業ゲームへの愛情あふれる一作。",
    "game-steam": "Steamで見る ↗",
    "otc-status": "開発中", "otc-title": "未公開タイトル", "otc-tag": "開発中・近日公開",
    "otc-role": "担当：エグゼクティブプロデューサー",
    "otc-desc": "現在開発中の新作アクションゲーム。重厚なダークファンタジーの世界が舞台です。詳細はまだ秘密です。続報をお楽しみに！",

    "contact-title": "お気軽にご連絡を",
    "contact-sub": "フリーランスのNetSuite案件、海外とのコラボレーション、そして面白いお話、いつでも歓迎しています。",
    "f-readme": "はじめに.md", "f-about": "自己紹介.md", "f-exp": "職務経歴.ts", "f-skills": "スキル.json",
    "f-edu": "学歴.yml", "f-creds": "資格.md", "f-games": "ゲーム.md", "f-contact": "連絡先.sh",
    "f-projects": "プロジェクト", "f-gamesdir": "ゲーム", "f-explorer": "エクスプローラー",

    "c-email": "メール", "c-phone": "電話", "footer-loc": "大阪・日本", "back-top": "トップへ戻る ↑",
  };

  let lang = "en";
  let build = null;    // the live-build engine, once running: { layerFor, retype }
  let openFile = null; // the section currently in view (scroll-spy)

  function textFor(el) {
    const t = JP[el.getAttribute("data-i18n")];
    return lang === "jp" && t != null ? t : i18nCache.get(el);
  }

  // Put the current language into every translatable element inside scope (inclusive).
  function translate(scope) {
    i18nCache.forEach((_, el) => { if (scope.contains(el)) el.innerHTML = textFor(el); });
  }

  // On screen, the copy agents retype the text in the new language; off screen it just swaps.
  function applyLang(l, animate) {
    const jp = l === "jp";
    lang = jp ? "jp" : "en";
    const layers = new Set();
    i18nCache.forEach((_, el) => {
      const layer = animate && build && build.layerFor(el);
      if (layer) layers.add(layer); else el.innerHTML = textFor(el);
    });
    root.lang = jp ? "ja" : "en";
    document.querySelectorAll(".file").forEach((f) => {
      if (!f.dataset.pathEn) f.dataset.pathEn = f.dataset.path;
      f.dataset.path = jp ? f.dataset.pathJp : f.dataset.pathEn;
    });
    if (openFile) document.getElementById("statusPath").textContent = openFile.dataset.path;
    if (layers.size) build.retype(layers);
    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === (jp ? "jp" : "en"));
    });
    try { localStorage.setItem("rb-lang", jp ? "jp" : "en"); } catch (e) {}
  }

  // Time in the current role (started Feb 2024), counted from today's date so it
  // never goes stale. Both end months count, matching the other entries.
  function setTenure() {
    const now = new Date();
    const months = (now.getFullYear() - 2024) * 12 + (now.getMonth() - 1) + 1;
    if (months < 1) return; // clock set before the start date: show the place only
    const y = Math.floor(months / 12);
    const m = months % 12;
    const en = [y && y + (y === 1 ? " yr" : " yrs"), m && m + (m === 1 ? " mo" : " mos")].filter(Boolean).join(" ");
    const jp = (y ? y + "年" : "") + (m ? m + "ヶ月" : "");
    const el = document.querySelector('[data-i18n="exp1-sub"]');
    el.textContent = en + " · " + el.textContent;
    JP["exp1-sub"] = jp + " · " + JP["exp1-sub"];
  }

  function initI18N() {
    document.querySelectorAll("[data-i18n]").forEach((el) => i18nCache.set(el, el.innerHTML));
    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.addEventListener("click", () => { if (b.dataset.lang !== lang) applyLang(b.dataset.lang, true); });
    });
    let saved = "en";
    try { saved = localStorage.getItem("rb-lang") || "en"; } catch (e) {}
    if (saved === "jp") applyLang(saved, false);
  }

  /* ---------- Phone/tablet menu: the explorer slides in from the right ---------- */
  function initMenu() {
    const btn = document.getElementById("menuBtn");
    const panel = document.getElementById("explorer");
    const scrim = document.getElementById("scrim");
    const isOpen = () => panel.classList.contains("is-open");
    function set(open, refocus) {
      panel.classList.toggle("is-open", open);
      scrim.hidden = !open;
      root.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) { panel.scrollTop = 0; panel.querySelector("a").focus({ preventScroll: true }); }
      else if (refocus) btn.focus();
    }
    btn.addEventListener("click", () => set(!isOpen()));
    scrim.addEventListener("click", () => set(false));
    panel.addEventListener("click", (e) => { if (isOpen() && e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) set(false, true); });
    window.matchMedia("(max-width: 1000px)").addEventListener("change", () => set(false));
  }

  /* ---------- Scroll-spy: the file in the middle of the screen is the "open" one ---------- */
  function initSpy() {
    const tabs = document.getElementById("tabs");
    const links = document.querySelectorAll(".tabs a, .tree a");
    const path = document.getElementById("statusPath");
    function open(file) {
      links.forEach((a) => {
        const on = a.getAttribute("href") === "#" + file.id;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
        // Keep the active tab visible when the tab strip overflows (phones).
        if (on && a.parentElement === tabs &&
            (a.offsetLeft < tabs.scrollLeft || a.offsetLeft + a.offsetWidth > tabs.scrollLeft + tabs.clientWidth)) {
          tabs.scrollTo({ left: a.offsetLeft - 16 });
        }
      });
      openFile = file;
      path.textContent = file.dataset.path;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) open(e.target); });
    }, { rootMargin: "-45% 0px -54% 0px" });
    document.querySelectorAll(".file").forEach((f) => io.observe(f));
  }

  /* ---------- Live build ----------
     Every [data-b] element is a "layer" that starts hidden. When it scrolls
     into view it is queued, and a free agent cursor of the matching role
     flies over and builds it:
       layout — drags out a selection box, then the container appears
       copy   — streams the text in
       design — wipes visuals in
       qa     — stamps a ✓ on each [data-qa] block once everything in it is built
  */
  const ROLES = [
    { id: "layout", name: "Layout", color: "#3d7bff" },
    { id: "copy",   name: "Copy",   color: "#ffd23f", count: 5 },
    { id: "design", name: "Design", color: "#b07cff" },
    { id: "qa",     name: "QA",     color: "#22c57a" },
  ];
  const PER_ROLE = 3;
  const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1.5 1.5l4.8 12.6 2-5.3 5.3-2z" fill="var(--c)" stroke="#0c0c0d" stroke-width="1.2" stroke-linejoin="round"/></svg>';

  function initBuild() {
    const queue = new Set();   // layers waiting for an agent, in arrival order
    const retyping = new Set(); // built text waiting to be retyped in the other language
    const qaQueue = [];
    const qaDone = new Set();

    const layer = document.createElement("div");
    layer.className = "agents";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const cursors = [];
    ROLES.forEach((role) => {
      for (let n = 1; n <= (role.count || PER_ROLE); n++) {
        const el = document.createElement("div");
        el.className = "agent";
        el.style.setProperty("--c", role.color);
        el.innerHTML = ARROW + "<span>" + role.name + " " + n + "</span>";
        layer.appendChild(el);
        cursors.push({ role: role, el: el, x: 0, y: 0, busy: false, shown: false, timer: 0 });
      }
    });

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    const rand = (a, b) => a + Math.random() * (b - a);

    function docRect(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    }

    function move(c, x, y, ms) {
      ms = ms || Math.max(260, Math.min(620, Math.hypot(x - c.x, y - c.y) * 0.6));
      c.x = x; c.y = y;
      c.el.style.setProperty("--ms", ms + "ms");
      c.el.style.transform = "translate(" + x + "px," + y + "px)";
      return wait(ms);
    }

    // A resting agent has faded out; bring it back in from a screen edge.
    function wake(c) {
      clearTimeout(c.timer);
      if (c.shown) return;
      c.shown = true;
      c.x = Math.random() < 0.5 ? -60 : window.innerWidth + 20;
      c.y = window.scrollY + rand(0.1, 0.9) * window.innerHeight;
      c.el.style.setProperty("--ms", "0ms");
      c.el.style.transform = "translate(" + c.x + "px," + c.y + "px)";
      void c.el.offsetWidth; // flush so the next move animates from here
      c.el.classList.add("on");
    }

    function rest(c) {
      move(c, c.x + rand(-40, 40), c.y + rand(24, 64), 900);
      c.timer = setTimeout(() => { c.shown = false; c.el.classList.remove("on"); }, 1300);
    }

    function addBox(r, role, el, grow) {
      const b = document.createElement("div");
      b.className = "sel";
      b.dataset.label = el.tagName.toLowerCase() + " " + Math.round(r.w) + "×" + Math.round(r.h);
      b.style.cssText = "--c:" + role.color + ";left:" + r.x + "px;top:" + r.y + "px;width:" +
        (grow ? 0 : r.w) + "px;height:" + (grow ? 0 : r.h) + "px";
      layer.appendChild(b);
      return b;
    }

    function finish(el) {
      if (el.classList.contains("is-built")) return;
      el.classList.add("is-built");
      io.unobserve(el);
      // Hand any enclosing block to QA once nothing inside it is left unbuilt.
      for (let q = el.closest("[data-qa]"); q; q = q.parentElement.closest("[data-qa]")) {
        if (!qaDone.has(q) && !q.matches("[data-b]:not(.is-built)") && !q.querySelector("[data-b]:not(.is-built)")) {
          qaDone.add(q);
          qaQueue.push(q);
        }
      }
    }

    function split(text, byChar) {
      if (window.Intl && Intl.Segmenter) {
        const seg = new Intl.Segmenter(root.lang, { granularity: byChar ? "grapheme" : "word" });
        return Array.from(seg.segment(text), (s) => s.segment);
      }
      return byChar ? Array.from(text) : text.split(/(\s+)/);
    }

    // Wrap the text in hidden units (layout stays put), then reveal them in order.
    function wrapUnits(el, words) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const byChar = !words && el.textContent.trim().length < 48;
      const units = [];
      nodes.forEach((node) => {
        if (!node.nodeValue.trim()) return;
        const frag = document.createDocumentFragment();
        split(node.nodeValue, byChar).forEach((s) => {
          if (!s.trim()) { frag.appendChild(document.createTextNode(s)); return; }
          const u = document.createElement("span");
          u.className = "u";
          u.textContent = s;
          frag.appendChild(u);
          units.push(u);
        });
        node.parentNode.replaceChild(frag, node);
      });
      return units;
    }

    function unwrapUnits(scope) {
      scope.querySelectorAll(".u").forEach((u) => u.replaceWith(u.textContent));
      scope.normalize();
    }

    function inView(el) {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    }

    async function work(c, el) {
      const kind = c.role.id;
      const re = el.isRetype;
      if (kind === "qa" && !inView(el)) return;
      const r = docRect(el);
      wake(c);

      if (kind === "layout") {
        await move(c, r.x, r.y, 0);
        const box = addBox(r, c.role, el, true);
        void box.offsetWidth;
        box.style.width = r.w + "px";
        box.style.height = r.h + "px";
        await move(c, r.x + r.w, r.y + r.h, 420);
        finish(el);
        await wait(240);
        box.remove();
      } else if (kind === "copy") {
        // Display type (.rise) comes up through a mask word by word; body text streams.
        const rise = el.classList.contains("rise");
        await move(c, r.x - 2, r.y + Math.min(r.h, 40) / 2, 0);
        const box = addBox(r, c.role, el);
        if (re) {
          el.isRetype = false;
          if (el.closest(".chrome, .explorer")) { // a file name: select it, then type over it
            box.dataset.label = "rename";
            el.classList.add("renaming");
            await wait(320);
            el.classList.remove("renaming");
          }
          translate(el);
        }
        const units = wrapUnits(el, rise);
        if (!re) finish(el);
        const step = rise ? 90 : Math.max(5, Math.min(42, 620 / units.length));
        move(c, r.x + r.w + 4, r.y + r.h - 6, Math.max(300, units.length * step));
        for (let i = 0; i < units.length; i++) {
          if (i) units[i - 1].classList.remove("cur");
          units[i].classList.add("on", "cur");
          await wait(step);
        }
        await wait(rise ? 750 : 120); // let the last word land before unwrapping
        unwrapUnits(el);
        box.remove();
      } else if (kind === "design") {
        await move(c, r.x + r.w * rand(0.4, 0.8), r.y + r.h * rand(0.4, 0.8), 0);
        const box = addBox(r, c.role, el);
        await wait(140);
        finish(el);
        await wait(460);
        box.remove();
      } else {
        await move(c, r.x + r.w - 6, r.y + 2, 0);
        const s = document.createElement("div");
        s.className = "stamp";
        s.textContent = "✓ QA pass";
        s.style.left = r.x + r.w - 10 + "px";
        s.style.top = r.y + "px";
        s.addEventListener("animationend", () => s.remove());
        layer.appendChild(s);
        await wait(420);
      }
    }

    function take(role) {
      if (role === "qa") return qaQueue.shift();
      if (role === "copy" && retyping.size) {
        const el = retyping.values().next().value;
        retyping.delete(el);
        return el;
      }
      for (const el of queue) {
        // Containers first: a layer waits until whatever encloses it is built.
        if (el.dataset.b === role && !el.parentElement.closest("[data-b]:not(.is-built)")) {
          queue.delete(el);
          return el;
        }
      }
    }

    function pump() {
      // Layers that left the viewport before an agent got to them:
      // scrolled past → just show them; back below the fold → wait for next time.
      queue.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0) { queue.delete(el); finish(el); }
        else if (r.top > window.innerHeight) { queue.delete(el); io.unobserve(el); io.observe(el); }
      });
      retyping.forEach((el) => {
        if (!inView(el)) { retyping.delete(el); el.isRetype = false; translate(el); }
      });
      cursors.forEach((c) => {
        if (c.busy) return;
        const el = take(c.role.id);
        if (!el) return;
        c.busy = true;
        work(c, el)
          .catch(() => { if (el.isRetype) translate(el); finish(el); unwrapUnits(el); })
          .then(() => {
            c.busy = false;
            pump();
            if (!c.busy) rest(c);
          });
      });
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !e.target.classList.contains("is-built")) queue.add(e.target);
      });
      pump();
    }, { rootMargin: "0px 0px -6% 0px" });

    build = {
      // The block an agent should retype for this element, or null to swap it instantly
      // (off screen, or not built yet: it will stream in later anyway).
      layerFor(el) {
        const layer = el.closest('[data-b="copy"]') || el;
        if (layer.matches("[data-b]:not(.is-built)") || layer.parentElement.closest("[data-b]:not(.is-built)")) return null;
        return inView(layer) ? layer : null;
      },
      retype(layers) {
        layers.forEach((el) => { el.isRetype = true; retyping.add(el); });
        pump();
      },
    };

    // Measure after webfonts settle so selection boxes match the final layout.
    const start = () => document.querySelectorAll("[data-b]").forEach((el) => io.observe(el));
    const fonts = document.fonts && document.fonts.ready;
    if (fonts) Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(start);
    else start();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    setTenure(); // before initI18N, which snapshots the English text
    initI18N();
    initMenu();
    initSpy();
    // Trailer embed: if it can't load, drop it so the poster image shows.
    const trailer = document.getElementById("trailer");
    if (trailer) trailer.addEventListener("error", () => trailer.remove());
    if (!reduceMotion) {
      try { initBuild(); }
      catch (e) { root.classList.remove("build"); } // never leave the CV hidden
    }
  });
})();
