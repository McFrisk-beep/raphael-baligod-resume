/* =============================================
   CANVAS & STATE
   ============================================= */
const trailCanvas = document.getElementById('trail-canvas');
const trailCtx    = trailCanvas.getContext('2d');
const cursorDot   = document.getElementById('cursor-dot');

let W = window.innerWidth;
let H = window.innerHeight;

const mouse  = { x: W / 2, y: H / 2 };
const smooth = { x: W / 2, y: H / 2 };

let dust           = [];
let burstParticles = [];
let lastDustSpawn  = 0;

// Warm pastel palette (matches the floating badge shapes)
const DUST_COLORS = [
  [247, 200, 106],  // amber
  [245, 168, 120],  // peach
  [232, 160, 170],  // rose
  [158, 200, 160],  // sage
  [187, 170, 216],  // lavender
];

/* =============================================
   I18N — JAPANESE TRANSLATIONS
   ============================================= */
const JP = {
  // Nav
  'nav-about': 'プロフィール',
  'nav-exp':   '経歴',
  'nav-skills':'スキル',
  'nav-games': 'ゲーム',
  'nav-hire':  'ご依頼',
  'nav-contact': 'お問い合わせ',

  // Hero
  'hero-eye':  '和歌山県・日本 &nbsp;·&nbsp; お仕事募集中',
  'hero-desc': 'NetSuite認定開発者<br>インディーゲームプロデューサー<br>マーケティングアナリスト',
  'hero-btn':  '詳しく見る ↓',

  // Badges
  'badge-1': 'NetSuite<br>開発者',
  'badge-2': '経験6年<br>以上',
  'badge-3': 'フリーランス<br>受付中',
  'badge-4': 'Oracle<br>認定',
  'badge-5': 'ゲーム<br>プロデューサー',
  'badge-6': '日本語<br>N2',
  'badge-7': '縛りなし',
  'badge-8': 'Node.js ＆<br>TypeScript',

  // About
  'about-eye':   'プロフィール',
  'about-title': 'これまでの歩み',
  'about-p1': 'カスタム自動化、スクリプト開発、Advanced PDFテンプレート、システムの導入・移行を通じて、クライアントの業務効率化を支援するフリーランスのNetSuite開発者。NetSuite API、REST連携、Node.js、MVCアーキテクチャに6年以上携わってきたOracle認定資格保持者です。',
  'about-p2': 'JLPT N2を取得しており、英語でも日本語でも要件のやり取りができます。日本語の会話力はまだビジネスレベルには達していませんが、日々上達に努めています。現在は大阪の<em>南海電気鉄道</em>でデジタルマーケティングアナリストとしても勤務しています。',
  'about-p3': 'その傍ら、インディーゲームプロデューサーとしても活動しています。<em>Sugardew Island</em>をリリースし、現在は新作を制作中です。',
  'stat-career':  '通算経験年数',
  'stat-clients': '担当クライアント',
  'stat-years':   'NetSuite歴',
  'stat-saved':   '開発時間削減',
  'stat-jlpt':    '日本語能力試験',

  // Experience
  'exp-eye':   '経歴',
  'exp-title': '職務経歴',

  'exp1-dur': '2年3ヶ月',
  'exp2-dur': '2年6ヶ月',
  'exp3-dur': '9ヶ月',
  'exp4-dur': '2年',
  'exp5-dur': '4年',

  'exp1-role': 'デジタルマーケティングアナリスト',
  'exp1-loc':  '大阪・日本',
  'exp1-b1': '観光データを分析し、トレンドの把握と需要予測を実施',
  'exp1-b2': 'CMSを管理・運用し、円滑なコンテンツ更新を実現',
  'exp1-b3': '観光協会や地方自治体と連携',
  'exp1-b4': 'OTAと協働し、ツアーパッケージを企画・販促',

  'exp2-role': 'フリーランス NetSuite開発者',
  'exp2-loc':  'リモート',
  'exp2-b1': 'クライアント向けの自動化、スクリプト最適化、Advanced PDFカスタマイズ',
  'exp2-b2': 'サンドボックスから本番環境への移行と稼働後サポート',
  'exp2-b3': '計8社のクライアント導入を完遂',

  'exp3-role': 'シニア NetSuite開発者',
  'exp3-loc':  'マニラ首都圏・フィリピン',
  'exp3-b1': 'Shopify・WooCommerce・MagentoとのPOSシステム連携',
  'exp3-b2': 'Zoku POSとNetSuite間のデータ同期を担うAzure DBの運用',
  'exp3-b3': 'ZOKU POS環境でのTypeScript開発',

  'exp4-role': 'NetSuite開発者',
  'exp4-loc':  'マニラ首都圏・フィリピン',
  'exp4-b1': 'SuiteCommerce Advanced (SCA) のWebストア4サイトを設計・公開',
  'exp4-b2': '柔軟に設定可能な分割払い処理システムをゼロから設計',
  'exp4-b3': '今後のプロジェクトの開発時間を約40%削減するカスタムモジュールを構築',

  'exp5-role': 'プログラミングサポート → シニアTSE → サービスデリバリーコンサルタント',
  'exp5-loc':  'マニラ・フィリピン',
  'exp5-b1': '24時間365日の技術サポートと危機管理を担当、顧客維持率90%以上',
  'exp5-b2': 'プログラミングサポートエンジニア4名を育成・指導',
  'exp5-b3': 'NetSuite SCISリテールシステム向けの技術記事を30本以上執筆',
  'exp5-b4': '継続的デリバリーの取り組みによりリードタイムを30%以上短縮',

  // Skills
  'skills-eye':   'スキル',
  'skills-title': '技術とツール',
  'sk-label-1': 'NetSuite',
  'sk-label-2': '開発',
  'sk-label-3': 'マーケティング・データ',
  'sk-label-4': '言語',
  'sk-impl': '実装・移行',
  'sk-data': 'データ分析',
  'sk-cms':  'CMS管理',
  'sk-pub':  'デジタルパブリッシング',
  'sk-tour': '観光戦略',
  'sk-eng':  '英語（ネイティブ）',
  'sk-tag':  'タガログ語（ネイティブ）',

  // Education
  'edu-eye':   '学歴',
  'edu-title': 'これまでの学び',
  'edu1-degree': '日本語学科 専門課程',
  'edu1-loc':    '和歌山, 日本',
  'edu2-degree': 'コンピュータサイエンス学士（ゲーム開発専攻）',
  'edu2-loc':    'ラグナ, フィリピン',

  // Certs
  'certs-eye':   '資格',
  'certs-title': '資格・認定',
  'pub-label': '発表論文',
  'pub-desc':  'ライブカメラ映像から肌色を抽出し、隠れマルコフモデルを用いて基本的な手話ジェスチャーをリアルタイムに認識する手法を提案した共著論文。電気通信・電子・コンピュータ工学ジャーナル（JTEC）に掲載。',
  'pub-link':  'JTECで読む →',
  'cert-cg':  'コンピュータグラフィックス基礎',
  'cert-cpp': 'C++プログラミング大会 準優勝',
  'cert-game':'インディーゲーム発売: Sugardew Island',
  'cert-pub': '共著論文: 肌色セグメンテーション（隠れマルコフモデル, IJECE）',

  // Games
  'games-eye':   'ゲーム',
  'games-title': '発売・開発中の作品',
  'sugardew-tag':  '2025年発売 · rokaplay',
  'sugardew-role': '担当：プロデューサー',
  'sugardew-desc': '動物の世話をし、作物を育て、森の妖精たちに商品を売りながら、眠っていた島に再び活気を取り戻す、ほのぼのとした牧場ショップ・シミュレーション。rokaplayが開発・販売した、名作農業ゲームへの愛情あふれる一作。',
  'otc-status':  '開発中',
  'otc-tag':     '開発中・近日公開',
  'otc-role':    '担当：開発',
  'otc-desc':    '現在開発中の新作アクションゲーム。重厚なダークファンタジーの世界が舞台です。詳細はまだ秘密です。続報をお楽しみに！',
  'game-steam':  'Steamで見る →',
  'game-steam2': 'Steamで見る →',

  // Contact
  'contact-eye':   'お問い合わせ',
  'contact-title': 'お気軽にご連絡を',
  'contact-sub':   'フリーランスのNetSuite案件、海外とのコラボレーション、そして面白いお話、いつでも歓迎しています。',
  'c-email': 'メール',
  'c-phone': '電話',
  'footer-loc': '和歌山・日本',
};

