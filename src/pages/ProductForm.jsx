import React, { useState, useEffect } from "react";

const ProductForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    productName: "",
    itemCode: "",
    version: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData.productName || "",
        itemCode: initialData.itemCode || "",
        version: initialData.version || 0,
      });
    } else {
      setFormData({ productName: "", itemCode: "", version: 0 });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <form
          className="modal-content"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
        >
          <div className="modal-header">
            <h5 className="modal-title">
              {initialData ? "Edit Product" : "New Product"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                required
              />
            </div>
            <input
              type="hidden"
              className="form-control"
              value={formData.version}
              onChange={(e) =>
                setFormData({ ...formData, version: e.target.value })
              }
              required
            />
            <div className="mb-3">
              <label className="form-label">Item Code</label>
              <input
                type="text"
                className="form-control"
                value={formData.itemCode}
                onChange={(e) =>
                  setFormData({ ...formData, itemCode: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
