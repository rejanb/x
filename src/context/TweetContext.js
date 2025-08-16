import React, {
    createContext,
    useCallback,
    useContext,
    useReducer,
} from "react";
import { postsAPI } from "../services/api";
import { useAuth } from "./AuthContext";

// Tweet Context
const TweetContext = createContext();

// Tweet actions
const TWEET_ACTIONS = {
  LOAD_TWEETS_START: "LOAD_TWEETS_START",
  LOAD_TWEETS_SUCCESS: "LOAD_TWEETS_SUCCESS",
  LOAD_TWEETS_ERROR: "LOAD_TWEETS_ERROR",
  ADD_TWEET: "ADD_TWEET",
  EDIT_TWEET: "EDIT_TWEET",
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

    case TWEET_ACTIONS.EDIT_TWEET:
      return {
        ...state,
        tweets: state.tweets.map((tweet) => {
          if (tweet.id === action.payload.id || tweet._id === action.payload.id) {
            return {
              ...tweet,
              ...action.payload,
              isEdited: true,
              updatedAt: new Date().toISOString(),
            };
          }
          return tweet;
        }),
      };

    case TWEET_ACTIONS.DELETE_TWEET:
      return {
        ...state,
        tweets: state.tweets.filter((tweet) => 
          tweet.id !== action.payload && tweet._id !== action.payload
        ),
      };

    case TWEET_ACTIONS.LIKE_TWEET:
      return {
        ...state,
        tweets: state.tweets.map((tweet) => {
          if (tweet.id === action.payload.tweetId || tweet._id === action.payload.tweetId) {
            const currentLikes = Array.isArray(tweet.likes) ? tweet.likes : [];
            return {
              ...tweet,
              likes: [...currentLikes, action.payload.userId]
            };
          }
          return tweet;
        }),
      };

    case TWEET_ACTIONS.UNLIKE_TWEET:
      return {
        ...state,
        tweets: state.tweets.map((tweet) => {
          if (tweet.id === action.payload.tweetId || tweet._id === action.payload.tweetId) {
            const currentLikes = Array.isArray(tweet.likes) ? tweet.likes : [];
            return {
              ...tweet,
              likes: currentLikes.filter(likeId => likeId !== action.payload.userId)
            };
          }
          return tweet;
        }),
      };

    case TWEET_ACTIONS.RETWEET:
      return {
        ...state,
        tweets: state.tweets.map((tweet) => {
          if (tweet.id === action.payload.tweetId || tweet._id === action.payload.tweetId) {
            const currentRetweets = Array.isArray(tweet.retweets) ? tweet.retweets : [];
            return {
              ...tweet,
              retweets: [...currentRetweets, action.payload.userId]
            };
          }
          return tweet;
        }),
      };

    case TWEET_ACTIONS.UNRETWEET:
      return {
        ...state,
        tweets: state.tweets.map((tweet) => {
          if (tweet.id === action.payload.tweetId || tweet._id === action.payload.tweetId) {
            const currentRetweets = Array.isArray(tweet.retweets) ? tweet.retweets : [];
            return {
              ...tweet,
              retweets: currentRetweets.filter(retweetId => retweetId !== action.payload.userId)
            };
          }
          return tweet;
        }),
      };

    case TWEET_ACTIONS.ADD_REPLY:
      return {
        ...state,
        tweets: state.tweets.map((tweet) => {
          if (tweet.id === action.payload.tweetId || tweet._id === action.payload.tweetId) {
            const currentReplies = Array.isArray(tweet.replies) ? tweet.replies : [];
            return {
              ...tweet,
              replies: [...currentReplies, action.payload.replyId]
            };
          }
          return tweet;
        }),
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
  const { user } = useAuth();

  // Load tweets
  const loadTweets = useCallback(async (page = 1, append = false) => {
    dispatch({ type: TWEET_ACTIONS.LOAD_TWEETS_START });

    try {
      const response = await postsAPI.getAllPosts(page, 10);
      
      // Handle different response structures
      let tweetsArray = [];
      if (response && response.posts) {
        tweetsArray = response.posts;
      } else if (Array.isArray(response)) {
        tweetsArray = response;
      } else if (response && Array.isArray(response.data)) {
        tweetsArray = response.data;
      }

      dispatch({
        type: TWEET_ACTIONS.LOAD_TWEETS_SUCCESS,
        payload: {
          tweets: tweetsArray,
          hasMore: tweetsArray.length === 10, // Assuming 10 tweets per page
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
      id: Date.now().toString(), // Use proper ID generation in production
      _id: Date.now().toString(), // Also add _id for MongoDB compatibility
      ...tweetData,
      createdAt: new Date().toISOString(),
      likes: [],
      retweets: [],
      replies: [],
    };

    dispatch({ type: TWEET_ACTIONS.ADD_TWEET, payload: newTweet });
  };

  // Edit tweet
  const editTweet = async (tweetId, updatedData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Optimistically update the UI first
      dispatch({
        type: TWEET_ACTIONS.EDIT_TWEET,
        payload: { id: tweetId, ...updatedData },
      });

      // Then make the API call
      await postsAPI.editPost(tweetId, updatedData);
      
      // If successful, the optimistic update stays
      // If failed, we can revert it here if needed
    } catch (error) {
      console.error("Error editing tweet:", error);
      
      // Revert the optimistic update on error
      // You could implement a more sophisticated rollback here
      throw error;
    }
  };

  // Delete tweet
  const deleteTweet = async (tweetId) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Optimistically update the UI first
      dispatch({
        type: TWEET_ACTIONS.DELETE_TWEET,
        payload: tweetId,
      });

      // Then make the API call
      await postsAPI.deletePost(tweetId);
      
      // If successful, the optimistic update stays
      // If failed, we can revert it here if needed
    } catch (error) {
      console.error("Error deleting tweet:", error);
      
      // Revert the optimistic update on error
      // You could implement a more sophisticated rollback here
      throw error;
    }
  };

  // Like/Unlike tweet
  const toggleLike = async (tweetId, isLiked) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Optimistically update the UI first
      dispatch({
        type: isLiked ? TWEET_ACTIONS.UNLIKE_TWEET : TWEET_ACTIONS.LIKE_TWEET,
        payload: { tweetId, userId: user.id },
      });

      // Then make the API call
      await postsAPI.likeTweet(tweetId, isLiked, user.id);
      
      // If successful, the optimistic update stays
      // If failed, we can revert it here if needed
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // Revert the optimistic update on error
      dispatch({
        type: isLiked ? TWEET_ACTIONS.LIKE_TWEET : TWEET_ACTIONS.UNLIKE_TWEET,
        payload: { tweetId, userId: user.id },
      });
      
      // You could show a toast notification here
      throw error;
    }
  };

  // Retweet/Unretweet
  const toggleRetweet = async (tweetId, isRetweeted) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Optimistically update the UI first
      dispatch({
        type: isRetweeted ? TWEET_ACTIONS.UNRETWEET : TWEET_ACTIONS.RETWEET,
        payload: { tweetId, userId: user.id },
      });

      // Then make the API call
      await postsAPI.retweetPost(tweetId, isRetweeted, user.id);
      
      // If successful, the optimistic update stays
      // If failed, we can revert it here if needed
    } catch (error) {
      console.error("Error toggling retweet:", error);
      
      // Revert the optimistic update on error
      dispatch({
        type: isRetweeted ? TWEET_ACTIONS.RETWEET : TWEET_ACTIONS.UNRETWEET,
        payload: { tweetId, userId: user.id },
      });
      
      // You could show a toast notification here
      throw error;
    }
  };

  // Add reply
  const addReply = (tweetId, replyData) => {
    dispatch({
      type: TWEET_ACTIONS.ADD_REPLY,
      payload: { tweetId, replyId: replyData.id || Date.now().toString() },
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
    editTweet,
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
