document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lenis Smooth Scroll
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });
    window.lenis = lenis;

    // Sync Lenis scroll with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
    }

    // Drive Lenis smoothly via GSAP ticker
    if (typeof gsap !== "undefined") {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Register GSAP Plugins if available
  if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Scroll Progress Indicator in Header
    const progressBar = document.getElementById("scroll-progress");
    if (progressBar) {
      if (lenis) {
        lenis.on("scroll", ({ progress }) => {
          progressBar.style.width = `${progress * 100}%`;
        });
      } else {
        window.addEventListener("scroll", () => {
          const scrollTop = window.scrollY;
          const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          progressBar.style.width = `${progress}%`;
        });
      }
    }

    // 2. Hero Entrance Animation
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .fromTo(
        "#header-nav",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, clearProps: "all" },
      )
      .fromTo(
        "#hero-kicker",
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, clearProps: "all" },
        "-=0.3",
      )
      .fromTo(
        "#hero-title",
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, clearProps: "all" },
        "-=0.4",
      )
      .fromTo(
        "#hero-desc",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, clearProps: "all" },
        "-=0.5",
      )
      .fromTo(
        "#hero-cta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, clearProps: "all" },
        "-=0.4",
      )
      .fromTo(
        "#hero-ribbon",
        { scale: 0.85, opacity: 0, rotation: 5 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: "back.out(1.5)", clearProps: "all" },
        "-=0.5",
      );

    // Hero carousel subtle parallax on scroll
    const heroTrack = document.getElementById("hero-carousel-track");
    if (heroTrack) {
      gsap.to(heroTrack, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: "#home",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // 3. Stats Counter Animation on Scroll
    const statElements = document.querySelectorAll(".stat-counter");
    statElements.forEach((stat) => {
      const target = parseFloat(stat.getAttribute("data-target")) || 0;
      const prefix = stat.getAttribute("data-prefix") || "";
      const suffix = stat.getAttribute("data-suffix") || "";

      ScrollTrigger.create({
        trigger: stat,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(
            { val: 0 },
            {
              val: target,
              duration: 2,
              ease: "power2.out",
              onUpdate: function () {
                const current = Math.floor(this.targets()[0].val);
                stat.textContent = prefix + current.toLocaleString() + suffix;
              },
            },
          );
        },
      });
    });

    // 4. Section Title & Divider Reveals
    document.querySelectorAll(".gsap-reveal-title").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 35, opacity: 0 },
        {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    });

    // 5. About Us Section Elements
    const aboutPhoto = document.querySelector(".gsap-about-photo");
    if (aboutPhoto) {
      gsap.fromTo(
        aboutPhoto,
        { x: -50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: aboutPhoto,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          clearProps: "opacity",
        },
      );

      // 3D Tilt effect on photographic plate
      aboutPhoto.addEventListener("mousemove", (e) => {
        const rect = aboutPhoto.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(aboutPhoto, {
          rotationY: x * 0.04,
          rotationX: -y * 0.04,
          transformPerspective: 800,
          ease: "power1.out",
          duration: 0.4,
        });
      });
      aboutPhoto.addEventListener("mouseleave", () => {
        gsap.to(aboutPhoto, {
          rotationY: 0,
          rotationX: 0,
          ease: "power2.out",
          duration: 0.6,
        });
      });
    }

    // About Us Pillar Cards (Connect, Contribute, Celebrate)
    const aboutCards = document.querySelectorAll(".gsap-about-card");
    if (aboutCards.length) {
      gsap.fromTo(
        aboutCards,
        { x: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: aboutCards[0].parentElement,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
          x: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    }

    // 6. 5 Pillars of Engagement Cards
    const pillarCards = document.querySelectorAll(".gsap-pillar-card");
    if (pillarCards.length) {
      gsap.fromTo(
        pillarCards,
        { y: 45, opacity: 0, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: pillarCards[0].parentElement,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: "back.out(1.2)",
          clearProps: "transform,opacity,scale",
        },
      );
    }

    // 7. Alumni App Mockup & Features
    const appPhone = document.querySelector(".gsap-app-phone");
    if (appPhone) {
      gsap.fromTo(
        appPhone,
        { scale: 0.9, y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: appPhone,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          clearProps: "transform,opacity,scale",
        },
      );
    }

    const appFeatures = document.querySelectorAll(".gsap-app-feature");
    if (appFeatures.length) {
      gsap.fromTo(
        appFeatures,
        { x: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: appFeatures[0].parentElement,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
          x: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    }

    // 8. Leadership Council Tier Cards
    const tierCards = document.querySelectorAll(".gsap-tier-card");
    if (tierCards.length) {
      gsap.fromTo(
        tierCards,
        { y: 35, opacity: 0 },
        {
          scrollTrigger: {
            trigger: tierCards[0].parentElement,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    }

    // 9. Global Chapters Cards & Batch Filtering
    const chapterCards = document.querySelectorAll(".gsap-chapter-card");
    if (chapterCards.length) {
      gsap.fromTo(
        chapterCards,
        { y: 35, opacity: 0 },
        {
          scrollTrigger: {
            trigger: chapterCards[0].parentElement,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
      );
    }

    // Batch Filter Button Interactivity
    const batchPills = document.querySelectorAll(".batch-pill");
    batchPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        batchPills.forEach((p) => {
          p.classList.remove("bg-primary", "text-on-primary");
          p.classList.add("bg-surface-container-lowest", "text-on-surface");
        });
        pill.classList.remove("bg-surface-container-lowest", "text-on-surface");
        pill.classList.add("bg-primary", "text-on-primary");

        if (chapterCards.length) {
          gsap.fromTo(
            chapterCards,
            { opacity: 0.5, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.04,
              ease: "power2.out",
              clearProps: "transform,opacity",
            },
          );
        }
      });
    });

    // 10. Analytics Chart Progress Bars Animated Fill on Scroll
    const chartBars = document.querySelectorAll(".chart-bar-fill");
    if (chartBars.length) {
      ScrollTrigger.create({
        trigger: "#analytics",
        start: "top 80%",
        once: true,
        onEnter: () => {
          chartBars.forEach((bar) => {
            const width = bar.getAttribute("data-width") || "50%";
            bar.style.width = width;
          });
        },
      });
    }

    // 11. Social Responsibility section
    const socialHero = document.querySelector(".gsap-social-hero");
    if (socialHero) {
      gsap.fromTo(
        socialHero.children,
        { x: -28, opacity: 0 },
        {
          scrollTrigger: {
            trigger: "#social-impact",
            start: "top 72%",
            once: true,
          },
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.72,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    }

    const socialCards = document.querySelectorAll(".gsap-social-card");
    if (socialCards.length) {
      gsap.fromTo(
        socialCards,
        { y: 36, opacity: 0 },
        {
          scrollTrigger: {
            trigger: socialCards[0].parentElement,
            start: "top 84%",
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.68,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    }

    const socialSteps = document.querySelectorAll(".gsap-social-step");
    if (socialSteps.length) {
      gsap.fromTo(
        socialSteps,
        { y: 24, opacity: 0 },
        {
          scrollTrigger: {
            trigger: socialSteps[0].parentElement,
            start: "top 86%",
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
      );
    }

    // 12. Get Involved Action Cards
    const getInvolvedCards = document.querySelectorAll(".gsap-involved-card");
    if (getInvolvedCards.length) {
      gsap.fromTo(
        getInvolvedCards,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: getInvolvedCards[0].parentElement,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    }

    // 13. Floating Back to Top Button
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
      const updateBackToTop = (scrollYVal) => {
        const currentY =
          typeof scrollYVal === "number"
            ? scrollYVal
            : window.lenis
              ? window.lenis.scroll
              : window.scrollY;

        if (currentY > 280) {
          backToTopBtn.classList.add("visible");
        } else {
          backToTopBtn.classList.remove("visible");
        }
      };

      if (lenis) {
        lenis.on("scroll", (e) => {
          const scrollPos = e && typeof e.scroll === "number" ? e.scroll : window.scrollY;
          updateBackToTop(scrollPos);
        });
      }
      window.addEventListener("scroll", () => updateBackToTop(window.scrollY), { passive: true });

      // Run on initial page load / after refresh
      updateBackToTop(window.scrollY);

      backToTopBtn.addEventListener("click", () => {
        if (window.lenis) {
          window.lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }

    // Recalculate ScrollTrigger and Lenis offsets once images and fonts settle
    const refreshScrollBounds = () => {
      ScrollTrigger.refresh();
      if (lenis) lenis.resize();
    };
    window.addEventListener("load", refreshScrollBounds);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshScrollBounds);
    }
    setTimeout(refreshScrollBounds, 1200);

    // ScrollSpy to highlight active navigation link
    const navLinks = document.querySelectorAll("#header-nav nav a");
    const sections = [
      "home",
      "about-us",
      "alumni-app",
      "homecoming-2026",
      "council",
      "community",
      "analytics",
      "social-impact",
      "get-involved",
      "contact",
    ];

    const updateScrollSpy = (scrollYVal) => {
      let currentSection = "home";
      const scrollPos = scrollYVal + 140;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentSection = sectionId;
          }
        }
      }

      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === `#${currentSection}`) {
          link.classList.add(
            "text-secondary-fixed",
            "border-b-2",
            "border-secondary-fixed",
            "font-bold",
          );
          link.classList.remove("text-on-primary-container");
        } else {
          link.classList.remove(
            "text-secondary-fixed",
            "border-b-2",
            "border-secondary-fixed",
            "font-bold",
          );
          link.classList.add("text-on-primary-container");
        }
      });

      // Also highlight parent dropdown button if an inner section is active
      const dropdowns = document.querySelectorAll("#header-nav .nav-dropdown");
      dropdowns.forEach((dd) => {
        const btn = dd.querySelector(".nav-dropdown-btn");
        const hasActive = dd.querySelector(`a[href="#${currentSection}"]`);
        if (btn) {
          if (hasActive) {
            btn.classList.add(
              "text-secondary-fixed",
              "border-b-2",
              "border-secondary-fixed",
              "font-bold",
            );
            btn.classList.remove("text-on-primary-container");
          } else {
            btn.classList.remove(
              "text-secondary-fixed",
              "border-b-2",
              "border-secondary-fixed",
              "font-bold",
            );
            btn.classList.add("text-on-primary-container");
          }
        }
      });
    };

    if (lenis) {
      lenis.on("scroll", (e) => updateScrollSpy(e.scroll));
    } else {
      window.addEventListener("scroll", () => updateScrollSpy(window.scrollY));
    }
  }

  // ==========================================
  // HERO BANNER CAROUSEL CONTROLLER (AUTO ADVANCE + SMALL DOT INDICATORS ONLY)
  // ==========================================
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroDots = document.querySelectorAll(".hero-indicator-dot");
  const heroContainer = document.getElementById("home");

  const heroKicker = document.getElementById("hero-kicker");
  const heroKickerText = document.getElementById("hero-kicker-text");
  const heroTitle = document.getElementById("hero-title");
  const heroDesc = document.getElementById("hero-desc");
  const heroRibbon = document.getElementById("hero-ribbon");
  const heroRibbonText = document.getElementById("hero-ribbon-text");

  let currentHeroIndex = 0;
  let heroTimer = null;
  const HERO_SLIDE_DURATION = 5000;

  function showHeroSlide(index, direction = "next") {
    if (!heroSlides.length) return;
    const nextIdx = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, i) => {
      const isTarget = i === nextIdx;
      if (isTarget) {
        slide.classList.add("active");
        slide.style.opacity = "1";
        slide.style.pointerEvents = "auto";
        slide.style.zIndex = "10";
      } else {
        slide.classList.remove("active");
        slide.style.opacity = "0";
        slide.style.pointerEvents = "none";
        slide.style.zIndex = "0";
      }
    });

    // Update Minimal Dot Indicators
    heroDots.forEach((dot, i) => {
      const isTarget = i === nextIdx;
      dot.classList.toggle("active", isTarget);
      dot.setAttribute("aria-selected", isTarget ? "true" : "false");
      const dotInner = dot.querySelector(".dot-inner");
      if (dotInner) {
        if (isTarget) {
          dotInner.className = "dot-inner block w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-secondary-fixed ring-2 ring-secondary-fixed/50 scale-125 transition-all duration-300";
        } else {
          dotInner.className = "dot-inner block w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300";
        }
      }
    });

    // Dynamic Text Synchronization
    const targetSlide = heroSlides[nextIdx];
    if (targetSlide) {
      const kicker = targetSlide.getAttribute("data-kicker") || "Mahatma Alumni Association";
      const title = targetSlide.getAttribute("data-title") || "One School. Many Generations. <br /><span class='text-secondary-fixed italic font-normal'>Forever Connected.</span>";
      const desc = targetSlide.getAttribute("data-desc") || "From classrooms and corridors to cities and countries around the world, Mahatmites remain connected through shared memories, lifelong friendships, and a shared journey.";
      const ribbon = targetSlide.getAttribute("data-ribbon") || "Same Roots. Brighter Tomorrows.";

      if (typeof gsap !== "undefined") {
        gsap.killTweensOf([heroKicker, heroTitle, heroDesc, heroRibbon]);
        gsap.timeline()
          .to([heroKicker, heroTitle, heroDesc], {
            opacity: 0,
            y: direction === "next" ? -8 : 8,
            duration: 0.18,
            ease: "power2.in",
            onComplete: () => {
              if (heroKickerText) heroKickerText.textContent = kicker;
              if (heroTitle) heroTitle.innerHTML = title;
              if (heroDesc) heroDesc.textContent = desc;
              if (heroRibbonText) heroRibbonText.textContent = ribbon;
            },
          })
          .to([heroKicker, heroTitle, heroDesc], {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.05,
            clearProps: "opacity,transform",
          });
      } else {
        if (heroKickerText) heroKickerText.textContent = kicker;
        if (heroTitle) {
          heroTitle.innerHTML = title;
          heroTitle.style.opacity = "1";
        }
        if (heroDesc) {
          heroDesc.textContent = desc;
          heroDesc.style.opacity = "1";
        }
        if (heroRibbonText) {
          heroRibbonText.textContent = ribbon;
        }
        if (heroKicker) heroKicker.style.opacity = "1";
      }
    }

    currentHeroIndex = nextIdx;
    startHeroTimer();
  }

  function startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      showHeroSlide(currentHeroIndex + 1, "next");
    }, HERO_SLIDE_DURATION);
  }

  // Handle tab visibility change to prevent stuck animations or timer desync when backgrounded
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      if (heroTitle) heroTitle.style.opacity = "1";
      if (heroDesc) heroDesc.style.opacity = "1";
      if (heroKicker) heroKicker.style.opacity = "1";
      startHeroTimer();
    } else {
      clearInterval(heroTimer);
    }
  });

  if (heroSlides.length > 1) {
    heroDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const targetIndex = parseInt(dot.getAttribute("data-slide-to"), 10);
        if (!isNaN(targetIndex) && targetIndex !== currentHeroIndex) {
          showHeroSlide(targetIndex, targetIndex > currentHeroIndex ? "next" : "prev");
        }
      });
    });

    if (heroContainer) {
      // Touch Swipe Gestures for Mobile
      let touchStartX = 0;
      let touchStartY = 0;
      heroContainer.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches && e.touches[0]) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        },
        { passive: true },
      );

      heroContainer.addEventListener(
        "touchend",
        (e) => {
          if (e.changedTouches && e.changedTouches[0]) {
            const diffX = e.changedTouches[0].clientX - touchStartX;
            const diffY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
              if (diffX < 0) {
                showHeroSlide(currentHeroIndex + 1, "next");
              } else {
                showHeroSlide(currentHeroIndex - 1, "prev");
              }
            }
          }
        },
        { passive: true },
      );
    }

    // Start continuous carousel auto-advance
    startHeroTimer();
  }


  // ==========================================
  // MODAL CONTROLLER (APP DOWNLOAD)
  // ==========================================
  const appModal = document.getElementById("app-modal");
  const openAppBtns = document.querySelectorAll(".open-app-modal-btn");
  const closeBtns = document.querySelectorAll(".close-modal-btn");

  function openModal(modal) {
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    }
  }

  openAppBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(appModal);
    });
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeModal(appModal);
    });
  });

  // Close modal when clicking outside of the card
  if (appModal) {
    appModal.addEventListener("click", (e) => {
      if (e.target === appModal) {
        closeModal(appModal);
      }
    });
  }

  // Close modal with ESC key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(appModal);
    }
  });

  // Expandable Leadership Drawer logic with smooth slide
  const councilBtn = document.getElementById("toggle-council-btn");
  const councilDrawer = document.getElementById("council-drawer");
  const councilChevron = document.getElementById("council-chevron");

  if (councilBtn && councilDrawer && councilChevron) {
    councilBtn.addEventListener("click", () => {
      const isHidden = councilDrawer.classList.contains("hidden");
      if (isHidden) {
        councilDrawer.classList.remove("hidden");
        councilDrawer.classList.add("grid");
        councilChevron.classList.add("rotate-180");
        if (typeof gsap !== "undefined") {
          gsap.fromTo(
            councilDrawer.children,
            { opacity: 0, y: -15 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.4,
              ease: "power2.out",
            },
          );
        }
      } else {
        councilDrawer.classList.add("hidden");
        councilDrawer.classList.remove("grid");
        councilChevron.classList.remove("rotate-180");
      }
    });
  }

  // Desktop Nav Dropdown Interaction (Click / Touch & Outside Click)
  const navDropdowns = document.querySelectorAll(".nav-dropdown");
  navDropdowns.forEach((dropdown) => {
    const btn = dropdown.querySelector(".nav-dropdown-btn");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isActive = dropdown.classList.contains("active");
        navDropdowns.forEach((d) => d.classList.remove("active"));
        if (!isActive) {
          dropdown.classList.add("active");
        }
      });
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-dropdown")) {
      navDropdowns.forEach((d) => d.classList.remove("active"));
    }
  });

  // Smooth-scroll click handlers for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").substring(1);
      if (!targetId) return;
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetElement, { offset: -88, duration: 1.2 });
        } else {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }

        // Close any active nav dropdowns
        navDropdowns.forEach((d) => d.classList.remove("active"));

        // Close mobile menu if open
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
          mobileMenu.classList.add("hidden");
        }
      }
    });
  });

  // Mobile Navigation Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      if (
        !mobileMenu.classList.contains("hidden") &&
        typeof gsap !== "undefined"
      ) {
        gsap.fromTo(
          mobileMenu.children,
          { opacity: 0, y: -10 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.3,
            ease: "power2.out",
          },
        );
      }
    });
  }

  // Contact Form Submission Feedback
  const contactForm = document.getElementById("alumni-contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const feedback = document.getElementById("form-feedback");
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (feedback) {
        feedback.classList.remove("hidden");
      }
      if (submitBtn) {
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Dispatch Sent Successfully!</span><span class="material-symbols-outlined text-base text-secondary-fixed">check_circle</span>`;
        submitBtn.disabled = true;
        setTimeout(() => {
          submitBtn.innerHTML = originalContent;
          submitBtn.disabled = false;
          if (feedback) feedback.classList.add("hidden");
          contactForm.reset();
        }, 4000);
      }
    });
  }

  // ==========================================
  // JOURNEY TIMELINE HORIZONTAL SCROLL & PROGRESS BAR CONTROLLER
  // ==========================================
  const journeyContainer = document.getElementById("journey-scroll-container");
  const journeyPrevBtn = document.getElementById("journey-prev-btn");
  const journeyNextBtn = document.getElementById("journey-next-btn");
  const journeyProgressTrack = document.getElementById("journey-progress-track");
  const journeyProgressFill = document.getElementById("journey-progress-fill");

  if (journeyContainer) {
    function updateProgressBar() {
      const maxScroll = journeyContainer.scrollWidth - journeyContainer.clientWidth;
      if (maxScroll > 0 && journeyProgressFill) {
        const percent = Math.min(100, Math.max(0, (journeyContainer.scrollLeft / maxScroll) * 100));
        journeyProgressFill.style.width = `${percent}%`;
        if (journeyProgressTrack) {
          journeyProgressTrack.setAttribute("aria-valuenow", Math.round(percent));
        }
      }
    }

    journeyContainer.addEventListener("scroll", updateProgressBar, { passive: true });
    window.addEventListener("resize", updateProgressBar);
    // Initial sync
    setTimeout(updateProgressBar, 50);

    // Interactive scrubbing/clicking on the progress bar track
    if (journeyProgressTrack) {
      let isSeeking = false;

      function seekToPosition(e) {
        const rect = journeyProgressTrack.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = clickX / rect.width;
        const maxScroll = journeyContainer.scrollWidth - journeyContainer.clientWidth;
        if (maxScroll > 0) {
          journeyContainer.scrollTo({
            left: percentage * maxScroll,
            behavior: isSeeking ? "auto" : "smooth"
          });
        }
      }

      journeyProgressTrack.addEventListener("click", (e) => {
        seekToPosition(e);
      });

      journeyProgressTrack.addEventListener("mousedown", (e) => {
        isSeeking = true;
        seekToPosition(e);
        const onMouseMove = (moveEvent) => {
          if (isSeeking) seekToPosition(moveEvent);
        };
        const onMouseUp = () => {
          isSeeking = false;
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      });
    }

    const scrollStep = 280;
    if (journeyPrevBtn) {
      journeyPrevBtn.addEventListener("click", () => {
        journeyContainer.scrollBy({ left: -scrollStep, behavior: "smooth" });
      });
    }

    if (journeyNextBtn) {
      journeyNextBtn.addEventListener("click", () => {
        journeyContainer.scrollBy({ left: scrollStep, behavior: "smooth" });
      });
    }

    // Mouse drag-to-scroll interaction
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    journeyContainer.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - journeyContainer.offsetLeft;
      scrollLeft = journeyContainer.scrollLeft;
    });

    journeyContainer.addEventListener("mouseleave", () => {
      isDown = false;
    });

    journeyContainer.addEventListener("mouseup", () => {
      isDown = false;
    });

    journeyContainer.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - journeyContainer.offsetLeft;
      const walk = (x - startX) * 1.5;
      journeyContainer.scrollLeft = scrollLeft - walk;
    });
  }

  // ==========================================
  // CUSTOM SELECT DROPDOWNS CONTROLLER
  // ==========================================
  const customSelectWrappers = document.querySelectorAll(".custom-select-wrapper");

  customSelectWrappers.forEach((wrapper) => {
    const trigger = wrapper.querySelector(".custom-select-trigger");
    const optionsList = wrapper.querySelector(".custom-select-options");
    const options = wrapper.querySelectorAll(".custom-option");
    const selectedText = wrapper.querySelector(".selected-text");
    const selectedIcon = wrapper.querySelector(".selected-icon");
    const parentContainer = wrapper.closest(".flex.flex-col") || wrapper.parentElement;
    const nativeSelect = parentContainer ? parentContainer.querySelector("select") : null;

    if (!trigger || !optionsList) return;

    const closeDropdown = () => {
      wrapper.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    };

    const openDropdown = () => {
      // Close other open custom dropdowns first
      customSelectWrappers.forEach((other) => {
        if (other !== wrapper) {
          other.classList.remove("open");
          const otherTrigger = other.querySelector(".custom-select-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        }
      });
      wrapper.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    };

    const toggleDropdown = () => {
      const isOpen = wrapper.classList.contains("open");
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    };

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    options.forEach((opt, index) => {
      opt.setAttribute("tabindex", "0");

      const selectOption = () => {
        const value = opt.getAttribute("data-value");
        const icon = opt.getAttribute("data-icon") || "event";
        const labelEl = opt.querySelector(".truncate:not(.flex)");
        const labelText = labelEl ? labelEl.textContent.trim() : opt.innerText.trim();

        // Update selected state across options
        options.forEach((o) => {
          o.classList.remove("selected");
          o.setAttribute("aria-selected", "false");
          const check = o.querySelector(".check-icon");
          if (check) check.classList.add("hidden");
        });

        opt.classList.add("selected");
        opt.setAttribute("aria-selected", "true");
        const optCheck = opt.querySelector(".check-icon");
        if (optCheck) optCheck.classList.remove("hidden");

        // Update trigger display
        if (selectedText) selectedText.textContent = labelText;
        if (selectedIcon) selectedIcon.textContent = icon;

        // Sync with underlying native select
        if (nativeSelect) {
          nativeSelect.value = value;
          nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }

        closeDropdown();
        trigger.focus();
      };

      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        selectOption();
      });

      opt.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextOpt = options[index + 1] || options[0];
          if (nextOpt) nextOpt.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevOpt = options[index - 1] || options[options.length - 1];
          if (prevOpt) prevOpt.focus();
        } else if (e.key === "Escape") {
          closeDropdown();
          trigger.focus();
        }
      });
    });

    // Keyboard navigation on trigger button
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        if (!wrapper.classList.contains("open")) {
          openDropdown();
          const activeOpt = wrapper.querySelector(".custom-option.selected") || options[0];
          if (activeOpt) activeOpt.focus();
        }
      } else if (e.key === "Escape") {
        closeDropdown();
      }
    });

    // Form reset synchronization
    const form = wrapper.closest("form");
    if (form) {
      form.addEventListener("reset", () => {
        setTimeout(() => {
          const firstOption = options[0];
          if (firstOption) {
            const firstValue = firstOption.getAttribute("data-value");
            const firstIcon = firstOption.getAttribute("data-icon") || "event";
            const labelEl = firstOption.querySelector(".truncate:not(.flex)");
            const firstLabel = labelEl ? labelEl.textContent.trim() : firstOption.innerText.trim();

            options.forEach((o) => {
              o.classList.remove("selected");
              o.setAttribute("aria-selected", "false");
              const check = o.querySelector(".check-icon");
              if (check) check.classList.add("hidden");
            });

            firstOption.classList.add("selected");
            firstOption.setAttribute("aria-selected", "true");
            const firstCheck = firstOption.querySelector(".check-icon");
            if (firstCheck) firstCheck.classList.remove("hidden");

            if (selectedText) selectedText.textContent = firstLabel;
            if (selectedIcon) selectedIcon.textContent = firstIcon;
          }
        }, 10);
      });
    }
  });

  // Global click outside to close any open custom select dropdown
  document.addEventListener("click", (e) => {
    customSelectWrappers.forEach((wrapper) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove("open");
        const trigger = wrapper.querySelector(".custom-select-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });
  });
});

