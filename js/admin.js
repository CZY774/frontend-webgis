const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000/api"
    : "https://backend-webgis-production.up.railway.app/api";
let authToken = localStorage.getItem("authToken");

if (authToken) {
  showDashboard();
}

// Login form handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      authToken = data.access_token;
      localStorage.setItem("authToken", authToken);
      showDashboard();
    } else {
      document.getElementById("loginError").textContent =
        "Username atau password salah";
      document.getElementById("loginError").style.display = "block";
    }
  } catch (error) {
    document.getElementById("loginError").textContent =
      "Terjadi kesalahan koneksi";
    document.getElementById("loginError").style.display = "block";
  }
});

// Logout handler
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  authToken = null;
  location.reload();
});

function showDashboard() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboardSection").style.display = "block";
  document.getElementById("logoutBtn").style.display = "block";

  loadFasilitasData();
  loadUMKMData();
  loadWisataData();
  loadSDAData();
  loadKependudukanData();
}

// ===== FASILITAS CRUD =====
async function loadFasilitasData() {
  try {
    const response = await fetch(`${API_URL}/fasilitas/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();

    const tbody = document.getElementById("fasilitasTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
        <tr>
          <td>${item.id_fasilitas}</td>
          <td>${escapeHtml(item.nama)}</td>
          <td>${escapeHtml(item.jenis)}</td>
          <td>${item.latitude}</td>
          <td>${item.longitude}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-warning" onclick="editFasilitas(${item.id_fasilitas})">Edit</button>
              <button class="btn btn-danger" onclick="deleteFasilitas(${item.id_fasilitas})">Hapus</button>
            </div>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading fasilitas:", error);
  }
}

function createFasilitas() {
  const nama = prompt("Nama Fasilitas:");
  const jenis = prompt(
    "Jenis (Pendidikan/Kesehatan/Pemerintahan/Sosial Umum/Keagamaan/Olahraga):",
  );
  const latitude = parseFloat(prompt("Latitude:"));
  const longitude = parseFloat(prompt("Longitude:"));

  if (!nama || !jenis || !latitude || !longitude) return;

  fetch(`${API_URL}/fasilitas/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ nama, jenis, latitude, longitude }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Fasilitas berhasil ditambahkan");
      loadFasilitasData();
    })
    .catch((err) => alert("Error: " + err.message));
}

function editFasilitas(id) {
  fetch(`${API_URL}/fasilitas/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then((res) => res.json())
    .then((item) => {
      const nama = prompt("Nama Fasilitas:", item.nama);
      const jenis = prompt("Jenis:", item.jenis);
      const latitude = parseFloat(prompt("Latitude:", item.latitude));
      const longitude = parseFloat(prompt("Longitude:", item.longitude));

      if (!nama || !jenis || !latitude || !longitude) return;

      fetch(`${API_URL}/fasilitas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ nama, jenis, latitude, longitude }),
      })
        .then(() => {
          alert("Fasilitas berhasil diupdate");
          loadFasilitasData();
        })
        .catch((err) => alert("Error: " + err.message));
    });
}

