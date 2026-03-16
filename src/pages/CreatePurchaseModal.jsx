import React, { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";

const CreatePurchaseModal = ({ onClose, onSuccess }) => {
  const [billNo, setBillNo] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [gstIn, setGstIn] = useState("");
  const [items, setItems] = useState([
    {
      id: Date.now(),
      variantId: "",
      qty: 1,
      price: 0,
      tax: 0,
      landing: 0,
      net: 0,
      expiry: "",
    },
  ]);

  const IGST_RATE = 0.18;

  useEffect(() => {
    // Fetch Metadata
    fetch("/api/purchase/next-number")
      .then((res) => res.text())
      .then(setBillNo);
    fetch("/api/contacts/lookup")
      .then((res) => res.json())
      .then((data) => setSuppliers(data.data || []));
    fetch("/api/variants/lookup")
      .then((res) => res.json())
      .then((data) => setVariants(data.data || []));
  }, []);

  const handleSupplierChange = (e) => {
    const id = e.target.value;
    const sup = suppliers.find((s) => s.contactId == id);
    setSelectedSupplier(id);
    setGstIn(sup?.gstIn || "");
  };

  const updateItem = (id, field, value) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate Logic
        const qty = parseFloat(updated.qty) || 0;
        const price = parseFloat(updated.price) || 0;
        updated.tax = price * IGST_RATE * qty;
        updated.landing = price + price * IGST_RATE;
        updated.net = updated.landing * qty;
        return updated;
      }
      return item;
    });
    setItems(newItems);
  };

  const totalBillAmount = items.reduce((sum, item) => sum + item.net, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      billNo,
      supplier: { contactId: selectedSupplier },
      totalAmount: { price: totalBillAmount },
      items: items.map((i) => ({
        variant: { variantId: i.variantId },
        qty: i.qty,
        price: { price: i.price },
        taxAmount: { price: i.tax },
        landingCost: { price: i.landing },
        netAmount: { price: i.net },
        expireDate: i.expiry,
      })),
    };

    const res = await fetch(`/api/purchase/add?gstIn=${gstIn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) onSuccess();
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">
              New Purchase Invoice
              <span
                className={`badge ms-2 ${gstIn === "24" ? "bg-success" : "bg-primary"}`}
              >
                {gstIn
                  ? gstIn === "24"
                    ? "InterState"
                    : "OuterState"
                  : "Select Supplier"}
              </span>
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold">Bill Number</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={billNo}
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Supplier</label>
                <select
                  className="form-select"
                  required
                  onChange={handleSupplierChange}
                >
                  <option value="">Choose Supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.contactId} value={s.contactId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Grand Total</label>
                <div className="input-group">
                  <span className="input-group-text bg-success text-white">
                    ₹
                  </span>
                  <input
                    type="text"
                    className="form-control fw-bold bg-light"
                    value={totalBillAmount.toFixed(2)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Variant</th>
                    <th style={{ width: "80px" }}>Qty</th>
                    <th>Price (Ex)</th>
                    <th>Net Total</th>
                    <th>Expiry</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <select
                          className="form-select"
                          onChange={(e) =>
                            updateItem(item.id, "variantId", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Product</option>
                          {variants.map((v) => (
                            <option key={v.variantId} value={v.variantId}>
                              {v.product?.productName} [{v.variantName}]
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(item.id, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(item.id, "price", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={item.net.toFixed(2)}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="form-control"
                          onChange={(e) =>
                            updateItem(item.id, "expiry", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() =>
                            setItems(items.filter((i) => i.id !== item.id))
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() =>
                  setItems([
                    ...items,
                    {
                      id: Date.now(),
                      variantId: "",
                      qty: 1,
                      price: 0,
                      tax: 0,
                      landing: 0,
                      net: 0,
                      expiry: "",
                    },
                  ])
                }
              >
                <Plus size={16} /> Add Item
              </button>
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
              Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseModal;
