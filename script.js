(function() {
  'use strict';

  // ========== LOADER ==========
  function dismissLoader() {
    var loader = document.getElementById('loader');
    if (loader) loader.classList.add('done');
  }
  // Dismiss rapide dès que le DOM est prêt : le loader overlay cache le hero et plombe le LCP Lighthouse.
  // On garde une courte respiration (500 ms) pour que la marque soit lisible avant la transition.
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(dismissLoader, 500);
  } else {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(dismissLoader, 500); });
  }
  setTimeout(dismissLoader, 1800); // garde-fou absolu

  // ========== YEAR ==========
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ========== DUPLIQUER MARQUEE ==========
  var marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

  // ========== PLACEHOLDERS SVG ==========
  // Génère des compositions atmosphériques sombres avec accents cuivre,
  // adaptées au type de pièce (escalier / cheminée / mobilier / portrait).

  function svgUri(svg) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function rand(seed) {
    // Pseudo-aléatoire déterministe à partir d'un seed entier
    var x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  }

  function makeStaircase(seed, w, h) {
    // Lignes diagonales évoquant des marches en perspective
    var glowX = 15 + rand(seed) * 30;
    var glowY = 70 + rand(seed + 1) * 20;
    var skew = -25 - rand(seed + 2) * 20; // angle des marches
    var marches = '';
    for (var i = 0; i < 14; i++) {
      var y = h * 0.15 + i * (h * 0.06);
      var dx = i * 18;
      var op = 0.15 + i * 0.05;
      marches += '<line x1="' + (w * 0.1 + dx) + '" y1="' + y + '" x2="' + (w * 0.55 + dx) + '" y2="' + (y - 50) + '" stroke="#3a3038" stroke-width="2.5" opacity="' + op + '"/>';
      // Ligne de contremarche (verticale courte)
      marches += '<line x1="' + (w * 0.1 + dx) + '" y1="' + y + '" x2="' + (w * 0.1 + dx) + '" y2="' + (y + 30) + '" stroke="#2a2228" stroke-width="2" opacity="' + (op * 0.6) + '"/>';
    }
    // Limon vertical
    var limon = '<line x1="' + (w * 0.55 + 13 * 18) + '" y1="' + (h * 0.15 - 30) + '" x2="' + (w * 0.1) + '" y2="' + (h * 0.95) + '" stroke="#4a3a30" stroke-width="3" opacity="0.5"/>';
    return wrap(seed, w, h, glowX, glowY, marches + limon);
  }

  function makeFireplace(seed, w, h) {
    // Forme verticale centrale avec ouverture incandescente
    var glowX = 50;
    var glowY = 60 + rand(seed) * 20;
    var bw = w * 0.5;
    var bx = (w - bw) / 2;
    var by = h * 0.18;
    var bh = h * 0.7;
    var ow = bw * 0.45;
    var ox = (w - ow) / 2;
    var oy = by + bh * 0.35;
    var oh = bh * 0.4;
    var content = '';
    // Bloc cheminée
    content += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="#100c10" stroke="#2a2228" stroke-width="1.5"/>';
    // Sol / socle
    content += '<rect x="' + (bx - 30) + '" y="' + (by + bh) + '" width="' + (bw + 60) + '" height="8" fill="#1a1418"/>';
    // Ouverture incandescente
    content += '<defs><radialGradient id="fire' + seed + '" cx="50%" cy="60%" r="60%">';
    content += '<stop offset="0" stop-color="#ffb56b"/><stop offset="0.4" stop-color="#ff7a2e"/><stop offset="0.85" stop-color="#8a2010"/><stop offset="1" stop-color="#1a0a05"/>';
    content += '</radialGradient></defs>';
    content += '<rect x="' + ox + '" y="' + oy + '" width="' + ow + '" height="' + oh + '" fill="url(#fire' + seed + ')"/>';
    // Hotte au-dessus (ligne)
    content += '<line x1="' + bx + '" y1="' + (oy - 10) + '" x2="' + (bx + bw) + '" y2="' + (oy - 10) + '" stroke="#3a3038" stroke-width="1.5"/>';
    return wrap(seed, w, h, glowX, glowY, content, true);
  }

  function makeFurniture(seed, w, h) {
    // Surface horizontale + pieds (table/console) ou grille (bibliothèque)
    var variant = seed % 3;
    var glowX = 20 + rand(seed) * 60;
    var glowY = 70;
    var content = '';
    if (variant === 0) {
      // Table : plateau + 2 pieds
      var py = h * 0.55;
      content += '<rect x="' + (w * 0.1) + '" y="' + py + '" width="' + (w * 0.8) + '" height="' + (h * 0.04) + '" fill="#1a1418"/>';
      content += '<rect x="' + (w * 0.1) + '" y="' + py + '" width="' + (w * 0.8) + '" height="6" fill="#2a2024"/>';
      // Pieds
      content += '<rect x="' + (w * 0.18) + '" y="' + (py + h * 0.04) + '" width="14" height="' + (h * 0.32) + '" fill="#0e0a0e"/>';
      content += '<rect x="' + (w * 0.78) + '" y="' + (py + h * 0.04) + '" width="14" height="' + (h * 0.32) + '" fill="#0e0a0e"/>';
      // Reflet sur le plateau
      content += '<rect x="' + (w * 0.15) + '" y="' + (py + 1) + '" width="' + (w * 0.4) + '" height="2" fill="#ff9e5e" opacity="0.3"/>';
    } else if (variant === 1) {
      // Console linéaire / verrière : grille
      var cols = 4, rows = 5;
      var gx = w * 0.18, gy = h * 0.18, gw = w * 0.64, gh = h * 0.64;
      var cw = gw / cols, ch = gh / rows;
      content += '<rect x="' + gx + '" y="' + gy + '" width="' + gw + '" height="' + gh + '" fill="#0a0808" stroke="#3a3030" stroke-width="2"/>';
      for (var c = 1; c < cols; c++) {
        content += '<line x1="' + (gx + c * cw) + '" y1="' + gy + '" x2="' + (gx + c * cw) + '" y2="' + (gy + gh) + '" stroke="#3a3030" stroke-width="1.5"/>';
      }
      for (var r = 1; r < rows; r++) {
        content += '<line x1="' + gx + '" y1="' + (gy + r * ch) + '" x2="' + (gx + gw) + '" y2="' + (gy + r * ch) + '" stroke="#3a3030" stroke-width="1.5"/>';
      }
      // Quelques carreaux qui captent la lumière
      content += '<rect x="' + (gx + cw) + '" y="' + (gy + ch * 2) + '" width="' + cw + '" height="' + ch + '" fill="#ff9e5e" opacity="0.08"/>';
      content += '<rect x="' + (gx + cw * 2) + '" y="' + gy + '" width="' + cw + '" height="' + ch + '" fill="#ff9e5e" opacity="0.05"/>';
    } else {
      // Bibliothèque verticale : étagères
      var bx = w * 0.2, by = h * 0.15, bw2 = w * 0.6, bh2 = h * 0.7;
      content += '<rect x="' + bx + '" y="' + by + '" width="' + bw2 + '" height="' + bh2 + '" fill="none" stroke="#3a3030" stroke-width="2"/>';
      for (var s = 1; s < 5; s++) {
        var sy = by + s * (bh2 / 5);
        content += '<line x1="' + bx + '" y1="' + sy + '" x2="' + (bx + bw2) + '" y2="' + sy + '" stroke="#3a3030" stroke-width="1.5"/>';
      }
      // Quelques objets (rectangles fins)
      var objY = by + (bh2 / 5) * 1 - 30;
      for (var k = 0; k < 5; k++) {
        var oH = 30 + rand(seed + k) * 20;
        content += '<rect x="' + (bx + 15 + k * 22) + '" y="' + (objY - oH + 30) + '" width="14" height="' + oH + '" fill="#2a2024"/>';
      }
    }
    return wrap(seed, w, h, glowX, glowY, content);
  }

  function makePortrait(seed, w, h) {
    // Composition abstraite atelier : étincelles + ombre d'outil
    var glowX = 35;
    var glowY = 55;
    var content = '';
    // Faisceau d'étincelles diagonal
    for (var i = 0; i < 25; i++) {
      var t = i / 25;
      var x = w * 0.2 + t * w * 0.6 + (rand(seed + i) - 0.5) * 80;
      var y = h * 0.6 - t * h * 0.3 + (rand(seed + i + 50) - 0.5) * 60;
      var r = 1 + rand(seed + i + 100) * 2;
      var col = i < 8 ? '#ffe4b5' : (i < 18 ? '#ff9e5e' : '#c04a1a');
      content += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '" opacity="' + (0.4 + rand(seed + i) * 0.5) + '"/>';
    }
    // Silhouette d'enclume / forme massive en bas
    content += '<path d="M ' + (w * 0.15) + ' ' + (h * 0.95) + ' L ' + (w * 0.85) + ' ' + (h * 0.95) + ' L ' + (w * 0.7) + ' ' + (h * 0.7) + ' L ' + (w * 0.3) + ' ' + (h * 0.7) + ' Z" fill="#0a0808"/>';
    return wrap(seed, w, h, glowX, glowY, content);
  }

  function wrap(seed, w, h, glowX, glowY, content, noGlow) {
    var glow = noGlow ? '' :
      '<defs><radialGradient id="g' + seed + '" cx="' + glowX + '%" cy="' + glowY + '%" r="55%">' +
      '<stop offset="0" stop-color="#ff7a2e" stop-opacity="0.28"/>' +
      '<stop offset="0.4" stop-color="#c04a1a" stop-opacity="0.12"/>' +
      '<stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/>' +
      '</radialGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#g' + seed + ')"/>';

    var bg = '<defs><linearGradient id="bg' + seed + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#181218"/>' +
      '<stop offset="1" stop-color="#08080c"/>' +
      '</linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#bg' + seed + ')"/>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice">' +
      bg + glow + content +
      '</svg>';
  }

  function inferKind(el) {
    if (el.closest('.h-card')) return 'staircase';
    if (el.closest('.chem-piece')) return 'fireplace';
    if (el.closest('.mob-cell')) return 'furniture';
    return 'portrait';
  }

  function generatePlaceholder(el, idx) {
    var kind = inferKind(el);
    var seed = idx + 1;
    var svg;
    if (kind === 'staircase') svg = makeStaircase(seed, 800, 1000);
    else if (kind === 'fireplace') svg = makeFireplace(seed, 800, 1000);
    else if (kind === 'furniture') svg = makeFurniture(seed, 800, 1000);
    else svg = makePortrait(seed, 800, 1000);
    return svgUri(svg);
  }

  // Les vraies photos sont désormais dans des <picture> natifs (lazy + srcset + WebP géré par le navigateur).
  // Le placeholder SVG reste peint en background-image du conteneur .img-bg pour habiller la période
  // pré-chargement (fetch lazy, DPR lent, réseau faible).
  document.querySelectorAll('.img-bg').forEach(function(el, idx) {
    if (!el.querySelector('picture')) return;
    var placeholder = generatePlaceholder(el, idx);
    el.style.backgroundImage = 'url("' + placeholder + '")';
  });

  // ========== SCROLL PROGRESS ==========
  var progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    if (progressBar) progressBar.style.width = (scrolled * 100) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  // ========== NAV ==========
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function() {
    if (!nav) return;
    if (window.scrollY > 100) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  // ========== CURSEUR ==========
  var cursor = document.getElementById('cursor');
  var ring = document.getElementById('cursorRing');
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (cursor && ring && hasFinePointer) {
    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', function(e) {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = 'translate(' + (mx - 3) + 'px, ' + (my - 3) + 'px)';
    });
    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + (rx - 18) + 'px, ' + (ry - 18) + 'px)';
      requestAnimationFrame(ringLoop);
    }
    ringLoop();
    document.querySelectorAll('a, button, .h-card, .mob-cell, .chem-piece, .trio-cell, .atelier-cell, .galerie-cell').forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        cursor.classList.add('hover'); ring.classList.add('hover');
      });
      el.addEventListener('mouseleave', function() {
        cursor.classList.remove('hover'); ring.classList.remove('hover');
      });
    });
  }

  // ========== REVEAL OBSERVER ==========
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.reveal, .reveal-mask, .reveal-image, .reveal-stagger, .reveal-words')
      .forEach(function(el) { observer.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .reveal-mask, .reveal-image, .reveal-stagger, .reveal-words')
      .forEach(function(el) { el.classList.add('in'); });
  }

  // ========== SCROLL HORIZONTAL ==========
  var hSection = document.querySelector('.horizontal-section');
  var hTrack = document.getElementById('horizontalTrack');
  var hCurrent = document.getElementById('hCurrent');
  var hCards = hTrack ? hTrack.querySelectorAll('.h-card') : [];

  function updateHorizontal() {
    if (!hSection || !hTrack) return;
    if (window.innerWidth <= 900) {
      // Si l'utilisateur a redimensionné depuis desktop, on nettoie le transform inline résiduel.
      if (hTrack.style.transform) hTrack.style.transform = '';
      return;
    }

    var rect = hSection.getBoundingClientRect();
    var scrollableHeight = hSection.offsetHeight - window.innerHeight;
    var scrolled = -rect.top;
    var progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

    var trackWidth = hTrack.scrollWidth;
    var maxTranslate = trackWidth - window.innerWidth + 100;
    var translateX = -progress * maxTranslate;

    hTrack.style.transform = 'translate3d(' + translateX + 'px, 0, 0)';

    if (hCards.length && hCurrent) {
      var idx = Math.min(hCards.length - 1, Math.floor(progress * hCards.length));
      hCurrent.textContent = String(idx + 1).padStart(2, '0');
    }
  }
  window.addEventListener('scroll', updateHorizontal, { passive: true });
  window.addEventListener('resize', updateHorizontal);
  updateHorizontal();

  // ========== PARTICULES — DISQUAGE PILOTÉ PAR LE SCROLL ==========
  // - Le canvas est fixed sur tout le viewport (transparent grâce au clearRect)
  // - L'émetteur est en bas du hero (sa position Y suit le bord inférieur du hero)
  // - Sa position X avance vers la droite au fur et à mesure du scroll
  // - L'émission ne se déclenche QUE pendant un scroll actif
  // - Les particules sortent du hero et retombent par gravité sur la section en dessous

  var canvas = document.getElementById('sparks-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    // Cap du DPR à 2 pour que les canvases retina 3x des mobiles ne saturent pas la mémoire GPU.
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // --- Énergie de scroll : monte quand on scrolle, redescend en quelques frames ---
    var lastScrollY = window.scrollY;
    var scrollEnergy = 0;
    var rafId = null;

    window.addEventListener('scroll', function() {
      var newScrollY = window.scrollY;
      var delta = Math.abs(newScrollY - lastScrollY);
      // On ajoute l'amplitude du scroll à l'énergie courante (avec plafond)
      scrollEnergy = Math.min(60, scrollEnergy + delta * 0.8);
      lastScrollY = newScrollY;
      // Si la boucle s'est mise en veille (hors hero + zéro particule), on la réveille.
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }, { passive: true });

    function spawnSpark(x, y) {
      // Projection vers la DROITE, légèrement vers le haut
      var baseAngle = -0.3;                          // ~ -17°
      var angle = baseAngle + (Math.random() - 0.5) * 0.95;
      var speed = 7 + Math.random() * 14;
      var life = 60 + Math.random() * 90;
      var trail = Math.random() > 0.5;

      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: life,
        maxLife: life,
        size: trail ? 0.9 + Math.random() * 1.4 : 1.8 + Math.random() * 2.5,
        hue: 18 + Math.random() * 32,
        sat: 90 + Math.random() * 10,
        light: 68 + Math.random() * 28,
        trail: trail,
        sparkle: Math.random() > 0.82
      });
    }

    function tick() {
      // Toujours transparent (pas de voile noir résiduel)
      ctx.clearRect(0, 0, W, H);

      // Décroissance progressive de l'énergie de scroll
      scrollEnergy *= 0.88;

      // Calcul de la position de l'émetteur (en bas du hero, X selon scroll)
      var heroEl = document.querySelector('.hero');
      var emitterX = 0, emitterY = 0;
      var emitterVisible = false;
      var emitting = false;

      if (heroEl) {
        var rect = heroEl.getBoundingClientRect();
        // Visible tant que le bas du hero est encore au-dessus du milieu de l'écran
        emitterVisible = rect.bottom > 0 && rect.top < H;

        // Position X : avance vers la droite au fur et à mesure que le hero défile
        var progress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.85)));
        emitterX = W * 0.08 + progress * W * 0.78;
        // Position Y : tout en bas du hero (avec petit décalage pour bien voir le halo)
        emitterY = rect.bottom - 8;

        // Émission seulement si on scrolle ET qu'on est dans le hero
        emitting = emitterVisible && scrollEnergy > 0.5;
      }

      if (emitting) {
        // Plus on scrolle vite, plus ça crache
        var emitCount = Math.min(22, 2 + Math.floor(scrollEnergy * 0.5));
        for (var i = 0; i < emitCount; i++) {
          spawnSpark(
            emitterX + (Math.random() - 0.5) * 8,
            emitterY + (Math.random() - 0.5) * 6
          );
        }
      }

      // Halo lumineux au point de contact — visible tant qu'il y a de l'énergie
      if (emitterVisible && scrollEnergy > 0.3) {
        var intensity = Math.min(1, scrollEnergy / 15);
        try {
          var halo = ctx.createRadialGradient(emitterX, emitterY, 0, emitterX, emitterY, 70);
          halo.addColorStop(0, 'hsla(48, 100%, 88%, ' + (0.92 * intensity) + ')');
          halo.addColorStop(0.25, 'hsla(28, 100%, 62%, ' + (0.55 * intensity) + ')');
          halo.addColorStop(0.6, 'hsla(18, 100%, 45%, ' + (0.18 * intensity) + ')');
          halo.addColorStop(1, 'hsla(15, 100%, 30%, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(emitterX, emitterY, 70, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}

        // Cœur incandescent
        ctx.fillStyle = 'hsla(55, 100%, 96%, ' + intensity + ')';
        ctx.beginPath();
        ctx.arc(emitterX, emitterY, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mise à jour & rendu des particules existantes (continuent même sans scroll)
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.34;     // gravité forte → bel arc qui retombe
        p.vx *= 0.992;
        p.vy *= 0.996;
        p.life--;

        var sparkMod = p.sparkle ? (0.55 + Math.random() * 0.45) : 1;
        var alpha = Math.max(0, p.life / p.maxLife) * sparkMod;
        var size = Math.max(0.5, p.size * Math.max(0.3, alpha));

        if (p.trail) {
          ctx.strokeStyle = 'hsla(' + p.hue + ', ' + p.sat + '%, ' + p.light + '%, ' + alpha + ')';
          ctx.lineWidth = Math.max(0.8, size * 0.95);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4);
          ctx.stroke();
        } else {
          var haloRadius = Math.max(2, size * 5);
          try {
            var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloRadius);
            grad.addColorStop(0, 'hsla(' + p.hue + ', ' + p.sat + '%, ' + p.light + '%, ' + alpha + ')');
            grad.addColorStop(0.3, 'hsla(' + p.hue + ', 95%, 55%, ' + (alpha * 0.45) + ')');
            grad.addColorStop(1, 'hsla(' + p.hue + ', 100%, 30%, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
            ctx.fill();
          } catch (e) {}

          ctx.fillStyle = 'hsla(' + p.hue + ', 100%, 95%, ' + alpha + ')';
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.life <= 0 || p.y > H + 100 || p.x > W + 120 || p.x < -120) {
          particles.splice(i, 1);
        }
      }

      // Mise en veille quand il n'y a plus rien à animer : hero hors-vue, aucune particule,
      // énergie résiduelle négligeable. Le listener de scroll relance la boucle au besoin.
      if (!emitterVisible && particles.length === 0 && scrollEnergy < 0.1) {
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  // ========== LIGHTBOX ==========
  // Clic sur une carte image (escalier / cheminée / pièce de ferronnerie) → ouverture plein écran
  // sans filtre img-treat (on voit la vraie photo). ESC ou clic sur l'arrière-plan pour fermer.
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = document.getElementById('lightboxImg');
    var lbCaption = document.getElementById('lightboxCaption');
    var lbClose = lb.querySelector('.lightbox-close');

    function openLightbox(src, caption, alt) {
      if (!lbImg) return;
      lbImg.src = src;
      lbImg.alt = alt || '';
      if (lbCaption) lbCaption.textContent = caption || '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      if (lbClose) lbClose.focus();
    }

    function closeLightbox() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
    }

    function bestLightboxSrc(card) {
      // On vise la variante 1600w (WebP par défaut, JPG en secours) parsée depuis le srcset.
      var source = card.querySelector('picture source[type="image/webp"]');
      var imgEl = card.querySelector('picture img');
      if (source && source.srcset) {
        var m = source.srcset.match(/([^\s,]+)\s+1600w/);
        if (m) return m[1];
      }
      if (imgEl && imgEl.srcset) {
        var mj = imgEl.srcset.match(/([^\s,]+)\s+1600w/);
        if (mj) return mj[1];
      }
      return imgEl ? (imgEl.currentSrc || imgEl.src) : null;
    }

    function handleCardOpen(card) {
      var src = bestLightboxSrc(card);
      if (!src) return;
      var imgEl = card.querySelector('picture img');
      var titleEl = card.querySelector('h3, h4');
      var metaEl = card.querySelector('.specs, .info, .mat, .step');
      var title = titleEl ? titleEl.textContent.trim() : '';
      var meta = metaEl ? metaEl.textContent.replace(/\s+/g, ' ').trim() : '';
      var alt = imgEl ? imgEl.getAttribute('alt') : title;
      var caption = title;
      if (title && meta) caption += ' — ' + meta;
      else if (meta) caption = meta;
      openLightbox(src, caption, alt || title);
    }

    document.querySelectorAll('.h-card, .chem-piece, .mob-cell, .trio-cell, .atelier-cell, .galerie-cell').forEach(function(card) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', function() { handleCardOpen(card); });
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardOpen(card);
        }
      });
    });

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', function(e) {
      // Fermer uniquement si le clic est sur le backdrop, pas sur l'image ou le bouton
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) closeLightbox();
    });
  }

  // ========== FORMULAIRE DE CONTACT ==========
  // - action="[[ ENDPOINT_FORMULAIRE ]]" par défaut : tant que le placeholder n'est pas remplacé,
  //   on intercepte la soumission et on affiche un message invitant à écrire par courriel.
  // - Une fois l'endpoint configuré (Formspree / Basin / endpoint PHP), POST en fetch + feedback inline.
  var cForm = document.querySelector('.contact-form');
  if (cForm) {
    var cStatus = cForm.querySelector('.form-status');
    cForm.addEventListener('submit', function(e) {
      var action = cForm.getAttribute('action') || '';
      var notConfigured = !action || action.indexOf('[[') !== -1;

      if (notConfigured) {
        e.preventDefault();
        if (cStatus) {
          cStatus.className = 'form-status err';
          cStatus.textContent = 'Formulaire non configuré — écrivez-nous par courriel (adresse ci-dessous).';
        }
        return;
      }

      if (!cForm.checkValidity || !cForm.checkValidity()) {
        // On laisse le navigateur afficher ses messages natifs
        return;
      }

      e.preventDefault();
      var btn = cForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      if (cStatus) {
        cStatus.className = 'form-status';
        cStatus.textContent = 'Envoi en cours…';
      }

      fetch(action, {
        method: 'POST',
        body: new FormData(cForm),
        headers: { 'Accept': 'application/json' }
      }).then(function(res) {
        if (res.ok) {
          if (cStatus) {
            cStatus.className = 'form-status ok';
            cStatus.textContent = 'Message envoyé — réponse sous 48 h.';
          }
          cForm.reset();
        } else {
          if (cStatus) {
            cStatus.className = 'form-status err';
            cStatus.textContent = 'Erreur d\'envoi — réessayez ou écrivez directement.';
          }
        }
      }).catch(function() {
        if (cStatus) {
          cStatus.className = 'form-status err';
          cStatus.textContent = 'Erreur de connexion — réessayez.';
        }
      }).then(function() {
        if (btn) btn.disabled = false;
      });
    });
  }

})();
