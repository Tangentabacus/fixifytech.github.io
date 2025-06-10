    // Theme toggle logic: switch between dark and light themes
    const toggleTheme = () => {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      // Update theme toggle button emoji
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) {
        if (newTheme === 'dark') {
          btn.textContent = '☀️'; // show sun to switch back to light
        } else {
          btn.textContent = '🌙'; // show moon to switch to dark
        }
      }
    };

    // Determine and apply initial theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Set initial theme toggle button emoji
    document.addEventListener('DOMContentLoaded', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const initBtn = document.getElementById('theme-toggle-btn');
      if (initBtn) {
        initBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
      }
    });

    // Sticky navigation and scroll behavior
    const nav = document.getElementById('main-nav');
    const topBtn = document.getElementById('top-button');
    const header = document.querySelector('header');
    const spacer = document.getElementById('nav-spacer');

    const updateNavState = () => {
      const buffer = 1; // prevent jump due to fractional pixel scroll
      const headerBottom = header.getBoundingClientRect().bottom + window.scrollY;

      if (window.scrollY + buffer >= headerBottom) {
        nav.classList.remove('initial');
        nav.classList.add('fixed', 'scrolled');
        // Add spacer to prevent layout shift when nav is fixed
        spacer.style.height = `${nav.offsetHeight}px`;
        // "Top" button visibility is now handled by CSS.
      } else {
        nav.classList.remove('fixed', 'scrolled');
        nav.classList.add('initial');
        // Remove spacer when nav is not fixed
        spacer.style.height = '0px';
        // "Top" button visibility is now handled by CSS.
      }
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateNavState();
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    });
    window.addEventListener('resize', updateNavState);
    document.addEventListener('DOMContentLoaded', updateNavState);

    // Highlight active nav link based on scroll position
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = {
      services: document.querySelector("#services"),
      about: document.querySelector("#about")
    };

    function updateActiveLink() {
      if (!sections.services || !sections.about) return;

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const totalHeight = document.body.offsetHeight;

      const servicesTop = sections.services.offsetTop;
      const servicesBottom = servicesTop + sections.services.offsetHeight;
      const aboutTop = sections.about.offsetTop;

      navLinks.forEach(link => link.classList.remove("active"));

      if (
        scrollY + viewportHeight >= totalHeight ||
        (scrollY > aboutTop - 100 && scrollY + 100 < totalHeight)
      ) {
        document.querySelector('a[href="#about"]').classList.add("active");
      } else if (scrollY >= servicesTop - 100 && scrollY < servicesBottom - 100) {
        document.querySelector('a[href="#services"]').classList.add("active");
      }
    }

    window.addEventListener("resize", updateActiveLink);
    document.addEventListener("DOMContentLoaded", updateActiveLink);

    // About section image carousel with auto-slide and navigation
    (function() {
      const carousel = document.getElementById('about-carousel');
      if (!carousel) return;
      const inner = carousel.querySelector('.carousel-inner');
      const slides = Array.from(inner.children);
      const prevBtn = carousel.querySelector('.carousel-nav.prev');
      const nextBtn = carousel.querySelector('.carousel-nav.next');
      let idx = 0;
      const total = slides.length;

      function showSlide(i) {
        inner.style.transition = 'transform 0.5s ease';
        idx = (i + total) % total;
        inner.style.transform = `translateX(-${idx * 100}%)`;
      }

      let autoInterval = setInterval(() => showSlide(idx + 1), 6000);

      // Pause on hover
      carousel.addEventListener('mouseenter', () => clearInterval(autoInterval));
      carousel.addEventListener('mouseleave', () => autoInterval = setInterval(() => showSlide(idx + 1), 6000));

      // Nav button clicks
      prevBtn.addEventListener('click', () => showSlide(idx - 1));
      nextBtn.addEventListener('click', () => showSlide(idx + 1));

      // Touch swipe support
      let startX = 0;
      carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; clearInterval(autoInterval); });
      carousel.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (dx > 30) showSlide(idx - 1);
        else if (dx < -30) showSlide(idx + 1);
        autoInterval = setInterval(() => showSlide(idx + 1), 6000);
      });
    })();
    // Equalize service card heights for layout consistency
    function equalizeServiceHeights() {
      const cards = document.querySelectorAll('#services section .card');
      if (!cards.length) return;
      // Remove any inline height
      cards.forEach(c => c.style.minHeight = 'auto');
      // Calculate max height
      let maxH = 0;
      cards.forEach(c => {
        const h = c.offsetHeight;
        if (h > maxH) maxH = h;
      });
      // Apply minimum height
      cards.forEach(c => c.style.minHeight = maxH + 'px');
    }

    // Adjust Facebook button text based on screen width
    function updateFacebookButtonText() {
      const fbBtn = document.querySelector('.nav-center .social');
      if (!fbBtn) return;
      if (window.innerWidth < 600) {
        fbBtn.textContent = 'Facebook';
      } else {
        fbBtn.textContent = 'Visit Us on Facebook';
      }
    }

    // Initialize behaviors on page load and resize
    window.addEventListener('DOMContentLoaded', equalizeServiceHeights);
    window.addEventListener('resize', equalizeServiceHeights);
    window.addEventListener('DOMContentLoaded', updateFacebookButtonText);
    window.addEventListener('resize', updateFacebookButtonText);