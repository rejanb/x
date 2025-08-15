import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TweetProvider } from "./context/TweetContext";
import PublicRoute from "./components/common/PublicRoute";
import PrivateRoute from "./components/common/PrivateRoute";
import Layout from "./components/common/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import TweetDetail from "./pages/TweetDetail";
import Messages from "./pages/Messages";
import Bookmarks from "./pages/Bookmarks";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <TweetProvider>
        <Router>
          <div className="App">
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
                </Route>
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </Router>
      </TweetProvider>
    </AuthProvider>
  );
}

export default App;
