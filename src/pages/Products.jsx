import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  Database,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import APICon from "../api/AxiosConfig";
import ProductForm from "./ProductForm";
import DeleteModal from "./DeleteModal";

const API = "/products";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });

  const loadProducts = useCallback(
    async (page = 0) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page,
        size: 10,
        search: filters.search,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      try {
        const res = await APICon.get(`${API}?${params.toString()}`);
        const result = res.data;

        if (result.data) {
          setProducts(result.data.content);
          setTotalElements(result.data.totalElements);
          setTotalPages(result.data.totalPages);
          setCurrentPage(result.data.number);
          console.log("Products loaded:", {
            products: result.data.content,
          });
        }
      } catch (err) {
        const errMsg = err.response
          ? "Server error (500). Failed to load products."
          : "Server is currently unreachable.";
        setError(errMsg);
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    const orders = [
      { id: 1, status: "completed", total: 120.5, items: 3 },
      { id: 2, status: "pending", total: 45.0, items: 1 },
      { id: 3, status: "completed", total: 80.0, items: 2 },
      { id: 4, status: "cancelled", total: 200.0, items: 5 },
    ];

    console.log(orders);

    const completedOrders = orders.filter(
      (order) => order.status === "completed",
    );

    console.log(completedOrders);

    const displayData = orders.map((order) => {
      return {
        orderId: `#${order.id}`,
        formattedTotal: `$${order.total.toFixed(2)}`,
        isTaxable: order.total > 100,
      };
    });

    console.log(displayData);

    const totalRevenue = orders
      .filter((order) => order.status === "completed")
      .reduce((acc, order) => acc + order.total, 0);

    console.log(
      "Total Revenue from completed orders:",
      `$${totalRevenue.toFixed(2)}`,
    );
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProducts(currentPage);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filters, currentPage, loadProducts]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(0);
  };

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await APICon.put(`${API}/${editingProduct.productId}`, formData);
        toast.success("Product updated successfully");
      } else {
        await APICon.post(API, formData);
        toast.success("New product added to catalog");
      }
      setShowForm(false);
      setEditingProduct(null);
      loadProducts(currentPage);
    } catch (err) {
      toast.error("Failed to save product");
    }
  };

  const promptDelete = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await APICon.delete(`${API}/${idToDelete}`);
      toast.success("Product removed from catalog");
      setShowDeleteModal(false);
      setIdToDelete(null);
      loadProducts(currentPage);
    } catch (err) {
      toast.error("Delete failed");
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
              <Database className="mr-3 text-blue-600" /> Product Catalog
            </h2>
            <p className="text-xs text-gray-500 font-medium ml-9">
              Manage base products and category item codes
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-8 flex items-center">
            <div className="bg-blue-50 text-blue-600 rounded-lg p-2 mr-3">
              <PackageOpen size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Total Catalog Items
              </p>
              <p className="text-xl font-black text-gray-800 leading-none">
                {totalElements}
              </p>
            </div>
          </div>

          {/* Advanced Filters Card */}
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-gray-400 p-3 flex items-center md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="text"
                  name="search"
                  placeholder="Search name or code..."
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="date"
                  name="startDate"
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleFilterChange}
                />
              </div>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="date"
                  name="endDate"
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Table */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b">
                  <th className="py-4 px-6">No.</th>
                  <th className="py-4 px-2">Product Name</th>
                  <th className="py-4 px-2">Item Code</th>
                  <th className="py-4 px-2">Registration Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <RefreshCw
                          className="animate-spin text-blue-600 mb-2"
                          size={24}
                        />
                        <span className="text-gray-400 italic font-medium">
                          Loading catalog...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center text-red-500">
                        <AlertCircle size={40} className="mb-3 opacity-20" />
                        <p className="font-bold uppercase tracking-tight">
                          Sync Failed
                        </p>
                        <p className="text-xs opacity-70 mb-4">{error}</p>
                        <button
                          onClick={() => loadProducts(currentPage)}
                          className="text-xs bg-red-50 px-4 py-2 rounded-lg border border-red-100 font-bold hover:bg-red-100 transition"
                        >
                          Retry Connection
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((p, i) => (
                    <tr
                      key={p.productId}
                      className="border-t hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="py-4 px-6 font-mono text-gray-400 group-hover:text-blue-600 transition-colors text-xs">
                        {String(currentPage * 10 + (i + 1)).padStart(2, "0")}
                      </td>
                      <td className="py-4 px-2 font-bold text-gray-800">
                        {p.productName}
                      </td>
                      <td className="py-4 px-2">
                        <span className="bg-gray-100 text-gray-600 font-mono text-[10px] px-2 py-1 rounded-md border border-gray-200">
                          {p.itemCode}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-500 text-xs">
                        {p.createdAt || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setShowForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all active:scale-90"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => promptDelete(p.productId)}
                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all active:scale-90"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-gray-50/50 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing Page{" "}
              <span className="text-blue-600">{currentPage + 1}</span> of{" "}
              {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSave}
        initialData={editingProduct}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product?"
        message="Are you sure? This will permanently remove the product from the catalog."
      />
    </div>
  );
};

export default Products;
