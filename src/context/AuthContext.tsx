import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, fetchMyProfile } from '../api/auth';
import { toast } from 'sonner';
import axiosInstance from '../api/axiosInstance';

type User = {
  name: string;
  email: string;
  type: 'social' | 'business' | 'admin';
  points?: number;
  isActive?: boolean;
  profileImageUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = async (email: string, password: string) => {
    try {
      await apiLogin(email, password);
      const profile = await fetchMyProfile();
      const role = profile.role || 'USER';
      const formattedUser: User = {
        name: profile.nickname || profile.name,
        email: profile.email,
        type:
          role === 'ROLE_BUSINESS' || role === 'BIZ'
            ? 'business'
            : role === 'ROLE_ADMIN' || role === 'ADMIN'
            ? 'admin'
            : 'social',
        points: profile.points || 0,
        isActive: profile.isActive !== undefined ? profile.isActive : true,
        profileImageUrl: profile.profileImageUrl || '',
      };
      setUser(formattedUser);
      toast.success('로그인 성공!');
    } catch (e: any) {
      toast.error(e.message || '로그인 실패');
      throw e;
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    }
    setUser(null);
    toast.success('로그아웃되었습니다');
  };

  const refreshToken = async () => {
    try {
      await axiosInstance.post('/auth/refresh'); // Server should set new access token cookie
      const profile = await fetchMyProfile();
      const role = profile.role || 'USER';
      setUser({
        name: profile.nickname || profile.name,
        email: profile.email,
        type:
          role === 'ROLE_BUSINESS' || role === 'BIZ'
            ? 'business'
            : role === 'ROLE_ADMIN' || role === 'ADMIN'
            ? 'admin'
            : 'social',
        points: profile.points || 0,
        isActive: profile.isActive !== undefined ? profile.isActive : true,
        profileImageUrl: profile.profileImageUrl || '',
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login: handleLogin, logout: handleLogout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
