import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "http://localhost:8080";

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

function SafeProductImage({ src, alt, placeholder = PLACEHOLDER_IMG }) {
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
        backgroundColor: "#f4f4f4",
      }}
    />
  );
}

const featuredBanners = [
  { id: 1, img: "/feat1.png", alt: "Banner 1" },
  { id: 2, img: "/feat1.png", alt: "Banner 2" },
  { id: 3, img: "/feat1.png", alt: "Banner 3" },
];

export default function Home({ isLoggedIn }) {
  const navigate = useNavigate();
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 8;

  const fetchProductsFromApi = async (pageArg = 1) => {
    const qs = new URLSearchParams();
    qs.set("page", pageArg);
    qs.set("limit", limit);
    const res = await fetch(`${API_BASE}/products?${qs.toString()}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
  const raw = Array.isArray(json?.data) ? json.data : [];
return raw.map((p) => {
  const first = Array.isArray(p.images)
    ? String(p.images[0] || "").trim()
    : "";

  let preferred =
    (p.image && String(p.image).trim()) || first || PLACEHOLDER_IMG;

  if (preferred && !preferred.startsWith("/") && !preferred.startsWith("http")) {
    preferred = "/" + preferred;
  }

  const clean = preferred.startsWith("http")
    ? normalizeUrl(preferred)
    : normalizeUrl(`${API_BASE}${preferred.startsWith("/") ? preferred : "/" + preferred}`);

  return {
    id: p._id || p.id,
    name: p.name ?? "",
    sku: p.sku || "",

    price: Number(p.price ?? 0),

    image: clean,
    images: Array.isArray(p.images)
      ? p.images.map((i) =>
          i.startsWith("http")
            ? normalizeUrl(i)
            : normalizeUrl(`${API_BASE}${i.startsWith("/") ? i : "/" + i}`)
        )
      : [clean],

    // 🎯 THÊM 2 DÒNG NÀY
    colors: Array.isArray(p.colors) ? p.colors : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
  };
});


  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchProductsFromApi(page);
        if (!cancelled) setShopProducts(data);
      } catch {
        if (!cancelled) setShopProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

const addToCart = (p, e) => {
  e.stopPropagation();

  // 🔒 Kiểm tra đăng nhập
  const token = localStorage.getItem("token");
  if (!token) {
    const confirmLogin = window.confirm(
      "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Bạn có muốn đăng nhập ngay không?"
    );
    if (confirmLogin) navigate("/login");
    return;
  }

  try {
    // 🧩 Lấy giỏ hàng hiện tại
    const raw = localStorage.getItem("cart");
    const cur = raw ? JSON.parse(raw) : [];

    // 🎯 LẤY MÀU ĐẦU TIÊN TRONG MONGO
    const selectedColor = Array.isArray(p.colors) && p.colors.length > 0
      ? p.colors[0]
      : "Default";

    // 🎯 LẤY SIZE ĐẦU TIÊN TRONG MONGO
    const selectedSize = Array.isArray(p.sizes) && p.sizes.length > 0
      ? p.sizes[0].size || p.sizes[0]
      : "Free Size";

    const idx = cur.findIndex(
      (i) =>
        i.id === p.id &&
        i.color === selectedColor &&
        i.size === selectedSize
    );

    if (idx >= 0) {
      cur[idx].qty += 1;
    } else {
      cur.push({
        id: p.id,
        name: p.name,
        img: p.image,
         sku: p.sku, 
        priceVND: Number(p.price) || 0,
        color: selectedColor,
        size: selectedSize,
        qty: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cur));

    alert("Đã thêm sản phẩm vào giỏ hàng!");
  } catch (err) {
    console.error(err);
    alert("Thêm sản phẩm thất bại, vui lòng thử lại!");
  }
};




const buyNow = (p, e) => {
  e.stopPropagation();

  const token = localStorage.getItem("token");
  if (!token) {
    const confirmLogin = window.confirm(
      "Bạn cần đăng nhập để mua hàng. Bạn có muốn đăng nhập ngay không?"
    );
    if (confirmLogin) navigate("/login");
    return;
  }

  try {
    // LẤY MÀU – SIZE ĐẦU TIÊN TRONG MONGO
    const selectedColor =
      Array.isArray(p.colors) && p.colors.length > 0
        ? p.colors[0]
        : "Default";

    const selectedSize =
      Array.isArray(p.sizes) && p.sizes.length > 0
        ? p.sizes[0].size || p.sizes[0]
        : "Free Size";

    // Tạo sản phẩm tạm
    const item = {
      id: p.id,
      name: p.name,
      sku: p.sku,
      img: p.image,
      priceVND: Number(p.price) || 0,
      color: selectedColor,
      size: selectedSize,
      qty: 1,
    };

    const key = `${item.id}__${item.color}__${item.size}`;

    // Lưu cart
    localStorage.setItem("cart", JSON.stringify([item]));

    // ⭐⭐ KEY QUAN TRỌNG: chọn sản phẩm cho checkout
    localStorage.setItem("cart_selected_keys", JSON.stringify([key]));

    navigate("/checkout");
  } catch (err) {
    console.error(err);
    alert("Mua hàng thất bại, vui lòng thử lại!");
  }
};


  const goDetail = (p) =>
    navigate(`/product/${p.id}`, { state: { product: p } });

  return (
    <div className="home">
      <Header isLoggedIn={isLoggedIn} />

      <section className="featured featured--viewport">
        <div className="featured__container">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            loop
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            spaceBetween={0}
            slidesPerView={1}
            className="featured-swiper"
          >
            {featuredBanners.map((b) => (
              <SwiperSlide key={b.id} className="featured-slide">
                <img className="featured__img" src={b.img} alt={b.alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="shop">
        <div className="container">
          <h2 className="featured__title">Shop Products</h2>
          <p className="featured__subtitle">Xem một số sản phẩm của shop</p>

          <div className="shop__grid">
            {loading && "Loading..."}
            {!loading &&
              shopProducts.map((p) => (
                <div
                  key={p.id}
                  className="card"
                  role="button"
                  tabIndex={0}
                  onClick={() => goDetail(p)}
                  onKeyDown={(e) => e.key === "Enter" && goDetail(p)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card__media">
                    <SafeProductImage src={p.image} alt={p.name} />
                    <div className="card__actions">
                      <button
                        className="circle-btn"
                        onClick={(e) => addToCart(p, e)}
                      >
                        <AddShoppingCartIcon fontSize="small" />
                      </button>
                      <button className="buy-btn" onClick={(e) => buyNow(p, e)}>
                        <PaymentIcon fontSize="small" />
                        <span>Mua hàng</span>
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

      <Footer />
    </div>
  );
}
