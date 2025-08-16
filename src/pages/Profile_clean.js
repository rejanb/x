import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI, postsAPI } from "../services/api";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tweets');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ displayName: '', bio: '', avatarUrl: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [tweets, setTweets] = useState([]);

  // Fetch profile info
  useEffect(() => {
    if (user) {
      setLoading(true);
      usersAPI.getUserProfile(user.id)
        .then((data) => {
          setProfile(data);
          setEditData({
            displayName: data.displayName || '',
            bio: data.bio || '',
            avatarUrl: data.avatarUrl || ''
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  // Fetch followers/following/tweets when tab changes
  useEffect(() => {
    if (profile && activeTab === 'followers') {
      setTabLoading(true);
      usersAPI.getFollowers(profile.id).then((data) => {
        setFollowers(data.followers || []);
        setTabLoading(false);
      });
    } else if (profile && activeTab === 'following') {
      setTabLoading(true);
      usersAPI.getFollowing(profile.id).then((data) => {
        setFollowing(data.following || []);
        setTabLoading(false);
      });
    } else if (profile && activeTab === 'tweets') {
      setTabLoading(true);
      postsAPI.getUserPosts(profile.id).then((data) => {
        setTweets(data.posts || []);
        setTabLoading(false);
      });
    }
  }, [profile, activeTab]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-cover">{/* Cover photo placeholder */}</div>
          <div className="profile-info">
            <div className="profile-avatar">
              {profile && profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.username} />
              ) : (
                <div className="avatar-placeholder large">
                  {profile ? profile.username.charAt(0).toUpperCase() : ""}
                </div>
              )}
            </div>
            <div className="profile-details">
              <h1>{profile ? profile.displayName || profile.username : ""}</h1>
              <p className="username">@{profile ? profile.username : ""}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">
                    {profile ? profile._count?.following || 0 : "..."}
                  </span>
                  <span className="stat-label">Following</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {profile ? profile._count?.followers || 0 : "..."}
                  </span>
                  <span className="stat-label">Followers</span>
                </div>
              </div>
              <button className="edit-profile-button" onClick={() => setShowEditModal(true)}>Edit Profile</button>
            </div>
          </div>
        </div>
        <div className="profile-tabs">
          <div className={`tab${activeTab === 'tweets' ? ' active' : ''}`} onClick={() => setActiveTab('tweets')}>Tweets</div>
          <div className={`tab${activeTab === 'followers' ? ' active' : ''}`} onClick={() => setActiveTab('followers')}>Followers</div>
          <div className={`tab${activeTab === 'following' ? ' active' : ''}`} onClick={() => setActiveTab('following')}>Following</div>
        </div>
        <div className="profile-content">
          {activeTab === 'tweets' ? (
            tabLoading ? <p>Loading tweets...</p> : (
              <ul className="tweets-list">
                {tweets.length === 0 ? <li>No tweets found.</li> : tweets.map(t => (
                  <li key={t.id}>
                    <div>{t.content}</div>
                    <span className="tweet-date">{new Date(t.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )
          ) : activeTab === 'followers' ? (
            tabLoading ? <p>Loading followers...</p> : (
              <ul className="followers-list">
                {followers.length === 0 ? <li>No followers found.</li> : followers.map(f => (
                  <li key={f.id}>
                    <span>{f.displayName || f.username}</span> @{f.username}
                  </li>
                ))}
              </ul>
            )
          ) : activeTab === 'following' ? (
            tabLoading ? <p>Loading following...</p> : (
              <ul className="following-list">
                {following.length === 0 ? <li>Not following anyone.</li> : following.map(f => (
                  <li key={f.id}>
                    <span>{f.displayName || f.username}</span> @{f.username}
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </div>
      </div>
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Profile</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditLoading(true);
                try {
                  const updated = await usersAPI.updateProfile(editData);
                  setProfile(updated);
                  setShowEditModal(false);
                } catch (err) {
                  alert("Failed to update profile");
                }
                setEditLoading(false);
              }}
            >
              <label>
                Display Name
                <input
                  type="text"
                  value={editData.displayName}
                  onChange={e => setEditData({ ...editData, displayName: e.target.value })}
                  disabled={editLoading}
                />
              </label>
              <label>
                Bio
                <textarea
                  value={editData.bio}
                  onChange={e => setEditData({ ...editData, bio: e.target.value })}
                  disabled={editLoading}
                />
              </label>
              <label>
                Avatar URL
                <input
                  type="text"
                  value={editData.avatarUrl}
                  onChange={e => setEditData({ ...editData, avatarUrl: e.target.value })}
                  disabled={editLoading}
                />
              </label>
              <div className="modal-actions">
                <button type="submit" disabled={editLoading}>Save</button>
                <button type="button" onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
