import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import { useNavigate } from "react-router-dom";

const featured = [
  { id: 1, name: "Shield Spray", price: 37, img: "/feat1.jpg" },
  { id: 2, name: "Nourishing Eye Cream", price: 19, img: "/feat2.jpg" },
  { id: 3, name: "Nourishing Moisture Mask", price: 35, img: "/feat3.jpg" },
];

const shopProducts = [
  { id: 101, name: "Áo Khoác Nam", price: 45, img: "/shop4.jpg" },
  { id: 102, name: "Áo Thun Nam", price: 25, img: "/shop5.jpg" },
  { id: 103, name: "Váy Nữ", price: 55, img: "/shop6.jpg" },
  { id: 104, name: "Quần Dài Nữ", price: 40, img: "/shop7.jpg" },
  { id: 105, name: "Áo Sơmi Nữ", price: 30, img: "/shop8.jpg" },
  { id: 106, name: "Áo Khoác Nữ", price: 50, img: "/shop9.jpg" },
  { id: 107, name: "Quần Short Nam", price: 28, img: "/shop2.jpg" },
  { id: 108, name: "Áo Thun Nữ", price: 26, img: "/shop3.jpg" },
];

export default function Home({ isLoggedIn }) {
  const navigate = useNavigate();

  const addToCart = (p) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    alert(`Đã thêm ${p.name} vào giỏ`);
  };

  const buyNow = (p) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate(`/checkout?product=${p.id}`);
  };

  return (
    <div className="home">
      <Header isLoggedIn={isLoggedIn} />

      <section className="featured">
        <div className="container">
          <h2 className="featured__title">Our Featured Products</h2>
          <p className="featured__subtitle">Get the skin you want to feel</p>
          <div className="shop__grid">
            {featured.map((p) => (
              <div key={p.id} className="card">
                <div className="card__media">
                  <img src={p.img} alt={p.name} />
                  <div className="card__actions">
                    <button className="circle-btn" onClick={() => addToCart(p)}>
                      <AddShoppingCartIcon fontSize="small" />
                    </button>
                    <button className="buy-btn" onClick={() => buyNow(p)}>
                      <PaymentIcon fontSize="small" />
                      <span>Mua hàng</span>
                    </button>
                  </div>
                </div>
                <div className="card__meta">
                  <div className="price">${p.price.toFixed(2)}</div>
                  <div className="card__title">{p.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shop">
        <div className="container">
          <h2 className="featured__title">Shop Products</h2>
          <p className="featured__subtitle">Xem một số sản phẩm của shop</p>
          <div className="shop__grid">
            {shopProducts.map((p) => (
              <div key={p.id} className="card">
                <div className="card__media">
                  <img src={p.img} alt={p.name} />
                  <div className="card__actions">
                    <button className="circle-btn" onClick={() => addToCart(p)}>
                      <AddShoppingCartIcon fontSize="small" />
                    </button>
                    <button className="buy-btn" onClick={() => buyNow(p)}>
                      <PaymentIcon fontSize="small" />
                      <span>Mua hàng</span>
                    </button>
                  </div>
                </div>
                <div className="card__meta">
                  <div className="price">${p.price.toFixed(2)}</div>
                  <div className="card__title">{p.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
