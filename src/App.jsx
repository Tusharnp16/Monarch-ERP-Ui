import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import './styles/App.css';
import AppLayout from "./components/AppLayout";
import Products from "./pages/Products";
import Login from "./pages/login";
import NotFound from "./pages/NotFound";
import AppErrorBoundary from "./pages/AppErrorBoundary";
import Register from "./pages/Register";

import { AuthProvider } from "./api/AuthContext";
import ProtectedRoute from "./api/ProtectedRoute";
import InventoryAlert from "./components/InventoryAlert";
import { Suspense, lazy } from "react";
import PurchasesPage from "./pages/Purchase";

const Variants = lazy(() => import("./pages/Variants"));
const Inventory = lazy(() => import("./pages/Inventory"));
const OrderCard = lazy(() => import("./pages/OrderCard"));
const StockMaster = lazy(() => import("./pages/StockMaster"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Customers = lazy(() => import("./pages/Customers"));
const LoginHistory = lazy(() => import("./pages/LoginHistory"));
const RecentSales = lazy(() => import("./pages/RecentSales"));
const SalesInvoice = lazy(() => import("./pages/SalesInvoice"));

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Products /> },
      { path: "products", element: <Products /> },
      { path: "variants", element: <Variants /> },
      { path: "inventory", element: <Inventory /> },
      { path: "stockmaster", element: <StockMaster /> },
      { path: "purchase", element: <PurchasesPage /> },
      { path: "contacts", element: <Contacts /> },
      { path: "purchase/report", element: <Products /> },
      { path: "customers", element: <Customers /> },
      { path: "sales", element: <SalesInvoice /> },
      { path: "salesreport", element: <RecentSales /> },
      { path: "userlogs", element: <LoginHistory /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <InventoryAlert />
      <Suspense fallback={<div className="loader">Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
