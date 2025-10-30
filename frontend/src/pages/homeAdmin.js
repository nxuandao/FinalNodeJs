import React from "react";
import "../admin.css";
// import Sidebar from "../components/Sidebar/Sidebar";
import MainDash from "../components/MainDash/MainDash";
import RightSide from '../components/RightSide/RightSide';
import Sidebar from "../components/Sidebar";
// import RightSide from "../components/RightSide/RightSide";
import OrdersList from "../components/Orders/Orders";
import CustomersList from "../components/Customers/Custormers";
import ProductsList from "../components/Product/Products";
import AnalyticsPage from "../components/Analytics/Analytics";
import { useState } from "react";

function AdminPage() {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="AdminPage">
      <div className = "Admin_OurStore">
        <Sidebar setActivePage={setActivePage} />
        {/* {activePage === "Dashboard" && <MainDash />}
        {activePage === "Orders" && <OrdersList />} */}
        {activePage === "Dashboard" && <MainDash />}
        {activePage === "Orders" && <OrdersList />}
        {activePage === "Customers" && <CustomersList />}
        {activePage === "Products" && <ProductsList />}
        {activePage === "Analytics" && <AnalyticsPage />}
        <RightSide/>
      </div>
    </div>
  );
}

export default AdminPage;
