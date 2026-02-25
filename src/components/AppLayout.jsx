import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, Navigate } from "react-router-dom";

const AppLayout = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
