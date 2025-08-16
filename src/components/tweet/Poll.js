import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTweets } from "../../context/TweetContext";
import { pollsAPI } from "../../services/api";
import "./Poll.css";

const Poll = ({ poll, tweetId }) => {
  const { user } = useAuth();
  const { votePoll } = useTweets();
  const [timeLeft, setTimeLeft] = useState("");
  const [pollData, setPollData] = useState(poll);
  const [isVoting, setIsVoting] = useState(false);

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
  }, [poll.expiresAt]);

  const handleVote = async (optionIndex) => {
    if (hasUserVoted() || isPollEnded() || isVoting) return;
    
    setIsVoting(true);
    try {
      // Call the polls API to vote
      const voteResult = await pollsAPI.voteOnPoll(poll.id, optionIndex, user.id);
      console.log("Vote recorded:", voteResult);
      
      // Refresh poll data to get updated results
      const updatedPoll = await pollsAPI.getPollResults(poll.id);
      setPollData(updatedPoll);
    } catch (error) {
      console.error("Error voting on poll:", error);
      alert("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const hasUserVoted = () => {
    // Check if user has voted by looking at the votes array
    if (!pollData.votes || !user) return false;
    return pollData.votes.some(vote => vote.userId === user.id);
  };

  const isPollEnded = () => {
    return new Date() > new Date(poll.expiresAt);
  };

  const getUserVotedOption = () => {
    if (!pollData.votes || !user) return -1;
    const userVote = pollData.votes.find(vote => vote.userId === user.id);
    return userVote ? userVote.optionIndex : -1;
  };

  const getPercentage = (votes) => {
    if (pollData.totalVotes === 0) return 0;
    return Math.round((votes / pollData.totalVotes) * 100);
  };

  const userVotedIndex = getUserVotedOption();
  const showResults = hasUserVoted() || isPollEnded();

  // Use pollData instead of poll for dynamic updates
  const currentPoll = pollData || poll;

  return (
    <div className="poll-container">
      <div className="poll-question">{currentPoll.question}</div>
      <div className="poll-options">
        {currentPoll.options.map((option, index) => {
          const votesForOption = currentPoll.votes ? 
            currentPoll.votes.filter(vote => vote.optionIndex === index).length : 0;
          const percentage = getPercentage(votesForOption);
          
          return (
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
                      {percentage}%
                    </span>
                  </div>
                  <div
                    className="poll-progress-bar"
                    style={{ width: `${percentage}%` }}
                  />
                  {userVotedIndex === index && (
                    <div className="vote-indicator">✓</div>
                  )}
                </div>
              ) : (
                <button
                  className="poll-vote-button"
                  onClick={() => handleVote(index)}
                  disabled={isPollEnded() || isVoting}
                >
                  {isVoting ? "Voting..." : option}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="poll-footer">
        <span className="poll-vote-count">
          {currentPoll.totalVotes || 0} vote{(currentPoll.totalVotes || 0) !== 1 ? "s" : ""}
        </span>
        <span className="poll-time-left">{timeLeft}</span>
      </div>
    </div>
  );
};

export default Poll;
