import React from "react";
import Feed from "../components/Feed";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Home</h1>
      </div>
      
      <Feed />
    </div>
  );
};

export default Home;
