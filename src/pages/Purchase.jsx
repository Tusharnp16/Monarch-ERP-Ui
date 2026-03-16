import React, { useState, useEffect } from "react";
import PurchaseTable from "./PurchaseTable";
import CreatePurchaseModal from "./CreatePurchaseModal";
import { PlusCircle, FileText } from "lucide-react";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      const res = await fetch("/api/purchase");
      const response = await res.json();
      if (response.success) setPurchases(response.data);
    } catch (err) {
      console.error("Error fetching purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar would be a separate component */}
      <main className="flex-grow-1">
        <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center sticky-top">
          <div>
            <h1 className="h5 mb-0">Purchases</h1>
            <small className="text-primary">Procurement / Invoices</small>
          </div>
          <button
            className="btn btn-primary shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <PlusCircle size={18} className="me-1" /> Create Bill
          </button>
        </div>

        <div className="container-fluid py-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0">
                <FileText size={18} className="me-2 text-primary" />
                Recent Invoices
              </h6>
            </div>
            <div className="card-body p-0">
              <PurchaseTable purchases={purchases} loading={loading} />
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <CreatePurchaseModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchPurchases();
          }}
        />
      )}
    </div>
  );
};

export default Purchases;