function deleteFasilitas(id) {
  if (!confirm("Hapus fasilitas ini?")) return;

  fetch(`${API_URL}/fasilitas/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then(() => {
      alert("Fasilitas berhasil dihapus");
      loadFasilitasData();
    })
    .catch((err) => alert("Error: " + err.message));
}

// ===== UMKM CRUD =====
async function loadUMKMData() {
  try {
    const response = await fetch(`${API_URL}/umkm/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();

    const tbody = document.getElementById("umkmTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
        <tr>
          <td>${item.id_umkm}</td>
          <td>${escapeHtml(item.nama)}</td>
          <td>${escapeHtml(item.jenis)}</td>
          <td>${item.latitude}</td>
          <td>${item.longitude}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-warning" onclick="editUMKM(${item.id_umkm})">Edit</button>
              <button class="btn btn-danger" onclick="deleteUMKM(${item.id_umkm})">Hapus</button>
            </div>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading UMKM:", error);
  }
}

function createUMKM() {
  const nama = prompt("Nama UMKM:");
  const jenis = prompt("Jenis (Kuliner/Fashion/Salon/Bengkel/dll):");
  const latitude = parseFloat(prompt("Latitude:"));
  const longitude = parseFloat(prompt("Longitude:"));

  if (!nama || !jenis || !latitude || !longitude) return;

  fetch(`${API_URL}/umkm/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ nama, jenis, latitude, longitude }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("UMKM berhasil ditambahkan");
      loadUMKMData();
    })
    .catch((err) => alert("Error: " + err.message));
}

function editUMKM(id) {
  fetch(`${API_URL}/umkm/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then((res) => res.json())
    .then((item) => {
      const nama = prompt("Nama UMKM:", item.nama);
      const jenis = prompt("Jenis:", item.jenis);
      const latitude = parseFloat(prompt("Latitude:", item.latitude));
      const longitude = parseFloat(prompt("Longitude:", item.longitude));

      if (!nama || !jenis || !latitude || !longitude) return;

      fetch(`${API_URL}/umkm/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ nama, jenis, latitude, longitude }),
      })
        .then(() => {
          alert("UMKM berhasil diupdate");
          loadUMKMData();
        })
        .catch((err) => alert("Error: " + err.message));
    });
}

function deleteUMKM(id) {
  if (!confirm("Hapus UMKM ini?")) return;

  fetch(`${API_URL}/umkm/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then(() => {
      alert("UMKM berhasil dihapus");
      loadUMKMData();
    })
    .catch((err) => alert("Error: " + err.message));
}

// ===== WISATA CRUD =====
async function loadWisataData() {
  try {
    const response = await fetch(`${API_URL}/wisata/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();

    const tbody = document.getElementById("wisataTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
        <tr>
          <td>${item.id_wisata}</td>
          <td>${escapeHtml(item.nama)}</td>
          <td>${escapeHtml(item.jenis)}</td>
          <td>${item.deskripsi ? escapeHtml(item.deskripsi.substring(0, 50)) + "..." : "-"}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-info" onclick="managePhotos(${item.id_wisata}, '${escapeHtml(item.nama)}')">Foto</button>
              <button class="btn btn-warning" onclick="editWisata(${item.id_wisata})">Edit</button>
              <button class="btn btn-danger" onclick="deleteWisata(${item.id_wisata})">Hapus</button>
            </div>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading wisata:", error);
  }
}

function createWisata() {
  const nama = prompt("Nama Wisata:");
  const jenis = prompt("Jenis (Alam/Religi):");
  const latitude = parseFloat(prompt("Latitude:"));
  const longitude = parseFloat(prompt("Longitude:"));
  const deskripsi = prompt("Deskripsi (opsional):");

  if (!nama || !jenis || !latitude || !longitude) return;

  fetch(`${API_URL}/wisata/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ nama, jenis, latitude, longitude, deskripsi }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Wisata berhasil ditambahkan");
      loadWisataData();
    })
    .catch((err) => alert("Error: " + err.message));
}

function editWisata(id) {
  fetch(`${API_URL}/wisata/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then((res) => res.json())
    .then((item) => {
      const nama = prompt("Nama Wisata:", item.nama);
      const jenis = prompt("Jenis:", item.jenis);
      const latitude = parseFloat(prompt("Latitude:", item.latitude));
      const longitude = parseFloat(prompt("Longitude:", item.longitude));
      const deskripsi = prompt("Deskripsi:", item.deskripsi || "");

      if (!nama || !jenis || !latitude || !longitude) return;

      fetch(`${API_URL}/wisata/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ nama, jenis, latitude, longitude, deskripsi }),
      })
        .then(() => {
          alert("Wisata berhasil diupdate");
          loadWisataData();
        })
        .catch((err) => alert("Error: " + err.message));
    });
}

