function getLoggedInUser() {
  const session = JSON.parse(localStorage.getItem("user"));
  if (!session || !session.data) return null;

  if (Date.now() > session.expiry) {
    localStorage.removeItem("user");
    return null;
  }

  return session.data; // ✅ REAL user object
}
