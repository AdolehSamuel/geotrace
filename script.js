const API_URL = "https://geotrace-proxy.onrender.com/api/lookup";

const ipAddressEl = document.getElementById("ip-address");
const locationEl = document.getElementById("location");
const timezoneEl = document.getElementById("timezone");
const ispEl = document.getElementById("isp");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const historyEl = document.getElementById("search-history");
const HISTORY_KEY = "geotrace-history-v1";
const CACHE_KEY = "geotrace-cache-v1";
const MAX_HISTORY = 8;

let map, marker;
let historyExpanded = true;

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

function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
}
function setHistory(history) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.slice(0, MAX_HISTORY))
  );
}
function addToHistory(query) {
  let history = getHistory();
  history = history.filter(item => item !== query);
  history.unshift(query);
  setHistory(history);
  renderHistory();
}
function renderHistory() {
  const history = getHistory();
  if (history.length === 0) {
    historyEl.style.display = "none";
    historyEl.innerHTML = "";
    return;
  }
  historyEl.innerHTML = `
    <div class='search-history-header' tabindex="0" aria-expanded="${historyExpanded}" role="button">
      <span>Recent Searches</span>
      <button class='search-history-clear' title='Clear history' tabindex="0">Clear</button>
      <span class="accordion-arrow" style="float:right;font-size:1.1em;margin-right:8px;">${
        historyExpanded ? "▼" : "►"
      }</span>
    </div>
    <div class='search-history-list' style='display:${
      historyExpanded ? "block" : "none"
    };'>
      ${history
        .map(
          item => `<div class="search-history-item" tabindex="0">${item}</div>`
        )
        .join("")}
    </div>
  `;
  historyEl.style.display = "block";
}
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function getCache() {
  return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
}
function setCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}
function addToCache(query, data) {
  const cache = getCache();
  cache[query] = data;
  setCache(cache);
}
function getCachedResult(query) {
  const cache = getCache();
  return cache[query];
}

// Fetch IP/location data
async function fetchIPData(query = "") {
  let url = API_URL;
  if (query) {
    url += `?ip=${encodeURIComponent(query)}`;
  }
  hideError();
  // Check cache first
  if (query) {
    const cached = getCachedResult(query);
    if (cached) {
      updateResults(cached);
      if (cached.location) updateMap(cached.location.lat, cached.location.lng);
      addToHistory(query);
      return;
    }
  }
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
    if (query) {
      addToCache(query, data);
      addToHistory(query);
    }
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
  renderHistory();
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

// Show history on input focus
searchInput.addEventListener("focus", renderHistory);
searchInput.addEventListener("blur", () => {
  setTimeout(() => (historyEl.style.display = "none"), 150);
});
// Add event listener for clear button
historyEl.addEventListener("mousedown", e => {
  if (e.target.classList.contains("search-history-item")) {
    searchInput.value = e.target.textContent;
    fetchIPData(e.target.textContent);
    // Do NOT hide history anymore
  } else if (e.target.classList.contains("search-history-clear")) {
    clearHistory();
    // Do NOT hide history
    e.preventDefault();
  } else if (
    e.target.classList.contains("search-history-header") ||
    e.target.closest(".search-history-header")
  ) {
    historyExpanded = !historyExpanded;
    renderHistory();
    e.preventDefault();
  }
});
// Keyboard navigation for history
historyEl.addEventListener("keydown", e => {
  if (
    e.target.classList.contains("search-history-item") &&
    (e.key === "Enter" || e.key === " ")
  ) {
    searchInput.value = e.target.textContent;
    fetchIPData(e.target.textContent);
    // Do NOT hide history
  } else if (
    e.target.classList.contains("search-history-clear") &&
    (e.key === "Enter" || e.key === " ")
  ) {
    clearHistory();
    // Do NOT hide history
    e.preventDefault();
  } else if (
    (e.target.classList.contains("search-history-header") ||
      e.target.closest(".search-history-header")) &&
    (e.key === "Enter" || e.key === " ")
  ) {
    historyExpanded = !historyExpanded;
    renderHistory();
    e.preventDefault();
  }
});
// Keyboard navigation for clear button
historyEl.addEventListener("keydown", e => {
  if (
    e.target.classList.contains("search-history-item") &&
    (e.key === "Enter" || e.key === " ")
  ) {
    searchInput.value = e.target.textContent;
    fetchIPData(e.target.textContent);
    historyEl.style.display = "none";
  } else if (
    e.target.classList.contains("search-history-clear") &&
    (e.key === "Enter" || e.key === " ")
  ) {
    clearHistory();
    historyEl.style.display = "none";
    e.preventDefault();
  }
});
