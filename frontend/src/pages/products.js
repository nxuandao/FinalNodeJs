import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";


const PLACEHOLDER_IMG = "https://via.placeholder.com/800x800?text=No+Image";

const normalizeUrl = (u) => {
  if (!u) return "";
  let s = String(u).trim().replace(/\\/g, "/");
  s = s.replace(/^https:\/*/i, "https://").replace(/^http:\/*/i, "http://");
  try {
    if (/^https?:\/\//i.test(s)) s = encodeURI(s);
  } catch {}
  return s;
};

function SafeProductImage({
  src,
  alt,
  placeholder = "https://via.placeholder.com/800x800?text=No+Image",
}) {
  const [bg, setBg] = useState(placeholder);
  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setBg(placeholder);
      return;
    }
    const url = String(src).trim().replace(/\\/g, "/");
    const img = new Image();
    try {
      img.referrerPolicy = "no-referrer";
    } catch {}
    img.onload = () => {
      if (!cancelled) setBg(url);
    };
    img.onerror = () => {
      if (!cancelled) setBg(placeholder);
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [src, placeholder]);

  return (
    <div
      role="img"
      aria-label={alt || ""}
      style={{
        width: "100%",
        height: 320,
        backgroundImage: `url("${bg}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "block",
        backgroundColor: "#f4f4f4",
      }}
    />
  );
}

const fallbackColors = ["Black", "White", "Gray"];
const fallbackSizes = ["S", "M", "L", "XL"];
const ensureOptions = (p) => ({
  colors:
    (Array.isArray(p?.colors) && p.colors.length && p.colors) || fallbackColors,
  sizes:
    (Array.isArray(p?.sizes) && p.sizes.length && p.sizes) || fallbackSizes,
});

export default function Products({ isLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const gender = params.get("gender") || "";
  const category = params.get("category") || "";
  const q = params.get("q") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("all");
  const [openSort, setOpenSort] = useState(false);
  const [error, setError] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState("cart");
  const [pickProduct, setPickProduct] = useState(null);
  const [pickImg, setPickImg] = useState("");
  const [pickColor, setPickColor] = useState("");
  const [pickSize, setPickSize] = useState("");
  const [pickQty, setPickQty] = useState(1);

  async function fetchProductsFromApi({
    page = 1,
    limit = 12,
    gender,
    category,
    q,
  }) {
    const qs = new URLSearchParams();
    qs.set("page", page);
    qs.set("limit", limit);
    if (q) qs.set("q", q);
    if (category) qs.set("category", category);
    if (gender) qs.set("gender", gender);

    const res = await fetch(`${API_BASE}/products?${qs.toString()}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    const json = await res.json();
    const raw = Array.isArray(json?.data) ? json.data : [];

    return raw.map((p) => {
      const first = Array.isArray(p.images)
        ? String(p.images[0] || "").trim()
        : "";
      const preferred =
        (p.image && String(p.image).trim()) || first || PLACEHOLDER_IMG;
      const clean = normalizeUrl(preferred);
      return {
        id: p._id || p.id,
        name: p.name ?? "",
        sku: p.sku || "",
        price: Number(p.price ?? 0),
        image: clean,
        images: Array.isArray(p.images) ? p.images.map(normalizeUrl) : [clean],
        colors: Array.isArray(p.colors)
  ? p.colors.map((c) => {
      // Nếu là mã HEX hợp lệ → giữ nguyên
      if (/^#([0-9A-F]{3}){1,2}$/i.test(c)) return c;

      // Nếu là tên màu → chuyển về dạng chuẩn Titlecase
      return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
    })
  : [],

        sizes: Array.isArray(p.sizes) ? p.sizes : [],
      };
    });
  }

  useEffect(() => {
    setPage(1);
  }, [q, category, gender]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchProductsFromApi({
          page,
          limit: 12,
          gender,
          category,
          q,
        });
        let sorted = data;
        if (sort === "low")
          sorted = [...data].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        if (sort === "high")
          sorted = [...data].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        if (!cancelled) setItems(sorted);
      } catch (e) {
        if (!cancelled) {
          setItems([]);
          setError("Không tải được sản phẩm. " + (e?.message || ""));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, gender, category, q, sort]);

  const openPicker = (mode, p, e) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn) {
      alert("Bạn phải đăng nhập để tiếp tục");
      navigate("/login");
      return;
    }
    const { colors, sizes } = ensureOptions(p);
    setPickProduct(p);
    setPickImg((p.images && p.images[0]) || p.image);
    setPickColor(colors[0]);
    setPickSize(sizes[0]);
    setPickQty(1);
    setPickerMode(mode);
    setPickerOpen(true);
  };

  const addCurrentToCart = () => {
    if (!pickProduct) return;
    const item = {
      id: pickProduct.id,
      sku: pickProduct.sku,
      name: pickProduct.name,
      img: pickImg || pickProduct.image,
      priceVND: Number(pickProduct.price) || 0,
      color: pickColor,
      size: pickSize,
      qty: pickQty,
    };
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      cart = [];
    }
    const idx = cart.findIndex(
      (x) => x.id === item.id && x.color === item.color && x.size === item.size
    );
    if (idx >= 0) cart[idx].qty += item.qty;
    else cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
  };

const onConfirmPicker = () => {
  const item = {
    id: pickProduct.id,
    sku: pickProduct.sku,
    name: pickProduct.name,
    img: pickImg || pickProduct.image,
    priceVND: Number(pickProduct.price) || 0,
    color: pickColor,
    size: pickSize,
    qty: pickQty,
  };

  if (pickerMode === "cart") {
    addCurrentToCart();
    setPickerOpen(false);
    window.dispatchEvent(new Event("cart-updated"));
    alert("Đã thêm vào giỏ hàng");
  } else {
    // ⭐ GIỐNG HOÀN TOÀN HOME.JSX
    const key = `${item.id}__${item.color}__${item.size}`;

    // Chỉ lưu đúng 1 sản phẩm để checkout
    localStorage.setItem("cart", JSON.stringify([item]));

    // Chỉ chọn đúng sản phẩm này
    localStorage.setItem("cart_selected_keys", JSON.stringify([key]));

    setPickerOpen(false);
    navigate("/checkout");
  }
};

const goDetail = (p) => {
  navigate(`/product/${p.id}`, { state: { product: p } });
};

  return (
    <div className="products">
      <Header isLoggedIn={isLoggedIn} />

      <section className="shop">
        <div className="container">
          <h2 className="featured__title">Products</h2>

          <div className="toolbar">
            <div className="select">
              <button
                className="select__btn"
                onClick={() => setOpenSort((o) => !o)}
              >
                {sort === "all"
                  ? "All products"
                  : sort === "low"
                  ? "Giá: Thấp đến Cao"
                  : "Giá: Cao đến Thấp"}
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
                    All products
                  </button>
                  <button
                    className="select__item"
                    onClick={() => {
                      setSort("low");
                      setOpenSort(false);
                    }}
                  >
                    Giá: Thấp đến Cao
                  </button>
                  <button
                    className="select__item"
                    onClick={() => {
                      setSort("high");
                      setOpenSort(false);
                    }}
                  >
                    Giá: Cao đến Thấp
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="shop__grid">
            {loading && "Loading..."}
            {!loading && error && <div className="error">{error}</div>}

            {!loading && !error && items.length === 0 && (
              <div
                className="empty"
                style={{ textAlign: "center", color: "#6b7280" }}
              >
                Không có sản phẩm phù hợp
              </div>
            )}

            {!loading &&
              !error &&
              items.map((p) => (
               <div
                  key={p.id}
                  className="card"
                  style={{ cursor: "pointer" }}
                  onClick={() => goDetail(p)}
                >

                  <div className="card__media">
                    <SafeProductImage src={p.image} alt={p.name} />
                    <div className="card__actions">
                      <button
                        className="circle-btn"
                        onClick={(e) => openPicker("cart", p, e)}
                        title="Thêm vào giỏ"
                      >
                        <AddShoppingCartIcon fontSize="small" />
                      </button>
                      <button
                        className="buy-btn"
                        onClick={(e) => openPicker("buy", p, e)}
                        title="Mua ngay"
                      >
                        <PaymentIcon fontSize="small" />
                        <span>Mua ngay</span>
                      </button>
                    </div>
                  </div>
                  <div className="card__meta">
                    <div className="price">
                      {isNaN(Number(p.price))
                        ? "—"
                        : `₫${Number(p.price).toLocaleString("vi-VN")}`}
                    </div>
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
            <button
              className="pager__btn"
              onClick={() => setPage((x) => x + 1)}
            >
              {">"}
            </button>
          </div>
        </div>
      </section>

      {pickerOpen && pickProduct && (
        <>
          <div
            onClick={() => setPickerOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.45)",
              zIndex: 90,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(94vw, 980px)",
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              boxShadow: "0 24px 80px rgba(0,0,0,.25)",
              zIndex: 91,
              padding: 18,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPickerOpen(false)}
              aria-label="Đóng"
              style={{
                position: "absolute",
                right: 10,
                top: 8,
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid #eee",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr",
                gap: 18,
              }}
            >
              <div>
                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 16,
                    background: "#fafafa",
                    aspectRatio: "1/1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={pickImg || pickProduct.image}
                    alt={pickProduct.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {(pickProduct.images?.length
                    ? pickProduct.images
                    : [pickProduct.image]
                  ).map((im) => (
                    <button
                      key={im}
                      onClick={() => setPickImg(im)}
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: 12,
                        border:
                          (pickImg || pickProduct.image) === im
                            ? "2px solid #111"
                            : "1px solid #eee",
                        overflow: "hidden",
                        background: "#fff",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={im}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: 22 }}>{pickProduct.name}</h3>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    margin: "6px 0 10px",
                  }}
                >
                  ₫{Number(pickProduct.price || 0).toLocaleString("vi-VN")}
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <div style={{ width: 90, color: "#555" }}>Kích thước:</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[...new Set(ensureOptions(pickProduct).sizes)].map((s) => (

                        <button
                          key={s}
                          onClick={() => setPickSize(s)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            border:
                              pickSize === s
                                ? "2px solid #111"
                                : "1px solid #e5e7eb",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <div style={{ width: 90, color: "#555" }}>Màu sắc:</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {ensureOptions(pickProduct).colors.map((c) => (
  <button
    key={c}
    onClick={() => setPickColor(c)}
    style={{
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: pickColor === c ? "2px solid #111" : "1px solid #ccc",
      background: c,               // ❗ DÙ HEX hay tên màu đều hiển thị đúng
      cursor: "pointer",
    }}
    title={c}                      // Hover sẽ hiện tên/mã màu
  />
))}

                    </div>
                  </div>

                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <div style={{ width: 90, color: "#555" }}>Số lượng:</div>
                    <div className="qtyctrl">
                      <button
                        onClick={() => setPickQty((q) => Math.max(1, q - 1))}
                      >
                        -
                      </button>
                      <span>{pickQty}</span>
                      <button onClick={() => setPickQty((q) => q + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    className="btn"
                    style={{ flex: 1 }}
                    onClick={() => setPickerOpen(false)}
                  >
                    Huỷ
                  </button>
                  <button
                    className="btn btn--primary"
                    style={{ flex: 1 }}
                    onClick={onConfirmPicker}
                  >
                    {pickerMode === "cart" ? "Thêm vào giỏ" : "Mua ngay"}
                  </button>
                </div>

                <div style={{ marginTop: 10 }}>
                  <Link to={`/product/${pickProduct.id}`}>
                    Xem chi tiết sản phẩm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
