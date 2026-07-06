let map;
let routingControl;
let desaBoundary; // Desa boundary layer (always visible)
let administrativeLegendControl = null;
let layerLegendControl = null;
let layers = {
  wisata: {},
  fasilitas: {},
  umkm: {},
  lahan: L.layerGroup(),
  jalan: L.layerGroup(),
  sungai: L.layerGroup(),
  rw: L.layerGroup(),
};

const layerLegendState = {
  wisata: false,
  fasilitas: false,
  umkm: false,
  lahan: false,
  jalan: false,
  sungai: false,
  kependudukan: false,
};

const legendConfig = {
  wisata: {
    title: "Wisata",
    items: [
      { label: "Wisata Alam", color: "#10b981", icon: "fa-tree" },
      { label: "Wisata Religi", color: "#ef4444", icon: "fa-mosque" },
    ],
  },
  fasilitas: {
    title: "Fasilitas Umum",
    items: [
      { label: "Pendidikan", color: "#3b82f6", icon: "fa-graduation-cap" },
      { label: "Kesehatan", color: "#ef4444", icon: "fa-hospital" },
      { label: "Pemerintahan", color: "#8b5cf6", icon: "fa-landmark" },
      { label: "Sosial Umum", color: "#6b7280", icon: "fa-building" },
      { label: "Keagamaan", color: "#10b981", icon: "fa-mosque" },
      { label: "Olahraga", color: "#f59e0b", icon: "fa-futbol" },
    ],
  },
  umkm: {
    title: "UMKM",
    items: [
      { label: "Kuliner", color: "#ef4444", icon: "fa-utensils" },
      { label: "Fashion", color: "#ec4899", icon: "fa-tshirt" },
      { label: "Kosmetik", color: "#f472b6", icon: "fa-spray-can" },
      { label: "Kelontong", color: "#f59e0b", icon: "fa-shopping-basket" },
      { label: "Salon", color: "#a855f7", icon: "fa-cut" },
      { label: "Fotokopi", color: "#6366f1", icon: "fa-copy" },
      { label: "Carwash", color: "#06b6d4", icon: "fa-car" },
      { label: "Bengkel", color: "#64748b", icon: "fa-wrench" },
      { label: "Isi Ulang", color: "#0ea5e9", icon: "fa-tint" },
      { label: "Penjahit", color: "#8b5cf6", icon: "fa-scissors" },
      { label: "Pertanian", color: "#10b981", icon: "fa-seedling" },
      { label: "Ternak Ayam", color: "#f59e0b", icon: "fa-egg" },
      { label: "Ternak Sapi", color: "#78716c", icon: "fa-cow" },
      { label: "Paket Data", color: "#3b82f6", icon: "fa-mobile-alt" },
      { label: "Toko Bangunan", color: "#f97316", icon: "fa-hammer" },
      { label: "Elektronik", color: "#eab308", icon: "fa-plug" },
      { label: "ATK", color: "#6366f1", icon: "fa-pen" },
    ],
  },
  lahan: {
    title: "Penggunaan Lahan",
    items: [
      { label: "Tempat Tinggal", color: "#F4A6A6" },
      { label: "Pemukiman", color: "#E6D5B8" },
      { label: "Perkantoran", color: "#8D6E63" },
      { label: "Pendidikan", color: "#42A5F5" },
      { label: "Perdagangan dan Jasa", color: "#EF5350" },
      { label: "Industri dan Pergudangan", color: "#616161" },
      { label: "Peribadatan", color: "#AB47BC" },
      { label: "Kesehatan", color: "#D32F2F" },
      { label: "Olahraga", color: "#FB8C00" },
      { label: "Tempat Menarik/Pariwisata", color: "#FFD54F" },
      { label: "Pemakaman", color: "#8BC34A" },
      { label: "Perikanan Air Tawar", color: "#29B6F6" },
      { label: "Peternakan", color: "#C0A000" },
      { label: "Hutan", color: "#388E3C" },
      { label: "Hutan Rimba", color: "#1B5E20" },
      { label: "Sawah", color: "#C5E1A5" },
      { label: "Ladang", color: "#FFF59D" },
      { label: "Vegetasi Non Budidaya Lainnya", color: "#A5D6A7" },
      { label: "Lahan Terbuka (Tanah Kosong)", color: "#E0E0E0" },
    ],
  },
  jalan: {
    title: "Jalan",
    items: [
      { label: "Jalan Lokal", color: "#FF6347", line: true },
      { label: "Jalan Lain", color: "#FFA500", line: true },
      { label: "Jalan Setapak", color: "#A9A9A9", line: true },
      { label: "Jalan Pematang", color: "#8B4513", line: true },
    ],
  },
  sungai: {
    title: "Sungai",
    items: [{ label: "Sungai", color: "#00CED1", line: true }],
  },
};

const ADMIN_BOUNDARY_COLOR = "#E53935";
const CHOROPLETH_COLORS = [
  "#F3E5F5",
  "#CE93D8",
  "#AB47BC",
  "#7B1FA2",
  "#4A148C",
];
const CHOROPLETH_CLASSES = {
  umur: [
    { label: "Sangat Rendah", min: 0, max: 50 },
    { label: "Rendah", min: 51, max: 100 },
    { label: "Sedang", min: 101, max: 150 },
    { label: "Tinggi", min: 151, max: 200 },
    { label: "Sangat Tinggi", min: 201, max: Infinity },
  ],
  pendidikan: [
    { label: "Sangat Rendah", min: 0, max: 25 },
    { label: "Rendah", min: 26, max: 50 },
    { label: "Sedang", min: 51, max: 75 },
    { label: "Tinggi", min: 76, max: 100 },
    { label: "Sangat Tinggi", min: 101, max: Infinity },
  ],
  pekerjaan: [
    { label: "Sangat Rendah", min: 0, max: 20 },
    { label: "Rendah", min: 21, max: 40 },
    { label: "Sedang", min: 41, max: 60 },
    { label: "Tinggi", min: 61, max: 80 },
    { label: "Sangat Tinggi", min: 81, max: Infinity },
  ],
};

