import React from "react";
import "./TrendingTopics.css";

const TrendingTopics = ({ compact = false }) => {
  const trendingData = [
    {
      category: "Technology",
      topic: "React 19",
      tweets: 45200,
      trending: true,
    },
    {
      category: "Sports",
      topic: "World Cup",
      tweets: 125300,
      trending: true,
    },
    {
      category: "Entertainment",
      topic: "Netflix",
      tweets: 89400,
      trending: false,
    },
    {
      category: "Technology",
      topic: "JavaScript",
      tweets: 67800,
      trending: true,
    },
    {
      category: "Business",
      topic: "Startup",
      tweets: 34200,
      trending: false,
    },
    {
      category: "Politics",
      topic: "Elections 2024",
      tweets: 156700,
      trending: true,
    },
    {
      category: "Health",
      topic: "Fitness Tips",
      tweets: 23400,
      trending: false,
    },
    {
      category: "Gaming",
      topic: "PlayStation 6",
      tweets: 78900,
      trending: true,
    },
  ];

  const displayData = compact ? trendingData.slice(0, 5) : trendingData;

  const formatTweetCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <div className={`trending-topics ${compact ? "compact" : ""}`}>
      <div className="trending-header">
        <h2>What's happening</h2>
      </div>

      <div className="trending-list">
        {displayData.map((item, index) => (
          <div key={index} className="trending-item">
            <div className="trending-content">
              <div className="trending-category">
                {item.trending && <span className="trending-badge">📈</span>}
                <span className="category-text">{item.category}</span>
                <span className="trending-rank">· Trending</span>
              </div>

              <h3 className="trending-topic">{item.topic}</h3>

              <div className="tweet-count">
                {formatTweetCount(item.tweets)} Tweets
              </div>
            </div>

            <button className="more-options" aria-label="More options">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M12 8.21c-1.32 0-2.4 1.08-2.4 2.4s1.08 2.4 2.4 2.4 2.4-1.08 2.4-2.4-1.08-2.4-2.4-2.4zm0 9.6c-1.32 0-2.4 1.08-2.4 2.4s1.08 2.4 2.4 2.4 2.4-1.08 2.4-2.4-1.08-2.4-2.4-2.4zm0-19.2c-1.32 0-2.4 1.08-2.4 2.4s1.08 2.4 2.4 2.4 2.4-1.08 2.4-2.4-1.08-2.4-2.4-2.4z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {compact && (
        <div className="show-more">
          <button className="show-more-btn">Show more</button>
        </div>
      )}
    </div>
  );
};

export default TrendingTopics;
