import React, { useEffect, useState } from "react";
import TweetCard from "../tweet/TweetCard";
import { postsAPI, usersAPI } from "../../services/api";
import "./ExploreForYou.css";

const ExploreForYou = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const mapPost = async (p) => {
    let author = p.author || null;
    if ((!author || !author.username) && p.authorId) {
      try {
        const u = await usersAPI.getUserById(p.authorId);
        if (u) {
          author = {
            id: u.id || u._id || p.authorId,
            username: u.username || "user",
            displayName: u.displayName || u.name || u.username || "User",
            profilePicture: u.profilePicture || null,
            verified: Boolean(u.verified),
          };
        }
      } catch {}
    }
    return {
      id: p.id || p._id,
      content: p.content || "",
      author: author || { id: p.authorId, username: "user", displayName: "User" },
      createdAt: p.createdAt || new Date().toISOString(),
      images: p.images || p.media || [],
      likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
      retweets: Array.isArray(p.retweets) ? p.retweets.length : (p.retweets || 0),
      replies: Array.isArray(p.replies) ? p.replies.length : (p.replies || 0),
      liked: false,
      retweeted: false,
    };
  };

  const load = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const targetPage = reset ? 1 : page;
      const res = await postsAPI.getAllPosts(targetPage, limit);
      const listRaw = Array.isArray(res) ? res : res?.posts || [];
      const list = await Promise.all(listRaw.map(mapPost));
      if (reset) setPosts(list);
      else setPosts((prev) => [...prev, ...list]);
      const total = res?.total ?? (reset ? list.length : posts.length + list.length);
      setHasMore((targetPage * limit) < total);
      setPage(targetPage + 1);
    } catch (_) {
      // keep existing posts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(true); /* on mount */ }, []);

  return (
    <div className="explore-for-you">
      <div className="explore-content">
        {posts.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
        {posts.length === 0 && !loading && (
          <div className="no-results">No posts yet</div>
        )}
      </div>

      <div className="load-more">
        <button className="load-more-btn" disabled={!hasMore || loading} onClick={() => load(false)}>
          {loading ? 'Loading…' : hasMore ? 'Show more tweets' : 'No more posts'}
        </button>
      </div>
    </div>
  );
};

export default ExploreForYou;
