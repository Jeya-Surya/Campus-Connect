const API_BASE = "http://localhost:8080/api/project-compass/apply";

// Get user session safely
let user = null;
try {
    const raw = localStorage.getItem("user");
    if (raw) {
        const parsed = JSON.parse(raw);
        user = parsed.data ? parsed.data : parsed;
    }
} catch (e) { console.error(e); }

if (!user) window.location.href = "login.html";

// Pre-fill name if available
document.addEventListener("DOMContentLoaded", () => {
    if (user.name) {
        document.getElementById("applicantName").value = user.name;
    }
});

const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");

if (!projectId) {
    alert("⚠️ No project selected.");
    window.location.href = "projectcompass.html";
}

function submitApplication() {
    const nameVal = document.getElementById("applicantName").value.trim();
    const proofVal = document.getElementById("proof").value.trim();

    if (!nameVal) {
        alert("⚠️ Please enter your name.");
        return;
    }
    if (!proofVal) {
        alert("⚠️ Please provide a link to your work.");
        return;
    }

    const payload = {
        projectId: parseInt(projectId),
        applicantEmail: user.email,
        applicantName: nameVal, // Sending the name
        skillProof: proofVal
    };

    const btn = document.querySelector("button[onclick='submitApplication()']");
    btn.textContent = "Sending...";
    btn.disabled = true;

    fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) throw new Error("Application failed");
        return res.json();
    })
    .then(() => {
        alert("✅ Application sent! The owner will review it.");
        window.location.href = "projectcompass.html";
    })
    .catch(err => {
        console.error(err);
        alert("❌ Failed to send application.");
        btn.textContent = "Submit Application";
        btn.disabled = false;
    });
}

function goBack() { window.history.back(); }
function goHome() { window.location.href = "index.html"; }
function logout() { localStorage.removeItem("user"); window.location.href = "login.html"; }