const API_KEY = "";
const API_URL = "https://geo.ipify.org/api/v2/country,city?apiKey=" + API_KEY;

const ipAddressEl = document.getElementById("ip-address");
const locationEl = document.getElementById("location");
const timezoneEl = document.getElementById("timezone");
const ispEl = document.getElementById("isp");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

let map, marker;

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
    url += `&domain=${encodeURIComponent(query)}`;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(query)) {
      url += `&ipAddress=${encodeURIComponent(query)}`;
    }
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    updateResults(data);
    updateMap(data.location.lat, data.location.lng);
  } catch (err) {
    updateResults({ ip: "Not found", location: null, isp: "", timezone: "" });
    alert("Could not retrieve data. Please check your input or try again.");
  }
}

if (API_KEY) {
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
}
