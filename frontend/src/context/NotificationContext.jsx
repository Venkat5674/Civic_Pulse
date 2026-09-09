import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDB } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const allNotifs = mockDB.getNotifications();
    const userNotifs = allNotifs.filter((n) => n.userId === user.id);
    setNotifications(userNotifs);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, readAt: new Date().toISOString() } : n
    );
    setNotifications(updated);

    const all = mockDB.getNotifications();
    const nextAll = all.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    mockDB.setNotifications(nextAll);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, readAt: new Date().toISOString() }));
    setNotifications(updated);

    if (user) {
      const all = mockDB.getNotifications();
      const nextAll = all.map((n) => (n.userId === user.id ? { ...n, readAt: new Date().toISOString() } : n));
      mockDB.setNotifications(nextAll);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
