import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

// Tweet Context
const TweetContext = createContext();

// Tweet actions
const TWEET_ACTIONS = {
  LOAD_TWEETS_START: "LOAD_TWEETS_START",
  LOAD_TWEETS_SUCCESS: "LOAD_TWEETS_SUCCESS",
  LOAD_TWEETS_FAILURE: "LOAD_TWEETS_FAILURE",
  ADD_TWEET: "ADD_TWEET",
  DELETE_TWEET: "DELETE_TWEET",
  LIKE_TWEET: "LIKE_TWEET",
  UNLIKE_TWEET: "UNLIKE_TWEET",
  RETWEET: "RETWEET",
  UNRETWEET: "UNRETWEET",
  ADD_REPLY: "ADD_REPLY",
  SET_SELECTED_TWEET: "SET_SELECTED_TWEET",
  VOTE_POLL: "VOTE_POLL",
};

// Initial state
const initialState = {
  tweets: [],
  selectedTweet: null,
  isLoading: false,
  error: null,
  hasMore: true,
};

// Tweet reducer
const tweetReducer = (state, action) => {
  switch (action.type) {
    case TWEET_ACTIONS.LOAD_TWEETS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case TWEET_ACTIONS.LOAD_TWEETS_SUCCESS:
      return {
        ...state,
        tweets: action.payload.append
          ? [...state.tweets, ...action.payload.tweets]
          : action.payload.tweets,
        isLoading: false,
        hasMore: action.payload.hasMore,
      };

    case TWEET_ACTIONS.LOAD_TWEETS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case TWEET_ACTIONS.ADD_TWEET:
      return {
        ...state,
        tweets: [action.payload, ...state.tweets],
      };

    case TWEET_ACTIONS.DELETE_TWEET:
      return {
        ...state,
        tweets: state.tweets.filter((tweet) => tweet.id !== action.payload),
      };

    case TWEET_ACTIONS.LIKE_TWEET:
      return {
        ...state,
        tweets: state.tweets.map((tweet) =>
          tweet.id === action.payload
            ? { ...tweet, liked: true, likes: tweet.likes + 1 }
            : tweet
        ),
      };

    case TWEET_ACTIONS.UNLIKE_TWEET:
      return {
        ...state,
        tweets: state.tweets.map((tweet) =>
          tweet.id === action.payload
            ? { ...tweet, liked: false, likes: tweet.likes - 1 }
            : tweet
        ),
      };

    case TWEET_ACTIONS.RETWEET:
      return {
        ...state,
        tweets: state.tweets.map((tweet) =>
          tweet.id === action.payload
            ? { ...tweet, retweeted: true, retweets: tweet.retweets + 1 }
            : tweet
        ),
      };

    case TWEET_ACTIONS.UNRETWEET:
      return {
        ...state,
        tweets: state.tweets.map((tweet) =>
          tweet.id === action.payload
            ? { ...tweet, retweeted: false, retweets: tweet.retweets - 1 }
            : tweet
        ),
      };

    case TWEET_ACTIONS.ADD_REPLY:
      return {
        ...state,
        tweets: state.tweets.map((tweet) =>
          tweet.id === action.payload.tweetId
            ? { ...tweet, replies: tweet.replies + 1 }
            : tweet
        ),
      };

    case TWEET_ACTIONS.SET_SELECTED_TWEET:
      return {
        ...state,
        selectedTweet: action.payload,
      };

    case TWEET_ACTIONS.VOTE_POLL:
      return {
        ...state,
        tweets: state.tweets.map((tweet) => {
          if (tweet.id === action.payload.tweetId && tweet.poll) {
            const updatedPoll = { ...tweet.poll };

            // Remove user's previous vote if any
            updatedPoll.options = updatedPoll.options.map((option) => ({
              ...option,
              voters: option.voters.filter(
                (voterId) => voterId !== action.payload.userId
              ),
              votes: option.voters.filter(
                (voterId) => voterId !== action.payload.userId
              ).length,
            }));

            // Add new vote
            updatedPoll.options[action.payload.optionIndex].voters.push(
              action.payload.userId
            );
            updatedPoll.options[action.payload.optionIndex].votes += 1;

            // Update total votes
            updatedPoll.totalVotes = updatedPoll.options.reduce(
              (total, option) => total + option.votes,
              0
            );

            return { ...tweet, poll: updatedPoll };
          }
          return tweet;
        }),
        selectedTweet:
          state.selectedTweet &&
          state.selectedTweet.id === action.payload.tweetId
            ? (() => {
                const updatedTweet = { ...state.selectedTweet };
                if (updatedTweet.poll) {
                  const updatedPoll = { ...updatedTweet.poll };

                  // Remove user's previous vote if any
                  updatedPoll.options = updatedPoll.options.map((option) => ({
                    ...option,
                    voters: option.voters.filter(
                      (voterId) => voterId !== action.payload.userId
                    ),
                    votes: option.voters.filter(
                      (voterId) => voterId !== action.payload.userId
                    ).length,
                  }));

                  // Add new vote
                  updatedPoll.options[action.payload.optionIndex].voters.push(
                    action.payload.userId
                  );
                  updatedPoll.options[action.payload.optionIndex].votes += 1;

                  // Update total votes
                  updatedPoll.totalVotes = updatedPoll.options.reduce(
                    (total, option) => total + option.votes,
                    0
                  );

                  updatedTweet.poll = updatedPoll;
                }
                return updatedTweet;
              })()
            : state.selectedTweet,
      };

    default:
      return state;
  }
};

