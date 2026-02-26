import React, { useState, useEffect, useCallback } from "react";
import "../styles/products.css";

import {
  Plus,
  Search,
  Edit,
  Trash,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await APICon.put(`${API}/${editingProduct.productId}`, formData);
      } else {
        await APICon.post(API, formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      loadProducts(currentPage);
    } catch (err) {
      console.log("Error saving product:", err.response?.data || err.message);
    }
  };

  // http://localhost:8080/api/products

  //   const loadProducts = useCallback(async (page = 0) => {
  //     setLoading(true);
  //     const params = new URLSearchParams({
  //       page: page,
  //       size: 20,
  //       search: filters.search,
  //       startDate: filters.startDate,
  //       endDate: filters.endDate
  //     });

  //     try {
  //       const res = await fetch(`${API}?${params.toString()}`);
  //       const result = await res.json();
  //       if (result.data) {
  //         setProducts(result.data.content);
  //         setTotalElements(result.data.totalElements);
  //         setTotalPages(result.data.totalPages);
  //         setCurrentPage(result.data.number);
  //       }
  //     } catch (err) {
  //       console.error("Fetch error:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, [filters]);

  const loadProducts = useCallback(
    async (page = 0) => {
      setLoading(true);
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
        }
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        if (!err.response) {
          setError(
            "Server is currently unreachable. Please check your connection or try again later.",
          );
        } else {
          setError("Failed to load products due to a server error (500).");
        }
      } finally {
        setLoading(false);
      }
    },
    [filters, API],
  );

  // Trigger load on filter change or page change
  //   useEffect(() => {
  //     const delayDebounceFn = setTimeout(() => {
  //       loadProducts(0);
  //     }, 500); // Debounce search

  //     return () => clearTimeout(delayDebounceFn);
  //   }, [filters.search, loadProducts]);

  //   useEffect(() => {
  //       loadProducts(currentPage);
  //   }, [filters.startDate, filters.endDate, currentPage, loadProducts]);

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

  const promptDelete = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`${API}/${idToDelete}`);
      setShowDeleteModal(false);
      setIdToDelete(null);
      loadProducts(currentPage);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this product?")) {
  //     const res1 = axios.delete(`${API}/${id}`); // Get current version
  //     //    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  //     console.log("Delete response:", res1);
  //     if (res1.ok) loadProducts(currentPage);
  //   }
  // };

  //   const handleFilterChange = (e) => {
  //     const { name, value } = e.target;
  //     setFilters(prev => ({ ...prev, [name]: value }));
  //   };

  return (
    <div>
      <div className="topbar bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
        <h1 className="h5 mb-0">Product Catalog</h1>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          <Plus size={18} className="me-1" /> Add Product
        </button>
      </div>

      <div className="container-fluid py-4">
        {/* Stats & Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card p-3 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Total Products</div>
                  <div className="h3 mb-0 text-primary">{totalElements}</div>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <PackageOpen className="text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card p-3">
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="text-muted-small mb-1">
                    Search Products
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      name="search"
                      className="form-control"
                      placeholder="Search name or code..."
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="text-muted-small mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="text-muted-small mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">#</th>
                    <th>Product Name</th>
                    <th>Item Code</th>
                    <th>Created At</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        Loading...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <div className="text-danger">
                          <PackageOpen size={48} className="mb-3 opacity-50" />
                          <h5 className="fw-bold">Service Unavailable</h5>
                          <p className={error}>{error}</p>
                          <button
                            className="btn btn-sm btn-outline-danger mt-2"
                            onClick={() => loadProducts(currentPage)}
                          >
                            Retry Connection
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((p, i) => (
                      <tr key={p.productId}>
                        <td className="ps-3 text-muted">
                          {currentPage * 20 + (i + 1)}
                        </td>
                        <td>
                          <strong>{p.productName}</strong>
                        </td>
                        <td>
                          <span className="badge border text-dark">
                            {p.itemCode}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {p.createdAt || "N/A"}
                        </td>
                        <td className="text-end pe-3">
                          <button
                            className="btn btn-sm btn-outline-info me-1"
                            onClick={() => {
                              setEditingProduct(p);
                              setShowForm(true);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => promptDelete(p.productId)}
                          >
                            <Trash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center">
            <div className="small text-muted">
              Showing page <strong>{currentPage + 1}</strong> of{" "}
              <strong>{totalPages}</strong>
            </div>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next <ChevronRight size={16} />
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
