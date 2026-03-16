import React, { useEffect, useRef, useReducer } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
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
import { variantReducer, initialState } from "./variantReducer";

const Variants = () => {
  const [state, dispatch] = useReducer(variantReducer, initialState);
  const fileInputRef = useRef(null);

  const {
    variants,
    loading,
    searchTerm,
    isVerified,
    editingVariant,
    isAddModalOpen,
    showDeleteModal,
    idToDelete,
    validationErrors,
    showValidationModal,
    selectedFile,
    hasNext,
    cursor,
    error,
  } = state;

  // --- Data Loading ---
  const loadVariants = async (lastId = 0) => {
    dispatch({ type: "START_LOADING" });
    try {
      const res = await APICon.get("/variants", { params: { lastId } });
      if (res.data.success) {
        dispatch({ type: "FETCH_SUCCESS", payload: res.data.data });
      }
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: "Failed to connect to server.",
      });
    }
  };

  // --- Excel Logic ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch({ type: "SET_SELECTED_FILE", payload: file });
      handleVerify(file);
    }
  };

  const handleVerify = async (file) => {
    dispatch({ type: "START_LOADING" });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await APICon.post("/variants/verify", formData);
      dispatch({
        type: "SET_VERIFIED",
        payload: res.data.success,
        errors: res.data.errors,
      });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: "Verification failed" });
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    dispatch({ type: "START_LOADING" });
    try {
      await APICon.post("/variants/upload", formData);
      dispatch({ type: "SET_SELECTED_FILE", payload: null });
      dispatch({ type: "SET_VERIFIED", payload: false });
      loadVariants();
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: "Upload failed." });
    }
  };

  // --- WebSocket ---
  useEffect(() => {
    const socket = new SockJS("/ws-monarch");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe("/topic/variants", (msg) => {
          dispatch({ type: "WS_UPDATE", payload: JSON.parse(msg.body) });
        });
      },
    });
    stompClient.activate();
    return () => stompClient.deactivate();
  }, []);

  useEffect(() => {
    loadVariants();
  }, []);

  // --- Delete ---
  const handleDelete = async () => {
    try {
      await APICon.delete(`/variants/${idToDelete}`);
      dispatch({ type: "CLOSE_MODALS" });
      loadVariants();
    } catch (err) {
      console.error("Delete failed");
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
                <PackageOpen size={18} />{" "}
                {loading ? "Verifying..." : "Upload Excel"}
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleUpload} className="btn btn-success">
                  Confirm & Import
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: "SET_VERIFIED", payload: false });
                    dispatch({ type: "SET_SELECTED_FILE", payload: null });
                  }}
                  className="btn btn-link text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <button
              onClick={() => dispatch({ type: "OPEN_ADD_MODAL" })}
              className="btn btn-primary d-flex align-items-center gap-2 ms-2"
            >
              <Plus size={18} /> Add Variant
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex justify-between items-center">
            <div className="relative w-2/3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg outline-none"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) =>
                  dispatch({ type: "SET_SEARCH", payload: e.target.value })
                }
              />
            </div>
          </div>

          {/* Table logic remains the same, just ensure you use 'v' from filteredVariants mapping */}
          <div className="card border-0 shadow-sm overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-slate-50 border-bottom">
                  <tr>
                    <th>Id</th>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Attributes</th>
                    <th>MRP</th>
                    <th>Price</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVariants.map((v) => (
                    <tr key={v.variantId}>
                      <td>{v.variantId}</td>
                      <td>{v.product?.itemCode}</td>
                      <td className="font-medium">{v.product?.productName}</td>
                      <td>
                        {v.imageUrl ? (
                          <img
                            src={v.imageUrl}
                            className="rounded w-10 h-10 object-cover"
                            alt=""
                          />
                        ) : (
                          <PackageOpen size={16} className="text-slate-400" />
                        )}
                      </td>
                      <td>{v.variantName}</td>
                      <td>
                        {v.colour} / {v.size}
                      </td>
                      <td>₹{v.mrp?.price || 0}</td>
                      <td className="font-bold">
                        ₹{v.sellingPrice?.price || 0}
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() =>
                            dispatch({ type: "OPEN_EDIT_MODAL", payload: v })
                          }
                          className="btn btn-sm btn-outline-info me-2"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            dispatch({
                              type: "SET_DELETE_TARGET",
                              payload: v.variantId,
                            })
                          }
                          className="btn btn-sm btn-outline-danger"
                        >
                          <Trash2 size={16} />
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

      {/* --- Modals --- */}
      {(isAddModalOpen || editingVariant) && (
        <VariantModal
          variant={editingVariant}
          onClose={() => dispatch({ type: "CLOSE_MODALS" })}
        />
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => dispatch({ type: "CLOSE_MODALS" })}
        onConfirm={handleDelete}
        title="Delete Variant?"
        message="Are you sure?"
      />

      {showValidationModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          {/* Your existing validation modal JSX here, using validationErrors from destructuring */}
          <button onClick={() => dispatch({ type: "CLOSE_MODALS" })}>
            Close
          </button>
        </div>
      )}

      {hasNext && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => loadVariants(cursor)}
            disabled={loading}
            className="btn btn-outline-primary px-8"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Variants;
