import React from 'react';
import { useRealTime } from '../../context/RealTimeContext';
import './PushNotificationSettings.css';

const PushNotificationSettings = () => {
  const {
    pushNotificationStatus,
    enablePushNotifications,
    disablePushNotifications,
    sendTestPushNotification
  } = useRealTime();

  const handleTogglePushNotifications = async () => {
    if (pushNotificationStatus.isSubscribed) {
      const success = await disablePushNotifications();
      if (success) {
        alert('Push notifications disabled successfully');
      } else {
        alert('Failed to disable push notifications');
      }
    } else {
      const success = await enablePushNotifications();
      if (success) {
        alert('Push notifications enabled successfully');
      } else {
        alert('Failed to enable push notifications. Please check your browser settings.');
      }
    }
  };

  const handleTestNotification = async () => {
    const success = await sendTestPushNotification();
    if (success) {
      alert('Test notification sent! Check your notifications.');
    } else {
      alert('Failed to send test notification');
    }
  };

  if (!pushNotificationStatus.isSupported) {
    return (
      <div className="push-notification-settings">
        <h3>Push Notifications</h3>
        <div className="notification-status unsupported">
          ❌ Push notifications are not supported in your browser
        </div>
      </div>
    );
  }

  return (
    <div className="push-notification-settings">
      <h3>Push Notifications</h3>
      
      <div className="notification-status-container">
        <div className={`notification-status ${pushNotificationStatus.permission}`}>
          <strong>Permission:</strong> {pushNotificationStatus.permission}
        </div>
        
        <div className={`notification-status ${pushNotificationStatus.isSubscribed ? 'subscribed' : 'unsubscribed'}`}>
          <strong>Status:</strong> {pushNotificationStatus.isSubscribed ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      <div className="notification-controls">
        <button
          className={`toggle-btn ${pushNotificationStatus.isSubscribed ? 'disable' : 'enable'}`}
          onClick={handleTogglePushNotifications}
          disabled={pushNotificationStatus.permission === 'denied'}
        >
          {pushNotificationStatus.isSubscribed ? 'Disable' : 'Enable'} Push Notifications
        </button>

        {pushNotificationStatus.isSubscribed && (
          <button
            className="test-btn"
            onClick={handleTestNotification}
          >
            Send Test Notification
          </button>
        )}
      </div>

      {pushNotificationStatus.permission === 'denied' && (
        <div className="notification-help">
          <p>Push notifications are blocked. To enable them:</p>
          <ul>
            <li>Click the lock icon in your browser's address bar</li>
            <li>Allow notifications for this site</li>
            <li>Refresh the page and try again</li>
          </ul>
        </div>
      )}

      <div className="notification-features">
        <h4>You'll receive notifications for:</h4>
        <ul>
          <li>✅ New posts from people you follow</li>
          <li>✅ Likes on your posts</li>
          <li>✅ Replies to your posts</li>
          <li>✅ New followers</li>
          <li>✅ Mentions in posts</li>
        </ul>
      </div>
    </div>
  );
};

export default PushNotificationSettings;
