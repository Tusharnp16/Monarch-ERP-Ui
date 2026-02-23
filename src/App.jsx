import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import './styles/App.css';
import AppLayout from './components/AppLayout'; 
import Products from './pages/Products';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, 
    children: [
      { path: "products", element: <Products /> },
      { path: "inventory", element: <Products /> },
      { path: "variants", element: <Products /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;