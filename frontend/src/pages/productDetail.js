import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { parseVND } from "./price.js";
import { handleSuccess, handleError } from "../utils.js";
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "http://localhost:8080";

// ⭐ Tối giản: Component chọn sao (không đổi layout tổng)
function StarRating({ value = 0, onChange, readOnly = false, size = 18 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange && onChange(n)}
          aria-label={`Đánh giá ${n} sao`}
          disabled={readOnly}
          style={{
            fontSize: size,
            lineHeight: 1,
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: readOnly ? "default" : "pointer",
          }}
        >
          <span style={{ color: n <= display ? "#f5c106" : "#ccc" }}>
            {n <= display ? "★" : "☆"}
          </span>
        </button>
      ))}
    </span>
  );
}

function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // { id, role, iat, exp }
  } catch {
    return null;
  }
}

export default function ProductDetail({ isLoggedIn }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(null);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);

  // ⬇️ NEW: state review
  const [reviews, setReviews] = useState([]);
  const currentUser = getCurrentUser();

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const p = json?.data || json || {};
        const images = Array.isArray(p.images)
          ? p.images
          : p.image
            ? [p.image]
            : [];
        const colors = Array.isArray(p.colors)
          ? p.colors.map(c => String(c).trim()).filter(Boolean)
          : [];
        const sizes = Array.isArray(p.sizes)
          ? p.sizes.map(it => {
            if (typeof it === "string") return it.trim();
            if (it && typeof it.size === "string") return it.size.trim();
            return "";
          }).filter(Boolean)
          : [];

        const priceVND =
          typeof p.price === "number" ? p.price : Number(p.price || 0);
        const normalized = {
          id: p._id || p.id || id,
          name: p.name || "Sản phẩm",
          priceVND,
          images,
          colors,
          sizes,
          desc: p.description || "",
          // ⬇️ NEW: đọc reviews nếu backend trả về
          sizesData: Array.isArray(p.sizes) ? p.sizes : [],
          reviews: Array.isArray(p.reviews) ? p.reviews : [],
        };
        if (!cancelled) {
          setProduct(normalized);
          setReviews(normalized.reviews);
        }
      } catch {
        if (!cancelled) {
          setProduct({
            id,
            name: "Sản phẩm",
            priceVND: 0,
            images: ["/shop1.jpg"],
            colors: ["Black", "White"],
            sizes: ["S", "M", "L"],
            desc: "",
          });
          setReviews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const firstImg = useMemo(
    () => product?.images?.[0] ?? null,
    [product?.images]
  );
  const firstColor = useMemo(
    () => product?.colors?.[0] ?? null,
    [product?.colors]
  );
  const firstSize = useMemo(
    () => product?.sizes?.[0] ?? null,
    [product?.sizes]
  );

  useEffect(() => {
    if (!product) return;
    setActiveImg(firstImg);
    setColor(firstColor);
    setSize(firstSize);
    setQty(1);
  }, [product, firstImg, firstColor, firstSize]);

const addToCart = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    const confirmLogin = window.confirm("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Bạn có muốn đăng nhập ngay không?");
    if (confirmLogin) {
      navigate("/login");
    }
    return;
  }

  try {
    // Validate chọn option nếu có
    if (Array.isArray(product.colors) && product.colors.length && !color) {
      handleError?.("Vui lòng chọn màu sắc");
      return;
    }
    if (Array.isArray(product.sizes) && product.sizes.length && !size) {
      handleError?.("Vui lòng chọn kích cỡ");
      return;
    }

    const id = product.id || product._id;
    if (!id) {
      handleError?.("Thiếu mã sản phẩm");
      return;
    }

    const qtyNum = Math.max(1, parseInt(qty, 10) || 1);
    const img =
      activeImg ||
      (Array.isArray(product.images) ? product.images[0] : product.image) ||
      "";

    const priceVND = parseVND(product.priceVND ?? product.price);

    const item = {
      id: product.id || product._id,
      sku: product.sku,
      name: product.name || "Sản phẩm",
      img,
      priceVND,
      color: color || "",
      size: size || "",
      qty: qtyNum,
    };

    let list = [];
    try {
      list = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }

    const idx = list.findIndex(
      (x) => x.id === item.id && x.color === item.color && x.size === item.size
    );
    if (idx >= 0) {
      list[idx].qty = Number(list[idx].qty || 1) + item.qty;
    } else {
      list.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(list));
    handleSuccess?.("Đã thêm vào giỏ hàng");
    navigate("/cart");
  } catch (e) {
    console.error(e);
    handleError?.("Thêm vào giỏ thất bại, vui lòng thử lại");
  }
};



