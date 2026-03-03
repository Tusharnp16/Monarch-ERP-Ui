import React, { useState } from "react";
import API from "../api/AxiosConfig";

const AdjustmentModal = ({ onClose, inventoryList, refreshData }) => {
  const [formData, setFormData] = useState({
    inventoryId: "",
    adjustmentType: "ADD",
    quantity: 1,
    reason: "",
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
      params.append("reason", formData.reason);

      // REFACTORED: Using your API utility with a plain object
      const response = await API.post("/inventory/update", params);

      if (response.data.success) {
        refreshData(); // Refresh the table in Inventory.jsx
        onClose(); // Close the modal
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
              Manual Stock Adjustment
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
              <label className="form-label text-muted small fw-bold">
                SELECT PRODUCT VARIANT
              </label>
              <select
                className="form-select"
                required
                value={formData.inventoryId}
                onChange={(e) =>
                  setFormData({ ...formData, inventoryId: e.target.value })
                }
              >
                <option value="">Choose a product...</option>
                {inventoryList.map((item) => (
                  <option key={item.inventoryId} value={item.inventoryId}>
                    {item.variant?.product?.productName} —{" "}
                    {item.variant?.variantName}
                  </option>
                ))}
              </select>
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

            <div className="mb-0">
              <label className="form-label text-muted small fw-bold">
                REASON / NOTES
              </label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="e.g., Damaged goods, seasonal restock..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              ></textarea>
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
