import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const removeItem = (id) => {
    const newCart = cartItems.filter((item) => item.id !== id);
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      setCartItems([]);
      localStorage.removeItem("cart");
    }
  };

  return (
    <div className="cart container">
      <h1>🛒 Giỏ hàng của bạn</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Giỏ hàng đang trống.</p>
          <Link className="btn" to="/store">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={item.img}
                      alt={item.name}
                      className="cart-thumb"
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>{item.qty}</td>
                  <td>${item.price * item.qty}</td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-summary">
            <p>
              <strong>Tổng cộng:</strong> ${total}
            </p>
            <div className="cart-actions">
              <button className="btn clear" onClick={clearCart}>
                Xóa toàn bộ
              </button>
              <button className="btn checkout">Thanh toán</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
