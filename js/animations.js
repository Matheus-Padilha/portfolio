/* ═══════════════════════════════════════════════
   ANIMATIONS.JS — GSAP ScrollTrigger + Theme Transition
   Portfolio — Matheus Padilha
   FIX: Curvas de easing independentes por variavel
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('Portfolio: GSAP or ScrollTrigger not loaded.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ================================================
     WHITE -> DARK THEME TRANSITION

     PROBLEMA ANTERIOR: todas as variaveis interpolavam
     linearmente ao mesmo tempo. Quando progress=0.5,
     o bg ficava cinza medio (~128,128,128) E o texto
     tambem ficava cinza medio (~125,125,125), tornando
     tudo invisivel.

     SOLUCAO: cada variavel tem sua propria curva.
     - Background: transicao lenta e continua
     - Texto: flip rapido na zona 38%-62% (mantendo contraste)
     - Bordas: transicao media
     - Superficies secundarias: ligeiramente atrasadas
  ================================================ */

  var LIGHT = {
    bg:            [255, 255, 255],
    bgSecondary:   [245, 245, 245],
    bgSurface:     [248, 248, 248],
    textPrimary:   [10,  10,  10 ],
    textSecondary: [68,  68,  68 ],
    textMuted:     [136, 136, 136],
    border:        [224, 224, 224]
  };

  var DARK = {
    bg:            [10,  10,  10 ],
    bgSecondary:   [17,  17,  17 ],
    bgSurface:     [20,  20,  20 ],
    textPrimary:   [240, 240, 240],
    textSecondary: [180, 180, 180],
    textMuted:     [140, 140, 140],
    border:        [38,  38,  38 ]
  };

  var CSS_VARS = {
    bg:            '--bg',
    bgSecondary:   '--bg-secondary',
    bgSurface:     '--bg-surface',
    textPrimary:   '--text-primary',
    textSecondary: '--text-secondary',
    textMuted:     '--text-muted',
    border:        '--border'
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerpVal(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function lerpColor(from, to, t) {
    return [
      lerpVal(from[0], to[0], t),
      lerpVal(from[1], to[1], t),
      lerpVal(from[2], to[2], t)
    ];
  }

  /* Smoothstep: curva S entre edge0 e edge1 */
  function smoothstep(edge0, edge1, x) {
    var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /* A transição do fundo agora é muito mais rápida para evitar a zona cinza.
     Ocorre entre 45% e 55% do progresso do scroll. */
  function bgCurve(p) {
    return smoothstep(0.45, 0.55, p);
  }

  /* Curva do texto: mesma velocidade do background para sincronizar perfeitamente */
  function textCurve(p) {
    return smoothstep(0.45, 0.55, p);
  }

  /* Superficies secundarias */
  function surfaceCurve(p) {
    return smoothstep(0.45, 0.55, p);
  }

  /* Bordas */
  function borderCurve(p) {
    return smoothstep(0.45, 0.55, p);
  }

  function applyTheme(progress) {
    var root = document.documentElement;
    var p = clamp(progress, 0, 1);

    /* Background principal: transicao rapida no meio */
    var bg = lerpColor(LIGHT.bg, DARK.bg, bgCurve(p));
    root.style.setProperty(CSS_VARS.bg, 'rgb(' + bg.join(',') + ')');

    /* Superficies secundarias */
    var bgSec = lerpColor(LIGHT.bgSecondary, DARK.bgSecondary, surfaceCurve(p));
    var bgSurf = lerpColor(LIGHT.bgSurface, DARK.bgSurface, surfaceCurve(p));
    root.style.setProperty(CSS_VARS.bgSecondary, 'rgb(' + bgSec.join(',') + ')');
    root.style.setProperty(CSS_VARS.bgSurface, 'rgb(' + bgSurf.join(',') + ')');

    /* Textos: flip rapido no meio — contraste sempre mantido */
    var tPrimary = lerpColor(LIGHT.textPrimary, DARK.textPrimary, textCurve(p));
    var tSecondary = lerpColor(LIGHT.textSecondary, DARK.textSecondary, textCurve(p));
    var tMuted = lerpColor(LIGHT.textMuted, DARK.textMuted, textCurve(p));
    root.style.setProperty(CSS_VARS.textPrimary, 'rgb(' + tPrimary.join(',') + ')');
    root.style.setProperty(CSS_VARS.textSecondary, 'rgb(' + tSecondary.join(',') + ')');
    root.style.setProperty(CSS_VARS.textMuted, 'rgb(' + tMuted.join(',') + ')');

    /* Bordas */
    var borderColor = lerpColor(LIGHT.border, DARK.border, borderCurve(p));
    root.style.setProperty(CSS_VARS.border, 'rgb(' + borderColor.join(',') + ')');

    /* Notifica Three.js */
    if (typeof window.heroSceneSetDark === 'function') {
      window.heroSceneSetDark(p > 0.5);
    }
  }

  /* Estado inicial: garante tema claro */
  applyTheme(0);

  /* ScrollTrigger: comeca na secao Skills, termina no Contact */
  ScrollTrigger.create({
    trigger:     '#skills',
    endTrigger:  '#contact',
    start:       'top 80%',
    end:         'top 20%',
    scrub:       1.8,
    onUpdate:    function(self) { applyTheme(self.progress); },
    onLeaveBack: function()     { applyTheme(0); },
    onLeave:     function()     { applyTheme(1); }
  });

  /* ================================================
     REVEAL ANIMATIONS (IntersectionObserver)
  ================================================ */

  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.reveal-text, .reveal-from-left, .reveal-from-right, .reveal-scale'
  ).forEach(function(el) { revealObserver.observe(el); });

  /* ================================================
     ABOUT VISUAL — slide from left
  ================================================ */

  if (document.getElementById('about-visual')) {
    gsap.fromTo('#about-visual',
      { x: -60, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: '#about', start: 'top 65%', once: true }
      }
    );
  }

  /* ================================================
     SKILL CARDS — stagger reveal
  ================================================ */

  gsap.fromTo('#skills-grid .skill-card',
    { y: 40, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.65, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: '#skills-grid', start: 'top 72%', once: true }
    }
  );

  /* ================================================
     SKILL BARS
  ================================================ */

  var skillBarObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar').forEach(function(bar) {
          var w = bar.dataset.width;
          setTimeout(function() { bar.style.width = w + '%'; }, 200);
        });
        skillBarObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  var skillsSection = document.getElementById('skills');
  if (skillsSection) skillBarObserver.observe(skillsSection);

  /* ================================================
     PROJECT CARDS — stagger reveal
  ================================================ */

  gsap.fromTo('#projects-grid .project-card',
    { y: 60, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '#projects-grid', start: 'top 72%', once: true }
    }
  );

  /* ================================================
     SOCIAL LINKS — slide in stagger
  ================================================ */

  gsap.fromTo('#social-links .social-link',
    { x: -30, opacity: 0 },
    {
      x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '#social-links', start: 'top 78%', once: true }
    }
  );

  /* ================================================
     CONTACT FORM — slide up
  ================================================ */

  gsap.fromTo('.contact-form .form-group',
    { y: 28, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-form', start: 'top 80%', once: true }
    }
  );

  /* ================================================
     COUNT-UP ANIMATION
  ================================================ */

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  var countObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.dataset.target, 10);
      var duration = 1800;
      var startTime = performance.now();

      function tick(now) {
        var elapsed = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        el.textContent = Math.round(easeOutCubic(progress) * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }

      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.count-up').forEach(function(el) {
    countObserver.observe(el);
  });

  window.portfolioApplyTheme = applyTheme;

})();
