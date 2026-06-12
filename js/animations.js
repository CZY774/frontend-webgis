(function () {
  const GSAP_URL = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  const slowConnection =
    connection?.saveData ||
    /(^|-)2g$|slow-2g/i.test(connection?.effectiveType || "");

  if (reducedMotion || slowConnection) return;

  let started = false;
  const compactViewport = window.matchMedia("(max-width: 767px)").matches;
  const motionScale = compactViewport ? 0.9 : 1;
  const supportsClipPath =
    window.CSS?.supports?.("clip-path", "inset(0 0 0 0)") || false;

  function time(value) {
    return value * motionScale;
  }

  function timeMs(value) {
    return Math.round(value * motionScale);
  }

  function onIdle(callback) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 900 });
      return;
    }
    window.setTimeout(callback, 300);
  }

  function loadGsap() {
    return new Promise((resolve, reject) => {
      if (window.gsap) {
        resolve(window.gsap);
        return;
      }

      const script = document.createElement("script");
      script.src = GSAP_URL;
      script.async = true;
      script.onload = () => resolve(window.gsap);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function animateHero(gsap) {
    const heroCopy = [
      ".hero-content .eyebrow",
      ".hero-content h1",
      ".hero-lead",
    ]
      .map((selector) => document.querySelector(selector))
      .filter(Boolean);
    const heroButtons = Array.from(
      document.querySelectorAll(".hero-actions .btn"),
    );
    const heroItems = [...heroCopy, ...heroButtons];

    if (!heroItems.length) return;

    const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

    timeline
      .fromTo(
        ".site-navbar",
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, duration: time(0.95) },
        0,
      )
      .fromTo(
        ".hero-photo",
        { scale: 1.085 },
        { scale: 1.01, duration: time(4.2), ease: "sine.out" },
        0,
      )
      .fromTo(
        ".hero-shade",
        { opacity: 0.62 },
        { opacity: 1, duration: time(2), ease: "sine.out" },
        0.05,
      )
      .fromTo(
        heroCopy,
        {
          y: 58,
          opacity: 0,
          clipPath: supportsClipPath ? "inset(0 0 22% 0)" : "none",
        },
        {
          y: 0,
          opacity: 1,
          clipPath: supportsClipPath ? "inset(0 0 0% 0)" : "none",
          duration: time(1.55),
          ease: "expo.out",
          stagger: time(0.24),
          clearProps: "transform,opacity,clipPath",
        },
        0.35,
      );
    if (heroButtons.length) {
      timeline.fromTo(
        heroButtons,
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: time(1.05),
          ease: "power3.out",
          stagger: time(0.1),
          clearProps: "transform,opacity",
        },
        1.15,
      );
    }
  }

  function animateBars(gsap, element) {
    const bars = Array.from(
      element.querySelectorAll(".rank-track span, .age-bars span"),
    );
    if (!bars.length) return;

    bars.forEach((bar) => {
      bar.style.transformOrigin = bar.classList.contains("male-bar")
        ? "right center"
        : "left center";
    });

    gsap.fromTo(
      bars,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: time(1.35),
        ease: "expo.out",
        stagger: time(0.055),
        clearProps: "transform,transformOrigin",
      },
    );
  }

  function revealHeading(gsap, element) {
    const targets = Array.from(element.children).filter(
      (child) => child.textContent.trim().length,
    );
    gsap.fromTo(
      targets.length ? targets : [element],
      {
        y: 48,
        opacity: 0,
        clipPath: supportsClipPath ? "inset(0 0 18% 0)" : "none",
      },
      {
        y: 0,
        opacity: 1,
        clipPath: supportsClipPath ? "inset(0 0 0% 0)" : "none",
        duration: time(1.18),
        ease: "expo.out",
        stagger: time(0.18),
        clearProps: "transform,opacity,clipPath",
      },
    );
  }

  function revealMetricStrip(gsap, element) {
    const items = Array.from(element.children);
    gsap.fromTo(
      items,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: time(1.05),
        ease: "expo.out",
        stagger: time(0.16),
        clearProps: "transform,opacity",
      },
    );

    gsap.fromTo(
      element.querySelectorAll("strong"),
      { scale: 0.92 },
      {
        scale: 1,
        duration: time(0.95),
        ease: "back.out(1.15)",
        stagger: time(0.16),
        delay: time(0.16),
        clearProps: "transform",
      },
    );
  }

  function revealDataBlock(gsap, element) {
    gsap.fromTo(
      element,
      {
        y: 44,
        opacity: 0,
        clipPath: supportsClipPath ? "inset(8% 0 0 0)" : "none",
      },
      {
        y: 0,
        opacity: 1,
        clipPath: supportsClipPath ? "inset(0% 0 0 0)" : "none",
        duration: time(1.16),
        ease: "expo.out",
        clearProps: "transform,opacity,clipPath",
      },
    );

    const rows = Array.from(
      element.querySelectorAll(".compact-table tbody tr"),
    ).slice(0, 8);
    if (rows.length) {
      gsap.fromTo(
        rows,
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: time(0.62),
          ease: "power3.out",
          stagger: time(0.055),
          delay: time(0.18),
          clearProps: "transform,opacity",
        },
      );
    }

    window.setTimeout(() => animateBars(gsap, element), timeMs(180));
  }

  function revealProfileMedia(gsap, element) {
    gsap.fromTo(
      element,
      {
        y: 44,
        opacity: 0,
        clipPath: supportsClipPath ? "inset(8% 0 0 0)" : "none",
      },
      {
        y: 0,
        opacity: 1,
        clipPath: supportsClipPath ? "inset(0% 0 0 0)" : "none",
        duration: time(1.18),
        ease: "expo.out",
        clearProps: "transform,opacity,clipPath",
      },
    );

    const image = element.querySelector("img");
    if (image) {
      gsap.fromTo(
        image,
        { scale: 1.075 },
        {
          scale: 1,
          duration: time(1.65),
          ease: "sine.out",
          clearProps: "transform",
        },
      );
    }
  }

  function revealIdmScore(gsap, element) {
    gsap.fromTo(
      element,
      {
        y: 44,
        opacity: 0,
        clipPath: supportsClipPath ? "inset(8% 0 0 0)" : "none",
      },
      {
        y: 0,
        opacity: 1,
        clipPath: supportsClipPath ? "inset(0% 0 0 0)" : "none",
        duration: time(1.18),
        ease: "expo.out",
        clearProps: "transform,opacity,clipPath",
      },
    );

    gsap.fromTo(
      element.querySelectorAll("strong, em"),
      { y: 16, opacity: 0, scale: 0.92 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: time(0.9),
        ease: "back.out(1.12)",
        stagger: time(0.14),
        delay: time(0.16),
        clearProps: "transform,opacity",
      },
    );
  }

  function revealElement(gsap, element) {
    if (element.matches(".section-heading")) {
      revealHeading(gsap, element);
      return;
    }

    if (element.matches(".metric-strip")) {
      revealMetricStrip(gsap, element);
      return;
    }

    if (element.matches(".data-block")) {
      revealDataBlock(gsap, element);
      return;
    }

    if (element.matches(".profile-media")) {
      revealProfileMedia(gsap, element);
      return;
    }

    if (element.matches(".idm-score")) {
      revealIdmScore(gsap, element);
      return;
    }

    const children = element.matches(".data-tabs")
      ? Array.from(element.querySelectorAll(".nav-link"))
      : null;

    const targets = children?.length ? children : [element];
    gsap.fromTo(
      targets,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: time(1.1),
        ease: "expo.out",
        stagger: children?.length ? time(0.14) : 0,
        clearProps: "transform,opacity",
      },
    );
    animateBars(gsap, element);
  }

  function setupReveals(gsap) {
    if (!("IntersectionObserver" in window)) return;

    const selectors = [
      ".section-heading",
      ".profile-media",
      ".text-rule-block",
      ".history-block",
      ".metric-strip",
      ".data-block",
      ".idm-main",
      ".idm-score",
      ".data-tabs",
      ".table-toolbar",
    ];
    const elements = Array.from(
      document.querySelectorAll(selectors.join(",")),
    ).filter((element) => !element.closest(".map-shell"));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealElement(gsap, entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.22,
      },
    );

    elements.forEach((element) => observer.observe(element));
  }

  function start() {
    if (started) return;
    started = true;

    onIdle(() => {
      loadGsap()
        .then((gsap) => {
          if (!gsap) return;
          animateHero(gsap);
          setupReveals(gsap);
        })
        .catch(() => {
          started = false;
        });
    });
  }

  document.addEventListener("prawoto:content-ready", start, { once: true });
  document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(start, 1800);
  });
})();
