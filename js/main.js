document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP Plugins if available
  if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Scroll Progress Indicator in Header
    const progressBar = document.getElementById("scroll-progress");
    if (progressBar) {
      window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
      });
    }

    // 2. Hero Entrance Animation
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .from("#header-nav", {
        y: -30,
        opacity: 0,
        duration: 0.8,
      })
      .from(
        "#hero-kicker",
        {
          x: -30,
          opacity: 0,
          duration: 0.7,
        },
        "-=0.4",
      )
      .from(
        "#hero-title",
        {
          y: 40,
          opacity: 0,
          duration: 0.9,
        },
        "-=0.5",
      )
      .from(
        "#hero-desc",
        {
          y: 25,
          opacity: 0,
          duration: 0.8,
        },
        "-=0.6",
      )
      .from(
        "#hero-cta a",
        {
          y: 20,
          opacity: 0,
          stagger: 0.15,
          duration: 0.6,
        },
        "-=0.5",
      )
      .from(
        "#hero-ribbon",
        {
          scale: 0.85,
          opacity: 0,
          rotation: 5,
          duration: 1,
          ease: "elastic.out(1, 0.6)",
        },
        "-=0.7",
      );

    // Hero background subtle parallax on scroll
    const heroBg = document.getElementById("hero-bg-img");
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 20,
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

        // Subtle animation on chapter cards upon filter change
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

    // 10. Testimonials / Alumni Voices Cards
    const testCards = document.querySelectorAll(".gsap-testimonial-card");
    if (testCards.length) {
      gsap.fromTo(
        testCards,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: testCards[0].parentElement,
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

    // 11. Get Involved Action Cards
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

    // 12. Floating Back to Top Button
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 450) {
          gsap.to(backToTopBtn, {
            opacity: 1,
            pointerEvents: "auto",
            scale: 1,
            duration: 0.3,
          });
        } else {
          gsap.to(backToTopBtn, {
            opacity: 0,
            pointerEvents: "none",
            scale: 0.8,
            duration: 0.3,
          });
        }
      });

      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Recalculate ScrollTrigger offsets once images and fonts settle
    window.addEventListener("load", () => {
      ScrollTrigger.refresh();
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  }

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

  // Smooth-scroll click handlers for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").substring(1);
      if (!targetId) return;
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth" });

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
  const contactForm = document.querySelector("form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Message Sent Successfully!</span><span class="material-symbols-outlined text-base">check_circle</span>`;
        submitBtn.classList.add("bg-green-700");
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.classList.remove("bg-green-700");
          contactForm.reset();
        }, 3000);
      }
    });
  }
});
