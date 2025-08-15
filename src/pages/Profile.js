import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchFollowCounts = async () => {
      try {
        setLoading(true);
        console.log("user id:", user.id);
        const data = await usersAPI.getFollowCounts(user.id);
        console.log("Follow counts:", data);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch follow counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowCounts();
  }, [user]);

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
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <div className="tab active">Tweets</div>
        <div className="tab">Tweets & replies</div>
        <div className="tab">Media</div>
        <div className="tab">Likes</div>
      </div>

      <div className="profile-content">
        <p>Your tweets will appear here...</p>
      </div>
    </div>
  );
};

export default Profile;
