// src/pages/AdminPage.jsx
import React from "react";
import "../admin.css";
import Sidebar from "../components/Sidebar";

import { Outlet } from "react-router-dom"; 

function AdminPage() {
  return (
    <div className="AdminPage">
      <div className="Admin_OurStore">
       
        <Sidebar />

      
        <div className="main-content" style={{ flex: 1, padding: "10px" }}>
          <Outlet /> 
        </div>

       
      </div>
    </div>
  );
}

export default AdminPage;
