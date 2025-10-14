import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import { fetchProducts } from "../services/products";

export default function Products({ isLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const gender = params.get("gender") || "";
  const category = params.get("category") || "";
  const q = params.get("q") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("all");
  const [openSort, setOpenSort] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ page, limit: 12, gender, category, q }).then((res) => {
      let data = res.items || [];
      if (sort === "low") data = [...data].sort((a, b) => a.price - b.price);
      if (sort === "high") data = [...data].sort((a, b) => b.price - a.price);
      setItems(data);
      setLoading(false);
    });
  }, [page, gender, category, q, sort]);

  const addToCart = (p) => {
    if (!isLoggedIn) {
      alert("Bạn phải đăng nhập để thêm sản phẩm vào giỏ");
      navigate("/login");
      return;
    }
    alert(`Đã thêm ${p.name} vào giỏ`);
  };

  const buyNow = (p) => {
    if (!isLoggedIn) {
      alert("Bạn phải đăng nhập để mua hàng");
      navigate("/login");
      return;
    }
    navigate(`/checkout?product=${p.id}`);
  };

  return (
    <div className="products">
      <section className="shop">
        <div className="container">
          <h2 className="featured__title">Sản phẩm</h2>

          <div className="toolbar">
            <div className="select">
              <button
                className="select__btn"
                onClick={() => setOpenSort((o) => !o)}
              >
                {sort === "all"
                  ? "Tất cả sản phẩm"
                  : sort === "low"
                  ? "Giá từ thấp đến cao"
                  : "Giá từ cao đến thấp"}
                <span className={`chev ${openSort ? "up" : ""}`}>▼</span>
              </button>
              {openSort && (
                <div className="select__menu">
                  <button
                    className="select__item"
                    onClick={() => {
                      setSort("all");
                      setOpenSort(false);
                    }}
                  >
                    Tất cả sản phẩm
                  </button>
                  <button
                    className="select__item"
                    onClick={() => {
                      setSort("low");
                      setOpenSort(false);
                    }}
                  >
                    Giá từ thấp đến cao
                  </button>
                  <button
                    className="select__item"
                    onClick={() => {
                      setSort("high");
                      setOpenSort(false);
                    }}
                  >
                    Giá từ cao đến thấp
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="shop__grid">
            {loading
              ? "Loading..."
              : items.map((p) => (
                  <div key={p.id} className="card">
                    <div className="card__media">
                      <img src={p.image} alt={p.name} />
                      <div className="card__actions">
                        <button
                          className="circle-btn"
                          onClick={() => addToCart(p)}
                        >
                          <AddShoppingCartIcon fontSize="small" />
                        </button>
                        <button className="buy-btn" onClick={() => buyNow(p)}>
                          <PaymentIcon fontSize="small" />
                          <span>Mua ngay</span>
                        </button>
                      </div>
                    </div>
                    <div className="card__meta">
                      <div className="price">${Number(p.price).toFixed(2)}</div>
                      <div className="card__title">{p.name}</div>
                    </div>
                  </div>
                ))}
          </div>

          <div className="pager">
            <button
              className="pager__btn"
              disabled={page <= 1}
              onClick={() => setPage((x) => Math.max(1, x - 1))}
            >
              {"<"}
            </button>
            <span className="pager__dots">. . .</span>
            <button className="pager__btn" onClick={() => setPage(page + 1)}>
              {">"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
