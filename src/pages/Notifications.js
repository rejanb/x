import React, { useState, useEffect } from "react";
import NotificationTabs from "../components/notifications/NotificationTabs";
import NotificationList from "../components/notifications/NotificationList";
import "./Notifications.css";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { key: "all", label: "All", count: null },
    { key: "verified", label: "Verified", count: null },
    { key: "mentions", label: "Mentions", count: null },
  ];

  // Mock notifications data - in real app, this would come from an API
  const mockNotifications = [
    {
      id: "notif-1",
      type: "like",
      user: {
        id: 201,
        displayName: "Sarah Chen",
        username: "sarahchen",
        verified: true,
        profilePicture: null,
      },
      tweet: {
        id: "tweet-123",
        content: "Just shipped my first React app! 🚀",
      },
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "notif-2",
      type: "retweet",
      user: {
        id: 202,
        displayName: "Tech News",
        username: "technews",
        verified: true,
        profilePicture: null,
      },
      tweet: {
        id: "tweet-124",
        content:
          "New JavaScript features are amazing! ES2024 brings so many improvements.",
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "notif-3",
      type: "follow",
      user: {
        id: 203,
        displayName: "John Developer",
        username: "johndev",
        verified: false,
        profilePicture: null,
      },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "notif-4",
      type: "mention",
      user: {
        id: 204,
        displayName: "Design Pro",
        username: "designpro",
        verified: true,
        profilePicture: null,
      },
      tweet: {
        id: "tweet-125",
        content: "Hey @username, loved your latest post about React hooks!",
      },
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "notif-5",
      type: "reply",
      user: {
        id: 205,
        displayName: "Code Master",
        username: "codemaster",
        verified: false,
        profilePicture: null,
      },
      tweet: {
        id: "tweet-126",
        content:
          "Great explanation! This really helped me understand the concept.",
      },
      replyTo: {
        id: "tweet-127",
        content: "Understanding React Context API in 5 minutes",
      },
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "notif-6",
      type: "like",
      user: {
        id: 206,
        displayName: "Frontend Dev",
        username: "frontenddev",
        verified: false,
        profilePicture: null,
      },
      tweet: {
        id: "tweet-128",
        content: "CSS Grid is such a powerful layout tool!",
      },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "notif-7",
      type: "retweet",
      user: {
        id: 207,
        displayName: "Web Dev Weekly",
        username: "webdevweekly",
        verified: true,
        profilePicture: null,
      },
      tweet: {
        id: "tweet-129",
        content: "The future of web development is looking bright! 🌟",
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.read).length);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

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
        {isLoading ? (
          <div className="loading-notifications">
            <div className="loading-spinner">Loading notifications...</div>
          </div>
        ) : (
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;
