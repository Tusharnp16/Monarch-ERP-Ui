import React, { useEffect, useRef, useReducer } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  PackageOpen,
  X,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import VariantModal from "./VariantModal";
import DeleteModal from "./DeleteModal";
import APICon from "../api/AxiosConfig";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { variantReducer, initialState } from "./variantReducer";
import "../styles/products.css";

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
      toast.error("Failed to connect to server.");
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
      if (res.data.success) toast.success("Excel data verified!");
      else toast.error("Validation failed. Check errors.");
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    dispatch({ type: "START_LOADING" });
    try {
      await APICon.post("/variants/upload", formData);
      toast.success("Inventory imported successfully");
      dispatch({ type: "SET_SELECTED_FILE", payload: null });
      dispatch({ type: "SET_VERIFIED", payload: false });
      loadVariants();
    } catch (err) {
      toast.error("Upload failed.");
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

  const handleDelete = async () => {
    try {
      await APICon.delete(`/variants/${idToDelete}`);
      toast.success("Variant removed");
      dispatch({ type: "CLOSE_MODALS" });
      loadVariants();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredVariants = variants.filter(
    (v) =>
      v.variantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <Toaster position="bottom-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Database className="mr-3 text-blue-600" /> Product Variants
            </h2>
            <p className="text-xs text-gray-500 font-medium ml-9">
              SKU-level pricing, attributes, and image management
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
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
                disabled={loading}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition shadow-sm border ${
                  validationErrors.length > 0
                    ? "border-red-600 text-red-600 bg-red-50"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileSpreadsheet size={18} />
                {loading ? "Verifying..." : "Import Excel"}
              </button>
            ) : (
              <div className="flex gap-2 items-center bg-green-50 p-1 pr-3 rounded-lg border border-green-200">
                <button
                  onClick={handleUpload}
                  className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-bold hover:bg-green-700 transition"
                >
                  Confirm & Import
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: "SET_VERIFIED", payload: false });
                    dispatch({ type: "SET_SELECTED_FILE", payload: null });
                  }}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <button
              onClick={() => dispatch({ type: "OPEN_ADD_MODAL" })}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <Plus size={18} /> New Variant
            </button>
          </div>
        </div>

        {/* Search and Table Container */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by variant name or product..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) =>
                  dispatch({ type: "SET_SEARCH", payload: e.target.value })
                }
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border">
              Items:{" "}
              <span className="text-blue-600">{filteredVariants.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-2">Image</th>
                  <th className="py-4 px-2">Product & SKU</th>
                  <th className="py-4 px-2">Variant / Specs</th>
                  <th className="py-4 px-2 text-right">Pricing</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && variants.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-20 text-center text-gray-400 italic"
                    >
                      Syncing SKUs...
                    </td>
                  </tr>
                ) : (
                  filteredVariants.map((v) => (
                    <tr
                      key={v.variantId}
                      className="border-t hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="py-4 px-6 font-mono text-gray-400 group-hover:text-blue-600 transition-colors text-xs">
                        #{v.variantId}
                      </td>
                      <td className="py-4 px-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                          {v.imageUrl ? (
                            <img
                              src={v.imageUrl}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <ImageIcon size={16} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <p className="font-bold text-gray-800 leading-tight">
                          {v.product?.productName}
                        </p>
                        <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">
                          {v.product?.itemCode}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <p className="font-semibold text-gray-700">
                          {v.variantName}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                          {v.colour || "No Color"} / {v.size || "No Size"}
                        </p>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{v.mrp?.price || 0}
                          </span>
                          <span className="font-mono font-bold text-gray-800">
                            ₹{v.sellingPrice?.price || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() =>
                              dispatch({ type: "OPEN_EDIT_MODAL", payload: v })
                            }
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
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
                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
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
        </div>

        {hasNext && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => loadVariants(cursor)}
              disabled={loading}
              className="px-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More Variants"}
            </button>
          </div>
        )}
      </div>

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
        message="This will remove this SKU and its history. This action cannot be undone."
      />

      {/* Validation Errors Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-t-8 border-red-500">
            <div className="p-6 bg-red-50 flex items-center gap-4">
              <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-black text-gray-800 text-lg uppercase">
                  Import Errors Detected
                </h3>
                <p className="text-xs text-red-500 font-medium">
                  Please correct the following rows in your Excel file
                </p>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="text-gray-400 uppercase tracking-widest border-b">
                  <tr>
                    <th className="pb-2">Row</th>
                    <th className="pb-2">Error Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {validationErrors.map((err, i) => (
                    <tr key={i}>
                      <td className="py-2 font-bold text-gray-500">
                        #{err.row}
                      </td>
                      <td className="py-2 text-red-600">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => dispatch({ type: "CLOSE_MODALS" })}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Variants;
