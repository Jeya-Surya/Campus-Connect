/* ===============================
   Study Clubs (Custom Emoji) - SAFE MODE
   =============================== */

const API_BASE = "http://localhost:8080/api/study-groups";

// 1. Session Logic (Wrapped in try-catch to prevent crashing)
let user = null;

function initializeSession() {
    try {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
            const session = JSON.parse(userRaw);
            user = session.data ? session.data : session;
        }
    } catch (e) {
        console.warn("User data corrupted or missing.", e);
    }

    if (!user || !getMyEmail()) {
        console.log("No valid session found. Redirecting to login.");
        window.location.href = "login.html";
    }
}

function getMyEmail() { return user ? (user.email || user.username || "") : ""; }
function getMyName() { return user ? (user.name || user.username || "Student") : "Student"; }

// 2. Navigation Functions (Attached globally)
window.goHome = function() { window.location.href = "index.html"; }
window.logout = function() { localStorage.removeItem("user"); window.location.href = "login.html"; }

// 3. Modal Functions (Attached globally)
window.openModal = function() { 
    const modal = document.getElementById("createModal");
    if(modal) modal.style.display = "flex"; 
}
window.closeModal = function() { 
    const modal = document.getElementById("createModal");
    if(modal) modal.style.display = "none"; 
}

// 4. Create Club
window.createClub = function() {
    const nameEl = document.getElementById("clubName");
    const descEl = document.getElementById("clubDesc");
    const emojiEl = document.getElementById("clubEmoji");

    if(!nameEl || !descEl || !emojiEl) {
        alert("Form elements missing. Please refresh.");
        return;
    }

    const name = nameEl.value.trim();
    const desc = descEl.value.trim();
    const emoji = emojiEl.value.trim() || "🚀";

    if (!name || !desc) { alert("⚠️ Please fill out all fields."); return; }

    const payload = {
        name: name,
        description: desc,
        emoji: emoji,
        createdBy: getMyEmail()
    };

    fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        if (!res.ok) throw new Error("Failed to create club");
        return res.json();
    })
    .then(data => {
        // Automatically try to join the room
        window.joinClub(data.id, true);
    })
    .catch(err => alert("❌ Error: " + err.message));
}

// 5. Load Clubs
window.loadClubs = function() {
    const list = document.getElementById("clubList");
    if(!list) return;
    
    list.innerHTML = "<p style='grid-column: 1 / -1; text-align: center;'>Fetching clubs...</p>";

    fetch(API_BASE)
        .then(res => {
            if(!res.ok) throw new Error("Backend not responding");
            return res.json();
        })
        .then(clubs => {
            list.innerHTML = "";
            if (!clubs || clubs.length === 0) { 
                list.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; color:#888;'>No clubs yet. Be the first to start one!</p>"; 
                return; 
            }

            clubs.forEach(club => {
                list.innerHTML += `
                    <div class="club-card">
                        <div class="club-emoji">${club.emoji || '🚀'}</div>
                        <h3>${club.name}</h3>
                        <p>${club.description}</p>
                        <button class="btn-join-club" onclick="joinClub(${club.id})">Enter Room</button>
                    </div>
                `;
            });
        })
        .catch(err => {
            console.error(err);
            list.innerHTML = `<p style='grid-column: 1 / -1; text-align: center; color:red;'>Error loading clubs: Make sure backend is running.</p>`;
        });
}

// 6. Join / Enter Club
window.joinClub = function(clubId, isCreator = false) {
    const payload = {
        userEmail: getMyEmail(),
        userName: getMyName()
    };

    fetch(`${API_BASE}/${clubId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        // If 400 Bad Request, it usually means "already a member" which is fine.
        if (res.ok || res.status === 400) {
            if(isCreator) window.closeModal();
            window.location.href = `group-room.html?id=${clubId}`;
        } else {
            throw new Error(await res.text());
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ Could not enter club. See console for details.");
    });
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    initializeSession();
    
    // Only try to load clubs if we didn't redirect to login
    if(user) {
        window.loadClubs();
    }

    // Theme logic
    const isDark = localStorage.getItem("darkTheme") === "true";
    if (isDark) document.body.classList.add("dark-theme");
    
    const toggleBtn = document.getElementById("themeToggle");
    if(toggleBtn) {
        toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
        toggleBtn.addEventListener("click", () => { 
            document.body.classList.toggle("dark-theme"); 
            const darkNow = document.body.classList.contains("dark-theme");
            localStorage.setItem("darkTheme", darkNow);
            toggleBtn.textContent = darkNow ? "☀️ Light Mode" : "🌙 Dark Mode";
        });
    }
});