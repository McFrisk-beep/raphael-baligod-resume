/* =========================================================
   Pixel world — 16-bit (SNES-style) animated background
   A dusk fantasy town drawn on a low-res canvas and scaled up
   with crisp integer pixels. Townsfolk of different classes
   (knights, mages, priests, hunters, bards, merchants, citizens)
   stroll the road and pause for small idle actions.
   Vanilla JS, no assets — every sprite is built from the
   pixel templates below at boot.
   ========================================================= */
(function (global) {
  "use strict";

  /* ---------- Small helpers ---------- */
  function rng(seed) {
    // mulberry32 — tiny deterministic PRNG so the town layout is stable.
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = Math.random;
  const pick = (arr, r) => arr[Math.floor((r || rand)() * arr.length)];
  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /* =========================================================
     Sprites — 32×32 characters
     Templates use one letter per pixel. Each letter is a
     (ramp, shade) pair so one template can be recoloured into
     many variants. Shade 0 = lit, 1 = base, 2 = shadow.
     ========================================================= */
  const SPR = 32;
  const OUTLINE = "#1c1428";

  const ROLE = {
    S: ["skin", 0], s: ["skin", 1], t: ["skin", 2],
    H: ["hair", 0], h: ["hair", 1], i: ["hair", 2],
    P: ["main", 0], p: ["main", 1], q: ["main", 2],
    C: ["alt", 0], c: ["alt", 1], d: ["alt", 2],
    U: ["legs", 0], u: ["legs", 1], v: ["legs", 2],
    M: ["metal", 0], m: ["metal", 1], n: ["metal", 2],
    L: ["leather", 0], l: ["leather", 1], k: ["leather", 2],
    G: ["gold", 0], g: ["gold", 1], f: ["gold", 2],
    R: ["accent", 0], r: ["accent", 1], a: ["accent", 2],
    Y: ["glow", 0], y: ["glow", 1], z: ["glow", 2],
    W: ["white", 0], w: ["white", 1], x: ["white", 2],
  };

  const RAMPS = {
    skin: [
      ["#ffdcc0", "#f0b896", "#c68670"],
      ["#f6c89c", "#d99c70", "#a86a50"],
      ["#d6976a", "#ae6c46", "#7a4632"],
      ["#a86c4a", "#824c34", "#553024"],
    ],
    hair: [
      ["#a86e4c", "#784830", "#4c2c22"], // chestnut
      ["#6a6088", "#443a5e", "#2a2440"], // blue-black
      ["#ffe39a", "#e2b454", "#a87a34"], // blonde
      ["#ee7a58", "#b84c38", "#7c2e28"], // copper
      ["#f4ecf4", "#cabcd0", "#8e7e96"], // silver
      ["#d0bcf4", "#9d8ec8", "#6a5a94"], // lilac
    ],
    cloth: {
      rose: ["#eca6ae", "#c97b84", "#8e4e5c"],
      teal: ["#8ecbc2", "#5a9e9a", "#39686c"],
      lilac: ["#c6b6ec", "#9b8ec4", "#685c94"],
      navy: ["#7482c4", "#48548e", "#2c3462"],
      forest: ["#8cb874", "#5a8c4c", "#385e36"],
      moss: ["#a8b86a", "#7a8a44", "#50602e"],
      mustard: ["#f4cc64", "#cc9c3c", "#8c6428"],
      crimson: ["#e8645c", "#b43c42", "#782432"],
      cream: ["#fff6e4", "#e6d6bc", "#b4a088"],
      brown: ["#bc8e64", "#8c6446", "#5e422e"],
      plum: ["#b078a8", "#7e4c7e", "#503056"],
      sky: ["#acd4f4", "#7caad8", "#4e78a8"],
      slate: ["#9a9ab4", "#6c6a88", "#46445e"],
      peach: ["#ffc89c", "#e8a07a", "#b06c54"],
    },
    metal: ["#eef2fa", "#a8b4ca", "#65708e"],
    leather: ["#b67c52", "#865638", "#5a3626"],
    gold: ["#fff09c", "#e2b242", "#a06e28"],
    white: ["#ffffff", "#e8e4f0", "#b8b0c8"],
  };

  // Stamp a template into a char buffer. "." and " " are transparent.
  function T(x, y, rows) { return { x: x, y: y, rows: rows }; }
  function stamp(buf, tpl, dx, dy) {
    if (!tpl) return;
    const rows = tpl.rows;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const y = tpl.y + r + (dy || 0);
      if (y < 0 || y >= SPR) continue;
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === "." || ch === " ") continue;
        const x = tpl.x + c + (dx || 0);
        if (x < 0 || x >= SPR) continue;
        buf[y * SPR + x] = ch;
      }
    }
  }
  function put(buf, x, y, ch) {
    if (x < 0 || y < 0 || x >= SPR || y >= SPR) return;
    buf[y * SPR + x] = ch;
  }
  function get(buf, x, y) {
    if (x < 0 || y < 0 || x >= SPR || y >= SPR) return ".";
    return buf[y * SPR + x];
  }

  /* ---------- Heads ---------- */
  const HEAD = {
    short: T(9, 3, [
      "...hhhhhh.....",
      "..hHHHHHHh....",
      ".hHHhhHHHHh...",
      "hhhhhhhhhHHh..",
      "hhhhhhhhhhhss.",
      "ihhhhtssSSSSs.",
      "ihhhtsSSSSoSs.",
      "iihhtsSSSSoSSs",
      ".ihtssSSSSSSs.",
      ".iittssSSSts..",
      "..iittsssss...",
      ".....ttttt....",
    ]),
    long: T(9, 3, [
      "...hhhhhh.....",
      "..hHHHHHHh....",
      ".hHHHhhHHHh...",
      "hhHhhhhhhHHh..",
      "hhhhhhhhhhhhs.",
      "hhhhhhtsSSSSs.",
      "ihhhhtsSSSoSs.",
      "ihhhhtsSSSoSSs",
      "ihhhitsSSSSSs.",
      "iihhitssSSts..",
      "iihhiittsss...",
      ".iihi..ttt....",
      "..iii.........",
      "...i..........",
    ]),
    bun: T(8, 1, [
      "...hhh.........",
      "..hHHhh........",
      "..hhhhi........",
      "...iihhhhhh....",
      "...hhHHHHHHh...",
      "..hHHHhhHHHHh..",
      ".hhhhhhhhhhHHh.",
      ".hhhhhhhhhhhss.",
      ".ihhhhtssSSSSs.",
      ".ihhhtsSSSSoSs.",
      ".iihhtsSSSSoSSs",
      "..ihtssSSSSSSs.",
      "..iittssSSSts..",
      "...iittsssss...",
      "......ttttt....",
    ]),
    bald: T(9, 3, [
      "...ssssss.....",
      "..sSSSSSSs....",
      ".sSSWSSSSSs...",
      "ssSSSSSSSSSs..",
      "tsssSSSSSSSss.",
      "hhhsstssSSSSs.",
      "hhhstsSSSSoSs.",
      "ihhhtsSSSSoSSs",
      ".ihhhhhhSSSSs.",
      ".ihhhhhhhhhh..",
      "..iihhhhhhh...",
      "....iiiiii....",
    ]),
  };

  /* ---------- Headwear (drawn over heads) ---------- */
  const HAT = {
    helm: T(8, 0, [
      "......PPPp......",
      "....PPPPpppq....",
      "..PPpppq.......",
      ".Ppqq.nmMMMMm...",
      ".pq..nmMMWMMMm..",
      ".q..nmmMMMMMMMm.",
      "...nmmmMMMMMMMmm",
      "...nmmmmmmmmmmmm",
      "...nmmmmmmoooooo",
      "...nmmmmmmmmMoMo",
      "...nnmmmmmmMmMmm",
      "....nnmmmmmmmmm.",
      ".....nnmmmmmmm..",
      "......nnnnnnn...",
    ]),
    wizard: T(6, 0, [
      "....qq..........",
      ".....qpP........",
      ".....qppP.......",
      ".....qpGPP......",
      "....qqGGGPp.....",
      "....qqpGPPPp....",
      "....fggggGGgf...",
      "qqqqpppPPPPPPPpp",
      ".qqqqqqpppppppq.",
    ]),
    huntHood: T(5, 2, [
      ".......pppPP.....",
      "......ppPPPPPp...",
      ".....qpPPPPPPPp..",
      "....qqpPPPpppPPp.",
      "...qqqpppp....Pp.",
      "..qqqqpp.......p.",
      ".qqq.qqp.........",
      "qq...qqp.........",
      ".....qqp.........",
      "......qp.........",
      "......qqp........",
      "......qqqpp...p..",
      ".......qqqppppp..",
    ]),
    cap: T(9, 2, [
      "...cccccc.....",
      "..cCCCCCCc....",
      ".cCCCCCCCCc...",
      ".ccccccccCCc..",
      "dddddddddddccc",
    ]),
    feather: T(7, 0, [
      "RR..............",
      ".RRa............",
      "..RRa...........",
      "...Raa..........",
      "....apPPPPp.....",
      "...ppPPPPPPPp...",
      "..qppPPPPPPPPp..",
      "..qqpppppppppppp",
      "...qq.......qq..",
    ]),
    round: T(6, 1, [
      ".....lllLLL.......",
      "....llLLLLLLl.....",
      "....lkkkkkkkl.....",
      "....lllLLLLLl.....",
      "kkllllllLLLLLLLll.",
      ".kkkkkllllllllkk..",
    ]),
    mitre: T(11, 0, [
      "...GG....",
      "..wWWw...",
      ".wwWWWw..",
      ".wwgGWw..",
      "wwgGGGWw.",
      "wwwgGWWw.",
      "wwwwWWWw.",
      ".gggGGGg.",
    ]),
  };

  const BEARD = T(13, 11, [
    "......hh.",
    ".hhhHHHHh",
    ".hhHHHHHh",
    ".ihhHHHh.",
    "..ihhHh..",
    "...ihh...",
    "....i....",
  ]);

  /* ---------- Torsos (x 10..21, y 15..22) ---------- */
  const BODY = {
    tunic: T(10, 15, [
      "....qppPp...",
      "..qqppPPPp..",
      ".qqqppPPPp..",
      ".qqqpppPPp..",
      ".qqqppppPp..",
      "..kllLLllk..",
      "..qqppppPp..",
      "..qqqppppq..",
    ]),
    dress: T(10, 15, [
      "....qcCCc...",
      "..qqpcCCcp..",
      ".qqqpcCCcp..",
      ".qqqpcCCcP..",
      "..qqpccccp..",
      "..qqpppPPp..",
      "..qqqppPPp..",
      ".qqqpppPPpp.",
    ]),
    armor: T(10, 15, [
      "....nmmMm...",
      "..nnmmMMMm..",
      ".nnnpPPPPm..",
      ".nnnpPGPPm..",
      ".nnnpGGGPm..",
      "..ngfggGgm..",
      "..nqpPPPpm..",
      "..nqqpPPpn..",
    ]),
    robe: T(10, 15, [
      "....qgGGg...",
      "..qqppPPPp..",
      ".qqqppPPPp..",
      ".qqqppPPPp..",
      ".qqqppPPPp..",
      "..dccCCccd..",
      "..qqppPgPp..",
      ".qqqppPgPpp.",
    ]),
    vestment: T(10, 15, [
      "....xwWWw...",
      "..xxwgGgWw..",
      ".xxxwgGgWw..",
      ".xxxwgGgWw..",
      ".xxxwgGgWw..",
      "..xxwgGgWw..",
      "..xxwgGgWw..",
      ".xxxwgGgWww.",
    ]),
    vest: T(10, 15, [
      "....ckLLc...",
      "..cckkLLlc..",
      ".dcckllLlC..",
      ".ddckllLlC..",
      ".ddckllLlC..",
      "..kllgLllk..",
      "..ddccccCc..",
      "..dddccccd..",
    ]),
    doublet: T(10, 15, [
      "....dcCPp...",
      "..ddcCCPPp..",
      ".dddcCCPPp..",
      ".dddcgCPGp..",
      ".dddcCCPPp..",
      "..kllLLllk..",
      "..ddcCCPPp..",
      "..dddcCPpq..",
    ]),
    apron: T(10, 15, [
      "....qppPp...",
      "..qqpwWWp...",
      ".qqqpwWWWp..",
      ".qqqpwWWWp..",
      ".qqqpwwWWp..",
      "..klwwwWWk..",
      "..qqxwwWWp..",
      "..qqxwwwWq..",
    ]),
  };

  /* ---------- Back gear (drawn first, behind everything) ---------- */
  const BACK = {
    sword: T(4, 17, [
      "........gf..",
      ".......Gg...",
      "......kk....",
      ".....kl.....",
      "....kl......",
      "...kl.......",
      "..kl........",
      ".kk.........",
    ]),
    quiver: T(6, 9, [
      ".R.Ra...",
      "RRaRa...",
      ".WaWa...",
      "..WlW...",
      "..kLl...",
      "..klLl..",
      "...klL..",
      "...kllL.",
      "....klL.",
      "....kkl.",
      ".....k..",
    ]),
    pack: T(4, 9, [
      "..cCCCCc....",
      ".dcccccCc...",
      ".dddddccd...",
      "..kkllLLl...",
      ".kkllLLLLl..",
      ".kllllLLLl..",
      ".kllgGlLLl..",
      ".kllgglLLl..",
      ".kkllllLll..",
      ".kkllllLll..",
      "..kkllllk...",
      "...kkkk.....",
    ]),
    cape: T(6, 15, [
      "....qq..",
      "...qqp..",
      "..qqpp..",
      "..qqpp..",
      ".qqqpp..",
      ".qqqpp..",
      "qqqpp...",
      "qqqp....",
      "qqq.....",
    ]),
  };

  /* ---------- Front gear / arms (walk + two idle poses) ---------- */
  const FRONT = {
    shield: T(17, 14, [
      "gGGGGGGg",
      "gPPPPPPg",
      "gPPPGPPg",
      "gPPGGGPg",
      "gpPPGPPg",
      "gpPPGPpg",
      ".gpPPPg.",
      ".gqpppg.",
      "..gqpg..",
      "...gg...",
    ]),
    swordUp: T(20, 0, [
      "..W..",
      "..MM.",
      "..Mm.",
      "..Mm.",
      "..Mm.",
      "..Mm.",
      "..Mm.",
      "..Mm.",
      "..Mm.",
      "..Mm.",
      "..Mm.",
      "..Mm.",
      "gGGgg",
      ".sls.",
      ".tlt.",
      "..g..",
    ]),
    staff: T(21, 1, [
      ".yYy.",
      "yYWYy",
      ".yYy.",
      "..L..",
      ".lLl.",
      "..L..",
      "..L..",
      "..l..",
      "..l..",
      "..l..",
      "..l..",
      ".sl..",
      "ssl..",
      "tsl..",
      "..l..",
      "..l..",
      "..k..",
      "..k..",
      "..k..",
      "..k..",
      "..k..",
      "..k..",
      "..k..",
      "..k..",
      "..k..",
      "..k..",
      "..k..",
      "..k..",
    ]),
    staffUp: T(20, 0, [
      "..y....",
      ".yWy...",
      "yYWYy..",
      ".yWy...",
      "..L....",
      ".lLl...",
      "..L....",
      ".sl....",
      "ssl....",
      "tsl....",
      "..l....",
      "..l....",
      "..l....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
      "..k....",
    ]),
    book: T(16, 16, [
      ".LLLLLl",
      "sLgGgLk",
      "tLGWGLk",
      ".LgGgLk",
      ".llllk.",
    ]),
    handsUp: T(8, 6, [
      "ss............ss",
      "ts............st",
      "xw............wx",
      "xw............wx",
      ".xw..........wx.",
      "..xw........wx..",
      "...xw......wx...",
    ]),
    bow: T(19, 11, [
      "..kl..",
      "..Llw.",
      "...Lw.",
      "...lLw",
      "...lLw",
      "..sslw",
      "..tslw",
      "...lLw",
      "...lLw",
      "...Lw.",
      "..Llw.",
      "..kl..",
    ]),
    bowDraw: T(12, 9, [
      "..........kl....",
      "..........lLw...",
      "...........Lw...",
      "...........lLw..",
      "...ww.w.....Lw..",
      "WMMMMMMMMMMMssR.",
      "...ww.w..Ss.ts..",
      "...........Lw...",
      "...........Lw...",
      "..........lLw...",
      "..........Lw....",
      "..........kl....",
    ]),
    lute: T(12, 14, [
      "...........kl",
      "..........kl.",
      ".........kl..",
      "..LLl...kl...",
      ".LLLLlskl....",
      "LLkkLLst.....",
      "LLkkLLl......",
      "lLLLLl.......",
      ".llll........",
    ]),
    luteStrum: T(12, 14, [
      "...........kl",
      "..........kl.",
      ".........kl..",
      "..LLl...kl...",
      ".LLLLlskl....",
      "LLkkLl.......",
      "LLkkLLss.....",
      "lLLLLlts.....",
      ".llll........",
    ]),
    straps: T(12, 15, [
      "..k....",
      "...k...",
      "...k...",
      "..ss...",
      "..ts...",
    ]),
    coin: T(15, 12, [
      "..ss.",
      ".tss.",
      ".qp..",
      ".qp..",
      ".qp..",
    ]),
    wave: T(17, 8, [
      "......ss",
      "......ts",
      ".....pP.",
      ".....pP.",
      "....pP..",
      "...pP...",
      "..pP....",
      ".pP.....",
      "pP......",
    ]),
    wave2: T(17, 8, [
      ".......ss",
      ".......st",
      "......pP.",
      ".....pP..",
      "....pP...",
      "...pP....",
      "..pP.....",
      ".pP......",
      "pP.......",
    ]),
    basket: T(15, 18, [
      "..l.l..",
      ".l...l.",
      "LLLLLLl",
      "LlLlLlk",
      "lLlLlkk",
      ".lllkk.",
    ]),
  };

  /* ---------- Classes ---------- */
  const CLASSES = {
    knight: {
      head: "short", hat: "helm", body: "armor", back: ["cape", "sword"], lower: "legs",
      front: "shield", idle: ["swordUp", "swordUp"], fx: "glint",
      legs: "metal", speed: 9, weight: 3,
      mains: ["crimson", "navy", "rose", "teal", "lilac"],
    },
    mage: {
      head: "short", hat: "wizard", body: "robe", lower: "robe",
      front: "staff", idle: ["staffUp", "staffUp"], fx: "sparkle",
      speed: 10, weight: 2, beard: 0.5,
      mains: ["navy", "plum", "lilac", "teal", "crimson"], alts: ["mustard", "crimson", "teal", "lilac"],
    },
    priest: {
      head: "short", hat: "mitre", body: "vestment", lower: "robe", robeRamp: "white",
      front: "book", idle: ["handsUp", "handsUp"], fx: "holy",
      speed: 8, weight: 2,
      mains: ["cream"],
    },
    hunter: {
      head: "short", hat: "huntHood", body: "vest", back: ["quiver"], lower: "legs",
      front: "bow", idle: ["bowDraw", "bowDraw"], fx: "",
      speed: 14, weight: 2,
      mains: ["forest", "moss", "brown"], alts: ["forest", "moss", "brown"],
    },
    bard: {
      head: "short", hat: "feather", body: "doublet", lower: "legs",
      front: "lute", idle: ["lute", "luteStrum"], fx: "notes",
      speed: 12, weight: 2,
      mains: ["rose", "mustard", "teal", "lilac"], alts: ["crimson", "navy", "plum", "forest"],
    },
    merchant: {
      head: "bald", hat: "round", body: "apron", back: ["pack"], lower: "legs",
      front: "straps", idle: ["coin", "coin"], fx: "coin",
      speed: 8, weight: 2, hairs: [0, 1, 3, 4],
      mains: ["brown", "moss", "slate", "plum"], alts: ["mustard", "teal", "rose"],
    },
    citizen: {
      head: "short", hat: "cap", body: "tunic", lower: "legs", arm: true,
      idle: ["wave", "wave2"], fx: "heart",
      speed: 11, weight: 3,
      mains: ["teal", "rose", "mustard", "sky", "peach", "slate"], alts: ["crimson", "navy", "forest", "mustard"],
    },
    citizenF: {
      head: "long", body: "dress", lower: "dress", arm: true,
      idle: ["wave", "wave2"], fx: "heart",
      speed: 11, weight: 3,
      mains: ["rose", "lilac", "sky", "peach", "teal"], alts: ["cream"],
    },
    villager: {
      head: "bun", body: "dress", lower: "dress", front: "basket",
      idle: ["basket", "basket"], fx: "heart",
      speed: 9, weight: 2,
      mains: ["mustard", "teal", "plum", "forest"], alts: ["cream"],
    },
  };

  /* ---------- Procedural legs, robes and swinging arms ---------- */
  // Per walk frame: far/near foot x, lifted foot, body bob, arm swing.
  const WALK = [
    { far: 12, near: 19, lift: "", bob: 0, arm: -2 },
    { far: 15, near: 16, lift: "far", bob: -1, arm: 0 },
    { far: 18, near: 13, lift: "", bob: 0, arm: 2 },
    { far: 16, near: 15, lift: "near", bob: -1, arm: 0 },
  ];
  const STAND = { far: 14, near: 17, lift: "", bob: 0, arm: 0 };

  function drawLeg(buf, mask, hx, hy, fx, lifted, near) {
    const ankle = lifted ? 26 : 27;
    for (let y = hy; y <= ankle; y++) {
      const t = (y - hy) / Math.max(1, ankle - hy);
      const cx = Math.round(hx + (fx - hx) * t);
      for (let dx = -1; dx <= 1; dx++) {
        const ch = near ? (dx < 0 ? "v" : dx > 0 ? "U" : "u") : "v";
        put(buf, cx + dx, y, ch);
        if (mask) mask[y * SPR + cx + dx] = near ? 2 : 1;
      }
    }
    const b = ankle + 1;
    const boot = near
      ? [["l", "L", "l", "."], ["l", "L", "L", "l"], ["k", "k", "k", "k"]]
      : [["k", "k", "k", "."], ["k", "k", "k", "k"], ["k", "k", "k", "k"]];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const ch = boot[r][c];
        if (ch === ".") continue;
        put(buf, fx - 1 + c, b + r, ch);
        if (mask) mask[(b + r) * SPR + fx - 1 + c] = near ? 2 : 1;
      }
    }
  }

  // Dark seam where the near leg overlaps the far one.
  function legSeam(buf, mask) {
    for (let y = 0; y < SPR; y++) {
      for (let x = 1; x < SPR; x++) {
        if (mask[y * SPR + x] === 2 && mask[y * SPR + x - 1] === 1) put(buf, x - 1, y, "o");
      }
    }
  }

  function drawRobe(buf, top, hem, sway, ramp) {
    const L = ramp === "white" ? ["x", "w", "W"] : ["q", "p", "P"];
    for (let y = top; y <= hem; y++) {
      const t = (y - top) / Math.max(1, hem - top);
      let l = Math.round(12 - 2.4 * t);
      let r = Math.round(19 + 2.4 * t);
      if (y >= hem - 1) { l += sway < 0 ? -1 : 0; r += sway > 0 ? 1 : 0; }
      for (let x = l; x <= r; x++) {
        let ch = L[1];
        if (x <= l + 1) ch = L[0];
        else if (x === r - 2 || x === r - 1) ch = L[2];
        else if (x === l + 4 && y > top + 1) ch = L[0]; // fold
        put(buf, x, y, ch);
      }
      if (y === hem) for (let x = l; x <= r; x++) put(buf, x, y, ramp === "white" ? "g" : L[0]);
    }
  }

  function drawFeet(buf, st) {
    const feet = [[st.far, false], [st.near, true]];
    for (let f = 0; f < 2; f++) {
      const fx = feet[f][0];
      const near = feet[f][1];
      const lifted = (near && st.lift === "near") || (!near && st.lift === "far");
      const y = lifted ? 28 : 29;
      put(buf, fx - 1, y, near ? "l" : "k"); put(buf, fx, y, near ? "L" : "k");
      put(buf, fx + 1, y, near ? "L" : "k"); put(buf, fx + 2, y, near ? "l" : "k");
      for (let c = -1; c <= 2; c++) put(buf, fx + c, y + 1, "k");
    }
  }

  function drawArm(buf, bob, swing) {
    // Near arm swinging from the shoulder; sleeve in the main colour.
    const sx = 16, sy = 16 + bob;
    const hx = 16 + swing, hy = sy + 5;
    const mask = [];
    for (let r = 0; r <= 4; r++) {
      const x = Math.round(sx + (hx - sx) * (r / 5));
      put(buf, x, sy + r, "p"); put(buf, x + 1, sy + r, "P");
      mask.push([x, sy + r], [x + 1, sy + r]);
    }
    put(buf, hx, hy, "s"); put(buf, hx + 1, hy, "S");
    put(buf, hx, hy + 1, "t"); put(buf, hx + 1, hy + 1, "s");
    mask.push([hx, hy], [hx + 1, hy], [hx, hy + 1], [hx + 1, hy + 1]);
    // Seam between arm and torso so the sleeve reads as its own shape.
    const inMask = (x, y) => mask.some((m) => m[0] === x && m[1] === y);
    mask.forEach((m) => {
      const lx = m[0] - 1, ly = m[1];
      if (!inMask(lx, ly) && get(buf, lx, ly) !== ".") put(buf, lx, ly, "o");
    });
  }

  function outline(buf) {
    const out = buf.slice();
    for (let y = 0; y < SPR; y++) {
      for (let x = 0; x < SPR; x++) {
        if (buf[y * SPR + x] !== ".") continue;
        if (get(buf, x - 1, y) !== "." || get(buf, x + 1, y) !== "." ||
            get(buf, x, y - 1) !== "." || get(buf, x, y + 1) !== ".") {
          out[y * SPR + x] = "o";
        }
      }
    }
    return out;
  }

  // Compose one frame of a character into a char buffer.
  function composeFrame(cls, frame, pose, beard) {
    const buf = new Array(SPR * SPR).fill(".");
    const st = pose === "walk" ? WALK[frame] : STAND;
    const bob = st.bob;

    (cls.back || []).forEach((k) => stamp(buf, BACK[k], 0, bob));

    if (cls.lower === "legs") {
      const mask = new Uint8Array(SPR * SPR);
      drawLeg(buf, mask, 14, 23 + bob, st.far, st.lift === "far", false);
      drawLeg(buf, mask, 16, 23 + bob, st.near, st.lift === "near", true);
      legSeam(buf, mask);
    } else {
      drawFeet(buf, st);
      const hem = cls.lower === "dress" ? 27 : 28;
      const sway = pose === "walk" ? (frame === 0 ? 1 : frame === 2 ? -1 : 0) : 0;
      drawRobe(buf, 21 + bob, hem, sway, cls.robeRamp);
    }

    stamp(buf, BODY[cls.body], 0, bob);
    stamp(buf, HEAD[cls.head], 0, bob);
    if (beard) stamp(buf, BEARD, 0, bob);
    if (cls.hat) stamp(buf, HAT[cls.hat], 0, bob);

    if (pose === "walk") {
      if (cls.arm) drawArm(buf, bob, st.arm);
      if (cls.front) stamp(buf, FRONT[cls.front], 0, bob);
    } else {
      const idleKey = cls.idle[pose === "idle1" ? 1 : 0];
      if (cls.arm && idleKey.indexOf("wave") !== 0) drawArm(buf, bob, 0);
      stamp(buf, FRONT[idleKey], 0, bob);
    }
    return outline(buf);
  }

  function paint(buf, pal, flip) {
    const c = makeCanvas(SPR, SPR);
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(SPR, SPR);
    const d = img.data;
    const cache = {};
    for (let y = 0; y < SPR; y++) {
      for (let x = 0; x < SPR; x++) {
        const ch = buf[y * SPR + x];
        if (ch === ".") continue;
        let rgb = cache[ch];
        if (!rgb) {
          let hex = OUTLINE;
          if (ch !== "o") {
            const role = ROLE[ch];
            hex = role ? pal[role[0]][role[1]] : OUTLINE;
          }
          rgb = cache[ch] = hexToRgb(hex);
        }
        const tx = flip ? SPR - 1 - x : x;
        const o = (y * SPR + tx) * 4;
        d[o] = rgb[0]; d[o + 1] = rgb[1]; d[o + 2] = rgb[2]; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  const GLOW = {
    sparkle: ["#ffffff", "#a8f0ff", "#6ab8e8"],
    holy: ["#ffffff", "#fff0a0", "#e8c060"],
  };

  function makePalette(clsKey, r) {
    const cls = CLASSES[clsKey];
    const main = RAMPS.cloth[pick(cls.mains, r)];
    const alt = RAMPS.cloth[pick(cls.alts || cls.mains, r)];
    const legsRamp = cls.legs === "metal" ? RAMPS.metal
      : RAMPS.cloth[pick(["brown", "slate", "navy", "moss", "plum"], r)];
    return {
      skin: pick(RAMPS.skin, r),
      hair: RAMPS.hair[pick(cls.hairs || [0, 1, 2, 3, 4, 5], r)],
      main: main,
      alt: alt,
      legs: legsRamp,
      metal: RAMPS.metal,
      leather: RAMPS.leather,
      gold: RAMPS.gold,
      accent: RAMPS.cloth[pick(["crimson", "sky", "mustard", "rose"], r)],
      glow: cls.fx === "holy" ? GLOW.holy : GLOW.sparkle,
      white: RAMPS.white,
    };
  }

  // Build all frames (walk ×4, idle ×2) in both facings for one character.
  function buildCharacter(clsKey, r) {
    const cls = CLASSES[clsKey];
    const pal = makePalette(clsKey, r);
    const beard = (cls.beard || 0) > (r || rand)();
    if (beard && clsKey === "mage") pal.hair = RAMPS.hair[4];
    const frames = { walk: [[], []], idle: [[], []] };
    for (let f = 0; f < 4; f++) {
      const buf = composeFrame(cls, f, "walk", beard);
      frames.walk[0].push(paint(buf, pal, false));
      frames.walk[1].push(paint(buf, pal, true));
    }
    ["idle0", "idle1"].forEach((pose) => {
      const buf = composeFrame(cls, 0, pose, beard);
      frames.idle[0].push(paint(buf, pal, false));
      frames.idle[1].push(paint(buf, pal, true));
    });
    return { cls: clsKey, def: cls, pal: pal, frames: frames };
  }

  /* =========================================================
     World — static layers are painted pixel-by-pixel into
     offscreen canvases on resize; only the living bits
     (clouds, smoke, lamps, people, particles) redraw per frame.
     ========================================================= */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bayer = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

  const CC = {};
  function C(hex) { return CC[hex] || (CC[hex] = hexToRgb(hex)); }
  function mix(a, b, t) {
    const x = C(a), y = C(b);
    const h = (v) => ("0" + Math.round(v).toString(16)).slice(-2);
    return "#" + h(x[0] + (y[0] - x[0]) * t) + h(x[1] + (y[1] - x[1]) * t) + h(x[2] + (y[2] - x[2]) * t);
  }

  // Tiny ImageData painter: crisp pixels, optional alpha blend.
  function Surface(w, h) {
    this.w = w;
    this.h = h;
    this.canvas = makeCanvas(w, h);
    this.ctx = this.canvas.getContext("2d");
    this.img = this.ctx.createImageData(w, h);
    this.d = this.img.data;
  }
  Surface.prototype.px = function (x, y, hex, a) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const c = C(hex), d = this.d, o = (y * this.w + x) * 4;
    if (a == null || a >= 1) {
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      return;
    }
    const ea = d[o + 3] / 255, na = a + ea * (1 - a);
    if (na <= 0) return;
    for (let k = 0; k < 3; k++) d[o + k] = (c[k] * a + d[o + k] * ea * (1 - a)) / na;
    d[o + 3] = na * 255;
  };
  Surface.prototype.rect = function (x, y, w, h, hex, a) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, hex, a);
  };
  Surface.prototype.filled = function (x, y) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return false;
    return this.d[(y * this.w + x) * 4 + 3] > 0;
  };
  Surface.prototype.done = function () {
    this.ctx.putImageData(this.img, 0, 0);
    return this.canvas;
  };

  const SKY = [
    "#1e1638", "#271c46", "#33235a", "#452d66", "#5c3668", "#7a3f66", "#984862",
    "#b4525c", "#cc6252", "#df774c", "#ec904e", "#f4aa5c", "#f8c078", "#fad49a",
  ];

  function buildSky(W, H, horizon, sun) {
    const s = new Surface(W, H);
    const n = SKY.length - 1;
    for (let y = 0; y < H; y++) {
      const t = Math.min(1, Math.max(0, y / horizon));
      const pos = Math.pow(t, 1.35) * n;
      const i = Math.min(n - 1, Math.floor(pos));
      const f = pos - i;
      // Solid bands with a short dithered hand-off — the classic SNES gradient.
      const dither = f < 0.55 ? 0 : (f - 0.55) / 0.45;
      for (let x = 0; x < W; x++) {
        let col = bayer(x, y) < dither ? SKY[i + 1] : SKY[i];
        const dx = x - sun.x, dy = (y - sun.y) * 1.4;
        const d = Math.sqrt(dx * dx + dy * dy) / (sun.r * 4.2);
        if (d < 1) {
          const g = Math.pow(1 - d, 2) * 0.75;
          const lvl = Math.floor(g * 4 + bayer(x + 1, y)) / 4;
          if (lvl > 0) col = mix(col, "#ffd9a0", Math.min(0.85, lvl));
        }
        s.px(x, y, col);
      }
    }
    // Sun disc with banded shading and a bright rim.
    const SUN = ["#fffbe0", "#fff0b0", "#ffe08a", "#ffc870"];
    for (let y = -sun.r; y <= sun.r; y++) {
      for (let x = -sun.r; x <= sun.r; x++) {
        const d = Math.sqrt(x * x + y * y);
        if (d > sun.r + 0.3) continue;
        const band = Math.min(3, Math.floor(((y + sun.r) / (2 * sun.r)) * 3.2 + (d > sun.r - 1.2 ? 1 : 0)));
        s.px(sun.x + x, sun.y + y, SUN[band]);
      }
    }
    return s.done();
  }

  function buildStars(W, horizon, r) {
    const stars = [];
    const count = Math.round((W * horizon) / 700);
    for (let k = 0; k < count; k++) {
      const y = Math.floor(Math.pow(r(), 1.6) * horizon * 0.55);
      stars.push({
        x: Math.floor(r() * W), y: y,
        big: r() < 0.08,
        phase: r() * Math.PI * 2,
        speed: 0.6 + r() * 1.8,
        a: 0.35 + 0.65 * (1 - y / (horizon * 0.55)),
        col: r() < 0.3 ? "#d8d0ff" : "#fff4e0",
      });
    }
    return stars;
  }

  function buildCloud(r, w, h, tone) {
    const s = new Surface(w, h);
    const blobs = [];
    const count = 3 + Math.floor(r() * 3);
    for (let k = 0; k < count; k++) {
      const edge = Math.abs(k - (count - 1) / 2) / ((count - 1) / 2 || 1);
      const bx = w * (0.16 + (0.68 * (k + 0.2 + r() * 0.6)) / count);
      const br = h * (0.62 - edge * 0.26 + r() * 0.14);
      blobs.push([bx, h - 2 - br * 0.55, br]);
    }
    const inside = (x, y) => {
      if (y > h - 2 || y < 0) return false;
      if (y >= h - 3 && x > w * 0.1 && x < w * 0.9) return true;
      for (let k = 0; k < blobs.length; k++) {
        const b = blobs[k], dx = x - b[0], dy = (y - b[1]) * 1.25;
        if (dx * dx + dy * dy <= b[2] * b[2]) return true;
      }
      return false;
    };
    // Backlit by the low sun: warm undersides, cool lilac tops, bright rim.
    const top = mix("#6c3f6e", "#9a5078", tone);
    const mid = mix("#8e4c74", "#c0687a", tone);
    const low = mix("#c06a78", "#f0a080", tone);
    const lit = mix("#e89a8c", "#ffd4a4", tone);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!inside(x, y)) continue;
        const fromBottom = h - 2 - y;
        let col = fromBottom === 0 ? lit : fromBottom <= 2 ? low : fromBottom <= h * 0.5 ? mid : top;
        if (fromBottom === 1 && bayer(x, y) < 0.35) col = lit;
        if (fromBottom === 3 && bayer(x, y) < 0.5) col = low;
        if (fromBottom > h * 0.5 && fromBottom <= h * 0.5 + 1 && bayer(x, y) < 0.5) col = mid;
        if (!inside(x, y + 1) && fromBottom > 0) col = low;
        if (!inside(x, y - 1)) col = mix(col, "#ffd0b0", 0.35);
        s.px(x, y, col);
      }
    }
    return s.done();
  }

  // Midpoint-displacement ridge line: heights per column.
  function ridge(r, W, minH, maxH, rough, step) {
    const pts = [];
    for (let x = 0; x <= W + step; x += step) pts.push(minH + r() * (maxH - minH));
    const out = new Float32Array(W + 2);
    for (let x = 0; x < W + 2; x++) {
      const k = Math.floor(x / step), f = (x % step) / step;
      const a = pts[k], b = pts[Math.min(pts.length - 1, k + 1)];
      const sm = f * f * (3 - 2 * f);
      out[x] = a + (b - a) * sm + (r() - 0.5) * rough + Math.sin(x * 0.21 + a) * rough * 0.6;
    }
    return out;
  }

  // Sharp peaks: the highest of several triangles per column, lightly wobbled.
  function peaks(r, W, minH, maxH) {
    const list = [];
    const count = Math.max(3, Math.round(W / 64));
    for (let k = -1; k <= count; k++) {
      list.push({ x: ((k + 0.2 + r() * 0.6) * W) / count, h: minH + r() * (maxH - minH), sl: 0.5 + r() * 0.5, sr: 0.5 + r() * 0.5 });
    }
    const out = new Float32Array(W + 2);
    for (let x = 0; x < W + 2; x++) {
      let h = minH * 0.5;
      for (let k = 0; k < list.length; k++) {
        const p = list[k], d = x - p.x;
        const v = p.h - Math.abs(d) * (d < 0 ? p.sl : p.sr);
        if (v > h) h = v;
      }
      out[x] = h + Math.sin(x * 0.4) * 0.6 + Math.sin(x * 0.11 + 1.3) * 1.1;
    }
    return out;
  }

  function paintRange(s, W, base, heights, pal, snowAt, r, sunX) {
    for (let x = 0; x < W; x++) {
      const top = Math.round(base - heights[x]);
      const prev = Math.round(base - heights[Math.max(0, x - 1)]);
      // Faces turned toward the low sun catch a warmer, lighter tone
      // (slope measured over a few columns so faces don't stripe).
      const slope = heights[Math.min(W + 1, x + 3)] - heights[Math.max(0, x - 3)];
      const facesSun = pal.lit && (x === sunX || (x - sunX) * slope > Math.abs(x - sunX) * 0.5);
      for (let y = top; y <= base; y++) {
        const depth = y - top;
        const hazeT = (y - (base - 18)) / 18;
        let col = facesSun ? pal.lit : pal.body;
        if (hazeT > 0 && bayer(x, y) < hazeT * 0.8) col = pal.haze;
        if (depth === 0 || (depth === 1 && top < prev)) col = pal.rim;
        if (snowAt && heights[x] > snowAt) {
          const cap = (heights[x] - snowAt) * 0.75 + 1;
          if (depth < cap || (depth < cap + 2 && bayer(x, y) < 0.5)) col = facesSun ? pal.snowRim : pal.snow;
        }
        s.px(x, y, col);
      }
    }
    // Pine silhouettes along lower ridges.
    if (pal.trees) {
      for (let x = 2; x < W; x += 3 + Math.floor(r() * 5)) {
        const top = Math.round(base - heights[x]);
        const th = 4 + Math.floor(r() * 5);
        for (let j = 0; j < th; j++) {
          const half = Math.floor((j + 1) / 2);
          for (let i = -half; i <= half; i++) s.px(x + i, top - th + j + 1, j === 0 ? pal.rim : pal.trees);
        }
      }
    }
  }

  function drawCastle(s, cx, by) {
    const D = "#35264a", M = "#47345e", L = "#654a7c", WIN = "#ffd27a", WIN2 = "#f0a850";
    const ROOF = ["#b4527a", "#86385e", "#5e2646"];
    const flags = [];
    const wall = (x0, y0, w, h, crenel) => {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let col = x === 0 ? L : x >= w - 2 ? D : M;
          if (y % 4 === 3 && x % 2 === 0 && x > 0 && x < w - 2) col = D; // courses
          s.px(x0 + x, y0 + y, col);
        }
      }
      if (crenel) for (let x = 0; x < w; x += 3) { s.px(x0 + x, y0 - 1, x === 0 ? L : M); s.px(x0 + x + 1, y0 - 1, M); }
    };
    const cone = (x0, y0, w, h) => {
      for (let y = 0; y < h; y++) {
        const half = Math.round(((y + 1) / h) * (w / 2 + 1));
        for (let x = -half; x <= half; x++) {
          const col = x < -half / 3 ? ROOF[0] : x > half / 3 ? ROOF[2] : ROOF[1];
          s.px(x0 + x, y0 + y, (y % 3 === 2 && x % 2 === 0) ? ROOF[2] : col);
        }
      }
      flags.push({ x: x0, y: y0 - 6 });
      for (let y = 1; y <= 6; y++) s.px(x0, y0 - y, D);
    };
    const win = (x, y) => { s.px(x, y, WIN); s.px(x, y + 1, WIN); s.px(x, y + 2, WIN2); };
    // Curtain wall
    wall(cx - 26, by - 13, 53, 13, true);
    // Keep
    wall(cx - 9, by - 32, 19, 20, true);
    win(cx - 5, by - 27); win(cx + 1, by - 27); win(cx + 5, by - 22); win(cx - 3, by - 20);
    // Towers
    wall(cx - 30, by - 26, 9, 26, false); cone(cx - 26, by - 38, 10, 12);
    wall(cx + 22, by - 22, 9, 22, false); cone(cx + 26, by - 33, 10, 11);
    wall(cx - 3, by - 40, 7, 9, false); cone(cx, by - 49, 8, 9);
    win(cx - 27, by - 20); win(cx + 25, by - 16); win(cx, by - 37);
    // Gate
    for (let y = 0; y < 8; y++) for (let x = -3; x <= 3; x++) {
      if (y === 0 && Math.abs(x) === 3) continue;
      s.px(cx + x, by - 8 + y, (x + 3) % 2 === 0 && y > 1 ? "#6a4a3a" : "#1e1428");
    }
    return flags;
  }

  function drawTower(s, cx, by) {
    const D = "#322648", M = "#44345e", L = "#5e4a7a", h = 58, w = 9;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let col = x <= 1 ? L : x >= w - 2 ? D : M;
        if (y % 5 === 4 && (x + (Math.floor(y / 5) % 2) * 2) % 4 === 0) col = D;
        s.px(cx - 4 + x, by - h + y, col);
      }
    }
    // Balcony ring + windows glowing with arcane light
    for (let x = -6; x <= 6; x++) { s.px(cx + x, by - h + 6, x < -3 ? L : M); s.px(cx + x, by - h + 7, D); }
    [[0, 14], [-1, 28], [1, 42]].forEach((p) => {
      s.px(cx + p[0], by - h + p[1], "#c8f4ff"); s.px(cx + p[0], by - h + p[1] + 1, "#8ad0f0");
    });
    // Tall roof
    const ROOF = ["#6e6ab8", "#48468a", "#2e2c60"];
    for (let y = 0; y < 16; y++) {
      const half = Math.round(((y + 1) / 16) * 6);
      for (let x = -half; x <= half; x++) {
        const col = x < -half / 3 ? ROOF[0] : x > half / 3 ? ROOF[2] : ROOF[1];
        s.px(cx + x, by - h - 16 + y + 5, col);
      }
    }
    return { x: cx, y: by - h - 13 };
  }

  /* ---------- Town buildings ---------- */
  const WALLS = {
    plaster: { lit: "#f0d2b4", base: "#d8b196", shade: "#b08a82", beam: "#5a3a46", beamDk: "#40283a" },
    rose: { lit: "#f0bcb8", base: "#d8989a", shade: "#aa7280", beam: "#5a3a46", beamDk: "#40283a" },
    teal: { lit: "#a8d0c8", base: "#80aaa6", shade: "#5c8088", beam: "#3e3a52", beamDk: "#2a283e" },
    stone: { lit: "#c4aebc", base: "#a08c9e", shade: "#766478", beam: "#5e4c64", beamDk: "#443650" },
  };
  const ROOFS = [
    ["#d8788a", "#b0566a", "#86405a", "#5e2c46"],
    ["#78a8a8", "#557f86", "#3c5c68", "#28404e"],
    ["#8a84a8", "#666088", "#4a4468", "#322e4a"],
    ["#d89a6a", "#b0744c", "#86543a", "#5e3a2c"],
  ];

  function drawWindow(s, x, y, w, h, lit, box, r) {
    const F = "#3a2432";
    for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) {
      if (j === -1 || i === -1 || j === h || i === w) { s.px(x + i, y + j, F); continue; }
      let col;
      if (lit) {
        col = j === 0 && i < w - 1 ? "#fff4c0" : j >= h - 2 ? "#f0a858" : "#ffd27a";
        if (i === Math.floor(w / 2) || j === Math.floor(h / 2)) col = "#a8683c";
      } else {
        col = (i + j) === 1 ? "#7a6c96" : "#3e3456";
        if (i === Math.floor(w / 2) || j === Math.floor(h / 2)) col = "#2a2032";
      }
      s.px(x + i, y + j, col);
    }
    s.rect(x - 1, y + h + 1, w + 2, 1, "#6a4a3e");
    if (box) {
      s.rect(x - 1, y + h + 1, w + 2, 2, "#6a4030");
      for (let i = -1; i <= w; i++) {
        s.px(x + i, y + h, r() < 0.6 ? "#5a8c4c" : "#385e36");
        if (r() < 0.4) s.px(x + i, y + h, pick(["#f4a8b8", "#ffe08a", "#fff6e4"], r));
      }
    }
  }

  function drawDoor(s, x, by, w, h) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const arch = j === 0 && (i === 0 || i === w - 1);
      if (arch) continue;
      let col = i === 0 || i === w - 1 || j === 0 ? "#3a2432" : i % 2 === 0 ? "#6e4432" : "#8a5a40";
      if (j === 1 && i > 0 && i < w - 1) col = "#9c6a4a";
      s.px(x + i, by - h + j, col);
    }
    s.px(x + w - 3, by - Math.floor(h / 2), "#ffe08a");
  }

  function drawRoof(s, x, y, w, h, pal, gable) {
    // Tile rows with scalloped seams; left side catches the sunset.
    for (let j = 0; j < h; j++) {
      let x0 = x, x1 = x + w - 1;
      if (gable) {
        const half = Math.round(((j + 1) / h) * (w / 2));
        const mid = x + Math.floor(w / 2);
        x0 = mid - half; x1 = mid + half - (w % 2 === 0 ? 1 : 0);
      } else {
        const inset = Math.round((1 - (j + 1) / h) * 3);
        x0 = x + inset; x1 = x + w - 1 - inset;
      }
      for (let i = x0; i <= x1; i++) {
        let col = pal[1];
        const row = Math.floor(j / 3);
        if (j % 3 === 2) col = pal[2];
        else if ((i + row * 2) % 4 === 0 && j % 3 === 1) col = pal[2];
        if (j % 3 === 0 && (i + row * 2) % 4 === 1) col = pal[0];
        if (i === x0) col = pal[0];
        if (i === x1) col = pal[3];
        if (j === h - 1) col = pal[3];
        s.px(i, y + j, col);
      }
    }
  }

  function drawChimney(s, x, y, h) {
    for (let j = 0; j < h; j++) for (let i = 0; i < 4; i++) {
      s.px(x + i, y + j, i === 0 ? "#b07068" : (j + (i > 1 ? 1 : 0)) % 3 === 0 ? "#6a4048" : "#8a5a5a");
    }
    s.rect(x - 1, y - 1, 6, 1, "#4a3040");
    return { x: x + 2, y: y - 2 };
  }

  function drawSign(s, x, y, icon) {
    s.rect(x, y - 1, 6, 1, "#2a2032");
    s.px(x + 1, y, "#2a2032"); s.px(x + 4, y, "#2a2032");
    for (let j = 0; j < 6; j++) for (let i = 0; i < 7; i++) {
      const edge = i === 0 || j === 0 || i === 6 || j === 5;
      s.px(x - 1 + i, y + 1 + j, edge ? "#4a2c24" : "#b67c52");
    }
    const I = {
      mug: ["....", "WWW.", "wwwx", "wwwx", "www."],
      potion: [".x..", ".x..", "rrr.", "rRr.", "rrr."],
      anvil: ["....", "MMMM", ".mm.", ".mm.", "nnnn"],
      bread: ["....", ".GG.", "GggG", "gggf", "...."],
    }[icon];
    const COL = { W: "#ffffff", w: "#fff0c8", x: "#c8b0a0", r: "#b43c42", R: "#e8645c", M: "#e8eef8", m: "#a8b4ca", n: "#65708e", G: "#fff09c", g: "#e2b242", f: "#a06e28" };
    I.forEach((row, j) => row.split("").forEach((ch, i) => { if (COL[ch]) s.px(x + 1 + i, y + 1 + j, COL[ch]); }));
  }

  function drawAwning(s, x, y, w) {
    for (let j = 0; j < 4; j++) for (let i = 0; i < w; i++) {
      const stripe = Math.floor(i / 2) % 2 === 0;
      let col = stripe ? (j === 0 ? "#f08a80" : "#d0505a") : (j === 0 ? "#ffffff" : "#f0e0d0");
      if (j === 3 && i % 2 === 1) continue;
      if (j === 3) col = stripe ? "#a03848" : "#c8b8b0";
      s.px(x + i, y + j, col);
    }
  }

  function buildTown(W, base, r) {
    const s = new Surface(W, base + 1);
    const fx = { smoke: [], lamps: [], forge: [], bells: [] };
    const used = {};
    let x = -Math.floor(r() * 16);
    let gapCount = 0;
    while (x < W + 8) {
      let type = pick(["house", "house", "house", "stone", "shop"], r);
      if (!used.chapel && x > W * 0.3 && r() < 0.35) type = "chapel";
      else if (!used.smithy && x > W * 0.15 && r() < 0.25) type = "smithy";
      else if (!used.inn && r() < 0.25) type = "inn";
      used[type] = true;

      const wallKey = type === "stone" || type === "chapel" || type === "smithy" ? "stone"
        : pick(["plaster", "plaster", "rose", "teal"], r);
      const wall = WALLS[wallKey];
      const roofPal = type === "chapel" ? ROOFS[2] : pick(ROOFS, r);
      let w = type === "chapel" ? 30 : type === "inn" ? 34 + Math.floor(r() * 8) : 22 + Math.floor(r() * 14);
      let h = type === "chapel" ? 34 : type === "inn" ? 38 + Math.floor(r() * 6) : 20 + Math.floor(r() * 16);
      const top = base - h;
      const gable = type !== "inn" && r() < 0.55;

      // Walls
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        let col = i < 2 ? wall.lit : i >= w - 2 ? wall.shade : wall.base;
        if (j >= h - 3 && bayer(x + i, j) < (j - (h - 4)) / 4) col = wall.shade;
        if (wallKey === "stone") {
          const course = Math.floor(j / 3);
          if (j % 3 === 2 || (i + course * 3) % 6 === 0) col = wall.shade;
          if (j % 3 === 0 && (i + course * 3) % 6 === 1) col = wall.lit;
        }
        s.px(x + i, top + j, col);
      }
      // Timber framing on plaster houses
      if (wallKey !== "stone") {
        for (let i = 0; i < w; i += Math.max(6, Math.floor(w / 4))) s.rect(x + i, top, 1, h, wall.beam);
        s.rect(x, top, w, 1, wall.beam);
        const floor2 = h > 26 ? top + Math.floor(h / 2) : -1;
        if (floor2 > 0) s.rect(x, floor2, w, 1, wall.beam);
        s.rect(x + w - 1, top, 1, h, wall.beamDk);
      }
      // Eave shadow under the roof
      for (let i = 0; i < w; i++) { s.px(x + i, top, wall.beamDk); s.px(x + i, top + 1, wall.shade, 0.6); }

      // Roof
      const rh = gable ? Math.round(w * 0.55) : 10 + Math.floor(r() * 4);
      drawRoof(s, x - 2, top - rh, w + 4, rh, roofPal, gable);

      // Openings
      const doorW = type === "chapel" ? 8 : 6;
      const doorX = x + Math.floor(w * (type === "chapel" ? 0.5 : 0.25 + r() * 0.4)) - Math.floor(doorW / 2);
      if (type === "smithy") {
        // Open workshop with a glowing forge
        const ox = x + 4, ow = w - 8, oh = 12;
        for (let j = 0; j < oh; j++) for (let i = 0; i < ow; i++) s.px(ox + i, base - oh + j, j === 0 ? "#2a1a26" : "#3a2230");
        s.rect(ox + 2, base - 5, 6, 5, "#6a4048");
        s.rect(ox + 3, base - 6, 4, 1, "#ff9a40");
        s.rect(ox + ow - 8, base - 5, 5, 1, "#8a94ac");
        s.rect(ox + ow - 7, base - 4, 3, 4, "#5a6280");
        fx.forge.push({ x: ox + 5, y: base - 7, w: ow });
        drawSign(s, x + w - 3, base - 22, "anvil");
      } else {
        drawDoor(s, doorX, base, doorW, type === "chapel" ? 14 : 11);
      }
      const floors = h > 26 ? 2 : 1;
      for (let f = 0; f < floors; f++) {
        const wy = floors === 2 ? top + 5 + f * Math.floor(h / 2) : top + 6;
        for (let wx = x + 3; wx + 5 < x + w - 2; wx += 9) {
          if (type === "smithy" && f === floors - 1) continue;
          if (wx + 5 > doorX - 1 && wx < doorX + doorW + 1 && f === floors - 1) continue;
          if (type === "chapel") continue;
          drawWindow(s, wx, wy, 5, 6, r() < 0.75, r() < 0.35, r);
        }
      }
      if (type === "shop") {
        drawAwning(s, x + 1, base - 16, w - 2);
        drawSign(s, x + w - 2, base - 24, pick(["potion", "bread"], r));
      }
      if (type === "inn") drawSign(s, x - 3, base - 20, "mug");

      // Chapel: bell tower, spire and a rose window of coloured glass
      if (type === "chapel") {
        const tx = x + Math.floor(w / 2) - 5;
        for (let j = 0; j < 24; j++) for (let i = 0; i < 11; i++) {
          let col = i < 2 ? wall.lit : i >= 9 ? wall.shade : wall.base;
          if (j % 3 === 2 || (i + Math.floor(j / 3) * 3) % 6 === 0) col = wall.shade;
          s.px(tx + i, top - rh - 24 + j + 4, col);
        }
        drawRoof(s, tx - 1, top - rh - 38, 13, 18, ROOFS[2], true);
        // Belfry opening with bell
        s.rect(tx + 3, top - rh - 15, 5, 6, "#2a1a30");
        s.rect(tx + 4, top - rh - 13, 3, 3, "#e2b242"); s.px(tx + 4, top - rh - 13, "#fff09c");
        fx.bells.push({ x: tx + 5, y: top - rh - 13 });
        // Rose window
        const cx = x + Math.floor(w / 2), cy = top + 9;
        const GLASS = ["#e8645c", "#7caad8", "#f4cc64", "#8cb874", "#c6b6ec"];
        for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) {
          const d = Math.sqrt(i * i + j * j);
          if (d > 4.4) continue;
          let col = d > 3.5 ? "#3a2432" : GLASS[(Math.floor(Math.atan2(j, i) * 2.5) + 10) % GLASS.length];
          if (d < 1.2) col = "#fff4c0";
          s.px(cx + i, cy + j, col);
        }
        drawWindow(s, x + 3, top + 18, 4, 8, true, false, r);
        drawWindow(s, x + w - 7, top + 18, 4, 8, true, false, r);
      }

      // Chimney with smoke
      if (type !== "chapel" && r() < 0.8) {
        const cx = x + Math.floor(w * (0.2 + r() * 0.55));
        const roofTopAt = gable ? top - rh + Math.round(Math.abs(cx + 2 - (x + w / 2)) / (w / 2 + 2) * rh) : top - rh + 3;
        const ch = drawChimney(s, cx, roofTopAt - 6, 8 + (type === "smithy" ? 4 : 0));
        fx.smoke.push({ x: ch.x, y: ch.y, heavy: type === "smithy", t: r() * 3 });
      }

      x += w;
      // Gap between buildings — alleys get a lamp post every other gap.
      const gap = 3 + Math.floor(r() * 8);
      if (gapCount++ % 2 === 0) fx.lamps.push({ x: x + Math.floor(gap / 2) + 1, y: base });
      x += gap;
    }
    return { canvas: s.done(), fx: fx };
  }

  function drawLampPosts(s, lamps, base) {
    lamps.forEach((l) => {
      for (let y = base - 21; y <= base + 2; y++) { s.px(l.x, y, "#2a2036"); s.px(l.x + 1, y, "#4a3a58"); }
      s.rect(l.x - 1, base + 2, 4, 1, "#2a2036");
      // Lantern
      s.rect(l.x - 2, base - 27, 6, 1, "#2a2036");
      s.rect(l.x - 1, base - 28, 4, 1, "#2a2036");
      for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) {
        s.px(l.x - 1 + i, base - 26 + j, i === 0 || i === 3 ? "#2a2036" : j === 0 ? "#fff8d0" : "#ffd27a");
      }
      s.rect(l.x - 1, base - 21, 4, 1, "#2a2036");
      l.gx = l.x + 0.5; l.gy = base - 24;
    });
  }

  function buildRoad(W, top, bottom, lamps, r) {
    const s = new Surface(W, bottom);
    // Sidewalk + curb
    for (let x = 0; x < W; x++) {
      s.px(x, top - 3, "#c8a498");
      s.px(x, top - 2, x % 7 === 0 ? "#8e6c7a" : "#a8848a");
      s.px(x, top - 1, "#6e5266");
      s.px(x, top, "#4a3650");
    }
    // Rounded cobbles that grow toward the viewer for a hint of perspective.
    const TONES = [["#a8889a", "#8e7084", "#76596e"], ["#9e8096", "#86687e", "#6e5268"], ["#b0909c", "#967886", "#7a5e70"]];
    const MORTAR = "#5e4862";
    let y = top + 1, row = 0;
    while (y < bottom) {
      const depth = (y - top) / Math.max(1, bottom - top);
      const rh = Math.min(bottom - y, 3 + Math.round(depth * 2.4) + (r() < 0.25 ? 1 : 0));
      let x = -Math.floor(r() * 8);
      while (x < W) {
        const sw = 5 + Math.round(depth * 5) + Math.floor(r() * 4);
        const tone = pick(TONES, r);
        for (let j = 0; j < rh; j++) for (let i = 0; i < sw; i++) {
          let col = tone[1];
          const corner = (i === 0 || i === sw - 2) && (j === 0 || j === rh - 2);
          if (j === rh - 1 || i === sw - 1 || corner) col = MORTAR;
          else if (j === 0 || (i === 1 && j < rh - 2)) col = tone[0];
          else if (j === rh - 2) col = tone[2];
          // Warm pools of lamplight on the cobbles
          let warm = 0;
          for (let k = 0; k < lamps.length; k++) {
            const dx = (x + i - lamps[k].x) / 24, dy = (y + j - top) / 22;
            warm = Math.max(warm, 1 - Math.sqrt(dx * dx + dy * dy));
          }
          if (warm > 0 && bayer(x + i, y + j) < warm * 0.9) col = mix(col, "#ffc890", 0.35);
          s.px(x + i, y + j, col);
        }
        x += sw;
      }
      y += rh;
      row++;
    }
    return s.done();
  }

  function buildGrass(W, H, r) {
    const gh = 6;
    const s = new Surface(W, H);
    for (let x = 0; x < W; x++) {
      for (let y = H - gh; y < H; y++) {
        const d = y - (H - gh);
        let col = d === 0 ? "#5c7c5a" : bayer(x, y) < d / gh ? "#2c4438" : "#3c5a4c";
        s.px(x, y, col);
      }
      // Blades poking up over the road edge
      if (r() < 0.55) {
        const bh = 1 + Math.floor(r() * 4);
        for (let j = 1; j <= bh; j++) s.px(x, H - gh - j + 1, j === bh ? "#8cac6c" : "#5c7c5a");
      }
      if (r() < 0.06) {
        const fy = H - gh - 2 - Math.floor(r() * 3);
        s.px(x, fy + 1, "#5c7c5a");
        s.px(x, fy, pick(["#f4a8b8", "#ffe08a", "#fff6e4", "#c6b6ec"], r));
      }
    }
    return s.done();
  }

  function buildAirship() {
    const frames = [];
    for (let f = 0; f < 2; f++) {
      const s = new Surface(40, 26);
      // Envelope with vertical stripes
      for (let y = 0; y < 13; y++) for (let x = 0; x < 34; x++) {
        const dx = (x - 16.5) / 16.5, dy = (y - 6) / 6.3;
        const d = dx * dx + dy * dy;
        if (d > 1) continue;
        const stripe = Math.floor((x + 2) / 4) % 2 === 0;
        let col = stripe ? "#c97b84" : "#e6d6bc";
        if (dy < -0.45) col = stripe ? "#eca6ae" : "#fff6e4";
        if (dy > 0.45) col = stripe ? "#8e4e5c" : "#b4a088";
        if (d > 0.82) col = "#1c1428";
        s.px(x + 4, y, col);
      }
      // Tail fin
      [[0, 3], [1, 3], [1, 4], [2, 4], [2, 5], [3, 5], [0, 9], [1, 8], [2, 8], [3, 7]].forEach((p) => s.px(p[0] + 1, p[1], "#8e4e5c"));
      // Ropes + gondola
      [[12, 13], [12, 14], [26, 13], [26, 14]].forEach((p) => s.px(p[0], p[1], "#3a2432"));
      for (let y = 0; y < 5; y++) for (let x = 0; x < 20; x++) {
        if (y === 4 && (x < 2 || x > 17)) continue;
        let col = y === 0 ? "#b67c52" : y === 4 ? "#5a3626" : "#865638";
        if (x === 0 || x === 19) col = "#3a2432";
        if (y === 2 && x % 4 === 2) col = "#ffd27a";
        s.px(x + 9, y + 15, col);
      }
      // Propeller
      if (f === 0) { s.px(4, 16, "#e8eef8"); s.px(4, 17, "#a8b4ca"); s.px(4, 18, "#e8eef8"); }
      else { s.px(3, 17, "#e8eef8"); s.px(4, 17, "#a8b4ca"); s.px(5, 17, "#e8eef8"); }
      s.px(6, 17, "#3a2432"); s.px(7, 17, "#3a2432"); s.px(8, 17, "#3a2432");
      frames.push(s.done());
    }
    return frames;
  }

  // Pre-rendered dithered glow (lamps, forge). Drawn with alpha per frame.
  function buildGlow(radius, hex) {
    const d = radius * 2 + 1;
    const s = new Surface(d, d);
    for (let y = 0; y < d; y++) for (let x = 0; x < d; x++) {
      const dist = Math.sqrt((x - radius) * (x - radius) + (y - radius) * (y - radius)) / radius;
      if (dist > 1) continue;
      const g = (1 - dist) * (1 - dist);
      if (bayer(x, y) < g * 1.4) s.px(x, y, hex, Math.min(0.55, 0.12 + g * 0.6));
    }
    return s.done();
  }

  /* ---------- Particles ---------- */
  const NOTE = ["..xx", "..x.", "..x.", "xxx.", "xx.."];
  const HEART = [".x.x.", "xxxxx", "xxxxx", ".xxx.", "..x.."];

  function World(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.opts = opts;
    this.people = [];
    this.particles = [];
    this.birds = [];
    this.pool = {};
    this.time = 0;
    this.last = 0;
    this.acc = 0;
    this.raf = null;
    this.airship = null;
    this.airshipFrames = buildAirship();
    this.nextAirship = 12 + rand() * 20;
    this.nextBirds = 4 + rand() * 8;
    this.lampGlow = buildGlow(13, "#ffd27a");
    this.forgeGlow = buildGlow(10, "#ff9a50");
    this.crystalGlow = buildGlow(9, "#a8f0ff");
    this.resize();
  }

  World.prototype.resize = function () {
    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth, vh = window.innerHeight;
    // Art pixels are 2 CSS px (3 on very tall screens), rounded to a whole
    // number of device pixels so every art pixel is a crisp square. At this
    // size the street and its townsfolk fit in the bottom ~13% of the screen.
    const cssScale = Math.max(2, Math.floor(vh / 440));
    const scale = Math.max(2, Math.round(cssScale * dpr));
    const W = Math.ceil((vw * dpr) / scale);
    const H = Math.ceil((vh * dpr) / scale);
    if (W === this.W && H === this.H && scale === this.scale) return;
    this.W = W;
    this.H = H;
    this.scale = scale;
    this.canvas.width = W;
    this.canvas.height = H;
    this.canvas.style.width = (W * scale) / dpr + "px";
    this.canvas.style.height = (H * scale) / dpr + "px";
    this.ctx.imageSmoothingEnabled = false;
    this.build();
  };

  World.prototype.build = function () {
    const W = this.W, H = this.H;
    const r = rng(20240917);
    const g = this.g = {};
    g.grassTop = H - 6;
    g.roadTop = H - 34;
    g.base = g.roadTop - 3;
    g.lanes = [g.roadTop + 11, H - 9];
    g.horizon = g.base - 26;
    const peakMax = Math.min(92, g.horizon * 0.55);
    const range = peaks(r, W, peakMax * 0.35, peakMax);
    let sunX = Math.round(W * 0.36);
    for (let x = Math.round(W * 0.26); x < Math.round(W * 0.48); x++) if (range[x] < range[sunX]) sunX = x;
    const sunR = Math.max(9, Math.min(16, Math.round(H * 0.045)));
    g.sun = { x: sunX, y: Math.round(g.horizon + 6 - range[sunX] - sunR * 0.45), r: sunR };

    this.sky = buildSky(W, H, g.horizon + 20, g.sun);
    this.stars = buildStars(W, g.horizon, r);

    this.clouds = [];
    const cloudCount = Math.max(3, Math.round(W / 70));
    for (let k = 0; k < cloudCount; k++) {
      const cy = Math.round(g.horizon * (0.12 + r() * 0.62));
      const tone = Math.min(1, cy / g.horizon + 0.15);
      const w = 34 + Math.floor(r() * 46), h = 12 + Math.floor(r() * 8);
      this.clouds.push({ img: buildCloud(r, w, h, tone), x: r() * (W + 80) - 40, y: cy, speed: 0.8 + tone * 2.4 });
    }

    // Distant land: far peaks, hills with the castle and the mage tower.
    const far = new Surface(W, H);
    paintRange(far, W, g.horizon + 6, range, {
      body: "#553768", lit: "#6c4478", haze: "#7a466c", rim: "#9a6088", snow: "#b48cb0", snowRim: "#f2c4ca",
    }, peakMax * 0.72, r, g.sun.x);
    this.flags = [];
    this.crystal = null;
    const hills = ridge(r, W, 10, 26, 2, 36);
    const castleX = Math.round(W * (W < 260 ? 0.72 : 0.8));
    const towerX = Math.round(W * 0.1);
    for (let x = castleX - 34; x <= castleX + 34; x++) if (x >= 0 && x < W) hills[x] = Math.max(hills[x], 26 - Math.abs(x - castleX) * 0.12);
    if (W >= 240) for (let x = towerX - 12; x <= towerX + 12; x++) if (x >= 0 && x < W) hills[x] = Math.max(hills[x], 22 - Math.abs(x - towerX) * 0.3);
    this.flags = drawCastle(far, castleX, Math.round(g.horizon + 6 - 24));
    if (W >= 240) this.crystal = drawTower(far, towerX, Math.round(g.horizon + 6 - 20));
    paintRange(far, W, g.horizon + 8, hills, {
      body: "#3e2a56", haze: "#553468", rim: "#5e3c6e", trees: "#32234a",
    }, 0, r, g.sun.x);
    for (let y = g.horizon + 8; y <= g.base; y++) {
      for (let x = 0; x < W; x++) far.px(x, y, bayer(x, y) < (y - g.horizon - 8) / 20 ? "#2c2040" : "#35264c");
    }
    // Tree line where the hills meet the town
    for (let x = -4; x < W + 4; x += 4 + Math.floor(r() * 5)) {
      const tr = 3 + Math.floor(r() * 4), ty = g.base - 8 - Math.floor(r() * 5);
      for (let j = -tr; j <= tr + 8; j++) for (let i = -tr; i <= tr; i++) {
        if (i * i + j * j * 0.8 > tr * tr && j < tr) continue;
        const col = j < -tr + 2 && i < 1 ? "#5a3c66" : i > tr / 2 ? "#261c3a" : "#30234a";
        far.px(x + i, ty + j, col);
      }
    }
    this.far = far.done();

    const town = buildTown(W, g.base, r);
    this.townFx = town.fx;
    const townSurf = new Surface(W, H);
    townSurf.ctx.drawImage(town.canvas, 0, 0);
    townSurf.img = townSurf.ctx.getImageData(0, 0, W, H);
    townSurf.d = townSurf.img.data;
    drawLampPosts(townSurf, town.fx.lamps, g.base);
    this.town = townSurf.done();
    this.road = buildRoad(W, g.roadTop, H, town.fx.lamps, r);
    this.grass = buildGrass(W, H, r);

    this.fireflies = [];
    const ffCount = Math.round(W / 40);
    for (let k = 0; k < ffCount; k++) {
      this.fireflies.push({ x: r() * W, y: g.base - 4 - r() * 30, phase: r() * 6.28, speed: 0.5 + r() });
    }

    // Townsfolk
    const want = Math.max(4, Math.min(14, Math.round(W / 48)));
    if (!this.people.length) {
      for (let k = 0; k < want; k++) this.people.push(this.spawn(true));
    } else {
      while (this.people.length > want) this.people.pop();
      while (this.people.length < want) this.people.push(this.spawn(true));
      this.people.forEach((p) => { if (p.x > W + 40) p.x = rand() * W; });
    }
  };

  const WEIGHTS = (function () {
    const list = [];
    Object.keys(CLASSES).forEach((k) => { for (let n = 0; n < CLASSES[k].weight; n++) list.push(k); });
    return list;
  })();

  World.prototype.variant = function (key) {
    const list = this.pool[key] || (this.pool[key] = []);
    if (list.length < 3 && (list.length === 0 || rand() < 0.6)) list.push(buildCharacter(key));
    return pick(list);
  };

  World.prototype.spawn = function (initial) {
    // Avoid a crowd of one class: re-roll once if it's already common.
    let key = pick(WEIGHTS);
    const same = this.people.filter((p) => p.ch.cls === key).length;
    if (same >= 2) key = pick(WEIGHTS);
    const ch = this.variant(key);
    const dir = rand() < 0.5 ? 1 : -1;
    const speed = ch.def.speed * (0.85 + rand() * 0.3);
    const W = this.W || 400;
    return {
      ch: ch, dir: dir, speed: speed,
      lane: rand() < 0.5 ? 0 : 1,
      x: initial ? 12 + rand() * (W - 24) : dir > 0 ? -18 - rand() * 50 : W + 18 + rand() * 50,
      dist: rand() * 10,
      state: "walk", t: 0, fxT: 0,
      idleIn: initial ? 2 + rand() * 14 : 6 + rand() * 14,
      idleFor: 0,
    };
  };

  World.prototype.emit = function (p, type, sx, sy, extra) {
    if (this.particles.length > 160) return;
    const x = Math.round(p.x) - 16 + (p.dir > 0 ? sx : 31 - sx);
    const y = this.g.lanes[p.lane] - 30 + sy;
    const q = { type: type, x: x, y: y, vx: 0, vy: 0, life: 0, max: 1, dir: p.dir };
    for (const k in extra) q[k] = extra[k];
    this.particles.push(q);
  };

  World.prototype.idleFx = function (p, dt) {
    const fx = p.ch.def.fx;
    p.fxT -= dt;
    if (p.fxT > 0) return;
    switch (fx) {
      case "sparkle":
        p.fxT = 0.09;
        this.emit(p, "spark", 22, 2, { vx: (rand() - 0.5) * 22, vy: -6 - rand() * 14, max: 0.6 + rand() * 0.5, col: pick(["#ffffff", "#a8f0ff", "#c6b6ec", "#ffe08a"]) });
        break;
      case "holy":
        p.fxT = 0.14;
        this.emit(p, "mote", rand() < 0.5 ? 9 : 23, 7 + rand() * 4, { vx: (rand() - 0.5) * 4, vy: -8 - rand() * 8, max: 1.1, col: pick(["#fff09c", "#ffffff", "#ffe08a"]) });
        break;
      case "glint":
        p.fxT = 0.7;
        this.emit(p, "glint", 22, 0, { max: 0.45 });
        break;
      case "notes":
        p.fxT = 0.5;
        this.emit(p, "note", 12, 14, { vx: -p.dir * (3 + rand() * 4), vy: -9, max: 1.6, col: pick(["#fff6e4", "#ffe08a", "#eca6ae", "#acd4f4"]) });
        break;
      case "coin":
        p.fxT = 1.1;
        this.emit(p, "coin", 17, 11, { vy: -34, max: 0.95 });
        break;
      case "heart":
        p.fxT = 1.4;
        this.emit(p, "heart", 23, 4, { vy: -7, max: 1.4 });
        break;
      default:
        p.fxT = 99;
    }
  };

  World.prototype.update = function (dt) {
    const W = this.W, g = this.g;
    this.time += dt;

    this.clouds.forEach((c) => {
      c.x += c.speed * dt;
      if (c.x > W + 10) c.x = -c.img.width - 10;
    });

    this.people.forEach((p, idx) => {
      if (p.state === "walk") {
        p.x += p.dir * p.speed * dt;
        p.dist += p.speed * dt;
        p.idleIn -= dt;
        if (p.idleIn <= 0 && p.x > 24 && p.x < W - 24) {
          p.state = "idle";
          p.t = 0;
          p.fxT = 0.25;
          p.idleFor = 2.2 + rand() * 1.6;
        }
        if ((p.dir > 0 && p.x > W + 24) || (p.dir < 0 && p.x < -24)) this.people[idx] = this.spawn(false);
      } else {
        p.t += dt;
        p.idleFor -= dt;
        this.idleFx(p, dt);
        if (p.idleFor <= 0) {
          p.state = "walk";
          p.idleIn = 8 + rand() * 18;
          if (rand() < 0.2) p.dir = -p.dir;
        }
      }
    });

    // Chimney smoke
    this.townFx.smoke.forEach((c) => {
      c.t -= dt;
      if (c.t <= 0 && this.particles.length < 160) {
        c.t = c.heavy ? 0.35 : 0.7 + rand() * 0.5;
        this.particles.push({ type: "smoke", x: c.x + (rand() - 0.5) * 2, y: c.y, vx: 1.5 + rand() * 2, vy: -5 - rand() * 3, life: 0, max: 3.5 + rand() * 2, heavy: c.heavy });
      }
    });
    // Forge embers
    this.townFx.forge.forEach((f) => {
      if (rand() < dt * 3 && this.particles.length < 160) {
        this.particles.push({ type: "ember", x: f.x + rand() * 4, y: f.y, vx: (rand() - 0.5) * 8, vy: -10 - rand() * 10, life: 0, max: 0.6 + rand() * 0.4 });
      }
    });
    // Arcane crystal sparkles
    if (this.crystal && rand() < dt * 2.2 && this.particles.length < 160) {
      this.particles.push({ type: "spark", x: this.crystal.x + (rand() - 0.5) * 6, y: this.crystal.y + (rand() - 0.5) * 6, vx: 0, vy: -4, life: 0, max: 0.7, col: pick(["#ffffff", "#a8f0ff", "#c6b6ec"]) });
    }

    for (let k = this.particles.length - 1; k >= 0; k--) {
      const q = this.particles[k];
      q.life += dt;
      if (q.life >= q.max) { this.particles.splice(k, 1); continue; }
      if (q.type === "coin") q.vy += 72 * dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
    }

    // Birds and the occasional airship
    this.nextBirds -= dt;
    if (this.nextBirds <= 0) {
      this.nextBirds = 14 + rand() * 20;
      const dir = rand() < 0.5 ? 1 : -1, y = g.horizon * (0.2 + rand() * 0.4), n = 2 + Math.floor(rand() * 4);
      for (let k = 0; k < n; k++) {
        this.birds.push({ x: dir > 0 ? -8 - k * 7 : W + 8 + k * 7, y: y + (k % 2) * 4 + k, dir: dir, speed: 16 + rand() * 4, phase: rand() * 6 });
      }
    }
    for (let k = this.birds.length - 1; k >= 0; k--) {
      const b = this.birds[k];
      b.x += b.dir * b.speed * dt;
      b.y += Math.sin(this.time * 2 + b.phase) * 0.08;
      if (b.x < -30 || b.x > W + 30) this.birds.splice(k, 1);
    }
    this.nextAirship -= dt;
    if (!this.airship && this.nextAirship <= 0) {
      const dir = rand() < 0.5 ? 1 : -1;
      this.airship = { x: dir > 0 ? -44 : W + 4, y: Math.round(g.horizon * (0.15 + rand() * 0.25)), dir: dir, speed: 5 + rand() * 3 };
    }
    if (this.airship) {
      const a = this.airship;
      a.x += a.dir * a.speed * dt;
      if (a.x < -50 || a.x > W + 10) { this.airship = null; this.nextAirship = 40 + rand() * 40; }
    }
  };

  World.prototype.draw = function () {
    const ctx = this.ctx, g = this.g, t = this.time, W = this.W;
    ctx.drawImage(this.sky, 0, 0);

    // Twinkling stars
    this.stars.forEach((s) => {
      const tw = 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
      ctx.globalAlpha = s.a * tw;
      ctx.fillStyle = s.col;
      ctx.fillRect(s.x, s.y, 1, 1);
      if (s.big && tw > 0.8) {
        ctx.globalAlpha = s.a * (tw - 0.6);
        ctx.fillRect(s.x - 1, s.y, 1, 1); ctx.fillRect(s.x + 1, s.y, 1, 1);
        ctx.fillRect(s.x, s.y - 1, 1, 1); ctx.fillRect(s.x, s.y + 1, 1, 1);
      }
    });
    ctx.globalAlpha = 1;

    this.clouds.forEach((c) => ctx.drawImage(c.img, Math.round(c.x), c.y));

    if (this.airship) {
      const a = this.airship, img = this.airshipFrames[Math.floor(t * 8) % 2];
      const bob = Math.round(Math.sin(t * 1.3) * 1);
      if (a.dir < 0) {
        ctx.save(); ctx.scale(-1, 1);
        ctx.drawImage(img, -Math.round(a.x) - img.width, a.y + bob);
        ctx.restore();
      } else ctx.drawImage(img, Math.round(a.x), a.y + bob);
    }

    ctx.fillStyle = "#2a1f3a";
    this.birds.forEach((b) => {
      const x = Math.round(b.x), y = Math.round(b.y), up = Math.floor(t * 6 + b.phase) % 2 === 0;
      ctx.fillRect(x, y, 1, 1);
      if (up) { ctx.fillRect(x - 1, y - 1, 1, 1); ctx.fillRect(x + 1, y - 1, 1, 1); ctx.fillRect(x - 2, y - 2, 1, 1); ctx.fillRect(x + 2, y - 2, 1, 1); }
      else { ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x - 2, y + 1, 1, 1); ctx.fillRect(x + 2, y + 1, 1, 1); }
    });

    ctx.drawImage(this.far, 0, 0);

    // Castle pennants
    this.flags.forEach((f, k) => {
      const ph = Math.floor(t * 4 + k) % 3;
      ctx.fillStyle = "#e8645c";
      ctx.fillRect(f.x + 1, f.y, 3, 1);
      ctx.fillRect(f.x + 1, f.y + 1, ph === 0 ? 4 : 3, 1);
      ctx.fillStyle = "#b43c42";
      ctx.fillRect(f.x + (ph === 1 ? 4 : 3), f.y + (ph === 2 ? 0 : 1), 2, 1);
    });
    if (this.crystal) {
      const c = this.crystal, pulse = 0.55 + 0.45 * Math.sin(t * 2.4);
      ctx.globalAlpha = pulse * 0.8;
      ctx.drawImage(this.crystalGlow, c.x - 9, c.y - 9);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#a8f0ff"; ctx.fillRect(c.x - 1, c.y - 1, 3, 3);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(c.x, c.y - 2, 1, 4);
    }

    ctx.drawImage(this.town, 0, 0);

    // Lamps and forge glow (gentle flicker)
    this.townFx.lamps.forEach((l, k) => {
      ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t * 3.1 + k * 1.7) * Math.sin(t * 1.3 + k);
      ctx.drawImage(this.lampGlow, Math.round(l.gx) - 13, l.gy - 13);
    });
    this.townFx.forge.forEach((f) => {
      ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(t * 5.3) * Math.sin(t * 2.1));
      ctx.drawImage(this.forgeGlow, f.x - 10, f.y - 6);
    });
    ctx.globalAlpha = 1;

    ctx.drawImage(this.road, 0, 0);

    // People — back lane first, each with a soft contact shadow.
    for (let lane = 0; lane < 2; lane++) {
      const fy = g.lanes[lane];
      this.people.forEach((p) => {
        if (p.lane !== lane) return;
        const x = Math.round(p.x);
        ctx.fillStyle = "rgba(42, 26, 52, 0.35)";
        ctx.fillRect(x - 5, fy, 11, 1);
        ctx.fillRect(x - 3, fy + 1, 7, 1);
        const face = p.dir > 0 ? 0 : 1;
        const img = p.state === "walk"
          ? p.ch.frames.walk[face][Math.floor(p.dist / 2.4) % 4]
          : p.ch.frames.idle[face][Math.floor(p.t / 0.32) % 2];
        ctx.drawImage(img, x - 16, fy - 30);
        // Priests glow with a halo while praying
        if (p.state === "idle" && p.ch.def.fx === "holy") {
          ctx.fillStyle = "#fff09c";
          ctx.globalAlpha = 0.6 + 0.4 * Math.sin(p.t * 6);
          ctx.fillRect(x - 3, fy - 32, 7, 1);
          ctx.fillRect(x - 4, fy - 31, 1, 1); ctx.fillRect(x + 4, fy - 31, 1, 1);
          ctx.fillRect(x - 3, fy - 30, 7, 1);
          ctx.globalAlpha = 1;
        }
      });
    }

    ctx.drawImage(this.grass, 0, 0);

    // Particles
    this.particles.forEach((q) => {
      const x = Math.round(q.x), y = Math.round(q.y), k = q.life / q.max;
      switch (q.type) {
        case "smoke": {
          const rad = (q.heavy ? 2 : 1) + Math.floor(k * 3);
          ctx.globalAlpha = (1 - k) * 0.45;
          ctx.fillStyle = k < 0.3 ? "#9a8aa8" : "#7a6a8e";
          ctx.fillRect(x - rad, y - rad + 1, rad * 2 + 1, rad * 2 - 1);
          ctx.fillRect(x - rad + 1, y - rad, rad * 2 - 1, rad * 2 + 1);
          break;
        }
        case "ember":
          ctx.globalAlpha = 1 - k;
          ctx.fillStyle = k < 0.5 ? "#ffe08a" : "#ff7a3a";
          ctx.fillRect(x, y, 1, 1);
          break;
        case "spark": {
          ctx.globalAlpha = 1 - k * 0.6;
          ctx.fillStyle = q.col;
          ctx.fillRect(x, y, 1, 1);
          if (k < 0.5) { ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1); }
          break;
        }
        case "mote":
          ctx.globalAlpha = 1 - k;
          ctx.fillStyle = q.col;
          ctx.fillRect(x, y, 1, 1);
          if (k < 0.4) ctx.fillRect(x, y - 1, 1, 1);
          break;
        case "glint": {
          const s = k < 0.33 ? 1 : k < 0.66 ? 2 : 1;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y - s, 1, s * 2 + 1);
          ctx.fillRect(x - s, y, s * 2 + 1, 1);
          break;
        }
        case "note":
        case "heart": {
          const shape = q.type === "note" ? NOTE : HEART;
          ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
          const sway = q.type === "note" ? Math.round(Math.sin(q.life * 5) * 1.5) : 0;
          ctx.fillStyle = q.type === "note" ? q.col : "#e8645c";
          for (let j = 0; j < shape.length; j++) for (let i = 0; i < shape[j].length; i++) {
            if (shape[j][i] === "x") ctx.fillRect(x + i - 2 + sway, y + j - 2, 1, 1);
          }
          if (q.type === "heart") { ctx.fillStyle = "#ffc0c0"; ctx.fillRect(x - 1, y - 1, 1, 1); }
          break;
        }
        case "coin": {
          const spin = Math.floor(q.life * 12) % 3;
          ctx.fillStyle = "#e2b242";
          ctx.fillRect(x - (spin === 1 ? 0 : 1), y - 1, spin === 1 ? 1 : 2, 3);
          ctx.fillStyle = "#fff09c";
          ctx.fillRect(x - (spin === 1 ? 0 : 1), y - 1, 1, 1);
          break;
        }
      }
      ctx.globalAlpha = 1;
    });

    // Fireflies drifting over the rooftops at dusk
    this.fireflies.forEach((f) => {
      const on = Math.sin(t * f.speed * 2 + f.phase);
      if (on < 0.2) return;
      const x = Math.round(f.x + Math.sin(t * 0.4 * f.speed + f.phase) * 12);
      const y = Math.round(f.y + Math.cos(t * 0.6 * f.speed + f.phase) * 5);
      ctx.globalAlpha = (on - 0.2) / 0.8;
      ctx.fillStyle = "#e8ff9a";
      ctx.fillRect(x, y, 1, 1);
      ctx.globalAlpha = ((on - 0.2) / 0.8) * 0.35;
      ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
    });
    ctx.globalAlpha = 1;
  };

  World.prototype.loop = function (now) {
    this.raf = requestAnimationFrame(this.loop);
    const frameMs = 1000 / (this.opts.mobile ? 20 : 30);
    if (!this.last) this.last = now;
    const elapsed = now - this.last;
    if (elapsed < frameMs) return;
    this.last = now - (elapsed % frameMs);
    this.update(Math.min(0.1, elapsed / 1000));
    this.draw();
  };

  World.prototype.start = function () {
    this.loop = this.loop.bind(this);
    this.draw();
    if (this.opts.reduceMotion) return;
    this.raf = requestAnimationFrame(this.loop);
  };

  let world = null;
  function init(options) {
    options = options || {};
    const canvas = document.getElementById(options.canvasId || "pixelWorld");
    if (!canvas || !canvas.getContext) return null;
    world = new World(canvas, { reduceMotion: !!options.reduceMotion, mobile: !!options.mobile });
    world.start();
    let timer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        world.resize();
        if (options.reduceMotion) world.draw();
      }, 180);
    }, { passive: true });
    return world;
  }

  global.PixelWorld = { init: init };
})(window);
