import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Database,
  Info,
  Calendar,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/AxiosConfig";

const StockLedger = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/ledger");
      setData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to sync stock ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.referenceId?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [data, searchText]);

  // Calculate quick stats for the ledger
  const stats = useMemo(() => {
    return {
      totalTransactions: filteredData.length,
      totalIn: filteredData.reduce(
        (sum, row) => sum + (row.inQuantity || 0),
        0,
      ),
      totalOut: filteredData.reduce(
        (sum, row) => sum + (row.outQuantity || 0),
        0,
      ),
    };
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <Toaster position="bottom-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <History className="mr-3 text-blue-600" /> Stock Ledger
            </h2>
            <p className="text-xs text-gray-500 font-medium ml-9">
              Detailed audit trail of all inventory movements
            </p>
          </div>
          <button
            onClick={fetchData}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Sync Ledger
          </button>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-3 flex items-center">
            <div className="bg-blue-50 text-blue-600 rounded-lg p-2 mr-3 border border-blue-100">
              <Database size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Total Logs
              </p>
              <p className="text-xl font-black text-gray-800 leading-none">
                {stats.totalTransactions}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-t-4 border-green-500 p-3 flex items-center">
            <div className="bg-green-50 text-green-600 rounded-lg p-2 mr-3 border border-green-100">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Total Inflow
              </p>
              <p className="text-xl font-black text-gray-800 leading-none">
                {stats.totalIn}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-t-4 border-red-500 p-3 flex items-center">
            <div className="bg-red-50 text-red-600 rounded-lg p-2 mr-3 border border-red-100">
              <ArrowDownLeft size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Total Outflow
              </p>
              <p className="text-xl font-black text-gray-800 leading-none">
                {stats.totalOut}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-t-4 border-gray-300 p-3 flex items-center opacity-80">
            <Info size={16} className="text-gray-400 mr-2" />
            <p className="text-[11px] text-gray-500 italic leading-tight">
              Audit trail cannot be edited. It reflects every Purchase and Sale
              made.
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 overflow-hidden">
          {/* Search Row */}
          <div className="p-4 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search Reference ID (INV, PUR...)"
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Latest Transactions First
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-2">Type</th>
                  <th className="py-4 px-2">Reference ID</th>
                  <th className="py-4 px-2 text-right">In Qty</th>
                  <th className="py-4 px-6 text-right">Out Qty</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-gray-400 italic">
                          Reading ledger...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((row, idx) => (
                    <tr
                      key={row.stockTransactionId || idx}
                      className="border-t hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center text-gray-700">
                          <Calendar size={14} className="text-blue-500 mr-2" />
                          <span className="font-medium whitespace-nowrap">
                            {row.transactionDate
                              ? new Date(
                                  row.transactionDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border ${
                            row.type === "SALE"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-green-50 text-green-600 border-green-100"
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="bg-gray-100 text-gray-600 font-mono text-[11px] px-2 py-1 rounded border border-gray-200">
                          {row.referenceId}
                        </span>
                      </td>
                      <td
                        className={`py-4 px-2 text-right font-mono font-bold ${row.inQuantity > 0 ? "text-green-600" : "text-gray-300"}`}
                      >
                        {row.inQuantity > 0 ? `+${row.inQuantity}` : "0"}
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-mono font-bold ${row.outQuantity > 0 ? "text-red-600" : "text-gray-300"}`}
                      >
                        {row.outQuantity > 0 ? `-${row.outQuantity}` : "0"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-gray-400 italic font-medium"
                    >
                      No ledger entries found.
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

export default StockLedger;