// Tweet Provider Component
export const TweetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tweetReducer, initialState);

  // Load tweets
  const loadTweets = useCallback(async (append = false) => {
    dispatch({ type: TWEET_ACTIONS.LOAD_TWEETS_START });

    try {
      // Replace with your actual API call
      // const response = await tweetService.getTweets();

      // Mock tweets for now
      const mockTweets = [
        {
          id: 1,
          content:
            "Welcome to #XClone! This is your first tweet. #react #javascript #coding",
          author: {
            id: 1,
            username: "user1",
            displayName: "John Doe",
            profilePicture: null,
          },
          createdAt: new Date().toISOString(),
          likes: 5,
          retweets: 2,
          replies: 1,
          liked: false,
          retweeted: false,
          images: [],
        },
        {
          id: 2,
          content:
            "Building awesome #React applications with #ContextAPI! 🚀 #webdev #frontend #programming",
          author: {
            id: 2,
            username: "developer",
            displayName: "Jane Developer",
            profilePicture: null,
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          likes: 12,
          retweets: 5,
          replies: 3,
          liked: true,
          retweeted: false,
          images: [],
        },
        {
          id: 3,
          content:
            "Just deployed my new project! Check out the latest features. #deployment #success #tech #startup",
          author: {
            id: 3,
            username: "techie",
            displayName: "Tech Enthusiast",
            profilePicture: null,
          },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          likes: 8,
          retweets: 3,
          replies: 2,
          liked: false,
          retweeted: false,
          images: [],
        },
      ];

      dispatch({
        type: TWEET_ACTIONS.LOAD_TWEETS_SUCCESS,
        payload: {
          tweets: mockTweets,
          hasMore: false,
          append,
        },
      });
    } catch (error) {
      dispatch({
        type: TWEET_ACTIONS.LOAD_TWEETS_FAILURE,
        payload: error.message,
      });
    }
  }, []);

  // Add new tweet
  const addTweet = (tweetData) => {
    const newTweet = {
      id: Date.now(), // Use proper ID generation in production
      ...tweetData,
      createdAt: new Date().toISOString(),
      likes: 0,
      retweets: 0,
      replies: 0,
      liked: false,
      retweeted: false,
    };

    dispatch({ type: TWEET_ACTIONS.ADD_TWEET, payload: newTweet });
  };

  // Delete tweet
  const deleteTweet = (tweetId) => {
    dispatch({ type: TWEET_ACTIONS.DELETE_TWEET, payload: tweetId });
  };

  // Like/Unlike tweet
  const toggleLike = (tweetId, isLiked) => {
    dispatch({
      type: isLiked ? TWEET_ACTIONS.UNLIKE_TWEET : TWEET_ACTIONS.LIKE_TWEET,
      payload: tweetId,
    });
  };

  // Retweet/Unretweet
  const toggleRetweet = (tweetId, isRetweeted) => {
    dispatch({
      type: isRetweeted ? TWEET_ACTIONS.UNRETWEET : TWEET_ACTIONS.RETWEET,
      payload: tweetId,
    });
  };

  // Add reply
  const addReply = (tweetId, replyData) => {
    dispatch({
      type: TWEET_ACTIONS.ADD_REPLY,
      payload: { tweetId, reply: replyData },
    });
  };

  // Set selected tweet
  const setSelectedTweet = (tweet) => {
    dispatch({ type: TWEET_ACTIONS.SET_SELECTED_TWEET, payload: tweet });
  };

  // Vote on poll
  const votePoll = (tweetId, optionIndex, userId) => {
    dispatch({
      type: TWEET_ACTIONS.VOTE_POLL,
      payload: { tweetId, optionIndex, userId },
    });
  };

  const value = {
    ...state,
    loadTweets,
    addTweet,
    deleteTweet,
    toggleLike,
    toggleRetweet,
    addReply,
    setSelectedTweet,
    votePoll,
    TWEET_ACTIONS,
  };

  return (
    <TweetContext.Provider value={value}>{children}</TweetContext.Provider>
  );
};

// Custom hook to use tweet context
export const useTweets = () => {
  const context = useContext(TweetContext);
  if (!context) {
    throw new Error("useTweets must be used within a TweetProvider");
  }
  return context;
};

export default TweetContext;
