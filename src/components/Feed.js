import React, { useEffect, useRef, useState } from 'react';
import { postAPI, pollAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
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
  const [view, setView] = useState('posts'); // 'posts' | 'polls'
  const [lastApiResponse, setLastApiResponse] = useState(null);
  const { user } = useAuth(); // Get current user
  const { newPostsCount, clearNewPostsCount } = useRealTime();
  const viewRef = useRef(view);

  // Keep a ref of current view to avoid mixing posts into polls list via realtime events
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching posts for page:', pageNum);
      
      // Use timeline if user is logged in, otherwise use general posts
      const response = await postAPI.getFeed(pageNum, 10, user?.id);
      console.log('🔍 API Response:', response);
      setLastApiResponse(response);
      
      // Handle different response structures
      const postsArray = response.posts || response || [];
      console.log('🔍 Posts array:', postsArray);
      
      if (append) {
        setPosts(prev => {
          // Filter out duplicates when appending
          const existingIds = new Set(prev.map(getStableKey));
          const newPosts = postsArray.filter(post => !existingIds.has(getStableKey(post)));
          console.log(`🔄 Appending ${newPosts.length} new posts (filtered ${postsArray.length - newPosts.length} duplicates)`);
          return deduplicatePosts([...prev, ...newPosts]);
        });
      } else {
        // Always dedupe on replace as well
        setPosts(deduplicatePosts(postsArray));
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
          // Do not fetch here to avoid double-fetch; view effect will fetch
        } else {
          setBackendStatus('error');
          setError('Backend responded with error: ' + response.status);
        }
      } catch (err) {
        setBackendStatus('disconnected');
        setError('Cannot connect to backend. Make sure it\'s running on port 3001.');
      }
    };
    
    checkBackendStatus();
  }, []);

  // Fetch polls when switching view
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        if (view !== 'polls') return;
        setLoading(true);
        setPosts([]); // reset list when switching view
        setPage(1);
        const res = await pollAPI.getActivePolls(page, 10);
        // Normalize to a list of objects compatible with TweetCard + Poll component
        const pollsArray = res?.polls || [];
  const mapped = pollsArray.map(p => {
          const base = {
            _id: p.postId || `poll-${p.id}`,
            id: p.postId || `poll-${p.id}`,
            content: p.question,
            authorId: p.userId,
            createdAt: p.createdAt || new Date().toISOString(),
            media: [],
            likes: [], retweets: [], replies: []
          };
          // Provide both poll_id and a minimal poll object so Poll can fetch details/results
          return {
            ...base,
            poll_id: p.id,
            poll: { id: p.id, poll_id: p.id }
          };
        });
  // Dedupe by stable key to avoid duplicate polls
  setPosts(deduplicatePosts(mapped));
        setHasMore(res?.polls?.length === 10);
      } catch (err) {
        console.error('❌ Error fetching polls:', err);
        setError(err.message || 'Failed to load polls');
      } finally {
        setLoading(false);
      }
    };
    if (view === 'polls') fetchPolls();
    if (view === 'posts') {
      setPosts([]); // reset list when switching view
      fetchPosts(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Real-time event listeners
  useEffect(() => {
    const handleNewPost = (event) => {
      // Ignore real-time new posts when viewing Polls to avoid mixing content types
      if (viewRef.current !== 'posts') return;
      const newPost = event.detail;
      setPosts(prev => {
        // Check if post already exists to avoid duplicates
        if (prev.some(post => getStableKey(post) === getStableKey(newPost))) {
          return prev;
        }
        return deduplicatePosts([newPost, ...prev]);
      });
    };

    const handlePostUpdate = (event) => {
      if (viewRef.current !== 'posts') return; // Only update posts list in posts view
      const { postId, updateType, data } = event.detail;
      setPosts(prev => prev.map(post => {
        if (getStableKey(post) === postId || (post._id || post.id) === postId) {
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
    setPosts(prev => {
      // Check if post already exists to avoid duplicates
      const postKey = getStableKey(newPost);
      if (prev.some(post => getStableKey(post) === postKey)) {
        console.log('🔄 Post already exists, skipping duplicate:', postKey);
        return prev;
      }
  console.log('✅ Adding new post to feed:', postKey);
  return deduplicatePosts([newPost, ...prev]);
    });
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  const refreshPosts = () => {
    console.log('🔄 Refreshing posts and clearing new posts count');
    fetchPosts(1, false);
    clearNewPostsCount();
  };

  // removed test/debug header actions

  // Helper function to deduplicate posts
  const getStableKey = (post) => {
    // Prefer Mongo _id or id; fallback to poll id if present
    const directId = post?._id || post?.id;
    if (directId) return String(directId);
    if (post?.poll_id) return `poll-${post.poll_id}`;
    return undefined;
  };

  const deduplicatePosts = (postsArray) => {
    const seen = new Set();
    return postsArray.filter(post => {
      const key = getStableKey(post);
      if (!key) return true;
      if (seen.has(key)) {
        console.log('🔄 Removing duplicate post:', key);
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  // Clean up any existing duplicates on mount
  useEffect(() => {
    setPosts(prev => {
      const deduplicated = deduplicatePosts(prev);
      if (deduplicated.length !== prev.length) {
        console.log(`🧹 Cleaned up ${prev.length - deduplicated.length} duplicate posts`);
        return deduplicated;
      }
      return prev;
    });
  }, []); // Only run once on mount

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
          <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
            <button
              className={view === 'posts' ? 'tab-active' : 'tab'}
              onClick={() => setView('posts')}
            >
              Posts
            </button>
            <button
              className={view === 'polls' ? 'tab-active' : 'tab'}
              onClick={() => setView('polls')}
            >
              Polls
            </button>
          </div>
          {/* status indicators removed */}
          {newPostsCount > 0 && (
            <div className="new-posts-indicator" onClick={refreshPosts}>
              {newPostsCount} new post{newPostsCount !== 1 ? 's' : ''} available - Click to refresh
            </div>
          )}
        </div>
        {/* header action buttons removed */}
      </div>
      
  {view === 'posts' && <CreatePost onPostCreated={handlePostCreated} />}
      
      <div className="posts-container">
    {posts.map((post, index) => {
          console.log(`🔍 Rendering post ${index}:`, post);
          return (
      <TweetCard key={getStableKey(post) || index} tweet={post} />
          );
        })}
        
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        )}
        
  {!loading && hasMore && view === 'posts' && (
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
