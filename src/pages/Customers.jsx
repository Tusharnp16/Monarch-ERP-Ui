import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  User,
  X,
} from "lucide-react";
import API from "../api/AxiosConfig";

const API_URL = "/customers";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    gstIn: "",
  });
  const [selectedId, setSelectedId] = useState(null);

  const [notice, setNotice] = useState(null);

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
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "edit") {
        await API.put(`${API_URL}/update`, { ...formData, id: selectedId });
        showNotice("Customer updated successfully");
      } else {
        await API.post(`${API_URL}/add`, formData);
        showNotice("Customer added successfully");
      }
      closeModal();
      fetchCustomers();
    } catch (err) {
      showNotice(err.response?.data?.message || "Operation failed", true);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`${API_URL}/delete/${selectedId}`);
      showNotice("Customer removed");
      closeModal();
      fetchCustomers();
    } catch (err) {
      showNotice("Delete failed", true);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const closeModal = () => {
    setModalMode(null);
    setFormData({ name: "", mobile: "", email: "", gstIn: "" });
    setSelectedId(null);
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
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">
          Customers & Directory
        </h1>
        <button
          onClick={() => setModalMode("add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Add Customer
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-2/3">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, mobile or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 whitespace-nowrap">
            Total Customers:{" "}
            <span className="font-bold text-slate-800">
              {filteredCustomers.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    #
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Customer Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Contact info
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    GST Code
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-400">
                      Loading directory...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-400">
                      No customers found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, idx) => (
                    <tr
                      key={c.id || c.customerId}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {c.id || c.customerId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                            {c.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-sm">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Phone size={14} className="text-slate-400" />{" "}
                            {c.mobile}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Mail size={14} className="text-slate-400" />{" "}
                            {c.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-medium">
                          CODE: {String(c.gstIn).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setFormData(c);
                              setSelectedId(c.id || c.customerId);
                              setModalMode("edit");
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedId(c.id || c.customerId);
                              setModalMode("delete");
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Save Modal (Add/Edit) */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {modalMode === "edit" ? "Edit Customer" : "New Customer Entry"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Mobile
                  </label>
                  <input
                    required
                    pattern="\d{10}"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    GST State Code
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.gstIn}
                    onChange={(e) =>
                      setFormData({ ...formData, gstIn: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
              >
                {modalMode === "edit" ? "Update Customer" : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Modal */}
      {modalMode === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">
              Delete Customer?
            </h3>
            <p className="text-slate-500 mb-6 text-sm">
              Are you sure you want to remove this customer from the directory?
              This action is permanent.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-md active:scale-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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
