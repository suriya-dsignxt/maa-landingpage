/**
 * Mahatma Alumni Association - Luxury Circle Cursor Follower
 * A modern, ultra-smooth, high-performance circular cursor follower featuring:
 * - Fluid dual-stage motion: crisp central dot + smooth trailing aura ring
 * - Interactive magnetic hover expansions on buttons, links, cards, & inputs
 * - Tactile click contractions
 * - Subtle resting idle pulse
 * - Clean, distraction-free aesthetic with no trails and no on-screen toggle pill
 */

(function () {
  'use strict';

  // Check touch devices & reduced motion preference
  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Do not initialize on touch devices or if user prefers reduced motion
  if (isTouchDevice || prefersReducedMotion) {
    // Ensure any previously created elements are removed
    const leftoverElements = document.querySelectorAll(
      '#circle-cursor-follower, #pencil-follower, #circle-follower-toggle, #pencil-follower-toggle, #cursor-trail-canvas, #pencil-trail-canvas'
    );
    leftoverElements.forEach((el) => el.remove());
    return;
  }

  // Mouse & Physics state variables
  let mouseX = -100;
  let mouseY = -100;
  let dotX = -100;
  let dotY = -100;
  let ringX = -100;
  let ringY = -100;
  let isMouseInWindow = false;
  let isHoveringInteractive = false;
  let isClicking = false;
  let isIdle = false;
  let lastMoveTime = Date.now();
  let animFrameId = null;

  // DOM Elements
  let followerContainer = null;
  let dotEl = null;
  let ringEl = null;

  // Inject Scoped Styles for Clean Circle Follower
  function injectStyles() {
    const existingStyle = document.getElementById('circle-cursor-follower-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'circle-cursor-follower-styles';
    style.textContent = `
      #circle-cursor-follower,
      #pencil-follower {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        pointer-events: none;
        z-index: 99999;
        will-change: opacity;
        opacity: 0;
        transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }

      #circle-cursor-follower.active,
      #pencil-follower.active {
        opacity: 1;
      }

      /* Outer Smooth Trailing Ring */
      #circle-cursor-follower .cursor-ring {
        position: absolute;
        top: 0;
        left: 0;
        width: 38px;
        height: 38px;
        margin-left: -19px;
        margin-top: -19px;
        border-radius: 50%;
        border: 1.5px solid rgba(251, 203, 98, 0.85);
        background: rgba(251, 203, 98, 0.08);
        box-shadow: 0 0 16px rgba(251, 203, 98, 0.35), inset 0 0 10px rgba(251, 203, 98, 0.1);
        pointer-events: none;
        will-change: transform, width, height, background-color, border-color, box-shadow;
        transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                    height 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                    margin 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                    background-color 0.25s ease,
                    border-color 0.25s ease,
                    box-shadow 0.28s ease,
                    backdrop-filter 0.25s ease;
      }

      /* Inner Precision Center Dot */
      #circle-cursor-follower .cursor-dot {
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
        height: 6px;
        margin-left: -3px;
        margin-top: -3px;
        border-radius: 50%;
        background: #fbcb62;
        box-shadow: 0 0 8px #fbcb62, 0 0 14px rgba(251, 203, 98, 0.7);
        pointer-events: none;
        will-change: transform;
        transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
                    opacity 0.2s ease,
                    background-color 0.2s ease,
                    box-shadow 0.2s ease;
      }

      /* Interactive Hovering State */
      #circle-cursor-follower.hovering .cursor-ring {
        width: 60px;
        height: 60px;
        margin-left: -30px;
        margin-top: -30px;
        background: rgba(251, 203, 98, 0.18);
        border-color: #ffd77a;
        box-shadow: 0 0 28px rgba(251, 203, 98, 0.7), inset 0 0 16px rgba(251, 203, 98, 0.25);
        backdrop-filter: blur(1.5px);
        -webkit-backdrop-filter: blur(1.5px);
      }

      #circle-cursor-follower.hovering .cursor-dot {
        opacity: 0.45;
        transform: scale(0.65);
      }

      /* Tactile Clicking / Active State */
      #circle-cursor-follower.clicking .cursor-ring {
        width: 28px;
        height: 28px;
        margin-left: -14px;
        margin-top: -14px;
        background: rgba(251, 203, 98, 0.45);
        border-color: #ffffff;
        box-shadow: 0 0 22px rgba(251, 203, 98, 0.85), inset 0 0 12px #ffffff;
      }

      #circle-cursor-follower.clicking .cursor-dot {
        transform: scale(1.35);
        background: #ffffff;
        box-shadow: 0 0 12px #ffffff;
      }

      @media (max-width: 768px) {
        #circle-cursor-follower,
        #pencil-follower {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create Follower Elements
  function createDOM() {
    // Clean up any old toggle buttons, canvases, or existing follower elements
    const leftoverElements = document.querySelectorAll(
      '#circle-follower-toggle, #pencil-follower-toggle, #cursor-trail-canvas, #pencil-trail-canvas, .cursor-trail-canvas, #circle-cursor-follower, #pencil-follower'
    );
    leftoverElements.forEach((el) => el.remove());

    // Follower container containing outer trailing ring + inner dot
    followerContainer = document.createElement('div');
    followerContainer.id = 'circle-cursor-follower';
    followerContainer.className = 'circle-cursor-follower';
    followerContainer.setAttribute('aria-hidden', 'true');

    // Outer trailing ring
    ringEl = document.createElement('div');
    ringEl.className = 'cursor-ring';

    // Inner precision dot
    dotEl = document.createElement('div');
    dotEl.className = 'cursor-dot';

    followerContainer.appendChild(ringEl);
    followerContainer.appendChild(dotEl);
    document.body.appendChild(followerContainer);
  }

  // High-Performance 60-120fps Animation Loop (Pure DOM / GPU translate3d)
  function render() {
    // 1. Physics Interpolation
    // Inner dot responds instantly / with very snappy tracking
    const dotEase = 0.75;
    dotX += (mouseX - dotX) * dotEase;
    dotY += (mouseY - dotY) * dotEase;

    // Outer circle follows with silky smooth organic spring easing
    const ringEase = 0.18;
    ringX += (mouseX - ringX) * ringEase;
    ringY += (mouseY - ringY) * ringEase;

    const distX = mouseX - ringX;
    const distY = mouseY - ringY;
    const dist = Math.hypot(distX, distY);

    const now = Date.now();
    if (dist > 0.8) {
      lastMoveTime = now;
      isIdle = false;
    } else {
      if (now - lastMoveTime > 750) {
        isIdle = true;
      }
    }

    // Gentle idle breathing oscillation when stationary
    let idleScale = 1;
    if (isIdle && !isHoveringInteractive && !isClicking) {
      idleScale = 1 + Math.sin(now * 0.0035) * 0.05;
    }

    // Update DOM transforms with hardware-accelerated translate3d
    dotEl.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
    ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${idleScale})`;

    animFrameId = requestAnimationFrame(render);
  }

  // Interactive Elements Detection (Links, Buttons, Inputs, Selects, Cards)
  function setupHoverListeners() {
    const interactiveSelector = `
      a, button, input, select, textarea,
      [role="button"], [role="link"], [role="tab"],
      .card-hover-effect, .cursor-pointer, .gsap-about-card,
      .gsap-pillar-card, .gsap-chapter-card, .gsap-tier-card,
      .nav-dropdown-btn, .hero-indicator-dot, .open-app-modal-btn,
      .custom-select-trigger, .custom-option
    `;

    document.addEventListener(
      'mouseover',
      (e) => {
        const target = e.target.closest(interactiveSelector);
        if (target) {
          isHoveringInteractive = true;
          followerContainer.classList.add('hovering');
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'mouseout',
      (e) => {
        const target = e.target.closest(interactiveSelector);
        if (target) {
          isHoveringInteractive = false;
          followerContainer.classList.remove('hovering');
        }
      },
      { passive: true }
    );
  }

  // Movement, Click, Window Leave/Enter Event Handlers
  function setupEvents() {
    // Mouse Move
    window.addEventListener(
      'mousemove',
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isMouseInWindow) {
          isMouseInWindow = true;
          dotX = mouseX;
          dotY = mouseY;
          ringX = mouseX;
          ringY = mouseY;
          followerContainer.classList.add('active');
        }
      },
      { passive: true }
    );

    // Mouse Down (Tactile Contraction)
    window.addEventListener('mousedown', () => {
      isClicking = true;
      followerContainer.classList.add('clicking');
    });

    // Mouse Up
    window.addEventListener('mouseup', () => {
      isClicking = false;
      followerContainer.classList.remove('clicking');
    });

    // Mouse Leave Window
    document.addEventListener('mouseleave', () => {
      isMouseInWindow = false;
      followerContainer.classList.remove('active');
    });

    // Mouse Enter Window
    document.addEventListener('mouseenter', () => {
      isMouseInWindow = true;
      followerContainer.classList.add('active');
    });

    // Conserve CPU when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animFrameId) cancelAnimationFrame(animFrameId);
      } else {
        lastMoveTime = Date.now();
        animFrameId = requestAnimationFrame(render);
      }
    });
  }

  // Initialize
  function init() {
    injectStyles();
    createDOM();
    setupEvents();
    setupHoverListeners();
    animFrameId = requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
