// Test utility for debugging push notifications
import { API_BASE_URL } from '../config/apiConfig';

window.testPushNotifications = {
  // Test if user is authenticated
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('🔐 Auth token:', token ? 'Present' : 'Missing');
    console.log('👤 User data:', user ? JSON.parse(user) : 'Missing');
    return { token, user: user ? JSON.parse(user) : null };
  },

  // Test browser support
  checkSupport: () => {
    const support = {
      notifications: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      permission: Notification.permission
    };
    console.log('🔧 Browser support:', support);
    return support;
  },

  // Initialize push notifications manually
  initPushNotifications: async () => {
    console.log('🔔 Manual push notification initialization...');
    
    const auth = window.testPushNotifications.checkAuth();
    if (!auth.token) {
      console.error('❌ No authentication token found. Please login first.');
      return false;
    }

    const support = window.testPushNotifications.checkSupport();
    if (!support.notifications) {
      console.error('❌ Notifications not supported in this browser');
      return false;
    }

    try {
      // Initialize service
      console.log('🔧 Initializing push service...');
      const { default: pushNotificationService } = await import('../services/pnsClient.js');
      const initialized = await pushNotificationService.initialize();
      console.log('📋 Service initialized:', initialized);

      if (!initialized) {
        console.error('❌ Failed to initialize push service');
        return false;
      }

      // Request permission
      console.log('🔔 Requesting permission...');
      const hasPermission = await pushNotificationService.requestPermission();
      console.log('📋 Permission granted:', hasPermission);

      if (!hasPermission) {
        console.error('❌ Permission denied');
        return false;
      }

      // Subscribe
      console.log('📡 Subscribing to push notifications...');
      const subscribed = await pushNotificationService.subscribe(auth.token);
      console.log('📋 Subscription result:', subscribed);

      if (subscribed) {
        console.log('🎉 Push notifications successfully set up!');
        return true;
      } else {
        console.error('❌ Failed to subscribe');
        return false;
      }
    } catch (error) {
      console.error('❌ Error during initialization:', error);
      return false;
    }
  },

  // Test manual notification
  testManualNotification: () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a manual test notification!',
        icon: '/icons/icon-192x192.png',
        tag: 'manual-test'
      });
      console.log('✅ Manual notification sent');
      return true;
    } else {
      console.error('❌ No notification permission');
      return false;
    }
  },

  // Send test push notification via API
  sendTestPush: async () => {
    const auth = window.testPushNotifications.checkAuth();
    if (!auth.token) {
      console.error('❌ No authentication token');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/push/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test push notification sent:', result);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Failed to send test push:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending test push:', error);
      return false;
    }
  }
};

console.log('🧪 Push notification test utilities loaded!');
console.log('Available commands:');
console.log('  - testPushNotifications.checkAuth()');
console.log('  - testPushNotifications.checkSupport()');
console.log('  - testPushNotifications.initPushNotifications()');
console.log('  - testPushNotifications.testManualNotification()');
console.log('  - testPushNotifications.sendTestPush()');
