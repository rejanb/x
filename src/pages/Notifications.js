import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NotificationTabs from "../components/notifications/NotificationTabs";
import NotificationList from "../components/notifications/NotificationList";
import PushNotificationSettings from "../components/notifications/PushNotificationSettings";
import { useRealTime } from "../context/RealTimeContext";
import { useAuth } from "../context/AuthContext";
import { notificationAPI } from "../services/apiService";
import "./Notifications.css";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { notifications: realTimeNotifications } = useRealTime();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Removed actor filter UI state

  const tabs = [
    { key: "all", label: "All", count: null },
    { key: "settings", label: "Settings", count: null },
    { key: "verified", label: "Verified", count: null },
    { key: "mentions", label: "Mentions", count: null },
  ];

  // Fetch user-specific notifications from API
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping notifications fetch');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      if (!append) {
        setIsLoading(true);
      }

      console.log(`🔔 Fetching notifications for user ${user.id}, page ${pageNum}`);
  const response = await notificationAPI.getNotifications(pageNum, 10);
      
      console.log('📬 Notifications response:', response);
      
      // Support both shapes: { data, pagination, unreadCount } and legacy { notifications, hasMore, unreadCount }
      let newNotifications = [];
      let pagination = null;
      if (response?.data) {
        newNotifications = response.data;
        pagination = response.pagination;
      } else if (response?.notifications) {
        newNotifications = response.notifications;
        pagination = response.pagination || null;
      }

      // Normalize fields (id, read)
      const normalized = (newNotifications || []).map((n) => ({
        ...n,
        id: n.id || n._id,
        read: typeof n.read === 'boolean' ? n.read : (typeof n.isRead === 'boolean' ? n.isRead : false),
      }));

      if (append) {
        setNotifications((prev) => [...prev, ...normalized]);
      } else {
        setNotifications(normalized);
      }

      // hasMore via pagination if available
      const totalPages = pagination?.pages;
      setHasMore(typeof totalPages === 'number' ? pageNum < totalPages : Boolean(response?.hasMore));
      setPage(pageNum);

      // Update unread count
      if (typeof response?.unreadCount === 'number') {
        setUnreadCount(response.unreadCount);
      } else {
        const unread = normalized.filter((n) => !n.read);
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
      
      // Fallback to empty array on error
      if (!append) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Fetch notifications when component mounts or user changes
    if (isAuthenticated && user) {
      fetchNotifications(1, false);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, fetchNotifications]);

  useEffect(() => {
    // Merge real-time notifications with existing ones
    if (realTimeNotifications && realTimeNotifications.length > 0) {
      console.log('📨 Adding real-time notifications:', realTimeNotifications);
      
      // Add new real-time notifications to the beginning
      setNotifications(prev => {
        const newNotifications = [...realTimeNotifications, ...prev];
        // Remove duplicates based on ID
        const uniqueNotifications = newNotifications.filter((notif, index, self) =>
          index === self.findIndex(n => n.id === notif.id)
        );
        return uniqueNotifications;
      });
      
      // Update unread count
      const newUnreadCount = realTimeNotifications.filter(n => !n.read).length;
      setUnreadCount(prev => prev + newUnreadCount);
    }
  }, [realTimeNotifications]);

  const filteredNotifications = notifications.filter((notification) => {
    switch (activeTab) {
      case "verified":
        return notification.user.verified;
      case "mentions":
        return notification.type === "mention" || notification.type === "reply";
      default:
        return true;
    }
  });

  const markAsRead = async (notificationId) => {
    try {
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
  // Inform other parts (e.g., sidebar) to update badge
  window.dispatchEvent(new CustomEvent('notifications:markedAsRead', { detail: { id: notificationId, delta: 1 } }));

      // Update on server
      await notificationAPI.markAsRead(notificationId);
      console.log(`✅ Marked notification ${notificationId} as read`);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      // Revert optimistic update
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: false } : notif
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    // Compute once for both try/catch scopes
    const unreadBefore = notifications.filter(n => !n.read);
    try {
      // Optimistically update UI
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
  window.dispatchEvent(new Event('notifications:markedAllAsRead'));

      // Update on server
      await notificationAPI.markAllAsRead();
      console.log('✅ Marked all notifications as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      // Revert optimistic update
      setNotifications((prev) =>
        prev.map((notif) => {
          const wasUnread = unreadBefore.find(n => n.id === notif.id);
          return wasUnread ? { ...notif, read: false } : notif;
        })
      );
      setUnreadCount(unreadBefore.length);
    }
  };

  const loadMoreNotifications = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  // Removed actor filter apply function

  // Removed URL-based actor filter initialization

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <NotificationTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

  <div className="notifications-content">

        {activeTab === 'settings' ? (
          <PushNotificationSettings />
        ) : (
          <>
            {!isAuthenticated ? (
              <div className="auth-required">
                <p>Please log in to view your notifications.</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => fetchNotifications(1, false)}>
                  Try Again
                </button>
              </div>
            ) : isLoading && notifications.length === 0 ? (
              <div className="loading-notifications">
                <div className="loading-spinner">Loading your notifications...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <p>You don't have any notifications yet.</p>
                <p>When someone likes, retweets, or mentions you, you'll see it here!</p>
              </div>
            ) : (
              <>
                <NotificationList
                  notifications={filteredNotifications}
                  onMarkAsRead={markAsRead}
                />
                {hasMore && (
                  <div className="load-more-section">
                    <button 
                      className="load-more-btn" 
                      onClick={loadMoreNotifications}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Load More Notifications'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
