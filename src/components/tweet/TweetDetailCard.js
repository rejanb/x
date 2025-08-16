import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTweets } from "../../context/TweetContext";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import ConfirmationDialog from "../common/ConfirmationDialog";
import HashtagText from "../common/HashtagText";
import EditPost from "../EditPost";
import Poll from "./Poll";
import "./TweetDetailCard.css";

const TweetDetailCard = ({ tweet }) => {
  const { user } = useAuth();
  const { toggleLike, toggleRetweet, deleteTweet } = useTweets();
  const { isOpen, dialogConfig, showConfirmation } = useConfirmationDialog();
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const moreOptionsRef = useRef(null);

  // Determine if current user has liked this post
  const isLiked = user && tweet?.likes && Array.isArray(tweet.likes) && tweet.likes.includes(user.id);
  const likeCount = tweet?.likes && Array.isArray(tweet.likes) ? tweet.likes.length : 0;
  
  // Determine if current user has retweeted this post
  const isRetweeted = user && tweet?.retweets && Array.isArray(tweet.retweets) && tweet.retweets.includes(user.id);
  const retweetCount = tweet?.retweets && Array.isArray(tweet.retweets) ? tweet.retweets.length : 0;
  
  // Handle reply count
  const replyCount = tweet?.replies && Array.isArray(tweet.replies) ? tweet.replies.length : 0;

  const handleLike = () => {
    toggleLike(tweet.id, isLiked);
  };

  const handleRetweet = async () => {
    if (tweet.id) {
      try {
        await toggleRetweet(tweet.id, isRetweeted);
      } catch (error) {
        console.error('Error handling retweet:', error);
      }
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowMoreOptions(false); // Close menu after clicking edit
  };

  const handleEditClose = () => {
    setShowEditModal(false);
  };

  const handleEditSave = (updatedData) => {
    // The context has already updated the tweet, so we just close the modal
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    const confirmed = await showConfirmation({
      title: "Delete Post?",
      message:
        "This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (confirmed) {
      setDeleteLoading(true);
      setShowMoreOptions(false); // Close menu after confirming delete
      try {
        await deleteTweet(tweet.id);
      } catch (error) {
        console.error('Error deleting tweet:', error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Handle clicks outside more options menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target)) {
        setShowMoreOptions(false);
      }
    };

    if (showMoreOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreOptions]);

  const formatFullDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const isOwner = user && tweet.author && user.id === tweet.author.id;

  return (
    <div className="tweet-detail-card">
      <div className="tweet-detail-header">
        <div className="author-info">
          <div className="author-avatar">
            {tweet.author.profilePicture ? (
              <img
                src={tweet.author.profilePicture}
                alt={tweet.author.username}
              />
            ) : (
              <div className="avatar-placeholder">
                {tweet.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="author-details">
            <div className="author-name">
              <span className="display-name">{tweet.author.displayName}</span>
              {tweet.author.verified && (
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
            </div>
            <div className="username">@{tweet.author.username}</div>
          </div>
        </div>

        {isOwner && (
          <div className="tweet-actions-owner">
            <div className="more-options" ref={moreOptionsRef}>
              <button
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="more-options-button"
                title="More options"
                disabled={deleteLoading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 18c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm0-9c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm0-9c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z"/>
                </svg>
              </button>
              
              {showMoreOptions && (
                <div className="more-options-menu">
                  <button
                    onClick={handleEdit}
                    className="menu-item edit-item"
                    disabled={deleteLoading}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="menu-item delete-item"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <div className="loading-spinner-small"></div>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="tweet-content">
        <p className="tweet-text">
          <HashtagText text={tweet.content} />
        </p>

        {tweet.images && tweet.images.length > 0 && (
          <div className="tweet-images">
            {tweet.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Tweet image ${index + 1}`}
                className="tweet-image"
              />
            ))}
          </div>
        )}

        {tweet.poll && <Poll poll={tweet.poll} tweetId={tweet.id} />}
      </div>

      <div className="tweet-timestamp">
        {formatFullDate(tweet.createdAt)}
        {tweet.isEdited && <span className="edited-indicator"> · edited</span>}
      </div>

      <div className="tweet-stats">
        <div className="stat-item">
          <span className="stat-number">{retweetCount}</span>
          <span className="stat-label">Retweets</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{likeCount}</span>
          <span className="stat-label">Likes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{replyCount}</span>
          <span className="stat-label">Replies</span>
        </div>
      </div>

      <div className="tweet-actions">
        <button className="action-button reply-button">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
          </svg>
        </button>

        <button
          className={`action-button retweet-button ${
            isRetweeted ? "retweeted" : ""
          }`}
          onClick={handleRetweet}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V19.5H7.75c-1.517 0-2.75-1.233-2.75-2.75V8.38L3.353 9.91 1.647 8.09 4.75 3.79zM19.25 20.21l-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75H11V4.5h5.25c1.517 0 2.75 1.233 2.75 2.75v7.37l1.647-1.53 1.706 1.82-4.103 3.79z" />
          </svg>
        </button>

        <button
          className={`action-button like-button ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
          </svg>
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

      {showEditModal && (
        <EditPost
          post={tweet}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default TweetDetailCard;
