import React from 'react';

const BigRedButton = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'red',
        color: 'white',
        padding: '20px 40px',
        fontSize: '24px',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        zIndex: 99999, // Much higher z-index
        boxShadow: '0 0 20px rgba(255,0,0,0.5)',
        pointerEvents: 'auto' // Ensure it can be clicked
      }}
      onClick={() => {
        alert('Big Red Button Clicked! Component is working!');
        
        // Test basic notification
        if ('Notification' in window) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('🔴 Big Red Button Test', {
                body: 'This notification came from the big red button!',
                icon: '/icons/icon-192x192.png'
              });
            }
          });
        }
      }}
    >
      🔴 BIG RED TEST BUTTON 🔴
      <br />
      Click Me!
      <br />
      <small style={{fontSize: '12px'}}>z-index: 99999</small>
    </div>
  );
};

export default BigRedButton;
