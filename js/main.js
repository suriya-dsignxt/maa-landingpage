document.addEventListener("DOMContentLoaded", () => {
  // School bus preloader: keep the entrance smooth without delaying slow pages forever.
  const pagePreloader = document.getElementById("page-preloader");
  const preloaderStartedAt = performance.now();
  let preloaderDismissed = false;

  const dismissPagePreloader = () => {
    if (!pagePreloader || preloaderDismissed) return;
    preloaderDismissed = true;
    const minimumDisplayTime = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 150
      : 900;
    const remainingTime = Math.max(0, minimumDisplayTime - (performance.now() - preloaderStartedAt));

    window.setTimeout(() => {
      pagePreloader.classList.add("is-leaving");
      document.body.classList.remove("is-preloading");

      const removePreloader = () => {
        if (pagePreloader.isConnected) pagePreloader.remove();
      };
      pagePreloader.addEventListener("transitionend", removePreloader, { once: true });
      window.setTimeout(removePreloader, 900);
    }, remainingTime);
  };

  if (document.readyState === "complete") {
    dismissPagePreloader();
  } else {
    window.addEventListener("load", dismissPagePreloader, { once: true });
  }
  window.setTimeout(dismissPagePreloader, 4500);

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

  // Liquid glass navigation: full-width at the top, floating island on scroll.
  const liquidHeader = document.getElementById("header-nav");
  const updateLiquidHeader = (scrollValue) => {
    if (!liquidHeader) return;
    const currentScroll =
      typeof scrollValue === "number" ? scrollValue : window.scrollY;
    liquidHeader.classList.toggle("is-dynamic-island", currentScroll > 40);
  };

  if (liquidHeader) {
    if (lenis) {
      lenis.on("scroll", ({ scroll }) => updateLiquidHeader(scroll));
    } else {
      window.addEventListener(
        "scroll",
        () => updateLiquidHeader(window.scrollY),
        { passive: true },
      );
    }
    updateLiquidHeader(window.scrollY);
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

    // 6. Pillars of Engagement: pinned desktop sequence + mobile reveal
    const pillarsSection = document.getElementById("pillars");
    const pillarsIntro = pillarsSection?.querySelector(".pillars-intro");
    const pillarGrid = pillarsSection?.querySelector(".pillars-card-grid");
    const pillarMotionCards = pillarsSection
      ? gsap.utils.toArray(".pillar-card-motion", pillarsSection)
      : [];
    const pillarCards = pillarsSection
      ? gsap.utils.toArray(".gsap-pillar-card", pillarsSection)
      : [];

    if (
      pillarsSection &&
      pillarsIntro &&
      pillarGrid &&
      pillarMotionCards.length
    ) {
      const pillarMedia = gsap.matchMedia();

      pillarMedia.add(
        {
          desktop: "(min-width: 1024px)",
          motionAllowed: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { desktop, motionAllowed } = context.conditions;

          if (!motionAllowed) {
            gsap.set([pillarsIntro, pillarMotionCards, pillarCards], {
              clearProps: "all",
            });
            return;
          }

          if (desktop) {
            const pillarIcons = pillarCards
              .map((card) => card.querySelector(".material-symbols-outlined"))
              .filter(Boolean);

            const pillarTimeline = gsap.timeline({
              scrollTrigger: {
                id: "pillars-pin-sequence",
                trigger: pillarsSection,
                start: "top top",
                end: () =>
                  `+=${Math.max(
                    window.innerHeight * 1.65,
                    pillarMotionCards.length * 210,
                  )}`,
                pin: true,
                pinSpacing: true,
                scrub: 0.85,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });

            pillarTimeline
              .fromTo(
                pillarMotionCards,
                {
                  y: 110,
                  autoAlpha: 0,
                  scale: 0.9,
                  rotationX: 8,
                },
                {
                  y: 0,
                  autoAlpha: 1,
                  scale: 1,
                  rotationX: 0,
                  duration: 1.15,
                  stagger: 0.42,
                  ease: "power2.out",
                },
              )
              .fromTo(
                pillarIcons,
                { scale: 0.55, rotation: -12 },
                {
                  scale: 1,
                  rotation: 0,
                  duration: 0.55,
                  stagger: 0.42,
                  ease: "back.out(1.7)",
                },
                0.28,
              )
              .to(
                pillarsIntro,
                {
                  y: -14,
                  scale: 0.985,
                  duration: 1.2,
                  ease: "none",
                },
                0,
              )
              .to({}, { duration: 0.55 });

            return () => pillarTimeline.scrollTrigger?.kill();
          }

          gsap.fromTo(
            pillarMotionCards,
            { y: 42, autoAlpha: 0, scale: 0.96 },
            {
              scrollTrigger: {
                trigger: pillarGrid,
                start: "top 88%",
                toggleActions: "play none none none",
                once: true,
              },
              y: 0,
              autoAlpha: 1,
              scale: 1,
              stagger: 0.1,
              duration: 0.72,
              ease: "power3.out",
              clearProps: "transform,opacity,visibility",
            },
          );
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

    // 9. Global Chapters Carousel Reveal & Batch Filtering
    const chapterCards = document.querySelectorAll(".gsap-chapter-card");
    const chapterCarouselShell = document.querySelector(".gsap-chapter-carousel");
    if (chapterCarouselShell) {
      gsap.fromTo(
        chapterCarouselShell,
        { y: 35, opacity: 0 },
        {
          scrollTrigger: {
            trigger: chapterCarouselShell,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
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

        if (chapterCarouselShell) {
          gsap.fromTo(
            chapterCarouselShell,
            { opacity: 0.65 },
            {
              opacity: 1,
              duration: 0.35,
              ease: "power2.out",
              clearProps: "opacity",
            },
          );
        }
      });
    });

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

    // 13. Restrained editorial interactions across selected sections
    const elegantMotion = gsap.matchMedia();
    elegantMotion.add(
      {
        motionAllowed: "(prefers-reduced-motion: no-preference)",
        finePointer: "(hover: hover) and (pointer: fine)",
        wideScreen: "(min-width: 768px)",
      },
      (context) => {
        const { motionAllowed, finePointer, wideScreen } = context.conditions;
        if (!motionAllowed) return;

        const interactionCleanups = [];

        // Draw the existing gold rules instead of adding decorative clutter.
        const headingAccentLines = gsap.utils
          .toArray(".gsap-reveal-title, .gsap-social-hero")
          .map((block) =>
            Array.from(block.querySelectorAll("span")).find(
              (span) =>
                typeof span.className === "string" &&
                span.className.includes("h-[1.5px]"),
            ),
          )
          .filter(Boolean);

        headingAccentLines.forEach((line) => {
          gsap.fromTo(
            line,
            { scaleX: 0.08, opacity: 0.3, transformOrigin: "left center" },
            {
              scrollTrigger: {
                trigger: line.parentElement,
                start: "top 88%",
                once: true,
              },
              scaleX: 1,
              opacity: 1,
              duration: 0.85,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
          );
        });

        // Slow image drift adds depth without moving the foreground copy.
        const socialHeroImage = document.querySelector(
          "#social-impact > div:first-child > img",
        );
        if (socialHeroImage && wideScreen) {
          gsap.fromTo(
            socialHeroImage,
            { yPercent: -2, scale: 1.045 },
            {
              yPercent: 3,
              scale: 1.085,
              ease: "none",
              scrollTrigger: {
                trigger: socialHeroImage.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1,
              },
            },
          );
        }

        // A masked reveal gives the final CTA a polished chapter-ending beat.
        const finalCtaBanner = document.querySelector(
          "#contact > div > div:first-child",
        );
        if (finalCtaBanner) {
          gsap.fromTo(
            finalCtaBanner,
            {
              y: 26,
              autoAlpha: 0.55,
              clipPath: "inset(0 7% 0 7% round 24px)",
            },
            {
              scrollTrigger: {
                trigger: finalCtaBanner,
                start: "top 86%",
                once: true,
              },
              y: 0,
              autoAlpha: 1,
              clipPath: "inset(0 0% 0 0% round 24px)",
              duration: 1,
              ease: "power3.out",
              clearProps: "transform,opacity,visibility,clipPath",
            },
          );
        }

        if (finePointer) {
          // Soft cursor-following light on a limited set of information cards.
          const spotlightTargets = Array.from(
            document.querySelectorAll(
              "#alumni-app .gsap-app-feature, #council .gsap-tier-card",
            ),
          );
          spotlightTargets.forEach((target) => {
            target.classList.add("interactive-spotlight");

            const moveSpotlight = (event) => {
              const rect = target.getBoundingClientRect();
              target.style.setProperty(
                "--spotlight-x",
                `${event.clientX - rect.left}px`,
              );
              target.style.setProperty(
                "--spotlight-y",
                `${event.clientY - rect.top}px`,
              );
            };
            const showSpotlight = () =>
              target.classList.add("is-spotlight-active");
            const hideSpotlight = () =>
              target.classList.remove("is-spotlight-active");

            target.addEventListener("pointermove", moveSpotlight);
            target.addEventListener("pointerenter", showSpotlight);
            target.addEventListener("pointerleave", hideSpotlight);

            interactionCleanups.push(() => {
              target.removeEventListener("pointermove", moveSpotlight);
              target.removeEventListener("pointerenter", showSpotlight);
              target.removeEventListener("pointerleave", hideSpotlight);
              target.classList.remove(
                "interactive-spotlight",
                "is-spotlight-active",
              );
              target.style.removeProperty("--spotlight-x");
              target.style.removeProperty("--spotlight-y");
            });
          });

          // Keep the magnetic pull deliberately small so CTAs still feel formal.
          const magneticButtons = gsap.utils.toArray("main .btn-shimmer");
          magneticButtons.forEach((button) => {
            button.classList.add("magnetic-interaction");
            const moveX = gsap.quickTo(button, "x", {
              duration: 0.42,
              ease: "power3.out",
            });
            const moveY = gsap.quickTo(button, "y", {
              duration: 0.42,
              ease: "power3.out",
            });

            const moveMagnet = (event) => {
              const rect = button.getBoundingClientRect();
              moveX(((event.clientX - rect.left) / rect.width - 0.5) * 10);
              moveY(((event.clientY - rect.top) / rect.height - 0.5) * 8);
            };
            const resetMagnet = () => {
              moveX(0);
              moveY(0);
            };

            button.addEventListener("pointermove", moveMagnet);
            button.addEventListener("pointerleave", resetMagnet);

            interactionCleanups.push(() => {
              button.removeEventListener("pointermove", moveMagnet);
              button.removeEventListener("pointerleave", resetMagnet);
              button.classList.remove("magnetic-interaction");
              gsap.set(button, { clearProps: "transform" });
            });
          });
        }

        return () => interactionCleanups.forEach((cleanup) => cleanup());
      },
    );

    // 14. Floating Back to Top Button
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
  // GLOBAL CHAPTERS STACKED CARD CAROUSEL
  // ==========================================
  const chapterCarousel = document.getElementById("chapter-carousel");
  const chapterCarouselItems = chapterCarousel
    ? Array.from(chapterCarousel.querySelectorAll(".gsap-chapter-card"))
    : [];
  const chapterPrevButton = document.getElementById("chapter-carousel-prev");
  const chapterNextButton = document.getElementById("chapter-carousel-next");
  const chapterCounter = document.getElementById("chapter-carousel-counter");
  const chapterDots = document.getElementById("chapter-carousel-dots");
  const chapterStatus = document.getElementById("chapter-carousel-status");

  if (chapterCarousel && chapterCarouselItems.length) {
    // Match the supplied interaction's 50% starting progress with a centered deck.
    let activeChapterIndex = Math.floor((chapterCarouselItems.length - 1) / 2);
    const chapterShell = document.querySelector(".chapter-carousel-shell");
    let isCarouselHovered = false;

    if (chapterShell) {
      chapterShell.addEventListener("mouseenter", () => {
        isCarouselHovered = true;
      });
      chapterShell.addEventListener("mouseleave", () => {
        isCarouselHovered = false;
      });
    }

    const chapterNames = chapterCarouselItems.map((item) => {
      const title = item.querySelector(".font-headline-sm");
      return title ? title.textContent.trim() : "Chapter";
    });

    const clampChapterIndex = (index) =>
      Math.max(0, Math.min(index, chapterCarouselItems.length - 1));

    const chapterDotButtons = chapterNames.map((name, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "chapter-carousel-dot";
      dot.setAttribute("aria-label", `Show ${name} chapter`);
      dot.setAttribute("title", name);
      dot.addEventListener("click", () => setActiveChapter(index));
      if (chapterDots) chapterDots.appendChild(dot);
      return dot;
    });

    const renderChapterCarousel = (announce = true) => {
      const viewportWidth = chapterCarousel.clientWidth;
      const isCompact = viewportWidth < 560;
      const cardStep = Math.min(
        isCompact ? 76 : 118,
        Math.max(isCompact ? 54 : 72, viewportWidth * (isCompact ? 0.17 : 0.12)),
      );
      const visibleDistance = isCompact ? 2 : 4;

      chapterCarouselItems.forEach((item, index) => {
        const offset = index - activeChapterIndex;
        const distance = Math.abs(offset);
        const x = offset * cardStep;
        const y = distance * (isCompact ? 9 : 13);
        const rotation = offset * (isCompact ? 2.2 : 3.2);
        const scale = Math.max(0.7, 1 - distance * 0.055);
        const opacity = Math.max(0, 1 - distance * 0.17);
        const isActive = index === activeChapterIndex;

        item.style.setProperty("--chapter-x", `${x}px`);
        item.style.setProperty("--chapter-y", `${y}px`);
        item.style.setProperty("--chapter-rotation", `${rotation}deg`);
        item.style.setProperty("--chapter-scale", scale.toFixed(3));
        item.style.setProperty("--chapter-opacity", opacity.toFixed(3));
        item.style.setProperty("--chapter-z", chapterCarouselItems.length - distance);
        item.classList.toggle("is-active", isActive);
        item.classList.toggle("is-outside", distance > visibleDistance);
        item.setAttribute("role", "group");
        item.setAttribute("aria-roledescription", "slide");
        item.setAttribute(
          "aria-label",
          `${index + 1} of ${chapterCarouselItems.length}: ${chapterNames[index]}`,
        );
        item.setAttribute("aria-hidden", isActive ? "false" : "true");
        item.tabIndex = isActive ? 0 : -1;
      });

      chapterDotButtons.forEach((dot, index) => {
        const isActive = index === activeChapterIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });

      if (chapterPrevButton) chapterPrevButton.disabled = activeChapterIndex === 0;
      if (chapterNextButton) {
        chapterNextButton.disabled =
          activeChapterIndex === chapterCarouselItems.length - 1;
      }
      if (chapterCounter) {
        chapterCounter.textContent = `${String(activeChapterIndex + 1).padStart(2, "0")} / ${String(chapterCarouselItems.length).padStart(2, "0")}`;
      }
      if (announce && chapterStatus) {
        chapterStatus.textContent = `${chapterNames[activeChapterIndex]}, chapter ${activeChapterIndex + 1} of ${chapterCarouselItems.length}`;
      }
    };

    function setActiveChapter(index, announce = true) {
      const nextIndex = clampChapterIndex(index);
      if (nextIndex === activeChapterIndex) return;
      activeChapterIndex = nextIndex;
      renderChapterCarousel(announce);
    }

    chapterCarouselItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        setActiveChapter(index);
      });
    });

    chapterPrevButton?.addEventListener("click", () => {
      setActiveChapter(activeChapterIndex - 1);
    });
    chapterNextButton?.addEventListener("click", () => {
      setActiveChapter(activeChapterIndex + 1);
    });

    // Keyboard arrow keys navigation (when focused or hovered, without blocking forms)
    document.addEventListener("keydown", (event) => {
      if (event.target.closest("input, textarea, select")) {
        return;
      }

      const isFocusInCarousel =
        chapterShell && chapterShell.contains(document.activeElement);

      if (isFocusInCarousel || isCarouselHovered) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setActiveChapter(activeChapterIndex - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          setActiveChapter(activeChapterIndex + 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          setActiveChapter(0);
        } else if (event.key === "End") {
          event.preventDefault();
          setActiveChapter(chapterCarouselItems.length - 1);
        }
      }
    });

    if (typeof ResizeObserver !== "undefined") {
      const chapterResizeObserver = new ResizeObserver(() => {
        renderChapterCarousel(false);
      });
      chapterResizeObserver.observe(chapterCarousel);
    } else {
      window.addEventListener("resize", () => renderChapterCarousel(false));
    }

    renderChapterCarousel(false);
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
          lenis.scrollTo(targetElement, { offset: -128, duration: 1.2 });
        } else {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }

        // Close any active nav dropdowns
        navDropdowns.forEach((d) => d.classList.remove("active"));

        // Close mobile menu if open
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
          mobileMenu.classList.add("hidden");
          liquidHeader?.classList.remove("is-menu-open");
          const mobileMenuButton = document.getElementById("mobile-menu-toggle");
          mobileMenuButton?.setAttribute("aria-expanded", "false");
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
      const isOpen = !mobileMenu.classList.contains("hidden");
      liquidHeader?.classList.toggle("is-menu-open", isOpen);
      mobileMenuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (
        isOpen &&
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

  // Elegant gamification: collect Legacy Journey seals while exploring sections.
  const legacyJourney = document.getElementById("legacy-journey");
  const legacyToggle = document.getElementById("legacy-journey-toggle");
  const legacyPanel = document.getElementById("legacy-journey-panel");
  const legacyClose = document.getElementById("legacy-journey-close");
  const legacyCount = document.getElementById("legacy-journey-count");
  const legacyLabel = document.getElementById("legacy-journey-label");
  const legacyHeading = document.getElementById("legacy-journey-heading");
  const legacyProgressBar = document.getElementById("legacy-journey-progress-bar");
  const legacyComplete = document.getElementById("legacy-journey-complete");
  const legacyStatus = document.getElementById("legacy-journey-status");
  const legacyClaimReward = document.getElementById("legacy-claim-reward");
  const legacyRewardModal = document.getElementById("legacy-reward-modal");
  const legacyRewardClose = document.getElementById("legacy-reward-close");
  const legacyRewardDownload = document.getElementById("legacy-reward-download");
  const legacyRewardContinue = document.getElementById("legacy-reward-continue");
  const legacyRewardDate = document.getElementById("legacy-reward-date");
  const legacyRewardId = document.getElementById("legacy-reward-id");
  const legacyMilestones = Array.from(document.querySelectorAll(".legacy-milestone"));
  const legacyStorageKey = "mahatmaLegacyJourneyV1";
  const legacyRewardSeenKey = "mahatmaLegacyRewardSeenV1";
  const legacyExplorerIdKey = "mahatmaLegacyExplorerIdV1";
  const legacyExplorerDateKey = "mahatmaLegacyExplorerDateV1";

  if (legacyJourney && legacyToggle && legacyPanel && legacyMilestones.length) {
    let collectedSeals = new Set();

    try {
      const savedSeals = JSON.parse(localStorage.getItem(legacyStorageKey) || "[]");
      if (Array.isArray(savedSeals)) {
        collectedSeals = new Set(
          savedSeals.filter((id) => legacyMilestones.some((item) => item.dataset.target === id)),
        );
      }
    } catch (_error) {
      collectedSeals = new Set();
    }

    let legacyRewardSeen = false;
    let explorerId = "";
    let explorerDate = "";

    try {
      legacyRewardSeen = localStorage.getItem(legacyRewardSeenKey) === "1";
      explorerId = localStorage.getItem(legacyExplorerIdKey) || "";
      explorerDate = localStorage.getItem(legacyExplorerDateKey) || "";
    } catch (_error) {
      legacyRewardSeen = false;
    }

    const createExplorerId = () => {
      const year = new Date().getFullYear();
      const token = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "X");
      return `MAA-${year}-${token}`;
    };

    const ensureExplorerDetails = () => {
      if (!explorerId) explorerId = createExplorerId();
      if (!explorerDate) {
        explorerDate = new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date());
      }

      try {
        localStorage.setItem(legacyExplorerIdKey, explorerId);
        localStorage.setItem(legacyExplorerDateKey, explorerDate);
      } catch (_error) {
        // The keepsake remains available for this visit when storage is unavailable.
      }

      if (legacyRewardId) legacyRewardId.textContent = explorerId;
      if (legacyRewardDate) legacyRewardDate.textContent = explorerDate;
    };

    const setLegacyPanelOpen = (isOpen) => {
      legacyJourney.classList.toggle("is-open", isOpen);
      legacyToggle.setAttribute("aria-expanded", String(isOpen));
      legacyPanel.setAttribute("aria-hidden", String(!isOpen));
      if (isOpen) {
        const firstUncollected = legacyMilestones.find(
          (item) => !collectedSeals.has(item.dataset.target),
        );
        (firstUncollected || legacyClose || legacyMilestones[0]).focus();
      }
    };

    const setLegacyRewardOpen = (isOpen) => {
      if (!legacyRewardModal) return;
      if (isOpen) {
        ensureExplorerDetails();
        setLegacyPanelOpen(false);
      }
      legacyRewardModal.classList.toggle("is-active", isOpen);
      legacyRewardModal.setAttribute("aria-hidden", String(!isOpen));
      document.body.classList.toggle("legacy-reward-open", isOpen);

      if (window.lenis) {
        if (isOpen && typeof window.lenis.stop === "function") window.lenis.stop();
        if (!isOpen && typeof window.lenis.start === "function") window.lenis.start();
      }

      if (isOpen && legacyRewardClose) {
        window.requestAnimationFrame(() => legacyRewardClose.focus());
      }
    };

    const escapeSvgText = (value) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    const loadCrestDataUrl = async () => {
      try {
        const response = await fetch("assets/images/mahatma_alumni_logo.png");
        if (!response.ok) throw new Error("Unable to load association crest");
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (_error) {
        return "";
      }
    };

    const downloadLegacyKeepsake = async () => {
      ensureExplorerDetails();
      const crestDataUrl = await loadCrestDataUrl();
      const safeId = escapeSvgText(explorerId);
      const safeDate = escapeSvgText(explorerDate);
      const crestMarkup = crestDataUrl
        ? `<image href="${crestDataUrl}" x="720" y="92" width="160" height="160" preserveAspectRatio="xMidYMid meet" />`
        : `<circle cx="800" cy="172" r="70" fill="#02203c" stroke="#fbcb62" stroke-width="8"/><text x="800" y="191" text-anchor="middle" font-family="Georgia,serif" font-size="54" font-weight="700" fill="#fbcb62">M</text>`;

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
          <defs>
            <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#fffdf7"/>
              <stop offset="0.52" stop-color="#f4ead5"/>
              <stop offset="1" stop-color="#fffaf0"/>
            </linearGradient>
            <radialGradient id="glow">
              <stop offset="0" stop-color="#fbcb62" stop-opacity="0.22"/>
              <stop offset="1" stop-color="#fbcb62" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="1600" height="1000" rx="28" fill="url(#paper)"/>
          <circle cx="800" cy="430" r="390" fill="url(#glow)"/>
          <rect x="30" y="30" width="1540" height="940" rx="20" fill="none" stroke="#856209" stroke-width="3"/>
          <rect x="48" y="48" width="1504" height="904" rx="14" fill="none" stroke="#856209" stroke-opacity="0.35" stroke-width="2"/>
          ${crestMarkup}
          <text x="800" y="285" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="5" fill="#856209">MAHATMA ALUMNI ASSOCIATION</text>
          <text x="800" y="350" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="6" fill="#856209">DIGITAL COMMEMORATIVE KEEPSAKE</text>
          <text x="800" y="475" text-anchor="middle" font-family="Georgia,serif" font-size="92" fill="#02203c">Legacy Explorer</text>
          <line x1="490" y1="510" x2="1110" y2="510" stroke="#856209" stroke-opacity="0.35" stroke-width="2"/>
          <text x="800" y="570" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" fill="#405469">Awarded for completing the five-seal journey through our shared</text>
          <text x="800" y="608" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" fill="#405469">heritage, community, digital network, and social impact.</text>
          <g transform="translate(590 670)" fill="#fbcb62" stroke="#856209" stroke-width="2">
            <circle cx="0" cy="0" r="30"/><circle cx="105" cy="0" r="30"/><circle cx="210" cy="0" r="30"/><circle cx="315" cy="0" r="30"/><circle cx="420" cy="0" r="30"/>
          </g>
          <g font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#02203c" text-anchor="middle">
            <text x="590" y="678">1</text><text x="695" y="678">2</text><text x="800" y="678">3</text><text x="905" y="678">4</text><text x="1010" y="678">5</text>
          </g>
          <line x1="180" y1="810" x2="1420" y2="810" stroke="#856209" stroke-opacity="0.3" stroke-width="2"/>
          <text x="180" y="855" font-family="Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="3" fill="#856209">COMPLETED</text>
          <text x="180" y="890" font-family="Arial,sans-serif" font-size="23" font-weight="700" fill="#02203c">${safeDate}</text>
          <text x="800" y="880" text-anchor="middle" font-family="Georgia,serif" font-size="21" font-style="italic" fill="#856209">Connect • Contribute • Celebrate</text>
          <text x="1420" y="855" text-anchor="end" font-family="Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="3" fill="#856209">EXPLORER ID</text>
          <text x="1420" y="890" text-anchor="end" font-family="Arial,sans-serif" font-size="23" font-weight="700" fill="#02203c">${safeId}</text>
        </svg>`;

      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "Mahatma-Legacy-Explorer-Keepsake.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const updateLegacyJourney = () => {
      const total = legacyMilestones.length;
      const collected = collectedSeals.size;
      const percent = Math.round((collected / total) * 100);
      const isComplete = collected === total;

      legacyJourney.style.setProperty("--journey-progress", `${percent * 3.6}deg`);
      if (legacyProgressBar) legacyProgressBar.style.width = `${percent}%`;
      if (legacyCount) legacyCount.textContent = `${collected} of ${total} seals`;
      if (legacyLabel) legacyLabel.textContent = isComplete ? "Legacy Explorer" : "Legacy Journey";
      if (legacyHeading) legacyHeading.textContent = isComplete ? "Journey Complete" : "Legacy Journey";
      if (legacyComplete) legacyComplete.hidden = !isComplete;

      if (isComplete) {
        ensureExplorerDetails();
        if (!legacyRewardSeen && legacyRewardModal) {
          legacyRewardSeen = true;
          try {
            localStorage.setItem(legacyRewardSeenKey, "1");
          } catch (_error) {
            // The automatic unlock still works for this visit.
          }
          window.setTimeout(() => setLegacyRewardOpen(true), 700);
        }
      }

      legacyMilestones.forEach((milestone) => {
        const isUnlocked = collectedSeals.has(milestone.dataset.target);
        milestone.classList.toggle("is-unlocked", isUnlocked);
        const status = milestone.querySelector(".legacy-milestone__status");
        if (status) status.textContent = isUnlocked ? "Collected" : "Not visited";
        milestone.setAttribute(
          "aria-label",
          `${milestone.querySelector("strong")?.textContent || "Milestone"}: ${isUnlocked ? "seal collected" : "not yet visited"}`,
        );
      });
    };

    const collectLegacySeal = (targetId, announce = true) => {
      if (!targetId || collectedSeals.has(targetId)) return;
      const milestone = legacyMilestones.find((item) => item.dataset.target === targetId);
      if (!milestone) return;

      collectedSeals.add(targetId);
      try {
        localStorage.setItem(legacyStorageKey, JSON.stringify(Array.from(collectedSeals)));
      } catch (_error) {
        // Progress still works for this visit when storage is unavailable.
      }

      updateLegacyJourney();
      milestone.classList.add("is-unlocking");
      legacyJourney.classList.add("has-new-seal");
      window.setTimeout(() => {
        milestone.classList.remove("is-unlocking");
        legacyJourney.classList.remove("has-new-seal");
      }, 750);

      if (announce && legacyStatus) {
        const title = milestone.querySelector("strong")?.textContent || "Legacy milestone";
        const rewardMessage = collectedSeals.size === legacyMilestones.length
          ? " Your Legacy Explorer keepsake is now unlocked."
          : "";
        legacyStatus.textContent = `Seal collected: ${title}. ${collectedSeals.size} of ${legacyMilestones.length} complete.${rewardMessage}`;
      }
    };

    legacyToggle.addEventListener("click", () => {
      setLegacyPanelOpen(!legacyJourney.classList.contains("is-open"));
    });

    if (legacyClose) {
      legacyClose.addEventListener("click", () => {
        setLegacyPanelOpen(false);
        legacyToggle.focus();
      });
    }

    if (legacyClaimReward) {
      legacyClaimReward.addEventListener("click", () => setLegacyRewardOpen(true));
    }

    if (legacyRewardClose) {
      legacyRewardClose.addEventListener("click", () => setLegacyRewardOpen(false));
    }

    if (legacyRewardModal) {
      legacyRewardModal.addEventListener("click", (event) => {
        if (event.target === legacyRewardModal) setLegacyRewardOpen(false);
      });
    }

    if (legacyRewardDownload) {
      legacyRewardDownload.addEventListener("click", async () => {
        const label = legacyRewardDownload.querySelector("span:last-child");
        const originalLabel = label?.textContent || "Download keepsake";
        if (label) label.textContent = "Preparing keepsake…";
        legacyRewardDownload.disabled = true;
        await downloadLegacyKeepsake();
        legacyRewardDownload.disabled = false;
        if (label) label.textContent = originalLabel;
      });
    }

    if (legacyRewardContinue) {
      legacyRewardContinue.addEventListener("click", () => {
        const getInvolvedSection = document.getElementById("get-involved");
        setLegacyRewardOpen(false);
        if (!getInvolvedSection) return;
        if (window.lenis && typeof window.lenis.scrollTo === "function") {
          window.lenis.scrollTo(getInvolvedSection, { offset: -100, duration: 1.15 });
        } else {
          getInvolvedSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    legacyMilestones.forEach((milestone) => {
      milestone.addEventListener("click", () => {
        const targetId = milestone.dataset.target;
        const target = document.getElementById(targetId);
        if (!target) return;

        setLegacyPanelOpen(false);
        if (window.lenis && typeof window.lenis.scrollTo === "function") {
          window.lenis.scrollTo(target, { offset: -100, duration: 1.15 });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (legacyJourney.classList.contains("is-open") && !legacyJourney.contains(event.target)) {
        setLegacyPanelOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && legacyRewardModal?.classList.contains("is-active")) {
        setLegacyRewardOpen(false);
        legacyClaimReward?.focus();
        return;
      }
      if (event.key === "Escape" && legacyJourney.classList.contains("is-open")) {
        setLegacyPanelOpen(false);
        legacyToggle.focus();
      }
    });

    if ("IntersectionObserver" in window) {
      const milestoneObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) collectLegacySeal(entry.target.id);
          });
        },
        { rootMargin: "-28% 0px -42% 0px", threshold: 0.05 },
      );

      legacyMilestones.forEach((milestone) => {
        const section = document.getElementById(milestone.dataset.target);
        if (section) milestoneObserver.observe(section);
      });
    } else {
      collectLegacySeal("home", false);
    }

    updateLegacyJourney();
  }
});

