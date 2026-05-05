/* ==========================================================================
   MEDILINK AI - JAVASCRIPT (script.js)
   Role: UI/UX Interactions, AI Intro Logic, Smart Recommendations,
         Medical Particle System & Custom Cursor
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Selectors for Intro, Main Wrappers, and Nav
  const introForm = document.getElementById("intro-form");
  const introOverlay = document.getElementById("intro-overlay");
  const mainWrapper = document.getElementById("main-wrapper");
  const body = document.body;
  const greetingEl = document.getElementById("personalized-greeting");
  const heroInsight = document.getElementById("hero-insight");
  const introSosBtn = document.getElementById("intro-sos-btn");
  const editProfileBtn = document.getElementById("edit-profile-btn");

  // ==========================================
  // 1. LOCAL STORAGE & INITIALIZATION LOGIC
  // ==========================================

  const savedUserData = localStorage.getItem("medilinkUser");

  if (savedUserData) {
    const user = JSON.parse(savedUserData);
    introOverlay.style.display = "none";
    mainWrapper.classList.add("reveal");
    body.classList.remove("no-scroll");
    applyPersonalization(user.name, user.problem);
    setTimeout(initAnimations, 100);
  }

  if (introForm) {
    introForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userName = document.getElementById("user-name").value.trim();
      const userAge = document.getElementById("user-age").value;
      const userProblem = document.getElementById("user-problem").value.trim();
      if (userName && userAge && userProblem) {
        const userData = { name: userName, age: userAge, problem: userProblem };
        localStorage.setItem("medilinkUser", JSON.stringify(userData));
        applyPersonalization(userName, userProblem);
        introOverlay.style.display = "flex";
        introOverlay.classList.add("slide-up");
        mainWrapper.classList.add("reveal");
        body.classList.remove("no-scroll");
        setTimeout(initAnimations, 600);
      }
    });
  }

  if (introSosBtn) {
    introSosBtn.addEventListener("click", () => {
      applyPersonalization("Guest", "emergency");
      introOverlay.style.display = "flex";
      introOverlay.classList.add("slide-up");
      mainWrapper.classList.add("reveal");
      body.classList.remove("no-scroll");
      setTimeout(() => {
        initAnimations();
        document
          .getElementById("emergency")
          .scrollIntoView({ behavior: "smooth" });
      }, 600);
    });
  }

  // ==========================================
  // 2. EDIT PROFILE / UPDATE NEEDS LOGIC
  // ==========================================
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const existingData = localStorage.getItem("medilinkUser");
      if (existingData) {
        const user = JSON.parse(existingData);
        document.getElementById("user-name").value = user.name || "";
        document.getElementById("user-age").value = user.age || "";
        document.getElementById("user-problem").value = user.problem || "";
      }
      introOverlay.style.display = "flex";
      setTimeout(() => {
        introOverlay.classList.remove("slide-up");
      }, 10);
      body.classList.add("no-scroll");
    });
  }

  // ==========================================
  // 3. SMART AI RECOMMENDATION LOGIC
  // ==========================================
  function applyPersonalization(name, problem) {
    const enGreeting = `Hello ${name}, Welcome to`;
    const bnGreeting = `হ্যালো ${name}, স্বাগতম`;
    if (greetingEl) {
      greetingEl.innerText = enGreeting;
      greetingEl.setAttribute("data-en", enGreeting);
      greetingEl.setAttribute("data-bn", bnGreeting);
    }

    const resetCards = () => {
      document
        .querySelectorAll(".specialty-card, .product-card")
        .forEach((card) => {
          card.classList.remove("highlight-card", "dim-card");
        });
      if (heroInsight) heroInsight.style.display = "none";
    };

    if (!problem || problem.toLowerCase() === "emergency") {
      resetCards();
      return;
    }

    const problemWords = problem
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);
    let foundMatch = false;

    const filterCards = (selector) => {
      const cards = document.querySelectorAll(selector);
      cards.forEach((card) => {
        const tags = card.getAttribute("data-tags");
        if (!tags) return;
        const isMatch = problemWords.some((word) =>
          tags.toLowerCase().includes(word),
        );
        if (isMatch) {
          card.classList.add("highlight-card");
          card.classList.remove("dim-card");
          foundMatch = true;
        } else {
          card.classList.add("dim-card");
          card.classList.remove("highlight-card");
        }
      });
    };

    filterCards(".specialty-card");
    filterCards(".product-card");

    if (foundMatch && heroInsight) {
      heroInsight.style.display = "block";
      const enInsight =
        "AI Insight: Based on your symptoms, we have highlighted recommended specialists and medicines below.";
      const bnInsight =
        "এআই ইনসাইট: আপনার উপসর্গের উপর ভিত্তি করে, আমরা নিচে প্রস্তাবিত বিশেষজ্ঞ এবং ওষুধগুলো হাইলাইট করেছি।";
      const currentLangBtn = document.getElementById("lang-toggle-btn");
      if (currentLangBtn && currentLangBtn.innerText.includes("English")) {
        heroInsight.innerText = bnInsight;
      } else {
        heroInsight.innerText = enInsight;
      }
      heroInsight.setAttribute("data-en", enInsight);
      heroInsight.setAttribute("data-bn", bnInsight);
    } else {
      resetCards();
    }
  }

  // ==========================================
  // 4. BILINGUAL LANGUAGE TOGGLE
  // ==========================================
  const langToggleBtn = document.getElementById("lang-toggle-btn");
  let currentLang = localStorage.getItem("medilinkLang") || "en";

  const toggleLanguage = () => {
    const translatableElements = document.querySelectorAll("[data-bn]");
    if (currentLang === "en") {
      translatableElements.forEach((el) => {
        if (!el.hasAttribute("data-en"))
          el.setAttribute("data-en", el.innerText);
        el.innerText = el.getAttribute("data-bn");
      });
      langToggleBtn.innerHTML = `<i class="fa-solid fa-language"></i> English`;
      currentLang = "bn";
    } else {
      translatableElements.forEach((el) => {
        if (el.hasAttribute("data-en"))
          el.innerText = el.getAttribute("data-en");
      });
      langToggleBtn.innerHTML = `<i class="fa-solid fa-language"></i> বাংলা`;
      currentLang = "en";
    }
    localStorage.setItem("medilinkLang", currentLang);
  };

  if (currentLang === "bn") {
    currentLang = "en";
    toggleLanguage();
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", toggleLanguage);
  }

  // ==========================================
  // 5. STICKY NAVBAR EFFECT
  // ==========================================
  const navbar = document.querySelector(".sticky-navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // ==========================================
  // 6. MOBILE HAMBURGER MENU LOGIC
  // ==========================================
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");
  const mobileMenuIcon = mobileMenuBtn.querySelector("i");

  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    if (navLinks.classList.contains("active")) {
      mobileMenuIcon.classList.remove("fa-bars");
      mobileMenuIcon.classList.add("fa-xmark");
    } else {
      mobileMenuIcon.classList.remove("fa-xmark");
      mobileMenuIcon.classList.add("fa-bars");
    }
  });

  const navItems = navLinks.querySelectorAll("li a, li button");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        mobileMenuIcon.classList.remove("fa-xmark");
        mobileMenuIcon.classList.add("fa-bars");
      }
    });
  });

  // ==========================================
  // 7. ANIMATION INITIALIZATION FUNCTION
  // ==========================================
  function initAnimations() {
    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.15 };
    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document
      .querySelectorAll(".animate-on-scroll")
      .forEach((el) => scrollObserver.observe(el));

    const counters = document.querySelectorAll(".counter-number");
    const speed = 200;
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const updateCount = () => {
              const target = +counter.getAttribute("data-target");
              const count = +counter.innerText;
              const inc = target / speed;
              if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 15);
              } else {
                counter.innerText = target + (target > 1000 ? "+" : "");
              }
            };
            updateCount();
            observer.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  // ==========================================
  // 8. MEDICAL PARTICLE UNIVERSE (SVG-Based)
  // ==========================================
  (function initMedicalParticles() {
    const heroSection = document.getElementById("hero-dynamic-section");
    const canvas = document.getElementById("medical-universe-canvas");
    if (!heroSection || !canvas) return;

    const isMobile = window.innerWidth <= 768;

    // --- SVG Medical Icon Templates ---
    const svgIcons = {
      dna: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4C12 4 12 12 20 16C28 20 28 28 28 28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M28 4C28 4 28 12 20 16C12 20 12 28 12 28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="13" y1="8" x2="27" y2="8" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="14" y1="12" x2="26" y2="12" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="14" y1="20" x2="26" y2="20" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="13" y1="24" x2="27" y2="24" stroke="currentColor" stroke-width="1" opacity="0.5"/></svg>`,
      neuron: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="5" stroke="currentColor" stroke-width="1.5"/><line x1="20" y1="15" x2="20" y2="4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="25" y1="20" x2="36" y2="20" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="20" y1="25" x2="20" y2="36" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="15" y1="20" x2="4" y2="20" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="24" y1="16" x2="32" y2="8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><line x1="16" y1="24" x2="8" y2="32" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><circle cx="20" cy="4" r="1.5" fill="currentColor" opacity="0.6"/><circle cx="36" cy="20" r="1.5" fill="currentColor" opacity="0.6"/><circle cx="20" cy="36" r="1.5" fill="currentColor" opacity="0.6"/><circle cx="4" cy="20" r="1.5" fill="currentColor" opacity="0.6"/></svg>`,
      mito: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="20" rx="16" ry="10" stroke="currentColor" stroke-width="1.5"/><path d="M8 16C12 20 16 14 20 18C24 22 28 16 32 20" stroke="currentColor" stroke-width="1" opacity="0.6" stroke-linecap="round"/><path d="M10 22C14 18 18 24 22 20C26 16 30 22 34 18" stroke="currentColor" stroke-width="1" opacity="0.4" stroke-linecap="round"/></svg>`,
      scalpel: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 30L26 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M26 14L32 8L34 10L28 16L26 14Z" stroke="currentColor" stroke-width="1.2" fill="currentColor" opacity="0.3"/><path d="M10 30C8 32 6 32 6 30C6 28 10 30 10 30Z" fill="currentColor" opacity="0.5"/></svg>`,
      helix: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4C26 8 26 14 20 18C14 22 14 28 20 32C26 36 26 38 20 38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="20" cy="10" r="2" fill="currentColor" opacity="0.4"/><circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.4"/><circle cx="20" cy="30" r="2" fill="currentColor" opacity="0.4"/></svg>`,
      cross: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="8" width="8" height="24" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" opacity="0.15"/><rect x="8" y="16" width="24" height="8" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" opacity="0.15"/></svg>`,
    };

    const iconKeys = Object.keys(svgIcons);
    const tealShades = [
      "rgba(0,128,128,0.18)",
      "rgba(0,128,128,0.12)",
      "rgba(32,178,170,0.15)",
      "rgba(0,100,100,0.1)",
      "rgba(0,160,160,0.14)",
    ];

    // --- Particle State ---
    const particles = [];
    const PARTICLE_COUNT = isMobile ? 18 : 45;
    const MOUSE_RADIUS = 160;

    let mouseX = null;
    let mouseY = null;
    let rafMouseX = null;
    let rafMouseY = null;

    // --- Create Particles ---
    function createParticles() {
      canvas.innerHTML = "";
      particles.length = 0;

      const w = heroSection.offsetWidth;
      const h = heroSection.offsetHeight;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const iconKey = iconKeys[Math.floor(Math.random() * iconKeys.length)];
        const size = 20 + Math.random() * 28;
        const x = Math.random() * w;
        const y = Math.random() * h;
        const speedX = (Math.random() - 0.5) * 0.4;
        const speedY = (Math.random() - 0.5) * 0.4;
        const rotation = Math.random() * 360;
        const rotSpeed = (Math.random() - 0.5) * 0.3;
        const color = tealShades[Math.floor(Math.random() * tealShades.length)];

        const el = document.createElement("div");
        el.className = "med-particle";
        el.style.cssText = `
          width: ${size}px; height: ${size}px;
          left: 0; top: 0;
          color: ${color};
          transform: translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg);
          animation-delay: ${Math.random() * 1.5}s;
        `;
        el.innerHTML = svgIcons[iconKey];
        canvas.appendChild(el);

        particles.push({
          el, x, y, size,
          speedX, speedY,
          baseSpeedX: speedX,
          baseSpeedY: speedY,
          rotation, rotSpeed,
          w, h,
        });
      }
    }

    // --- Animation Loop (requestAnimationFrame) ---
    function animate() {
      const w = heroSection.offsetWidth;
      const h = heroSection.offsetHeight;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse interaction — smooth tilt/repel
        if (!isMobile && rafMouseX !== null && rafMouseY !== null) {
          const dx = rafMouseX - p.x;
          const dy = rafMouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            const pushX = (dx / dist) * force * 2.5;
            const pushY = (dy / dist) * force * 2.5;
            p.x -= pushX;
            p.y -= pushY;
          }
        }

        // Friction — return to base speed
        p.speedX += (p.baseSpeedX - p.speedX) * 0.02;
        p.speedY += (p.baseSpeedY - p.speedY) * 0.02;

        // Move
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        // Boundary wrap
        if (p.x < -p.size) p.x = w + p.size;
        if (p.x > w + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = h + p.size;
        if (p.y > h + p.size) p.y = -p.size;

        // Apply GPU-accelerated transform
        p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
      }

      requestAnimationFrame(animate);
    }

    // --- Mouse Tracking (throttled via rAF) ---
    let mouseRafId = null;

    function updateMousePosition() {
      rafMouseX = mouseX;
      rafMouseY = mouseY;
      mouseRafId = null;
    }

    heroSection.addEventListener("mousemove", (e) => {
      if (isMobile) return;
      const rect = heroSection.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      if (!mouseRafId) {
        mouseRafId = requestAnimationFrame(updateMousePosition);
      }
    });

    heroSection.addEventListener("mouseleave", () => {
      mouseX = null;
      mouseY = null;
      rafMouseX = null;
      rafMouseY = null;
    });

    // --- Click Burst ---
    heroSection.addEventListener("click", (e) => {
      if (isMobile) return;
      const rect = heroSection.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      particles.forEach((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          const force = (220 - dist) / 220;
          p.speedX = (dx / dist) * force * 12;
          p.speedY = (dy / dist) * force * 12;
        }
      });
    });

    // --- Resize Handler ---
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        createParticles();
      }, 250);
    });

    // Boot
    createParticles();
    animate();
  })();

  // Custom cursor removed — using native browser cursor
});
