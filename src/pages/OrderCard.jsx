import React from "react";
import { Package, ChevronRight } from "lucide-react";

const MOCK_ORDERS = [
  {
    id: "MNR-88291",
    date: "March 3, 2026",
    total: "249.00",
    status: "Processing",
    itemName: "Enterprise Module: Inventory Pro",
    qty: 1,
  },
  {
    id: "MNR-77420",
    date: "Feb 28, 2026",
    total: "120.00",
    status: "Delivered",
    itemName: "Custom API Connector",
    qty: 2,
  },
];

const OrderCard = ({ orders = MOCK_ORDERS }) => {
  // Ensure we are working with an array
  const dataList = orders || MOCK_ORDERS;

  const statusStyles = {
    Delivered: "bg-green-100 text-green-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {dataList.map((order) => (
        <div
          key={order.id}
          className="max-w-2xl border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between p-4 bg-gray-50 border-b border-gray-100 gap-4">
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Order Placed
                </p>
                <p className="text-sm text-gray-800 font-medium">
                  {order.date}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Total
                </p>
                <p className="text-sm text-gray-800 font-bold">
                  ${order.total}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Order ID
                </p>
                <p className="text-sm text-gray-600 font-mono">#{order.id}</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Details <ChevronRight size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${statusStyles[order.status] || "bg-gray-100"}`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-100">
                <Package className="text-slate-300" size={28} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                  {order.itemName}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Quantity: {order.qty}
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="text-[11px] font-bold text-blue-600 border border-blue-100 px-2 py-1 rounded hover:bg-blue-50">
                    Track
                  </button>
                  <button className="text-[11px] font-bold text-gray-600 border border-gray-100 px-2 py-1 rounded hover:bg-gray-50">
                    Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderCard;
