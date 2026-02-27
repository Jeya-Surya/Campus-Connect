function getCurrentUser() {
  const session = JSON.parse(localStorage.getItem("user"));
  if (!session || !session.data) return null;

  // expiry check
  if (new Date().getTime() > session.expiry) {
    localStorage.removeItem("user");
    return null;
  }

  return session.data; // {id, email, role}
}

function setMentorshipRole(role) {
  localStorage.setItem("mentorshipRole", role); // STUDENT | ALUMNI
}

function getMentorshipRole() {
  return localStorage.getItem("mentorshipRole");
}
