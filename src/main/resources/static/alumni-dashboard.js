const API = "http://localhost:8080/api";

/* ================= SESSION CHECK ================= */
const session = JSON.parse(localStorage.getItem("user") || "null");

if (!session || !session.data) {
  alert("Please login first");
  window.location.href = "login.html";
}

const userId = session.data.id;

// Clear request notifications when alumni opens request dashboard
fetch(`${API}/notifications/${userId}/seen-by-type?type=REQUEST`, { method: "PUT" })
  .catch(() => { });

/* ================= LOAD ALUMNI PROFILE ================= */
async function loadAlumniProfile() {
  try {
    const res = await fetch(`${API}/alumni/user/${userId}`);

    if (res.status === 404) {
      window.location.href = "alumni-onboarding.html";
      return;
    }

    loadRequests(userId);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

/* ================= LOAD REQUESTS ================= */
function loadRequests(alumniUserId) {
  fetch(`${API}/mentorship/requests/${alumniUserId}`)
    .then(res => res.json())
    .then(renderRequests)
    .catch(() => {
      document.getElementById("pendingList").innerHTML = "<p>Error loading requests</p>";
      document.getElementById("acceptedList").innerHTML = "<p>Error loading requests</p>";
    });
}

/* ================= RENDER ================= */
function renderRequests(data) {
  const pending = document.getElementById("pendingList");
  const accepted = document.getElementById("acceptedList");

  pending.innerHTML = "";
  accepted.innerHTML = "";

  if (!data || data.length === 0) {
    pending.innerHTML = "<p>No pending requests</p>";
    accepted.innerHTML = "<p>No accepted mentorships</p>";
    return;
  }

  data.forEach(r => {
    const card = document.createElement("div");
    card.className = "request-card";

    card.innerHTML = `
      <h4>${r.studentName}</h4>
      <p><b>Email:</b> ${r.studentEmail}</p>
      <p><b>Category:</b> ${r.category}</p>
      <p><b>Message:</b> ${r.message}</p>
      <p><b>Status:</b> ${r.status}</p>
    `;

    if (r.status === "PENDING") {
      const actions = document.createElement("div");
      actions.className = "actions";

      actions.innerHTML = `
        <button class="btn accept" onclick="updateStatus(${r.id}, 'ACCEPTED')">Accept</button>
        <button class="btn reject" onclick="updateStatus(${r.id}, 'REJECTED')">Reject</button>
      `;
      card.appendChild(actions);
      pending.appendChild(card);
    }

    if (r.status === "ACCEPTED") {
      const chatBtn = document.createElement("button");
      chatBtn.className = "btn chat";
      chatBtn.textContent = "💬 Open Chat";
      chatBtn.onclick = () => openChat(r.id);

      card.appendChild(chatBtn);
      accepted.appendChild(card);
    }
  });
}

/* ================= UPDATE STATUS ================= */
function updateStatus(requestId, status) {
  fetch(`${API}/mentorship/${requestId}/status?status=${status}`, {
    method: "PUT"
  }).then(loadAlumniProfile);
}

/* ================= CHAT ================= */
function openChat(requestId) {
  localStorage.setItem("requestId", requestId);
  window.location.href = "chat.html";
}

/* ================= THEME ================= */
const toggleBtn = document.getElementById("themeToggle");
if (localStorage.getItem("darkTheme") === "true") {
  document.body.classList.add("dark-theme");
  toggleBtn.textContent = "☀️ Light Mode";
}

toggleBtn.onclick = () => {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem("darkTheme", document.body.classList.contains("dark-theme"));
  toggleBtn.textContent =
    document.body.classList.contains("dark-theme")
      ? "☀️ Light Mode"
      : "🌙 Light Mode";
};

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= INIT ================= */
loadAlumniProfile();
