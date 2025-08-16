import React, { useEffect, useState } from 'react';
import { postsAPI } from '../services/api';
import { useRealTime } from '../context/RealTimeContext';
import CreatePost from './CreatePost';
import './Feed.css';
import TweetCard from './tweet/TweetCard';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [lastApiResponse, setLastApiResponse] = useState(null);
  const { isConnected, newPostsCount, clearNewPostsCount } = useRealTime();

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching posts for page:', pageNum);
      
      const response = await postsAPI.getAllPosts(pageNum, 10);
      console.log('🔍 API Response:', response);
      setLastApiResponse(response);
      
      // Handle different response structures
      const postsArray = response.posts || response || [];
      console.log('🔍 Posts array:', postsArray);
      
      if (append) {
        setPosts(prev => [...prev, ...postsArray]);
      } else {
        setPosts(postsArray);
      }
      
      setHasMore(postsArray.length === 10);
      setPage(pageNum);
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check backend status first
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/posts?page=1&limit=1');
        if (response.ok) {
          setBackendStatus('connected');
          fetchPosts(1, false);
        } else {
          setBackendStatus('error');
          setError('Backend responded with error: ' + response.status);
        }
      } catch (err) {
        setBackendStatus('disconnected');
        setError('Cannot connect to backend. Make sure it\'s running on port 3000.');
      }
    };
    
    checkBackendStatus();
  }, []);

  // Real-time event listeners
  useEffect(() => {
    const handleNewPost = (event) => {
      const newPost = event.detail;
      setPosts(prev => {
        // Check if post already exists to avoid duplicates
        if (prev.some(post => (post._id || post.id) === (newPost._id || newPost.id))) {
          return prev;
        }
        return [newPost, ...prev];
      });
    };

    const handlePostUpdate = (event) => {
      const { postId, updateType, data } = event.detail;
      setPosts(prev => prev.map(post => {
        if ((post._id || post.id) === postId) {
          switch (updateType) {
            case 'like':
              return { ...post, likes: [...(post.likes || []), data.userId] };
            case 'unlike':
              return { ...post, likes: (post.likes || []).filter(id => id !== data.userId) };
            case 'reply':
              return { ...post, replies: [...(post.replies || []), data.replyId] };
            default:
              return post;
          }
        }
        return post;
      }));
    };

    // Add event listeners
    window.addEventListener('newPostReceived', handleNewPost);
    window.addEventListener('postUpdateReceived', handlePostUpdate);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('newPostReceived', handleNewPost);
      window.removeEventListener('postUpdateReceived', handlePostUpdate);
    };
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  const refreshPosts = () => {
    fetchPosts(1, false);
    clearNewPostsCount();
  };

  if (error) {
    return (
      <div className="feed-error">
        <p>Error loading posts: {error}</p>
        <button onClick={refreshPosts}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="feed">
      <div className="feed-header">
        <div className="header-left">
          <h2>Feed</h2>
          <div className={`backend-status ${backendStatus}`}>
            {backendStatus === 'connected' && '🟢 Backend Connected'}
            {backendStatus === 'disconnected' && '🔴 Backend Disconnected'}
            {backendStatus === 'error' && '🟡 Backend Error'}
            {backendStatus === 'checking' && '🟡 Checking...'}
          </div>
          <div className={`websocket-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🔗 Real-time Connected' : '❌ Real-time Disconnected'}
          </div>
          {newPostsCount > 0 && (
            <div className="new-posts-indicator" onClick={refreshPosts}>
              {newPostsCount} new post{newPostsCount !== 1 ? 's' : ''} available - Click to refresh
            </div>
          )}
        </div>
        <div className="header-buttons">
          <button 
            className="test-api-btn"
            onClick={() => fetchPosts(1, false)}
          >
            🔄 Refresh Posts
          </button>
          
          <button 
            className="test-post-btn"
            onClick={async () => {
              try {
                const testPost = await postsAPI.createPost({
                  content: 'This is a test post from the refresh button! #test #api #working',
                  authorId: 'test-user-123'
                });
                console.log('✅ Test post created:', testPost);
                
                // Create a properly structured post object
                const structuredPost = {
                  _id: testPost._id || testPost.id || `test-${Date.now()}`,
                  content: testPost.content || 'Test post content',
                  authorId: testPost.authorId || 'test-user-123',
                  createdAt: testPost.createdAt || new Date().toISOString(),
                  media: testPost.media || [],
                  poll: testPost.poll || null,
                  likes: testPost.likes || [],
                  retweets: testPost.retweets || [],
                  replies: testPost.replies || []
                };
                
                console.log('🔍 Structured post:', structuredPost);
                
                if (handlePostCreated) {
                  handlePostCreated(structuredPost);
                }
                // Refresh posts to show the new one
                fetchPosts(1, false);
              } catch (error) {
                console.error('❌ Test post failed:', error);
                alert('Test post failed: ' + error.message);
              }
            }}
          >
            🧪 Test Post
          </button>
        </div>
      </div>
      
      <CreatePost onPostCreated={handlePostCreated} />
      
      <div className="posts-container">
        {posts.map((post, index) => {
          console.log(`🔍 Rendering post ${index}:`, post);
          return (
            <TweetCard key={post._id || post.id || index} tweet={post} />
          );
        })}
        
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        )}
        
        {!loading && hasMore && (
          <button 
            className="load-more-btn"
            onClick={loadMore}
          >
            Load More Posts
          </button>
        )}
        
        {!loading && !hasMore && posts.length > 0 && (
          <div className="end-of-feed">
            <p>You've reached the end of the feed!</p>
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="empty-feed">
            <p>No posts yet. Be the first to post something!</p>
            <div className="debug-info">
              <p><strong>Debug Info:</strong></p>
              <p>Page: {page}</p>
              <p>Has More: {hasMore ? 'Yes' : 'No'}</p>
              <p>Error: {error || 'None'}</p>
              <p>Backend Status: {backendStatus}</p>
              {lastApiResponse && (
                <details>
                  <summary>Last API Response</summary>
                  <pre>{JSON.stringify(lastApiResponse, null, 2)}</pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
