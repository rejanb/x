import React from "react";
import TweetCard from "./TweetCard";
import "./TweetList.css";

const TweetList = ({ tweets }) => {
  console.log("TweetList received tweets:", tweets);

  if (!tweets || tweets.length === 0) {
    return (
      <div className="empty-feed">
        <h3>No tweets yet</h3>
        <p>Start following people or post your first tweet!</p>
      </div>
    );
  }

  return (
    <div className="tweet-list">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
};

export default TweetList;
