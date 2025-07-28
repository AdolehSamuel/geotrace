const API_URL = "https://geotrace-proxy.onrender.com/api/lookup";

const ipAddressEl = document.getElementById("ip-address");
const locationEl = document.getElementById("location");
const timezoneEl = document.getElementById("timezone");
const ispEl = document.getElementById("isp");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

let map, marker;

const errorEl = document.createElement("div");
errorEl.id = "error-message";
errorEl.style.color = "#d32f2f";
errorEl.style.margin = "10px 0";
errorEl.style.fontWeight = "500";
errorEl.setAttribute("role", "alert");
searchForm.parentNode.insertBefore(errorEl, searchForm.nextSibling);
errorEl.style.display = "none";

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function hideError() {
  errorEl.textContent = "";
  errorEl.style.display = "none";
}

// Helper to update the results card
function updateResults(data) {
  ipAddressEl.textContent = data.ip || "-";
  locationEl.textContent = data.location
    ? `${data.location.city}, ${data.location.region}, ${
        data.location.country
      } ${data.location.postalCode || ""}`
    : "-";
  timezoneEl.textContent = data.location
    ? `UTC ${data.location.timezone}`
    : "-";
  ispEl.textContent = data.isp || "-";
}

// Helper to update the map
function updateMap(lat, lng) {
  if (!map) {
    map = L.map("map").setView([lat, lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );
    marker = L.marker([lat, lng]).addTo(map);
  } else {
    map.setView([lat, lng], 13);
    marker.setLatLng([lat, lng]);
  }
}

// Fetch IP/location data
async function fetchIPData(query = "") {
  let url = API_URL;
  if (query) {
    url += `?ip=${encodeURIComponent(query)}`;
  }
  hideError();
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) {
      let errorMsg = "Unknown error occurred.";
      if (res.status === 400) {
        errorMsg = "Invalid IP address or domain. Please check your input.";
      } else if (res.status === 429) {
        errorMsg = "API rate limit exceeded. Please wait and try again later.";
      } else if (res.status >= 500) {
        errorMsg = "Server error. Please try again later.";
      }
      updateResults({ ip: "Not found", location: null, isp: "", timezone: "" });
      showError(errorMsg);
      return;
    }
    const data = await res.json();
    if (!data || !data.location) {
      updateResults({ ip: "Not found", location: null, isp: "", timezone: "" });
      showError("No data found for this IP or domain. Try another input.");
      return;
    }
    updateResults(data);
    updateMap(data.location.lat, data.location.lng);
  } catch (err) {
    updateResults({ ip: "Not found", location: null, isp: "", timezone: "" });
    if (err.name === "TypeError") {
      showError("Network error. Please check your internet connection.");
    } else {
      showError("Unexpected error. Please try again.");
    }
  }
}

// On page load, fetch user's IP/location
window.addEventListener("DOMContentLoaded", () => {
  fetchIPData();
});

// Handle search
searchForm.addEventListener("submit", e => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    fetchIPData(query);
  }
});
searchInput.addEventListener("input", hideError);
