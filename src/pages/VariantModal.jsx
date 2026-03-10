import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import API from "../api/AxiosConfig";

const VariantModal = ({ variant, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    variantName: "",
    colour: "",
    size: "",
    mrp: "",
    sellingPrice: "",
    productId: null,
  });

  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsImageDeleted(false);
    }
  };

  useEffect(() => {
    if (variant) {
      setFormData({
        variantId: variant.variantId,
        variantName: variant.variantName,
        colour: variant.colour,
        size: variant.size,
        mrp: variant.mrp?.price || "",
        sellingPrice: variant.sellingPrice?.price || "",
        productId: variant.product
          ? {
              value: variant.product.productId,
              label: variant.product.productName,
            }
          : null,
      });

      if (variant.imageUrl) {
        setPreviewUrl(variant.imageUrl);
        setIsImageDeleted(false);
      }
    }
  }, [variant]);

  const loadProductOptions = async (inputValue) => {
    if (inputValue.length < 3) return [];
    try {
      const res = await API.get(`/products/compact`, {
        params: { name: inputValue },
      });
      const items = res.data?.data || res.data || [];
      return items.map((p) => ({
        value: p.productId,
        label: p.productName,
      }));
    } catch (err) {
      console.error("Search error:", err);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (parseFloat(formData.sellingPrice) > parseFloat(formData.mrp)) {
      setError("Selling price cannot exceed MRP.");
      return;
    }

    try {
      const payload = new FormData();

      const variantData = {
        variantId: formData.variantId,
        variantName: formData.variantName,
        colour: formData.colour,
        size: formData.size,
        mrp: { price: formData.mrp },
        sellingPrice: { price: formData.sellingPrice },
      };

      payload.append(
        "variant",
        new Blob([JSON.stringify(variantData)], {
          type: "application/json",
        }),
      );

      if (selectedFile) {
        payload.append("file", selectedFile);
      } else {
        payload.append("file", "");
      }

      const productIdParam = formData.productId?.value;

      const params = {
        productId: productIdParam,
        removeImage: isImageDeleted,
      };

      if (variant) {
        await API.put(`/variants/${variant.variantId}`, payload, {
          params: params,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post(`/variants`, payload, {
          params: { productId: productIdParam },
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      // onRefresh();
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to save variant";
      setError(errMsg);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-container">
        <div className="modal-header-custom">
          <h3 className="modal-title-text">
            {variant ? "Edit Variant" : "Create New Variant"}
          </h3>
          <button onClick={onClose} className="close-x-btn">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="mb-3">
            <label className="text-muted-small mb-1 d-block text-left">
              Parent Product
            </label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              value={formData.productId}
              loadOptions={loadProductOptions}
              onChange={(opt) => setFormData({ ...formData, productId: opt })}
              placeholder="Search product..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="mb-3 text-center">
            <label className="text-muted-small mb-1 d-block text-left">
              Variant Image
            </label>
            <div className="image-upload-wrapper border rounded p-3 bg-light">
              {previewUrl ? (
                <div className="position-relative d-inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="img-thumbnail mb-2"
                    style={{ maxHeight: "150px" }}
                  />

                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                      setIsImageDeleted(true); // Mark for deletion on backend
                    }}
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="py-4 text-slate-400">No image selected</div>
              )}
              <input
                type="file"
                accept="image/*"
                className="form-control form-control-sm"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-muted-small mb-1 d-block text-left">
              Variant Name
            </label>
            <input
              type="text"
              required
              className="form-control"
              value={formData.variantName}
              onChange={(e) =>
                setFormData({ ...formData, variantName: e.target.value })
              }
              placeholder="e.g. XL - Blue"
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="text-muted-small mb-1 d-block text-left">
                Colour
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.colour}
                onChange={(e) =>
                  setFormData({ ...formData, colour: e.target.value })
                }
              />
            </div>
            <div className="col-6">
              <label className="text-muted-small mb-1 d-block text-left">
                Size
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-6">
              <label className="text-muted-small mb-1 d-block text-left">
                MRP
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="form-control"
                value={formData.mrp}
                onChange={(e) =>
                  setFormData({ ...formData, mrp: e.target.value })
                }
              />
            </div>
            <div className="col-6">
              <label className="text-muted-small mb-1 d-block text-left">
                Selling Price
              </label>
              <input
                type="number"
                step="0.01"
                required
                className={`form-control ${error ? "is-invalid" : ""}`}
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: e.target.value })
                }
              />
            </div>
          </div>

          {error && <p className="text-danger small mt-2 text-left">{error}</p>}

          <div className="modal-footer-custom mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-light me-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {variant ? "Update Variant" : "Save Variant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VariantModal;
