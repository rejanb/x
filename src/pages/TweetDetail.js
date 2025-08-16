import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTweets } from "../context/TweetContext";
import TweetDetailCard from "../components/tweet/TweetDetailCard";
import CommentComposer from "../components/tweet/CommentComposer";
import CommentList from "../components/tweet/CommentList";
import { postsAPI, usersAPI, commentsAPI } from "../services/api";
import "./TweetDetail.css";
import toast from "../utils/toast";

const TweetDetail = () => {
  const { tweetId } = useParams();
  const navigate = useNavigate();
  const { tweets, toggleLike, toggleRetweet } = useTweets();
  const [tweet, setTweet] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Current user id for deriving liked/retweeted flags
  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw)?.id : null;
    } catch {
      return null;
    }
  })();

  // Mock comments data - in real app, this would come from an API
  const mockComments = [
    {
      id: "comment-1",
      author: {
        id: 301,
        displayName: "Alice Cooper",
        username: "alicecooper",
        verified: false,
        profilePicture: null,
      },
      content: "This is such a great post! Thanks for sharing this insight.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      likes: 5,
      replies: 2,
      liked: false,
      parentId: tweetId,
    },
    {
      id: "comment-2",
      author: {
        id: 302,
        displayName: "Bob Wilson",
        username: "bobwilson",
        verified: true,
        profilePicture: null,
      },
      content: "Completely agree! This changed my perspective on the topic.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 12,
      replies: 0,
      liked: true,
      parentId: tweetId,
    },
    {
      id: "comment-3",
      author: {
        id: 303,
        displayName: "Carol Smith",
        username: "carolsmith",
        verified: false,
        profilePicture: null,
      },
      content:
        "Could you elaborate more on this point? I'd love to learn more about your experience.",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes: 8,
      replies: 1,
      liked: false,
      parentId: tweetId,
    },
    {
      id: "comment-4",
      author: {
        id: 304,
        displayName: "David Lee",
        username: "davidlee",
        verified: false,
        profilePicture: null,
      },
      content: "Amazing work! 🔥 Keep it up!",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      likes: 3,
      replies: 0,
      liked: false,
      parentId: tweetId,
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadTweet = async () => {
      setIsLoading(true);

      // First, try to find the tweet in context
      const foundTweet = tweets.find((t) => t.id?.toString() === tweetId);
      if (foundTweet) {
        if (!isMounted) return;
        // Ensure liked/retweeted are derived if missing
        const normalizedFound = {
          ...foundTweet,
          liked: (
            foundTweet?.liked !== undefined ? Boolean(foundTweet.liked) : (
              Array.isArray(foundTweet?.likes) && currentUserId ? foundTweet.likes.includes(currentUserId) : false
            )
          ),
          retweeted: (
            foundTweet?.retweeted !== undefined ? Boolean(foundTweet.retweeted) : (
              Array.isArray(foundTweet?.retweets) && currentUserId ? foundTweet.retweets.includes(currentUserId) : false
            )
          ),
        };
        setTweet(normalizedFound);
        try {
          const serverComments = await commentsAPI.getPostComments(tweetId, 1, 20);
          const listRaw = Array.isArray(serverComments)
            ? serverComments
            : (serverComments?.comments || serverComments?.data || []);
          // Try to enrich author info for comments (best-effort)
          const list = await Promise.all(listRaw.map(async (c) => {
            let author = c.author || c.user || null;
            if ((!author || !author.username) && (c.authorId || c.userId)) {
              try {
                const u = await usersAPI.getUserById(c.authorId || c.userId);
                if (u) author = { id: u.id || u._id, username: u.username, displayName: u.displayName || u.name || u.username, profilePicture: u.profilePicture };
              } catch {}
            }
            const username = author?.username || c.username || (author?.id ? String(author.id).slice(0, 6) : 'user');
            const displayName = author?.displayName || author?.name || username;
            return { ...c, author: author ? { ...author, username, displayName } : { username, displayName } };
          }));
          setComments(list);
        } catch (_) {
          setComments(mockComments);
        }
        setIsLoading(false);
        return;
      }

      // Fallback: fetch from backend by ID
      try {
        const post = await postsAPI.getPostById(tweetId);

        // Map backend post -> UI tweet shape consumed by TweetDetailCard
  const mapPostToTweet = async (p) => {
          // Try to enrich author details
          let author = {
            id: p.authorId || p.author?.id || "unknown",
            username: p.author?.username || "user",
            displayName: p.author?.displayName || p.author?.name || "User",
            verified: Boolean(p.author?.verified),
            profilePicture: p.author?.profilePicture || null,
          };
          try {
            if (!p.author && p.authorId) {
              const u = await usersAPI.getUserById(p.authorId);
              if (u) {
                author = {
                  id: u.id || u._id || p.authorId,
                  username: u.username || "user",
                  displayName: u.displayName || u.name || u.username || "User",
                  verified: Boolean(u.verified),
                  profilePicture: u.profilePicture || null,
                };
              }
            }
          } catch (_) {
            // keep minimal author if user fetch fails
          }

          return {
            id: p.id || p._id || tweetId,
            content: p.content || "",
            author,
            createdAt: p.createdAt || new Date().toISOString(),
            images: p.images || p.media || [],
            likes: Number(
              (Array.isArray(p.likes) ? p.likes.length : p.likes) ?? 0
            ),
            retweets: Number(
              (Array.isArray(p.retweets) ? p.retweets.length : p.retweets) ?? 0
            ),
            replies: Number(
              (Array.isArray(p.replies) ? p.replies.length : p.replies) ?? 0
            ),
            liked: (
              p?.liked !== undefined ? Boolean(p.liked) : (
                Array.isArray(p?.likes) && currentUserId ? p.likes.includes(currentUserId) : false
              )
            ),
            retweeted: (
              p?.retweeted !== undefined ? Boolean(p.retweeted) : (
                Array.isArray(p?.retweets) && currentUserId ? p.retweets.includes(currentUserId) : false
              )
            ),
            poll: p.poll || null,
          };
        };

        const mapped = await mapPostToTweet(post);
        if (!isMounted) return;
        setTweet(mapped);
        try {
          const serverComments = await commentsAPI.getPostComments(tweetId, 1, 20);
          const listRaw = Array.isArray(serverComments)
            ? serverComments
            : (serverComments?.comments || serverComments?.data || []);
          const list = await Promise.all(listRaw.map(async (c) => {
            let author = c.author || c.user || null;
            if ((!author || !author.username) && (c.authorId || c.userId)) {
              try {
                const u = await usersAPI.getUserById(c.authorId || c.userId);
                if (u) author = { id: u.id || u._id, username: u.username, displayName: u.displayName || u.name || u.username, profilePicture: u.profilePicture };
              } catch {}
            }
            const username = author?.username || c.username || (author?.id ? String(author.id).slice(0, 6) : 'user');
            const displayName = author?.displayName || author?.name || username;
            return { ...c, author: author ? { ...author, username, displayName } : { username, displayName } };
          }));
          setComments(list);
        } catch (_) {
          setComments(mockComments);
        }
      } catch (err) {
        console.warn("Failed to load post by id:", err);
        if (!isMounted) return;
        setTweet(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadTweet();
    return () => {
      isMounted = false;
    };
  }, [tweetId, tweets]);

  const handleAddComment = async (commentText) => {
    // Optimistic UI
    const tempId = `comment-${Date.now()}`;
    const optimistic = {
      id: tempId,
      author: {
        id: 999,
        displayName: "You",
        username: "you",
        verified: false,
        profilePicture: null,
      },
      content: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      liked: false,
      parentId: tweetId,
    };
    setComments((prev) => [optimistic, ...prev]);
    // Increment replies stat optimistically
    setTweet((prev) => prev ? { ...prev, replies: (prev.replies || 0) + 1 } : prev);
    try {
      const created = await commentsAPI.addComment(tweetId, { content: commentText });
      // Replace optimistic with real comment
      setComments((prev) => prev.map(c => c.id === tempId ? {
        ...c,
        id: created?.id || created?._id || tempId,
        author: c.author, // could enrich later
        createdAt: created?.createdAt || c.createdAt,
      } : c));
    } catch (err) {
      // Revert on error
      setComments((prev) => prev.filter(c => c.id !== tempId));
      setTweet((prev) => prev ? { ...prev, replies: Math.max(0, (prev.replies || 0) - 1) } : prev);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="tweet-detail-page">
        <div className="tweet-detail-header">
          <button onClick={handleBack} className="back-button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
            </svg>
          </button>
          <h1>Post</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner">Loading post...</div>
        </div>
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="tweet-detail-page">
        <div className="tweet-detail-header">
          <button onClick={handleBack} className="back-button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
            </svg>
          </button>
          <h1>Post</h1>
        </div>
        <div className="tweet-not-found">
          <h3>Post not found</h3>
          <p>
            This post may have been deleted or you don't have permission to view
            it.
          </p>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!tweet) return;
    try {
      await toggleLike(tweet.id, tweet.liked);
      // sync local state to reflect latest like flag and count from context if needed
      setTweet((prev) => prev ? { ...prev, liked: !prev.liked, likes: (prev.likes || 0) + (prev.liked ? -1 : 1) } : prev);
    } catch (err) {
      const msg = (err && (err.message || err)) || 'Failed to like post';
      toast.error(typeof msg === 'string' ? msg : 'Failed to like post');
    }
  };

  const handleRetweet = async () => {
    if (!tweet) return;
    try {
      await toggleRetweet(tweet.id, tweet.retweeted);
      setTweet((prev) => prev ? { ...prev, retweeted: !prev.retweeted, retweets: (prev.retweets || 0) + (prev.retweeted ? -1 : 1) } : prev);
    } catch (err) {
      const msg = (err && (err.message || err)) || 'Failed to retweet';
      toast.error(typeof msg === 'string' ? msg : 'Failed to retweet');
    }
  };

  return (
    <div className="tweet-detail-page">
      <div className="tweet-detail-header">
        <button onClick={handleBack} className="back-button">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>
        </button>
        <h1>Post</h1>
      </div>

      <div className="tweet-detail-content">
  <TweetDetailCard tweet={tweet} onLike={handleLike} onRetweet={handleRetweet} />

        <div className="comment-section">
          <CommentComposer onSubmit={handleAddComment} />
          <CommentList
            comments={comments}
            postId={tweet.id}
            onReplied={() => setTweet((prev) => prev ? { ...prev, replies: (prev.replies || 0) + 1 } : prev)}
          />
        </div>
      </div>
    </div>
  );
};

export default TweetDetail;
