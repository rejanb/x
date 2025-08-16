import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTweets } from "../../context/TweetContext";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import { userAPI } from "../../services/apiService";
import ConfirmationDialog from "../common/ConfirmationDialog";
import HashtagText from "../common/HashtagText";
import Poll from "./Poll";
import "./TweetCard.css";

const TweetCard = ({ tweet }) => {
  const { user } = useAuth();
  const { toggleLike, toggleRetweet, deleteTweet } = useTweets();
  const { isOpen, dialogConfig, showConfirmation } = useConfirmationDialog();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(true);

  // Get the correct ID field - do this before hooks but after state initialization
  const tweetId = tweet?._id || tweet?.id;
  const authorId = tweet?.authorId || 'unknown';
  const content = tweet?.content || '';
  const createdAt = tweet?.createdAt || new Date();
  const media = tweet?.media || [];
  const poll = tweet?.poll || null;

  // Fetch author information - this hook must come before any early returns
  useEffect(() => {
    const fetchAuthor = async () => {
      if (!authorId || authorId === 'unknown') {
        setAuthorLoading(false);
        return;
      }

      // If this is the current user's post, use their info from auth context
      if (user && user.id === authorId) {
        setAuthor({
          id: user.id,
          username: user.username,
          displayName: user.displayName || user.username,
          email: user.email,
        });
        setAuthorLoading(false);
        return;
      }

      try {
        const authorData = await userAPI.getUserById(authorId);
        setAuthor(authorData);
      } catch (error) {
        console.warn('Author not found, using fallback data:', error);
        // Create fallback author data for deleted/missing users
        const fallbackUsername = authorId.includes('-') ? 
          `user_${authorId.split('-')[0]}` : // Use part of UUID
          authorId.replace('test-user-', 'test_user_'); // Clean up test IDs
          
        setAuthor({
          id: authorId,
          username: fallbackUsername,
          displayName: `Unknown User`,
          email: null,
          bio: 'This user no longer exists',
          avatarUrl: null,
          isDeleted: true // Flag to style differently
        });
      } finally {
        setAuthorLoading(false);
      }
    };

    fetchAuthor();
  }, [authorId, user]);

  // Add safety check for tweet object AFTER hooks
  if (!tweet || typeof tweet !== 'object') {
    console.warn('TweetCard received invalid tweet:', tweet);
    return null;
  }

  const handleTweetClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest(".tweet-actions") || e.target.closest(".delete-btn")) {
      return;
    }
    if (tweetId) {
      navigate(`/tweet/${tweetId}`);
    }
  };

  const handleLike = () => {
    if (tweetId) {
      toggleLike(tweetId, tweet.liked);
    }
  };

  const handleRetweet = () => {
    if (tweetId) {
      toggleRetweet(tweetId, tweet.retweeted);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirmation({
      title: "Delete Tweet?",
      message:
        "This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (confirmed && tweetId) {
      deleteTweet(tweetId);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;

    return date.toLocaleDateString();
  };

  const isOwner = user && user.id === authorId;

  // Show loading state while fetching author
  if (authorLoading) {
    return (
      <div className="tweet-card loading">
        <div className="tweet-header">
          <div className="tweet-avatar">
            <div className="avatar-placeholder">...</div>
          </div>
          <div className="tweet-info">
            <div className="tweet-author">
              <span className="display-name">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = author?.displayName || author?.username || 'Unknown User';
  const usernameDisplay = author?.username || 'unknown';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="tweet-card" style={{ cursor: "pointer" }}>
      <div className="tweet-header">
        <div className="tweet-avatar">
          <div className="avatar-placeholder">
            {avatarLetter}
          </div>
        </div>

        <div className="tweet-info">
          <div className="tweet-author">
            <span className="display-name">{displayName}</span>
            <span className="username">@{usernameDisplay}</span>
            <span className="timestamp" onClick={handleTweetClick}>
              · {formatTime(createdAt)}
            </span>
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="delete-button delete-btn"
              title="Delete tweet"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="tweet-content">
        <p>
          <HashtagText text={content} />
        </p>

        {media.length > 0 && (
          <div className="tweet-images">
            {media.map((mediaItem, index) => (
              <img key={index} src={mediaItem} alt="" className="tweet-image" />
            ))}
          </div>
        )}

        {poll && <Poll poll={poll} tweetId={tweetId} />}
      </div>

      <div className="tweet-actions">
        <button className="action-button reply-button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
          </svg>
          <span className="action-count">{tweet.replies}</span>
        </button>

        <button
          className={`comment-action-btn retweet-button ${
            tweet.retweeted ? "retweeted" : ""
          }`}
          onClick={handleRetweet}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V19.5H7.75c-1.517 0-2.75-1.233-2.75-2.75V8.38L3.353 9.91 1.647 8.09 4.75 3.79zM19.25 20.21l-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75H11V4.5h5.25c1.517 0 2.75 1.233 2.75 2.75v7.37l1.647-1.53 1.706 1.82-4.103 3.79z" />
          </svg>
          <span className="action-count">{tweet.retweets}</span>
        </button>

        <button
          className={`comment-action-btn like-btn ${
            tweet.liked ? "liked" : ""
          }`}
          onClick={handleLike}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
          </svg>
          {tweet.likes > 0 && (
            <span className="action-count">{tweet.likes}</span>
          )}
        </button>
      </div>

      <ConfirmationDialog
        isOpen={isOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        type={dialogConfig.type}
        onConfirm={dialogConfig.onConfirm}
        onCancel={dialogConfig.onCancel}
      />
    </div>
  );
};

export default TweetCard;
