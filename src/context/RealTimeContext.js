import React, { createContext, useContext, useEffect, useState } from 'react';
import websocketService from '../services/websocket';
import { useAuth } from './AuthContext';

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const { user, token, logout } = useAuth(); // Add logout from useAuth
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [authError, setAuthError] = useState(null); // Add auth error state
  const [pushNotificationStatus, setPushNotificationStatus] = useState({
    isSupported: false,
    permission: 'default',
    isSubscribed: false
  });

  // Helper function to get notification title based on type
  const getNotificationTitle = (type) => {
    switch (type) {
      case 'like': return '❤️ New Like';
      case 'retweet': return '🔄 New Retweet';
      case 'reply': return '💬 New Reply';
      case 'comment': return '💬 New Comment';
      case 'follow': return '👥 New Follower';
      case 'mention': return '📢 You were mentioned';
      case 'post': return '📝 New Post';
      default: return '🔔 New Notification';
    }
  };

  // Helper function to get notification body
  const getNotificationBody = (notification) => {
    const username = notification.fromUser || notification.username || 'Someone';
    const content = notification.content || '';
    
    switch (notification.type) {
      case 'like':
        return `${username} liked your post${content ? `: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"` : ''}`;
      case 'retweet':
        return `${username} retweeted your post${content ? `: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"` : ''}`;
      case 'reply':
      case 'comment':
        return `${username} replied to your post${content ? `: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"` : ''}`;
      case 'follow':
        return `${username} started following you`;
      case 'mention':
        return `${username} mentioned you in a post${content ? `: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"` : ''}`;
      case 'post':
        return `${username} posted: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`;
      default:
        return notification.message || content || 'You have a new notification';
    }
  };

  useEffect(() => {
    console.log('🔄 RealTimeContext: Effect running with token:', token ? 'yes' : 'no', 'user:', user ? user.id : 'none');
    
    if (token && user) {
      console.log('🚀 RealTimeContext: Initializing WebSocket connection for user:', user.id);
      
      // Initialize push notifications with dynamic import to avoid webpack cache issues
      const initPushNotifications = async () => {
        try {
          // Dynamic import to force fresh module loading
          const { default: pushService } = await import('../services/pnsClient.js');
          
          const initialized = await pushService.initialize();
          
          if (initialized) {
            // Automatically request permission
            const permissionGranted = await pushService.requestPermission();
            
            if (permissionGranted) {
              // Subscribe to push notifications
              await pushService.subscribe(token);
            }
            
            // Update status regardless of subscription result
            const finalStatus = pushService.getStatus();
            setPushNotificationStatus(finalStatus);
          }
        } catch (error) {
          console.error('Push notification initialization failed:', error);
        }
      };
      
      initPushNotifications();

      // Connect to WebSocket
      console.log('🔌 RealTimeContext: Connecting to WebSocket...');
      websocketService.connect(token);
      
      // Listen for connection status
      const handleConnectionStatus = () => {
        const connected = websocketService.isSocketConnected();
        console.log('🔄 RealTimeContext: Connection status changed:', connected);
        setIsConnected(connected);
      };

      // Listen for new posts
      const handleNewPost = async (post) => {
        setNewPostsCount(prev => prev + 1);
        
        // Show notification for new posts (from other users)
        if (post.authorId !== user.id && 'Notification' in window) {
          let permission = Notification.permission;
          
          // Request permission if not already granted
          if (permission === 'default') {
            try {
              permission = await Notification.requestPermission();
            } catch (error) {
              // Error handled silently
            }
          }
          
          if (permission === 'granted') {
            try {
              const notification = new Notification('📝 New Post', {
                body: `${post.author?.username || 'Someone'} posted: "${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}"`,
                icon: '/icons/icon-192x192.png',
                tag: `new-post-${post._id}`,
                data: { postId: post._id, type: 'new_post' },
                requireInteraction: false
              });
              
              // Auto-close after 5 seconds
              setTimeout(() => notification.close(), 5000);
            } catch (error) {
              // Error handled silently
            }
          }
        }
        
        // Emit custom event for components to listen
        window.dispatchEvent(new CustomEvent('newPostReceived', { detail: post }));
      };

      // Listen for post updates (likes, retweets, etc.)
      const handlePostUpdate = async (update) => {
        // Show notification for interactions on user's posts
        if (update.postAuthorId === user.id && update.userId !== user.id && 'Notification' in window) {
          let permission = Notification.permission;
          
          // Request permission if not already granted
          if (permission === 'default') {
            try {
              permission = await Notification.requestPermission();
            } catch (error) {
              // Error handled silently
            }
          }
          
          if (permission === 'granted') {
            let notificationTitle = '';
            let notificationBody = '';
            
            switch (update.type) {
              case 'like':
                notificationTitle = '❤️ New Like';
                notificationBody = `${update.username || 'Someone'} liked your post: "${update.postContent?.substring(0, 40)}${update.postContent?.length > 40 ? '...' : ''}"`;
                break;
              case 'retweet':
                notificationTitle = '🔄 New Retweet';
                notificationBody = `${update.username || 'Someone'} retweeted your post: "${update.postContent?.substring(0, 40)}${update.postContent?.length > 40 ? '...' : ''}"`;
                break;
              case 'reply':
                notificationTitle = '💬 New Reply';
                notificationBody = `${update.username || 'Someone'} replied to your post: "${update.replyContent?.substring(0, 50)}${update.replyContent?.length > 50 ? '...' : ''}"`;
                break;
              default:
                notificationTitle = '🔔 Post Update';
                notificationBody = `Your post was updated by ${update.username || 'someone'}`;
            }
            
            try {
              const notification = new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/icons/icon-192x192.png',
                tag: `post-update-${update.postId}-${update.type}`,
                data: { postId: update.postId, type: update.type },
                requireInteraction: false
              });
              
              // Auto-close after 5 seconds
              setTimeout(() => notification.close(), 5000);
            } catch (error) {
              // Error handled silently
            }
          }
        }
        
        // Emit custom event for components to listen
        window.dispatchEvent(new CustomEvent('postUpdateReceived', { detail: update }));
      };

      // Listen for notifications
      const handleNotification = (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 100)); // Keep last 100
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          const notificationTitle = notification.title || getNotificationTitle(notification.type);
          const notificationBody = notification.message || notification.content || getNotificationBody(notification);
          
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: '/icons/icon-192x192.png',
            tag: notification.id || `notification-${Date.now()}`,
            data: { notificationId: notification.id, type: notification.type }
          });
        }
      };

      // Listen for real-time notifications
      const handleRealTimeNotification = (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 100));
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          const notificationTitle = notification.title || 'Real-time Update';
          const notificationBody = notification.message || notification.content || 'You have a new update';
          
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: '/icons/icon-192x192.png',
            tag: notification.id || `realtime-${Date.now()}`,
            data: { notificationId: notification.id, type: 'realtime' }
          });
        }
      };

      // Listen for authentication errors
      const handleAuthError = (error) => {
        console.log('🚨 RealTimeContext: Auth error received:', error);
        setAuthError(error);
        setIsConnected(false);
        
        // Show user-friendly notification
        if (Notification.permission === 'granted') {
          new Notification('🔑 Session Expired', {
            body: error.message || 'Your session has expired. Please log in again to continue receiving real-time updates.',
            icon: '/icons/icon-192x192.png',
            tag: 'auth-error',
            requireInteraction: true
          });
        }
        
        // Stop further reconnection attempts
        websocketService.disconnect();
      };

      // Register event listeners
      websocketService.on('connect', handleConnectionStatus);
      websocketService.on('disconnect', handleConnectionStatus);
      websocketService.on('newPost', handleNewPost);
      websocketService.on('postUpdate', handlePostUpdate);
      websocketService.on('notification', handleNotification);
      websocketService.on('realTimeNotification', handleRealTimeNotification);
      websocketService.on('authError', handleAuthError); // Add auth error listener

      // Set initial connection status
      handleConnectionStatus();

      console.log('✅ RealTimeContext: All event listeners registered and initial connection status set');

      return () => {
        console.log('🧹 RealTimeContext: Cleaning up WebSocket connection');
        // Cleanup listeners
        websocketService.off('connect', handleConnectionStatus);
        websocketService.off('disconnect', handleConnectionStatus);
        websocketService.off('newPost', handleNewPost);
        websocketService.off('postUpdate', handlePostUpdate);
        websocketService.off('notification', handleNotification);
        websocketService.off('realTimeNotification', handleRealTimeNotification);
        websocketService.off('authError', handleAuthError); // Clean up auth error listener
        
        // Disconnect WebSocket
        websocketService.disconnect();
        console.log('✅ RealTimeContext: Cleanup completed');
      };
    } else {
      console.log('⏭️ RealTimeContext: Skipping WebSocket initialization - missing token or user');
    }
  }, [token, user]);

  const clearNewPostsCount = () => {
    setNewPostsCount(0);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Push notification methods
  const enablePushNotifications = async () => {
    try {
      const { default: pushService } = await import('../services/pnsClient.js');
      await pushService.requestPermission();
      
      const subscribed = await pushService.subscribe(token);
      setPushNotificationStatus(pushService.getStatus());
      
      return subscribed;
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      return false;
    }
  };

  const disablePushNotifications = async () => {
    try {
      const { default: pushService } = await import('../services/pnsClient.js');
      const unsubscribed = await pushService.unsubscribe(token);
      setPushNotificationStatus(pushService.getStatus());
      
      return unsubscribed;
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
      return false;
    }
  };

  const sendTestPushNotification = async () => {
    if (!token) return false;
    try {
      const { default: pushService } = await import('../services/pnsClient.js');
      return await pushService.sendTestNotification(token);
    } catch (error) {
      console.error('Failed to send test push notification:', error);
      return false;
    }
  };

  // Function to manually trigger notifications for testing
  const showTestNotification = async (type = 'post', customContent = '') => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      return false;
    }

    // Request permission if not already granted
    let permission = Notification.permission;
    if (permission === 'default') {
      try {
        permission = await Notification.requestPermission();
      } catch (error) {
        return false;
      }
    }

    if (permission === 'granted') {
      const testNotification = {
        type,
        fromUser: 'TestUser',
        username: 'TestUser',
        content: customContent || `This is a test ${type} notification`,
        id: `test-${type}-${Date.now()}`
      };

      const title = getNotificationTitle(type);
      const body = getNotificationBody(testNotification);
      
      try {
        const notification = new Notification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          tag: testNotification.id,
          data: { type: 'test', notificationType: type },
          requireInteraction: false,
          silent: false
        });

        // Auto-close notification after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
        
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const value = {
    isConnected,
    notifications,
    newPostsCount,
    authError, // Add auth error to context
    clearNewPostsCount,
    markNotificationAsRead,
    clearAllNotifications,
    clearAuthError, // Add clear auth error function
    websocketService,
    pushNotificationStatus,
    enablePushNotifications,
    disablePushNotifications,
    sendTestPushNotification,
    showTestNotification, // Add the test notification function
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};
