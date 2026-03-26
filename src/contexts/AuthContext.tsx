import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type UserRole = 'OWNER' | 'HEIR';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsHeir: (ownerEmail: string, certificateFile: File) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'pdcp_token';
const USER_KEY = 'pdcp_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (email: string, _password: string, role: UserRole = 'OWNER') => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    const mockToken = 'eyJhbGciOiJIUzI1NiJ9.mock-jwt-token';
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      role,
    };
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 1200));
    const mockToken = 'eyJhbGciOiJIUzI1NiJ9.mock-jwt-token';
    const mockUser: User = { id: '1', name, email, role: 'OWNER' };
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
  }, []);

  const loginAsHeir = useCallback(async (ownerEmail: string, _certificateFile: File) => {
    await new Promise((r) => setTimeout(r, 2000));
    const mockToken = 'eyJhbGciOiJIUzI1NiJ9.mock-heir-token';
    const mockUser: User = { id: '2', name: 'Heir User', email: ownerEmail, role: 'HEIR' };
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, loginAsHeir, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
