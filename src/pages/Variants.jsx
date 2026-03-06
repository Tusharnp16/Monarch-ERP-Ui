import React, { useState, useEffect, useRef } from "react";
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
  // --- State Hooks ---
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursor, setCursor] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // Modal & Error States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [error, setError] = useState(null);

  // --- Refs ---
  const fileInputRef = useRef(null);

  // --- Data Loading ---
  const loadVariants = async (lastId = 0) => {
    setLoading(true);
    try {
      const res = await API.get("/variants", { params: { lastId } });
      const result = res.data;

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
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // --- Excel Import Logic ---
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      await API.post("/variants/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      //     loadVariants();
    } catch (err) {
      console.error("Import failed:", err);
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  // --- WebSocket Setup ---
  useEffect(() => {
    const socket = new SockJS("/ws-monarch");
    const token = localStorage.getItem("accessToken");

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        stompClient.subscribe("/topic/variants", (message) => {
          const updatedVariant = JSON.parse(message.body);
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
      },
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, []);

  useEffect(() => {
    loadVariants();
  }, []);

  // --- Delete Handler ---
  const handleDelete = async () => {
    if (!idToDelete) return;
    try {
      await API.delete(`/variants/${idToDelete}`);
      setShowDeleteModal(false);
      setIdToDelete(null);
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
        <header className="topbar d-flex align-items-center justify-content-between sticky top-0 z-10 bg-white p-4 border-bottom">
          <div>
            <h1 className="h5 mb-0 text-xl font-semibold text-slate-800">
              Product Variants
            </h1>
            <span className="text-muted-small text-slate-500">
              Manage SKU-level details
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
              style={{ display: "none" }}
            />

            <button
              onClick={handleImportClick}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              disabled={loading}
            >
              <PackageOpen size={18} />{" "}
              {loading ? "Processing..." : "Bulk Import"}
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary d-flex align-items-center gap-2"
            >
              <Plus size={18} /> Add Variant
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
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

          {/* Table */}
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
                  {loading && variants.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-12 text-slate-400"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    filteredVariants.map((v) => (
                      <tr
                        key={v.variantId}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">{v.variantId}</td>
                        <td className="px-6 py-4">
                          {v.product?.itemCode || "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {v.product?.productName}
                        </td>
                        <td className="px-6 py-4">{v.variantName}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <span className="badge bg-slate-100 text-slate-600 border">
                              {v.colour}
                            </span>
                            <span className="badge bg-slate-100 text-slate-600 border">
                              {v.size}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">₹{v.mrp?.price || 0}</td>
                        <td className="px-6 py-4 font-bold">
                          ₹{v.sellingPrice?.price || 0}
                        </td>
                        <td className="px-6 py-4 text-end">
                          <button
                            onClick={() => setEditingVariant(v)}
                            className="btn btn-sm btn-outline-info me-2"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setIdToDelete(v.variantId);
                              setShowDeleteModal(true);
                            }}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <Trash2 size={16} />
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
      </main>

      {/* Modals */}
      {(isAddModalOpen || editingVariant) && (
        <VariantModal
          variant={editingVariant}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingVariant(null);
          }}
        />
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Variant?"
        message="Are you sure you want to delete this SKU?"
      />
    </div>
  );
};

export default Variants;
