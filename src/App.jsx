import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import './styles/App.css';
import AppLayout from "./components/AppLayout";
import Products from "./pages/Products";
import Login from "./pages/login";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Products /> },
      { path: "products", element: <Products /> },
      { path: "variants", element: <Products /> },
      { path: "inventory", element: <Products /> },
      { path: "stockmaster", element: <Products /> },
      { path: "purchase", element: <Products /> },
      { path: "contacts", element: <Products /> },
      { path: "purchase/report", element: <Products /> },
      { path: "customers", element: <Products /> },
      { path: "salesinvoice", element: <Products /> },
      { path: "salesitem/recentitems", element: <Products /> },
      { path: "userlogs", element: <Products /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
