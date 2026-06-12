const LOCAL_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"];
const API_URL = LOCAL_HOSTS.includes(window.location.hostname)
  ? "http://localhost:8000/api"
  : "https://backend-webgis-production.up.railway.app/api";
let authToken = localStorage.getItem("authToken");
let editMap = null;
let editMarker = null;

const ADMIN_DEFAULT_LIMIT = 10;
const ADMIN_LIMIT_OPTIONS = [10, 25, 50];
const adminTableState = {
  fasilitas: { page: 1, limit: ADMIN_DEFAULT_LIMIT },
  umkm: { page: 1, limit: ADMIN_DEFAULT_LIMIT },
  wisata: { page: 1, limit: ADMIN_DEFAULT_LIMIT },
  sda: { page: 1, limit: ADMIN_DEFAULT_LIMIT },
  kependudukan: { page: 1, limit: ADMIN_DEFAULT_LIMIT },
};

const adminTableMeta = {
  fasilitas: {
    tableId: "fasilitasTable",
    colspan: 6,
    loader: loadFasilitasData,
  },
  umkm: { tableId: "umkmTable", colspan: 6, loader: loadUMKMData },
  wisata: { tableId: "wisataTable", colspan: 5, loader: loadWisataData },
  sda: { tableId: "sdaTable", colspan: 4, loader: loadSDAData },
  kependudukan: {
    tableId: "kependudukanTable",
    colspan: 5,
    loader: loadKependudukanData,
  },
};

function buildAdminListUrl(endpoint, entity, extraParams = {}) {
  const state = adminTableState[entity];
  const params = new URLSearchParams({
    page: String(state.page),
    limit: String(state.limit),
    ...extraParams,
  });
  return `${API_URL}/${endpoint}/?${params.toString()}`;
}

function normalizePaginatedPayload(payload, state) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 1,
      limit: payload.length || state.limit,
      total: payload.length,
      total_pages: payload.length ? 1 : 0,
    };
  }

  return {
    items: payload.items || [],
    page: payload.page || state.page,
    limit: payload.limit || state.limit,
    total: payload.total || 0,
    total_pages: payload.total_pages || 0,
  };
}

async function fetchAdminPage(endpoint, entity, extraParams = {}) {
  const state = adminTableState[entity];
  const response = await fetch(
    buildAdminListUrl(endpoint, entity, extraParams),
    {
      headers: { Authorization: `Bearer ${authToken}` },
    },
  );
  const payload = await response.json();
  const meta = normalizePaginatedPayload(payload, state);

  if (
    meta.items.length === 0 &&
    meta.total > 0 &&
    state.page > meta.total_pages
  ) {
    state.page = Math.max(meta.total_pages, 1);
    return fetchAdminPage(endpoint, entity, extraParams);
  }

  state.page = meta.page;
  state.limit = meta.limit;
  return meta;
}

function renderEmptyAdminRow(tableId, colspan, message = "Tidak ada data.") {
  const tbody = document.getElementById(tableId);
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-muted text-center py-4">${escapeHtml(message)}</td></tr>`;
}

