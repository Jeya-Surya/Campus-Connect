const STORAGE_KEY = 'user';

function parseSession(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || !parsed.data) return null;

    const now = Date.now();
    if (parsed.expiry && now > parsed.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.data;
  } catch (err) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function loadSessionUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return parseSession(raw);
}

export function saveSessionUser(user) {
  const session = {
    data: user,
    expiry: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
