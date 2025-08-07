import React, { useEffect } from "react";
import { useTweets } from "../context/TweetContext";
import TweetComposer from "../components/tweet/TweetComposer";
import TweetList from "../components/tweet/TweetList";
import "./Home.css";

const Home = () => {
  const { tweets, loadTweets, isLoading } = useTweets();

  useEffect(() => {
    console.log("Loading tweets...");
    loadTweets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  console.log("Home component - tweets:", tweets, "isLoading:", isLoading);

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Home</h1>
      </div>

      <TweetComposer />

      <div className="tweet-feed">
        {isLoading && tweets.length === 0 ? (
          <div className="loading-spinner">Loading tweets...</div>
        ) : (
          <TweetList tweets={tweets} />
        )}
      </div>
    </div>
  );
};

export default Home;
