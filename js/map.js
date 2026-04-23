const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api' 
    : 'https://backend-webgis-production.up.railway.app/api';

let map;
let routingControl;
let layers = {
  fasilitas: L.layerGroup(),
  umkm: L.layerGroup(),
  wisata: L.layerGroup(),
  sda: L.layerGroup(),
  rw: L.layerGroup(),
};

// Initialize map
function initMap() {
  map = L.map("map").setView([-6.963, 110.828], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Add all layers to map
  Object.values(layers).forEach((layer) => layer.addTo(map));

  loadAllData();
}

// Load all map data
async function loadAllData() {
  try {
    await Promise.all([
      loadFasilitas(),
      loadUMKM(),
      loadWisata(),
      loadSDA(),
      loadKependudukan(),
    ]);
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// Load Fasilitas
async function loadFasilitas() {
  try {
    const response = await fetch(`${API_URL}/fasilitas`);
    const data = await response.json();

    layers.fasilitas.clearLayers();
    data.forEach((item) => {
      const marker = L.marker([item.latitude, item.longitude]).bindPopup(`
                    <h6>${item.nama}</h6>
                    <p><strong>Jenis:</strong> ${item.jenis}</p>
                `);
      layers.fasilitas.addLayer(marker);
    });
  } catch (error) {
    console.error("Error loading fasilitas:", error);
  }
}

// Load UMKM
async function loadUMKM() {
  try {
    const response = await fetch(`${API_URL}/umkm`);
    const data = await response.json();

    layers.umkm.clearLayers();
    data.forEach((item) => {
      const marker = L.marker([item.latitude, item.longitude], {
        icon: L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).bindPopup(`
                <h6>${item.nama}</h6>
                <p><strong>Jenis:</strong> ${item.jenis}</p>
            `);
      layers.umkm.addLayer(marker);
    });
  } catch (error) {
    console.error("Error loading UMKM:", error);
  }
}

// Load Wisata
async function loadWisata() {
  try {
    const response = await fetch(`${API_URL}/wisata`);
    const data = await response.json();

    layers.wisata.clearLayers();
    data.forEach((item) => {
      const marker = L.marker([item.latitude, item.longitude], {
        icon: L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).bindPopup(`
                <h6>${item.nama}</h6>
                <p><strong>Jenis:</strong> ${item.jenis}</p>
                <p>${item.deskripsi || ""}</p>
            `);
      layers.wisata.addLayer(marker);
    });
  } catch (error) {
    console.error("Error loading wisata:", error);
  }
}

// Load SDA
async function loadSDA() {
  try {
    const response = await fetch(`${API_URL}/sda`);
    const data = await response.json();

    layers.sda.clearLayers();
    data.forEach((item) => {
      const polygon = L.geoJSON(JSON.parse(item.polygon), {
        style: {
          color: getColorByJenisLahan(item.jenis_lahan),
          weight: 2,
          fillOpacity: 0.5,
        },
      }).bindPopup(`
                <h6>Lahan ${item.jenis_lahan}</h6>
                <p><strong>Luas:</strong> ${item.luas_ha} Ha</p>
            `);
      layers.sda.addLayer(polygon);
    });
  } catch (error) {
    console.error("Error loading SDA:", error);
  }
}

// Load Kependudukan
async function loadKependudukan() {
  try {
    const response = await fetch(`${API_URL}/kependudukan`);
    const data = await response.json();

    layers.rw.clearLayers();
    data.forEach((item) => {
      const polygon = L.geoJSON(JSON.parse(item.polygon), {
        style: {
          color: "#333",
          weight: 2,
          fillOpacity: 0.2,
        },
      }).bindPopup(`
                <h6>RW ${item.nomor_rw}</h6>
                <p><strong>Jumlah Warga:</strong> ${item.jumlah_warga}</p>
                <p><strong>Laki-laki:</strong> ${item.laki_laki}</p>
                <p><strong>Perempuan:</strong> ${item.perempuan}</p>
            `);
      layers.rw.addLayer(polygon);
    });
  } catch (error) {
    console.error("Error loading kependudukan:", error);
  }
}

// Helper function for SDA colors
function getColorByJenisLahan(jenis) {
  const colors = {
    Sawah: "#90EE90",
    Kebun: "#228B22",
    Ladang: "#FFD700",
    Pemukiman: "#FF6347",
  };
  return colors[jenis] || "#808080";
}

// Toggle layers
document.getElementById("showFasilitas").addEventListener("change", (e) => {
  if (e.target.checked) {
    map.addLayer(layers.fasilitas);
  } else {
    map.removeLayer(layers.fasilitas);
  }
});

document.getElementById("showUMKM").addEventListener("change", (e) => {
  if (e.target.checked) {
    map.addLayer(layers.umkm);
  } else {
    map.removeLayer(layers.umkm);
  }
});

document.getElementById("showWisata").addEventListener("change", (e) => {
  if (e.target.checked) {
    map.addLayer(layers.wisata);
  } else {
    map.removeLayer(layers.wisata);
  }
});

document.getElementById("showSDA").addEventListener("change", (e) => {
  if (e.target.checked) {
    map.addLayer(layers.sda);
  } else {
    map.removeLayer(layers.sda);
  }
});

document.getElementById("showKependudukan").addEventListener("change", (e) => {
  if (e.target.checked) {
    map.addLayer(layers.rw);
  } else {
    map.removeLayer(layers.rw);
  }
});

// Routing functionality
document.getElementById("routingBtn").addEventListener("click", () => {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
    document.getElementById("routingBtn").textContent = "Aktifkan Routing";
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
    document.getElementById("routingBtn").textContent = "Nonaktifkan Routing";
    alert("Klik pada peta untuk menambahkan titik rute");

    map.on("click", (e) => {
      if (routingControl) {
        const waypoints = routingControl.getWaypoints();
        waypoints.push(L.latLng(e.latlng.lat, e.latlng.lng));
        routingControl.setWaypoints(waypoints);
      }
    });
  }
});

// Search functionality
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  // Implement search logic here
  console.log("Searching for:", searchTerm);
});

// Initialize map on page load
document.addEventListener("DOMContentLoaded", initMap);
