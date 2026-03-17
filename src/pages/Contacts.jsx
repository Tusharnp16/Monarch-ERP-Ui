import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Contact,
  UserPlus,
  Info,
  Phone,
  BadgeCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
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

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await API.get(API_URL);
      const data = res.data?.data || res.data || [];
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load contacts");
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
        toast.success("Contact updated successfully");
      } else {
        await API.post(API_URL, formData);
        toast.success("New contact added");
      }
      closeModals();
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`${API_URL}/${selectedId}`);
      toast.success("Contact permanently deleted");
      setShowDeleteModal(false);
      fetchContacts();
    } catch (err) {
      toast.error("Failed to delete contact");
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <Toaster position="bottom-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Contact className="mr-3 text-blue-600" /> Contacts Directory
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg active:scale-95"
          >
            <UserPlus size={18} /> Add Contact
          </button>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-3 flex items-center">
            <div className="bg-blue-50 text-blue-600 rounded-lg p-2 mr-3">
              <Contact size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Total Contacts
              </p>
              <p className="text-xl font-black text-gray-800 leading-none">
                {contacts.length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-t-4 border-gray-300 p-3 flex items-center md:col-span-2 opacity-80">
            <Info size={16} className="text-gray-400 mr-2" />
            <p className="text-[11px] text-gray-500 italic leading-tight">
              Manage external contacts and vendor information. All updates are
              synced across the billing system.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 overflow-hidden">
          {/* Search Row */}
          <div className="p-4 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by name, mobile, or GST..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Found:{" "}
              <span className="text-blue-600">{filteredContacts.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b">
                  <th className="py-4 px-6">No.</th>
                  <th className="py-4 px-2">Contact Name</th>
                  <th className="py-4 px-2">Mobile Number</th>
                  <th className="py-4 px-2 text-center">GST Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-gray-400 italic font-medium">
                          Syncing directory...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact, index) => (
                    <tr
                      key={contact.contactId || index}
                      className="border-t hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="py-4 px-6 font-mono text-gray-400 group-hover:text-blue-600 transition-colors">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="py-4 px-2 font-bold text-gray-800">
                        {contact.name}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center text-gray-600">
                          <Phone size={14} className="mr-2 text-blue-500" />
                          <span className="font-medium">
                            {contact.mobileno}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${contact.gstIn ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-500 border-gray-100"}`}
                        >
                          {contact.gstIn ? (
                            <>
                              <BadgeCheck size={10} className="mr-1" />{" "}
                              {contact.gstIn}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
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
                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-gray-400 italic"
                    >
                      No contacts found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- FORM MODAL --- */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border-t-8 border-blue-600"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">
                    {showEditModal ? "Modify Contact" : "Add New Contact"}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium italic">
                    Enter details below to update the directory
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <input
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter name..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Mobile Number
                  </label>
                  <input
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10-digit mobile"
                    value={formData.mobileno}
                    maxLength={10}
                    onChange={(e) =>
                      setFormData({ ...formData, mobileno: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    GST Registration
                  </label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional GSTIN"
                    value={formData.gstIn}
                    onChange={(e) =>
                      setFormData({ ...formData, gstIn: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                >
                  {showEditModal ? "Update Profile" : "Save Contact"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 border-t-8 border-red-500">
            <div className="bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
              Remove Contact?
            </h3>
            <p className="text-gray-500 text-sm my-4">
              Deleting this record will remove it from the directory
              permanently.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
