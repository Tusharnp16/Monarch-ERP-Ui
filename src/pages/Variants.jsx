import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronsLeft,
  PackageOpen,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import VariantModal from "./VariantModal";
import DeleteModal from "./DeleteModal";
import APICon from "../api/AxiosConfig";
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

  const [validationErrors, setValidationErrors] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // --- Refs ---
  const fileInputRef = useRef(null);

  // --- Data Loading ---
  const loadVariants = async (lastId = 0) => {
    setLoading(true);
    try {
      const res = await APICon.get("/variants", { params: { lastId } });
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleVerify(file);
    }
  };

  const handleVerify = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const res = await APICon.post("/variants/verify", formData);
      if (res.data.success) {
        setIsVerified(true);
        setValidationErrors([]);
      } else {
        setValidationErrors(res.data.errors);
        setIsVerified(false);
        setShowValidationModal(true);
      }
    } catch (err) {
      console.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    setLoading(true);
    try {
      await APICon.post("/variants/upload", formData);
      // Reset state on success
      setSelectedFile(null);
      setIsVerified(false);
      loadVariants();
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
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
      await APICon.delete(`/variants/${idToDelete}`);
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
        <header className="topbar d-flex align-items-center justify-content-between sticky top-0 z-10 bg-white p-4 border-bottom">
          <div>
            <h1 className="h5 mb-0 text-xl font-semibold text-slate-800">
              Product Variants
            </h1>
            <span className="text-muted-small text-slate-500">
              Manage SKU-level details
            </span>
          </div>

          <div className="flex gap-2 align-items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              hidden
            />

            {!isVerified ? (
              <button
                onClick={() => fileInputRef.current.click()}
                className={`btn ${validationErrors.length > 0 ? "btn-outline-danger" : "btn-outline-secondary"} d-flex align-items-center gap-2`}
                disabled={loading}
              >
                <PackageOpen size={18} />
                {loading ? "Verifying..." : "Upload Excel"}
              </button>
            ) : (
              <div className="flex gap-2 animate-in fade-in zoom-in duration-300">
                <div className="flex align-items-center px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm font-medium">
                  <CheckCircle2 size={16} className="me-2" /> File Ready
                </div>
                <button
                  onClick={handleUpload}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  Confirm & Import
                </button>
                <button
                  onClick={() => {
                    setIsVerified(false);
                    setSelectedFile(null);
                  }}
                  className="btn btn-link text-slate-400 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary d-flex align-items-center gap-2 ms-2"
            >
              <Plus size={18} /> Add Variant
            </button>
          </div>
        </header>

        {/* ... Rest of your search and table code ... */}

        {/* --- PROFESSIONAL VALIDATION MODAL --- */}
        {showValidationModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-red-50 border-bottom">
                  <div className="flex align-items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-circle">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h5 className="modal-title font-bold text-red-900">
                        Import Errors Found
                      </h5>
                      <p className="text-sm text-red-700 mb-0">
                        Please fix these issues in your Excel file and upload
                        again.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close shadow-none"
                    onClick={() => setShowValidationModal(false)}
                  ></button>
                </div>
                <div
                  className="modal-body p-0"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-striped mb-0">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="ps-4 py-3 text-xs uppercase text-slate-500 w-24">
                          Row
                        </th>
                        <th className="py-3 text-xs uppercase text-slate-500">
                          Issue Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationErrors.map((err, idx) => (
                        <tr key={idx}>
                          <td className="ps-4 py-3 font-mono text-sm text-slate-600">
                            #{err.row}
                          </td>
                          <td className="py-3 text-sm text-red-600 font-medium">
                            {err.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer bg-slate-50 border-top">
                  <button
                    type="button"
                    className="btn btn-secondary px-4"
                    onClick={() => setShowValidationModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={() => {
                      setShowValidationModal(false);
                      fileInputRef.current.click();
                    }}
                  >
                    Try Re-uploading
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                      Variant Image
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
                        <td className="px-6 py-4">
                          {v.imageUrl ? (
                            <img
                              src={v.imageUrl}
                              alt={v.variantName}
                              className="rounded shadow-sm"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div className="bg-slate-100 rounded flex items-center justify-center w-10 h-10">
                              <PackageOpen
                                size={16}
                                className="text-slate-400"
                              />
                            </div>
                          )}
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
