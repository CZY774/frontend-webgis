// XSS Protection Utility
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// API Client with error handling
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000/api"
    : "https://backend-webgis-production.up.railway.app/api";

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

function showError(message) {
  // Simple error display - can be enhanced with toast notifications
  alert(message);
}

function showLoading(show = true) {
  const loader = document.getElementById("loading");
  if (loader) {
    loader.style.display = show ? "block" : "none";
  }
}
