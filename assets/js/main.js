/* =========================================================
   Raphael Baligod — CV site
   i18n + "agents build the page live" engine · vanilla, no deps
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
    "nav-about": "プロフィール", "nav-exp": "経歴", "nav-skills": "スキル",
    "nav-games": "ゲーム", "nav-contact": "お問い合わせ", "nav-edu": "学歴", "nav-creds": "資格",

    "hero-loc": "和歌山県・日本", "hero-avail": "お仕事募集中",
    "hero-lead": "NetSuite認定<strong>開発者</strong>、インディー<strong>ゲームプロデューサー</strong>、<strong>マーケティングアナリスト</strong> — カスタム自動化、システム連携、そして心温まるゲームづくりに取り組んでいます。",
    "hero-btn": "お問い合わせ", "hero-btn2": "経歴を見る",
    "role-1": "NetSuite開発者", "role-2": "ゲームプロデューサー", "role-3": "マーケティングアナリスト", "scroll": "スクロール",

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
    "pub-link": "JTECで読む ↗",

    "games-title": "発売・開発中の作品",
    "sugardew-tag": "2025年発売 · rokaplay", "sugardew-role": "担当：パブリッシャー",
    "sugardew-desc": "動物の世話をし、作物を育て、森の妖精たちに商品を売りながら、眠っていた島に再び活気を取り戻す、ほのぼのとした牧場ショップ・シミュレーション。rokaplayが開発・販売した、名作農業ゲームへの愛情あふれる一作。",
    "game-steam": "Steamで見る ↗",
    "otc-status": "開発中", "otc-title": "未公開タイトル", "otc-tag": "開発中・近日公開",
    "otc-role": "担当：エグゼクティブプロデューサー",
    "otc-desc": "現在開発中の新作アクションゲーム。重厚なダークファンタジーの世界が舞台です。詳細はまだ秘密です。続報をお楽しみに！",

    "contact-title": "お気軽にご連絡を",
    "contact-sub": "フリーランスのNetSuite案件、海外とのコラボレーション、そして面白いお話、いつでも歓迎しています。",
    "c-email": "メール", "c-phone": "電話", "footer-loc": "和歌山・日本", "back-top": "トップへ戻る ↑",
  };

  function applyLang(l) {
    const jp = l === "jp";
    i18nCache.forEach((html, el) => {
      const t = JP[el.getAttribute("data-i18n")];
      el.innerHTML = jp && t != null ? t : html;
    });
    root.lang = jp ? "ja" : "en";
    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === (jp ? "jp" : "en"));
    });
    try { localStorage.setItem("rb-lang", jp ? "jp" : "en"); } catch (e) {}
  }

  function initI18N() {
    document.querySelectorAll("[data-i18n]").forEach((el) => i18nCache.set(el, el.innerHTML));
    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.addEventListener("click", () => applyLang(b.dataset.lang));
    });
    let saved = "en";
    try { saved = localStorage.getItem("rb-lang") || "en"; } catch (e) {}
    if (saved === "jp") applyLang(saved);
  }

  function initMenu() {
    const btn = document.getElementById("menuToggle");
    const links = document.getElementById("navLinks");
    const set = (open) => {
      links.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => set(!links.classList.contains("is-open")));
    links.addEventListener("click", () => set(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  /* ---------- Live build ----------
     Every [data-b] element is a "layer" that starts hidden. When it scrolls
     into view it is queued, and a free agent cursor of the matching role
     flies over and builds it:
       layout — drags out a selection box, then the container appears
       copy   — streams the text in
       design — paints visuals in (blur → sharp)
       qa     — stamps a ✓ on each [data-qa] block once everything in it is built
  */
  const ROLES = [
    { id: "layout", name: "Layout", color: "#3d7bff" },
    { id: "copy",   name: "Copy",   color: "#ffd23f" },
    { id: "design", name: "Design", color: "#b07cff" },
    { id: "qa",     name: "QA",     color: "#22c57a" },
  ];
  const PER_ROLE = 3;
  const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1.5 1.5l4.8 12.6 2-5.3 5.3-2z" fill="var(--c)" stroke="#0c0c0d" stroke-width="1.2" stroke-linejoin="round"/></svg>';

  function initBuild() {
    const els = Array.prototype.slice.call(document.querySelectorAll("[data-b]"));
    const total = els.length;
    const queue = new Set();   // layers waiting for an agent, in arrival order
    const qaQueue = [];
    const qaDone = new Set();
    let built = 0;
    let gen = 0;               // bumped on skip/replay so in-flight work aborts

    const layer = document.createElement("div");
    layer.className = "agents";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const cursors = [];
    ROLES.forEach((role) => {
      for (let n = 1; n <= PER_ROLE; n++) {
        const el = document.createElement("div");
        el.className = "agent";
        el.style.setProperty("--c", role.color);
        el.innerHTML = ARROW + "<span>" + role.name + " " + n + "</span>";
        layer.appendChild(el);
        cursors.push({ role: role, el: el, x: 0, y: 0, busy: false, shown: false, timer: 0 });
      }
    });

    const bar = document.createElement("div");
    bar.className = "build-bar";
    bar.innerHTML =
      '<span class="build-bar__dots" aria-hidden="true">' +
      ROLES.map((r) => '<i style="--c:' + r.color + '"></i>').join("") + "</span>" +
      "<span><b></b> <span class=\"build-bar__count\"></span></span>" +
      '<span class="build-bar__meter" aria-hidden="true"><i></i></span>' +
      '<button type="button"></button>';
    document.body.appendChild(bar);
    const barLead = bar.querySelector("b");
    const barCount = barLead.nextElementSibling;
    const barMeter = bar.querySelector(".build-bar__meter i");
    const barBtn = bar.querySelector("button");

    function status() {
      const busy = cursors.filter((c) => c.busy).length;
      const done = built >= total;
      bar.dataset.state = done ? "done" : busy ? "busy" : "idle";
      barLead.textContent = done ? "Built live by " + cursors.length + " agents"
        : busy ? busy + "/" + cursors.length + " agents building"
        : cursors.length + " agents standing by";
      barCount.textContent = "· " + built + "/" + total + " layers";
      barMeter.style.width = (built / total) * 100 + "%";
      barBtn.textContent = done ? "Replay" : "Skip";
      barBtn.setAttribute("aria-label", done ? "Replay build animation" : "Skip build animation");
    }

    // Rejects if the build was skipped/replayed meanwhile, which unwinds the task.
    const wait = (ms, g) => new Promise((res, rej) => setTimeout(() => (g === gen ? res() : rej()), ms));
    const rand = (a, b) => a + Math.random() * (b - a);

    function docRect(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    }

    function move(c, x, y, ms, g) {
      ms = ms || Math.max(260, Math.min(620, Math.hypot(x - c.x, y - c.y) * 0.6));
      c.x = x; c.y = y;
      c.el.style.setProperty("--ms", ms + "ms");
      c.el.style.transform = "translate(" + x + "px," + y + "px)";
      return wait(ms, g);
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
      move(c, c.x + rand(-40, 40), c.y + rand(24, 64), 900, gen).catch(() => {});
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
      built++;
      // Hand any enclosing block to QA once nothing inside it is left unbuilt.
      for (let q = el.closest("[data-qa]"); q; q = q.parentElement.closest("[data-qa]")) {
        if (!qaDone.has(q) && !q.matches("[data-b]:not(.is-built)") && !q.querySelector("[data-b]:not(.is-built)")) {
          qaDone.add(q);
          qaQueue.push(q);
        }
      }
      status();
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
      return r.bottom > 0 && r.top < window.innerHeight;
    }

    async function work(c, el, g) {
      const kind = c.role.id;
      if (kind === "qa" && !inView(el)) return;
      const r = docRect(el);
      wake(c);

      if (kind === "layout") {
        await move(c, r.x, r.y, 0, g);
        const box = addBox(r, c.role, el, true);
        void box.offsetWidth;
        box.style.width = r.w + "px";
        box.style.height = r.h + "px";
        await move(c, r.x + r.w, r.y + r.h, 420, g);
        finish(el);
        await wait(240, g);
        box.remove();
      } else if (kind === "copy") {
        // Display type (.rise) comes up through a mask word by word; body text streams.
        const rise = el.classList.contains("rise");
        await move(c, r.x - 2, r.y + Math.min(r.h, 40) / 2, 0, g);
        const box = addBox(r, c.role, el);
        const units = wrapUnits(el, rise);
        finish(el);
        const step = rise ? 90 : Math.max(7, Math.min(42, 620 / units.length));
        move(c, r.x + r.w + 4, r.y + r.h - 6, Math.max(300, units.length * step), g).catch(() => {});
        for (let i = 0; i < units.length; i++) {
          if (i) units[i - 1].classList.remove("cur");
          units[i].classList.add("on", "cur");
          await wait(step, g);
        }
        await wait(rise ? 750 : 120, g); // let the last word land before unwrapping
        unwrapUnits(el);
        box.remove();
      } else if (kind === "design") {
        await move(c, r.x + r.w * rand(0.4, 0.8), r.y + r.h * rand(0.4, 0.8), 0, g);
        const box = addBox(r, c.role, el);
        await wait(140, g);
        finish(el);
        await wait(460, g);
        box.remove();
      } else {
        await move(c, r.x + r.w - 6, r.y + 2, 0, g);
        const s = document.createElement("div");
        s.className = "stamp";
        s.textContent = "✓ QA pass";
        s.style.left = r.x + r.w - 10 + "px";
        s.style.top = r.y + "px";
        s.addEventListener("animationend", () => s.remove());
        layer.appendChild(s);
        await wait(420, g);
      }
    }

    function take(role) {
      if (role === "qa") return qaQueue.shift();
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
      cursors.forEach((c) => {
        if (c.busy) return;
        const el = take(c.role.id);
        if (!el) return;
        const g = gen;
        c.busy = true;
        work(c, el, g)
          .catch(() => { if (g === gen) finish(el); })
          .then(() => {
            if (g !== gen) return;
            c.busy = false;
            pump();
            if (!c.busy) rest(c);
          });
      });
      status();
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !e.target.classList.contains("is-built")) queue.add(e.target);
      });
      pump();
    }, { rootMargin: "0px 0px -6% 0px" });

    // Stop everything in flight and clear the stage.
    function reset() {
      gen++;
      queue.clear();
      qaQueue.length = 0;
      layer.querySelectorAll(".sel, .stamp").forEach((n) => n.remove());
      unwrapUnits(document.body);
      cursors.forEach((c) => {
        clearTimeout(c.timer);
        c.busy = c.shown = false;
        c.el.classList.remove("on");
      });
    }

    function skip() {
      reset();
      io.disconnect();
      els.forEach((el) => el.classList.add("is-built"));
      built = total;
      status();
    }

    function replay() {
      reset();
      io.disconnect();
      qaDone.clear();
      els.forEach((el) => el.classList.remove("is-built"));
      built = 0;
      window.scrollTo({ top: 0, behavior: "instant" });
      els.forEach((el) => io.observe(el));
      status();
    }

    barBtn.addEventListener("click", () => (built >= total ? replay() : skip()));
    status();

    // Measure after webfonts settle so selection boxes match the final layout.
    const start = () => els.forEach((el) => io.observe(el));
    const fonts = document.fonts && document.fonts.ready;
    if (fonts) Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(start);
    else start();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    initI18N();
    initMenu();
    // Trailer embed: if it can't load, drop it so the poster image shows.
    const trailer = document.getElementById("trailer");
    if (trailer) trailer.addEventListener("error", () => trailer.remove());
    if (!reduceMotion) {
      try { initBuild(); }
      catch (e) { root.classList.remove("build"); } // never leave the CV hidden
    }
  });
})();
