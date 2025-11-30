import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:8080/orders/${orderId}`);
        const json = await res.json();
        if (json.success) setOrder(json.data);
      } catch (err) {
        console.error("Lỗi load chi tiết đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <p>Đang tải...</p>;
  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  return (
<div className="OrderDetail detail-wrapper">

      

      <h2 style={{ marginBottom: 20 }}>Chi tiết đơn hàng #{order.code}</h2>

    
      <div className="card p-20">
        <h3>Thông tin đơn hàng</h3>
        <div className="info-grid">
          <p><strong>Mã đơn:</strong> {order.code}</p>
        <p>
  <strong>Trạng thái:</strong>{" "}
  <span
    className={`status ${
      order.status?.toLowerCase().includes("hủy") ? "red" : "green"
    }`}
  >
    {order.status}
  </span>
</p>

          <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
          <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
          <p><strong>Phương thức vận chuyển:</strong> {order.shippingMethod}</p>
          <p><strong>Tạm tính:</strong> {order.subtotal.toLocaleString("vi-VN")}₫</p>
          <p><strong>Phí vận chuyển:</strong> {order.shipFee.toLocaleString("vi-VN")}₫</p>
          {/* Giảm giá voucher */}
{/* Giảm giá Voucher */}
{order.discount > 0 && (
  <p>
    <strong>Giảm giá (Voucher):</strong>{" "}
    -{order.discount.toLocaleString("vi-VN")}₫
  </p>
)}

{/* Giảm từ điểm thưởng */}
{(order.loyaltyUsedValue > 0 || order.loyaltyUsed > 0) && (
  <p>
    <strong>Giảm từ điểm thưởng:</strong>{" "}
    -{(
        order.loyaltyUsedValue ||
        (order.loyaltyUsed || 0) * 1000
      ).toLocaleString("vi-VN")}₫
  </p>
)}

{/* Tổng giảm */}
<p>
  <strong>Tổng giảm:</strong>{" "}
  -{( (order.discount || 0) + (order.loyaltyUsed || 0) * 1000)
      .toLocaleString("vi-VN")}₫
</p>

          <p><strong>Tổng tiền:</strong> <span style={{ color: "red", fontWeight: "bold" }}>{order.total.toLocaleString("vi-VN")}₫</span></p>
        </div>

        {order.voucherCode && (
          <p><strong>Voucher áp dụng:</strong> {order.voucherCode}</p>
        )}
      {/* Thông tin khách hàng */}
      
        <h3>Thông tin khách hàng</h3>
        <div className="info-grid">
          <p><strong>Họ tên:</strong> {order.contact?.fullName}</p>
          <p><strong>Email:</strong> {order.contact?.email}</p>
          <p><strong>SĐT:</strong> {order.contact?.phone}</p>
        </div>

        <h4>Địa chỉ giao hàng</h4>
       <p>
  {order.address?.line && `${order.address.line}, `}
  {order.address?.street && `${order.address.street}, `}
  {order.address?.ward && `${order.address.ward}, `}
  {order.address?.district && `${order.address.district}, `}
  {order.address?.city}
</p>

     
        <h3>Sản phẩm</h3>

        <table className="detail-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Tên sản phẩm</th>
              <th>Màu</th>
              <th>Size</th>
              <th>Số lượng</th>
              <th>Giá</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((p, i) => (
              <tr key={i}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.color}</td>
                <td>{p.size}</td>
                <td>{p.qty}</td>
                <td>{Number(p.priceVND || p.price).toLocaleString("vi-VN")}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default OrderDetail;
