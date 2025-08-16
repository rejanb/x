import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import Layout from "./components/common/Layout";
import NotificationManager from "./components/common/NotificationManager";
import PrivateRoute from "./components/common/PrivateRoute";
import PublicRoute from "./components/common/PublicRoute";
import { AuthProvider } from "./context/AuthContext";
import { RealTimeProvider } from "./context/RealTimeContext";
import { TweetProvider } from "./context/TweetContext";
import Bookmarks from "./pages/Bookmarks";
import ChangePassword from "./pages/ChangePassword";
import EditProfile from "./pages/EditProfile";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import PollTest from "./pages/PollTest";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import TweetDetail from "./pages/TweetDetail";

function App() {
  return (
    <AuthProvider>
      <RealTimeProvider>
        <TweetProvider>
          <Router>
            <div className="App">
              <NotificationManager />
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Private Routes */}
                <Route element={<PrivateRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<EditProfile />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/tweet/:tweetId" element={<TweetDetail />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/poll-test" element={<PollTest />} />
                  </Route>
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/home" replace />} />
              </Routes>
            </div>
          </Router>
        </TweetProvider>
      </RealTimeProvider>
    </AuthProvider>
  );
}

export default App;
