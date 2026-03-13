import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/AxiosConfig";
import "../styles/Login.css";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../api/AuthContext";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", credentials);
      const { accessToken, refreshToken } = response.data;

      // localStorage.setItem("accessToken", accessToken);
      // localStorage.setItem("refreshToken", refreshToken);
      // localStorage.setItem("userName", credentials.username);

      login(
        { name: credentials.username },
        {
          accessToken,
          refreshToken,
        },
      );

      navigate("/products");
    } catch (err) {
      if (err.response) {
        if (err.response.status === 500) {
          setError(
            "The servers are having a mid-life crisis. Please be patient.",
          );
        } else {
          setError("Invalid username or password. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      {/* LEFT SIDE - BRANDING */}
      <div className="login-left">
        <div className="overlay" />
        <div className="brand-content">
          <h1>MONARCH ERP</h1>
          <p>Smart. Secure. Scalable.</p>

          <div className="feature-list">
            <div>✔ Inventory & Billing Automation</div>
            <div>✔ Real-Time Analytics</div>
            <div>✔ Secure Role-Based Access</div>
            <div>✔ Cloud-Ready Infrastructure</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                required
                placeholder=" "
                onChange={handleChange}
              />
              <label>Username</label>
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                required
                placeholder=" "
                onChange={handleChange}
              />
              <label>Password</label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {error && (
            <div
              className="error-message"
              style={{ marginBottom: "20px", marginTop: "10px" }}
            >
              {error}
            </div>
          )}

          <div className="login-footer">
            Don’t have an account?
            <Link to="/register"> Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
