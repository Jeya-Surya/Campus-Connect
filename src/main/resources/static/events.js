const API_BASE = "http://localhost:8080/api";
let allEvents = [];

function showEvents() {
  document.getElementById("viewEventsSection").classList.remove("hidden");
  document.getElementById("addEventSection").classList.add("hidden");
}

function showAddEvent() {
  document.getElementById("addEventSection").classList.remove("hidden");
  document.getElementById("viewEventsSection").classList.add("hidden");
}

async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

function formatDateTime(str) {
  const d = new Date(str.replace(" ", "T"));
  return isNaN(d) ? "N/A" : d.toLocaleString();
}

/* 🔍 SMART FILTER */
function applyFilters() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const dateFilter = document.getElementById("dateFilter").value;
  const now = new Date();

  const filtered = allEvents.filter(e => {
    const searchableText = `
      ${e.title}
      ${e.venue}
      ${e.organizerName}
      ${e.category}
      ${e.description}
    `.toLowerCase();

    // 🔤 SEARCH (ANY LETTER MATCH)
    if (search && !searchableText.includes(search)) return false;

    // 🏷 CATEGORY
    if (category && e.category !== category) return false;

    // 📅 DATE FILTER
    const start = new Date(e.eventStartDateTime.replace(" ", "T"));

    if (dateFilter === "today")
      return start.toDateString() === now.toDateString();

    if (dateFilter === "week") {
      const week = new Date();
      week.setDate(now.getDate() + 7);
      return start >= now && start <= week;
    }

    if (dateFilter === "upcoming")
      return start > now;

    return true;
  });

  renderEvents(filtered);
}

/* 🎨 RENDER EVENTS AS CARDS */
function renderEvents(events) {
  const container = document.getElementById("events-container");
  container.innerHTML = "";

  if (!events.length) {
    container.innerHTML = `
      <p style="opacity:0.7;text-align:center;">
        No matching events found
      </p>`;
    return;
  }

  events.forEach(e => {
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <div class="event-title">${e.title}</div>

      <div class="event-meta">📍 ${e.venue}</div>
      <div class="event-meta">📅 ${formatDateTime(e.eventStartDateTime)}</div>
      <div class="event-meta">⏰ ${formatDateTime(e.eventEndDateTime)}</div>

      <div class="event-desc">${e.description}</div>

      <div class="event-footer">
        <span class="event-badge">${e.category}</span>
        ${e.posterUrl
          ? `<a href="${e.posterUrl}" target="_blank" class="event-poster-btn">🎟 Poster</a>`
          : ""}

      </div>
    `;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  allEvents = await fetchEvents();
  showEvents();
  applyFilters();

  // 🔥 INSTANT SEARCH
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("categoryFilter").addEventListener("change", applyFilters);
  document.getElementById("dateFilter").addEventListener("change", applyFilters);

  // ➕ ADD EVENT
  document.getElementById("eventForm").addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      alert("✅ Event added successfully");
      e.target.reset();
      allEvents = await fetchEvents();
      showEvents();
      applyFilters();
    } else {
      alert("❌ Failed to add event");
    }
  });
});
