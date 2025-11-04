import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("All fields are required");
    }

    try {
      const url = "http://localhost:8080/auth/login";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginInfo),
      });

      const result = await response.json();
      console.log("🔹 Login response:", result);

      const { success, message, error, jwtToken, user } = result;

      if (success) {
        handleSuccess(message);

        // ✅ Normalize user object — luôn có _id, name, role
        const normalizedUser = {
          ...user,
          _id: user?._id || user?.id || user?.userId || "",
          name: user?.name || "Guest",
          role: user?.role || "user",
        };

        // ✅ Lưu thông tin đăng nhập
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        localStorage.setItem("loggedInUser", normalizedUser.name);
        localStorage.setItem("loggedInUserName", normalizedUser.name);
        localStorage.setItem("loggedInUserRole", normalizedUser.role);

        // ✅ Trigger event để đồng bộ với App / Navbar
        window.dispatchEvent(new Event("auth"));

        // ✅ Chuyển hướng chính xác theo role
        if (
          normalizedUser.role === "admin" ||
          normalizedUser.role === "manager"
        ) {
          navigate("/homeAdmin");
        } else {
          navigate("/home");
        }
      } else if (error) {
        return handleError(
          error?.details?.[0]?.message ||
            error?.message ||
            message ||
            "Invalid email or password."
        );
      } else {
        return handleError(
          message || "Something went wrong. Please try again later."
        );
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      return handleError(
        err.message || "Something went wrong. Please try again later."
      );
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-left">
          <img
            src="https://i.pinimg.com/736x/2a/2f/b0/2a2fb00d0e6761e25bb60e59c09cc39f.jpg"
            alt="Illustration"
          />
        </div>

        <div className="signup-right">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="email">Email</label>
              <div className="form-group">
                <input
                  onChange={handleChange}
                  type="email"
                  placeholder="Enter your email..."
                  name="email"
                  value={loginInfo.email}
                />
              </div>

              <label htmlFor="password">Password</label>
              <div className="form-group">
                <input
                  onChange={handleChange}
                  type="password"
                  placeholder="Enter your password..."
                  name="password"
                  value={loginInfo.password}
                />
              </div>

              <div className="btn-group">
                <button type="submit" className="btn primary">
                  Login
                </button>
              </div>
            </div>
          </form>

          <ToastContainer />

          <div className="redirect-link">
            <center>
              Forgot your password? <Link to="/forgotPassword">Reset</Link>
            </center>
          </div>
          <div className="redirect-link">
            <center>
              Don't have an account? <Link to="/signup">Signup</Link>
            </center>
          </div>

          <p className="terms">
            By logging in, you agree with our{" "}
            <a href="#">Terms & Conditions</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </p>

          <div className="social-links">
            <a href="#">Facebook</a> · <a href="#">LinkedIn</a> ·{" "}
            <a href="#">Google</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
