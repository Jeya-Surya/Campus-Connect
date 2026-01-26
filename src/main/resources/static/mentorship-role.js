const user = getLoggedInUser();

if (!user) {
  alert("Please login first");
  window.location.href = "login.html";
}

// Store role + redirect
document.getElementById("alumniBtn")?.addEventListener("click", () => {
  localStorage.setItem("mentorshipRole", "ALUMNI");
  window.location.href = "alumni-dashboard.html";
});

document.getElementById("studentBtn")?.addEventListener("click", () => {
  localStorage.setItem("mentorshipRole", "STUDENT");
  window.location.href = "student-mentorship.html";
});
