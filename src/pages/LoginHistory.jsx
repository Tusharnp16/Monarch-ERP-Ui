import React from "react";
import useFetch from "../api/useFetch";
import {
  History,
  RefreshCcw,
  ShieldCheck,
  Calendar,
  Monitor,
  User as UserIcon,
  CheckCircle2,
  Activity,
} from "lucide-react";

const LoginHistory = () => {
  const API_ENDPOINT = "/userlogs";
  const { data, isLoading, error, reFetch } = useFetch(API_ENDPOINT);

  const logs = data?.data || [];
  const userName = logs.length > 0 ? logs[0].username : "N/A";

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <History className="mr-3 text-blue-600" /> Login History
          </h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex-grow md:flex-grow-0">
              <UserIcon size={16} className="text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                User:{" "}
                <span className="text-blue-600 font-bold">
                  {isLoading ? "..." : userName}
                </span>
              </span>
            </div>
            <button
              onClick={reFetch}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center transition shadow-lg disabled:opacity-50"
            >
              <RefreshCcw
                size={16}
                className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Row - Compact Version */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Sessions Card */}
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-3 flex items-center transition-transform hover:scale-[1.02]">
            <div className="bg-blue-50 text-blue-600 rounded-lg p-3  mr-3">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Total Sessions
              </p>
              <p className="text-xl font-black text-gray-800 leading-none">
                {logs.length}
              </p>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-3 flex items-center transition-transform hover:scale-[1.02]">
            <div className="bg-green-50 text-green-600 rounded-lg p-3 mr-3">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Account Status
              </p>
              <p className="text-sm font-bold text-green-600 leading-none">
                Active / Secure
              </p>
            </div>
          </div>

          {/* Info Card - Slimmed down */}
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-3 flex items-center opacity-80">
            <p className="text-[11px] text-gray-500 italic leading-tight">
              Audit logs are retained for security compliance and IP
              verification.
            </p>
          </div>
        </div>

        {/* Full Width Table Section */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
            <span className="font-bold text-gray-700 uppercase text-xs tracking-widest">
              Recent Activity Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b">
                  <th className="py-4 px-6">No.</th>
                  <th className="py-4 px-2">Login Timestamp</th>
                  <th className="py-4 px-2">Status</th>
                  <th className="py-4 px-6 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-20">
                      <RefreshCcw
                        className="animate-spin text-blue-600 mx-auto mb-2"
                        size={32}
                      />
                      <span className="text-gray-400 italic">
                        Synchronizing logs...
                      </span>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log, index) => (
                    <LogTableRow key={index} log={log} index={index} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-20 text-gray-400">
                      No activity history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogTableRow = ({ log, index }) => {
  const date = new Date(log.loginTime);
  return (
    <tr className="border-t hover:bg-blue-50/30 transition-colors group">
      <td className="py-4 px-6 font-mono text-gray-400 group-hover:text-blue-600 transition-colors">
        {String(index + 1).padStart(2, "0")}
      </td>
      <td className="py-4 px-2">
        <div className="flex items-center text-gray-700">
          <Calendar size={14} className="text-blue-500 mr-2" />
          <span className="font-medium">{date.toLocaleDateString()}</span>
          <span className="text-gray-400 ml-2 font-mono">
            {date.toLocaleTimeString()}
          </span>
        </div>
      </td>
      <td className="py-4 px-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
          <CheckCircle2 size={12} className="mr-1" /> Success
        </span>
      </td>
      <td className="py-4 px-6 text-right">
        <div className="inline-flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-md font-mono text-xs border border-gray-200">
          <Monitor size={12} className="mr-2 opacity-50" />
          {log.loginIp || "0.0.0.0"}
        </div>
      </td>
    </tr>
  );
};

export default LoginHistory;
