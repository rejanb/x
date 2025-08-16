import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTweets } from "../../context/TweetContext";
import { pollsAPI } from "../../services/api";
import "./Poll.css";

// Props:
// - poll: can be a full poll object (from frontend mock) OR minimal with pollId/poll_id
// - tweetId: the post ID that references this poll
const Poll = ({ poll, tweetId }) => {
  const { user } = useAuth();
  const { votePoll } = useTweets();
  const [timeLeft, setTimeLeft] = useState("");
  const [voted, setVoted] = useState(false);
  const [serverPoll, setServerPoll] = useState(null);
  const pollId = useMemo(() => poll?.id || poll?.pollId || poll?.poll_id || null, [poll]);

  useEffect(() => {
    const p = poll || serverPoll;
    if (!p) return;
    
    const updateTimeLeft = () => {
      const now = new Date();
      const endTime = p?.expiresAt ? new Date(p.expiresAt) : null;
      if (!endTime) {
        setTimeLeft("");
        return;
      }
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
  }, [poll?.expiresAt, serverPoll?.expiresAt]);

  // Fetch poll details from backend when we only have an id
  useEffect(() => {
    let active = true;
    const fetchPoll = async () => {
      if (!pollId) return;
      try {
        const data = await pollsAPI.getPollById(pollId);
        if (active) setServerPoll(data);
      } catch (e) {
        // ignore
      }
    };
    if (!poll || !poll.options) {
      fetchPoll();
    }
    return () => {
      active = false;
    };
  }, [poll, pollId]);

  const handleVote = (optionIndex) => {
    if (hasUserVoted() || isPollEnded()) return;
    // Optimistic UI update in context
    votePoll(tweetId, optionIndex, user.id);
    // Send to backend if we have a poll id
    if (pollId && user?.id != null) {
      pollsAPI
        .voteOnPoll(pollId, optionIndex, user.id)
    .then(() => refreshResults())
        .catch(() => {/* ignore error for now */});
    }
  setVoted(true);
  };

  const hasUserVoted = () => {
    const p = poll || serverPoll;
    if (!p) return false;
    // Backend shape likely doesn't include voters list, only votes; fall back to false
    return Array.isArray(p.options) && p.options.some((option) => Array.isArray(option?.voters) && option.voters.includes(user.id));
  };

  const isPollEnded = () => {
    const p = poll || serverPoll;
    if (!p?.expiresAt) return false;
    return new Date() > new Date(p.expiresAt);
  };

  const getUserVotedOption = () => {
    const p = poll || serverPoll;
    if (!p) return -1;
    return Array.isArray(p.options) ? p.options.findIndex((option) => Array.isArray(option?.voters) && option.voters.includes(user.id)) : -1;
  };

  const getPercentage = (votes) => {
    const totalVotes = getTotalVotes();
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getOptions = () => {
    // Frontend mock shape: options: array of strings or {text, voters, votes}
    // Backend shape: options: array of strings; results available via results API
    const p = poll || serverPoll;
    if (!p) return [];
    if (Array.isArray(p.options) && typeof p.options[0] === 'string') {
      return p.options.map((opt) => ({ label: opt, votes: 0 }));
    }
    if (Array.isArray(p.options)) {
      return p.options.map((opt) => ({ label: opt.text || opt.option || String(opt), votes: opt.votes || 0 }));
    }
    return [];
  };

  const [results, setResults] = useState(null);
  const refreshResults = async () => {
    if (!pollId) return;
    try {
      const r = await pollsAPI.getPollResults(pollId);
      setResults(r);
    } catch (_) { /* noop */ }
  };

  useEffect(() => {
    if (pollId) refreshResults();
  }, [pollId]);

  const getTotalVotes = () => {
    if (results?.totalVotes != null) return results.totalVotes;
    const opts = results?.results || [];
    if (opts.length) return opts.reduce((acc, o) => acc + (o.votes || 0), 0);
    const p = poll || serverPoll;
    return p?.totalVotes || 0;
  };

  const optionRenderData = () => {
    if (results?.results?.length) {
      return results.results.map((r, idx) => ({ label: r.option || r.label, votes: r.votes || 0, idx }));
    }
    const opts = getOptions();
    return opts.map((o, idx) => ({ label: o.label, votes: o.votes || 0, idx }));
  };
  const userVotedIndex = getUserVotedOption();
  const showResults = voted || hasUserVoted() || isPollEnded();

  return (
    <div className="poll-container">
      <div className="poll-question">{(poll || serverPoll)?.question}</div>
      <div className="poll-options">
        {optionRenderData().map(({ label, votes, idx }) => (
          <div key={idx} className="poll-option">
            {showResults ? (
              <div
                className={`poll-result ${
                  userVotedIndex === idx ? "voted" : ""
                }`}
              >
                <div className="poll-result-content">
                  <span className="poll-option-text">{label}</span>
                  <span className="poll-percentage">{getPercentage(votes)}%</span>
                </div>
                <div
                  className="poll-progress-bar"
                  style={{ width: `${getPercentage(votes)}%` }}
                />
                {userVotedIndex === idx && (
                  <div className="vote-indicator">✓</div>
                )}
              </div>
            ) : (
              <button
                className="poll-vote-button"
                onClick={() => handleVote(idx)}
                disabled={isPollEnded()}
              >
                {label}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="poll-footer">
        <span className="poll-vote-count">
          {getTotalVotes()} vote{getTotalVotes() !== 1 ? "s" : ""}
        </span>
        <span className="poll-time-left">{timeLeft}</span>
      </div>
    </div>
  );
};

export default Poll;
