import React, { useEffect, useMemo, useState } from "react";
import SearchBar from "../components/explore/SearchBar";
import TrendingTopics from "../components/explore/TrendingTopics";
import SuggestedUsers from "../components/explore/SuggestedUsers";
import ExploreForYou from "../components/explore/ExploreForYou";
import ExploreNews from "../components/explore/ExploreNews";
import TweetCard from "../components/tweet/TweetCard";
import { postsAPI, usersAPI } from "../services/api";
import "./Explore.css";

const Explore = () => {
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [trending, setTrending] = useState([]);

  const tabs = [
    { key: "for-you", label: "For you" },
    { key: "trending", label: "Trending" },
    { key: "news", label: "News" },
    { key: "sports", label: "Sports" },
    { key: "entertainment", label: "Entertainment" },
  ];

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setPage(1);
    if (!query.trim()) {
      setSearchResults([]);
      setHasMore(true);
      return;
    }
    setIsSearching(true);
    try {
      const res = await postsAPI.searchPosts(query, 1, 10);
      const listRaw = Array.isArray(res) ? res : res?.posts || [];
      // Best-effort enrich authors for list items that only have authorId
      const list = await Promise.all(listRaw.map(async (p) => {
        if (p.author && (p.author.username || p.author.displayName)) return p;
        const authorId = p.authorId || p.userId;
        if (!authorId) return p;
        try {
          const u = await usersAPI.getUserById(authorId);
          if (u) {
            return {
              ...p,
              author: {
                id: u.id || u._id || authorId,
                username: u.username || "user",
                displayName: u.displayName || u.name || u.username || "User",
                profilePicture: u.profilePicture || null,
                verified: Boolean(u.verified),
              }
            };
          }
        } catch {}
        return p;
      }));
      setSearchResults(list);
      setHasMore((res?.total || list.length) > 10);
    } finally {
      setIsSearching(false);
    }
  };

  // Load trending hashtags for Trending tab
  useEffect(() => {
    let ignore = false;
    postsAPI.getTrendingHashtags(10).then((data) => {
      if (ignore) return;
      const list = data?.hashtags || [];
      setTrending(list);
    }).catch(() => setTrending([]));
    return () => { ignore = true; };
  }, []);

  const renderTabContent = () => {
    if (searchQuery.trim()) {
      return (
        <div className="search-results">
          <h3>Search results for "{searchQuery}"</h3>
          {isSearching && <div className="loading">Searching…</div>}
          {!isSearching && searchResults.length === 0 && (
            <div className="no-results"><p>No results found for "{searchQuery}"</p></div>
          )}
          {!isSearching && searchResults.length > 0 && (
            <div className="results-list">
              {searchResults.map((post) => (
                <TweetCard key={post.id || post._id} tweet={{
                  id: post.id || post._id,
                  content: post.content,
                  author: post.author || { id: post.authorId, username: 'user', displayName: 'User' },
                  createdAt: post.createdAt,
                  images: post.images || post.media || [],
                  likes: Array.isArray(post.likes) ? post.likes.length : (post.likes || 0),
                  retweets: Array.isArray(post.retweets) ? post.retweets.length : (post.retweets || 0),
                  replies: Array.isArray(post.replies) ? post.replies.length : (post.replies || 0),
                  liked: false,
                  retweeted: false,
                }} />
              ))}
              {hasMore && (
                <div className="load-more">
                  <button className="load-more-btn" onClick={() => handleSearch(searchQuery)}>Load more</button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case "for-you":
        return <ExploreForYou />;
      case "trending":
        return <TrendingTopics data={trending} />;
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
