import React, { useEffect, useRef } from 'react';
import './RetweetMenu.css';

const RetweetMenu = ({
  open,
  onClose,
  onRetweet,
  onUnretweet,
  onQuote,
  retweeted,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="retweet-menu" role="menu" ref={ref}>
      {retweeted ? (
        <button className="retweet-menu-item danger" role="menuitem" onClick={onUnretweet}>
          Undo Retweet
        </button>
      ) : (
        <button className="retweet-menu-item" role="menuitem" onClick={onRetweet}>
          Retweet
        </button>
      )}
      <button className="retweet-menu-item" role="menuitem" onClick={onQuote}>
        Quote Post
      </button>
    </div>
  );
};

export default RetweetMenu;
