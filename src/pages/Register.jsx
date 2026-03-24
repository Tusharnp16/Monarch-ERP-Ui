import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/AxiosConfig";
import "../styles/login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await API.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Username or email may already exist.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-layout">
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

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">
          <h2>Create Account</h2>
          <p className="subtitle">Start managing your business smarter</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                id="userName"
                placeholder=" "
                value={formData.userName}
                onChange={handleChange}
                required
              />
              <label>Username</label>
            </div>

            <div className="form-group">
              <input
                type="email"
                id="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label>Email Address</label>
            </div>

            <div className="form-group">
              <input
                type="password"
                id="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label>Password</label>
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="login-footer">
            Already have an account?
            <Link to="/login"> Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
