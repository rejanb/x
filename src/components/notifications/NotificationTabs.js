import React from "react";
import "./NotificationTabs.css";

const NotificationTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="notification-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`notification-tab ${
            activeTab === tab.key ? "active" : ""
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="tab-label">{tab.label}</span>
          {tab.count && <span className="tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
};

export default NotificationTabs;
