import React from "react";
import "./ConfirmationDialog.css";

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "default", // 'default', 'danger', 'warning'
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getIconForType = () => {
    switch (type) {
      case "danger":
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#e0245e">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        );
      case "warning":
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#ff9500">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#1d9bf0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        );
    }
  };

  return (
    <div className="confirmation-overlay" onClick={handleOverlayClick}>
      <div className="confirmation-dialog">
        <div className="confirmation-content">
          <div className="confirmation-icon">{getIconForType()}</div>

          <div className="confirmation-text">
            <h3 className="confirmation-title">{title}</h3>
            <p className="confirmation-message">{message}</p>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="confirmation-btn cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`confirmation-btn confirm-btn ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
