/* ===============================
   Project Compass - High Contrast UI (With Roles & Cards)
   =============================== */

const API_BASE = "http://localhost:8080/api/project-compass";

// 1. User Logic
let user = null;
try {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
        const session = JSON.parse(userRaw);
        user = session.data ? session.data : session;
    }
} catch (e) {
    console.warn("User data corrupted");
}

function getMyEmail() {
    if (!user) return "";
    return (user.email || user.username || "").trim();
}

function getMyName() {
    if (!user) return "Project Lead";
    return user.name || user.username || "Project Lead";
}

// 2. Navigation
function goHome() { window.location.href = "index.html"; }
function logout() { localStorage.removeItem("user"); window.location.href = "login.html"; }

// 3. Modals
function openModal() { document.getElementById("createModal").style.display = "flex"; }
function closeModal() { document.getElementById("createModal").style.display = "none"; }
function openRequestsModal() { document.getElementById("requestsModal").style.display = "flex"; loadMyRequests(); }
function closeRequestsModal() { document.getElementById("requestsModal").style.display = "none"; }
function closeMembersModal() { document.getElementById("membersModal").style.display = "none"; }

// 4. Create Project
function createProject() {
    const titleEl = document.getElementById("modal-title");
    const descEl = document.getElementById("modal-desc");
    const rolesEl = document.getElementById("modal-roles"); // NEW
    const skillsEl = document.getElementById("modal-skills");

    if (!titleEl) { alert("Please refresh (Ctrl+F5)."); return; }

    const title = titleEl.value.trim();
    const desc = descEl.value.trim();
    const roles = rolesEl ? rolesEl.value.trim() : "";
    const skills = skillsEl.value.trim();
    const email = getMyEmail();
    const name = getMyName();

    if (!title || !desc || !skills || !roles) { alert("⚠️ Please fill all fields, including Open Roles."); return; }
    if (!email) { alert("❌ Session Error: Please re-login."); return; }

    const payload = {
        projectTitle: title,
        projectDescription: desc,
        requiredSkills: skills,
        projectRoles: roles, // NEW
        createdBy: email,
        ownerName: name
    };

    fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt);
        }
        return res.json();
    })
    .then(() => {
        alert("✅ Project Created!");
        closeModal();
        titleEl.value = ""; descEl.value = ""; rolesEl.value = ""; skillsEl.value = "";
        loadProjects();
    })
    .catch(err => alert("❌ Failed: " + err.message));
}

