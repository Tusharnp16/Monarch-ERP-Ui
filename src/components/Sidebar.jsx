import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import logo from "../assets/logo.png";
import APICon from "../api/AxiosConfig";

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
    { path: "/purchase", icon: "fas fa-shopping-cart", label: "OrderCard" },
    { path: "/contacts", icon: "fas fa-address-book", label: "Contact" },
    { path: "/purchase/report", icon: "fas fa-file-alt", label: "Report" },
    { path: "/customers", icon: "fas fa-user-friends", label: "Customer" },
    {
      path: "/salesinvoice",
      icon: "fas fa-file-invoice-dollar",
      label: "Sales",
    },
    {
      path: "/salesitem/recentitems",
      icon: "fas fa-history",
      label: "Recent Sales",
    },
    { path: "/userlogs", icon: "fa-solid fa-display", label: "System Logs" },
  ];

  const userName = localStorage.getItem("userName");

  return (
    <nav className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
        <i className="fas fa-bars"></i>
      </div>

      <div className="brand-container">
        <div className="brand-box">
          <img
            src={logo}
            alt="Monarch ERP Logo"
            className="brand-logo"
            style={{
              height: "28px",
              marginRight: "8px",
              width: "auto",
              borderRadius: "6px",
              padding: "2px",
              border: "1px solid #ffffff",
            }}
          />
          <span className="brand-text">MONARCH ERP</span>
        </div>
      </div>

      <hr className="divider" />

      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              end={item.path === "/purchase" || item.path === "/salesitem"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <i className={item.icon}></i>
              <span className="link-text">{item.label}</span>
            </NavLink>
          </li>
        ))}

        <hr className="divider" />
        <li className="nav-item">
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
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="version-tag">v2.0 Monarch ERP</div>
      </div>
    </nav>
  );
};

export default Sidebar;
