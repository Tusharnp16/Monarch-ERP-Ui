import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronsLeft,
  PackageOpen,
} from "lucide-react";
import VariantModal from "./VariantModal";
import DeleteModal from "./DeleteModal";
import API from "../api/AxiosConfig";
import "../styles/products.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const Variants = () => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursor, setCursor] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [error, setError] = useState(null);

  const loadVariants = async (lastId = 0) => {
    setLoading(true);
    try {
      const res = await API.get("/variants", { params: { lastId } });
      const result = res.data;

      // if (result.success) {
      //   const newBatch = result.data.variants;

      //   if (lastId === 0) {
      //     setVariants(newBatch);
      //   } else {
      //     setVariants((prev) => [...prev, ...newBatch]);
      //   }

      //   setHasNext(result.data.hasNext);
      //   if (newBatch.length > 0) {
      //     setCursor(newBatch[newBatch.length - 1].variantId);
      //   }
      // }

      if (result.success) {
        const newBatch = result.data.variants;

        setVariants(newBatch);

        setHasNext(result.data.hasNext);
        if (newBatch.length > 0) {
          setCursor(newBatch[newBatch.length - 1].variantId);
        }
      }
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = new SockJS("/ws-monarch");

    const token = localStorage.getItem("accessToken");
    console.log("Attempting WebSocket connection with token:", token);

    const stompClient = new Client({
      webSocketFactory: () => socket,

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      onConnect: () => {
        console.log("Connected to WebSocket");

        stompClient.subscribe("/topic/variants", (message) => {
          const updatedVariant = JSON.parse(message.body);

          console.log("WebSocket Received Data:", updatedVariant);

          setVariants((prev) => {
            const index = prev.findIndex(
              (v) => v.variantId === updatedVariant.variantId,
            );
            if (index !== -1) {
              const newList = [...prev];
              newList[index] = updatedVariant;
              return newList;
            }
            return [updatedVariant, ...prev];
          });
        });

        // stompClient.subscribe("/topic/admin-alerts", (message) => {
        //   const adminMessage = message.body;
        //   console.log(adminMessage);

        //   console.log("ALERT:", adminMessage);

        //   alert(adminMessage);
        // });
      },
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, []);

  useEffect(() => {
    loadVariants();
  }, []);

  const handleDelete = async () => {
    if (!idToDelete) return;
    try {
      await API.delete(`/variants/${idToDelete}`);
      setShowDeleteModal(false);
      setIdToDelete(null);
      // loadVariants(0);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredVariants = variants.filter(
    (v) =>
      v.variantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="topbar d-flex align-items-center justify-content-between sticky top-0 z-10 bg-white">
          <div>
            <h1 className="h5 mb-0 text-xl font-semibold text-slate-800">
              Product Variants
            </h1>
            <span className="text-muted-small text-slate-500">
              Manage SKU-level details
            </span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <Plus size={18} /> Add Variant
          </button>
        </header>

        <div className="p-6">
          {/* Filters Card */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search variants..."
                  className="form-control ps-10 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="card border-0 shadow-sm overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-slate-50 border-bottom">
                  <tr>
                    <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs">
                      Id
                    </th>
                    <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs">
                      Parent Product
                    </th>
                    <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs">
                      Variant Name
                    </th>
                    <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs">
                      Attributes
                    </th>
                    <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs">
                      MRP
                    </th>
                    <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs">
                      Selling Price
                    </th>
                    <th className="px-6 py-4 text-end text-slate-600 font-semibold uppercase text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-12 text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="loading-spinner"></span>
                          Loading variants...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="text-danger">
                          <PackageOpen size={48} className="mb-3 opacity-50" />
                          <h5 className="fw-bold">Service Unavailable</h5>
                          <p className={error}>{error}</p>
                          <button
                            className="btn btn-sm btn-outline-danger mt-2"
                            onClick={() => loadVariants()}
                          >
                            Retry Connection
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVariants.length > 0 ? (
                    filteredVariants.map((v) => (
                      <tr
                        key={v.variantId}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <span className="badge text-primary bg-blue-50">
                            {v.variantId || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge text-primary bg-blue-50">
                            {v.product?.itemCode || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 truncate max-w-[200px]">
                          {v.product?.productName || "No Product"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {v.variantName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <span className="badge bg-slate-100 text-slate-600 border-slate-200 border">
                              {v.colour}
                            </span>
                            <span className="badge bg-slate-100 text-slate-600 border-slate-200 border">
                              {v.size}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          ₹{v.mrp?.price || 0}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          ₹{v.sellingPrice?.price || 0}
                        </td>
                        <td className="px-6 py-4 text-end">
                          <button
                            onClick={() => setEditingVariant(v)}
                            className="btn btn-sm btn-outline-info me-2 hover:bg-sky-50"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setIdToDelete(v.variantId);
                              setShowDeleteModal(true);
                            }}
                            className="btn btn-sm btn-outline-danger hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-12 text-slate-400"
                      >
                        No variants found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="card-footer p-4 d-flex justify-content-between align-items-center bg-white border-top">
              <button
                disabled={cursor === 0}
                onClick={() => loadVariants(0)}
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
              >
                <ChevronsLeft size={16} /> First Page
              </button>

              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                End of Results
              </div>

              {hasNext && (
                <button
                  onClick={() => loadVariants(cursor)}
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {(isAddModalOpen || editingVariant) && (
        <VariantModal
          variant={editingVariant}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingVariant(null);
          }}
          // onRefresh={() => loadVariants(0)}
        />
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setIdToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Variant?"
        message="Are you sure? This will permanently remove the variant from the catalog."
      />
    </div>
  );
};

export default Variants;
