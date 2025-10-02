import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Cart({ isLoggedIn }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState([
    { id: 1, name: "Áo Thun Nam", price: 25, qty: 2, img: "/shop5.jpg" },
    { id: 2, name: "Váy Nữ", price: 55, qty: 1, img: "/shop6.jpg" },
  ]);

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const checkout = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="cart-page">
      <Header isLoggedIn={isLoggedIn} />

      <section className="cart container">
        <h2 className="featured__title">Your Cart</h2>
        {cart.length === 0 ? (
          <p>Giỏ hàng trống.</p>
        ) : (
          <div className="cart__table">
            {cart.map((item) => (
              <div key={item.id} className="cart__row">
                <div className="cart__img">
                  <img src={item.img} alt={item.name} />
                </div>
                <div className="cart__info">
                  <div className="cart__name">{item.name}</div>
                  <div className="cart__price">${item.price.toFixed(2)}</div>
                  <div className="cart__qty">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>
                      +
                    </button>
                  </div>
                  <button
                    className="btn btn--sm"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="cart__total">
              <h3>Total: ${total.toFixed(2)}</h3>
              <button className="btn btn--primary" onClick={checkout}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