// Layer loading state
const layerState = {
  desa: "loading",
  wisata: "loading",
  fasilitas: "loading",
  umkm: "loading",
  kependudukan: "loading",
  lahan: "loading",
  jalan: "loading",
  sungai: "loading",
  profil: "loading",
};

const layerNames = [
  "desa",
  "wisata",
  "fasilitas",
  "umkm",
  "kependudukan",
  "lahan",
  "jalan",
  "sungai",
  "profil",
];
let loadedCount = 0;

// Update progress bar
function updateProgress(layerName, status) {
  layerState[layerName] = status;

  if (status === "loaded") {
    loadedCount++;
  }

  const total = layerNames.length;
  const percentage = (loadedCount / total) * 100;

  // Update progress bar
  const progressBar = document.getElementById("progressBarFill");
  const progressText = document.getElementById("progressText");

  if (progressBar) {
    progressBar.style.width = percentage + "%";
  }

  if (progressText) {
    if (loadedCount < total) {
      const currentLayer =
        layerName.charAt(0).toUpperCase() + layerName.slice(1);
      progressText.textContent = `Memuat ${currentLayer}... (${loadedCount}/${total})`;
    } else {
      progressText.textContent = `Semua layer dimuat (${total}/${total})`;
      // Hide progress bar after 2 seconds
      setTimeout(() => {
        const progressContainer = document.getElementById("loadingProgress");
        if (progressContainer) {
          progressContainer.classList.add("hidden");
        }
      }, 2000);
    }
  }

  // Update sidebar status indicator
  const statusMap = {
    wisata: "statusWisata",
    fasilitas: "statusFasilitas",
    umkm: "statusUMKM",
    lahan: "statusLahan",
    kependudukan: "statusKependudukan",
  };

  const statusId = statusMap[layerName];
  if (statusId) {
    const statusEl = document.getElementById(statusId);
    if (statusEl) {
      if (status === "loaded") {
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i>';
      } else if (status === "error") {
        statusEl.innerHTML =
          '<i class="fas fa-exclamation-circle"></i><button class="retry-btn" onclick="retryLayer(\'' +
          layerName +
          "')\">Retry</button>";
      }
    }
  }
}

// Retry failed layer
function retryLayer(layerName) {
  const statusMap = {
    wisata: "statusWisata",
    fasilitas: "statusFasilitas",
    umkm: "statusUMKM",
    lahan: "statusLahan",
    kependudukan: "statusKependudukan",
  };

  const statusId = statusMap[layerName];
  if (statusId) {
    const statusEl = document.getElementById(statusId);
    if (statusEl) {
      statusEl.innerHTML =
        '<i class="fas fa-spinner fa-spin text-primary"></i>';
    }
  }

  layerState[layerName] = "loading";

  const loadFunctions = {
    desa: loadDesaBoundary,
    wisata: loadWisata,
    fasilitas: loadFasilitas,
    umkm: loadUMKM,
    kependudukan: loadKependudukan,
    lahan: loadLahan,
    jalan: loadJalan,
    sungai: loadSungai,
    profil: loadProfilDesa,
  };

  const loadFn = loadFunctions[layerName];
  if (loadFn) {
    loadFn()
      .then(() => {
        updateProgress(layerName, "loaded");
      })
      .catch(() => {
        updateProgress(layerName, "error");
      });
  }
}

// Initialize map
function initMap() {
  if (map) return;

  map = L.map("map").setView([-6.963, 110.828], 14);

  // Basemap layers
  const basemaps = {
    OpenStreetMap: L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
      },
    ),
    "Google Satellite": L.tileLayer(
      "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      {
        attribution: "© Google",
      },
    ),
    "ESRI Satellite": L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© ESRI",
      },
    ),
    "Mapbox Light": L.tileLayer(
      "https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        attribution: "© Mapbox",
      },
    ),
    "Google Terrain": L.tileLayer(
      "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      {
        attribution: "© Google",
        maxZoom: 20,
      },
    ),
  };

  basemaps["Google Terrain"].addTo(map);
  L.control.layers(basemaps, null, { position: "topright" }).addTo(map);

  // Add map controls
  addMapControls();
  syncInitialLegendState();
  renderAdministrativeLegend();
  renderLayerLegends();

  // Load all data
  loadAllData();
}

function addMapControls() {
  // Scale control
  L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

  // Locate user button
  const locateControl = L.control({ position: "topright" });
  locateControl.onAdd = function () {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    div.innerHTML =
      '<a href="#" title="Lokasi Saya" style="font-size:18px; line-height:30px; width:30px; height:30px; display:block; text-align:center;"><i class="fas fa-crosshairs"></i></a>';
    div.onclick = function (e) {
      e.preventDefault();
      map.locate({ setView: true, maxZoom: 16 });
    };
    return div;
  };
  locateControl.addTo(map);

  // Recenter button
  const recenterControl = L.control({ position: "topright" });
  recenterControl.onAdd = function () {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    div.innerHTML =
      '<a href="#" title="Kembali ke Desa Prawoto" style="font-size:18px; line-height:30px; width:30px; height:30px; display:block; text-align:center;"><i class="fas fa-home"></i></a>';
    div.onclick = function (e) {
      e.preventDefault();
      map.setView([-6.963, 110.828], 14);
    };
    return div;
  };
  recenterControl.addTo(map);

  // North arrow control
  const northArrowControl = L.control({ position: "bottomleft" });
  northArrowControl.onAdd = function () {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    div.style.cssText = "background: none; border: none; box-shadow: none;";
    div.innerHTML =
      '<div style="background: white; border: 2px solid rgba(0,0,0,0.2); border-radius: 50%; box-shadow: 0 1px 5px rgba(0,0,0,0.4); width: 50px; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: default; user-select: none;"><div style="font-size: 24px; font-weight: bold; color: #e74c3c; line-height: 1; margin-bottom: -2px;">▲</div><div style="font-size: 10px; font-weight: bold; color: #333; line-height: 1;">N</div></div>';
    return div;
  };
  northArrowControl.addTo(map);

  // Navigation control
  const navControl = L.control({ position: "topright" });
  navControl.onAdd = function () {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    div.innerHTML =
      '<a href="#" title="Navigasi ke Desa Prawoto" style="font-size:18px; line-height:30px; width:30px; height:30px; display:block; text-align:center;"><i class="fas fa-route"></i></a>';
    div.onclick = function (e) {
      e.preventDefault();
      startNavigation();
    };
    return div;
  };
  navControl.addTo(map);
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return escapeHtml(String(value));
}