function renderAdminPagination(entity, meta) {
  const config = adminTableMeta[entity];
  const state = adminTableState[entity];
  const tbody = document.getElementById(config.tableId);
  const tableWrapper = tbody?.closest(".table-responsive");
  if (!tableWrapper) return;

  let pager = document.getElementById(`${config.tableId}Pagination`);
  if (!pager) {
    pager = document.createElement("div");
    pager.id = `${config.tableId}Pagination`;
    pager.className = "admin-table-pagination";
    tableWrapper.insertAdjacentElement("afterend", pager);
  }

  const start = meta.total ? (meta.page - 1) * meta.limit + 1 : 0;
  const end = Math.min(meta.page * meta.limit, meta.total);
  const totalPages = meta.total_pages || 1;

  pager.innerHTML = `
    <div class="pagination-summary">Menampilkan ${start}-${end} dari ${meta.total} data</div>
    <div class="pagination-controls">
      <select class="form-select form-select-sm" aria-label="Jumlah data per halaman" onchange="changeAdminPageSize('${entity}', this.value)">
        ${ADMIN_LIMIT_OPTIONS.map(
          (option) =>
            `<option value="${option}" ${Number(option) === Number(state.limit) ? "selected" : ""}>${option}/halaman</option>`,
        ).join("")}
      </select>
      <button type="button" class="btn btn-sm btn-outline-secondary" onclick="changeAdminPage('${entity}', ${meta.page - 1})" ${meta.page <= 1 ? "disabled" : ""}>Sebelumnya</button>
      <strong>${meta.page} / ${totalPages}</strong>
      <button type="button" class="btn btn-sm btn-outline-secondary" onclick="changeAdminPage('${entity}', ${meta.page + 1})" ${meta.page >= totalPages ? "disabled" : ""}>Berikutnya</button>
    </div>
  `;
}

function changeAdminPage(entity, page) {
  const config = adminTableMeta[entity];
  if (!config || page < 1) return;
  adminTableState[entity].page = page;
  config.loader();
}

function changeAdminPageSize(entity, limit) {
  const config = adminTableMeta[entity];
  if (!config) return;
  adminTableState[entity].limit = Number(limit) || ADMIN_DEFAULT_LIMIT;
  adminTableState[entity].page = 1;
  config.loader();
}

window.changeAdminPage = changeAdminPage;
window.changeAdminPageSize = changeAdminPageSize;

// Toast functions
function showToast(type, message) {
  const toastEl = document.getElementById(
    type === "success" ? "successToast" : "errorToast",
  );
  const messageEl = document.getElementById(
    type === "success" ? "successToastMessage" : "errorToastMessage",
  );
  messageEl.textContent = message;
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
}

// Loading overlay functions
function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

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

  console.log("Starting data load...");
  const startTime = Date.now();
  showLoading();
  Promise.all([
    loadFasilitasData(),
    loadUMKMData(),
    loadWisataData(),
    loadSDAData(),
    loadKependudukanData(),
  ])
    .then(() => {
      const endTime = Date.now();
      console.log(`Data loaded in ${endTime - startTime}ms`);
      hideLoading();
    })
    .catch((err) => {
      const endTime = Date.now();
      console.error(`Data load failed after ${endTime - startTime}ms:`, err);
      hideLoading();
      showToast("error", "Gagal memuat data");
    });
}

