import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home, { PrivateRoute } from "./pages/home";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import Products from "./pages/products";
import Cart from "./pages/cart";
import Profile from "./pages/profile";
import ProductDetail from "./pages/productDetail";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem("token"));
    sync();
    const onAuth = () => sync();
    const onStorage = (e) => e.key === "token" && sync();
    window.addEventListener("auth", onAuth);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth", onAuth);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const hideLayout = [
    "/login",
    "/signup",
    "/forgotPassword",
    "/reset-password",
  ].some((path) => location.pathname.startsWith(path));

  return (
    <div className="App">
      {!hideLayout && <Header isLoggedIn={isLoggedIn} />}

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/home" replace /> : <Signup />}
        />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<PrivateRoute />}>
          <Route path="/store" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/products/:id"
            element={<ProductDetail isLoggedIn={isLoggedIn} />}
          />
        </Route>
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
