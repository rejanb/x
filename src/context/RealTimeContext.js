import React, { createContext, useContext, useEffect, useState } from 'react';
import websocketService from '../services/websocket';
import pushNotificationService from '../services/pushNotifications';
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
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newPostsCount, setNewPostsCount] = useState(0);
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
    if (token && user) {
      // Initialize push notifications
      const initPushNotifications = async () => {
        const initialized = await pushNotificationService.initialize();
        
        if (initialized) {
          // Automatically request permission
          const permissionGranted = await pushNotificationService.requestPermission();
          
          if (permissionGranted) {
            // Subscribe to push notifications
            const subscribed = await pushNotificationService.subscribe(token);
          }
          
          // Update status regardless of subscription result
          const finalStatus = pushNotificationService.getStatus();
          setPushNotificationStatus(finalStatus);
        }
      };
      
      initPushNotifications();

      // Connect to WebSocket
      websocketService.connect(token);
      
      // Listen for connection status
      const handleConnectionStatus = () => {
        setIsConnected(websocketService.isSocketConnected());
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

      // Register event listeners
      websocketService.on('connect', handleConnectionStatus);
      websocketService.on('disconnect', handleConnectionStatus);
      websocketService.on('newPost', handleNewPost);
      websocketService.on('postUpdate', handlePostUpdate);
      websocketService.on('notification', handleNotification);
      websocketService.on('realTimeNotification', handleRealTimeNotification);

      // Set initial connection status
      handleConnectionStatus();

      return () => {
        // Cleanup listeners
        websocketService.off('connect', handleConnectionStatus);
        websocketService.off('disconnect', handleConnectionStatus);
        websocketService.off('newPost', handleNewPost);
        websocketService.off('postUpdate', handlePostUpdate);
        websocketService.off('notification', handleNotification);
        websocketService.off('realTimeNotification', handleRealTimeNotification);
        
        // Disconnect WebSocket
        websocketService.disconnect();
      };
    }
  }, [token, user, pushNotificationStatus.isSubscribed]);

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
    if (!token) return false;
    
    const hasPermission = await pushNotificationService.requestPermission();
    if (!hasPermission) return false;
    
    const subscribed = await pushNotificationService.subscribe(token);
    setPushNotificationStatus(pushNotificationService.getStatus());
    return subscribed;
  };

  const disablePushNotifications = async () => {
    if (!token) return false;
    
    const unsubscribed = await pushNotificationService.unsubscribe(token);
    setPushNotificationStatus(pushNotificationService.getStatus());
    return unsubscribed;
  };

  const sendTestPushNotification = async () => {
    if (!token) return false;
    return await pushNotificationService.sendTestNotification(token);
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

  const value = {
    isConnected,
    notifications,
    newPostsCount,
    clearNewPostsCount,
    markNotificationAsRead,
    clearAllNotifications,
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
