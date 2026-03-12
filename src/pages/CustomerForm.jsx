import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const CustomerModal = ({ isOpen, mode, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    gstIn: "",
  });

  // Sync state when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: "", mobile: "", email: "", gstIn: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            {mode === "edit" ? "Edit Customer" : "New Customer Entry"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Full Name
            </label>
            <input
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Mobile Field */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Mobile
              </label>
              <input
                required
                type="text"
                pattern="\d{10}"
                maxLength={10}
                title="Please enter a 10-digit mobile number"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobile: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>

            {/* GST Field */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                GST State Code
              </label>
              <input
                required
                type="text"
                maxLength={2}
                pattern="\d{2}"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.gstIn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gstIn: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>
          </div>

          {/* Email Field with Regex */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Email Address
            </label>
            <input
              required
              type="email"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              className="peer w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none invalid:border-red-500 transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <p className="mt-1 hidden peer-invalid:block text-[10px] text-red-500 font-medium">
              Please enter a valid email address.
            </p>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
          >
            {mode === "edit" ? "Update Customer" : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerModal;