function initI18N() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el._en = el.innerHTML;
  });
  const saved = localStorage.getItem('rb-lang') || 'en';
  setLang(saved);
}

function setLang(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (lang === 'jp' && JP[key] != null) {
      el.innerHTML = JP[key];
    } else {
      el.innerHTML = el._en;
    }
  });
  document.body.classList.toggle('jp', lang === 'jp');
  document.documentElement.lang = (lang === 'jp') ? 'ja' : 'en';
  document.querySelectorAll('#lang-toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  localStorage.setItem('rb-lang', lang);
}

document.querySelectorAll('#lang-toggle button').forEach(b => {
  b.addEventListener('click', () => setLang(b.dataset.lang));
});

/* =============================================
   RESIZE
   ============================================= */
/* Ambient dust + sunbeam parallax */
const dustCanvas = document.getElementById('dust-canvas');
const dustCtx = dustCanvas ? dustCanvas.getContext('2d') : null;
const ambientRays = document.querySelector('.ambient-rays');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let ambientDust = [];

function initAmbientDust() {
  if (!dustCanvas) return;
  ambientDust = [];
  if (prefersReduced) return;
  const n = Math.min(48, Math.floor(W / 28));
  for (let i = 0; i < n; i++) {
    ambientDust.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.6 + Math.random() * 1.8,
      vx: 0.05 + Math.random() * 0.18,
      vy: -0.04 - Math.random() * 0.12,
      a: 0.06 + Math.random() * 0.13,
      ph: Math.random() * Math.PI * 2,
    });
  }
}

