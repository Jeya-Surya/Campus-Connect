import { useEffect, useState } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkTheme') === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDark);
    localStorage.setItem('darkTheme', isDark);
  }, [isDark]);

  return {
    isDark,
    toggle: () => setIsDark((prev) => !prev),
    label: isDark ? '☀️ Light Mode' : '🌙 Dark Mode',
  };
}
