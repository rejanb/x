import { useAuth } from "../context/AuthContext";
import { useTweets } from "../context/TweetContext";

// Custom hook that combines both auth and tweets context
export const useApp = () => {
  const auth = useAuth();
  const tweets = useTweets();

  return {
    auth,
    tweets,
  };
};

export default useApp;
