import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { mockDB } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_LOCATION = {
  lat: 37.774929,
  lng: -122.419416,
  cityName: 'Metro City Center',
  address: '401 Main St, Metro City',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const [userLocation, setUserLocationState] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpulse_user_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const updateUserLocation = (newLoc) => {
    const updated = {
      lat: Number(newLoc.lat || newLoc.latitude),
      lng: Number(newLoc.lng || newLoc.longitude),
      cityName: newLoc.cityName || newLoc.address || 'User Custom Location',
      address: newLoc.address || `${newLoc.lat?.toFixed(4)}, ${newLoc.lng?.toFixed(4)}`,
    };
    setUserLocationState(updated);
    localStorage.setItem('civicpulse_user_location', JSON.stringify(updated));
  };

  const openLocationPrompt = () => setShowLocationPrompt(true);
  const closeLocationPrompt = () => setShowLocationPrompt(false);

  useEffect(() => {
    async function initAuth() {
      try {
        const token = localStorage.getItem('civicpulse_token');
        if (token) {
          const current = await authService.getCurrentUser();
          if (current) {
            setUser(current);
          } else {
            setUser(null);
            localStorage.removeItem('civicpulse_token');
            localStorage.removeItem('civicpulse_user');
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn('Auth init failed:', err);
        setUser(null);
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
      // Ask user about their current location after login
      setShowLocationPrompt(true);
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
      // Ask user about their current location after registration
      setShowLocationPrompt(true);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const switchDemoRole = (roleOrDept) => {
    if (roleOrDept === 'GUEST') {
      logout();
      return;
    }

    const allUsers = mockDB.getUsers();
    let target = null;

    if (roleOrDept === 'ELECTRICAL_ADMIN') {
      target = allUsers.find((u) => u.email === 'admin-electrical@civicpulse.org');
    } else if (roleOrDept === 'WATER_ADMIN') {
      target = allUsers.find((u) => u.email === 'admin-water@civicpulse.org');
    } else if (roleOrDept === 'ROADS_ADMIN') {
      target = allUsers.find((u) => u.email === 'admin-roads@civicpulse.org');
    } else if (roleOrDept === 'MUNICIPAL_ADMIN') {
      target = allUsers.find((u) => u.email === 'admin-municipal@civicpulse.org');
    } else if (roleOrDept === 'SUPER_ADMIN' || roleOrDept === 'ADMIN') {
      target = allUsers.find((u) => u.email === 'admin@civicpulse.org');
    } else if (roleOrDept === 'CITIZEN') {
      target = allUsers.find((u) => u.role === 'CITIZEN');
    }

    if (!target) {
      target = allUsers.find((u) => u.role === (roleOrDept === 'CITIZEN' ? 'CITIZEN' : 'ADMIN'));
    }

    if (target) {
      localStorage.setItem('civicpulse_token', `mock-jwt-token-${target.id}-${Date.now()}`);
      localStorage.setItem('civicpulse_user', JSON.stringify(target));
      setUser(target);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isSuperAdmin: user?.role === 'ADMIN' && (!user.department || user.department === 'ALL'),
    department: user?.department || 'ALL',
    isCitizen: user?.role === 'CITIZEN',
    loading,
    userLocation,
    updateUserLocation,
    showLocationPrompt,
    openLocationPrompt,
    closeLocationPrompt,
    login,
    register,
    logout,
    switchDemoRole,
    updateUser,
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
