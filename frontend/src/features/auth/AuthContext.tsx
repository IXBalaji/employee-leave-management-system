import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setAuthToken } from '../../lib/api';

export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  role: Role;
  photoUrl: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (workEmail: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'elms.auth';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { token, user: storedUser } = JSON.parse(stored) as { token: string; user: AuthUser };
      setAuthToken(token);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (workEmail: string, password: string) => {
    const { token, user: loggedInUser } = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
      workEmail,
      password,
    });
    setAuthToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: loggedInUser }));
    setUser(loggedInUser);
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
