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

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Add map controls
  addMapControls();

  // Load all data
  loadAllData();
}

function addMapControls() {
  // Scale control
  L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

  // Locate user button
  const locateControl = L.control({ position: 'topright' });
  locateControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = '<a href="#" title="Lokasi Saya" style="font-size:18px; line-height:30px; width:30px; height:30px; display:block; text-align:center;"><i class="fas fa-crosshairs"></i></a>';
    div.onclick = function(e) {
      e.preventDefault();
      map.locate({setView: true, maxZoom: 16});
    };
    return div;
  };
  locateControl.addTo(map);

  // Recenter button
  const recenterControl = L.control({ position: 'topright' });
  recenterControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = '<a href="#" title="Kembali ke Desa Prawoto" style="font-size:18px; line-height:30px; width:30px; height:30px; display:block; text-align:center;"><i class="fas fa-home"></i></a>';
    div.onclick = function(e) {
      e.preventDefault();
      map.setView([-6.963, 110.828], 14);
    };
    return div;
  };
  recenterControl.addTo(map);
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
    const data = await apiRequest('/wisata/');
    layers.wisata = { alam: L.layerGroup(), religi: L.layerGroup() };
    
    data.forEach((item) => {
      const icon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon }).bindPopup(`
        <h6>${escapeHtml(item.nama)}</h6>
        <p><strong>Jenis:</strong> ${escapeHtml(item.jenis)}</p>
        ${item.deskripsi ? `<p>${escapeHtml(item.deskripsi)}</p>` : ''}
      `);

      const category = item.jenis.toLowerCase().includes('alam') ? 'alam' : 'religi';
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
    const data = await apiRequest('/fasilitas/');
    layers.fasilitas = {
      pendidikan: L.layerGroup(),
      kesehatan: L.layerGroup(),
      pemerintahan: L.layerGroup(),
      sosial: L.layerGroup(),
      keagamaan: L.layerGroup(),
      olahraga: L.layerGroup(),
    };

    data.forEach((item) => {
      const marker = L.marker([item.latitude, item.longitude]).bindPopup(`
        <h6>${escapeHtml(item.nama)}</h6>
        <p><strong>Jenis:</strong> ${escapeHtml(item.jenis)}</p>
      `);

      const jenis = item.jenis.toLowerCase();
      let category = 'sosial';
      if (jenis.includes('pendidikan') || jenis.includes('sekolah')) category = 'pendidikan';
      else if (jenis.includes('kesehatan') || jenis.includes('puskesmas')) category = 'kesehatan';
      else if (jenis.includes('pemerintahan') || jenis.includes('kantor')) category = 'pemerintahan';
      else if (jenis.includes('masjid') || jenis.includes('mushola')) category = 'keagamaan';
      else if (jenis.includes('olahraga') || jenis.includes('lapangan')) category = 'olahraga';

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
    const data = await apiRequest('/umkm/');
    const categories = ['kuliner', 'fashion', 'kosmetik', 'kelontong', 'salon', 'fotokopi', 
                       'carwash', 'bengkel', 'isiulang', 'penjahit', 'pertanian', 
                       'ternakayam', 'ternaksapi', 'paketdata', 'tokobangunan', 'elektronik', 'atk'];
    
    layers.umkm = {};
    categories.forEach(cat => layers.umkm[cat] = L.layerGroup());

    data.forEach((item) => {
      const icon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon }).bindPopup(`
        <h6>${escapeHtml(item.nama)}</h6>
        <p><strong>Jenis:</strong> ${escapeHtml(item.jenis)}</p>
      `);

      const jenis = item.jenis.toLowerCase().replace(/\s+/g, '');
      let category = 'kuliner';
      if (jenis.includes('fashion')) category = 'fashion';
      else if (jenis.includes('kosmetik')) category = 'kosmetik';
      else if (jenis.includes('kelontong') || jenis.includes('toko')) category = 'kelontong';
      else if (jenis.includes('salon')) category = 'salon';
      else if (jenis.includes('fotokopi') || jenis.includes('fotocopy')) category = 'fotokopi';
      else if (jenis.includes('carwash') || jenis.includes('cuci')) category = 'carwash';
      else if (jenis.includes('bengkel')) category = 'bengkel';
      else if (jenis.includes('isi') && jenis.includes('ulang')) category = 'isiulang';
      else if (jenis.includes('penjahit')) category = 'penjahit';
      else if (jenis.includes('pertanian') || jenis.includes('tani')) category = 'pertanian';
      else if (jenis.includes('ayam')) category = 'ternakayam';
      else if (jenis.includes('sapi')) category = 'ternaksapi';
      else if (jenis.includes('paket') || jenis.includes('pulsa')) category = 'paketdata';
      else if (jenis.includes('bangunan')) category = 'tokobangunan';
      else if (jenis.includes('elektronik')) category = 'elektronik';
      else if (jenis.includes('atk')) category = 'atk';

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
    const data = await apiRequest('/lahan/');
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
    const data = await apiRequest('/jalan/');
    layers.jalan.clearLayers();
    
    data.forEach((item) => {
      const color = getColorByJenisJalan(item.jenis);
      const line = L.geoJSON(JSON.parse(item.geometry), {
        style: {
          color: color,
          weight: item.jenis === 'lokal' ? 3 : item.jenis === 'setapak' ? 1 : 2,
          opacity: 0.7,
        },
      }).bindPopup(`
        <h6>${escapeHtml(item.nama_jalan || 'Jalan')}</h6>
        <p><strong>Jenis:</strong> ${escapeHtml(item.jenis)}</p>
        <p><strong>Permukaan:</strong> ${escapeHtml(item.permukaan || '-')}</p>
        <p><strong>Lebar:</strong> ${item.lebar_m || '-'} m</p>
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
    const data = await apiRequest('/sungai/');
    layers.sungai.clearLayers();
    
    data.forEach((item) => {
      const line = L.geoJSON(JSON.parse(item.geometry), {
        style: {
          color: '#00CED1',
          weight: 2,
          opacity: 0.7,
        },
      }).bindPopup(`
        <h6>${escapeHtml(item.nama_sungai || 'Sungai')}</h6>
      `);
      layers.sungai.addLayer(line);
    });
    
    layers.sungai.addTo(map);
  } catch (error) {
    console.error("Error loading sungai:", error);
  }
}

// Load Kependudukan
async function loadKependudukan() {
  try {
    const data = await apiRequest('/kependudukan/');
    layers.rw.clearLayers();
    
    data.forEach((item) => {
      const polygon = L.geoJSON(JSON.parse(item.polygon), {
        style: {
          color: "#333",
          weight: 2,
          fillOpacity: 0.1,
        },
      }).bindPopup(`
        <h6>RW ${item.nomor_rw}</h6>
        <p><strong>Jumlah Warga:</strong> ${item.jumlah_warga}</p>
        <p><strong>Laki-laki:</strong> ${item.laki_laki}</p>
        <p><strong>Perempuan:</strong> ${item.perempuan}</p>
      `);
      layers.rw.addLayer(polygon);
    });
    
    layers.rw.addTo(map);
  } catch (error) {
    console.error("Error loading kependudukan:", error);
  }
}

// Color helpers
function getColorByJenisLahan(jenis) {
  const colors = {
    'Sawah': '#90EE90',
    'Kebun': '#228B22',
    'Ladang': '#FFD700',
    'Pemukiman': '#FF6347',
    'Tempat Tinggal': '#FF6347',
    'Perkarangan': '#98FB98',
  };
  return colors[jenis] || '#808080';
}

function getColorByJenisJalan(jenis) {
  const colors = {
    'lokal': '#FF6347',
    'lain': '#FFA500',
    'setapak': '#A9A9A9',
    'pematang': '#8B4513',
  };
  return colors[jenis] || '#666666';
}

// Toggle layer visibility
document.getElementById("wisataAlam").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.wisata.alam) : map.removeLayer(layers.wisata.alam);
});

document.getElementById("wisataReligi").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.wisata.religi) : map.removeLayer(layers.wisata.religi);
});

['pendidikan', 'kesehatan', 'pemerintahan', 'sosial', 'keagamaan', 'olahraga'].forEach(cat => {
  const id = 'fas' + cat.charAt(0).toUpperCase() + cat.slice(1);
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", (e) => {
      e.target.checked ? map.addLayer(layers.fasilitas[cat]) : map.removeLayer(layers.fasilitas[cat]);
    });
  }
});

['kuliner', 'fashion', 'kosmetik', 'kelontong', 'salon', 'fotokopi', 'carwash', 'bengkel', 
 'isiulang', 'penjahit', 'pertanian', 'ternakayam', 'ternaksapi', 'paketdata', 
 'tokobangunan', 'elektronik', 'atk'].forEach(cat => {
  const id = 'umkm' + cat.charAt(0).toUpperCase() + cat.slice(1).replace('ulang', 'Ulang').replace('ayam', 'Ayam').replace('sapi', 'Sapi').replace('data', 'Data').replace('bangunan', 'Bangunan');
  const el = document.getElementById(id);
  if (el && layers.umkm[cat]) {
    el.addEventListener("change", (e) => {
      e.target.checked ? map.addLayer(layers.umkm[cat]) : map.removeLayer(layers.umkm[cat]);
    });
  }
});

document.getElementById("showLahan").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.lahan) : map.removeLayer(layers.lahan);
});

document.getElementById("showJalan").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.jalan) : map.removeLayer(layers.jalan);
});

document.getElementById("showSungai").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.sungai) : map.removeLayer(layers.sungai);
});

document.getElementById("showKependudukan").addEventListener("change", (e) => {
  e.target.checked ? map.addLayer(layers.rw) : map.removeLayer(layers.rw);
});

// Routing functionality
document.getElementById("routingBtn").addEventListener("click", () => {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
    document.getElementById("routingBtn").innerHTML = '<i class="fas fa-route me-2"></i> Aktifkan Navigasi';
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
    document.getElementById("routingBtn").innerHTML = '<i class="fas fa-times me-2"></i> Nonaktifkan Navigasi';
    
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
