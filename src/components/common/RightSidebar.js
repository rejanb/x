import React from "react";
import TrendingTopics from "../explore/TrendingTopics";
import SuggestedUsers from "../explore/SuggestedUsers";
import "./RightSidebar.css";

const RightSidebar = () => {
  return (
    <div className="right-sidebar">
      <div className="search-container">
        <input type="text" placeholder="Search" className="search-input" />
      </div>

      <TrendingTopics compact />
      <SuggestedUsers />
    </div>
  );
};

export default RightSidebar;
