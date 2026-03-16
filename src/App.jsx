import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import './styles/App.css';
import AppLayout from "./components/AppLayout";
import Products from "./pages/Products";
import Login from "./pages/login";
import NotFound from "./pages/NotFound";
import AppErrorBoundary from "./pages/AppErrorBoundary";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";
import OrderCard from "./pages/OrderCard";
import StockMaster from "./pages/StockMaster";
import LoginHistory from "./pages/LoginHistory";
import Contacts from "./pages/Contacts";
import Customers from "./pages/Customers";
import { AuthProvider } from "./api/AuthContext";
import ProtectedRoute from "./api/ProtectedRoute";
import InventoryAlert from "./components/InventoryAlert";
import Variants from "./pages/Variants";

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
      { path: "purchase", element: <OrderCard /> },
      { path: "contacts", element: <Contacts /> },
      { path: "purchase/report", element: <Products /> },
      { path: "customers", element: <Customers /> },
      { path: "salesinvoice", element: <Products /> },
      { path: "salesitem/recentitems", element: <Products /> },
      { path: "userlogs", element: <LoginHistory /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <InventoryAlert />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
