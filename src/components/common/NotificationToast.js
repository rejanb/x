import React, { useState, useEffect } from 'react';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 5000); // Show for 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return '💬';
      case 'reply':
        return '↩️';
      case 'like':
        return '❤️';
      case 'follow':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationMessage = (notification) => {
    const icon = getNotificationIcon(notification.type);
    return `${icon} ${notification.message}`;
  };

  return (
    <div className={`notification-toast ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="notification-content">
        <div className="notification-message">
          {getNotificationMessage(notification)}
        </div>
        <button className="notification-close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
