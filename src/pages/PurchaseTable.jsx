import React, { useState } from "react";
import { ChevronRight, ChevronDown, Printer } from "lucide-react";
import API from "../api/AxiosConfig";

const PurchaseTable = ({ purchases, loading }) => {
  // State to track which purchase ID is currently expanded
  const [expandedId, setExpandedId] = useState(null);
  const [itemDetails, setItemDetails] = useState({}); // Stores fetched items

  const toggleRow = async (purchaseId) => {
    if (expandedId === purchaseId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(purchaseId);

    // Only fetch if we haven't loaded items for this ID yet
    if (!itemDetails[purchaseId]) {
      try {
        const res = await API.get(`/purchaseitem/pr/${purchaseId}`);
        if (res.data.success) {
          setItemDetails((prev) => ({ ...prev, [purchaseId]: res.data.data }));
        }
      } catch (err) {
        console.error("Failed to fetch items", err);
      }
    }
  };

  if (loading)
    return <div className="p-5 text-center">Loading purchases...</div>;

  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead className="table-light text-uppercase small">
          <tr>
            <th className="ps-3">Bill No</th>
            <th>Supplier</th>
            <th>Date</th>
            <th>Items</th>
            <th className="text-end">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <React.Fragment key={p.purchaseId}>
              {/* MAIN ROW */}
              <tr className="main-row">
                <td className="ps-3">
                  <button
                    className="btn btn-link text-decoration-none fw-bold p-0 d-flex align-items-center"
                    onClick={() => toggleRow(p.purchaseId)}
                  >
                    {expandedId === p.purchaseId ? (
                      <ChevronDown size={16} className="me-2" />
                    ) : (
                      <ChevronRight size={16} className="me-2" />
                    )}
                    <span
                      className="badge bg-light text-orange border px-2 py-1"
                      style={{ color: "#d9480f" }}
                    >
                      {p.billNo || "N/A"}
                    </span>
                  </button>
                </td>
                <td>
                  <div className="fw-bold">{p.supplierName}</div>
                  <div className="text-muted small">{p.supplierNumber}</div>
                </td>
                <td className="text-muted">{p.date?.split("T")[0]}</td>
                <td>
                  <span className="badge rounded-pill bg-light text-dark border">
                    {p.itemCount} Items
                  </span>
                </td>
                <td className="fw-bold text-end pe-3">
                  ₹ {p.totalAmount?.toLocaleString("en-IN")}
                </td>
              </tr>

              {/* EXPANDABLE DETAIL ROW */}
              {expandedId === p.purchaseId && (
                <tr className="bg-light">
                  <td colSpan="6" className="px-4 py-3">
                    <div className="bg-white border rounded p-3 shadow-sm">
                      <h6 className="small fw-bold text-uppercase text-secondary mb-3">
                        Itemized Breakdown
                      </h6>
                      <table className="table table-sm hover mb-0">
                        <thead className="table-light small">
                          <tr>
                            <th>Product/Variant</th>
                            <th className="text-center">Qty</th>
                            <th>Unit Price</th>
                            <th>Tax</th>
                            <th>Net Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemDetails[p.purchaseId] ? (
                            itemDetails[p.purchaseId].map((item, idx) => (
                              <tr key={idx} className="small">
                                <td>
                                  {item.productDisplay}{" "}
                                  <span className="text-muted">
                                    - {item.variantDisplay}
                                  </span>
                                </td>
                                <td className="text-center">{item.qty}</td>
                                <td>
                                  ₹ {item.unitPrice?.toLocaleString("en-IN")}
                                </td>
                                <td>
                                  ₹ {item.taxAmount?.toLocaleString("en-IN")}
                                </td>
                                <td className="fw-bold">
                                  ₹ {item.netAmount?.toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-2">
                                Loading items...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseTable;
