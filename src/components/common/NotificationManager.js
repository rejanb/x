import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import NotificationToast from './NotificationToast';
import websocketService from '../../services/websocket';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  // Always listen for generic toast events
  useEffect(() => {
    const handleToast = (e) => {
      const n = e.detail || {};
      const toastNotification = {
        id: n.id || Date.now(),
        type: n.type || 'info',
        message: n.message || '',
        timestamp: n.timestamp || new Date(),
      };
      setNotifications(prev => [...prev, toastNotification]);
    };
    window.addEventListener('toast:show', handleToast);
    return () => window.removeEventListener('toast:show', handleToast);
  }, []);

  useEffect(() => {
    if (!user) return;

  // Listen for WebSocket notifications
    const handleNotification = (notification) => {
      console.log('[NotificationManager] Received notification:', notification);
      
      // Add notification to toast list
      const toastNotification = {
        ...notification,
        id: notification.id || Date.now(),
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, toastNotification]);
    };

  // Subscribe to WebSocket notifications
    websocketService.on('notification', handleNotification);

    return () => {
      websocketService.off('notification', handleNotification);
    };
  }, [user]);

  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  return (
    <div className="notification-manager">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationManager;
