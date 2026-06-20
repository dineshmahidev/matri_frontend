import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

export type UserType = {
  id: number;
  name: string;
  email: string;
  role: 'member' | 'staff' | 'admin';
  phone?: string;
  gender?: string;
  dob?: string;
  profile?: any;
  is_profile_completed?: boolean;
};

type AuthContextType = {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  login: (loginVal: string, passwordVal: string) => Promise<UserType>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ungalkalyanam_token');
    const savedUser = localStorage.getItem('ungalkalyanam_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Clear corrupt state
        localStorage.removeItem('ungalkalyanam_token');
        localStorage.removeItem('ungalkalyanam_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (loginVal: string, passwordVal: string) => {
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: UserType }>('/auth/login', {
        login: loginVal,
        password: passwordVal,
      });

      localStorage.setItem('ungalkalyanam_token', res.token);
      localStorage.setItem('ungalkalyanam_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: UserType }>('/auth/register', data);
      localStorage.setItem('ungalkalyanam_token', res.token);
      localStorage.setItem('ungalkalyanam_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('ungalkalyanam_token');
      localStorage.removeItem('ungalkalyanam_user');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
