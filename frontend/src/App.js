import { Navigate, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";

import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import Products from "./pages/products";
import Cart from "./pages/cart";
import AdminPage from "./pages/homeAdmin";
import Profile from "./pages/profile";
import ProductDetail from "./pages/productDetail";
import CheckOut from "./pages/checkOut";
import About from "./pages/about";
import BlogPage from "./pages/blog";
import Contact from "./pages/contact";
import ProductDetailAdmin from "./components/Product/ProductDetailAdmin";
import AddProduct from "./components/Product/AddProduct";
import EditProductAdmin from "./components/Product/EditProductAdmin";
import MainDash from "./components/MainDash/MainDash";
import Orders from "./components/Orders/Orders";
import CustormersList from "./components/Customers/Custormers";
import ProductsList from "./components/Product/Products";
import CouponsPage from "./components/Coupons/Coupons";
import OrderDetail from "./components/Orders/OrderDetail";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem("token"));
    sync();

    const onAuth = () => sync();
    const onStorage = (e) => {
      if (e.key === "token") sync();
    };

    window.addEventListener("auth", onAuth);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth", onAuth);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div className="App">
      
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/store" element={<Products isLoggedIn={isLoggedIn} />} />
        <Route path="/cart" element={<Cart isLoggedIn={isLoggedIn} />} />
        <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} />} />
        
       
        <Route
          path="/checkout"
          element={<CheckOut isLoggedIn={isLoggedIn} />}
        />
        <Route path="/about" element={<About isLoggedIn={isLoggedIn} />} />
        <Route path="/blog" element={<BlogPage isLoggedIn={isLoggedIn} />} />
        <Route path="/contact" element={<Contact isLoggedIn={isLoggedIn} />} />
         <Route path="/product/:id" element={<ProductDetail isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        

       <Route
          path="/homeAdmin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<MainDash />} />
          <Route path="dashboard" element={<MainDash />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<CustormersList />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="product/:id" element={<ProductDetailAdmin />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product/:id" element={<EditProductAdmin />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />

        </Route>
       
      </Routes>
      
    </div>
  );
}

export default App;