function deleteWisata(id) {
  if (!confirm("Hapus wisata ini?")) return;

  fetch(`${API_URL}/wisata/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then(() => {
      alert("Wisata berhasil dihapus");
      loadWisataData();
    })
    .catch((err) => alert("Error: " + err.message));
}

// ===== SDA CRUD WITH MAP DRAWING =====
let drawMap, drawnItems, drawControl, drawnPolygon;

async function loadSDAData() {
  try {
    const response = await fetch(`${API_URL}/sda/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();

    const tbody = document.getElementById("sdaTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
        <tr>
          <td>${item.id_sda}</td>
          <td>${escapeHtml(item.jenis_lahan)}</td>
          <td>${item.luas_ha}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-danger" onclick="deleteSDA(${item.id_sda})">Hapus</button>
            </div>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading SDA:", error);
  }
}

function openMapDrawer() {
  document.getElementById("mapDrawer").style.display = "block";
  setTimeout(() => {
    if (!drawMap) {
      drawMap = L.map("drawMap").setView([-6.7833, 111.0333], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        drawMap,
      );

      drawnItems = new L.FeatureGroup();
      drawMap.addLayer(drawnItems);

      drawControl = new L.Control.Draw({
        draw: {
          polygon: true,
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });
      drawMap.addControl(drawControl);

      drawMap.on(L.Draw.Event.CREATED, (e) => {
        drawnItems.clearLayers();
        drawnPolygon = e.layer;
        drawnItems.addLayer(drawnPolygon);
      });
    }
    drawMap.invalidateSize();
  }, 100);
}

function closeMapDrawer() {
  document.getElementById("mapDrawer").style.display = "none";
  if (drawnItems) drawnItems.clearLayers();
  drawnPolygon = null;
}

async function saveSDA() {
  if (!drawnPolygon) return alert("Gambar polygon terlebih dahulu");

  const geojson = drawnPolygon.toGeoJSON();
  const jenis = document.getElementById("jenisLahan").value;
  const coords = geojson.geometry.coordinates[0];
  const luas = calculateArea(coords);

  try {
    const response = await fetch(`${API_URL}/sda/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        polygon: geojson.geometry,
        jenis_lahan: jenis,
        luas_ha: luas,
      }),
    });

    if (response.ok) {
      alert("Lahan berhasil ditambahkan");
      closeMapDrawer();
      loadSDAData();
    } else {
      alert("Gagal menambahkan lahan");
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
}

function calculateArea(coords) {
  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1];
  }
  return Math.abs(area / 2) * 12100;
}

async function deleteSDA(id) {
  if (!confirm("Hapus lahan ini?")) return;

  try {
    await fetch(`${API_URL}/sda/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    alert("Lahan berhasil dihapus");
    loadSDAData();
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// ===== KEPENDUDUKAN CRUD =====
async function loadKependudukanData() {
  try {
    const response = await fetch(`${API_URL}/kependudukan/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();

    const tbody = document.getElementById("kependudukanTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
        <tr>
          <td>RW ${item.nomor_rw}</td>
          <td>${item.jumlah_warga}</td>
          <td>${item.laki_laki}</td>
          <td>${item.perempuan}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-warning" onclick="editKependudukan(${item.id_kependudukan})">Edit</button>
            </div>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading kependudukan:", error);
  }
}

function editKependudukan(id) {
  fetch(`${API_URL}/kependudukan/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then((res) => res.json())
    .then((item) => {
      const jumlah_warga = parseInt(prompt("Jumlah Warga:", item.jumlah_warga));
      const laki_laki = parseInt(prompt("Laki-laki:", item.laki_laki));
      const perempuan = parseInt(prompt("Perempuan:", item.perempuan));
      const anak_anak = parseInt(prompt("Anak-anak:", item.anak_anak));
      const produktif = parseInt(prompt("Produktif:", item.produktif));
      const lansia = parseInt(prompt("Lansia:", item.lansia));

      if (isNaN(jumlah_warga) || isNaN(laki_laki) || isNaN(perempuan)) return;

      fetch(`${API_URL}/kependudukan/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          jumlah_warga,
          laki_laki,
          perempuan,
          anak_anak,
          produktif,
          lansia,
          tidak_sekolah: item.tidak_sekolah,
          tidak_tamat_sd: item.tidak_tamat_sd,
          tamat_sd: item.tamat_sd,
          sltp: item.sltp,
          slta: item.slta,
          diploma_s1: item.diploma_s1,
          belum_bekerja: item.belum_bekerja,
          pelajar: item.pelajar,
          mengurus_rt: item.mengurus_rt,
          wiraswasta: item.wiraswasta,
          petani: item.petani,
          lainnya: item.lainnya,
        }),
      })
        .then(() => {
          alert("Kependudukan berhasil diupdate");
          loadKependudukanData();
        })
        .catch((err) => alert("Error: " + err.message));
    });
}

// XSS Protection
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== PHOTO MANAGEMENT FOR WISATA =====
function managePhotos(id, nama) {
  const modal = document.createElement("div");
  modal.innerHTML = `
    <div class="modal fade show" style="display:block; background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Kelola Foto - ${escapeHtml(nama)}</h5>
            <button type="button" class="btn-close" onclick="this.closest('.modal').parentElement.remove()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Upload Foto (Max 15)</label>
              <input type="file" class="form-control" id="photoInput" accept="image/*">
              <button class="btn btn-primary mt-2" onclick="uploadPhoto(${id})">Upload</button>
            </div>
            <div id="photoGallery" class="row g-2"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  loadPhotos(id);
}

async function loadPhotos(id) {
  try {
    const response = await fetch(`${API_URL}/wisata/${id}/photos`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const photos = await response.json();

    const gallery = document.getElementById("photoGallery");
    gallery.innerHTML = photos
      .map(
        (p) => `
      <div class="col-md-4">
        <div class="card">
          <img src="${p.foto_base64}" class="card-img-top" style="height:150px; object-fit:cover">
          <div class="card-body p-2">
            <button class="btn btn-danger btn-sm w-100" onclick="deletePhoto(${p.id_foto}, ${id})">Hapus</button>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading photos:", error);
  }
}

async function uploadPhoto(id) {
  const input = document.getElementById("photoInput");
  const file = input.files[0];
  if (!file) return alert("Pilih foto terlebih dahulu");

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const response = await fetch(`${API_URL}/wisata/photo/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          id_wisata: id,
          foto_base64: e.target.result,
        }),
      });

      if (response.ok) {
        alert("Foto berhasil diupload");
        input.value = "";
        loadPhotos(id);
      } else {
        const error = await response.json();
        alert(error.detail || "Gagal upload foto");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };
  reader.readAsDataURL(file);
}

async function deletePhoto(idFoto, idWisata) {
  if (!confirm("Hapus foto ini?")) return;

  try {
    await fetch(`${API_URL}/wisata/photo/${idFoto}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    alert("Foto berhasil dihapus");
    loadPhotos(idWisata);
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// Attach create functions to buttons
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const buttons = document.querySelectorAll(".btn-success");
    buttons.forEach((btn, idx) => {
      if (idx === 0) btn.onclick = createFasilitas;
      else if (idx === 1) btn.onclick = createUMKM;
      else if (idx === 2) btn.onclick = createWisata;
    });
  }, 500);
});
