import React from "react";
import useFetch from "../api/useFetch"; // Fixed Import

const LoginHistory = () => {
  const API_ENDPOINT = "/userlogs";

  const { data, isLoading, error, reFetch } = useFetch(API_ENDPOINT);

  // Safely extract logs and username based on your API structure
  const logs = data?.data || [];
  const userName = logs.length > 0 ? logs[0].username : "N/A";

  // const fetchLogs = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await API.get(API_ENDPOINT);
  //     const result = response.data;

  //     if (result.success && Array.isArray(result.data)) {
  //       setLogs(result.data);
  //       if (result.data.length > 0) {
  //         setUserName(result.data[0].username);
  //       }
  //     } else {
  //       throw new Error("Invalid data format received");
  //     }
  //   } catch (err) {
  //     console.error("Load failed:", err);
  //     setError("Error loading data. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchLogs();
  // }, []);

  return (
    <>
      <div className="sticky-top bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
        <h1 className="h5 mb-0">
          <i className="fa-solid fa-clock-rotate-left me-2 text-primary"></i>
          Login History
        </h1>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-light text-dark border px-3 py-2">
            User: <span>{isLoading ? "..." : userName}</span>
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={reFetch} // Use the reFetch from our hook
            disabled={isLoading}
          >
            <i
              className={`fa-solid fa-sync ${isLoading ? "fa-spin" : ""} me-1`}
            ></i>
            Refresh
          </button>
        </div>
      </div>

      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 text-primary rounded p-3">
                <i className="fa-solid fa-shield-halved fa-lg"></i>
              </div>
              <div>
                <div className="text-muted small">Total Sessions</div>
                <div className="h4 mb-0 fw-bold">{logs.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom">
            <h6 className="mb-0 fw-bold">Recent Activity</h6>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 text-muted small text-uppercase">
                      No.
                    </th>
                    <th className="text-muted small text-uppercase">
                      Login Timestamp
                    </th>
                    <th className="text-muted small text-uppercase">Status</th>
                    <th className="text-end pe-4 text-muted small text-uppercase">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Loading logs...</span>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-danger">
                        {error}
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, index) => (
                      <LogTableRow key={index} log={log} index={index} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const LogTableRow = ({ log, index }) => {
  const date = new Date(log.loginTime);
  return (
    <tr>
      <td className="ps-4 fw-bold text-muted">{index + 1}</td>
      <td>
        <i className="fa-regular fa-calendar-check text-success me-2"></i>
        {date.toLocaleDateString()} {date.toLocaleTimeString()}
      </td>
      <td>
        <span className="badge rounded-pill bg-success-subtle text-success border">
          Success
        </span>
      </td>
      <td className="text-end pe-4">
        <span className="text-muted small">
          <i className="fa-solid fa-display me-1"></i>{" "}
          {log.loginIp || "0.0.0.0"}
        </span>
      </td>
    </tr>
  );
};

export default LoginHistory;
