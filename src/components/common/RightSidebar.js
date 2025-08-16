import React, { useState } from "react";
import SuggestedUsers from "../explore/SuggestedUsers";
import "./RightSidebar.css";

const RightSidebar = () => {
  const [query, setQuery] = useState("");
  return (
    <div className="right-sidebar">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search users"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <SuggestedUsers filter={query} />
    </div>
  );
};

export default RightSidebar;
