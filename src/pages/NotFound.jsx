import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";
import "../styles/NotFound.css";

const NotFound = () => {
  return (
    <div className="nf-wrapper">
      <div className="nf-bg-shape shape1"></div>
      <div className="nf-bg-shape shape2"></div>

      <div className="nf-card">
        <div
          className="nf-icon"
          style={{
            color: "#e53e3e",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <AlertTriangle size={48} />
        </div>

        <h1 className="nf-404">404</h1>
        <h2 className="nf-title">Lost in Space?</h2>

        <p className="nf-text">
          The page you’re looking for doesn’t exist, was moved, or never existed
          in this universe.
        </p>

        <Link to="/" className="nf-btn">
          <Home size={18} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
