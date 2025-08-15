import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTweets } from "../../context/TweetContext";
import "./Poll.css";

const Poll = ({ poll, tweetId }) => {
  const { user } = useAuth();
  const { votePoll } = useTweets();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!poll) return;
    
    const updateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(poll.expiresAt);
      const timeDiff = endTime - now;

      if (timeDiff <= 0) {
        setTimeLeft("Poll ended");
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [poll.endTime]);

  const handleVote = (optionIndex) => {
    if (hasUserVoted() || isPollEnded()) return;
    votePoll(tweetId, optionIndex, user.id);
  };

  const hasUserVoted = () => {
    return poll.options.some((option) => option.voters.includes(user.id));
  };

  const isPollEnded = () => {
    return new Date() > new Date(poll.endTime);
  };

  const getUserVotedOption = () => {
    return poll.options.findIndex((option) => option.voters.includes(user.id));
  };

  const getPercentage = (votes) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };



  const userVotedIndex = getUserVotedOption();
  const showResults = hasUserVoted() || isPollEnded();

  return (
    <div className="poll-container">
      <div className="poll-question">{poll.question}</div>
      <div className="poll-options">
        {poll.options.map((option, index) => (
          <div key={index} className="poll-option">
            {showResults ? (
              <div
                className={`poll-result ${
                  userVotedIndex === index ? "voted" : ""
                }`}
              >
                <div className="poll-result-content">
                  <span className="poll-option-text">{option}</span>
                  <span className="poll-percentage">
                    {getPercentage(0)}%
                  </span>
                </div>
                <div
                  className="poll-progress-bar"
                  style={{ width: `${getPercentage(0)}%` }}
                />
                {userVotedIndex === index && (
                  <div className="vote-indicator">✓</div>
                )}
              </div>
            ) : (
              <button
                className="poll-vote-button"
                onClick={() => handleVote(index)}
                disabled={isPollEnded()}
              >
                {option}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="poll-footer">
        <span className="poll-vote-count">
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
        </span>
        <span className="poll-time-left">{timeLeft}</span>
      </div>
    </div>
  );
};

export default Poll;
