// src/pages/AdminPage.jsx
import React from "react";
import "../admin.css";
import Sidebar from "../components/Sidebar";
import RightSide from "../components/RightSide/RightSide";
import { Outlet } from "react-router-dom"; // ✅ thêm dòng này

function AdminPage() {
  return (
    <div className="AdminPage">
      <div className="Admin_OurStore">
        {/* Sidebar luôn hiện */}
        <Sidebar />

        {/* Đây là phần thay đổi khi route đổi */}
        <div className="main-content" style={{ flex: 1, padding: "10px" }}>
          <Outlet /> {/* 📍React Router sẽ render trang con ở đây */}
        </div>

        {/* RightSide cố định */}
        <RightSide />
      </div>
    </div>
  );
}

export default AdminPage;
