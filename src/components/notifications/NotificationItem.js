import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationItem.css";

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleClick = () => {
    // Optimistically mark as read
    if (!notification.read) {
      try { onMarkAsRead(notification.id); } catch (_) {}
    }
    // Navigate to post detail if a post is associated
    const postId = notification?.tweet?.id || notification?.meta?.postId;
    if (postId) {
      navigate(`/tweet/${postId}`);
    }
  };

  const renderNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return (
          <div className="notification-icon like-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
            </svg>
          </div>
        );
      case "retweet":
        return (
          <div className="notification-icon retweet-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z" />
            </svg>
          </div>
        );
  case "follow":
        return (
          <div className="notification-icon follow-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
            </svg>
          </div>
        );
      case "unfollow":
        return (
          <div className="notification-icon follow-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
            </svg>
          </div>
        );
      case "new_post":
        return (
          <div className="notification-icon new-post-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3.03-6.78 2.16-2.912 5.29-4.911 9.45-4.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z" />
            </svg>
          </div>
        );
      case "mention":
  case "reply":
  case "comment":
  case "comment-like":
        return (
          <div className="notification-icon mention-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const renderNotificationContent = () => {
    const buildPreviewText = () => {
      if (!notification.tweet) return '';
      const base = (notification.tweet.content && notification.tweet.content.trim().length > 0)
        ? notification.tweet.content.trim()
        : (Array.isArray(notification.tweet.media) && notification.tweet.media.length > 0
            ? 'Shared a media post'
            : '');
      if (!base) return '';
      return base.length > 100 ? `${base.slice(0, 100)}…` : base;
    };
    switch (notification.type) {
      case "like":
        return (
          <div className="notification-content">
            <div className="notification-text">
              <span className="user-name">{notification.user.displayName}</span>
              {notification.user.verified && (
                <span className="verified" title="Verified">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                  </svg>
                </span>
              )}
              <span className="notification-action"> liked your post</span>
            </div>
            {notification.tweet && (
              <div className="tweet-preview">{notification.tweet.content}</div>
            )}
          </div>
        );

      case "retweet":
        return (
          <div className="notification-content">
            <div className="notification-text">
              <span className="user-name">{notification.user.displayName}</span>
              {notification.user.verified && (
                <span className="verified" title="Verified">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                  </svg>
                </span>
              )}
              <span className="notification-action"> retweeted your post</span>
            </div>
            {notification.tweet && (
              <div className="tweet-preview">{notification.tweet.content}</div>
            )}
          </div>
        );

      case "follow":
        return (
          <div className="notification-content">
            <div className="notification-text">
              <span className="user-name">{notification.user.displayName}</span>
              {notification.user.verified && (
                <span className="verified" title="Verified">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                  </svg>
                </span>
              )}
              <span className="notification-action"> followed you</span>
            </div>
          </div>
        );

      case "unfollow":
        return (
          <div className="notification-content">
            <div className="notification-text">
              <span className="user-name">{notification.user.displayName}</span>
              {notification.user.verified && (
                <span className="verified" title="Verified">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                  </svg>
                </span>
              )}
              <span className="notification-action"> unfollowed you</span>
            </div>
          </div>
        );

      case "new_post":
        return (
          <div className="notification-content">
            <div className="notification-text">
              <span className="user-name">{notification.user.displayName}</span>
              {notification.user.verified && (
                <span className="verified" title="Verified">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                  </svg>
                </span>
              )}
              <span className="notification-action"> posted something new</span>
            </div>
            {notification.tweet && (
              <div className="tweet-preview">{buildPreviewText()}</div>
            )}
          </div>
        );

      case "mention":
        return (
          <div className="notification-content">
            <div className="notification-text">
              <span className="user-name">{notification.user.displayName}</span>
              {notification.user.verified && (
                <span className="verified" title="Verified">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                  </svg>
                </span>
              )}
              <span className="notification-action"> mentioned you</span>
            </div>
            {notification.tweet && (
              <div className="tweet-preview">{notification.tweet.content}</div>
            )}
          </div>
        );

      case "reply":
        return (
          <div className="notification-content">
            <div className="notification-text">
              <span className="user-name">{notification.user.displayName}</span>
              {notification.user.verified && (
                <span className="verified" title="Verified">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                  </svg>
                </span>
              )}
              <span className="notification-action"> replied to your post</span>
            </div>
            {notification.tweet && (
              <div className="tweet-preview">{notification.tweet.content}</div>
            )}
          </div>
        );

      case "comment":
        return (
          <div className="notification-content">
            <div className="notification-text">
              <span className="user-name">{notification.user.displayName}</span>
              {notification.user.verified && (
                <span className="verified" title="Verified">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                  </svg>
                </span>
              )}
              <span className="notification-action"> commented on your post</span>
            </div>
            {notification.tweet && (
              <div className="tweet-preview">{notification.tweet.content}</div>
            )}
          </div>
        );

      case "comment-like":
        return (
          <div className="notification-content">
            <div className="notification-text">
              <span className="user-name">{notification.user.displayName}</span>
              {notification.user.verified && (
                <span className="verified" title="Verified">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                  </svg>
                </span>
              )}
              <span className="notification-action"> liked your comment</span>
            </div>
            {notification.tweet && (
              <div className="tweet-preview">{notification.tweet.content}</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`notification-item ${!notification.read ? "unread" : ""}`}
      onClick={handleClick}
    >
      <div className="notification-layout">
        {renderNotificationIcon()}

        <div className="notification-avatar">
          <div className="avatar-placeholder">
            {notification.user.displayName.charAt(0)}
          </div>
        </div>

        <div className="notification-body">
          {renderNotificationContent()}
          <div className="notification-time">
            {formatTime(notification.createdAt)}
          </div>
        </div>
      </div>

      {!notification.read && <div className="unread-indicator"></div>}
    </div>
  );
};

export default NotificationItem;
