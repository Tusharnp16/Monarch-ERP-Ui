import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, Navigate } from "react-router-dom";
import { Suspense } from "react";
import PageLoader from "./PageLoader";

const AppLayout = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AppLayout;
