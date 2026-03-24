import React, { useState } from "react";
import API from "../api/AxiosConfig";
import { Package, Info } from "lucide-react";

const AdjustmentModal = ({ onClose, selectedProduct, refreshData }) => {
  console.log(selectedProduct);
  const [formData, setFormData] = useState({
    inventoryId: selectedProduct.inventoryId,
    adjustmentType: "ADD",
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const params = new URLSearchParams();
      params.append("inventoryId", formData.inventoryId);
      params.append("adjustmentType", formData.adjustmentType);
      params.append("quantity", formData.quantity);

      const response = await API.post("/inventory/update", params);

      if (response.data.success) {
        refreshData();
        onClose();
      }
    } catch (error) {
      console.error("Stock adjustment failed:", error);
      <Toast>
        <div className="toast-header">
          <strong className="me-auto text-danger">Error</strong>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
        <div className="toast-body">
          Failed to update inventory. Please try again.
        </div>
      </Toast>;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div className="modal-dialog shadow-lg">
        <form className="modal-content border-0" onSubmit={handleSubmit}>
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold text-dark text-uppercase small tracking-wider">
              Stock Adjustment
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="mb-3">
              <label className="d-block text-muted small fw-bold mb-2 tracking-tighter">
                SELECTED VARIANT
              </label>
              <div className="d-flex align-items-center">
                <div className="bg-white p-2 rounded-2 border me-3">
                  <Package size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">
                    {selectedProduct.variant.variantName}
                  </h6>
                  <p className="mb-0 small text-muted">
                    <code className="text-primary font-monospace">
                      {selectedProduct.variant.product.itemCode}
                    </code>
                  </p>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  ADJUSTMENT TYPE
                </label>
                <select
                  className="form-select"
                  value={formData.adjustmentType}
                  onChange={(e) =>
                    setFormData({ ...formData, adjustmentType: e.target.value })
                  }
                >
                  <option value="ADD">Add (+)</option>
                  <option value="SUBTRACT">Remove (-)</option>
                  <option value="SET">Set Exact (=)</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  QUANTITY
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light border-0">
            <button
              type="button"
              className="btn btn-link text-muted text-decoration-none"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 fw-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                "Update Inventory"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustmentModal;
