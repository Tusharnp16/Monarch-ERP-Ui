import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import API from "../api/AxiosConfig";

const API_URL = "/contacts";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobileno: "",
    gstIn: "",
  });
  const [selectedId, setSelectedId] = useState(null);

  const [notice, setNotice] = useState(null);

  const showNotice = (msg, isError = false) => {
    setNotice({ msg, isError });
    setTimeout(() => setNotice(null), 3000);
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await API.get(API_URL);

      const data = res.data?.data || res.data || [];
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedId) {
        await API.put(`${API_URL}/${selectedId}`, formData);
        showNotice("Customer updated successfully");
      } else {
        await API.post(API_URL, formData);
        showNotice("Customer added successfully");
      }
      closeModals();
      fetchContacts();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`${API_URL}/${selectedId}`);
      setShowDeleteModal(false);
      showNotice("Customer deleted successfully");
      fetchContacts();
    } catch (err) {
      console.error("Delete failed:", err);
      showNotice("Failed to delete customer", true);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setFormData({ name: "", mobileno: "", gstIn: "" });
    setSelectedId(null);
  };

  const filteredContacts = Array.isArray(contacts)
    ? contacts.filter((c) =>
        Object.values(c).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1">
        <header className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Contacts</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Add Contact
          </button>
        </header>

        <div className="p-6">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-gray-600 font-medium">
              Total:{" "}
              <span className="text-blue-600">{filteredContacts.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 uppercase text-xs">
                    #
                  </th>
                  <th className="p-4 font-semibold text-gray-600 uppercase text-xs">
                    Name
                  </th>
                  <th className="p-4 font-semibold text-gray-600 uppercase text-xs">
                    Mobile
                  </th>
                  <th className="p-4 font-semibold text-gray-600 uppercase text-xs">
                    GST
                  </th>
                  <th className="p-4 font-semibold text-gray-600 uppercase text-xs text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-400">
                      Loading contacts...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-400">
                      No contacts found.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact, index) => (
                    <tr
                      key={contact.contactId || index}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="p-4 text-gray-500">{index + 1}</td>
                      <td className="p-4 font-medium text-gray-900">
                        {contact.name}
                      </td>
                      <td className="p-4 text-gray-600">{contact.mobileno}</td>
                      <td className="p-4 text-gray-600">{contact.gstIn}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setFormData(contact);
                            setSelectedId(contact.contactId);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedId(contact.contactId);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            <div className="p-6 border-b font-bold text-xl text-slate-800">
              {showEditModal ? "Edit Contact" : "Add New Contact"}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.mobileno}
                  maxLength={10}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileno: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Registration
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.gstIn}
                  onChange={(e) =>
                    setFormData({ ...formData, gstIn: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="flex-1 py-2.5 border border-gray-300 bg-white hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-colors"
              >
                {showEditModal ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Are you sure?
            </h3>
            <p className="text-gray-500 mb-6">
              This action cannot be undone. This contact will be permanently
              deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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

export default Contacts;
