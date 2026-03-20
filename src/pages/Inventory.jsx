import React, { useState, useEffect, memo, useMemo } from "react";
import {
  Printer,
  RefreshCw,
  History,
  ArrowLeftRight,
  Search,
  Package,
  AlertCircle,
  XCircle,
  Database,
  Info,
} from "lucide-react";
import API from "../api/AxiosConfig";
import AdjustmentModal from "./AdjustmentModal";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, low: 0, out: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory(true);

    const POLLING_INTERVAL = 15000; // Increased slightly for better performance
    const intervalId = setInterval(() => {
      fetchInventory(false);
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const fetchInventory = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setIsLoading(true);
      const response = await API.get("/inventory");

      if (response.data.success) {
        const inventoryData = response.data.data;
        setInventory(inventoryData);
        calculateStats(inventoryData);
      }
    } catch (error) {
      if (isInitialLoad) toast.error("Failed to sync inventory levels");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.filter((i) => i.availableQuantity >= 10).length,
      low: data.filter(
        (i) => i.availableQuantity > 0 && i.availableQuantity < 10,
      ).length,
      out: data.filter((i) => i.availableQuantity <= 0).length,
    });
  };

  const filteredInventory = useMemo(() => {
    return (inventory || []).filter((item) => {
      const name = item.variant?.variantName?.toLowerCase() || "";
      const sku = item.variant?.product?.itemCode?.toLowerCase() || "";
      return (
        name.includes(searchTerm.toLowerCase()) ||
        sku.includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm, inventory]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <Toaster position="bottom-right" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Database className="mr-3 text-blue-600" /> Inventory Levels
            </h2>
            <p className="text-xs text-gray-500 font-medium ml-9 italic">
              Real-time stock monitoring & adjustments
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition shadow-sm"
            >
              <Printer size={18} /> Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <RefreshCw size={18} /> Adjust Stock
            </button>
          </div>
        </div>

        {/* Compact Stats Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Healthy Stock"
            value={stats.total}
            color="border-green-500"
            icon={<Package size={20} className="text-green-600" />}
          />
          <StatCard
            title="Low Stock Alerts"
            value={stats.low}
            color="border-orange-500"
            icon={<AlertCircle size={20} className="text-orange-600" />}
          />
          <StatCard
            title="Out of Stock"
            value={stats.out}
            color="border-red-500"
            icon={<XCircle size={20} className="text-red-600" />}
          />
        </div>

        {/* Main Table Card */}
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
                placeholder="Search by product name or SKU code..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Info size={14} /> Tracking {filteredInventory.length} Variants
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b">
                  <th className="py-4 px-6">No.</th>
                  <th className="py-4 px-2">Variant Details</th>
                  <th className="py-4 px-2">Warehouse Qty</th>
                  <th className="py-4 px-2">Physical Qty</th>
                  <th className="py-4 px-2">Status</th>
                  <th className="py-4 px-6 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-gray-400 italic font-medium">
                          Synchronizing levels...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredInventory.length > 0 ? (
                  filteredInventory.map((item, idx) => (
                    <InventoryRow
                      key={item.inventoryId}
                      item={item}
                      index={idx + 1}
                      navigate={navigate}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-20 text-center text-gray-400 italic"
                    >
                      No matching inventory items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <AdjustmentModal
            onClose={() => setIsModalOpen(false)}
            inventoryList={inventory}
            refreshData={fetchInventory}
          />
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatCard = memo(({ title, value, color, icon }) => (
  <div
    className={`bg-white p-3 rounded-xl border-t-4 ${color} shadow-sm flex items-center transition-transform hover:scale-[1.02]`}
  >
    <div className="bg-gray-50 rounded-lg p-2 mr-3 border border-gray-100">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
        {title}
      </p>
      <p className="text-xl font-black text-gray-800 leading-none">{value}</p>
    </div>
  </div>
));

const InventoryRow = memo(({ item, index, navigate }) => {
  const avail = item.availableQuantity;
  const variantName = item.variant?.variantName || "Removed";
  const sku = item.variant?.product?.itemCode || "N/A";

  const getStatus = () => {
    if (avail <= 0)
      return {
        label: "OUT",
        color: "bg-red-50 text-red-600 border-red-100",
        dot: "bg-red-500",
      };
    if (avail < 10)
      return {
        label: "LOW",
        color: "bg-orange-50 text-orange-600 border-orange-100",
        dot: "bg-orange-500",
      };
    return {
      label: "STABLE",
      color: "bg-green-50 text-green-600 border-green-100",
      dot: "bg-green-500",
    };
  };

  const status = getStatus();

  return (
    <tr className="border-t hover:bg-blue-50/30 transition-colors group">
      <td className="py-4 px-6 font-mono text-gray-400 group-hover:text-blue-600 transition-colors text-xs">
        {String(index).padStart(2, "0")}
      </td>
      <td className="py-4 px-2">
        <div className="font-bold text-gray-800 leading-tight">
          {variantName}
        </div>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black font-mono mt-1 inline-block border border-blue-100">
          {sku}
        </span>
      </td>
      <td className="py-4 px-2 font-mono text-gray-600 font-bold">
        {item.availableQuantity}
      </td>
      <td className="py-4 px-2 font-mono text-gray-400">{item.quantity}</td>
      <td className="py-4 px-2">
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-black tracking-widest ${status.color}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`}
          ></span>
          {status.label}
          {avail < 10 && avail > 0 && (
            <span className="ml-1 opacity-70">({avail} Left)</span>
          )}
        </div>
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex justify-end gap-1">
          <button
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-blue-600 transition-all active:scale-90 border border-transparent hover:border-gray-200"
            title="View History"
            onClick={() =>
              navigate(`/inventory/history?id=${item.inventoryId}`)
            }
          >
            <History size={16} />
          </button>
          <button
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-green-600 transition-all active:scale-90 border border-transparent hover:border-gray-200"
            title="Movement Log"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default Inventory;
