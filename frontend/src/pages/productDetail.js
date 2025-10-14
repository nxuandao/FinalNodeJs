import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const products = [
  {
    id: 101,
    name: "Áo Khoác Nam",
    price: 45,
    img: "/shop4.jpg",
    gender: "nam",
    type: "Áo khoác",
  },
  {
    id: 102,
    name: "Áo Thun Nam",
    price: 25,
    img: "/shop4.jpg",
    gender: "nam",
    type: "Áo thun",
  },
  {
    id: 103,
    name: "Váy Nữ",
    price: 55,
    img: "/shop4.jpg",
    gender: "nu",
    type: "Váy",
  },
  {
    id: 104,
    name: "Quần Short Nữ",
    price: 29,
    img: "/shop4.jpg",
    gender: "nu",
    type: "Quần short",
  },
  {
    id: 105,
    name: "Áo Sơmi Nữ",
    price: 39,
    img: "/shop4.jpg",
    gender: "nu",
    type: "Áo sơmi",
  },
  {
    id: 106,
    name: "Quần Dài Nam",
    price: 49,
    img: "/shop4.jpg",
    gender: "nam",
    type: "Quần dài",
  },
  {
    id: 107,
    name: "Đầm Nữ",
    price: 69,
    img: "/shop4.jpg",
    gender: "nu",
    type: "Đầm",
  },
  {
    id: 108,
    name: "Chân Váy",
    price: 35,
    img: "/shop4.jpg",
    gender: "nu",
    type: "Váy",
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => String(p.id) === String(id));
  const [qty, setQty] = useState(1);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.gender === product.gender || p.type === product.type)
      )
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="container" style={{ padding: "40px 0" }}>
        <p>Sản phẩm không tồn tại.</p>
        <button className="btn" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="pdetail">
        <div className="container">
          <nav className="breadcrumb" style={{ marginBottom: 16 }}>
            <Link to="/">Trang chủ</Link> / <span>{product.name}</span>
          </nav>
          <div className="pdetail__grid">
            <div className="pdetail__media">
              <img src={product.img} alt={product.name} />
            </div>
            <div className="pdetail__info">
              <h1 className="pdetail__title">{product.name}</h1>
              <p className="pdetail__price">${product.price}</p>
              <div className="pdetail__row">
                <span>Số lượng</span>
                <div className="qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    -
                  </button>
                  <input
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                  <button onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
              </div>
              <div className="pdetail__actions">
                <button className="btn btn--primary">Thêm vào giỏ</button>
                <button className="btn">Mua ngay</button>
              </div>
              <div className="pdetail__meta">
                <p>Giới tính: {product.gender === "nam" ? "Nam" : "Nữ"}</p>
                <p>Phân loại: {product.type}</p>
              </div>
              <div className="pdetail__desc">
                <p>
                  Sản phẩm chất liệu bền, form dáng hiện đại, phù hợp đi làm và
                  dạo phố.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="shop">
          <div className="container">
            <h3 style={{ margin: "0 0 10px" }}>Sản phẩm liên quan</h3>
            <div className="shop__grid">
              {related.map((p) => (
                <article key={p.id} className="card">
                  <div className="card__media">
                    <img src={p.img} alt={p.name} />
                    <div className="card__hit">
                      <Link
                        to={`/product/${p.id}`}
                        aria-label={`Xem ${p.name}`}
                      />
                    </div>
                    <div className="card__actions">
                      <button className="circle-btn">♡</button>
                      <Link to={`/product/${p.id}`} className="buy-btn">
                        Xem
                      </Link>
                      <button className="circle-btn">＋</button>
                    </div>
                  </div>
                  <div className="card__meta">
                    <p className="card__title">{p.name}</p>
                    <p className="price">${p.price}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
