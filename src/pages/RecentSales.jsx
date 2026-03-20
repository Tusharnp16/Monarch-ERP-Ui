import React, { useState, useEffect } from "react";
import {
  Clock,
  FileSpreadsheet,
  Plus,
  Printer,
  Loader2,
  ChevronDown,
  ExternalLink,
  Receipt,
  User,
  Calendar,
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

  //   const fetchRecentInvoices = async () => {
  //     try {
  //       const response = await API.get("/salesitem/recentitems");
  //       if (response.data.success) setInvoices(response.data.data);
  //     } catch (err) {
  //       console.error("Error loading invoices:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const fetchRecentInvoices = async () => {
    try {
      const response = await API.get("/salesitem/recentitems");
      if (response.data.success) setInvoices(response.data.data || []);
    } catch (err) {
      console.error("Error loading invoices:", err);
      setInvoices([]);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
        <p className="text-gray-600 font-medium">Loading recent activity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Clock className="mr-3 text-blue-600" /> Recent Sales Invoices
          </h2>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition shadow-sm"
            >
              <FileSpreadsheet size={18} /> Export Report
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg">
              <Plus size={18} /> New Invoice
            </button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="space-y-4">
          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className={`bg-white rounded-xl shadow-sm border-t-4 transition-all duration-200 ${
                  expandedId === inv.id
                    ? "border-blue-600 shadow-md"
                    : "border-gray-200 shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(inv.id)}
                  className="w-full text-left px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 hidden md:block">
                      <Receipt size={20} />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <span className="font-mono font-bold text-lg text-blue-700 leading-none">
                        {inv.invoiceNumber}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <User size={14} className="mr-1" />
                        <span className="font-semibold text-gray-700 truncate max-w-[200px]">
                          {inv.customerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 mt-4 md:mt-0">
                    <div className="flex items-center text-gray-400">
                      <Calendar size={14} className="mr-2" />
                      <span className="text-xs font-medium">
                        {inv.invoiceDate}
                      </span>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                        Grand Total
                      </p>
                      <p className="font-black text-xl text-blue-600 font-mono">
                        ₹{inv.grandTotal.toLocaleString()}
                      </p>
                    </div>
                    <ChevronDown
                      className={`text-gray-400 transition-transform duration-300 ${
                        expandedId === inv.id ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </div>
                </button>

                {expandedId === inv.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/30">
                    {!invoiceItems[inv.id] ? (
                      <div className="flex flex-col items-center py-8">
                        <Loader2 className="animate-spin text-blue-500 mb-2" />
                        <span className="text-xs text-gray-400 font-medium">
                          Fetching line items...
                        </span>
                      </div>
                    ) : (
                      <InvoiceDetails items={invoiceItems[inv.id]} inv={inv} />
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-400">No recent sales records found.</p>
            </div>
          )}
        </div>
      </div>

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

const InvoiceDetails = ({ items, inv }) => {
  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between items-center mb-4 mt-2">
        <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
          <Receipt size={12} className="mr-1" /> Itemized Breakdown
        </h6>
        <button
          onClick={() =>
            window.open(`/api/salesitem/invoice/print/${inv.id}`, "_blank")
          }
          className="flex items-center gap-2 text-xs font-bold border border-blue-600 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition shadow-sm"
        >
          <Printer size={14} /> Print Bill
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest border-b">
            <tr>
              <th className="px-6 py-3">Product Description</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3">
                  <p className="font-bold text-gray-800">{item.productName}</p>
                  <p className="text-[11px] text-gray-400">
                    {item.variantName} <span className="mx-1">•</span>{" "}
                    {item.variantInfo || "Standard"}
                  </p>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-gray-600">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-500">
                  ₹{item.unitPrice.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-800 font-mono">
                  ₹{item.lineTotal.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-end">
        <div className="w-full md:w-72 space-y-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between text-xs font-medium text-gray-500">
            <span>Subtotal</span>
            <span className="font-mono">
              ₹{inv.totalAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs font-medium text-red-500 italic">
            <span>Discount Applied</span>
            <span className="font-mono">
              -₹{inv.discountAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-base font-black text-blue-600 pt-2 border-t border-dashed">
            <span className="uppercase text-[10px] tracking-widest text-gray-400">
              Grand Total
            </span>
            <span className="text-xl font-mono tracking-tighter">
              ₹{inv.grandTotal.toLocaleString()}
            </span>
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-8 border-green-600 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">
                Export Sales
              </h3>
              <p className="text-xs text-gray-400 font-medium italic">
                Generate monthly Excel report
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Month
              </label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-green-500"
                id="expMonth"
              >
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
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Year
              </label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-green-500"
                id="expYear"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                const m = document.getElementById("expMonth").value;
                const y = document.getElementById("expYear").value;
                window.location.href = `/api/salesitem/export/monthly?month=${m}&year=${y}`;
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200"
            >
              Download .xlsx
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentSales;
