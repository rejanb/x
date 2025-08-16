import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI, postsAPI } from "../services/api";
import TweetCard from "../components/tweet/TweetCard";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tweets"); // tweets | media | likes
  const [tweets, setTweets] = useState([]);
  const [mediaTweets, setMediaTweets] = useState([]);
  const [likedTweets, setLikedTweets] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to fetch counts
  const fetchFollowCounts = useMemo(() => async (uid) => {
    try {
      setLoading(true);
      const data = await usersAPI.getFollowCounts(uid);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch follow counts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !user.id) return;
    fetchFollowCounts(user.id);
  }, [user, fetchFollowCounts]);

  // Listen for global follow changes and refresh counts immediately
  useEffect(() => {
    const handler = (e) => {
      if (!user?.id) return;
      // Always re-fetch to reflect authoritative counts
      fetchFollowCounts(user.id);
    };
    window.addEventListener('follow:changed', handler);
    return () => window.removeEventListener('follow:changed', handler);
  }, [user, fetchFollowCounts]);

  useEffect(() => {
    if (!user || !user.id) return;
    const load = async () => {
      setTabLoading(true);
      try {
        const uid = user.id;
        if (activeTab === "tweets") {
          const res = await postsAPI.getPostsByAuthor(uid, 1, 20);
          setTweets(res.posts || res || []);
        } else if (activeTab === "media") {
          const res = await postsAPI.getPostsByAuthor(uid, 1, 50);
          const all = res.posts || res || [];
          setMediaTweets(all.filter(p => Array.isArray(p.media) && p.media.length > 0));
        } else if (activeTab === "likes") {
          const res = await postsAPI.getLikedPosts(uid, 1, 20);
          setLikedTweets(res.posts || res || []);
        }
      } catch (e) {
        console.error("Failed to load profile tab posts:", e);
      } finally {
        setTabLoading(false);
      }
    };
    load();
  }, [user, activeTab]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-cover">{/* Cover photo placeholder */}</div>

        <div className="profile-info">
          <div className="profile-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.username} />
            ) : (
              <div className="avatar-placeholder large">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-details">
            <h1>{user.displayName || user.username}</h1>
            <p className="username">@{user.username}</p>
            {user.bio && (
              <p className="profile-bio">{user.bio}</p>
            )}

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">
                  {loading ? "..." : stats.following}
                </span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {loading ? "..." : stats.followers}
                </span>
                <span className="stat-label">Followers</span>
              </div>
            </div>

            <button
              className="edit-profile-button"
              onClick={() => navigate("/profile/edit")}
            >
              Edit Profile
            </button>
            <button onClick={() => navigate("/change-password")}>
              Change Password
            </button>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <div
          className={`tab ${activeTab === "tweets" ? "active" : ""}`}
          onClick={() => setActiveTab("tweets")}
          role="button"
        >
          Tweets
        </div>
        <div className="tab disabled" title="Coming soon">Tweets & replies</div>
        <div
          className={`tab ${activeTab === "media" ? "active" : ""}`}
          onClick={() => setActiveTab("media")}
          role="button"
        >
          Media
        </div>
        <div
          className={`tab ${activeTab === "likes" ? "active" : ""}`}
          onClick={() => setActiveTab("likes")}
          role="button"
        >
          Likes
        </div>
      </div>

      <div className="profile-content">
        {tabLoading && <div>Loading…</div>}
        {!tabLoading && activeTab === "tweets" && (
          tweets.length ? tweets.map((p, i) => (
            <TweetCard key={p._id || p.id || i} tweet={p} />
          )) : <p>No tweets yet.</p>
        )}
        {!tabLoading && activeTab === "media" && (
          mediaTweets.length ? mediaTweets.map((p, i) => (
            <TweetCard key={p._id || p.id || i} tweet={p} />
          )) : <p>No media tweets yet.</p>
        )}
        {!tabLoading && activeTab === "likes" && (
          likedTweets.length ? likedTweets.map((p, i) => (
            <TweetCard key={p._id || p.id || i} tweet={p} />
          )) : <p>No liked tweets yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
