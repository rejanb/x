import React, { useCallback, useEffect, useState } from "react";
import { useTweets } from "../context/TweetContext";
import CreatePost from "./CreatePost";
import "./Feed.css";
import TweetCard from "./tweet/TweetCard";

const Feed = () => {
  const { tweets, isLoading, error, hasMore, loadTweets } = useTweets();
  const [page, setPage] = useState(1);
  const [newPostsCount, setNewPostsCount] = useState(0);

  // Use tweets from TweetContext instead of local state
  const posts = tweets;

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      console.log(`🔄 Fetching posts page ${pageNum}, append: ${append}`);
      await loadTweets(pageNum, append);
      setPage(pageNum);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    }
  }, [loadTweets]);

  // Initial fetch
  useEffect(() => {
    const checkBackendAndFetch = async () => {
      try {
        // Simple health check
        const response = await fetch('http://localhost:3001/api/posts?page=1&limit=1');
        if (response.ok) {
          console.log('✅ Backend is accessible, fetching posts...');
          fetchPosts(1, false);
        } else {
          console.error('❌ Backend returned error status:', response.status);
        }
      } catch (error) {
        console.error('❌ Backend health check failed:', error);
      }
    };
    
    checkBackendAndFetch();
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    if (!newPost || (!newPost._id && !newPost.id)) {
      console.warn('⚠️ Cannot add post without valid ID:', newPost);
      return;
    }
    
    console.log('✅ New post created, will be handled by TweetContext');
    // TweetContext will handle adding the new post
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  const handleRefreshFeed = () => {
    console.log('🔄 Refreshing posts');
    fetchPosts(1, false);
    setNewPostsCount(0);
  };

  if (error) {
    return (
      <div className="feed-error">
        <h3>⚠️ Error Loading Posts</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={handleRefreshFeed} className="retry-btn">
            🔄 Try Again
          </button>
          <button onClick={handleRefreshFeed} className="dismiss-btn">
            ✕ Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feed">
      <div className="feed-header">
        <div className="header-left">
          <h2>Feed</h2>
        </div>
      </div>
      
      <CreatePost onPostCreated={handlePostCreated} />
      
      <div className="posts-container">
        {posts.map((post, index) => {
          // Ensure post has valid ID before rendering
          if (!post || (!post._id && !post.id)) {
            console.warn('⚠️ Skipping invalid post at index:', index, post);
            return null;
          }
          
          console.log(`🔍 Rendering post ${index}:`, post);
          return (
            <TweetCard key={post._id || post.id || index} tweet={post} />
          );
        }).filter(Boolean)} {/* Filter out null entries */}
        
        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        )}
        
        {!isLoading && hasMore && (
          <button 
            className="load-more-btn"
            onClick={loadMore}
          >
            Load More Posts
          </button>
        )}
        
        {!isLoading && !hasMore && posts.length > 0 && (
          <div className="end-of-feed">
            <p>You've reached the end of the feed!</p>
          </div>
        )}
        
        {!isLoading && posts.length === 0 && (
          <div className="empty-feed">
            <p>No posts yet. Be the first to post something!</p>
            <div className="debug-info">
              <p><strong>Debug Info:</strong></p>
              <p>Page: {page}</p>
              <p>Has More: {hasMore ? 'Yes' : 'No'}</p>
              <p>Error: {error || 'None'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
