import React from "react";
import TweetCard from "../tweet/TweetCard";
import "./ExploreForYou.css";

const ExploreForYou = () => {
  // Mock data for explore content - in real app, this would come from an API
  const exploreContent = [
    {
      id: "explore-1",
      author: {
        id: 101,
        displayName: "Tech Crunch",
        username: "TechCrunch",
        verified: true,
        profilePicture: null,
      },
      content:
        "Breaking: New AI breakthrough in natural language processing shows 40% improvement in understanding context. This could revolutionize how we interact with technology. #AI #TechNews",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 1245,
      retweets: 456,
      replies: 89,
      liked: false,
      retweeted: false,
      images: [],
    },
    {
      id: "explore-2",
      author: {
        id: 102,
        displayName: "Sarah Johnson",
        username: "sarahjdev",
        verified: false,
        profilePicture: null,
      },
      content:
        "Just shipped my first React Native app! 🚀 The learning curve was steep but totally worth it. Special thanks to the amazing React Native community for all the help. #ReactNative #MobileDev",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes: 234,
      retweets: 67,
      replies: 23,
      liked: false,
      retweeted: false,
      images: [],
    },
    {
      id: "explore-3",
      author: {
        id: 103,
        displayName: "Design Inspiration",
        username: "designinspo",
        verified: true,
        profilePicture: null,
      },
      content:
        "Minimalist design trends for 2024:\n\n✨ Micro-interactions\n🎨 Subtle color gradients\n📱 Clean typography\n🔮 Glassmorphism elements\n⚡ Fast loading animations\n\nWhat's your favorite trend?",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      likes: 789,
      retweets: 234,
      replies: 56,
      liked: false,
      retweeted: false,
      images: [],
    },
    {
      id: "explore-4",
      author: {
        id: 104,
        displayName: "JavaScript Weekly",
        username: "jsweekly",
        verified: true,
        profilePicture: null,
      },
      content:
        "ES2024 features you should know about:\n\n🔥 Array.fromAsync()\n⚡ Promise.withResolvers()\n📦 Well-formed unicode strings\n🎯 RegExp v flag\n\nWhich one are you most excited about? 👇",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      likes: 567,
      retweets: 123,
      replies: 78,
      liked: false,
      retweeted: false,
      images: [],
    },
  ];

  const categories = [
    { name: "Trending", active: true },
    { name: "Technology", active: false },
    { name: "Design", active: false },
    { name: "Programming", active: false },
    { name: "Startup", active: false },
  ];

  return (
    <div className="explore-for-you">
      <div className="category-filters">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-btn ${category.active ? "active" : ""}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="explore-content">
        {exploreContent.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </div>

      <div className="load-more">
        <button className="load-more-btn">Show more tweets</button>
      </div>
    </div>
  );
};

export default ExploreForYou;