// 5. Load Projects
function loadProjects() {
    const list = document.getElementById("projectList");
    if(!list) return;

    fetch(API_BASE)
        .then(res => res.json())
        .then(projects => {
            list.innerHTML = "";
            if (!projects || projects.length === 0) { list.innerHTML = "<p style='padding:20px'>No projects found.</p>"; return; }

            const myEmail = getMyEmail().toLowerCase();

            projects.reverse().forEach(p => {
                const ownerEmail = (p.createdBy || "").toLowerCase();
                const isOwner = (ownerEmail === myEmail);
                const ownerName = p.ownerName || "Project Lead";
                const safeOwnerName = ownerName.replace(/'/g, "\\'");

                // --- BUTTONS ---
                let deleteBtn = isOwner
                    ? `<button class="action-btn btn-delete" onclick="deleteProject(${p.id})">🗑 Delete</button>`
                    : "";

                let membersBtn = `<button class="action-btn btn-members" onclick="viewMembers(${p.id}, '${safeOwnerName}')">👥 Team</button>`;

                let joinBtn = isOwner
                    ? `<span class="owner-badge">👑 Your Project</span>`
                    : `<button class="action-btn btn-join" onclick="goToJoin(${p.id})">👋 Join Team</button>`;

                // --- SKILL PILLS ---
                let skillsHtml = p.requiredSkills ? p.requiredSkills.split(',').map(s =>
                    `<span class="skill-tag">${s.trim()}</span>`
                ).join('') : "";

                // --- ROLES HTML (NEW) ---
                let rolesHtml = p.projectRoles ? `
                    <div class="roles-section">
                        <strong style="color: #6c63ff;">🎯 Looking For:</strong> ${p.projectRoles}
                    </div>
                ` : "";

                // --- CARD GENERATION ---
                list.innerHTML += `
                  <div class="project-card">
                      <h3>${p.projectTitle}</h3>
                      <p class="desc">${p.projectDescription}</p>

                      ${rolesHtml}

                      <div style="margin: 10px 0;">${skillsHtml}</div>

                      <hr style="border:0; border-top:1px solid rgba(0,0,0,0.1); margin: 15px 0; width: 100%;">

                      <div class="card-actions">
                          ${deleteBtn}
                          ${membersBtn}
                          ${joinBtn}
                      </div>
                  </div>`;
            });
        });
}

// 6. Delete Project
function deleteProject(id) {
    if(!confirm("Are you sure you want to delete this project?")) return;
    fetch(`${API_BASE}/${id}?email=${encodeURIComponent(getMyEmail())}`, { method: "DELETE" })
    .then(async res => {
        if(res.ok) { alert("Deleted."); loadProjects(); }
        else { alert("Failed: " + await res.text()); }
    });
}

// 7. View Members
function viewMembers(id, ownerName) {
    const modal = document.getElementById("membersModal");
    if(modal) modal.style.display = "flex";
    const list = document.getElementById("membersList");
    if(!list) return;

    list.innerHTML = "<p>Loading...</p>";
    fetch(`${API_BASE}/${id}/members`).then(res => res.json()).then(members => {
        list.innerHTML = `
            <div style="background:#f0f9ff; padding:15px; border-radius:12px; margin-bottom:15px; border: 1px solid #bae6fd;">
                <small style="color:#0284c7; font-weight:700; text-transform:uppercase; font-size:0.75rem;">Project Owner</small>
                <div style="font-weight:700; color:#111; font-size:1.1rem; margin-top:4px;">👑 ${ownerName}</div>
            </div>
            <h4 style="margin-bottom:12px; font-size:1rem; color:#333; font-weight:700;">Team Members</h4>
        `;

        if(!members.length) { list.innerHTML += "<p style='color:#666; font-weight:500;'>No members yet.</p>"; return; }

        members.forEach(m => {
            const name = m.applicantName || m.applicantEmail.split('@')[0];
            list.innerHTML += `
                <div class="member-item" style="border-bottom: 1px solid #e5e7eb;">
                    <div>
                        <div style="font-weight:700; color:#000; font-size: 1rem;">${name}</div>
                        <div style="font-size:0.85rem; color:#555; font-weight:500;">${m.applicantEmail}</div>
                    </div>
                    <a href="${m.skillProof}" target="_blank" style="color:#6c63ff; font-weight:700; font-size:0.9rem; text-decoration:none;">View Profile</a>
                </div>`;
        });
    });
}

// 8. Notifications
function loadMyRequests() {
    const list = document.getElementById("requestsList");
    fetch(`${API_BASE}/requests?email=${encodeURIComponent(getMyEmail())}&t=${Date.now()}`)
        .then(res => res.json()).then(reqs => {
            list.innerHTML = "";
            if(!reqs.length) { list.innerHTML = "<p>No pending requests.</p>"; return; }
            reqs.forEach(r => {
                const applicantDisplay = r.applicantName ? r.applicantName : r.applicantEmail;
                list.innerHTML += `
                <div class="request-card">
                    <p style="margin-bottom:5px; color:#fff;"><b>Applicant:</b> ${applicantDisplay}</p>
                    <p style="margin-bottom:10px; color:#eee;"><b>Proof:</b> <a href="${r.skillProof}" target="_blank" style="color:#fff; text-decoration:underline;">View</a></p>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-accept" onclick="updateStatus(${r.id}, 'ACCEPTED')">Accept</button>
                        <button class="btn-reject" onclick="updateStatus(${r.id}, 'REJECTED')">Reject</button>
                    </div>
                </div>`;
            });
        });
}

function updateStatus(id, status) {
    fetch(`${API_BASE}/requests/${id}/status?status=${status}`, { method: "PUT" })
        .then(() => { alert(`Application ${status}`); loadMyRequests(); checkRequestCount(); });
}

function checkRequestCount() {
    const email = getMyEmail();
    if(!email) return;
    fetch(`${API_BASE}/requests?email=${encodeURIComponent(email)}&t=${Date.now()}`)
        .then(res => res.json()).then(reqs => {
            const badge = document.getElementById("reqCount");
            if(reqs.length > 0) { badge.innerText = reqs.length; badge.style.display = "inline-block"; }
            else { badge.style.display = "none"; }
        })
        .catch(e => {});
}

function goToJoin(id) { window.location.href = `join-project.html?projectId=${id}`; }

// --- THEME TOGGLE LOGIC ---
function updateThemeButton(isDark) {
    const btn = document.getElementById("themeToggle");
    if(btn) btn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    checkRequestCount();
    setInterval(checkRequestCount, 3000);

    const isDark = localStorage.getItem("darkTheme") === "true";
    if (isDark) document.body.classList.add("dark-theme");
    updateThemeButton(isDark);

    const toggle = document.getElementById("themeToggle");
    if(toggle) {
        toggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            const isDarkNow = document.body.classList.contains("dark-theme");
            localStorage.setItem("darkTheme", isDarkNow);
            updateThemeButton(isDarkNow);
        });
    }
});