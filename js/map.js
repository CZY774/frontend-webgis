let map;
let routingControl;
let layers = {
  wisata: {},
  fasilitas: {},
  umkm: {},
  lahan: L.layerGroup(),
  jalan: L.layerGroup(),
  sungai: L.layerGroup(),
  rw: L.layerGroup(),
};

// Initialize map
function initMap() {
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
  };

  basemaps["OpenStreetMap"].addTo(map);
  L.control.layers(basemaps, null, { position: "topright" }).addTo(map);

  // Add map controls
  addMapControls();

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

  // Lahan legend
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    div.style.background = "white";
    div.style.padding = "10px";
    div.style.border = "2px solid #ccc";
    div.style.borderRadius = "5px";
    div.style.maxHeight = "300px";
    div.style.overflowY = "auto";

    // Disable scroll propagation to map
    L.DomEvent.disableScrollPropagation(div);
    L.DomEvent.disableClickPropagation(div);

    const lahanTypes = [
      ["Tempat Tinggal", "#ffccbf"],
      ["Perkarangan", "#d1d1d1"],
      ["Perkantoran", "#c6997a"],
      ["Pendidikan", "#ddcca0"],
      ["Perdagangan dan Jasa", "#ffc9d6"],
      ["Industri dan Pergudangan", "#ffaf84"],
      ["Peribadatan", "#a5a0ba"],
      ["Kesehatan", "#e8b5bf"],
      ["Olahraga", "#edcc7c"],
      ["Tempat Menarik/Pariwisata", "#c993e8"],
      ["Pemakaman", "#8e8e8e"],
      ["Perikanan Air Tawar", "#bab5ff"],
      ["Peternakan", "#c6af00"],
      ["Hutan", "#c6e0af"],
      ["Hutan Rimba", "#96d67c"],
      ["Sawah", "#99ffff"],
      ["Ladang", "#ffff99"],
      ["Vegetasi Non Budidaya Lainnya", "#89ed96"],
      ["Lahan Terbuka (Tanah Kosong)", "#ffffff"],
    ];

    let html =
      '<h6 style="margin:0 0 5px 0"><strong>Legenda Lahan</strong></h6>';
    lahanTypes.forEach(([name, color]) => {
      html += `<div style="font-size:11px"><span style="background:${color}; width:15px; height:12px; display:inline-block; margin-right:5px; border:1px solid #999"></span> ${name}</div>`;
    });
    div.innerHTML = html;
    return div;
  };
  legend.addTo(map);
}

async function loadAllData() {
  showLoading(true);
  try {
    await Promise.all([
      loadWisata(),
      loadFasilitas(),
      loadUMKM(),
      loadLahan(),
      loadJalan(),
      loadSungai(),
      loadKependudukan(),
    ]);
    buildSearchIndex();
  } catch (error) {
    console.error("Error loading data:", error);
    showError("Gagal memuat data peta");
  } finally {
    showLoading(false);
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

      const icon = L.divIcon({
        html: `<div style="background:${iconColor}; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3)"><i class="fas ${iconClass}" style="color:white; font-size:16px"></i></div>`,
        className: "custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon })
        .bindPopup(`
        <h6>${escapeHtml(item.nama)}</h6>
        <p><strong>Jenis:</strong> ${escapeHtml(item.jenis)}</p>
        ${item.deskripsi ? `<p>${escapeHtml(item.deskripsi)}</p>` : ""}
      `);

      layers.wisata[category].addLayer(marker);
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
      } else if (jenis === "Peribadatan") {
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

      const icon = L.divIcon({
        html: `<div style="background:${iconColor}; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3)"><i class="fas ${iconClass}" style="color:white; font-size:14px"></i></div>`,
        className: "custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon })
        .bindPopup(`
        <h6>${escapeHtml(item.nama)}</h6>
        <p><strong>Jenis:</strong> ${escapeHtml(item.jenis)}</p>
      `);

      layers.fasilitas[category].addLayer(marker);
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

      const icon = L.divIcon({
        html: `<div style="background:${iconColor}; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3)"><i class="fas ${iconClass}" style="color:white; font-size:14px"></i></div>`,
        className: "custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon })
        .bindPopup(`
        <h6>${escapeHtml(item.nama)}</h6>
        <p><strong>Jenis:</strong> ${escapeHtml(item.jenis)}</p>
      `);

      if (layers.umkm[category]) {
        layers.umkm[category].addLayer(marker);
      }
    });

    // Don't add to map by default
  } catch (error) {
    console.error("Error loading UMKM:", error);
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
          fillOpacity: 0.4,
        },
      }).bindPopup(`
        <h6>Lahan ${escapeHtml(item.jenis_lahan)}</h6>
        <p><strong>Luas:</strong> ${item.luas_ha} Ha</p>
      `);
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
      }).bindPopup(`
        <h6>${escapeHtml(item.nama_jalan || "Jalan")}</h6>
        <p><strong>Jenis:</strong> ${escapeHtml(item.jenis)}</p>
        <p><strong>Permukaan:</strong> ${escapeHtml(item.permukaan || "-")}</p>
        <p><strong>Lebar:</strong> ${item.lebar_m || "-"} m</p>
      `);
      layers.jalan.addLayer(line);
    });

    layers.jalan.addTo(map);
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
      }).bindPopup(`
        <h6>${escapeHtml(item.nama_sungai || "Sungai")}</h6>
      `);
      layers.sungai.addLayer(line);
    });

    layers.sungai.addTo(map);
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

function getKependudukanPopup(item) {
  return `
    <h6>RW ${item.nomor_rw}</h6>
    <p><strong>Jumlah KK:</strong> ${item.jumlah_kk || 0}</p>
    <p><strong>Jumlah Warga:</strong> ${item.jumlah_warga}</p>
    <p><strong>Laki-laki:</strong> ${item.laki_laki}</p>
    <p><strong>Perempuan:</strong> ${item.perempuan}</p>
  `;
}

