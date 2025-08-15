import React, { useState } from "react";
import "./SuggestedUsers.css";

const SuggestedUsers = () => {
  const [followedUsers, setFollowedUsers] = useState(new Set());

  const suggestedUsers = [
    {
      id: 1,
      name: "John Doe",
      username: "@johndoe",
      bio: "Frontend Developer | React Enthusiast",
      followers: 1250,
      verified: false,
      avatar: "JD",
    },
    {
      id: 2,
      name: "Jane Smith",
      username: "@janesmith",
      bio: "UX Designer & Tech Writer",
      followers: 3400,
      verified: true,
      avatar: "JS",
    },
    {
      id: 3,
      name: "Tech News",
      username: "@technews",
      bio: "Latest updates in technology",
      followers: 15600,
      verified: true,
      avatar: "TN",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      username: "@sarahw",
      bio: "Product Manager | Startup Life",
      followers: 890,
      verified: false,
      avatar: "SW",
    },
  ];

  const formatFollowerCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  const handleFollow = (userId) => {
    setFollowedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  return (
    <div className="suggested-users">
      <div className="suggested-header">
        <h2>Who to follow</h2>
      </div>

      <div className="users-list">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <div className="user-avatar">
                <div className="avatar-placeholder">{user.avatar}</div>
              </div>

              <div className="user-details">
                <div className="user-name">
                  <span className="display-name">{user.name}</span>
                  {user.verified && (
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

                <div className="username">{user.username}</div>

                <div className="user-bio">{user.bio}</div>

                <div className="follower-count">
                  {formatFollowerCount(user.followers)} followers
                </div>
              </div>
            </div>

            <button
              className={`follow-btn ${followedUsers.has(user.id) ? "following" : ""}`}
              onClick={() => handleFollow(user.id)}
            >
              <span className="follow-text">
                {followedUsers.has(user.id) ? "Following" : "Follow"}
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
