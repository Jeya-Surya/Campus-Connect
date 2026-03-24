/* ===============================
   Club Room Logic (Tasks, Replies, Files)
   =============================== */

const API_BASE = "http://localhost:8080/api/study-groups";
let isGroupAdmin = false;

// State Variables for New Features
let replyToPostState = null; // { id, author, content }
let selectedFileState = null;

// 1. Session & URL Params
let user = null;
try {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
        const session = JSON.parse(userRaw);
        user = session.data ? session.data : session;
    }
} catch (e) { console.warn("User data corrupted"); }

function getMyEmail() { return user ? (user.email || user.username || "") : ""; }
function getMyName() { return user ? (user.name || user.username || "Student") : "Student"; }

if (!getMyEmail()) { window.location.href = "login.html"; }

const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('id');

if(!groupId) { alert("No Club ID provided."); window.location.href = "studygroups.html"; }

// Sidebar Toggle
document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
});

// Helper: Safely Parse Spring Boot LocalDateTime
function parseSpringDate(dateData) {
    if (!dateData) return "Just now";
    let dateObj = Array.isArray(dateData)
        ? new Date(dateData[0], dateData[1] - 1, dateData[2], dateData[3] || 0, dateData[4] || 0)
        : new Date(dateData);
    const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} • ${timeStr}`;
}

// Helper: Markdown Parser
function formatMessage(text) {
    if(!text) return "";
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safeText = safeText.replace(/```\n?([\s\S]*?)\n?```/g, '<pre><code>$1</code></pre>');
    safeText = safeText.replace(/`([^`]+)`/g, '<code>$1</code>');
    safeText = safeText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    safeText = safeText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return safeText;
}

// 2. Fetch Initial Data
async function loadRoomData() {
    try {
        const groupRes = await fetch(`${API_BASE}/${groupId}`);
        const group = await groupRes.json();

        document.getElementById("roomEmoji").innerText = group.emoji || "🚀";
        document.getElementById("roomName").innerText = group.name;
        document.getElementById("roomDesc").innerText = group.description;

        isGroupAdmin = (group.createdBy === getMyEmail());
        document.getElementById("leaveBtn").innerText = isGroupAdmin ? "🗑 Delete Club" : "🚪 Leave Club";

        const membersRes = await fetch(`${API_BASE}/${groupId}/members`);
        const members = await membersRes.json();

        const membersList = document.getElementById("membersList");
        membersList.innerHTML = "";
        members.forEach(m => {
            const initial = m.userName.charAt(0).toUpperCase();
            const adminBadge = (m.userEmail === group.createdBy) ? " 👑" : "";
            membersList.innerHTML += `
                <div class="member-item">
                    <div class="member-avatar">${initial}</div>
                    <div class="member-name">${m.userName}${adminBadge}</div>
                </div>
            `;
        });

        loadPosts();
        loadTasks(); // NEW: Load tasks on start
    } catch(e) { console.error("Error loading room:", e); }
}

