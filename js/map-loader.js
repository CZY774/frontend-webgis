const MAP_ASSETS = {
  styles: [
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  ],
  scripts: [
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
    "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js",
    "js/map.js",
  ],
};

let mapLoadPromise = null;

function loadStyleOnce(href) {
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    link.onerror = () => reject(new Error(`Gagal memuat ${href}`));
    document.head.appendChild(link);
  });
}

function loadScriptOnce(src) {
  if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Gagal memuat ${src}`));
    document.body.appendChild(script);
  });
}

async function loadMapStack() {
  if (mapLoadPromise) return mapLoadPromise;

  const progress = document.getElementById("loadingProgress");
  const intro = document.getElementById("mapIntro");
  if (progress) {
    progress.classList.add("active");
    progress.classList.remove("hidden");
  }
  if (intro) intro.classList.add("loading");

  mapLoadPromise = (async () => {
    await Promise.all(MAP_ASSETS.styles.map(loadStyleOnce));
    for (const src of MAP_ASSETS.scripts) {
      await loadScriptOnce(src);
    }

    if (typeof window.initPrawotoMap === "function") {
      window.initPrawotoMap();
    }

    if (intro) {
      intro.classList.add("loaded");
    }
  })().catch((error) => {
    mapLoadPromise = null;
    if (intro) intro.classList.remove("loading");
    console.error(error);
    throw error;
  });

  return mapLoadPromise;
}

function bindMapLazyLoading() {
  const mapSection = document.getElementById("peta");
  const loadButton = document.getElementById("loadMapBtn");

  if (loadButton) {
    loadButton.addEventListener("click", loadMapStack);
  }

  document.querySelectorAll('a[href="#peta"]').forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(loadMapStack, 180);
    });
  });

  if (window.location.hash === "#peta") {
    loadMapStack();
    return;
  }

  if ("IntersectionObserver" in window && mapSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadMapStack();
        }
      },
      { rootMargin: "360px 0px" },
    );
    observer.observe(mapSection);
  }
}

document.addEventListener("DOMContentLoaded", bindMapLazyLoading);