function drawAmbientDust() {
  if (!dustCtx) return;
  dustCtx.clearRect(0, 0, W, H);
  const t = Date.now() * 0.001;
  for (const p of ambientDust) {
    p.x += p.vx + Math.sin(t + p.ph) * 0.05;
    p.y += p.vy;
    if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
    if (p.x > W + 6) { p.x = -6; }
    const tw = p.a * (0.6 + 0.4 * Math.sin(t * 1.5 + p.ph));
    dustCtx.beginPath();
    dustCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    dustCtx.fillStyle = `rgba(255, 226, 165, ${tw})`;
    dustCtx.fill();
  }
}

function onResize() {
  W = window.innerWidth  || document.documentElement.clientWidth  || 1280;
  H = window.innerHeight || document.documentElement.clientHeight || 800;
  trailCanvas.width  = W;
  trailCanvas.height = H;
  if (dustCanvas) { dustCanvas.width = W; dustCanvas.height = H; initAmbientDust(); }
}

window.addEventListener('resize', onResize, { passive: true });
window.addEventListener('load', onResize);
onResize();

/* =============================================
   MOUSE TRAIL
   ============================================= */
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  const now = Date.now();
  if (now - lastDustSpawn > 14) {
    spawnDust(e.clientX, e.clientY);
    lastDustSpawn = now;
  }
  if (ambientRays) {
    ambientRays.style.setProperty('--rx', ((e.clientX / W - 0.5) * -26).toFixed(1) + 'px');
    ambientRays.style.setProperty('--ry', ((e.clientY / H - 0.5) * -16).toFixed(1) + 'px');
  }
}, { passive: true });

window.addEventListener('mouseleave', () => {
  cursorDot.classList.add('is-hidden');
});

window.addEventListener('mouseenter', () => {
  cursorDot.classList.remove('is-hidden');
});

function spawnDust(x, y) {
  const col = DUST_COLORS[(Math.random() * DUST_COLORS.length) | 0];
  const ang = Math.random() * Math.PI * 2;
  const sp  = 0.15 + Math.random() * 0.5;
  dust.push({
    x:    x + (Math.random() - 0.5) * 7,
    y:    y + (Math.random() - 0.5) * 7,
    vx:   Math.cos(ang) * sp,
    vy:   Math.sin(ang) * sp - 0.28,   // gentle upward float
    r:    2 + Math.random() * 3.2,
    col,
    t:    Date.now(),
    life: 900 + Math.random() * 550,
  });
  if (dust.length > 170) dust.shift();
}

function drawDust() {
  const now = Date.now();
  dust = dust.filter(p => now - p.t < p.life);

  for (const p of dust) {
    const age  = (now - p.t) / p.life;
    // ease in quickly, drift out slowly
    const fade = age < 0.18 ? age / 0.18 : 1 - (age - 0.18) / 0.82;
    const alpha = Math.max(0, fade) * 0.62;
    if (alpha < 0.01) continue;

    p.x  += p.vx;
    p.y  += p.vy;
    p.vx *= 0.99;
    p.vy *= 0.99;

    const [r, g, b] = p.col;
    const rad = p.r * (1 + age * 0.7) * 2.3;  // soft, grows as it drifts
    // denser warm core so the pastel reads on the cream background
    const grdInner = 0.45;
    const grd = trailCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
    grd.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
    grd.addColorStop(grdInner, `rgba(${r},${g},${b},${alpha * 0.55})`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    trailCtx.fillStyle = grd;
    trailCtx.beginPath();
    trailCtx.arc(p.x, p.y, rad, 0, Math.PI * 2);
    trailCtx.fill();
  }
}

/* =============================================
   CLICK BURST
   ============================================= */
const BURST_COLORS = [
  [247,200,106], [245,168,120], [232,160,170],
  [158,200,160], [187,170,216], [146,196,216], [242,224,112],
];

document.addEventListener('click', e => {
  const count = 14;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 3.5;
    const col   = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];
    burstParticles.push({
      x: e.clientX, y: e.clientY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r:  2 + Math.random() * 2.5,
      col, t: Date.now(),
    });
  }
});

