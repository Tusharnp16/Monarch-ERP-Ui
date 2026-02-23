import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import logo from '../assets/logo.png';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("accessToken");
      navigate('/auth/login');
    }
  };

  const navItems = [
    { path: '/products', icon: 'fas fa-box', label: 'Products' },
    { path: '/variants', icon: 'fas fa-tags', label: 'Variants' },
    { path: '/inventory', icon: 'fas fa-warehouse', label: 'Inventory' },
    { path: '/stockmaster', icon: 'fas fa-chart-line', label: 'Stock Master' },
    { path: '/purchase', icon: 'fas fa-shopping-cart', label: 'Purchase' },
    { path: '/contacts', icon: 'fas fa-address-book', label: 'Contact' },
    { path: '/purchase/report', icon: 'fas fa-file-alt', label: 'Report' },
    { path: '/customers', icon: 'fas fa-user-friends', label: 'Customer' },
    { path: '/salesinvoice', icon: 'fas fa-file-invoice-dollar', label: 'Sales' },
    { path: '/salesitem/recentitems', icon: 'fas fa-history', label: 'Recent Sales' },
    { path: '/userlogs', icon: 'fa-solid fa-display', label: 'System Logs' },
  ];

  return (
    <nav className="sidebar">
      <div className="brand-container">
        <div className="brand-box">
            <img src={logo} alt="Monarch ERP Logo" className="brand-logo" style={{
            height: "28px",
            width: "auto",
            borderRadius: "6px",
            background: "#5e5252",
            padding: "2px",
            border: "1px solid #121212",
            }}/>
          <span className="brand-text">MONARCH ERP</span>
        </div>
      </div>

        <hr className="divider" />

      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink 
              to={item.path} 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <i className={item.icon}></i> {item.label}
            </NavLink>
          </li>
        ))}

        <hr className="divider" />

        <li className="nav-item">
          <button onClick={handleLogout} className="nav-link logout-btn" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="version-tag">v1.0 Monarch ERP</div>
      </div>
    </nav>
  );
};

export default Sidebar;