const buyNow = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    const confirmLogin = window.confirm("Bạn cần đăng nhập để mua hàng. Bạn có muốn đăng nhập ngay không?");
    if (confirmLogin) {
      navigate("/login");
    }
    return;
  }

  const item = {
    id: product.id,
    name: product.name,
    img: activeImg || product.images?.[0] || "",
    priceVND: product.priceVND || 0,
    color,
    size,
    qty,
  };
  localStorage.setItem("cart", JSON.stringify([item]));
  navigate("/checkout");
};


  // ⬇️ NEW: submit review (đánh giá bằng sao)
  const submitReview = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
     const confirmLogin = window.confirm("Bạn cần đăng nhập để đánh giá. Bạn có muốn đăng nhập ngay không?");
    if (confirmLogin) {
      navigate("/login");
    }
      return;
    }

    const text = content.trim();
    const ratingNum = Number(rating);
    if (!text || ratingNum < 1 || ratingNum > 5) {
      alert("Vui lòng nhập nội dung và chọn số sao hợp lệ!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // backend chấp nhận Bearer
        },
        body: JSON.stringify({ rating: ratingNum, content: text }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        const newReviews = Array.isArray(data.data?.reviews)
          ? data.data.reviews
          : [];
        setReviews(newReviews);
        setRating(5);
        setContent("");
        alert("Gửi đánh giá thành công!");
      } else if (res.status === 401 || res.status === 403) {
        alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert(data?.message || "Không thể gửi đánh giá.");
      }
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      alert("Có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };
const deleteReview = async (createdAt) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn cần đăng nhập để xoá đánh giá!");
    navigate("/login");
    return;
  }

  if (!window.confirm("Bạn muốn xoá đánh giá này?")) return;

  try {
    const res = await fetch(`${API_BASE}/products/${id}/reviews/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ createdAt }),
    });

    const data = await res.json();

    if (data.success) {
      setReviews(data.data.reviews);
      alert("Xoá đánh giá thành công!");
    } else {
      alert(data.message || "Không xoá được đánh giá");
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi kết nối server");
  }
};

  return (
    <div className="product-detail-page">
      <Header isLoggedIn={isLoggedIn} />

      <div className="container">
        <nav className="pd-breadcrumb">
          <a href="/home">Home</a> <span>/</span> <a href="/store">Store</a>{" "}
          <span>/</span> <span>{product?.name || "Loading..."}</span>
        </nav>

        {loading || !product ? (
          <section className="pf-panel" style={{ minHeight: 320 }}>
            Đang tải...
          </section>
        ) : (
          <section className="pd-wrap">
            <div className="pd-gallery">
              <div className="pd-hero">
                {activeImg ? (
                  <img src={activeImg} alt={product.name} />
                ) : (
                  <div />
                )}
              </div>

              {!!product.images?.length && (
                <div className="pd-thumbs">
                  {product.images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      className={`pd-thumb ${activeImg === img ? "is-active" : ""
                        }`}
                      onClick={() => setActiveImg(img)}
                    >
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}

              {/* ====== MÔ TẢ SẢN PHẨM: ngay sau hình ảnh ====== */}
              {product.desc && (
                <div className="pd-desc-after">
                  <div className="pd-desc-title">Mô tả sản phẩm</div>
                  <div className="pd-desc-text" style={{ whiteSpace: "pre-wrap" }}>
                    {product.desc}
                  </div>
                </div>
              )}

              {/* ====== ĐÁNH GIÁ SẢN PHẨM: bên dưới mô tả ====== */}
              <div className="pd-reviews" style={{ marginTop: 16 }}>
                <div className="pd-rev-title" style={{ fontWeight: 600, marginBottom: 8 }}>
                  Đánh giá sản phẩm
                </div>

                {/* Form đánh giá bằng sao */}
                <form onSubmit={submitReview} className="pd-rev-form" style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ marginBottom: 4 }}>Chọn số sao:</div>
                    <StarRating value={rating} onChange={setRating} size={22} />
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      Bạn chọn: {rating} ★
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <div style={{ marginBottom: 4 }}>Nội dung đánh giá:</div>
                    <textarea
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Chia sẻ cảm nhận của bạn…"
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>

                  <button type="submit" disabled={submitting} className="btn">
                    {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </form>

                {/* Danh sách đánh giá */}
                <div className="pd-rev-list">
                  {(!reviews || reviews.length === 0) && (
                    <div>Chưa có đánh giá.</div>
                  )}
                  {reviews.map((rv, idx) => (
                    <div
                      key={idx}
                      className="pd-rev-item"
                      style={{
                        borderTop: "1px solid #eee",
                        paddingTop: 8,
                        marginTop: 8,
                      }}
                    >
                      <div
                        className="pd-rev-meta"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 14,
                        }}
                      >
                       <b>
  {currentUser?.id === rv.userId ? "Bạn" : rv.userName || "Người dùng"}
</b>

{currentUser?.id === rv.userId && (
  <button
    onClick={() => deleteReview(rv.createdAt)}
    style={{
      marginLeft: "auto",
      color: "red",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: 12,
    }}
  >
    Xóa
  </button>
)}

                        <span>•</span>
                        <StarRating value={rv.rating} readOnly size={14} />
                        {rv.createdAt && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(rv.createdAt).toLocaleString("vi-VN")}
                            </span>
                          </>
                        )}
                      </div>
                      <div
                        className="pd-rev-content"
                        style={{ marginTop: 4, whiteSpace: "pre-wrap" }}
                      >
                        {rv.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* =============================================== */}
            </div>

            <div className="pd-info">
              <h1 className="pd-title">{product.name}</h1>
              <div className="pd-price">
                {new Intl.NumberFormat("vi-VN").format(product.priceVND)} VND
              </div>

              {/* (ĐÃ chuyển mô tả sang cột trái sau ảnh) */}
              {/* {product.desc && <p className="pd-desc">{product.desc}</p>} */}

              {!!product.colors?.length && (
                <div className="pd-row">
                  <div className="pd-label">Màu sắc</div>
                  <div className="pd-options">
                 {product.colors.map((c) => (
                  <button
                    key={`c-${c}`}
                    onClick={() => setColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: color === c ? "2px solid #000" : "1px solid #ccc",
                      background: c.toLowerCase(), // Tự đổi thành màu
                      cursor: "pointer",
                      marginRight: 8,
                    }}
                  />
                ))}

                  </div>
                </div>
              )}

              {!!product.sizes?.length && (
                <div className="pd-row">
                  <div className="pd-label">Kích cỡ</div>
                  <div className="pd-options">
                    {product.sizes.map((s) => (
                      <button
                        key={`s-${s}`}
                        className={`pd-chip ${size === s ? "on" : ""}`}
                        onClick={() => setSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pd-row">
                <div className="pd-label">Số lượng</div>
                <div className="pd-qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    -
                  </button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
              </div>

              <div className="pd-actions">
                <button className="btn" onClick={addToCart}>
                  Thêm vào giỏ
                </button>
                <button className="btn btn--primary" onClick={buyNow}>
                  Mua ngay
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
