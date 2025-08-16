import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import HashtagText from "../common/HashtagText";
import { commentsAPI, usersAPI } from "../../services/api";
import toast from "../../utils/toast";
import "./CommentItem.css";

const CommentItem = ({ comment, postId, onReplied }) => {
  const { user } = useAuth();
  const baseLiked = (
    comment?.liked !== undefined ? Boolean(comment.liked) : (
      Array.isArray(comment?.likes) && user?.id ? comment.likes.includes(user.id) : false
    )
  );
  const baseLikes = Array.isArray(comment?.likes)
    ? comment.likes.length
    : Number(comment?.likes || 0);
  const [liked, setLiked] = useState(baseLiked);
  const [likes, setLikes] = useState(baseLikes);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(comment?.replies || []);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [hasTriedLoadReplies, setHasTriedLoadReplies] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleLike = async () => {
    if (!comment?.id && !comment?._id) return;
    const cid = comment.id || comment._id;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((prev) => prev + (wasLiked ? -1 : 1));
    try {
      if (wasLiked) await commentsAPI.unlikeComment(cid);
      else await commentsAPI.likeComment(cid);
    } catch (err) {
      // revert
      setLiked(wasLiked);
      setLikes((prev) => prev + (wasLiked ? 1 : -1));
      const msg = (err && (err.message || err)) || 'Failed to update like';
      toast.error(typeof msg === 'string' ? msg : 'Failed to update like');
    }
  };

  const loadReplies = async () => {
    const cid = comment.id || comment._id;
    if (!cid) return;
    setIsLoadingReplies(true);
    try {
      const list = await commentsAPI.getReplies(cid);
      const raw = Array.isArray(list) ? list : (list?.data || list?.replies || []);
      // Enrich replies with author details based on authorId (best-effort)
      const enriched = await Promise.all(
        raw.map(async (r) => {
          // If author already present and has username/displayName, just normalize
          if (r?.author && (r.author.username || r.author.displayName)) {
            const username = r.author.username || r.username || (r.author.id ? String(r.author.id).slice(0, 6) : 'user');
            const displayName = r.author.displayName || r.author.name || username;
            return { ...r, author: { ...r.author, username, displayName } };
          }
          const id = r.authorId || r.userId;
          if (!id) {
            const username = r.username || 'user';
            return { ...r, author: { id: undefined, username, displayName: r.displayName || username } };
          }
          try {
            const u = await usersAPI.getUserById(id);
            if (u) {
              return {
                ...r,
                author: {
                  id: u.id || u._id || id,
                  username: u.username || String(id).slice(0, 6),
                  displayName: u.displayName || u.name || u.username || String(id).slice(0, 6),
                  profilePicture: u.profilePicture || null,
                  verified: Boolean(u.verified),
                },
              };
            }
          } catch (_) {
            // ignore and fallback
          }
          const fallbackUsername = String(id).slice(0, 6);
          return { ...r, author: { id, username: fallbackUsername, displayName: fallbackUsername } };
        })
      );
      setReplies(enriched);
    } catch (err) {
      // Best-effort: keep empty if fails
    } finally {
      setIsLoadingReplies(false);
      setHasTriedLoadReplies(true);
    }
  };

  const openRepliesAndComposer = async () => {
    if (!showReplies) {
      setShowReplies(true);
      if (!hasTriedLoadReplies && (!Array.isArray(replies) || replies.length === 0)) {
        await loadReplies();
      }
    }
    setReplying(true);
  };

  const submitReply = async (e) => {
    e?.preventDefault?.();
    const text = replyText.trim();
    if (!text) {
      toast.error('Reply cannot be empty');
      return;
    }
    if (!postId) return;
    const parentId = comment.id || comment._id;
    // Optimistic
    const tempId = `reply-${Date.now()}`;
    const optimistic = {
      id: tempId,
      author: {
        id: user?.id,
        username: user?.username || 'you',
        displayName: user?.displayName || user?.username || 'You',
        profilePicture: user?.profilePicture || null,
      },
      content: text,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
      liked: false,
      parentCommentId: parentId,
    };
    setReplies((prev) => [optimistic, ...prev]);
    setReplyText("");
    setReplying(false);
    try {
      const created = await commentsAPI.addReply(postId, parentId, text);
      setReplies((prev) => prev.map(r => r.id === tempId ? { ...optimistic, id: created?.id || created?._id || tempId } : r));
      onReplied?.(parentId);
    } catch (err) {
      setReplies((prev) => prev.filter(r => r.id !== tempId));
      const msg = (err && (err.message || err)) || 'Failed to reply';
      toast.error(typeof msg === 'string' ? msg : 'Failed to reply');
    }
  };

  const author = comment?.author || comment?.user || null;
  const authorId = author?.id || comment?.authorId || comment?.userId || null;
  const username = author?.username || comment?.username || (authorId ? String(authorId).slice(0, 6) : 'user');
  const displayName = author?.displayName || author?.name || username;
  const profilePicture = author?.profilePicture || author?.avatarUrl || null;
  const verified = Boolean(author?.verified);
  const createdAt = comment?.createdAt || new Date().toISOString();
  const repliesCount = Array.isArray(replies) ? replies.length : (replies || 0);

  const isOwner = Boolean(user && authorId && user.id === authorId);

  return (
    <div className="comment-item">
      <div className="comment-content">
        <div className="comment-avatar">
          {profilePicture ? (
            <img src={profilePicture} alt={username} />
          ) : (
            <div className="avatar-placeholder">
              {username?.charAt(0)?.toUpperCase?.() || 'U'}
            </div>
          )}
        </div>

        <div className="comment-body">
          <div className="comment-header">
            <div className="comment-author">
              <span className="display-name">{displayName}</span>
              {verified && (
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
              <span className="username">@{username}</span>
              <span className="separator">·</span>
              <span className="timestamp">{formatTime(createdAt)}</span>
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
              onClick={openRepliesAndComposer}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
              </svg>
              {repliesCount > 0 && (
                <span className="action-count">{repliesCount}</span>
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
          {showReplies && (
            <div className="comment-replies">
              {isLoadingReplies && (
                <div className="replies-loading">Loading replies…</div>
              )}
              {replying && (
                <form className="reply-composer" onSubmit={submitReply}>
                  <div className="reply-avatar">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.username} />
                    ) : (
                      <div className="avatar-placeholder small">
                        {user?.username?.charAt(0)?.toUpperCase?.() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="reply-body">
                    <input
                      className="reply-input"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Post your reply"
                    />
                    <div className="reply-actions">
                      <button
                        type="button"
                        className="reply-cancel"
                        onClick={() => setReplying(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="reply-submit"
                        disabled={!replyText.trim()}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </form>
              )}
              {Array.isArray(replies) && replies.length > 0 && (
                <div className="replies-list">
                  {replies.map((r) => (
                    <div key={r.id || r._id} className="reply-item">
                      <div className="reply-header">
                        <span className="display-name">{r.author?.displayName || r.author?.username || 'User'}</span>
                        <span className="username">@{r.author?.username || 'user'}</span>
                        <span className="separator">·</span>
                        <span className="timestamp">{formatTime(r.createdAt)}</span>
                      </div>
                      <div className="reply-text">
                        <HashtagText text={r.content} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isLoadingReplies && Array.isArray(replies) && replies.length === 0 && (
                <div className="no-replies">No replies yet</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
