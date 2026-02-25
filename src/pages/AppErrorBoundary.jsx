import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";

const AppErrorBoundary = () => {
  const error = useRouteError();

  let message = "Something went wrong.";

  if (isRouteErrorResponse(error)) {
    message = `${error.status} - ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center p-4">
        <AlertCircle size={60} className="text-danger mb-3" />
        <h2 className="fw-bold">Oops!</h2>
        <p className="text-muted">{message}</p>

        <Link to="/" className="btn btn-primary mt-3">
          <Home size={18} className="me-2" />
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default AppErrorBoundary;
