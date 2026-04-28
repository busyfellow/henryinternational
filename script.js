/* ============================================
   HENRY INTERNATIONAL — Main JavaScript
   Redesign: Minimal holding company site
   ============================================ */

(function () {
  'use strict';

  /* ---- STICKY HEADER SHADOW ---- */
  const header = document.getElementById('siteHeader');

  function handleScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---- MOBILE NAV TOGGLE ---- */
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  mobileToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.addEventListener('click', function (e) {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !mobileToggle.contains(e.target)
    ) {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      navLinks.classList.remove('open');
      document.body.style.overflow = '';

      const headerHeight = header.offsetHeight;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - headerHeight - 16,
        behavior: 'smooth'
      });
    });
  });

  /* ---- INTERSECTION OBSERVER: FADE IN UP ---- */
  const fadeTargets = document.querySelectorAll('.portfolio-card, .about-visual-block, .contact-form-wrap');

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up', 'visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  fadeTargets.forEach(function (el, i) {
    el.classList.add('fade-in-up');
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    observer.observe(el);
  });

  /* ---- ANIMATED COUNTER (stats in hero) ---- */
  function animateCounter(el, target) {
    const duration = 1200;
    const start = performance.now();
    const num = parseInt(target);

    function update(time) {
      const progress = Math.min((time - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(num * ease);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-number').forEach(function (el) {
            const raw = el.textContent.trim();
            if (/^\d+$/.test(raw)) animateCounter(el, raw);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  /* ---- CONTACT FORM ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = this.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      const data = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName:  document.getElementById('lastName').value.trim(),
        email:     document.getElementById('email').value.trim(),
        message:   document.getElementById('message').value.trim(),
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();

        if (res.ok && result.success) {
          btn.textContent = 'Message Sent!';
          btn.style.background = '#1a7a4a';
          contactForm.reset();
          setTimeout(function () {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 4000);
        } else {
          btn.textContent = 'Error — please try again';
          btn.style.background = '#b91c1c';
          btn.disabled = false;
          setTimeout(function () {
            btn.textContent = originalText;
            btn.style.background = '';
          }, 4000);
        }
      } catch {
        btn.textContent = 'Network error — please try again';
        btn.style.background = '#b91c1c';
        btn.disabled = false;
        setTimeout(function () {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 4000);
      }
    });
  }

  /* ---- ACTIVE NAV LINK HIGHLIGHTING ---- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    let current = '';
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) current = '#' + section.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('nav-link-active', a.getAttribute('href') === current);
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ---- RESIZE: CLOSE MOBILE NAV ---- */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

})();
