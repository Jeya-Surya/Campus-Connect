const user = getLoggedInUser();
const role = localStorage.getItem("mentorshipRole");

if (!user || role !== "STUDENT") {
  alert("Access denied");
  window.location.href = "mentorship.html";
}

/* ✅ KEEP YOUR EXISTING STUDENT LOGIC BELOW THIS LINE */
/* alumni list, send mentorship request, popup, etc */


const email = localStorage.getItem("studentEmail");
const list = document.getElementById("requestList");

if (!email) {
  alert("Student not logged in");
  window.location.href = "login.html";
}

fetch(`http://localhost:8080/api/mentorship/student/requests?email=${email}`)
  .then(res => res.json())
  .then(data => {
    render(data);
  })
  .catch(() => {
    list.innerHTML = "<p>Error loading requests</p>";
  });

function render(data) {
  list.innerHTML = "";

  if (!data || data.length === 0) {
    list.innerHTML = "<p>No mentorship requests yet</p>";
    return;
  }

  data.forEach(r => {
    const div = document.createElement("div");
    div.className = "resource-card";

    div.innerHTML = `
      <h4>${r.category}</h4>

      <div class="resource-meta">
        <span>📅 ${r.requestDate}</span>
        <span>Status: <b>${r.status}</b></span>
      </div>

      <p>${r.message}</p>
    `;

    list.appendChild(div);
  });
}
