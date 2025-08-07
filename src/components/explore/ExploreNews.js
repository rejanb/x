import React from "react";
import "./ExploreNews.css";

const ExploreNews = () => {
  const newsArticles = [
    {
      id: 1,
      title: "Major Tech Companies Announce New AI Collaboration",
      summary:
        "Leading technology companies join forces to develop responsible AI standards and share research findings.",
      source: "Tech News Daily",
      timestamp: "2h",
      image: null,
      category: "Technology",
      tweets: 1250,
    },
    {
      id: 2,
      title: "Climate Summit Reaches Historic Agreement",
      summary:
        "World leaders commit to ambitious new targets for carbon emission reduction and renewable energy adoption.",
      source: "Global News",
      timestamp: "4h",
      image: null,
      category: "Politics",
      tweets: 3400,
    },
    {
      id: 3,
      title: "Breakthrough in Quantum Computing Research",
      summary:
        "Scientists achieve new milestone in quantum error correction, bringing practical quantum computers closer to reality.",
      source: "Science Today",
      timestamp: "6h",
      image: null,
      category: "Science",
      tweets: 890,
    },
    {
      id: 4,
      title: "Space Mission Successfully Lands on Mars",
      summary:
        "International space agency confirms successful landing of new rover mission with advanced scientific equipment.",
      source: "Space News",
      timestamp: "8h",
      image: null,
      category: "Science",
      tweets: 2100,
    },
    {
      id: 5,
      title: "Economic Markets Show Strong Recovery",
      summary:
        "Global markets demonstrate resilience with consistent growth across multiple sectors and regions.",
      source: "Financial Times",
      timestamp: "10h",
      image: null,
      category: "Business",
      tweets: 567,
    },
    {
      id: 6,
      title: "Healthcare Innovation Improves Patient Outcomes",
      summary:
        "New medical technology shows promising results in early trials, potentially revolutionizing treatment approaches.",
      source: "Medical Journal",
      timestamp: "12h",
      image: null,
      category: "Health",
      tweets: 734,
    },
  ];

  const formatTweetCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <div className="explore-news">
      <div className="news-header">
        <h2>What's happening</h2>
        <p>Stay updated with the latest news and trending topics</p>
      </div>

      <div className="news-list">
        {newsArticles.map((article) => (
          <article key={article.id} className="news-article">
            <div className="article-content">
              <div className="article-meta">
                <span className="category">{article.category}</span>
                <span className="separator">·</span>
                <span className="source">{article.source}</span>
                <span className="separator">·</span>
                <span className="timestamp">{article.timestamp}</span>
              </div>

              <h3 className="article-title">{article.title}</h3>

              <p className="article-summary">{article.summary}</p>

              <div className="article-stats">
                <span className="tweet-count">
                  {formatTweetCount(article.tweets)} Tweets
                </span>
              </div>
            </div>

            {article.image && (
              <div className="article-image">
                <img src={article.image} alt={article.title} />
              </div>
            )}

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
          </article>
        ))}
      </div>

      <div className="load-more-news">
        <button className="load-more-btn">Show more news</button>
      </div>
    </div>
  );
};

export default ExploreNews;
