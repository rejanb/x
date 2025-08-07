import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import HashtagText from "../common/HashtagText";
import "./CommentItem.css";

const CommentItem = ({ comment }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(comment.liked || false);
  const [likes, setLikes] = useState(comment.likes || 0);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleLike = () => {
    if (liked) {
      setLikes((prev) => prev - 1);
      setLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setLiked(true);
    }
  };

  const handleReply = () => {
    // In a real app, this would open a reply composer
    console.log("Reply to comment:", comment.id);
  };

  const isOwner = user && comment.author && user.id === comment.author.id;

  return (
    <div className="comment-item">
      <div className="comment-content">
        <div className="comment-avatar">
          {comment.author.profilePicture ? (
            <img
              src={comment.author.profilePicture}
              alt={comment.author.username}
            />
          ) : (
            <div className="avatar-placeholder">
              {comment.author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="comment-body">
          <div className="comment-header">
            <div className="comment-author">
              <span className="display-name">{comment.author.displayName}</span>
              {comment.author.verified && (
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
              <span className="username">@{comment.author.username}</span>
              <span className="separator">·</span>
              <span className="timestamp">{formatTime(comment.createdAt)}</span>
            </div>

            {isOwner && (
              <button className="delete-comment-btn" title="Delete comment">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h2v10.5C5 19.88 6.12 21 7.5 21h9c1.38 0 2.5-1.12 2.5-2.5V8h2V6h-5zM10 4.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zM17 18.5c0 .28-.22.5-.5.5h-9c-.28 0-.5-.22-.5-.5V8h10v10.5z" />
                  <path d="M9 10v6h2v-6H9zm4 0v6h2v-6h-2z" />
                </svg>
              </button>
            )}
          </div>

          <div className="comment-text">
            <p>
              <HashtagText text={comment.content} />
            </p>
          </div>

          <div className="comment-actions">
            <button
              className="comment-action-btn reply-btn"
              onClick={handleReply}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
              </svg>
              {comment.replies > 0 && (
                <span className="action-count">{comment.replies}</span>
              )}
            </button>

            <button
              className={`comment-action-btn like-btn ${liked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
              </svg>
              {likes > 0 && <span className="action-count">{likes}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
