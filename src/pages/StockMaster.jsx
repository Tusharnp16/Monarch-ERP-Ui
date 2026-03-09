import React, { useState, useEffect, useMemo } from "react";
import { Search, Edit3, AlertTriangle, X } from "lucide-react";
import API from "../api/AxiosConfig";

const StockMaster = () => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await API.get("/stockmaster");
      if (response.data.success) {
        setStocks(response.data.data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = useMemo(() => {
    return stocks.filter(
      (s) =>
        s.batchNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.variant?.product?.productName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [stocks, searchTerm]);

  const totalQuantity = useMemo(
    () => stocks.reduce((sum, s) => sum + (s.quantity || 0), 0),
    [stocks],
  );
  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const mrp = parseFloat(formData.get("mrp"));
    const sellingPrice = parseFloat(formData.get("sellingPrice"));

    if (sellingPrice > mrp) {
      alert("Selling price cannot exceed MRP");
      return;
    }

    const updateData = {
      stockMasterId: formData.get("stockMasterId"),
      mrp: mrp,
      sellingPrice: sellingPrice,
    };

    try {
      const response = await API.post("/stockmaster/update", updateData);

      if (response.data.success) {
        setIsModalOpen(false);
        fetchStocks();
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">Stock Master</h1>
          <p className="text-sm text-gray-500">
            Manage batches, pricing, and quantities
          </p>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats & Search */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Total Quantity
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {totalQuantity}
              </p>
            </div>
            <div className="md:col-span-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Batch No or Product..."
                className="w-full outline-none text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      SID
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Product
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Batch No
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      MRP
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Selling
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Expiry
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStocks.map((s, idx) => (
                    <tr
                      key={s.stockMasterId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-4">
                        {s.variant ? (
                          <div className="text-sm">
                            <span className="text-gray-900">
                              {s.variant.product.productName}
                            </span>
                            <span className="ml-1 font-bold text-gray-700">
                              ({s.variant.variantName})
                            </span>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 text-xs">
                            <AlertTriangle size={14} /> Removed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {s.batchNo || "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${s.quantity < 10 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {s.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        ₹{s.mrp?.price || 0}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        ₹{s.sellingPrice?.price || 0}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {s.expiryDate || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => {
                            setEditingStock(s);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Edit3 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Edit3 size={18} /> Edit Stock
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <input
                type="hidden"
                name="stockMasterId"
                value={editingStock?.stockMasterId}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch No
                </label>
                <input
                  type="text"
                  readOnly
                  value={editingStock?.batchNo}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MRP
                  </label>
                  <input
                    type="number"
                    name="mrp"
                    step="0.01"
                    defaultValue={editingStock?.mrp?.price}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    step="0.01"
                    defaultValue={editingStock?.sellingPrice?.price}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-md"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMaster;
