import React, { useState, useEffect, useMemo } from "react";
import PurchaseTable from "./PurchaseTable";
import CreatePurchaseModal from "./CreatePurchaseModal";
import {
  PlusCircle,
  FileText,
  ShoppingBag,
  Database,
  Info,
  RefreshCw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/AxiosConfig";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await API.get("/purchase");
      if (res.data.success) {
        setPurchases(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to sync procurement records");
      console.error("Error fetching purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Calculate total procurement value for the stats card
  const totalProcurementValue = useMemo(() => {
    return purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }, [purchases]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <Toaster position="bottom-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <ShoppingBag className="mr-3 text-blue-600" /> Purchases
            </h2>
            <p className="text-xs text-gray-500 font-medium ml-9">
              Procurement tracking and supplier invoice management
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95"
          >
            <PlusCircle size={18} /> Create Bill
          </button>
        </div>

        {/* Compact Stats Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-3 flex items-center">
            <div className="bg-blue-50 text-blue-600 rounded-lg p-2 mr-3 border border-blue-100">
              <Database size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Total Purchase Value
              </p>
              <p className="text-xl font-black text-gray-800 leading-none font-mono">
                ₹{totalProcurementValue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-t-4 border-gray-300 p-3 flex items-center md:col-span-3 opacity-80">
            <div className="bg-gray-100 rounded-lg p-2 mr-3">
              <Info size={16} className="text-gray-400" />
            </div>
            <p className="text-[11px] text-gray-500 italic leading-tight">
              Manage incoming stock through purchase bills. Adjustments made
              here will directly affect stock master quantities and average
              pricing.
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <FileText size={14} className="mr-2 text-blue-600" /> Recent
              Invoices
            </h6>
            <button
              onClick={fetchPurchases}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-blue-600 transition-all active:scale-90 border border-transparent hover:border-gray-200"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading && purchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw
                  className="animate-spin text-blue-600 mb-2"
                  size={32}
                />
                <span className="text-gray-400 italic font-medium">
                  Loading procurement data...
                </span>
              </div>
            ) : (
              <PurchaseTable purchases={purchases} loading={loading} />
            )}
          </div>
        </div>
      </div>

      {/* Modal - Ensured consistent with system portals */}
      {showModal && (
        <CreatePurchaseModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchPurchases();
            toast.success("Purchase bill created successfully");
          }}
        />
      )}
    </div>
  );
};

export default Purchases;
