import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import './styles/App.css';
import AppLayout from "./components/AppLayout";
import Products from "./pages/Products";
import Login from "./pages/login";
import NotFound from "./pages/NotFound";
import AppErrorBoundary from "./pages/AppErrorBoundary";
import Register from "./pages/Register";
import Variants from "./pages/Variants";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Products /> },
      { path: "products", element: <Products /> },
      { path: "variants", element: <Variants /> },
      { path: "inventory", element: <Products /> },
      { path: "stockmaster", element: <Products /> },
      { path: "purchase", element: <Products /> },
      { path: "contacts", element: <Products /> },
      { path: "purchase/report", element: <Products /> },
      { path: "customers", element: <Products /> },
      { path: "salesinvoice", element: <Products /> },
      { path: "salesitem/recentitems", element: <Products /> },
      { path: "userlogs", element: <Products /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
