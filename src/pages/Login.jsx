import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/AxiosConfig";
import "./login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post("/auth/login", credentials);
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      document.cookie = `accessToken=${accessToken}; path=/; Max-Age=${60 * 60}; SameSite=Strict`;

      navigate("/products");
    } catch (err) {
      setError("Invalid username or password.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-logo">MONARCH ERP</div>
        <div className="brand-subtitle">
          Enterprise Resource Planning Portal
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input
              type="text"
              id="username"
              required
              className="login-input"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              id="password"
              required
              className="login-input"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="login-button">
            Sign In to Dashboard
          </button>
        </form>

        <div className="login-footer">
          Didn't have account!! <Link to="/auth/register"> Register Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
