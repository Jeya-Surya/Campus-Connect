import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, loadSessionUser, saveSessionUser } from '../utils/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSessionUser());

  useEffect(() => {
    setUser(loadSessionUser());
  }, []);

  const value = useMemo(
    () => ({
      user,
      login: (data) => {
        saveSessionUser(data);
        setUser(data);
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
