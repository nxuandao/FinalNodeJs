import { Navigate, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";

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
          path="/product/:id"
          element={<ProductDetail isLoggedIn={isLoggedIn} />}
        />
        <Route
          path="/checkout"
          element={<CheckOut isLoggedIn={isLoggedIn} />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/homeAdmin" element={ <ProtectedRoute role="admin"> <AdminPage /> </ProtectedRoute> } />

        <Route path="/product/:id" element={<ProductDetail isLoggedIn={isLoggedIn} />} />
      </Routes>
    </div>
  );
}

export default App;