// 3. Load Chat Feed
async function loadPosts() {
    try {
        const res = await fetch(`${API_BASE}/${groupId}/posts`);
        const posts = await res.json();

        const feed = document.getElementById("feedContainer");
        feed.innerHTML = "";

        if(posts.length === 0) return;

        const myEmail = getMyEmail();

        posts.reverse().forEach(post => {
            const isMine = (post.authorEmail === myEmail);
            const alignmentClass = isMine ? "mine" : "theirs";
            const dateTimeDisplay = parseSpringDate(post.postedAt);
            const formattedContent = formatMessage(post.content);

            // Generate Reply Block UI if applicable
            let replyHtml = '';
            if (post.replyToId) {
                replyHtml = `
                    <div class="msg-quote">
                        <div class="quote-author">↩ ${post.replyToAuthor}</div>
                        <div class="quote-text">${post.replyToContent}</div>
                    </div>
                `;
            }

            // Generate Image Block UI if applicable
            let imageHtml = '';
            if (post.fileUrl) {
                // Determine if it's an image based on extension
                if (post.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i)) {
                    // Prepend http://localhost:8080 if your API runs on different port than frontend
                    imageHtml = `<img class="msg-image" src="http://localhost:8080${post.fileUrl}" alt="Attached Image" onclick="window.open(this.src, '_blank')">`;
                } else {
                    imageHtml = `<a href="http://localhost:8080${post.fileUrl}" target="_blank" style="color:inherit; text-decoration:underline; font-weight:bold; display:block; margin-bottom:5px;">📎 View Attached File</a>`;
                }
            }

            // --- FIX: Clean up text so line breaks don't destroy the HTML button! ---
            let safeSnippet = 'Attachment';
            if (post.content) {
                safeSnippet = post.content.substring(0, 50)
                    .replace(/\n/g, " ")       // Remove line breaks
                    .replace(/'/g, "\\'")      // Escape single quotes
                    .replace(/"/g, "&quot;");  // Escape double quotes
            }
            let safeAuthor = post.authorName.replace(/'/g, "\\'");

            // Action Buttons (Reply & Delete)
            let actionsHtml = `<div class="msg-actions">`;
            // Everyone can reply to any message
            actionsHtml += `<button class="action-icon reply" onclick="initReply(${post.id}, '${safeAuthor}', '${safeSnippet}')" title="Reply">↩️</button>`;

            // Only authors (or admins) can delete
            if (isMine || isGroupAdmin) {
                actionsHtml += `<button class="action-icon delete" onclick="deleteMessage(${post.id})" title="Delete">🗑️</button>`;
            }
            actionsHtml += `</div>`;

            feed.innerHTML += `
                <div class="msg-row ${alignmentClass}" id="post-${post.id}">
                    <div class="msg-bubble">
                        ${actionsHtml}
                        ${replyHtml}
                        <div class="msg-author">${post.authorName}</div>
                        ${imageHtml}
                        <div class="msg-content">${formattedContent}</div>
                        <div class="msg-time">${dateTimeDisplay}</div>
                    </div>
                </div>
            `;
        });

        if(feed.scrollHeight - feed.scrollTop < feed.clientHeight + 300) {
            feed.scrollTop = feed.scrollHeight;
        }
    } catch(e) { console.error("Error loading posts:", e); }
}

// 4. Send Message (UPDATED FOR MULTIPART FORM DATA)
async function sendPost() {
    const input = document.getElementById("postInput");
    const content = input.value.trim();

    if(!content && !selectedFileState) return;

    // Use FormData to support files
    const formData = new FormData();
    formData.append("authorEmail", getMyEmail());
    formData.append("authorName", getMyName());
    if (content) formData.append("content", content);

    if (selectedFileState) {
        formData.append("file", selectedFileState);
    }

    if (replyToPostState) {
        formData.append("replyToId", replyToPostState.id);
        formData.append("replyToAuthor", replyToPostState.author);
        formData.append("replyToContent", replyToPostState.content);
    }

    // UX Reset
    input.value = "";
    input.style.height = "auto";
    cancelReply();
    cancelFile();

    try {
        const res = await fetch(`${API_BASE}/${groupId}/posts`, {
            method: "POST",
            // DO NOT set Content-Type header. Browser sets multipart/form-data with boundary automatically!
            body: formData
        });
        if(res.ok) loadPosts();
    } catch(e) { alert("Failed to send message."); }
}

// ================= REPLY LOGIC =================
function initReply(id, author, contentSnippet) {
    replyToPostState = { id, author, content: contentSnippet + "..." };
    document.getElementById("replyAuthor").innerText = author;
    document.getElementById("replyTextSnippet").innerText = replyToPostState.content;
    document.getElementById("replyPreviewBar").style.display = "flex";
    document.getElementById("postInput").focus();
}

function cancelReply() {
    replyToPostState = null;
    document.getElementById("replyPreviewBar").style.display = "none";
}

// ================= FILE ATTACHMENT LOGIC =================
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
        alert("File size must be under 5MB");
        return;
    }

    selectedFileState = file;
    document.getElementById("fileNameDisplay").innerText = file.name;
    document.getElementById("filePreviewBar").style.display = "flex";
}

