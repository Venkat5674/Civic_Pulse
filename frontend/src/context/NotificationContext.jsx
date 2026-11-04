import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { apiClient, mockDB } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  // Fetch initial notifications
  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      const response = await apiClient.get('/notifications');
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        return;
      }
    } catch (err) {
      console.warn('Backend notifications endpoint unavailable, falling back to mockDB:', err.message);
    }

    const allNotifs = mockDB.getNotifications();
    const userNotifs = allNotifs.filter((n) => n.userId === user.id);
    setNotifications(userNotifs);
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  // Connect Socket.io real-time listener
  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
        : 'http://localhost:5000');

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
      newSocket.emit('join_room', { userId: user.id, role: user.role });
    });

    newSocket.on('status_updated', (data) => {
      toast.info(`Status update on issue: Status changed to "${data.status}"`, {
        description: data.note || 'Municipal authorities updated your issue status.',
      });

      const newNotif = {
        id: `notif-${Date.now()}`,
        userId: user.id,
        issueId: data.issueId,
        type: 'STATUS_CHANGE',
        title: 'Issue Status Update',
        message: `Issue status changed to ${data.status}${data.note ? `: ${data.note}` : ''}`,
        readAt: null,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotif, ...prev]);
    });

    newSocket.on('notification', (newNotif) => {
      toast.info(newNotif.title || 'New Notification', {
        description: newNotif.message,
      });
      setNotifications((prev) => [newNotif, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );

    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.warn('Backend markAsRead failed, persisting to local storage mock:', err.message);
      const all = mockDB.getNotifications();
      const nextAll = all.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      mockDB.setNotifications(nextAll);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );

    try {
      await apiClient.patch('/notifications/read-all');
    } catch (err) {
      console.warn('Backend markAllAsRead failed, persisting to local storage mock:', err.message);
      if (user) {
        const all = mockDB.getNotifications();
        const nextAll = all.map((n) => (n.userId === user.id ? { ...n, readAt: new Date().toISOString() } : n));
        mockDB.setNotifications(nextAll);
      }
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetchNotifications: loadNotifications,
        socket,
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
