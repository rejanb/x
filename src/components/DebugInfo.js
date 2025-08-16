import React, { useState, useEffect } from 'react';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 50) + '...',
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      notificationPermission: 'Notification' in window ? Notification.permission : 'not supported',
      hasRealTimeContext: false,
      appVersion: Date.now() // Simple version based on current time
    };

    try {
      // Try to access the RealTime context
      const context = window.RealTimeContext || null;
      info.hasRealTimeContext = !!context;
    } catch (e) {
      info.contextError = e.message;
    }

    setDebugInfo(info);
    console.log('🔍 Debug Info:', info);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '10px',
      fontFamily: 'monospace',
      zIndex: 99997, // High z-index
      maxWidth: '300px',
      overflow: 'hidden',
      pointerEvents: 'auto'
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>🔍 Debug Info</h4>
      <div>URL: {debugInfo.url}</div>
      <div>Version: {debugInfo.appVersion}</div>
      <div>SW Support: {debugInfo.serviceWorker ? '✅' : '❌'}</div>
      <div>Notifications: {debugInfo.notifications ? '✅' : '❌'}</div>
      <div>Permission: {debugInfo.notificationPermission}</div>
      <div>RealTime: {debugInfo.hasRealTimeContext ? '✅' : '❌'}</div>
      {debugInfo.contextError && <div style={{color: 'red'}}>Error: {debugInfo.contextError}</div>}
    </div>
  );
};

export default DebugInfo;