function getKependudukanStyle(item) {
  if (kependudukanMode === "basic") {
    return {
      color: "#333",
      weight: 2,
      fillOpacity: 0.1,
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
    color: "#333",
    weight: 2,
    fillColor: fillColor,
    fillOpacity: 0.7,
  };
}

function getGraduatedColor(value, mode) {
  let values = [];
  let attr = "";

  if (mode === "umur") {
    attr =
      document.querySelector('input[name="umurAttr"]:checked')?.value ||
      "anak_anak";
    values = kependudukanData.map((d) => d[attr] || 0);
  } else if (mode === "pendidikan") {
    attr =
      document.querySelector('input[name="pendidikanAttr"]:checked')?.value ||
      "tidak_sekolah";
    values = kependudukanData.map((d) => d[attr] || 0);
  } else if (mode === "pekerjaan") {
    attr =
      document.querySelector('input[name="pekerjaanAttr"]:checked')?.value ||
      "belum_bekerja";
    values = kependudukanData.map((d) => d[attr] || 0);
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const normalized = max > min ? (value - min) / (max - min) : 0;

  // Gradient from light yellow to dark red
  const r = Math.floor(255);
  const g = Math.floor(255 * (1 - normalized));
  const b = Math.floor(100 * (1 - normalized));

  return `rgb(${r}, ${g}, ${b})`;
}

function updateKependudukanVisualization() {
  layers.rw.eachLayer((layer) => {
    if (layer.rwData) {
      layer.setStyle(getKependudukanStyle(layer.rwData));
    }
  });
}

// Color helpers
function getColorByJenisLahan(jenis) {
  const colors = {
    "Tempat Tinggal": "#ffccbf",
    Perkarangan: "#d1d1d1",
    Perkantoran: "#c6997a",
    Pendidikan: "#ddcca0",
    "Perdagangan dan Jasa": "#ffc9d6",
    "Industri dan Pergudangan": "#ffaf84",
    Peribadatan: "#a5a0ba",
    Kesehatan: "#e8b5bf",
    Olahraga: "#edcc7c",
    "Tempat Menarik/Pariwisata": "#c993e8",
    Pemakaman: "#8e8e8e",
    "Perikanan Air Tawar": "#bab5ff",
    Peternakan: "#c6af00",
    Hutan: "#c6e0af",
    "Hutan Rimba": "#96d67c",
    Sawah: "#99ffff",
    Ladang: "#ffff99",
    "Vegetasi Non Budidaya Lainnya": "#89ed96",
    "Lahan Terbuka (Tanah Kosong)": "#ffffff",
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
});

document.getElementById("wisataReligi").addEventListener("change", (e) => {
  e.target.checked
    ? map.addLayer(layers.wisata.religi)
    : map.removeLayer(layers.wisata.religi);
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
    });
  }
});

// Search functionality
let searchIndex = [];

function buildSearchIndex() {
  searchIndex = [];

  // Add Wisata
  Object.values(layers.wisata).forEach((layerGroup) => {
    layerGroup.eachLayer((marker) => {
      const popup = marker.getPopup();
      if (popup) {
        const content = popup.getContent();
        const nameMatch = content.match(/<h6>(.*?)<\/h6>/);
        if (nameMatch) {
          searchIndex.push({
            name: nameMatch[1],
            type: "Wisata",
            marker: marker,
          });
        }
      }
    });
  });

  // Add Fasilitas
  Object.values(layers.fasilitas).forEach((layerGroup) => {
    layerGroup.eachLayer((marker) => {
      const popup = marker.getPopup();
      if (popup) {
        const content = popup.getContent();
        const nameMatch = content.match(/<h6>(.*?)<\/h6>/);
        if (nameMatch) {
          searchIndex.push({
            name: nameMatch[1],
            type: "Fasilitas",
            marker: marker,
          });
        }
      }
    });
  });

  // Add UMKM
  Object.values(layers.umkm).forEach((layerGroup) => {
    layerGroup.eachLayer((marker) => {
      const popup = marker.getPopup();
      if (popup) {
        const content = popup.getContent();
        const nameMatch = content.match(/<h6>(.*?)<\/h6>/);
        if (nameMatch) {
          searchIndex.push({
            name: nameMatch[1],
            type: "UMKM",
            marker: marker,
          });
        }
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
  const query = e.target.value.toLowerCase();
  if (query.length < 2) {
    searchResults.style.display = "none";
    return;
  }

  const matches = searchIndex
    .filter((item) => item.name.toLowerCase().includes(query))
    .slice(0, 10);

  if (matches.length === 0) {
    searchResults.style.display = "none";
    return;
  }

  searchResults.innerHTML = matches
    .map(
      (item) =>
        `<div style="padding:8px; cursor:pointer; border-bottom:1px solid #eee" data-name="${escapeHtml(item.name)}">
      <strong>${escapeHtml(item.name)}</strong> <small>(${item.type})</small>
    </div>`,
    )
    .join("");
  searchResults.style.display = "block";

  searchResults.querySelectorAll("div").forEach((div, idx) => {
    div.onclick = () => {
      const item = matches[idx];
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
});

document.getElementById("showJalan").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.jalan) : map.removeLayer(layers.jalan);
});

document.getElementById("showSungai").addEventListener("change", (e) => {
  e.target.checked
    ? map.addLayer(layers.sungai)
    : map.removeLayer(layers.sungai);
});

document.getElementById("showKependudukan").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.rw) : map.removeLayer(layers.rw);
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

// Initialize map on page load
document.addEventListener("DOMContentLoaded", initMap);