// ===== FASILITAS CRUD =====
async function loadFasilitasData() {
  console.log("Loading Fasilitas...");
  const start = Date.now();
  try {
    const meta = await fetchAdminPage("fasilitas", "fasilitas");
    const data = meta.items;

    const tbody = document.getElementById("fasilitasTable");
    if (!data.length) {
      renderEmptyAdminRow("fasilitasTable", 6);
      renderAdminPagination("fasilitas", meta);
      return;
    }

    const rows = data
      .map(
        (item) => `
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
    `,
      )
      .join("");

    tbody.innerHTML = rows;
    renderAdminPagination("fasilitas", meta);
    console.log(`Fasilitas loaded in ${Date.now() - start}ms`);
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
    .catch((err) => showToast("error", "Error: " + err.message));
}

function editFasilitas(id) {
  console.log("Editing fasilitas", id);
  fetch(`${API_URL}/fasilitas/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then((res) => res.json())
    .then((item) => {
      console.log("Fasilitas data:", item);
      openEditModal("fasilitas", id, item);
    })
    .catch((err) => {
      console.error("Error fetching fasilitas:", err);
      showToast("error", "Gagal memuat data fasilitas");
    });
}

function deleteFasilitas(id) {
  if (!confirm("Hapus fasilitas ini?")) return;

  fetch(`${API_URL}/fasilitas/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then(() => {
      showToast("success", "Fasilitas berhasil dihapus");
      loadFasilitasData();
    })
    .catch((err) => showToast("error", "Error: " + err.message));
}

// ===== UMKM CRUD =====
async function loadUMKMData() {
  console.log("Loading UMKM...");
  const start = Date.now();
  try {
    const meta = await fetchAdminPage("umkm", "umkm");
    const data = meta.items;

    const tbody = document.getElementById("umkmTable");
    if (!data.length) {
      renderEmptyAdminRow("umkmTable", 6);
      renderAdminPagination("umkm", meta);
      return;
    }

    tbody.innerHTML = data
      .map(
        (item) => `
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
      `,
      )
      .join("");
    renderAdminPagination("umkm", meta);
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
    .catch((err) => showToast("error", "Error: " + err.message));
}

function editUMKM(id) {
  fetch(`${API_URL}/umkm/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then((res) => res.json())
    .then((item) => {
      openEditModal("umkm", id, item);
    });
}

function deleteUMKM(id) {
  if (!confirm("Hapus UMKM ini?")) return;

  fetch(`${API_URL}/umkm/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then(() => {
      showToast("success", "UMKM berhasil dihapus");
      loadUMKMData();
    })
    .catch((err) => showToast("error", "Error: " + err.message));
}

// ===== WISATA CRUD =====
async function loadWisataData() {
  console.log("Loading Wisata...");
  const start = Date.now();
  try {
    const meta = await fetchAdminPage("wisata", "wisata");
    const data = meta.items;

    const tbody = document.getElementById("wisataTable");
    if (!data.length) {
      renderEmptyAdminRow("wisataTable", 5);
      renderAdminPagination("wisata", meta);
      return;
    }

    tbody.innerHTML = data
      .map(
        (item) => `
        <tr>
          <td>${item.id_wisata}</td>
          <td>${escapeHtml(item.nama)}</td>
          <td>${escapeHtml(item.jenis)}</td>
          <td>${item.deskripsi ? escapeHtml(item.deskripsi.substring(0, 50)) + "..." : "-"}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-info" data-nama="${escapeAttr(item.nama)}" onclick="managePhotos(${item.id_wisata}, this.dataset.nama)">Foto</button>
              <button class="btn btn-warning" onclick="editWisata(${item.id_wisata})">Edit</button>
              <button class="btn btn-danger" onclick="deleteWisata(${item.id_wisata})">Hapus</button>
            </div>
          </td>
        </tr>
      `,
      )
      .join("");
    renderAdminPagination("wisata", meta);
    console.log(`Wisata loaded in ${Date.now() - start}ms`);
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
    .catch((err) => showToast("error", "Error: " + err.message));
}

function editWisata(id) {
  fetch(`${API_URL}/wisata/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then((res) => res.json())
    .then((item) => {
      openEditModal("wisata", id, item);
    });
}

function deleteWisata(id) {
  if (!confirm("Hapus wisata ini?")) return;

  fetch(`${API_URL}/wisata/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then(() => {
      showToast("success", "Wisata berhasil dihapus");
      loadWisataData();
    })
    .catch((err) => showToast("error", "Error: " + err.message));
}

// ===== SDA CRUD WITH MAP DRAWING =====
let drawMap, drawnItems, drawControl, drawnPolygon;

async function loadSDAData() {
  console.log("Loading SDA...");
  const start = Date.now();
  try {
    const meta = await fetchAdminPage("sda", "sda", {
      include_geometry: "false",
    });
    const data = meta.items;
    console.log(`SDA API returned ${meta.total} records`);

    const tbody = document.getElementById("sdaTable");
    if (!data.length) {
      renderEmptyAdminRow("sdaTable", 4);
      renderAdminPagination("sda", meta);
      return;
    }

    // Build all rows at once instead of += in loop (massive performance improvement)
    const rows = data
      .map(
        (item) => `
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
    `,
      )
      .join("");

    tbody.innerHTML = rows;
    renderAdminPagination("sda", meta);
    console.log(`SDA loaded in ${Date.now() - start}ms`);
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
  console.log("Loading Kependudukan...");
  const start = Date.now();
  try {
    const meta = await fetchAdminPage("kependudukan", "kependudukan", {
      include_geometry: "false",
    });
    const data = meta.items;

    const tbody = document.getElementById("kependudukanTable");
    if (!data.length) {
      renderEmptyAdminRow("kependudukanTable", 5);
      renderAdminPagination("kependudukan", meta);
      return;
    }

    tbody.innerHTML = data
      .map((item) => {
        const areaLabel =
          item.nomor_rt !== undefined && item.nomor_rt !== null
            ? `RT ${item.nomor_rt} / RW ${item.nomor_rw}`
            : `RW ${item.nomor_rw}`;
        return `
        <tr>
          <td>${escapeHtml(areaLabel)}</td>
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
      })
      .join("");
    renderAdminPagination("kependudukan", meta);
    console.log(`Kependudukan loaded in ${Date.now() - start}ms`);
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
      openEditModal("kependudukan", id, item);
    });
}

// XSS Protection
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return escapeHtml(String(text ?? "")).replace(/`/g, "&#96;");
}

function isSafeImageSrc(value) {
  if (!value || typeof value !== "string") return false;

  const trimmed = value.trim();
  if (
    /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(trimmed)
  ) {
    return true;
  }

  return false;
}

function safeImageSrc(value) {
  return isSafeImageSrc(value) ? value.trim() : "";
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
      .map((p) => {
        const src = safeImageSrc(p.foto_base64);
        if (!src) return "";
        return `
      <div class="col-md-4">
        <div class="card">
          <img src="${escapeAttr(src)}" class="card-img-top" style="height:150px; object-fit:cover" alt="Foto wisata">
          <div class="card-body p-2">
            <button class="btn btn-danger btn-sm w-100" onclick="deletePhoto(${p.id_foto}, ${id})">Hapus</button>
          </div>
        </div>
      </div>
    `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading photos:", error);
  }
}

async function uploadPhoto(id) {
  const input = document.getElementById("photoInput");
  const file = input.files[0];
  if (!file) return alert("Pilih foto terlebih dahulu");
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return alert("Format foto harus JPEG, PNG, atau WebP");
  }
  if (file.size > 5 * 1024 * 1024) {
    return alert("Ukuran foto maksimal 5 MB");
  }

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

// ===== EDIT MODAL FUNCTIONS =====
const editableExtraFields = {
  fasilitas: [
    { name: "deskripsi", label: "Deskripsi", type: "textarea", rows: 3 },
    { name: "lokasi", label: "Lokasi", type: "textarea", rows: 2 },
    { name: "jam_operasional", label: "Jam Operasional", type: "text" },
    {
      name: "fasilitas_pendukung",
      label: "Fasilitas Pendukung",
      type: "textarea",
      rows: 2,
    },
  ],
  umkm: [
    { name: "pemilik", label: "Pemilik", type: "text" },
    { name: "lokasi", label: "Lokasi", type: "textarea", rows: 2 },
    { name: "produk", label: "Produk", type: "textarea", rows: 2 },
    { name: "jam_operasional", label: "Jam Operasional", type: "text" },
    {
      name: "fasilitas_pendukung",
      label: "Fasilitas Pendukung",
      type: "textarea",
      rows: 2,
    },
  ],
  wisata: [
    { name: "cagar_budaya", label: "Cagar Budaya", type: "textarea", rows: 2 },
    { name: "lokasi", label: "Lokasi", type: "textarea", rows: 2 },
    { name: "tarif", label: "Tarif", type: "text" },
    { name: "fasilitas", label: "Fasilitas", type: "textarea", rows: 2 },
  ],
};

function getExtraFieldId(fieldName) {
  return `editExtra_${fieldName}`;
}

function renderAdditionalEditFields(entity, data) {
  const container = document.getElementById("additionalEditFields");
  if (!container) return;

  const fields = editableExtraFields[entity] || [];
  container.innerHTML = fields
    .map((field) => {
      const value = data[field.name] || "";
      const id = getExtraFieldId(field.name);
      if (field.type === "textarea") {
        return `<div class="mb-3"><label for="${escapeAttr(id)}" class="form-label">${escapeHtml(field.label)}</label><textarea class="form-control" id="${escapeAttr(id)}" rows="${field.rows || 2}">${escapeHtml(value)}</textarea></div>`;
      }

      return `<div class="mb-3"><label for="${escapeAttr(id)}" class="form-label">${escapeHtml(field.label)}</label><input type="text" class="form-control" id="${escapeAttr(id)}" value="${escapeAttr(value)}" /></div>`;
    })
    .join("");
}

function collectAdditionalEditFields(entity, body) {
  const fields = editableExtraFields[entity] || [];
  fields.forEach((field) => {
    const input = document.getElementById(getExtraFieldId(field.name));
    body[field.name] = input ? input.value : "";
  });
}

function openEditModal(entity, id, data) {
  console.log("openEditModal called:", entity, id, data);
  document.getElementById("editEntity").value = entity;
  document.getElementById("editId").value = id;

  // Hide all conditional fields first
  document.getElementById("editDeskripsiGroup").style.display = "none";
  document.getElementById("kependudukanFields").style.display = "none";
  renderAdditionalEditFields(entity, {});

  if (entity === "kependudukan") {
    // Kependudukan doesn't have nama/jenis, hide those fields
    document.getElementById("editNamaGroup").style.display = "none";
    document.getElementById("editJenisGroup").style.display = "none";
    document.getElementById("kependudukanFields").style.display = "block";

    // Populate kependudukan fields
    document.getElementById("editJumlahWarga").value = data.jumlah_warga;
    document.getElementById("editLakiLaki").value = data.laki_laki;
    document.getElementById("editPerempuan").value = data.perempuan;
    document.getElementById("editAnakAnak").value = data.anak_anak || 0;
    document.getElementById("editProduktif").value = data.produktif || 0;
    document.getElementById("editLansia").value = data.lansia || 0;

    // Kependudukan uses RW coordinates
    document.getElementById("editLatitude").value = data.rw?.latitude || 0;
    document.getElementById("editLongitude").value = data.rw?.longitude || 0;
  } else {
    // Show nama/jenis for other entities
    document.getElementById("editNamaGroup").style.display = "block";
    document.getElementById("editJenisGroup").style.display = "block";
    document.getElementById("editNama").value = data.nama;
    document.getElementById("editJenis").value = data.jenis;
    document.getElementById("editLatitude").value = data.latitude;
    document.getElementById("editLongitude").value = data.longitude;

    if (entity === "wisata") {
      document.getElementById("editDeskripsiGroup").style.display = "block";
      document.getElementById("editDeskripsi").value = data.deskripsi || "";
    } else {
      document.getElementById("editDeskripsi").value = "";
    }

    renderAdditionalEditFields(entity, data);
  }

  document.getElementById("editModalTitle").textContent =
    `Edit ${entity.charAt(0).toUpperCase() + entity.slice(1)}`;

  console.log("Showing modal...");
  const overlayDisplay =
    document.getElementById("loadingOverlay").style.display;
  console.log("Loading overlay display:", overlayDisplay);
  try {
    const modalEl = document.getElementById("editModal");
    console.log("Modal element:", modalEl);
    console.log("Bootstrap available:", typeof bootstrap !== "undefined");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    console.log("Modal shown");
  } catch (err) {
    console.error("Error showing modal:", err);
  }

  // Initialize map when location tab is shown
  const lat =
    entity === "kependudukan" ? data.rw?.latitude || -6.8 : data.latitude;
  const lng =
    entity === "kependudukan" ? data.rw?.longitude || 111.0 : data.longitude;

  const locationTab = document.getElementById("location-tab");
  locationTab.addEventListener(
    "shown.bs.tab",
    function () {
      setTimeout(() => {
        if (!editMap) {
          editMap = L.map("editMap").setView([lat, lng], 16);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(editMap);

          editMarker = L.marker([lat, lng], { draggable: true }).addTo(editMap);

          editMarker.on("dragend", function () {
            const pos = editMarker.getLatLng();
            document.getElementById("editLatitude").value = pos.lat.toFixed(6);
            document.getElementById("editLongitude").value = pos.lng.toFixed(6);
          });
        } else {
          editMap.setView([lat, lng], 16);
          editMarker.setLatLng([lat, lng]);
          editMap.invalidateSize();
        }
      }, 100);
    },
    { once: true },
  );
}

function updateMarkerFromInputs() {
  const lat = parseFloat(document.getElementById("editLatitude").value);
  const lng = parseFloat(document.getElementById("editLongitude").value);
  if (!isNaN(lat) && !isNaN(lng) && editMarker) {
    editMarker.setLatLng([lat, lng]);
    editMap.setView([lat, lng]);
  }
}

document.getElementById("saveEditBtn").addEventListener("click", function () {
  const entity = document.getElementById("editEntity").value;
  const id = document.getElementById("editId").value;

  let body = {};

  if (entity === "kependudukan") {
    const jumlah_warga = parseInt(
      document.getElementById("editJumlahWarga").value,
    );
    const laki_laki = parseInt(document.getElementById("editLakiLaki").value);
    const perempuan = parseInt(document.getElementById("editPerempuan").value);
    const anak_anak = parseInt(document.getElementById("editAnakAnak").value);
    const produktif = parseInt(document.getElementById("editProduktif").value);
    const lansia = parseInt(document.getElementById("editLansia").value);

    if (isNaN(jumlah_warga) || isNaN(laki_laki) || isNaN(perempuan)) {
      showToast("error", "Jumlah warga, laki-laki, dan perempuan harus diisi");
      return;
    }

    // Get original data to preserve other fields
    fetch(`${API_URL}/kependudukan/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => res.json())
      .then((item) => {
        body = {
          jumlah_warga,
          laki_laki,
          perempuan,
          anak_anak: anak_anak || 0,
          produktif: produktif || 0,
          lansia: lansia || 0,
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
        };

        return fetch(`${API_URL}/${entity}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(body),
        });
      })
      .then((res) => {
        if (res.ok) {
          showToast("success", "Kependudukan berhasil diupdate");
          bootstrap.Modal.getInstance(
            document.getElementById("editModal"),
          ).hide();
          loadKependudukanData();
        } else {
          showToast("error", "Gagal mengupdate data");
        }
      })
      .catch(() => showToast("error", "Terjadi kesalahan"));
  } else {
    const nama = document.getElementById("editNama").value;
    const jenis = document.getElementById("editJenis").value;
    const latitude = parseFloat(document.getElementById("editLatitude").value);
    const longitude = parseFloat(
      document.getElementById("editLongitude").value,
    );

    if (!nama || !jenis || isNaN(latitude) || isNaN(longitude)) {
      showToast("error", "Semua field harus diisi dengan benar");
      return;
    }

    body = { nama, jenis, latitude, longitude };
    if (entity === "wisata") {
      body.deskripsi = document.getElementById("editDeskripsi").value;
    }
    collectAdditionalEditFields(entity, body);

    fetch(`${API_URL}/${entity}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.ok) {
          showToast(
            "success",
            `${entity.charAt(0).toUpperCase() + entity.slice(1)} berhasil diupdate`,
          );
          bootstrap.Modal.getInstance(
            document.getElementById("editModal"),
          ).hide();

          // Reload appropriate data
          if (entity === "fasilitas") loadFasilitasData();
          else if (entity === "umkm") loadUMKMData();
          else if (entity === "wisata") loadWisataData();
          else if (entity === "sda") loadSDAData();
        } else {
          showToast("error", "Gagal mengupdate data");
        }
      })
      .catch(() => showToast("error", "Terjadi kesalahan"));
  }
});
