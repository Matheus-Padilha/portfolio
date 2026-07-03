/* ═══════════════════════════════════════════════
   MAIN.JS — Core Interactions
   Cursor · Typewriter · Magnetic · Tilt · Navbar · Form
   Portfolio — Matheus Padilha
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initNavbar();
    initMobileMenu();
    initTypewriter();
    initMagneticButtons();
    initTiltCards();
    initSkillCards3D();
    initContactForm();
    initSmoothAnchors();
    initSectionActiveNav();
  });

  /* ════════════════════════════════════════
     CUSTOM CURSOR
  ════════════════════════════════════════ */
  function initCursor() {
    const cursor  = document.getElementById('cursor');
    if (!cursor) return;

    const dot     = cursor.querySelector('.cursor-dot');
    const outline = cursor.querySelector('.cursor-outline');

    let mouseX = -100, mouseY = -100;
    let outX   = -100, outY   = -100;

    // Instant dot tracking
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });

    // Lagged outline tracking
    (function trackOutline() {
      outX += (mouseX - outX) * 0.10;
      outY += (mouseY - outY) * 0.10;
      outline.style.left = outX + 'px';
      outline.style.top  = outY + 'px';
      requestAnimationFrame(trackOutline);
    })();

    // Hover states — scan all interactive elements
    function addHoverListeners() {
      const targets = document.querySelectorAll(
        'a, button, .skill-card, .project-card, .social-link, .magnetic-btn, input, textarea, label, .btn, .nav-link'
      );
      targets.forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
      });
    }

    addHoverListeners();

    // Click states
    document.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
    document.addEventListener('mouseup',   () => cursor.classList.remove('is-clicking'));

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; outline.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = ''; outline.style.opacity = ''; });
  }

  /* ════════════════════════════════════════
     NAVBAR — scroll state
  ════════════════════════════════════════ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastY = 0;

    const onScroll = () => {
      const y = window.scrollY;

      // Scrolled state (glassmorphism)
      if (y > 60) navbar.classList.add('scrolled');
      else        navbar.classList.remove('scrolled');

      // Hide on scroll down, show on scroll up (> threshold)
      if (y > lastY && y > 200) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }

      lastY = y;
    };

    navbar.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), backdrop-filter 0.5s ease, border-color 0.5s ease, background-color 0.5s ease, padding 0.3s ease';

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ════════════════════════════════════════
     MOBILE MENU
  ════════════════════════════════════════ */
  function initMobileMenu() {
    const hamburger = document.getElementById('nav-hamburger');
    const menu      = document.getElementById('mobile-menu');
    if (!hamburger || !menu) return;

    const mobileLinks = menu.querySelectorAll('.mobile-link');

    function toggleMenu() {
      const isOpen = hamburger.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', isOpen);
      menu.classList.toggle('is-open', isOpen);
      menu.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ════════════════════════════════════════
     TYPEWRITER EFFECT
  ════════════════════════════════════════ */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const words = [
      'Frontend Developer',
      'UI/UX Enthusiast',
      'Creative Builder',
      'Code Artist',
      'React & Vue Dev',
    ];

    let wordIdx  = 0;
    let charIdx  = 0;
    let deleting = false;
    let paused   = false;

    const TYPE_SPEED   = 75;   // ms per char when typing
    const DELETE_SPEED = 45;   // ms per char when deleting
    const PAUSE_AFTER  = 2000; // ms pause at full word

    function step() {
      if (paused) return;

      const word = words[wordIdx];

      if (!deleting) {
        // Typing forward
        charIdx++;
        el.textContent = word.slice(0, charIdx);

        if (charIdx === word.length) {
          // Pause, then start deleting
          paused = true;
          setTimeout(() => { paused = false; deleting = true; step(); }, PAUSE_AFTER);
          return;
        }
      } else {
        // Deleting
        charIdx--;
        el.textContent = word.slice(0, charIdx);

        if (charIdx === 0) {
          deleting = false;
          wordIdx  = (wordIdx + 1) % words.length;
        }
      }

      setTimeout(step, deleting ? DELETE_SPEED : TYPE_SPEED);
    }

    // Start after hero animations settle
    setTimeout(step, 1700);
  }

  /* ════════════════════════════════════════
     MAGNETIC BUTTONS
     Subtle attraction effect on hover
  ════════════════════════════════════════ */
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect   = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;
        const dx = (e.clientX - centerX) * 0.28;
        const dy = (e.clientY - centerY) * 0.28;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.15s ease';
      });
    });
  }

  /* ════════════════════════════════════════
     3D TILT ON PROJECT CARDS
  ════════════════════════════════════════ */
  function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach((card) => {
      const MAX_TILT = 10; // degrees

      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const x      = (e.clientX - rect.left) / rect.width;   // 0→1
        const y      = (e.clientY - rect.top)  / rect.height;  // 0→1

        const rotX = (y - 0.5) * -MAX_TILT;  // negative so top tilts away
        const rotY = (x - 0.5) *  MAX_TILT;

        // Compute subtle shadow direction matching tilt
        const shadowX = rotY * -2;
        const shadowY = rotX * -2;

        card.style.transition    = 'transform 0.1s ease, box-shadow 0.1s ease';
        card.style.transform     = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.015, 1.015, 1.015)`;
        card.style.boxShadow     = `${shadowX}px ${shadowY}px 40px rgba(0,0,0,0.14)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.55s ease';
        card.style.transform  = '';
        card.style.boxShadow  = '';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
      });
    });
  }

  /* ════════════════════════════════════════
     SMOOTH ANCHOR LINKS
  ════════════════════════════════════════ */
  function initSmoothAnchors() {
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (!target) return;
        
        e.preventDefault();
        
        const offset = -60; // negative offset to scroll past the section padding and center the header content
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 800; // Duração da animação em ms
        let startTime = null;

        function animation(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          }
        }

        requestAnimationFrame(animation);
      });
    });
  }

  /* ════════════════════════════════════════
     ACTIVE NAV LINK — highlight on scroll
  ════════════════════════════════════════ */
  function initSectionActiveNav() {
    const sections = ['#about', '#skills', '#projects', '#contact']
      .map((sel) => document.querySelector(sel))
      .filter(Boolean);

    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              const isMatch = link.getAttribute('href') === '#' + id;
              link.style.color = isMatch ? 'var(--text-primary)' : '';
              link.style.fontWeight = isMatch ? '700' : '';
            });
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  /* ════════════════════════════════════════
     CONTACT FORM — Submit handler
  ════════════════════════════════════════ */
  function initContactForm() {
    const form       = document.getElementById('contact-form');
    const btnText    = document.getElementById('btn-submit-text');
    const btnIcon    = document.getElementById('btn-submit-icon');
    const btnSubmit  = document.getElementById('btn-submit');
    if (!form || !btnText) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const originalText = btnText.textContent;

      // Sending state
      btnSubmit.disabled = true;
      btnText.textContent = 'Enviando…';
      if (btnIcon) btnIcon.style.opacity = '0';

      // Build WhatsApp URL
      const nome = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const mensagem = document.getElementById('form-message').value;

      const waText = `Olá Matheus, vim pelo seu portfólio!\n\n*Nome:* ${nome}\n*E-mail:* ${email}\n\n*Mensagem:*\n${mensagem}`;
      const waLink = `https://wa.me/5549998321120?text=${encodeURIComponent(waText)}`;

      setTimeout(() => {
        // Open WhatsApp in new tab
        window.open(waLink, '_blank');

        // Success state
        btnText.textContent = 'Redirecionado ✓';
        btnSubmit.style.background = '#22c55e';
        btnSubmit.style.borderColor = '#22c55e';

        setTimeout(() => {
          btnText.textContent = originalText;
          if (btnIcon) btnIcon.style.opacity = '';
          btnSubmit.disabled = false;
          btnSubmit.style.background = '';
          btnSubmit.style.borderColor = '';
          form.reset();
        }, 3000);
      }, 600);
    });
  }

  /* ════════════════════════════════════════
     SKILL CARDS — 3D Tilt + Shine
  ════════════════════════════════════════ */
  function initSkillCards3D() {
    const cards = document.querySelectorAll('.skill-card');
    const MAX_TILT = 18; // degrees

    cards.forEach((card) => {
      const inner = card.querySelector('.skill-card-inner');
      const shine = card.querySelector('.skill-shine');
      if (!inner) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;   // 0 → 1
        const y = (e.clientY - rect.top)  / rect.height;  // 0 → 1

        const rotX = (y - 0.5) * -MAX_TILT * 2;
        const rotY = (x - 0.5) *  MAX_TILT * 2;

        inner.style.transition = 'transform 0.08s ease';
        inner.style.transform  =
          `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

        // Update shine radial centre
        if (shine) {
          shine.style.setProperty('--sx', `${x * 100}%`);
          shine.style.setProperty('--sy', `${y * 100}%`);
        }
      });

      card.addEventListener('mouseenter', () => {
        inner.style.transition = 'transform 0.08s ease';
      });

      card.addEventListener('mouseleave', () => {
        inner.style.transition =
          'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
        inner.style.transform = '';
      });
    });
  }

})();
