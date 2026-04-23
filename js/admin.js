const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api' 
    : 'https://backend-webgis-production.up.railway.app/api';
let authToken = localStorage.getItem("authToken");

// Check if already logged in
if (authToken) {
  showDashboard();
}

// Login form handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    // OAuth2 expects form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login/`, {
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

// Show dashboard
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

// Load Fasilitas data
async function loadFasilitasData() {
  try {
    const response = await fetch(`${API_URL}/fasilitas/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();

    const tbody = document.getElementById("fasilitasTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
                <tr>
                    <td>${item.id_fasilitas}</td>
                    <td>${item.nama}</td>
                    <td>${item.jenis}</td>
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

// Load UMKM data
async function loadUMKMData() {
  try {
    const response = await fetch(`${API_URL}/umkm/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();

    const tbody = document.getElementById("umkmTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
                <tr>
                    <td>${item.id_umkm}</td>
                    <td>${item.nama}</td>
                    <td>${item.jenis}</td>
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

// Load Wisata data
async function loadWisataData() {
  try {
    const response = await fetch(`${API_URL}/wisata/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();

    const tbody = document.getElementById("wisataTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
                <tr>
                    <td>${item.id_wisata}</td>
                    <td>${item.nama}</td>
                    <td>${item.jenis}</td>
                    <td>${item.deskripsi ? item.deskripsi.substring(0, 50) + "..." : "-"}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
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

// Load SDA data
async function loadSDAData() {
  try {
    const response = await fetch(`${API_URL}/sda/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();

    const tbody = document.getElementById("sdaTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
                <tr>
                    <td>${item.id_sda}</td>
                    <td>${item.jenis_lahan}</td>
                    <td>${item.luas_ha}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-warning" onclick="editSDA(${item.id_sda})">Edit</button>
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

// Load Kependudukan data
async function loadKependudukanData() {
  try {
    const response = await fetch(`${API_URL}/kependudukan/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();

    const tbody = document.getElementById("kependudukanTable");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
                <tr>
                    <td>RW ${item.nomor_rw}</td>
                    <td>${item.jumlah_warga}</td>
                    <td>${item.laki_laki} / ${item.perempuan}</td>
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

// CRUD functions (placeholders)
function editFasilitas(id) {
  alert("Edit fasilitas ID: " + id);
}

function deleteFasilitas(id) {
  if (confirm("Hapus fasilitas ini?")) {
    // Implement delete logic
    alert("Delete fasilitas ID: " + id);
  }
}

function editUMKM(id) {
  alert("Edit UMKM ID: " + id);
}

function deleteUMKM(id) {
  if (confirm("Hapus UMKM ini?")) {
    alert("Delete UMKM ID: " + id);
  }
}

function editWisata(id) {
  alert("Edit wisata ID: " + id);
}

function deleteWisata(id) {
  if (confirm("Hapus wisata ini?")) {
    alert("Delete wisata ID: " + id);
  }
}

function editSDA(id) {
  alert("Edit SDA ID: " + id);
}

function deleteSDA(id) {
  if (confirm("Hapus SDA ini?")) {
    alert("Delete SDA ID: " + id);
  }
}

function editKependudukan(id) {
  alert("Edit kependudukan ID: " + id);
}
