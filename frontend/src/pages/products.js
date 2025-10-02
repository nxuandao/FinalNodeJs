import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_BASE =
    (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_API_BASE) ||
    "http://localhost:8080";

const PLACEHOLDER_IMG = "https://via.placeholder.com/800x800?text=No+Image";

/* ===== Helpers ===== */
const normalizeUrl = (u) => {
    if (!u) return "";
    let s = String(u).trim().replace(/\\/g, "/");
    s = s.replace(/^https:\/*/i, "https://").replace(/^http:\/*/i, "http://");
    try { if (/^https?:\/\//i.test(s)) s = encodeURI(s); } catch { }
    return s;
};

function SafeProductImage({ src, alt, placeholder = "https://via.placeholder.com/800x800?text=No+Image" }) {
    const [bg, setBg] = useState(placeholder);

    useEffect(() => {
        let cancelled = false;
        if (!src) {
            setBg(placeholder);
            return;
        }

        const url = String(src).trim().replace(/\\/g, "/");
        const img = new Image();
        // phòng host kén referrer
        try { img.referrerPolicy = "no-referrer"; } catch { }
        img.onload = () => { if (!cancelled) setBg(url); };
        img.onerror = () => { if (!cancelled) setBg(placeholder); };
        img.src = url;

        return () => { cancelled = true; };
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

export default function Products({ isLoggedIn }) {
    const location = useLocation();
    const navigate = useNavigate();

    // đọc query từ URL
    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const gender = params.get("gender") || "";
    const category = params.get("category") || "";
    const q = params.get("q") || "";

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState("all");
    const [openSort, setOpenSort] = useState(false);
    const [error, setError] = useState("");

    async function fetchProductsFromApi({ page = 1, limit = 12, gender, category, q }) {
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

        // ƯU TIÊN: p.image -> images[0] -> placeholder
        const mapped = raw.map((p) => {
            const first = Array.isArray(p.images) ? String(p.images[0] || "").trim() : "";
            const preferred = (p.image && String(p.image).trim()) || first || PLACEHOLDER_IMG;
            const clean = normalizeUrl(preferred); // dùng helper đã có

            return {
                id: p._id || p.id,
                name: p.name ?? "",
                price: Number(p.price ?? 0),
                image: clean,
            };
        });

        return mapped;
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
                const data = await fetchProductsFromApi({ page, limit: 12, gender, category, q });

                let sorted = data;
                if (sort === "low") sorted = [...data].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
                if (sort === "high") sorted = [...data].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

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
        return () => { cancelled = true; };
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
            <Header isLoggedIn={isLoggedIn} />

            <section className="shop">
                <div className="container">
                    <h2 className="featured__title">Products</h2>

                    {/* Toolbar */}
                    <div className="toolbar">
                        <div className="select">
                            <button className="select__btn" onClick={() => setOpenSort((o) => !o)}>
                                {sort === "all" ? "All products" : sort === "low" ? "Giá: Thấp đến Cao" : "Giá: Cao đến Thấp"}
                                <span className={`chev ${openSort ? "up" : ""}`}>▼</span>
                            </button>
                            {openSort && (
                                <div className="select__menu">
                                    <button className="select__item" onClick={() => { setSort("all"); setOpenSort(false); }}>All products</button>
                                    <button className="select__item" onClick={() => { setSort("low"); setOpenSort(false); }}>Giá: Thấp đến Cao</button>
                                    <button className="select__item" onClick={() => { setSort("high"); setOpenSort(false); }}>Giá: Cao đến Thấp</button>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Grid */}
                    <div className="shop__grid">
                        {loading && "Loading..."}
                        {!loading && error && <div className="error">{error}</div>}

                        {!loading && !error && items.length === 0 && (
                            <div className="empty" style={{ textAlign: "center", color: "#6b7280" }}>
                                Không có sản phẩm phù hợp
                            </div>
                        )}

                        {!loading && !error && items.map((p) => (
                            <div key={p.id} className="card">
                                <div className="card__media">
                                    <SafeProductImage src={p.image} alt={p.name} />

                                    <div className="card__actions">
                                        <button className="circle-btn" onClick={() => addToCart(p)}>
                                            <AddShoppingCartIcon fontSize="small" />
                                        </button>
                                        <button className="buy-btn" onClick={() => buyNow(p)}>
                                            <PaymentIcon fontSize="small" />
                                            <span>Mua ngay</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="card__meta">
                                    <div className="price">
                                        {isNaN(Number(p.price)) ? "—" : `₫${Number(p.price).toLocaleString("vi-VN")}`}
                                    </div>
                                    <div className="card__title">{p.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="pager">
                        <button className="pager__btn" disabled={page <= 1} onClick={() => setPage((x) => Math.max(1, x - 1))}>{"<"}</button>
                        <span className="pager__dots">. . .</span>
                        <button className="pager__btn" onClick={() => setPage((x) => x + 1)}>{">"}</button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
