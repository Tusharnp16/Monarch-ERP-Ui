import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Edit3,
  AlertTriangle,
  X,
  Package,
  Database,
  Info,
  Layers,
  Calendar,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/AxiosConfig";

const StockMaster = () => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  useEffect(() => {
    fetchStocks();

    let isMounted = true;
    let timeoutId;

    const longPollStocks = async () => {
      try {
        const response = await API.get("/stockmaster/poll");
        if (isMounted && response.status === 200 && response.data?.success) {
          setStocks(response.data.data);
        }
      } catch (err) {
        console.error("Polling error", err);
      } finally {
        if (isMounted) {
          // Schedule the next poll
          timeoutId = setTimeout(longPollStocks, 30000);
        }
      }
    };

    longPollStocks();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await API.get("/stockmaster");
      if (response.data.success) setStocks(response.data.data);
    } catch (err) {
      toast.error("Failed to fetch current stock");
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = useMemo(() => {
    return (stocks ?? []).filter(
      (s) =>
        s.batchNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.variant?.product?.productName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [stocks, searchTerm]);

  const totalQuantity = useMemo(
    () => (stocks ?? []).reduce((sum, s) => sum + (s.quantity || 0), 0),
    [stocks],
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const mrp = parseFloat(formData.get("mrp"));
    const sellingPrice = parseFloat(formData.get("sellingPrice"));

    if (sellingPrice > mrp) {
      toast.error("Selling price cannot exceed MRP");
      return;
    }

    const params = new URLSearchParams();
    params.append("stockMasterId", formData.get("stockMasterId"));
    params.append("mrp", formData.get("mrp"));
    params.append("sellingPrice", formData.get("sellingPrice"));

    try {
      const response = await API.post("/stockmaster/update", params);
      if (response.data.success) {
        toast.success("Stock pricing updated");
        setIsModalOpen(false);
        fetchStocks();
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <Toaster position="bottom-right" />
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Database className="mr-3 text-blue-600" /> Stock Master
            </h2>
            <p className="text-xs text-gray-500 font-medium ml-9">
              Manage batches, pricing, and live quantities
            </p>
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-3 flex items-center">
            <div className="bg-blue-50 text-blue-600 rounded-lg p-2 mr-3">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Total Quantity
              </p>
              <p className="text-xl font-black text-gray-800 leading-none">
                {totalQuantity}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-t-4 border-gray-300 p-3 flex items-center md:col-span-3 opacity-80">
            <Info size={16} className="text-gray-400 mr-2" />
            <p className="text-[11px] text-gray-500 italic leading-tight">
              Pricing updates made here will reflect immediately in the Sales
              Invoice module. Batch numbers are read-only to maintain audit
              integrity.
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
                placeholder="Search by Batch No or Product Name..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Unique Batches:{" "}
              <span className="text-blue-600">{filteredStocks.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b">
                  <th className="py-4 px-6">No.</th>
                  <th className="py-4 px-2">Product & Variant</th>
                  <th className="py-4 px-2">Batch No</th>
                  <th className="py-4 px-2">Quantity</th>
                  <th className="py-4 px-2">MRP</th>
                  <th className="py-4 px-2">Sell</th>
                  <th className="py-4 px-2">Expiry</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-gray-400 italic">
                          Syncing inventory...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((s, idx) => (
                    <tr
                      key={s.stockMasterId}
                      className="border-t hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="py-4 px-6 font-mono text-gray-400 group-hover:text-blue-600 transition-colors">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="py-4 px-2">
                        {s.variant ? (
                          <div>
                            <p className="font-bold text-gray-800">
                              {s.variant.product.productName}
                            </p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">
                              {s.variant.variantName}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase">
                            <AlertTriangle size={12} /> Deleted Product
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2 font-mono text-xs text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                          {s.batchNo || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                            s.quantity < 10
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-green-50 text-green-600 border-green-100"
                          }`}
                        >
                          {s.quantity} UNITS
                        </span>
                      </td>
                      <td className="py-4 px-2 font-mono text-xs">
                        <div className="flex flex-col">
                          <span className="text-gray-400 ">
                            ₹{s.mrp?.price || 0}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-blue-600 font-bold">
                          ₹{s.sellingPrice?.price || 0}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center text-gray-500 text-xs">
                          <Calendar size={12} className="mr-1 opacity-50" />
                          {s.expiryDate || "No Expiry"}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setEditingStock(s);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all active:scale-90"
                        >
                          <Edit3 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border-t-8 border-blue-600">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">
                      Edit Batch Pricing
                    </h3>
                    <p className="text-xs text-gray-400 font-medium italic">
                      Updating SID: {editingStock?.stockMasterId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="hidden"
                  name="stockMasterId"
                  value={editingStock?.stockMasterId}
                />

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Batch Reference
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editingStock?.batchNo}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Max Retail Price (MRP)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="mrp"
                        step="0.01"
                        defaultValue={editingStock?.mrp?.price}
                        className="w-full pl-7 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Selling Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="sellingPrice"
                        step="0.01"
                        defaultValue={editingStock?.sellingPrice?.price}
                        className="w-full pl-7 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-sm font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                  >
                    Update Price
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMaster;
