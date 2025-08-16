

// TrendingTopics.js
import { useEffect, useState } from "react";
import "./TrendingTopics.css";
import { postsAPI } from "../../services/api";

const TrendingTopics = ({ compact = false }) => {
  const [trendingData, setTrendingData] = useState([]);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        const response = await postsAPI.getTrendingHashtags();
        setTrendingData(response);
      } catch (error) {
        console.error("Error fetching trending topics:", error);
      }
    };

    fetchTrendingTopics();
  }, []);

  console.log(trendingData);

  const displayData = compact ? trendingData?.slice(0, 5) : trendingData;

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
                {item.count > 3 && <span className="trending-badge">📈</span>}
                <span className="category-text">{item.category}</span>
                <span className="trending-rank">· Trending</span>
              </div>

              <h3 className="trending-topic">{item.hashtag}</h3>

              <div className="tweet-count">
                {formatTweetCount(item.count)} Tweets
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