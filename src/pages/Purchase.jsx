import React, { useState, useEffect } from "react";
import PurchaseTable from "./PurchaseTable";
import CreatePurchaseModal from "./CreatePurchaseModal";
import { PlusCircle, FileText } from "lucide-react";
import API from "../api/AxiosConfig";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      const res = await API.get("/purchase");
      if (res.data.success) setPurchases(res.data.data);
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
      <main className="flex-grow-1">
        <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center sticky-top">
          <div>
            <h1 className="h5 mb-0">Purchases</h1>
            <small className="text-primary">Procurement / Invoices</small>
          </div>
          <button
            className="btn btn-primary d-flex align-items-center"
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
