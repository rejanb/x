import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTweets } from "../context/TweetContext";
import TweetDetailCard from "../components/tweet/TweetDetailCard";
import CommentComposer from "../components/tweet/CommentComposer";
import CommentList from "../components/tweet/CommentList";
import "./TweetDetail.css";

const TweetDetail = () => {
  const { tweetId } = useParams();
  const navigate = useNavigate();
  const { tweets } = useTweets();
  const [tweet, setTweet] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock comments data - in real app, this would come from an API
  const mockComments = [
    {
      id: "comment-1",
      author: {
        id: 301,
        displayName: "Alice Cooper",
        username: "alicecooper",
        verified: false,
        profilePicture: null,
      },
      content: "This is such a great post! Thanks for sharing this insight.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      likes: 5,
      replies: 2,
      liked: false,
      parentId: tweetId,
    },
    {
      id: "comment-2",
      author: {
        id: 302,
        displayName: "Bob Wilson",
        username: "bobwilson",
        verified: true,
        profilePicture: null,
      },
      content: "Completely agree! This changed my perspective on the topic.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 12,
      replies: 0,
      liked: true,
      parentId: tweetId,
    },
    {
      id: "comment-3",
      author: {
        id: 303,
        displayName: "Carol Smith",
        username: "carolsmith",
        verified: false,
        profilePicture: null,
      },
      content:
        "Could you elaborate more on this point? I'd love to learn more about your experience.",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes: 8,
      replies: 1,
      liked: false,
      parentId: tweetId,
    },
    {
      id: "comment-4",
      author: {
        id: 304,
        displayName: "David Lee",
        username: "davidlee",
        verified: false,
        profilePicture: null,
      },
      content: "Amazing work! 🔥 Keep it up!",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      likes: 3,
      replies: 0,
      liked: false,
      parentId: tweetId,
    },
  ];

  useEffect(() => {
    // Find the tweet by ID
    const foundTweet = tweets.find((t) => t.id.toString() === tweetId);

    if (foundTweet) {
      setTweet(foundTweet);
      setComments(mockComments);
    } else {
      // Tweet not found, could be from explore page or external
      // In real app, you'd fetch from API
      console.log(
        "Tweet not found in current tweets, might need to fetch from API"
      );
    }

    setIsLoading(false);
  }, [tweetId, tweets]);

  const handleAddComment = (commentText) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      author: {
        id: 999, // Current user ID - would come from auth context
        displayName: "You",
        username: "you",
        verified: false,
        profilePicture: null,
      },
      content: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      liked: false,
      parentId: tweetId,
    };

    setComments((prev) => [newComment, ...prev]);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="tweet-detail-page">
        <div className="tweet-detail-header">
          <button onClick={handleBack} className="back-button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
            </svg>
          </button>
          <h1>Post</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner">Loading post...</div>
        </div>
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="tweet-detail-page">
        <div className="tweet-detail-header">
          <button onClick={handleBack} className="back-button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
            </svg>
          </button>
          <h1>Post</h1>
        </div>
        <div className="tweet-not-found">
          <h3>Post not found</h3>
          <p>
            This post may have been deleted or you don't have permission to view
            it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tweet-detail-page">
      <div className="tweet-detail-header">
        <button onClick={handleBack} className="back-button">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>
        </button>
        <h1>Post</h1>
      </div>

      <div className="tweet-detail-content">
        <TweetDetailCard tweet={tweet} />

        <div className="comment-section">
          <CommentComposer onSubmit={handleAddComment} />
          <CommentList comments={comments} />
        </div>
      </div>
    </div>
  );
};

export default TweetDetail;
