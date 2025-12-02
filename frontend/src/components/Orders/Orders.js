import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Orders.css";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("${API_BASE}/orders");
        const json = await res.json();

        if (json.success) {
          setOrders(json.data);
        }
      } catch (err) {
        console.error("Lỗi load đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
const updateStatus = async (id, newStatus) => {
  try {
    const res = await fetch(`http://localhost:8080/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    const json = await res.json();

    if (json.success) {
      // cập nhật UI ngay
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      );
    }
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
  }
};
const statusClass = {
   "Chờ xác nhận": "status-pending",
  "Chuẩn bị hàng": "status-preparing",
  "Đang vận chuyển": "status-shipping",
  "Đã giao": "status-delivered",
  "Đã hủy": "status-cancelled",
};

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="OrdersList">
      <h2>Orders List</h2>

      <table>
        <thead>
          <tr>
            <th>Order Code</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Total</th>
            <th>Date</th>
            <th>Status</th>
            <th>Chi tiết</th>
          </tr>
        </thead>


       <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.code}</td>
              <td>{o.contact?.fullName}</td>
              <td>
                {o.items
                  .map((p) => `${p.sku} - ${p.name} (x${p.qty})`)
                  .join(", ")}
              </td>
              <td>{o.total.toLocaleString()}₫</td>
              <td>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>

             
<td>
  <div className={`status-wrapper ${statusClass[o.status]}`}>
    <select
      className="status-select"
      value={o.status}
      onChange={(e) => updateStatus(o._id, e.target.value)}
    >
      <option value="Chờ xác nhận">Chờ xác nhận</option>
      <option value="Chuẩn bị hàng">Chuẩn bị hàng</option>
      <option value="Đang vận chuyển">Đang vận chuyển</option>
      <option value="Đã giao">Đã giao</option>
      <option value="Đã hủy">Đã hủy</option>
    </select>
  </div>
</td>






              {/* ➕ Nút Chi tiết */}
              <td>
                <Link
                  to={`/homeAdmin/orders/${o._id}`}
                  className="btn-detail"
                >
                  Xem
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersList;
