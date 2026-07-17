/* =========================================================
   Wave canvas backgrounds — vanilla port of 21st.dev patterns
   · Smooth Wavy Canvas (ui-layouts) — hero + contact
   · Dynamic Wave Canvas (minhxthanh) — other panels, subtle
   ========================================================= */
(function (global) {
  "use strict";

  const instances = [];
  let activePanelIndex = 0;
  let io = null;

  function capDpr() {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  function bindPointer(panel, onMove) {
    if (!panel) return function () {};
    panel.addEventListener("pointermove", onMove, { passive: true });
    panel.addEventListener("pointerleave", function () {
      onMove({ clientX: -9999, clientY: -9999 });
    });
    return function () {
      panel.removeEventListener("pointermove", onMove);
    };
  }

  /* ---------- Smooth Wavy Canvas (ui-layouts / 21st.dev) ---------- */
  function SmoothWavyCanvas(canvas, opts) {
    this.canvas = canvas;
    this.panel = canvas.closest(".panel");
    this.panelIndex = opts.panelIndex;
    this.primaryColor = opts.primaryColor;
    this.secondaryColor = opts.secondaryColor;
    this.accentColor = opts.accentColor;
    this.lineOpacity = opts.lineOpacity;
    this.animationSpeed = opts.animationSpeed;
    this.interactive = opts.interactive;
    this.time = 0;
    this.mouse = { x: -9999, y: -9999 };
    this.raf = null;
    this.active = false;
    this.unbind = null;

    var self = this;
    this.resize = function () {
      var dpr = capDpr();
      var w = self.panel ? self.panel.clientWidth : canvas.clientWidth;
      var h = self.panel ? self.panel.clientHeight : canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      var ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    this.getMouseInfluence = function (x, y) {
      var dx = x - self.mouse.x;
      var dy = y - self.mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      return Math.max(0, 1 - dist / 200);
    };

    this.draw = function () {
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (!w || !h) return;

      self.time += self.animationSpeed;
      ctx.clearRect(0, 0, w, h);

      var numPrimary = opts.mobile ? 18 : 35;
      var numSecondary = opts.mobile ? 12 : 25;
      var numAccent = opts.mobile ? 8 : 15;

      var i, x, y, j, progress, baseX, baseY;
      var mouseInfl, localMouseInfl, amplitude, frequency, speed, thickness, opacity;

      for (i = 0; i < numPrimary; i++) {
        var yPos = (i / numPrimary) * h;
        mouseInfl = self.getMouseInfluence(w / 2, yPos);
        amplitude = 45 + 25 * Math.sin(self.time * 0.25 + i * 0.15) + mouseInfl * 25;
        frequency = 0.006 + 0.002 * Math.sin(self.time * 0.12 + i * 0.08) + mouseInfl * 0.001;
        speed = self.time * (0.6 + 0.3 * Math.sin(i * 0.12)) + mouseInfl * self.time * 0.3;
        thickness = 0.6 + 0.4 * Math.sin(self.time + i * 0.25) + mouseInfl * 0.8;
        opacity = (0.12 + 0.08 * Math.abs(Math.sin(self.time * 0.3 + i * 0.18)) + mouseInfl * 0.15) * self.lineOpacity;

        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = "rgba(" + self.primaryColor + ", " + opacity + ")";
        for (x = 0; x < w; x += 2) {
          localMouseInfl = self.getMouseInfluence(x, yPos);
          y = yPos + amplitude * Math.sin(x * frequency + speed) +
            localMouseInfl * Math.sin(self.time * 2 + x * 0.008) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      for (i = 0; i < numSecondary; i++) {
        var xPos = (i / numSecondary) * w;
        mouseInfl = self.getMouseInfluence(xPos, h / 2);
        amplitude = 40 + 20 * Math.sin(self.time * 0.18 + i * 0.14) + mouseInfl * 20;
        frequency = 0.007 + 0.003 * Math.cos(self.time * 0.14 + i * 0.09) + mouseInfl * 0.002;
        speed = self.time * (0.5 + 0.25 * Math.cos(i * 0.16)) + mouseInfl * self.time * 0.25;
        thickness = 0.5 + 0.3 * Math.sin(self.time + i * 0.35) + mouseInfl * 0.7;
        opacity = (0.1 + 0.06 * Math.abs(Math.sin(self.time * 0.28 + i * 0.2)) + mouseInfl * 0.12) * self.lineOpacity;

        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = "rgba(" + self.secondaryColor + ", " + opacity + ")";
        for (y = 0; y < h; y += 2) {
          localMouseInfl = self.getMouseInfluence(xPos, y);
          x = xPos + amplitude * Math.sin(y * frequency + speed) +
            localMouseInfl * Math.sin(self.time * 2 + y * 0.008) * 12;
          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      for (i = 0; i < numAccent; i++) {
        var offset = (i / numAccent) * w * 1.5 - w * 0.25;
        amplitude = 30 + 15 * Math.cos(self.time * 0.22 + i * 0.12);
        frequency = 0.01 + 0.004 * Math.sin(self.time * 0.16 + i * 0.1);
        var phase = self.time * (0.4 + 0.2 * Math.sin(i * 0.13));
        thickness = 0.4 + 0.25 * Math.sin(self.time + i * 0.28);
        opacity = (0.06 + 0.04 * Math.abs(Math.sin(self.time * 0.24 + i * 0.15))) * self.lineOpacity;

        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = "rgba(" + self.accentColor + ", " + opacity + ")";
        var steps = opts.mobile ? 60 : 100;
        for (j = 0; j <= steps; j++) {
          progress = j / steps;
          baseX = offset + progress * w;
          baseY = progress * h + amplitude * Math.sin(progress * 6 + phase);
          mouseInfl = self.getMouseInfluence(baseX, baseY);
          x = baseX + mouseInfl * Math.sin(self.time * 1.5 + progress * 6) * 8;
          y = baseY + mouseInfl * Math.cos(self.time * 1.5 + progress * 6) * 8;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    this.tick = function () {
      if (!self.active) return;
      self.draw();
      self.raf = requestAnimationFrame(self.tick);
    };

    this.setActive = function (on) {
      self.active = on;
      if (on) {
        if (!self.raf) self.raf = requestAnimationFrame(self.tick);
      } else if (self.raf) {
        cancelAnimationFrame(self.raf);
        self.raf = null;
      }
    };

    this.destroy = function () {
      self.setActive(false);
      if (self.unbind) self.unbind();
    };

    this.resize();
    if (this.interactive && this.panel) {
      this.unbind = bindPointer(this.panel, function (e) {
        var r = self.panel.getBoundingClientRect();
        self.mouse.x = e.clientX - r.left;
        self.mouse.y = e.clientY - r.top;
      });
    }
  }

  /* ---------- Dynamic Wave Canvas (minhxthanh / 21st.dev) ---------- */
  function DynamicWaveCanvas(canvas, opts) {
    this.canvas = canvas;
    this.panel = canvas.closest(".panel");
    this.panelIndex = opts.panelIndex;
    this.waves = opts.waves;
    this.veilRgb = opts.veilRgb || "240, 232, 220";
    this.time = 0;
    this.mouse = { x: 0.5, y: 0.5 };
    this.raf = null;
    this.active = false;
    this.unbind = null;

    var self = this;
    this.resize = function () {
      var dpr = capDpr();
      var w = self.panel ? self.panel.clientWidth : canvas.clientWidth;
      var h = self.panel ? self.panel.clientHeight : canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      var ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    this.draw = function () {
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (!w || !h) return;

      self.time += opts.speed;
      ctx.clearRect(0, 0, w, h);

      var mx = (self.mouse.x - 0.5) * 30;
      var my = (self.mouse.y - 0.5) * 20;

      self.waves.forEach(function (wave, idx) {
        var amp = wave.amplitude + mx * 0.15;
        var yBase = h * wave.yRatio + my * 0.5;
        var freq = wave.frequency;
        var spd = self.time * wave.speed + idx * 0.7;

        ctx.beginPath();
        ctx.moveTo(0, h);
        var x, y;
        for (x = 0; x <= w; x += 3) {
          y = yBase +
            amp * Math.sin(x * freq + spd) +
            amp * 0.35 * Math.sin(x * freq * 1.8 - spd * 0.6 + idx);
          if (x === 0) ctx.lineTo(0, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      // Soft top vignette keeps text area calmer
      var grad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
      grad.addColorStop(0, "rgba(" + self.veilRgb + ", 0.72)");
      grad.addColorStop(0.45, "rgba(" + self.veilRgb + ", 0.18)");
      grad.addColorStop(1, "rgba(" + self.veilRgb + ", 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h * 0.55);
    };

    this.tick = function () {
      if (!self.active) return;
      self.draw();
      self.raf = requestAnimationFrame(self.tick);
    };

    this.setActive = function (on) {
      self.active = on;
      if (on) {
        if (!self.raf) self.raf = requestAnimationFrame(self.tick);
      } else if (self.raf) {
        cancelAnimationFrame(self.raf);
        self.raf = null;
      }
    };

    this.destroy = function () {
      self.setActive(false);
      if (self.unbind) self.unbind();
    };

    this.resize();
    if (opts.interactive && this.panel) {
      this.unbind = bindPointer(this.panel, function (e) {
        var r = self.panel.getBoundingClientRect();
        self.mouse.x = (e.clientX - r.left) / r.width;
        self.mouse.y = (e.clientY - r.top) / r.height;
      });
    }
  }

  function refreshActive() {
    instances.forEach(function (inst) {
      inst.setActive(inst.panelIndex === activePanelIndex);
    });
  }

  function init(options) {
    options = options || {};
    var reduceMotion = !!options.reduceMotion;
    var mobile = !!options.mobile;
    var isPaged = !!options.isPaged;

    if (reduceMotion) return;

    var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));

    document.querySelectorAll(".wave-canvas--smooth").forEach(function (canvas) {
      var panel = canvas.closest(".panel");
      var isDark = panel && panel.classList.contains("panel--dark");
      var idx = panels.indexOf(panel);
      instances.push(new SmoothWavyCanvas(canvas, {
        panelIndex: idx,
        mobile: mobile,
        interactive: !mobile,
        primaryColor: isDark ? "155, 142, 196" : "90, 82, 110",
        secondaryColor: isDark ? "201, 123, 132" : "155, 142, 196",
        accentColor: isDark ? "232, 168, 124" : "201, 123, 132",
        lineOpacity: isDark ? (mobile ? 0.55 : 0.75) : (mobile ? 0.35 : 0.5),
        animationSpeed: mobile ? 0.003 : 0.004,
      }));
    });

    document.querySelectorAll(".wave-canvas--dynamic").forEach(function (canvas) {
      var panel = canvas.closest(".panel");
      var idx = panels.indexOf(panel);
      var even = idx % 2 === 1;
      instances.push(new DynamicWaveCanvas(canvas, {
        panelIndex: idx,
        mobile: mobile,
        interactive: !mobile,
        veilRgb: even ? "230, 221, 208" : "240, 232, 220",
        speed: mobile ? 0.012 : 0.018,
        waves: [
          { amplitude: mobile ? 28 : 42, frequency: 0.0055, speed: 0.7, yRatio: even ? 0.68 : 0.72, color: "rgba(155, 142, 196, " + (mobile ? 0.07 : 0.11) + ")" },
          { amplitude: mobile ? 36 : 52, frequency: 0.0042, speed: 0.55, yRatio: even ? 0.76 : 0.8, color: "rgba(201, 123, 132, " + (mobile ? 0.05 : 0.08) + ")" },
          { amplitude: mobile ? 22 : 34, frequency: 0.0075, speed: 0.9, yRatio: even ? 0.84 : 0.88, color: "rgba(107, 158, 158, " + (mobile ? 0.04 : 0.07) + ")" },
          { amplitude: mobile ? 48 : 68, frequency: 0.0035, speed: 0.45, yRatio: even ? 0.58 : 0.62, color: "rgba(45, 38, 64, " + (mobile ? 0.03 : 0.05) + ")" },
        ],
      }));
    });

  instances.forEach(function (inst) { inst.resize(); });

    window.addEventListener("resize", function () {
      instances.forEach(function (inst) { inst.resize(); });
    }, { passive: true });

    if (isPaged) {
      activePanelIndex = 0;
      refreshActive();
    } else if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var panel = entry.target;
          var idx = panels.indexOf(panel);
          instances.forEach(function (inst) {
            if (inst.panelIndex === idx) inst.setActive(entry.isIntersecting);
          });
        });
      }, { threshold: 0.25 });
      panels.forEach(function (p) { io.observe(p); });
    } else {
      instances.forEach(function (inst) { inst.setActive(true); });
    }
  }

  function setActivePanel(index) {
    activePanelIndex = index;
    refreshActive();
  }

  function destroy() {
    if (io) io.disconnect();
    instances.forEach(function (inst) { inst.destroy(); });
    instances.length = 0;
  }

  global.WaveCanvas = { init: init, setActivePanel: setActivePanel, destroy: destroy };
})(window);