function buildAttributePopup(title, rows, imageHtml = "") {
  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <th>${escapeHtml(label)}</th>
          <td>${displayValue(value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <div class="attribute-popup">
      ${imageHtml}
      <h6>${escapeHtml(title)}</h6>
      <table>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `;
}

function buildPhotoHtml(item) {
  const src =
    typeof safeImageSrc === "function" ? safeImageSrc(item.foto_base64) : "";
  if (src) {
    return `<img src="${escapeAttr(src)}" class="popup-photo" alt="${escapeAttr(item.nama)}">`;
  }

  return '<div class="popup-photo popup-photo-placeholder">Foto Segera Hadir</div>';
}

function markerIcon(iconClass, iconColor, iconSize = 32) {
  return L.divIcon({
    html: `<div style="background:${iconColor}; width:${iconSize}px; height:${iconSize}px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3)"><i class="fas ${iconClass}" style="color:white; font-size:${iconSize === 32 ? 14 : 16}px"></i></div>`,
    className: "custom-marker",
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
  });
}

function setMarkerSearchData(marker, data) {
  marker.searchData = data;
  return marker;
}

function syncInitialLegendState() {
  const kependudukanCheckbox = document.getElementById("showKependudukan");
  layerLegendState.kependudukan = Boolean(kependudukanCheckbox?.checked);
}

function updateLayerLegend(layerName, active) {
  layerLegendState[layerName] = active;

  if (layerName === "kependudukan") {
    renderAdministrativeLegend();
  }

  renderLayerLegends();
}

function createLegendControl(className, sections) {
  const control = L.control({ position: "bottomright" });
  control.onAdd = function () {
    const div = L.DomUtil.create("div", `info legend ${className}`);
    div.style.background = "white";
    div.style.padding = "10px";
    div.style.border = "2px solid #ccc";
    div.style.borderRadius = "5px";
    div.style.overflowY = "auto";

    L.DomEvent.disableScrollPropagation(div);
    L.DomEvent.disableClickPropagation(div);

    div.innerHTML = sections.join("");
    return div;
  };

  return control;
}

function renderAdministrativeLegend() {
  if (administrativeLegendControl) {
    map.removeControl(administrativeLegendControl);
    administrativeLegendControl = null;
  }

  administrativeLegendControl = createLegendControl("administrative-legend", [
    buildLegendSection(getAdministrativeLegendConfig()),
  ]);
  administrativeLegendControl.addTo(map);
}

function renderLayerLegends() {
  if (layerLegendControl) {
    map.removeControl(layerLegendControl);
    layerLegendControl = null;
  }

  const sections = Object.keys(layerLegendState)
    .filter((name) => layerLegendState[name])
    .map((name) => getLayerLegendConfig(name))
    .filter(Boolean)
    .map((config) => buildLegendSection(config));
  if (!sections.length) return;

  layerLegendControl = createLegendControl("layer-legend", sections);
  layerLegendControl.addTo(map);
}

function getAdministrativeLegendConfig() {
  const items = [
    {
      label: "Batas Desa",
      color: ADMIN_BOUNDARY_COLOR,
      line: true,
      dashed: true,
    },
  ];

  if (layerLegendState.kependudukan) {
    items.push({ label: "Batas RT", color: ADMIN_BOUNDARY_COLOR, line: true });
  }

  return {
    title: "Batas Administrasi",
    items,
  };
}

function getLayerLegendConfig(name) {
  if (name === "kependudukan") {
    return getKependudukanLegendConfig();
  }

  return legendConfig[name] || null;
}

function getKependudukanLegendConfig() {
  if (kependudukanMode === "basic") return null;

  const titles = {
    umur: "Kependudukan - Umur",
    pendidikan: "Kependudukan - Pendidikan",
    pekerjaan: "Kependudukan - Pekerjaan",
  };

  const classes = CHOROPLETH_CLASSES[kependudukanMode] || [];
  return {
    title: titles[kependudukanMode] || "Kependudukan",
    items: classes.map((item, index) => ({
      label:
        item.max === Infinity
          ? `${item.label} (> ${item.min - 1})`
          : `${item.label} (${item.min}-${item.max})`,
      color: CHOROPLETH_COLORS[index],
    })),
  };
}

function buildLegendSection(config) {
  const items = config.items
    .map((item) => {
      if (item.icon) {
        return `<div class="legend-item"><span class="legend-marker" style="background:${item.color}"><i class="fas ${item.icon}"></i></span>${escapeHtml(item.label)}</div>`;
      }
      if (item.line) {
        const lineClass = item.dashed ? "legend-line dashed" : "legend-line";
        const lineStyle = item.dashed
          ? `border-top-color:${item.color}`
          : `background:${item.color}`;
        return `<div class="legend-item"><span class="${lineClass}" style="${lineStyle}"></span>${escapeHtml(item.label)}</div>`;
      }

      return `<div class="legend-item"><span class="legend-swatch" style="background:${item.color}"></span>${escapeHtml(item.label)}</div>`;
    })
    .join("");

  return `<div class="legend-section"><h6>${escapeHtml(config.title)}</h6>${items}</div>`;
}

function isAnyLayerActive(layerMap) {
  return Object.values(layerMap).some((layerGroup) => map.hasLayer(layerGroup));
}

function ensureSearchLayerVisible(item) {
  if (item.layerGroup && !map.hasLayer(item.layerGroup)) {
    map.addLayer(item.layerGroup);
  }

  if (item.layerType === "wisata") {
    const checkboxId = item.category === "alam" ? "wisataAlam" : "wisataReligi";
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) checkbox.checked = true;
    updateLayerLegend("wisata", true);
  } else if (item.layerType === "fasilitas") {
    const checkbox = document.getElementById(
      "fas" + item.category.charAt(0).toUpperCase() + item.category.slice(1),
    );
    if (checkbox) checkbox.checked = true;
    updateLayerLegend("fasilitas", true);
  } else if (item.layerType === "umkm") {
    const checkbox = document.getElementById(umkmIdMap[item.category]);
    if (checkbox) checkbox.checked = true;
    updateLayerLegend("umkm", true);
  }
}

function formatNumber(value, decimals = 0) {
  const number = Number(value || 0);
  return number.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Navigation function
function startNavigation() {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const desaLat = -6.963;
        const desaLng = 110.828;

        routingControl = L.Routing.control({
          waypoints: [L.latLng(userLat, userLng), L.latLng(desaLat, desaLng)],
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
          lineOptions: {
            styles: [{ color: "#3388ff", weight: 6, opacity: 0.7 }],
          },
          createMarker: function (i, waypoint, n) {
            const marker = L.marker(waypoint.latLng, {
              draggable: false,
              icon: L.divIcon({
                html:
                  i === 0
                    ? '<i class="fas fa-map-marker-alt" style="color:#3388ff; font-size:24px"></i>'
                    : '<i class="fas fa-flag-checkered" style="color:#e74c3c; font-size:24px"></i>',
                className: "route-marker",
                iconSize: [24, 24],
                iconAnchor: [12, 24],
              }),
            });
            return marker;
          },
        }).addTo(map);

        // Clear route when clicking elsewhere on map
        map.on("click", function () {
          if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
          }
        });
      },
      (error) => {
        let errorMsg = "Tidak dapat mengakses lokasi Anda. ";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg += "Izinkan akses lokasi di browser Anda.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg += "Lokasi tidak tersedia.";
        } else {
          errorMsg += "Timeout mendapatkan lokasi.";
        }
        alert(errorMsg);
      },
    );
  } else {
    alert("Browser Anda tidak mendukung geolocation.");
  }
}

async function loadAllData() {
  // Don't show blocking spinner - use progress bar instead
  try {
    // Load layers in parallel with individual progress tracking
    const desaPromise = loadDesaBoundary()
      .then(() => updateProgress("desa", "loaded"))
      .catch(() => updateProgress("desa", "error"));

    const wisataPromise = loadWisata()
      .then(() => updateProgress("wisata", "loaded"))
      .catch(() => updateProgress("wisata", "error"));

    const fasilitasPromise = loadFasilitas()
      .then(() => updateProgress("fasilitas", "loaded"))
      .catch(() => updateProgress("fasilitas", "error"));

    const umkmPromise = loadUMKM()
      .then(() => updateProgress("umkm", "loaded"))
      .catch(() => updateProgress("umkm", "error"));

    const kependudukanPromise = loadKependudukan()
      .then(() => updateProgress("kependudukan", "loaded"))
      .catch(() => updateProgress("kependudukan", "error"));

    const lahanPromise = loadLahan()
      .then(() => updateProgress("lahan", "loaded"))
      .catch(() => updateProgress("lahan", "error"));

    const jalanPromise = loadJalan()
      .then(() => updateProgress("jalan", "loaded"))
      .catch(() => updateProgress("jalan", "error"));

    const sungaiPromise = loadSungai()
      .then(() => updateProgress("sungai", "loaded"))
      .catch(() => updateProgress("sungai", "error"));

    const profilPromise = loadProfilDesa()
      .then(() => updateProgress("profil", "loaded"))
      .catch(() => updateProgress("profil", "error"));

    // Wait for all to complete (but UI updates progressively)
    await Promise.allSettled([
      desaPromise,
      wisataPromise,
      fasilitasPromise,
      umkmPromise,
      kependudukanPromise,
      lahanPromise,
      jalanPromise,
      sungaiPromise,
      profilPromise,
    ]);

    buildSearchIndex();
  } catch (error) {
    console.error("Error loading data:", error);
    showError("Gagal memuat data peta");
  }
}

// Load Wisata with subcategories
async function loadWisata() {
  try {
    const data = await apiRequest("/wisata/");
    layers.wisata = { alam: L.layerGroup(), religi: L.layerGroup() };

    data.forEach((item) => {
      const isAlam = ["Mata Air", "Gunung", "Alam"].some((j) =>
        item.jenis.includes(j),
      );
      const category = isAlam ? "alam" : "religi";

      const iconClass = category === "alam" ? "fa-tree" : "fa-mosque";
      const iconColor = category === "alam" ? "#10b981" : "#ef4444";

      const layerGroup = layers.wisata[category];
      const marker = setMarkerSearchData(
        L.marker([item.latitude, item.longitude], {
          icon: markerIcon(iconClass, iconColor),
        }).bindPopup(
          buildAttributePopup(
            item.nama,
            [
              ["Nama", item.nama],
              ["Jenis", item.jenis],
              ["Deskripsi", item.deskripsi],
              ["Lokasi", item.lokasi],
              ["Tarif", item.tarif],
              ["Fasilitas", item.fasilitas],
              ["Cagar Budaya", item.cagar_budaya],
            ],
            buildPhotoHtml(item),
          ),
        ),
        {
          name: item.nama,
          type: "Wisata",
          layerType: "wisata",
          category,
          layerGroup,
          marker: null,
          searchableText: [
            item.nama,
            item.jenis,
            category === "alam" ? "wisata alam" : "wisata religi religi",
            item.deskripsi,
            item.lokasi,
            item.tarif,
            item.fasilitas,
            item.cagar_budaya,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        },
      );
      marker.searchData.marker = marker;

      layerGroup.addLayer(marker);
    });

    // Don't add to map by default - let user enable via checkbox
  } catch (error) {
    console.error("Error loading wisata:", error);
  }
}

// Load Fasilitas with subcategories
async function loadFasilitas() {
  try {
    const data = await apiRequest("/fasilitas/");
    layers.fasilitas = {
      pendidikan: L.layerGroup(),
      kesehatan: L.layerGroup(),
      pemerintahan: L.layerGroup(),
      sosial: L.layerGroup(),
      keagamaan: L.layerGroup(),
      olahraga: L.layerGroup(),
    };

    data.forEach((item) => {
      const jenis = item.jenis;
      let category = "sosial";
      let iconClass = "fa-building";
      let iconColor = "#6b7280";

      if (jenis === "Pendidikan") {
        category = "pendidikan";
        iconClass = "fa-graduation-cap";
        iconColor = "#3b82f6";
      } else if (jenis === "Kesehatan") {
        category = "kesehatan";
        iconClass = "fa-hospital";
        iconColor = "#ef4444";
      } else if (jenis === "Pemerintah") {
        category = "pemerintahan";
        iconClass = "fa-landmark";
        iconColor = "#8b5cf6";
      } else if (
        jenis === "Peribadatan" ||
        jenis === "Keagamaan" ||
        jenis === "Kegamaan"
      ) {
        category = "keagamaan";
        iconClass = "fa-mosque";
        iconColor = "#10b981";
      } else if (jenis === "Olahraga") {
        category = "olahraga";
        iconClass = "fa-futbol";
        iconColor = "#f59e0b";
      } else if (jenis === "Sosial Umum") {
        category = "sosial";
        iconClass = "fa-building";
        iconColor = "#6b7280";
      }

      const layerGroup = layers.fasilitas[category];
      const marker = setMarkerSearchData(
        L.marker([item.latitude, item.longitude], {
          icon: markerIcon(iconClass, iconColor),
        }).bindPopup(
          buildAttributePopup(
            item.nama,
            [
              ["Nama", item.nama],
              ["Jenis", item.jenis],
              ["Deskripsi", item.deskripsi],
              ["Lokasi", item.lokasi],
              ["Jam Operasional", item.jam_operasional],
              ["Fasilitas Pendukung", item.fasilitas_pendukung],
            ],
            item.foto_base64 ? buildPhotoHtml(item) : "",
          ),
        ),
        {
          name: item.nama,
          type: "Fasilitas",
          layerType: "fasilitas",
          category,
          layerGroup,
          marker: null,
          searchableText: [
            item.nama,
            item.jenis,
            item.deskripsi,
            item.lokasi,
            item.jam_operasional,
            item.fasilitas_pendukung,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        },
      );
      marker.searchData.marker = marker;

      layerGroup.addLayer(marker);
    });

    // Don't add to map by default
  } catch (error) {
    console.error("Error loading fasilitas:", error);
  }
}

// Load UMKM with all subcategories
async function loadUMKM() {
  try {
    const data = await apiRequest("/umkm/");
    const categories = [
      "kuliner",
      "fashion",
      "kosmetik",
      "kelontong",
      "salon",
      "fotokopi",
      "carwash",
      "bengkel",
      "isiulang",
      "penjahit",
      "pertanian",
      "ternakayam",
      "ternaksapi",
      "paketdata",
      "tokobangunan",
      "elektronik",
      "atk",
    ];

    layers.umkm = {};
    categories.forEach((cat) => (layers.umkm[cat] = L.layerGroup()));

    data.forEach((item) => {
      const jenis = item.jenis;
      let category = "kuliner";
      let iconClass = "fa-utensils";
      let iconColor = "#ef4444";

      if (jenis === "Kuliner") {
        category = "kuliner";
        iconClass = "fa-utensils";
        iconColor = "#ef4444";
      } else if (jenis === "Fashion") {
        category = "fashion";
        iconClass = "fa-tshirt";
        iconColor = "#ec4899";
      } else if (jenis === "Kosmetik") {
        category = "kosmetik";
        iconClass = "fa-spray-can";
        iconColor = "#f472b6";
      } else if (jenis === "Kelontong") {
        category = "kelontong";
        iconClass = "fa-shopping-basket";
        iconColor = "#f59e0b";
      } else if (jenis === "Salon") {
        category = "salon";
        iconClass = "fa-cut";
        iconColor = "#a855f7";
      } else if (jenis === "Fotokopi") {
        category = "fotokopi";
        iconClass = "fa-copy";
        iconColor = "#6366f1";
      } else if (jenis === "Carwash") {
        category = "carwash";
        iconClass = "fa-car";
        iconColor = "#06b6d4";
      } else if (jenis === "Bengkel") {
        category = "bengkel";
        iconClass = "fa-wrench";
        iconColor = "#64748b";
      } else if (jenis === "Isi Ulang") {
        category = "isiulang";
        iconClass = "fa-tint";
        iconColor = "#0ea5e9";
      } else if (jenis === "Penjahit") {
        category = "penjahit";
        iconClass = "fa-scissors";
        iconColor = "#8b5cf6";
      } else if (jenis === "Pertanian") {
        category = "pertanian";
        iconClass = "fa-seedling";
        iconColor = "#10b981";
      } else if (jenis === "Ternak Ayam") {
        category = "ternakayam";
        iconClass = "fa-egg";
        iconColor = "#f59e0b";
      } else if (jenis === "Ternak Sapi") {
        category = "ternaksapi";
        iconClass = "fa-cow";
        iconColor = "#78716c";
      } else if (jenis === "Paket Data") {
        category = "paketdata";
        iconClass = "fa-mobile-alt";
        iconColor = "#3b82f6";
      } else if (jenis === "Toko Bangunan") {
        category = "tokobangunan";
        iconClass = "fa-hammer";
        iconColor = "#f97316";
      } else if (jenis === "Elektronik") {
        category = "elektronik";
        iconClass = "fa-plug";
        iconColor = "#eab308";
      } else if (jenis === "ATK") {
        category = "atk";
        iconClass = "fa-pen";
        iconColor = "#6366f1";
      }

      const layerGroup = layers.umkm[category];
      const marker = setMarkerSearchData(
        L.marker([item.latitude, item.longitude], {
          icon: markerIcon(iconClass, iconColor),
        }).bindPopup(
          buildAttributePopup(
            item.nama,
            [
              ["Nama", item.nama],
              ["Jenis", item.jenis],
              ["Pemilik", item.pemilik],
              ["Lokasi", item.lokasi],
              ["Produk", item.produk],
              ["Jam Operasional", item.jam_operasional],
              ["Fasilitas Pendukung", item.fasilitas_pendukung],
            ],
            item.foto_base64 ? buildPhotoHtml(item) : "",
          ),
        ),
        {
          name: item.nama,
          type: "UMKM",
          layerType: "umkm",
          category,
          layerGroup,
          marker: null,
          searchableText: [
            item.nama,
            item.jenis,
            item.pemilik,
            item.lokasi,
            item.produk,
            item.jam_operasional,
            item.fasilitas_pendukung,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        },
      );
      marker.searchData.marker = marker;

      if (layerGroup) {
        layerGroup.addLayer(marker);
      }
    });

    // Don't add to map by default
  } catch (error) {
    console.error("Error loading UMKM:", error);
  }
}

// Load Desa Boundary (always visible)
async function loadDesaBoundary() {
  try {
    const data = await apiRequest("/desa/");
    if (data && data.geometry) {
      // Parse GeoJSON geometry and render as polygon
      desaBoundary = L.geoJSON(JSON.parse(data.geometry), {
        style: {
          color: ADMIN_BOUNDARY_COLOR,
          weight: 3,
          fillOpacity: 0,
          dashArray: "5, 5",
        },
      })
        .bindPopup(
          buildAttributePopup(data.nama_desa || "Desa Prawoto", [
            ["Nama Desa", data.nama_desa || "Desa Prawoto"],
            ["Kecamatan", data.kecamatan],
            ["Kabupaten", data.kabupaten],
            ["Provinsi", data.provinsi],
            [
              "Luas",
              data.luas_ha ? `${formatNumber(data.luas_ha, 2)} ha` : "-",
            ],
          ]),
        )
        .addTo(map);
    }
  } catch (error) {
    console.error("Error loading desa boundary:", error);
  }
}

// Load Lahan
async function loadLahan() {
  try {
    const data = await apiRequest("/lahan/");
    layers.lahan.clearLayers();

    data.forEach((item) => {
      const polygon = L.geoJSON(JSON.parse(item.polygon), {
        style: {
          color: getColorByJenisLahan(item.jenis_lahan),
          weight: 1,
          fillOpacity: 1.0,
        },
      }).bindPopup(
        buildAttributePopup(`Lahan ${item.jenis_lahan}`, [
          ["Jenis Lahan", item.jenis_lahan],
          ["Luas", `${formatNumber(item.luas_ha, 2)} ha`],
        ]),
      );
      layers.lahan.addLayer(polygon);
    });

    // Don't add to map by default
  } catch (error) {
    console.error("Error loading lahan:", error);
  }
}

// Load Jalan
async function loadJalan() {
  try {
    const data = await apiRequest("/jalan/");
    layers.jalan.clearLayers();

    data.forEach((item) => {
      const color = getColorByJenisJalan(item.jenis);
      const line = L.geoJSON(JSON.parse(item.geometry), {
        style: {
          color: color,
          weight: item.jenis === "lokal" ? 3 : item.jenis === "setapak" ? 1 : 2,
          opacity: 0.7,
        },
      }).bindPopup(
        buildAttributePopup(item.nama_jalan || "Jalan", [
          ["Nama Jalan", item.nama_jalan || "Jalan"],
          ["Jenis", item.jenis],
          ["Permukaan", item.permukaan],
          ["Lebar", item.lebar_m ? `${formatNumber(item.lebar_m, 2)} m` : "-"],
        ]),
      );
      layers.jalan.addLayer(line);
    });

    // Don't add to map by default - user must enable via checkbox
  } catch (error) {
    console.error("Error loading jalan:", error);
  }
}

// Load Sungai
async function loadSungai() {
  try {
    const data = await apiRequest("/sungai/");
    layers.sungai.clearLayers();

    data.forEach((item) => {
      const line = L.geoJSON(JSON.parse(item.geometry), {
        style: {
          color: "#00CED1",
          weight: 2,
          opacity: 0.7,
        },
      }).bindPopup(
        buildAttributePopup(item.nama_sungai || "Sungai", [
          ["Nama Sungai", item.nama_sungai || "Sungai"],
        ]),
      );
      layers.sungai.addLayer(line);
    });

    // Don't add to map by default - user must enable via checkbox
  } catch (error) {
    console.error("Error loading sungai:", error);
  }
}

// Kependudukan visualization state
let kependudukanData = [];
let kependudukanMode = "basic"; // basic, umur, pendidikan, pekerjaan

// Load Kependudukan
async function loadKependudukan() {
  try {
    const data = await apiRequest("/kependudukan/");
    kependudukanData = data;
    layers.rw.clearLayers();

    data.forEach((item) => {
      const polygon = L.geoJSON(JSON.parse(item.polygon), {
        style: getKependudukanStyle(item),
      }).bindPopup(getKependudukanPopup(item));
      polygon.rwData = item;
      layers.rw.addLayer(polygon);
    });

    layers.rw.addTo(map);
  } catch (error) {
    console.error("Error loading kependudukan:", error);
  }
}

// Load Profil Desa
async function loadProfilDesa() {
  try {
    const data = await apiRequest("/desa/");
    const profilPhoto = document.getElementById("profilDesaPhoto");
    const profilePhotoSrc =
      typeof safeImageSrc === "function" ? safeImageSrc(data.foto_base64) : "";
    if (profilePhotoSrc && profilPhoto) {
      profilPhoto.src = profilePhotoSrc;
    }
  } catch (error) {
    console.error("Error loading profil desa:", error);
  }
}

function getKependudukanPopup(item) {
  if (kependudukanMode === "basic") {
    return buildAttributePopup(getKependudukanAreaLabel(item), [
      ["Wilayah", getKependudukanAreaLabel(item)],
      ["Jumlah KK", formatNumber(item.jumlah_kk || 0)],
      ["Jumlah Warga", formatNumber(item.jumlah_warga || 0)],
      ["Laki-laki", formatNumber(item.laki_laki || 0)],
      ["Perempuan", formatNumber(item.perempuan || 0)],
    ]);
  }

  // For filtered modes, show only the selected attribute
  let attr = "";
  let label = "";

  if (kependudukanMode === "umur") {
    attr =
      document.querySelector('input[name="umurAttr"]:checked')?.value ||
      "anak_anak";
    const labels = {
      anak_anak: "Anak-anak (<15 tahun)",
      produktif: "Produktif (15-64 tahun)",
      lansia: "Lansia (>64 tahun)",
    };
    label = labels[attr] || attr;
  } else if (kependudukanMode === "pendidikan") {
    attr =
      document.querySelector('input[name="pendidikanAttr"]:checked')?.value ||
      "tidak_sekolah";
    const labels = {
      tidak_sekolah: "Tidak/Belum Sekolah",
      tidak_tamat_sd: "Tidak Tamat SD",
      tamat_sd: "Tamat SD",
      sltp: "SLTP",
      slta: "SLTA",
      diploma_s1: "Diploma/S1",
    };
    label = labels[attr] || attr;
  } else if (kependudukanMode === "pekerjaan") {
    attr =
      document.querySelector('input[name="pekerjaanAttr"]:checked')?.value ||
      "belum_bekerja";
    const labels = {
      belum_bekerja: "Belum/Tidak Bekerja",
      pelajar: "Pelajar/Mahasiswa",
      mengurus_rt: "Mengurus RT",
      wiraswasta: "Wiraswasta",
      petani: "Petani/Pekebun",
      lainnya: "Lainnya",
    };
    label = labels[attr] || attr;
  }

  const value = item[attr] || 0;
  return buildAttributePopup(getKependudukanAreaLabel(item), [
    ["Wilayah", getKependudukanAreaLabel(item)],
    [label, `${formatNumber(value)} orang`],
  ]);
}

function getKependudukanAreaLabel(item) {
  if (item.nomor_rt !== undefined && item.nomor_rt !== null) {
    return `RT ${item.nomor_rt} / RW ${item.nomor_rw}`;
  }

  return `RW ${item.nomor_rw}`;
}

function getKependudukanStyle(item) {
  if (kependudukanMode === "basic") {
    return {
      color: ADMIN_BOUNDARY_COLOR,
      weight: 2,
      fillOpacity: 0.08,
    };
  }

  let value = 0;
  if (kependudukanMode === "umur") {
    const attr =
      document.querySelector('input[name="umurAttr"]:checked')?.value ||
      "anak_anak";
    value = item[attr] || 0;
  } else if (kependudukanMode === "pendidikan") {
    const attr =
      document.querySelector('input[name="pendidikanAttr"]:checked')?.value ||
      "tidak_sekolah";
    value = item[attr] || 0;
  } else if (kependudukanMode === "pekerjaan") {
    const attr =
      document.querySelector('input[name="pekerjaanAttr"]:checked')?.value ||
      "belum_bekerja";
    value = item[attr] || 0;
  }

  const fillColor = getGraduatedColor(value, kependudukanMode);
  return {
    color: ADMIN_BOUNDARY_COLOR,
    weight: 2,
    fillColor: fillColor,
    fillOpacity: 0.7,
  };
}

function getGraduatedColor(value, mode) {
  const classes = CHOROPLETH_CLASSES[mode] || [];
  const classIndex = classes.findIndex(
    (item) => value >= item.min && value <= item.max,
  );

  return CHOROPLETH_COLORS[classIndex >= 0 ? classIndex : 0];
}

function updateKependudukanVisualization() {
  layers.rw.eachLayer((layer) => {
    if (layer.rwData) {
      layer.setStyle(getKependudukanStyle(layer.rwData));
      // Update popup content
      layer.setPopupContent(getKependudukanPopup(layer.rwData));
    }
  });
  renderLayerLegends();
}

// Color helpers
function getColorByJenisLahan(jenis) {
  const colors = {
    "Tempat Tinggal": "#F4A6A6",
    Pekarangan: "#E6D5B8",
    Perkarangan: "#E6D5B8",
    Perkantoran: "#8D6E63",
    Pendidikan: "#42A5F5",
    "Perdagangan dan Jasa": "#EF5350",
    "Industri dan Pergudangan": "#616161",
    Peribadatan: "#AB47BC",
    Kesehatan: "#D32F2F",
    Olahraga: "#FB8C00",
    "Tempat Menarik/Pariwisata": "#FFD54F",
    Pemakaman: "#8BC34A",
    "Perikanan Air Tawar": "#29B6F6",
    Peternakan: "#C0A000",
    Hutan: "#388E3C",
    "Hutan Rimba": "#1B5E20",
    Sawah: "#C5E1A5",
    Ladang: "#FFF59D",
    "Vegetasi Non Budidaya Lainnya": "#A5D6A7",
    "Lahan Terbuka (Tanah Kosong)": "#E0E0E0",
  };
  return colors[jenis] || "#808080";
}

function getColorByJenisJalan(jenis) {
  const colors = {
    lokal: "#FF6347",
    lain: "#FFA500",
    setapak: "#A9A9A9",
    pematang: "#8B4513",
  };
  return colors[jenis] || "#666666";
}

// Toggle layer visibility
document.getElementById("wisataAlam").addEventListener("change", (e) => {
  e.target.checked
    ? map.addLayer(layers.wisata.alam)
    : map.removeLayer(layers.wisata.alam);
  updateLayerLegend("wisata", isAnyLayerActive(layers.wisata));
});

document.getElementById("wisataReligi").addEventListener("change", (e) => {
  e.target.checked
    ? map.addLayer(layers.wisata.religi)
    : map.removeLayer(layers.wisata.religi);
  updateLayerLegend("wisata", isAnyLayerActive(layers.wisata));
});

[
  "pendidikan",
  "kesehatan",
  "pemerintahan",
  "sosial",
  "keagamaan",
  "olahraga",
].forEach((cat) => {
  const id = "fas" + cat.charAt(0).toUpperCase() + cat.slice(1);
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", (e) => {
      e.target.checked
        ? map.addLayer(layers.fasilitas[cat])
        : map.removeLayer(layers.fasilitas[cat]);
      updateLayerLegend("fasilitas", isAnyLayerActive(layers.fasilitas));
    });
  }
});

const umkmIdMap = {
  kuliner: "umkmKuliner",
  fashion: "umkmFashion",
  kosmetik: "umkmKosmetik",
  kelontong: "umkmKelontong",
  salon: "umkmSalon",
  fotokopi: "umkmFotokopi",
  carwash: "umkmCarwash",
  bengkel: "umkmBengkel",
  isiulang: "umkmIsiUlang",
  penjahit: "umkmPenjahit",
  pertanian: "umkmPertanian",
  ternakayam: "umkmTernakAyam",
  ternaksapi: "umkmTernakSapi",
  paketdata: "umkmPaketData",
  tokobangunan: "umkmTokoBangunan",
  elektronik: "umkmElektronik",
  atk: "umkmATK",
};

Object.keys(umkmIdMap).forEach((cat) => {
  const el = document.getElementById(umkmIdMap[cat]);
  if (el) {
    el.addEventListener("change", (e) => {
      e.target.checked
        ? map.addLayer(layers.umkm[cat])
        : map.removeLayer(layers.umkm[cat]);
      updateLayerLegend("umkm", isAnyLayerActive(layers.umkm));
    });
  }
});

// Search functionality
let searchIndex = [];

function buildSearchIndex() {
  searchIndex = [];

  Object.values(layers.wisata).forEach((layerGroup) => {
    layerGroup.eachLayer((marker) => {
      if (marker.searchData) {
        searchIndex.push(marker.searchData);
      }
    });
  });

  Object.values(layers.fasilitas).forEach((layerGroup) => {
    layerGroup.eachLayer((marker) => {
      if (marker.searchData) {
        searchIndex.push(marker.searchData);
      }
    });
  });

  Object.values(layers.umkm).forEach((layerGroup) => {
    layerGroup.eachLayer((marker) => {
      if (marker.searchData) {
        searchIndex.push(marker.searchData);
      }
    });
  });
}

const searchInput = document.getElementById("searchInput");
const searchResults = document.createElement("div");
searchResults.style.cssText =
  "position:absolute; background:white; border:1px solid #ccc; max-height:200px; overflow-y:auto; width:100%; z-index:1000; display:none";
searchInput.parentElement.style.position = "relative";
searchInput.parentElement.appendChild(searchResults);

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();
  if (query.length < 2) {
    searchResults.style.display = "none";
    return;
  }

  const matches = searchIndex
    .filter((item) => item.searchableText.includes(query))
    .slice(0, 10);

  if (matches.length === 0) {
    searchResults.style.display = "none";
    return;
  }

  searchResults.innerHTML = matches
    .map(
      (item) =>
        `<div style="padding:8px; cursor:pointer; border-bottom:1px solid #eee" data-name="${escapeAttr(item.name)}">
      <strong>${escapeHtml(item.name)}</strong> <small>(${item.type})</small>
    </div>`,
    )
    .join("");
  searchResults.style.display = "block";

  searchResults.querySelectorAll("div").forEach((div, idx) => {
    div.onclick = () => {
      const item = matches[idx];
      ensureSearchLayerVisible(item);
      const latlng = item.marker.getLatLng();
      map.setView(latlng, 17);
      item.marker.openPopup();
      searchResults.style.display = "none";
      searchInput.value = item.name;
    };
  });
});

document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
    searchResults.style.display = "none";
  }
});

document.getElementById("showLahan").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.lahan) : map.removeLayer(layers.lahan);
  updateLayerLegend("lahan", e.target.checked);
});

document.getElementById("showJalan").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.jalan) : map.removeLayer(layers.jalan);
  updateLayerLegend("jalan", e.target.checked);
});

document.getElementById("showSungai").addEventListener("change", (e) => {
  e.target.checked
    ? map.addLayer(layers.sungai)
    : map.removeLayer(layers.sungai);
  updateLayerLegend("sungai", e.target.checked);
});

document.getElementById("showKependudukan").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.rw) : map.removeLayer(layers.rw);
  updateLayerLegend("kependudukan", e.target.checked);
});

// Kependudukan visualization controls
document.querySelectorAll('input[name="vizMode"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    kependudukanMode = e.target.value;
    document.getElementById("umurOptions").style.display =
      e.target.value === "umur" ? "block" : "none";
    document.getElementById("pendidikanOptions").style.display =
      e.target.value === "pendidikan" ? "block" : "none";
    document.getElementById("pekerjaanOptions").style.display =
      e.target.value === "pekerjaan" ? "block" : "none";
    updateKependudukanVisualization();
  });
});

document
  .querySelectorAll(
    'input[name="umurAttr"], input[name="pendidikanAttr"], input[name="pekerjaanAttr"]',
  )
  .forEach((radio) => {
    radio.addEventListener("change", () => {
      updateKependudukanVisualization();
    });
  });

// Routing functionality
document.getElementById("routingBtn").addEventListener("click", () => {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
    document.getElementById("routingBtn").innerHTML =
      '<i class="fas fa-route me-2"></i> Aktifkan Navigasi';
    map.off("click");
  } else {
    routingControl = L.Routing.control({
      waypoints: [],
      routeWhileDragging: true,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: {
        styles: [{ color: "blue", opacity: 0.6, weight: 4 }],
      },
    }).addTo(map);
    document.getElementById("routingBtn").innerHTML =
      '<i class="fas fa-times me-2"></i> Nonaktifkan Navigasi';

    map.on("click", (e) => {
      if (routingControl) {
        const waypoints = routingControl.getWaypoints();
        waypoints.push(L.latLng(e.latlng.lat, e.latlng.lng));
        routingControl.setWaypoints(waypoints);
      }
    });
  }
});

window.initPrawotoMap = initMap;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMap);
} else {
  initMap();
}
