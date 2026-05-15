import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'owner' | 'manager' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string;
  tenantId: string;
}

interface AuthSession {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, isPin?: boolean) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {throw new Error('useAuth must be used within AuthProvider');}
  return context;
};

const SESSION_KEY = 'tuxedopos_session';
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

import { useSnackbar } from './SnackbarContext';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw) as AuthSession;
        setUser(session.user);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, isPin = false): Promise<boolean> => {
    setLoading(true);
    try {
      const endpoint = isPin ? '/auth/login/pin' : '/auth/login';
      const body = isPin ? { pin: password } : { email, password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {return false;}

      const data = await res.json() as { access_token: string; user: Record<string, unknown> };
      const sessionUser: User = {
        id:       String(data.user['id']       ?? ''),
        name:     String(data.user['name']     ?? ''),
        email:    String(data.user['email']    ?? ''),
        role:     (data.user['role'] as UserRole) ?? 'cashier',
        storeId:  String(data.user['storeId']  ?? 's1'),
        tenantId: String(data.user['tenantId'] ?? 't1'),
      };

      const session: AuthSession = { user: sessionUser, access_token: data.access_token };
      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      showSnackbar(`Welcome back, ${sessionUser.name}!`, 'success');
      return true;
    } catch {
      showSnackbar('Invalid credentials or server error.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    showSnackbar('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
