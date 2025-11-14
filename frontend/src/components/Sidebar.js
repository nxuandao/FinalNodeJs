import React, { useState } from "react";
import "./Sidebar.css";
import Logo from "../imgs/logo.png";
import { UilSignOutAlt, UilBars } from "@iconscout/react-unicons";
import { SidebarData } from "../Data/Data";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [expanded, setExpanded] = useState(true);

  // 🧭 Map heading sang đường dẫn
  const getRouteForHeading = (heading) => {
    switch (heading.toLowerCase()) {
      case "dashboard":
        return "/homeAdmin/dashboard";
      case "orders":
        return "/homeAdmin/orders";
      case "customers":
        return "/homeAdmin/customers";
      case "products":
        return "/homeAdmin/products";
      case "addproduct":
        return "/homeAdmin/add-product";
      case "analytics":
        return "/homeAdmin/analytics";
      default:
        return "/homeAdmin/dashboard";
    }
  };

  const sidebarVariants = {
    true: { left: "0" },
    false: { left: "-60%" },
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Nút mở/đóng sidebar (mobile) */}
      <div
        className="bars"
        style={expanded ? { left: "37%" } : { left: "5%" }}
        onClick={() => setExpanded(!expanded)}
      >
        <UilBars />
      </div>

      <motion.div
        className="sidebar"
        variants={sidebarVariants}
        animate={window.innerWidth <= 768 ? `${expanded}` : ""}
      >
        {/* Logo */}
        <div className="logo">
          <img src={Logo} alt="logo" />
          <span>
            Our<span>Store</span>
          </span>
        </div>

        {/* Menu */}
        <div className="menu">
          {SidebarData.map((item, index) => {
            const route = getRouteForHeading(item.heading);
            const isActive = location.pathname === route;

            return (
              <div
                className={isActive ? "menuItem active" : "menuItem"}
                key={index}
                onClick={() => navigate(route)}
              >
                <item.icon />
                <span>{item.heading}</span>
              </div>
            );
          })}

          {/* Logout */}
          <div className="menuItem" onClick={handleLogout}>
            <UilSignOutAlt />
            <span>Logout</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
