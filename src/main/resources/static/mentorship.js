// ================= TAB SWITCH LOGIC =================
const alumniTab = document.getElementById("alumniTab");
const studentTab = document.getElementById("studentTab");
const alumniSection = document.getElementById("alumniSection");
const studentSection = document.getElementById("studentSection");

if (alumniTab && studentTab && alumniSection && studentSection) {
  alumniTab.addEventListener("click", () => {
    alumniSection.classList.add("active");
    studentSection.classList.remove("active");
    alumniTab.classList.add("active");
    studentTab.classList.remove("active");
  });

  studentTab.addEventListener("click", () => {
    studentSection.classList.add("active");
    alumniSection.classList.remove("active");
    studentTab.classList.add("active");
    alumniTab.classList.remove("active");
  });
}

// ================= LOAD ALUMNI LIST (STUDENT SIDE) =================
const alumniList = document.getElementById("alumniList");

if (alumniList) {
  fetch("http://localhost:8080/api/alumni")
    .then(res => res.json())
    .then(data => {
      alumniList.innerHTML = "";
      data.forEach(alumni => {
        const card = document.createElement("div");
        card.className = "mentor-card";
        card.innerHTML = `
          <h3>${alumni.name || "Alumni Mentor"}</h3>
          <p>🎓 ${alumni.dept} (${alumni.gradYear})</p>
          <p>💼 ${alumni.company} - ${alumni.role}</p>
          <p>🏙️ ${alumni.location || "Not specified"}</p>
          <p>🌟 ${alumni.helpAreas}</p>
          <button class="connectBtn" data-alumni-id="${alumni.id}">🤝 Connect</button>
        `;
        alumniList.appendChild(card);
      });
    });
}

// ================= STUDENT SEND REQUEST =================
let selectedAlumniId = null;

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("connectBtn")) {
    selectedAlumniId = e.target.dataset.alumniId;
    document.getElementById("popupForm")?.classList.remove("hidden");
  }
});

function sendMentorshipRequest() {
  if (!selectedAlumniId) {
    alert("❌ Alumni not selected");
    return;
  }

  const name = document.getElementById("studentName")?.value;
  const email = document.getElementById("studentEmail")?.value;
  const message = document.getElementById("message")?.value;
  const category = document.getElementById("category")?.value;

  fetch(
    `http://localhost:8080/api/mentorship/send/${selectedAlumniId}` +
      `?studentName=${encodeURIComponent(name)}` +
      `&studentEmail=${encodeURIComponent(email)}` +
      `&message=${encodeURIComponent(message)}` +
      `&category=${encodeURIComponent(category)}`,
    { method: "POST" }
  )
    .then(() => {
      alert("✅ Mentorship request sent");
      document.getElementById("popupForm")?.classList.add("hidden");
    })
    .catch(() => alert("❌ Failed to send request"));
}

const sendBtn = document.getElementById("sendRequestBtn");
if (sendBtn) sendBtn.addEventListener("click", sendMentorshipRequest);

// ================= ALUMNI NOTIFICATION BELL =================
const notifBell = document.getElementById("notifBell");
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notificationList");

const alumniId = localStorage.getItem("alumniId");

notifBell.addEventListener("click", () => {
  notifDropdown.classList.toggle("visible");

  if (notifDropdown.classList.contains("visible")) {
    loadNotifications();
  }
});

function loadNotifications() {
  notifList.innerHTML = "<p>Loading...</p>";

  fetch(`http://localhost:8080/api/mentorship/requests/${alumniId}`)
    .then(res => res.json())
    .then(data => {
      notifList.innerHTML = "";

      if (!data || data.length === 0) {
        notifList.innerHTML = "<p>No mentorship requests</p>";
        return;
      }

      data.forEach(r => {
        notifList.innerHTML += `
          <div class="notif-item">
            <b>${r.studentName}</b><br/>
            ${r.message}<br/>
            <small>Status: ${r.status}</small>
          </div>
        `;
      });
    })
    .catch(() => {
      notifList.innerHTML = "<p>Error loading requests</p>";
    });
}


// ================= CLOSE DROPDOWN ON OUTSIDE CLICK =================
document.addEventListener("click", (e) => {
  if (
    notifDropdown &&
    !notifDropdown.contains(e.target) &&
    !notifBell.contains(e.target)
  ) {
    notifDropdown.classList.remove("visible");
  }
});
