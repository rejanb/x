import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./CommentComposer.css";

const CommentComposer = ({ onSubmit }) => {
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment("");
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setComment("");
    setIsExpanded(false);
  };

  const isDisabled = !comment.trim();

  return (
    <div className="comment-composer">
      <div className="comment-form">
        <div className="comment-avatar">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.username} />
          ) : (
            <div className="avatar-placeholder">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="comment-form-content">
          <div className="comment-input-container">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onFocus={handleFocus}
              placeholder="Post your reply"
              className="comment-textarea"
              rows={isExpanded ? 3 : 1}
              maxLength={280}
            />

            {isExpanded && (
              <div className="character-count">
                <span className={comment.length > 260 ? "warning" : ""}>
                  {280 - comment.length}
                </span>
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="comment-actions">
              <div className="comment-options">
                <button
                  type="button"
                  className="media-button"
                  title="Add media"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="emoji-button"
                  title="Add emoji"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.969-2.052-3.969-2.052s1.745 2.052 3.969 2.052 3.969-2.052 3.969-2.052S14.224 16 12 16zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                  </svg>
                </button>
              </div>

              <div className="comment-submit-area">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-button"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isDisabled}
                  className="reply-button"
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CommentComposer;
