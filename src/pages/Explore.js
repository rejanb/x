import React, { useState } from "react";
import SearchBar from "../components/explore/SearchBar";
import TrendingTopics from "../components/explore/TrendingTopics";
import SuggestedUsers from "../components/explore/SuggestedUsers";
import ExploreForYou from "../components/explore/ExploreForYou";
import ExploreNews from "../components/explore/ExploreNews";
import "./Explore.css";

const Explore = () => {
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const tabs = [
    { key: "for-you", label: "For you" },
    { key: "trending", label: "Trending" },
    { key: "news", label: "News" },
    { key: "sports", label: "Sports" },
    { key: "entertainment", label: "Entertainment" },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Mock search functionality - in real app, this would call an API
    if (query.trim()) {
      // Simulate search results
      setSearchResults([
        {
          type: "user",
          name: "John Doe",
          username: "@johndoe",
          verified: false,
        },
        {
          type: "hashtag",
          tag: "#" + query,
          tweets: Math.floor(Math.random() * 10000),
        },
        { type: "topic", name: query, category: "Technology" },
      ]);
    } else {
      setSearchResults([]);
    }
  };

  const renderTabContent = () => {
    if (searchQuery.trim()) {
      return (
        <div className="search-results">
          <h3>Search results for "{searchQuery}"</h3>
          {searchResults.length > 0 ? (
            <div className="results-list">
              {searchResults.map((result, index) => (
                <div key={index} className="search-result-item">
                  {result.type === "user" && (
                    <div className="user-result">
                      <div className="avatar-placeholder">{result.name[0]}</div>
                      <div className="user-info">
                        <div className="display-name">
                          {result.name}
                          {result.verified && (
                            <span className="verified">✓</span>
                          )}
                        </div>
                        <div className="username">{result.username}</div>
                      </div>
                    </div>
                  )}
                  {result.type === "hashtag" && (
                    <div className="hashtag-result">
                      <div className="hashtag-name">{result.tag}</div>
                      <div className="hashtag-count">
                        {result.tweets.toLocaleString()} Tweets
                      </div>
                    </div>
                  )}
                  {result.type === "topic" && (
                    <div className="topic-result">
                      <div className="topic-name">{result.name}</div>
                      <div className="topic-category">{result.category}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case "for-you":
        return <ExploreForYou />;
      case "trending":
        return <TrendingTopics />;
      case "news":
        return <ExploreNews />;
      default:
        return <ExploreForYou />;
    }
  };

  return (
    <div className="explore-page">
      <div className="explore-header">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="explore-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="explore-content">{renderTabContent()}</div>
    </div>
  );
};

export default Explore;
