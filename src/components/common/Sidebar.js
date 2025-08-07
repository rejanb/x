import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import "./Sidebar.css";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isOpen, dialogConfig, showConfirmation } = useConfirmationDialog();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = await showConfirmation({
      title: "Log out of X?",
      message:
        "You can always log back in at any time. If you just want to switch accounts, you can do that by adding an existing account.",
      confirmText: "Log out",
      cancelText: "Cancel",
      type: "default",
    });

    if (confirmed) {
      logout();
      navigate("/login");
    }
  };

  const navigationItems = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/explore", label: "Explore", icon: "🔍" },
    { path: "/notifications", label: "Notifications", icon: "🔔" },
    { path: "/messages", label: "Messages", icon: "✉️" },
    { path: "/bookmarks", label: "Bookmarks", icon: "🔖" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  // Main navigation items for mobile (4 items + logout)
  const mobileNavItems = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/explore", label: "Explore", icon: "🔍" },
    { path: "/notifications", label: "Notifications", icon: "🔔" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">X</h1>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="tweet-button">Tweet</button>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-details">
              <div className="user-name">
                {user?.displayName || user?.username}
              </div>
              <div className="user-username">@{user?.username}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <div className="mobile-nav-items">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </NavLink>
          ))}
          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="mobile-nav-item mobile-logout-btn"
          >
            <span className="mobile-nav-icon">🚪</span>
            <span className="mobile-nav-label">Logout</span>
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        type={dialogConfig.type}
        onConfirm={dialogConfig.onConfirm}
        onCancel={dialogConfig.onCancel}
      />
    </>
  );
};

export default Sidebar;
