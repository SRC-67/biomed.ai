/* ==========================================================================
   MEDILINK AI - JAVASCRIPT (script.js)
   Role: UI/UX Interactions, AI Intro Logic, and Smart Recommendations
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

  // Check if user data exists in browser's local storage
  const savedUserData = localStorage.getItem("medilinkUser");

  if (savedUserData) {
    // USER RETURNING: Skip Intro Screen
    const user = JSON.parse(savedUserData);

    // Hide overlay immediately (no animation)
    introOverlay.style.display = "none";
    mainWrapper.classList.add("reveal");
    body.classList.remove("no-scroll");

    // Apply personalized data and smart filtering
    applyPersonalization(user.name, user.problem);
    setTimeout(initAnimations, 100);
  }

  // Handle Form Submission (First-time user or Profile Update)
  if (introForm) {
    introForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent page reload

      const userName = document.getElementById("user-name").value.trim();
      const userAge = document.getElementById("user-age").value;
      const userProblem = document.getElementById("user-problem").value.trim();

      if (userName && userAge && userProblem) {
        // Save data to localStorage so intro doesn't show next time
        const userData = { name: userName, age: userAge, problem: userProblem };
        localStorage.setItem("medilinkUser", JSON.stringify(userData));

        // Re-apply the AI filtering based on new input
        applyPersonalization(userName, userProblem);

        // Ensure display is block in case they are re-opening it
        introOverlay.style.display = "flex";

        // Trigger the elegant reveal animations
        introOverlay.classList.add("slide-up");
        mainWrapper.classList.add("reveal");
        body.classList.remove("no-scroll");

        // Initialize Scroll Reveal after the slide animation
        setTimeout(initAnimations, 600);
      }
    });
  }

  // Handle Quick Emergency Button (Bypass Form)
  if (introSosBtn) {
    introSosBtn.addEventListener("click", () => {
      // Temporary guest data for emergency bypass
      applyPersonalization("Guest", "emergency");

      introOverlay.style.display = "flex";
      introOverlay.classList.add("slide-up");
      mainWrapper.classList.add("reveal");
      body.classList.remove("no-scroll");

      setTimeout(() => {
        initAnimations();
        // Auto-scroll directly to the Emergency section
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
      e.preventDefault(); // Prevent page jump

      // Fetch existing data to pre-fill the form for a better UX
      const existingData = localStorage.getItem("medilinkUser");
      if (existingData) {
        const user = JSON.parse(existingData);
        document.getElementById("user-name").value = user.name || "";
        document.getElementById("user-age").value = user.age || "";
        document.getElementById("user-problem").value = user.problem || "";
      }

      // Restore the intro overlay smoothly
      introOverlay.style.display = "flex";

      // Use setTimeout to allow the display:flex to register before animating
      setTimeout(() => {
        introOverlay.classList.remove("slide-up");
      }, 10);

      body.classList.add("no-scroll");

      // Note: Mobile menu auto-close is handled below in Section 6,
      // so we don't need to manually close it here!
    });
  }

  // ==========================================
  // 3. SMART AI RECOMMENDATION LOGIC
  // ==========================================
  function applyPersonalization(name, problem) {
    // --- A. Dynamic Greeting Setup ---
    const enGreeting = `Hello ${name}, Welcome to`;
    const bnGreeting = `হ্যালো ${name}, স্বাগতম`;

    if (greetingEl) {
      greetingEl.innerText = enGreeting;
      // Save translations dynamically for the Language Toggle
      greetingEl.setAttribute("data-en", enGreeting);
      greetingEl.setAttribute("data-bn", bnGreeting);
    }

    // --- Helper function to reset all cards to default ---
    const resetCards = () => {
      document
        .querySelectorAll(".specialty-card, .product-card")
        .forEach((card) => {
          card.classList.remove("highlight-card", "dim-card");
        });
      if (heroInsight) heroInsight.style.display = "none";
    };

    // --- B. Keyword-Based Filtering ---
    if (!problem || problem.toLowerCase() === "emergency") {
      resetCards();
      return;
    }

    // Convert user's problem to an array of keywords (ignoring tiny words)
    const problemWords = problem
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);
    let foundMatch = false;

    // Function to analyze tags and apply CSS highlighting
    const filterCards = (selector) => {
      const cards = document.querySelectorAll(selector);
      cards.forEach((card) => {
        const tags = card.getAttribute("data-tags");
        if (!tags) return;

        // Check if any word from the user's input matches the card's data-tags
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

    // Apply the filter to Doctors and Medicines
    filterCards(".specialty-card");
    filterCards(".product-card");

    // --- C. Display Insight Message ---
    if (foundMatch && heroInsight) {
      heroInsight.style.display = "block";

      const enInsight =
        "AI Insight: Based on your symptoms, we have highlighted recommended specialists and medicines below.";
      const bnInsight =
        "এআই ইনসাইট: আপনার উপসর্গের উপর ভিত্তি করে, আমরা নিচে প্রস্তাবিত বিশেষজ্ঞ এবং ওষুধগুলো হাইলাইট করেছি।";

      // Display according to current language
      const currentLangBtn = document.getElementById("lang-toggle-btn");
      if (currentLangBtn && currentLangBtn.innerText.includes("English")) {
        heroInsight.innerText = bnInsight; // If button says English, we are IN Bengali mode
      } else {
        heroInsight.innerText = enInsight;
      }

      heroInsight.setAttribute("data-en", enInsight);
      heroInsight.setAttribute("data-bn", bnInsight);
    } else {
      resetCards();
    }
  }

  // 4. BILINGUAL LANGUAGE TOGGLE
  const langToggleBtn = document.getElementById("lang-toggle-btn");

  // Check memory on load
  let currentLang = localStorage.getItem("medilinkLang") || "en";

  // Quick function to apply the translation
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
    // Save to memory so 'Learn More' page reads it
    localStorage.setItem("medilinkLang", currentLang);
  };

  // Run on load if needed
  if (currentLang === "bn") {
    currentLang = "en"; // Temporarily set to 'en' so the function flips it correctly
    toggleLanguage();
  }

  // Click event
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

  // Auto-close mobile menu when ANY link is clicked (including "Edit My Needs")
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
    // --- Scroll Reveal Animations ---
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15,
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll(".animate-on-scroll");
    hiddenElements.forEach((el) => scrollObserver.observe(el));

    // --- Stats Number Counter Animation ---
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
});
