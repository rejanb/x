import React, { useState, useEffect } from 'react';
import './QuoteTweetModal.css';

const QuoteTweetModal = ({ open, onClose, onSubmit, tweet }) => {
  const [text, setText] = useState('');
  useEffect(() => { if (!open) setText(''); }, [open]);
  if (!open) return null;
  return (
    <div className="quote-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="quote-modal" onClick={(e)=>e.stopPropagation()}>
        <textarea
          className="quote-input"
          placeholder="Add a comment"
          value={text}
          onChange={(e)=>setText(e.target.value)}
          rows={4}
        />
        <div className="quote-preview">
          <div className="preview-content">{tweet?.content || ''}</div>
        </div>
        <div className="quote-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={()=>onSubmit(text)} disabled={!text.trim()}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default QuoteTweetModal;
