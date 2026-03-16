import React, { useState, useEffect, memo } from "react";
import {
  Printer,
  RefreshCw,
  History,
  ArrowLeftRight,
  Search,
} from "lucide-react";
import API from "../api/AxiosConfig";
import AdjustmentModal from "./AdjustmentModal";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, low: 0, out: 0 });
  // const navigate = useNavigate();

  useEffect(() => {
    fetchInventory(true);

    const POLLING_INTERVAL = 10000;
    const intervalId = setInterval(() => {
      fetchInventory(false);
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const filtered = inventory.filter((item) => {
      const name = item.variant?.variantName?.toLowerCase() || "";
      const sku = item.variant?.product?.itemCode?.toLowerCase() || "";
      return (
        name.includes(searchTerm.toLowerCase()) ||
        sku.includes(searchTerm.toLowerCase())
      );
    });
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  const fetchInventory = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setIsLoading(true);
      const response = await API.get("/inventory");

      // Axios puts the body in .data automatically
      if (response.data.success) {
        const inventoryData = response.data.data;
        setInventory(inventoryData);
        calculateStats(inventoryData);
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Inventory Levels
            </h1>
            <p className="text-sm text-gray-500">Real-time stock monitoring</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition"
            >
              <Printer size={18} /> Export PDF
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <RefreshCw size={18} /> Manual Adjustment
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
            <StatCard
              title="Items In Stock"
              value={stats.total}
              color="border-green-500"
            />
            <StatCard
              title="Low Stock Alerts"
              value={stats.low}
              color="border-orange-500"
              textColor="text-orange-600"
            />
            <StatCard
              title="Out of Stock"
              value={stats.out}
              color="border-red-500"
              textColor="text-red-600"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by product name or SKU code..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ID</th>
                    <th className="px-6 py-3 font-semibold">Variant / SKU</th>
                    <th className="px-6 py-3 font-semibold">In Stock</th>
                    <th className="px-6 py-3 font-semibold">Available</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item, idx) => (
                      <InventoryRow
                        key={item.inventoryId}
                        item={item}
                        index={idx + 1}
                        // navigate={navigate}
                        color={
                          item.availableQuantity <= 0
                            ? "red"
                            : item.availableQuantity < 10
                              ? "orange"
                              : "green"
                        }
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <AdjustmentModal
            onClose={() => setIsModalOpen(false)}
            inventoryList={inventory}
            refreshData={fetchInventory}
          />
        )}
      </main>
    </div>
  );
};

// Helper Components
const StatCard = memo(
  ({ title, value, color, textColor = "text-gray-900" }) => (
    console.log(`StatCard Rendered: ${title}`),
    (
      <div className={`bg-white p-4 rounded-lg border-l-4 shadow-sm ${color}`}>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
      </div>
    )
  ),
);

const InventoryRow = memo(({ item, index }) => {
  const navigate = useNavigate();

  console.log(
    `InventoryRaw Rendered: ${item.variant?.variantName || "Unknown Variant"}`,
  );
  const avail = item.availableQuantity;
  const variantName = item.variant?.variantName || "Removed";
  const sku = item.variant?.product?.itemCode || "N/A";

  const getStatus = () => {
    if (avail <= 0)
      return {
        label: "Out of Stock",
        color: "bg-red-500",
        text: "text-red-700",
      };
    if (avail < 10)
      return {
        label: "Low Stock",
        color: "bg-orange-500",
        text: "text-orange-700",
      };
    return { label: "In Stock", color: "bg-green-500", text: "text-green-700" };
  };

  const status = getStatus();

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 text-gray-500">{index}</td>
      <td className="px-6 py-4">
        <div className="font-bold text-gray-800">{variantName}</div>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase font-semibold">
          {sku}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-700">{item.availableQuantity}</td>
      <td className="px-6 py-4 font-bold text-gray-900">{item.quantity}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={`w-2.5 h-2.5 rounded-full ${status.color}`}></span>
          {status.label}{" "}
          {status.label === "Low Stock" && (
            <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
              {avail} left
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded text-gray-500"
            title="History"
            onClick={() =>
              navigate(`/inventory/history?id=${item.inventoryId}`)
            }
          >
            <History size={16} />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded text-blue-600"
            title="Movement"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default Inventory;
