/* ============================================
   HENRY INTERNATIONAL — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ---- STICKY HEADER SHADOW ---- */
  const header = document.getElementById('siteHeader');
  const announcementBar = document.getElementById('announcementBar');

  function handleScroll() {
    const scrolled = window.scrollY > 10;
    header.classList.toggle('scrolled', scrolled);
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

  // Close mobile nav on outside click
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

  // Mobile dropdown accordion
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.has-dropdown > .nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const parent = this.closest('.nav-item');
        const wasOpen = parent.classList.contains('open');
        document.querySelectorAll('.nav-item.open').forEach(function (item) {
          item.classList.remove('open');
        });
        if (!wasOpen) parent.classList.add('open');
      });
    });
  }

  /* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      // Close mobile nav if open
      navLinks.classList.remove('open');
      document.body.style.overflow = '';

      const headerHeight = header.offsetHeight +
        (announcementBar && announcementBar.style.display !== 'none'
          ? announcementBar.offsetHeight
          : 0);

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - headerHeight - 16,
        behavior: 'smooth'
      });
    });
  });

  /* ---- PORTFOLIO TABS ---- */
  const portfolioTabs = document.getElementById('portfolioTabs');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  if (portfolioTabs) {
    portfolioTabs.addEventListener('click', function (e) {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;

      // Update active tab
      portfolioTabs.querySelectorAll('.tab-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      const filter = btn.dataset.tab;

      portfolioCards.forEach(function (card) {
        if (filter === 'all') {
          card.style.display = '';
          setTimeout(function () { card.style.opacity = '1'; card.style.transform = ''; }, 0);
        } else {
          const status = card.dataset.status;
          const match = (
            (filter === 'active'   && status === 'active') ||
            (filter === 'building' && status === 'building') ||
            (filter === 'pipeline' && status === 'pipeline')
          );
          if (match) {
            card.style.display = '';
            setTimeout(function () { card.style.opacity = '1'; card.style.transform = ''; }, 0);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(8px)';
            setTimeout(function () { card.style.display = 'none'; }, 220);
          }
        }
      });
    });
  }

  /* ---- SERVICES TOGGLE ---- */
  const servicesToggle = document.getElementById('servicesToggle');
  const servicesPanes = document.querySelectorAll('.services-pane');

  if (servicesToggle) {
    servicesToggle.addEventListener('click', function (e) {
      const btn = e.target.closest('.stoggle-btn');
      if (!btn) return;

      servicesToggle.querySelectorAll('.stoggle-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      const target = btn.dataset.pane;
      servicesPanes.forEach(function (pane) {
        pane.classList.toggle('active', pane.id === 'pane-' + target);
      });
    });
  }

  /* ---- INTERSECTION OBSERVER: FADE IN UP ---- */
  const fadeTargets = document.querySelectorAll(
    '.portfolio-card, .service-card, .insight-card, .roadmap-phase, .pillar, .value-item'
  );

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
  function animateCounter(el, target, suffix) {
    const duration = 1600;
    const start = performance.now();
    const isNum = !isNaN(parseInt(target));

    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic

      if (isNum) {
        el.textContent = Math.round(parseInt(target) * ease) + (suffix || '');
      } else {
        if (progress >= 1) el.textContent = target;
      }

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const numbers = entry.target.querySelectorAll('.stat-number');
          numbers.forEach(function (el) {
            const raw = el.textContent.trim();
            const numMatch = raw.match(/^(\d+)(%?)$/);
            if (numMatch) {
              animateCounter(el, numMatch[1], numMatch[2]);
            }
          });
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  /* ---- PROGRESS BAR ANIMATION ---- */
  const barObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.vc-bar-fill');
          if (fill) {
            const target = fill.style.width;
            fill.style.width = '0';
            setTimeout(function () { fill.style.width = target; }, 200);
          }
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const vcBars = document.querySelectorAll('.vc-bar');
  vcBars.forEach(function (el) { barObserver.observe(el); });

  /* ---- CONTACT FORM (client-side simulation) ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn = this.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = 'Sending…';
      btn.disabled = true;

      // Simulate async submit (replace with real endpoint)
      setTimeout(function () {
        btn.textContent = 'Message Sent!';
        btn.style.background = '#1a7a4a';
        contactForm.reset();

        setTimeout(function () {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      }, 1200);
    });
  }

  /* ---- ACTIVE NAV LINK HIGHLIGHTING ---- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    let current = '';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = '#' + section.id;
      }
    });

    navAnchors.forEach(function (a) {
      a.classList.toggle('nav-link-active', a.getAttribute('href') === current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ---- RESIZE: RE-INIT DROPDOWNS ---- */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

})();
