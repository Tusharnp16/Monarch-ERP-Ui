import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FileText,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import API from "../api/AxiosConfig";
import AsyncSelect from "react-select/async";

const SalesInvoice = () => {
  const [invoiceNumber, setInvoiceNumber] = useState("Fetching...");
  const [customer, setCustomer] = useState({ name: "", mobile: "", email: "" });
  const [items, setItems] = useState([
    {
      id: Date.now(),
      variantId: null,
      quantity: 1,
      mrp: 0,
      price: 0,
      stock: 0,
    },
  ]);
  const [discount, setDiscount] = useState(0);
  const [totals, setTotals] = useState({ subtotal: 0, grandTotal: 0 });
  const [topSellers, setTopSellers] = useState([]);
  const [loadingTopSellers, setLoadingTopSellers] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchInvoiceNumber();
    fetchTopSellers();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items, discount]);

  const fetchInvoiceNumber = async () => {
    try {
      const res = await API.get("/sales-invoices/next-number");
      setInvoiceNumber(res.data.data || "INV-GENERIC");
    } catch (err) {
      toast.error("Failed to fetch invoice number");
      setInvoiceNumber("ERROR");
    }
  };

  const fetchTopSellers = async () => {
    setLoadingTopSellers(true);
    try {
      const res = await API.get("/sales-invoices/top-seller");
      console.log("Top sellers response:", res.data.data);
      setTopSellers(res.data.data || res.data || []);
    } catch (err) {
      console.error("Top sellers error", err);
    } finally {
      setLoadingTopSellers(false);
    }
  };

  const handleCustomerLookup = async () => {
    if (customer.mobile.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    try {
      const res = await API.get(`/customers/search?mobile=${customer.mobile}`);
      if (res.data.success && res.data.data) {
        setCustomer({
          name: res.data.data.name,
          mobile: res.data.data.mobile,
          email: res.data.data.email,
        });
        toast.success("Customer record found");
      } else if (!res.data.success && !res.data.data) {
        toast("New customer detected", { icon: "✨" });
      }
    } catch (err) {
      toast.error("Error searching for customer");
    }
  };

  useEffect(() => {
    if (customer.mobile.length === 10) {
      handleCustomerLookup();
    } else if (customer.mobile.length < 10 && customer.name !== "") {
      setCustomer({ mobile: customer.mobile, name: "", email: "" });
    }
  }, [customer.mobile]);

  const loadInventoryOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const response = await API.get(`/inventory/search?name=${inputValue}`);
      const inventoryArray = response.data.data || [];

      return inventoryArray.map((item) => ({
        value: item.variant.variantId,
        label: `${item.variant.variantName} (${item.variant.colour}/${item.variant.size})`,
        price: item.variant.sellingPrice?.price || 0,
        mrp: item.variant.mrp?.price || 0,
        stock: item.availableQuantity || 0,
      }));
    } catch (err) {
      return [];
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0,
    );
    const maxDiscount = subtotal * 0.15;
    let finalDiscount = discount;

    if (discount > maxDiscount) {
      toast.error("Max discount is 15%");
      finalDiscount = maxDiscount;
      setDiscount(maxDiscount);
    }

    setTotals({
      subtotal: subtotal,
      grandTotal: subtotal - finalDiscount,
    });
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        variantId: null,
        quantity: 1,
        mrp: 0,
        price: 0,
        stock: 0,
      },
    ]);
  };

  const updateItem = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (items.some((i) => !i.variantId)) {
      toast.error("Please select products for all rows");
      return;
    }

    const payload = {
      invoiceNumber,
      customer,
      notes,
      discountAmount: discount,
      items: items.map((i) => ({
        variant: { variantId: i.variantId },
        quantity: i.quantity,
        unitPrice: i.price,
      })),
    };

    try {
      const res = await API.post("/sales-invoices", payload);
      if (res.status === 200 || res.data.success) {
        toast.success("Invoice Saved Successfully!");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save invoice");
    }
  };

  const removeItemRow = (id) => {
    if (items.length <= 1) {
      toast.error("At least one item is required in the invoice");
      return;
    }

    setItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== id);
      return updatedItems;
    });

    toast.success("Item removed");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <Toaster position="bottom-right" />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FileText className="mr-2 text-blue-600" /> New Sales Invoice
          </h2>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center transition shadow-lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Finalize Sale
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 p-6">
              <h3 className="font-bold mb-4 border-bottom pb-2">
                Customer Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="flex mt-1">
                    <input
                      type="text"
                      className="w-full border rounded-l-md p-2 outline-none focus:ring-1 focus:ring-blue-500"
                      value={customer.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) {
                          setCustomer({ ...customer, mobile: val });
                        }
                      }}
                      maxLength={10}
                      placeholder="Enter mobile..."
                    />
                    <button
                      onClick={handleCustomerLookup}
                      className="bg-blue-50 border border-blue-600 text-blue-600 px-3 rounded-r-md hover:bg-blue-100"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-md p-2 mt-1 outline-none"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border rounded-md p-2 mt-1 outline-none"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-600 overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <span className="font-bold">Billing Items</span>
                <button
                  onClick={addItemRow}
                  className="text-green-600 border border-green-600 px-3 py-1 rounded-md text-sm flex items-center hover:bg-green-50 transition"
                >
                  <Plus size={16} className="mr-1" /> Add Item
                </button>
              </div>

              <div className="p-4 overflow-x-auto">
                <div className="mb-4 flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Invoice No:
                  </label>
                  <span className="text-lg font-mono font-bold text-blue-600">
                    {invoiceNumber}
                  </span>
                </div>

                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider">
                      <th className="pb-3 w-1/2">Variant</th>
                      <th className="pb-3 px-2">Qty</th>
                      <th className="pb-3 px-2 text-right">MRP</th>
                      <th className="pb-3 px-2 text-right">Price</th>
                      <th className="pb-3 text-right">Total</th>
                      <th className="pb-3">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-3">
                          <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadInventoryOptions}
                            placeholder="Search Product..."
                            className="text-sm"
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                              }),
                            }}
                            onChange={(selected) => {
                              if (selected) {
                                // We update multiple fields at once
                                setItems((prev) =>
                                  prev.map((i) =>
                                    i.id === item.id
                                      ? {
                                          ...i,
                                          variantId: selected.value,
                                          price: selected.price,
                                          mrp: selected.mrp,
                                          stock: selected.stock,
                                        }
                                      : i,
                                  ),
                                );
                                toast.success(`${selected.label} selected`);
                              }
                            }}
                          />
                          {item.stock > 0 && (
                            <span
                              className={`text-[10px] block mt-1 ${item.stock < 5 ? "text-red-500 font-bold" : "text-gray-400"}`}
                            >
                              Stock: {item.stock}
                            </span>
                          )}
                        </td>
                        <td className="px-2">
                          <input
                            type="number"
                            className="w-16 border rounded p-1 text-center"
                            value={item.quantity}
                            min="0"
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > item.stock)
                                toast.error("Quantity exceeds stock!");
                              updateItem(item.id, "quantity", val);
                            }}
                          />
                        </td>
                        <td className="px-2 text-right font-semibold text-gray-600">
                          ₹{item.price}
                        </td>
                        <td className="px-2 text-right font-semibold text-gray-600">
                          ₹{item.price}
                        </td>
                        <td className="text-right font-bold text-blue-600">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </td>
                        <td className="text-right pl-2">
                          <button
                            onClick={() => removeItemRow(item.id)}
                            className="text-red-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 p-6 border-t">
                <div className="flex flex-wrap gap-6">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Internal Notes
                    </label>
                    <textarea
                      className="w-full mt-1 border rounded-md p-2 h-20 text-sm outline-none"
                      placeholder="Reference..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="w-full md:w-64 space-y-2 font-medium text-gray-700">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Discount</span>
                      <input
                        type="number"
                        className="w-24 border rounded p-1 text-right font-bold text-blue-600"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center text-gray-900">
                      <span className="text-lg font-bold">Grand Total</span>
                      <span className="text-2xl font-black text-blue-600 font-mono">
                        ₹{totals.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border-t-4 border-red-500 p-6">
          <h3 className="font-bold mb-4 flex items-center text-red-600 uppercase text-xs tracking-wider">
            <TrendingUp className="mr-2" size={20} /> Top Selling (7 Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Variant</th>
                  <th className="pb-2">Sold</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loadingTopSellers ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-4 text-gray-400 italic"
                    >
                      Loading trends...
                    </td>
                  </tr>
                ) : topSellers.length > 0 ? (
                  topSellers.map((item, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 font-semibold text-gray-700">
                        {item[0]}
                      </td>
                      <td className="py-3 text-gray-500">
                        {item[1]} ({item[2]} / {item[3]})
                      </td>
                      <td className="py-3 font-bold text-blue-600">
                        {item[4]}
                      </td>
                      <td className="py-3 font-bold text-gray-800 font-mono text-right">
                        ₹{item[5]}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-400">
                      No sales recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesInvoice;
