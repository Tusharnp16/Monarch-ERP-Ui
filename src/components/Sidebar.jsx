import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import logo from "../assets/logo.png";
import APICon from "../api/AxiosConfig";
import {
  Box,
  Tags,
  Warehouse,
  TrendingUp,
  ShoppingCart,
  BookUser,
  Users,
  FileText,
  History,
  MonitorDot,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await APICon.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  const navItems = [
    { path: "/products", icon: "fas fa-box", label: "Products" },
    { path: "/variants", icon: "fas fa-tags", label: "Variants" },
    { path: "/inventory", icon: "fas fa-warehouse", label: "Inventory" },
    { path: "/stockmaster", icon: "fas fa-chart-line", label: "Stock Master" },
    { path: "/purchase", icon: "fas fa-shopping-cart", label: "Purchase" },
    { path: "/contacts", icon: "fas fa-address-book", label: "Contact" },
    { path: "/customers", icon: "fas fa-user-friends", label: "Customer" },
    { path: "/sales", icon: "fas fa-file-invoice-dollar", label: "Sales" },
    { path: "/salesreport", icon: "fas fa-history", label: "Recent Sales" },
    { path: "/userlogs", icon: "fa-solid fa-display", label: "System Logs" },
  ];

  return (
    // <nav
    //   className={`min-h-screen bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 shadow-2xl z-50 sticky top-10  ${
    //     collapsed ? "w-20" : "w-64"
    //   }`}
    // >
    <nav className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* HEADER SECTION */}
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <img src={logo} alt="Logo" className="brand-logo" />
          <span className="brand-text">MONARCH ERP</span>
        </div>
        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <i
            className={`fas ${collapsed ? "fa-chevron-right" : "fa-bars"}`}
          ></i>
        </button>
      </div>

      {/* NAVIGATION SECTION */}
      <div className="nav-content">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <i className={item.icon}></i>
                <span className="link-text">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* FOOTER SECTION */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="nav-link logout-btn"
          style={{
            background: "none",
            border: "none",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span className="link-text">Logout</span>
        </button>
      </div>
      <div className="sidebar-info">
        {!collapsed && (
          <div className="px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                System Online
              </span>
            </div>
            <p className="text-[9px] text-gray-500 font-mono">
              v2.0.4 Build 2026
            </p>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
