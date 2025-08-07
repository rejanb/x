import React from "react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();

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
                <span className="stat-number">{user.following || 0}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat">
                <span className="stat-number">{user.followers || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
            </div>

            <button className="edit-profile-button">Edit Profile</button>
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
