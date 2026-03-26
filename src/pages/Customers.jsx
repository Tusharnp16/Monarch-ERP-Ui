import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Users,
  UserPlus,
  Info,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/AxiosConfig";
import CustomerModal from "./CustomerForm";
import Portal from "../components/Portal";
import DataTable from "react-data-table-component";
import { customStyles } from "../components/dataTableStyle";

const API_URL = "/customers";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal Control State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: "add",
    data: null,
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await API.get(API_URL);
      const data = res.data?.data || res.data || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load customers");
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
        toast.success("Customer updated successfully!");
      } else {
        await API.post(`${API_URL}/add`, payload);
        toast.success("New customer added!");
      }
      setModalConfig({ isOpen: false, mode: "add", data: null });
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`${API_URL}/delete/${selectedId}`);
      toast.success("Customer removed from directory");
      setIsDeleteOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error("Delete failed. Please try again.");
    }
  };

  const filteredCustomers = customers.filter((c) =>
    [c.name, c.mobile, c.email].some((val) =>
      String(val || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ),
  );

  const columns = useMemo(
    () => [
      {
        name: "ID",
        selector: (row, i) => String(i + 1).padStart(2, "0"),
        width: "80px",
        cell: (row, i) => (
          <span className="font-mono text-gray-400">
            {String(i + 1).padStart(2, "0")}
          </span>
        ),
      },
      {
        name: "CUSTOMER INFO",
        selector: (row) => row.name,
        sortable: true,
        cell: (row) => (
          <div className="py-2">
            <p className="font-bold text-gray-800 leading-tight">{row.name}</p>
            <p className="text-[10px] text-gray-400 font-mono">
              UID: {row.id || row.customerId}
            </p>
          </div>
        ),
      },
      {
        name: "CONTACT DETAILS",
        selector: (row) => row.email,
        cell: (row) => (
          <div className="space-y-1 py-2">
            <div className="flex items-center text-xs text-gray-600">
              <Phone size={12} className="mr-2 text-blue-500" /> {row.mobile}
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Mail size={12} className="mr-2 text-blue-500" />{" "}
              {row.email || "N/A"}
            </div>
          </div>
        ),
      },
      {
        name: "GSTIN",
        selector: (row) => row.gstIn,
        center: true,
        cell: (row) => (
          <span className="bg-gray-100 text-gray-600 font-mono text-[10px] px-2 py-1 rounded border">
            {row.gstIn || "UNREGISTERED"}
          </span>
        ),
      },
      {
        name: "ACTIONS",
        right: true,
        cell: (row) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setSelectedId(row.id || row.customerId);
                setModalConfig({ isOpen: true, mode: "edit", data: row });
              }}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                setSelectedId(row.id || row.customerId);
                setIsDeleteOpen(true);
              }}
              className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <Toaster position="bottom-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="mr-3 text-blue-600" /> Customers & Directory
          </h2>
          <button
            onClick={() =>
              setModalConfig({ isOpen: true, mode: "add", data: null })
            }
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg active:scale-95"
          >
            <UserPlus size={18} /> Add Customer
          </button>
        </div>

        {/* Compact Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-3 flex items-center">
            <div className="bg-blue-50 text-blue-600 rounded-lg p-2 mr-3">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">
                Total Records
              </p>
              <p className="text-xl font-black text-gray-800 leading-none">
                {customers.length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-t-4 border-gray-300 p-3 flex items-center md:col-span-2 opacity-80">
            <Info size={16} className="text-gray-400 mr-2" />
            <p className="text-[11px] text-gray-500 italic leading-tight">
              Manage your client directory. Search by name, mobile, or email for
              quick access.
            </p>
          </div>
        </div>

        {/* Search and Table Container */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredCustomers}
            pagination
            highlightOnHover
            progressPending={loading}
            customStyles={customStyles}
            subHeader
            subHeaderComponent={
              <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 pb-2">
                <div className="relative w-full md:w-1/2">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search directory..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Found:{" "}
                  <span className="text-blue-600">
                    {filteredCustomers.length}
                  </span>
                </span>
              </div>
            }
            progressComponent={
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-gray-400 italic">
                  Syncing directory...
                </span>
              </div>
            }
            noDataComponent={
              <div className="py-20 text-gray-400">
                No matching records found in directory.
              </div>
            }
          />
        </div>
      </div>

      {/* --- MODALS --- */}
      <Portal>
        <CustomerModal
          isOpen={modalConfig.isOpen}
          mode={modalConfig.mode}
          initialData={modalConfig.data}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
          onSave={handleSave}
        />

        {isDeleteOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200 shadow-2xl border-t-8 border-red-500">
              <div className="bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                Remove Customer?
              </h3>
              <p className="text-gray-500 text-sm my-4">
                This will permanently delete the customer from your directory.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="flex-1 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Portal>
    </div>
  );
};

export default Customers;
