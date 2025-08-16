import React from 'react';

const SimpleNotificationTester = () => {
  const testSimpleNotification = async () => {
    console.log('🔔 Testing simple notification...');
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    console.log('📱 Current permission:', Notification.permission);

    // Request permission if needed
    let permission = Notification.permission;
    if (permission === 'default') {
      try {
        permission = await Notification.requestPermission();
        console.log('🔔 Permission result:', permission);
      } catch (error) {
        console.error('❌ Error requesting permission:', error);
        alert('Error requesting notification permission: ' + error.message);
        return;
      }
    }

    if (permission === 'granted') {
      try {
        const notification = new Notification('🎉 Test Notification', {
          body: 'This is a simple test notification!',
          icon: '/icons/icon-192x192.png',
          tag: 'simple-test',
          requireInteraction: false
        });

        // Auto-close after 3 seconds
        setTimeout(() => {
          notification.close();
        }, 3000);

        console.log('✅ Simple notification created successfully!');
      } catch (error) {
        console.error('❌ Error creating notification:', error);
        alert('Error creating notification: ' + error.message);
      }
    } else {
      alert('Notification permission denied. Please enable notifications in your browser settings.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 99998, // High z-index
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      pointerEvents: 'auto'
    }}
    onClick={testSimpleNotification}
    >
      🔔 Test Simple Notification
    </div>
  );
};

export default SimpleNotificationTester;