function drawBurst() {
  const now = Date.now();
  burstParticles = burstParticles.filter(p => now - p.t < 700);

  for (const p of burstParticles) {
    const age   = (now - p.t) / 700;
    const alpha = (1 - age) * 0.9;
    p.x  += p.vx; p.y += p.vy;
    p.vy += 0.08; p.vx *= 0.96; p.vy *= 0.96;

    const [r, g, b] = p.col;
    trailCtx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    trailCtx.beginPath();
    trailCtx.arc(p.x, p.y, p.r * (1 - age * 0.5), 0, Math.PI * 2);
    trailCtx.fill();
  }
}

/* =============================================
   CURSOR FOLLOW
   ============================================= */
function updateCursor() {
  smooth.x += (mouse.x - smooth.x) * 0.13;
  smooth.y += (mouse.y - smooth.y) * 0.13;
  cursorDot.style.left = smooth.x + 'px';
  cursorDot.style.top  = smooth.y + 'px';
}

const hoverEls = 'a, button, .badge, .stat-bubble, .exp-card, .edu-card, .cert-item, .tag, .c-item, .nav-hire, .btn-hero, .game-card, .lang-toggle button, .nav-burger';

document.querySelectorAll(hoverEls).forEach(el => {
  el.addEventListener('mouseenter', () => cursorDot.classList.add('is-hover'));
  el.addEventListener('mouseleave', () => cursorDot.classList.remove('is-hover'));
});

/* =============================================
   MOBILE BURGER MENU
   ============================================= */
const navBurger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');

function setMenu(open) {
  if (!navBurger || !mobileMenu) return;
  navBurger.classList.toggle('is-open', open);
  mobileMenu.classList.toggle('is-open', open);
  navBurger.setAttribute('aria-expanded', open ? 'true' : 'false');
  mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
  document.body.style.overflow = open ? 'hidden' : '';
}

navBurger?.addEventListener('click', () => {
  setMenu(!mobileMenu.classList.contains('is-open'));
});

mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') setMenu(false);
});

/* =============================================
   LOGO FALLBACK (show monogram if logo fails)
   ============================================= */
document.querySelectorAll('.logo-img').forEach(img => {
  const fail = () => {
    const box = img.closest('.exp-logo, .edu-logo');
    if (box) box.classList.add('is-mono');
  };
  img.addEventListener('error', fail);
  // already-cached failure
  if (img.complete && img.naturalWidth === 0) fail();
});

/* Avatar: fall back to the illustrated SVG if the photo is missing */
const avatarImg = document.querySelector('.hero-avatar-img');
if (avatarImg) {
  const useIllustration = () => {
    const box = avatarImg.closest('.hero-avatar');
    if (box) box.classList.add('is-illus');
  };
  avatarImg.addEventListener('error', useIllustration);
  if (avatarImg.complete && avatarImg.naturalWidth === 0) useIllustration();
}

/* Sugardew trailer: if the embed never loads (blocked/offline), reveal the photo behind it */
const sugardewVideo = document.getElementById('sugardew-video');
if (sugardewVideo) {
  let videoLoaded = false;
  sugardewVideo.addEventListener('load', () => { videoLoaded = true; });
  setTimeout(() => { if (!videoLoaded) sugardewVideo.style.display = 'none'; }, 4500);
}

/* =============================================
   BADGE ENTRANCE
   ============================================= */
function showBadges() {
  document.querySelectorAll('[data-badge]').forEach((b, i) => {
    setTimeout(() => { b.style.opacity = '1'; }, 300 + i * 80);
  });
}

/* =============================================
   SCROLL → NAV ACTIVE
   ============================================= */
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (s.getBoundingClientRect().top < H * 0.45) current = s.id;
  });
  document.querySelectorAll('#nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}, { passive: true });

/* =============================================
   REVEAL OBSERVER
   ============================================= */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      const idx = [...siblings].indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.max(0, idx) * 0.08}s`;
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.10 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* =============================================
   LOOP
   ============================================= */
function frame() {
  trailCtx.clearRect(0, 0, W, H);
  drawDust();
  drawBurst();
  updateCursor();
  drawAmbientDust();
  requestAnimationFrame(frame);
}

frame();
showBadges();
initI18N();
