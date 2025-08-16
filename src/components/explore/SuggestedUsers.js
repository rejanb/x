import React, { useEffect, useMemo, useState } from "react";
import { usersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./SuggestedUsers.css";

const SuggestedUsers = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(() => new Set());

  const myId = me?.id;

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, followingRes] = await Promise.all([
          usersAPI.listUsers(1, 10),
          myId ? usersAPI.getFollowing(myId, 1, 100) : Promise.resolve({ following: [] }),
        ]);
        if (!active) return;
        // Exclude self from suggestions
        const filtered = (usersRes.users || []).filter(u => u.id !== myId);
        setUsers(filtered);
        // Seed following set
        const seed = new Set((followingRes.following || []).map(u => u.id));
        setFollowing(seed);
      } catch (e) {
        if (!active) return;
        setError(e?.message || "Failed to load users");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [myId]);

  const handleToggle = async (targetId) => {
    // Optimistic UI toggle
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(targetId)) next.delete(targetId); else next.add(targetId);
      return next;
    });
    try {
      const isFollowing = following.has(targetId);
      await usersAPI.toggleFollow(targetId, isFollowing);
    } catch (e) {
      // Revert on error
      setFollowing(prev => {
        const next = new Set(prev);
        if (next.has(targetId)) next.delete(targetId); else next.add(targetId);
        return next;
      });
      console.error("Follow toggle failed:", e);
    }
  };

  const formatFollowerCount = useMemo(() => (count) => {
    if (typeof count !== 'number') return "0";
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
    if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
    return String(count);
  }, []);

  return (
    <div className="suggested-users">
      <div className="suggested-header">
        <h2>Who to follow</h2>
      </div>

      {loading && <div className="loading">Loading…</div>}
      {error && <div className="error" role="alert">{error}</div>}

      <div className="users-list">
        {users.map((u) => (
          <div key={u.id} className="user-item">
            <div className="user-info">
              <div className="user-avatar">
                <div className="avatar-placeholder">{(u.username || u.displayName || "?").charAt(0).toUpperCase()}</div>
              </div>

              <div className="user-details">
                <div className="user-name">
                  <span className="display-name">{u.displayName || u.username}</span>
                </div>

                <div className="username">@{u.username || u.displayName}</div>

                {u.bio && <div className="user-bio">{u.bio}</div>}

                {typeof u._count?.followers === 'number' && (
                  <div className="follower-count">
                    {formatFollowerCount(u._count.followers)} followers
                  </div>
                )}
              </div>
            </div>

            <button
              className={`follow-btn ${following.has(u.id) ? "following" : ""}`}
              onClick={() => handleToggle(u.id)}
              disabled={!myId}
              title={!myId ? "Login to follow" : undefined}
            >
              <span className="follow-text">
                {following.has(u.id) ? "Following" : "Follow"}
              </span>
            </button>

          </div>
        ))}
      </div>

      <div className="show-more">
        <button className="show-more-btn">Show more</button>
      </div>
    </div>
  );
};

export default SuggestedUsers;
