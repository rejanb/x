import React from "react";
import NotificationItem from "./NotificationItem";
import "./NotificationList.css";

const NotificationList = ({ notifications, onMarkAsRead }) => {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="empty-notifications">
        <div className="empty-icon">🔔</div>
        <h3>No notifications yet</h3>
        <p>
          When people interact with your posts, you'll see their activity here.
        </p>
      </div>
    );
  }

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};

export default NotificationList;
