import React, { useState, useEffect } from "react";
import {
  Clock,
  FileSpreadsheet,
  Plus,
  Printer,
  Loader2,
  ChevronDown,
} from "lucide-react";
import API from "../api/AxiosConfig";

const RecentSales = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchRecentInvoices();
  }, []);

  const fetchRecentInvoices = async () => {
    try {
      const response = await API.get("/salesitem/recentitems");
      if (response.data.success) setInvoices(response.data.data);
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = async (invoiceId) => {
    if (expandedId === invoiceId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(invoiceId);

    if (!invoiceItems[invoiceId]) {
      try {
        const response = await API.get(`/salesitem/invoice-items/${invoiceId}`);
        if (response.data.success) {
          setInvoiceItems((prev) => ({
            ...prev,
            [invoiceId]: response.data.data,
          }));
        }
      } catch (err) {
        console.error("Error loading items:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
        <p className="text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="text-blue-600" /> Recent Sales Invoices
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FileSpreadsheet size={18} /> Monthly Export
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white border-l-4 border-blue-600 rounded-lg shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleAccordion(inv.id)}
              className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <span className="font-bold text-blue-700">
                  {inv.invoiceNumber}
                </span>
                <span className="ml-4 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border uppercase">
                  {inv.customerName}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-400">{inv.invoiceDate}</p>
                  <p className="font-bold text-green-600">
                    ₹ {inv.grandTotal.toLocaleString()}
                  </p>
                </div>
                <ChevronDown
                  className={`transform transition ${expandedId === inv.id ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {expandedId === inv.id && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                {!invoiceItems[inv.id] ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-blue-500" />
                  </div>
                ) : (
                  <InvoiceDetails items={invoiceItems[inv.id]} inv={inv} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

// Sub-component for the expanded details
const InvoiceDetails = ({ items, inv }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h6 className="font-semibold text-gray-700">Line Items</h6>
        <button
          onClick={() =>
            window.open(`/api/salesitem/invoice/print/${inv.id}`, "_blank")
          }
          className="flex items-center gap-2 text-sm border border-red-200 text-red-600 px-3 py-1 rounded hover:bg-red-50"
        >
          <Printer size={14} /> Print Bill
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2 text-center">Qty</th>
              <th className="px-4 py-2 text-right">Unit Price</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-gray-400">
                    {item.variantName} | {item.variantInfo || "-"}
                  </p>
                </td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">
                  ₹ {item.unitPrice.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  ₹ {item.lineTotal.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="w-full md:w-64 space-y-2 border-t pt-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹ {inv.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>Discount</span>
            <span>- ₹ {inv.discountAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-blue-700 pt-2 border-t">
            <span>Grand Total</span>
            <span>₹ {inv.grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExportModal = ({ onClose }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-green-600 p-4 text-white flex justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <FileSpreadsheet /> Export Monthly Sales
          </h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Month</label>
            <select className="w-full border rounded p-2" id="expMonth">
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Year</label>
            <select className="w-full border rounded p-2" id="expYear">
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="bg-gray-50 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const m = document.getElementById("expMonth").value;
              const y = document.getElementById("expYear").value;
              window.location.href = `/api/salesitem/export/monthly?month=${m}&year=${y}`;
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentSales;
