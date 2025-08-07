import React from "react";
import "./ComingSoon.css";

const ComingSoon = ({
  title = "Coming Soon",
  description = "This feature is currently under development.",
  icon = "🚀",
}) => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">{icon}</div>
        <h1 className="coming-soon-title">{title}</h1>
        <p className="coming-soon-description">{description}</p>
        <p className="coming-soon-note">Stay tuned for updates!</p>
      </div>
    </div>
  );
};

export default ComingSoon;
