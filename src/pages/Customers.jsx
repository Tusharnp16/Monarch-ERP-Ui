import React, { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Phone, Mail } from "lucide-react";
import API from "../api/AxiosConfig";
import CustomerModal from "./CustomerForm";
import Portal from "../components/Portal";

const API_URL = "/customers";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // Modal Control State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: "add",
    data: null,
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const showNotice = (msg, isError = false) => {
    setNotice({ msg, isError });
    setTimeout(() => setNotice(null), 3000);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await API.get(API_URL);
      const data = res.data?.data || res.data || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotice("Failed to load customers", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async (payload) => {
    try {
      if (modalConfig.mode === "edit") {
        await API.put(`${API_URL}/update`, { ...payload, id: selectedId });
        showNotice("Customer updated!");
      } else {
        await API.post(`${API_URL}/add`, payload);
        showNotice("Customer added!");
      }
      setModalConfig({ isOpen: false, mode: "add", data: null });
      fetchCustomers();
    } catch (err) {
      showNotice(err.response?.data?.message || "Operation failed", true);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`${API_URL}/delete/${selectedId}`);
      showNotice("Customer deleted");
      setIsDeleteOpen(false);
      fetchCustomers();
    } catch (err) {
      showNotice("Delete failed", true);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    [c.name, c.mobile, c.email].some((val) =>
      String(val || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header & Search UI remains here ... */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">
          Customers & Directory
        </h1>
        <button
          onClick={() =>
            setModalConfig({ isOpen: true, mode: "add", data: null })
          }
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Add Customer
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-2/3">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, mobile or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm font-medium text-slate-500">
            Total:{" "}
            <span className="text-slate-800">{filteredCustomers.length}</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Index </th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">GST</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, i) => (
                  <tr
                    key={c.id || c.customerId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 font-semibold">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {c.mobile}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={12} /> {c.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {String(c.gstIn).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedId(c.id || c.customerId);
                          setModalConfig({
                            isOpen: true,
                            mode: "edit",
                            data: c,
                          });
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedId(c.id || c.customerId);
                          setIsDeleteOpen(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- MODALS --- */}
      <Portal>
        <CustomerModal
          isOpen={modalConfig.isOpen}
          mode={modalConfig.mode}
          initialData={modalConfig.data}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
          onSave={handleSave}
        />

        {/* Simplified Delete Modal logic */}
        {isDeleteOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center animate-in zoom-in duration-200 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-800">Delete?</h3>
              <p className="text-slate-500 my-4">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Portal>

      {/* Toast Notification Container */}
      {notice && (
        <div
          className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-right duration-300 ${notice.isError ? "bg-red-600" : "bg-green-600"}`}
        >
          {notice.msg}
        </div>
      )}
    </div>
  );
};

export default Customers;
