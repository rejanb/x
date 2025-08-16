import React, { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTweets } from "../../context/TweetContext";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import Poll from "./Poll";
import HashtagText from "../common/HashtagText";
import ConfirmationDialog from "../common/ConfirmationDialog";
import RetweetMenu from "./RetweetMenu";
import QuoteTweetModal from "./QuoteTweetModal";
import "./TweetDetailCard.css";

const TweetDetailCard = ({ tweet, onLike, onRetweet, onReply }) => {
  const { user } = useAuth();
  const { toggleLike, toggleRetweet, deleteTweet } = useTweets();
  const { isOpen, dialogConfig, showConfirmation } = useConfirmationDialog();
  const [rtMenuOpen, setRtMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const handleLike = () => {
    if (onLike) return onLike(tweet);
    toggleLike(tweet.id, tweet.liked);
  };

  const handleRetweetButton = useCallback(() => {
    // Open menu like Twitter instead of immediate toggle
    setRtMenuOpen((v) => !v);
  }, []);

  const handleMenuRetweet = useCallback(() => {
    setRtMenuOpen(false);
    if (onRetweet) return onRetweet(tweet);
    // Ensure we only retweet if currently not retweeted
    if (!tweet.retweeted) toggleRetweet(tweet.id, false);
  }, [onRetweet, toggleRetweet, tweet]);

  const handleMenuUnretweet = useCallback(() => {
    setRtMenuOpen(false);
    if (onRetweet) return onRetweet(tweet);
    // Ensure we only unretweet if currently retweeted
    if (tweet.retweeted) toggleRetweet(tweet.id, true);
  }, [onRetweet, toggleRetweet, tweet]);

  const handleQuote = useCallback(() => {
    setRtMenuOpen(false);
    setQuoteOpen(true);
  }, []);

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
      deleteTweet(tweet.id);
    }
  };

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
          <button
            onClick={handleDelete}
            className="delete-button"
            title="Delete post"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h2v10.5C5 19.88 6.12 21 7.5 21h9c1.38 0 2.5-1.12 2.5-2.5V8h2V6h-5zM10 4.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zM17 18.5c0 .28-.22.5-.5.5h-9c-.28 0-.5-.22-.5-.5V8h10v10.5z" />
              <path d="M9 10v6h2v-6H9zm4 0v6h2v-6h-2z" />
            </svg>
          </button>
        )}
      </div>

      <div className="tweet-content">
        <p className="tweet-text">
          <HashtagText text={tweet.content} />
        </p>

    {(tweet.media?.length || tweet.images?.length) > 0 && (
          <div className="tweet-images">
      {(tweet.media || tweet.images || []).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Tweet image ${index + 1}`}
                className="tweet-image"
              />
            ))}
          </div>
        )}

        {(tweet.poll || tweet.poll_id) && (
          <Poll poll={tweet.poll || { poll_id: tweet.poll_id }} tweetId={tweet.id || tweet._id} />
        )}
      </div>

      <div className="tweet-timestamp">{formatFullDate(tweet.createdAt)}</div>

      <div className="tweet-stats">
        <div className="stat-item">
          <span className="stat-number">{tweet.retweets || 0}</span>
          <span className="stat-label">Retweets</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{tweet.likes || 0}</span>
          <span className="stat-label">Likes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{tweet.replies || 0}</span>
          <span className="stat-label">Replies</span>
        </div>
      </div>

      <div className="tweet-actions">
        <button className="action-button reply-button">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
          </svg>
        </button>

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className={`action-button retweet-button ${
              tweet.retweeted ? "active" : ""
            }`}
            aria-pressed={!!tweet.retweeted}
            onClick={handleRetweetButton}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V19.5H7.75c-1.517 0-2.75-1.233-2.75-2.75V8.38L3.353 9.91 1.647 8.09 4.75 3.79zM19.25 20.21l-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75H11V4.5h5.25c1.517 0 2.75 1.233 2.75 2.75v7.37l1.647-1.53 1.706 1.82-4.103 3.79z" />
            </svg>
          </button>
          <RetweetMenu
            open={rtMenuOpen}
            onClose={() => setRtMenuOpen(false)}
            onRetweet={handleMenuRetweet}
            onUnretweet={handleMenuUnretweet}
            onQuote={handleQuote}
            retweeted={!!tweet.retweeted}
          />
        </div>

        <button
          className={`action-button like-button ${tweet.liked ? "active" : ""}`}
          aria-pressed={!!tweet.liked}
          onClick={handleLike}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
          </svg>
        </button>
      </div>

      <QuoteTweetModal
        open={quoteOpen}
        tweet={tweet}
        onClose={() => setQuoteOpen(false)}
        onSubmit={() => setQuoteOpen(false)}
      />

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

export default TweetDetailCard;