function cancelFile() {
    selectedFileState = null;
    document.getElementById("fileInput").value = "";
    document.getElementById("filePreviewBar").style.display = "none";
}

// ================= DELETE MESSAGE LOGIC =================
async function deleteMessage(postId) {
    if(!confirm("Are you sure you want to delete this message?")) return;
    try {
        const email = encodeURIComponent(getMyEmail());
        const res = await fetch(`${API_BASE}/${groupId}/posts/${postId}?email=${email}`, { method: "DELETE" });
        if(res.ok) loadPosts();
    } catch(e) { alert("Failed to delete."); }
}

// ================= GROUP TASKS LOGIC =================
async function loadTasks() {
    try {
        const res = await fetch(`${API_BASE}/${groupId}/tasks`);
        const tasks = await res.json();
        const list = document.getElementById("taskList");
        list.innerHTML = "";

        if (tasks.length === 0) {
            list.innerHTML = `<p style="font-size:0.8rem; color:#888; text-align:center;">No tasks yet. Add one!</p>`;
            return;
        }

        tasks.forEach(t => {
            const checked = t.done ? "checked" : "";
            const doneClass = t.done ? "done" : "";
            list.innerHTML += `
                <div class="task-item ${doneClass}">
                    <input type="checkbox" ${checked} onchange="toggleTask(${t.id})">
                    <span>${t.taskDesc}</span>
                    <button class="btn-del-task" onclick="deleteTask(${t.id})" title="Delete Task">✕</button>
                </div>
            `;
        });
    } catch(e) { console.error("Error loading tasks", e); }
}

async function addTask() {
    const input = document.getElementById("taskInput");
    const desc = input.value.trim();
    if(!desc) return;

    try {
        await fetch(`${API_BASE}/${groupId}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskDesc: desc })
        });
        input.value = "";
        loadTasks();
    } catch(e) { alert("Failed to add task."); }
}

// Allow Enter to add task
document.getElementById("taskInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
});

async function toggleTask(taskId) {
    try {
        await fetch(`${API_BASE}/tasks/${taskId}/toggle`, { method: "PUT" });
        loadTasks();
    } catch(e) { alert("Failed to toggle."); }
}

async function deleteTask(taskId) {
    try {
        await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
        loadTasks();
    } catch(e) { alert("Failed to delete task."); }
}


// ================= ADMIN / LEAVE LOGIC =================
async function leaveClub() {
    const action = isGroupAdmin ? "DELETE this entire club" : "LEAVE this club";
    if(!confirm(`Are you sure you want to ${action}?`)) return;
    try {
        const email = encodeURIComponent(getMyEmail());
        const url = isGroupAdmin ? `${API_BASE}/${groupId}?email=${email}` : `${API_BASE}/${groupId}/members?email=${email}`;
        const res = await fetch(url, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        window.location.href = "studygroups.html";
    } catch(e) { alert("Error: " + e.message); }
}

// Smart Textarea Logic
const postInput = document.getElementById("postInput");
postInput.addEventListener("input", function() {
    this.style.height = "24px";
    this.style.height = (this.scrollHeight) + "px";
});
postInput.addEventListener("keydown", function(e) {
    if(e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendPost();
    }
});

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    loadRoomData();
    setInterval(loadPosts, 3000);

    const isDark = localStorage.getItem("darkTheme") === "true";
    if (isDark) document.body.classList.add("dark-theme");

    const toggleBtn = document.getElementById("themeToggle");
    if(toggleBtn) {
        toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
        toggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            localStorage.setItem("darkTheme", document.body.classList.contains("dark-theme"));
            toggleBtn.textContent = document.body.classList.contains("dark-theme") ? "☀️ Light Mode" : "🌙 Dark Mode";
        });
    }
});