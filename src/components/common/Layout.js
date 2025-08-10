import React from "react";
import { useAuth } from '../../context/AuthContext';
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import "./Layout.css";

const Layout = () => {
  const { logout } = useAuth();
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <RightSidebar />
    </div>
  );
};

export default Layout;
