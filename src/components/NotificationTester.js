import React from 'react';

const NotificationTester = () => {
  // Simple version without context for now
  const testBasicNotification = async () => {
    console.log('🔔 Testing basic notification from NotificationTester...');
    
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      new Notification('🔔 NotificationTester Test', {
        body: 'This is from the NotificationTester component!',
        icon: '/icons/icon-192x192.png'
      });
    } else {
      alert('Notification permission denied');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'blue',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 99996, // High z-index
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      pointerEvents: 'auto'
    }}
    onClick={testBasicNotification}
    >
      🔔 Blue Notification Test
    </div>
  );
};

export default NotificationTester;
