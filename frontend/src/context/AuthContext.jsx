import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { mockDB } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const current = await authService.getCurrentUser();
        if (current) {
          setUser(current);
        } else {
          // Default to Jane Citizen demo user for seamless instant demo experience
          const defaultCitizen = mockDB.getUsers()[0];
          setUser(defaultCitizen);
          localStorage.setItem('civicpulse_user', JSON.stringify(defaultCitizen));
        }
      } catch (err) {
        console.warn('Auth init failed:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Quick switch role preset for demo evaluation
  const switchDemoRole = (role) => {
    const users = mockDB.getUsers();
    if (role === 'ADMIN') {
      const admin = users.find((u) => u.role === 'ADMIN') || users[1];
      setUser(admin);
      localStorage.setItem('civicpulse_user', JSON.stringify(admin));
    } else if (role === 'CITIZEN') {
      const citizen = users.find((u) => u.role === 'CITIZEN') || users[0];
      setUser(citizen);
      localStorage.setItem('civicpulse_user', JSON.stringify(citizen));
    } else if (role === 'GUEST') {
      setUser(null);
      localStorage.removeItem('civicpulse_user');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isCitizen: user?.role === 'CITIZEN',
    loading,
    login,
    register,
    logout,
    switchDemoRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
