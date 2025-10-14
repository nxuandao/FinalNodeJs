import { useMemo, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function PrivateRoute() {
  const location = useLocation();
  const isAuthed = !!localStorage.getItem("token");
  if (!isAuthed) return <Navigate to="/" replace state={{ from: location }} />;
  return <Outlet />;
}

const featuredSlides = [
  { id: 1, img: "/feat1.jpg", title: "Bộ sưu tập Thu 2025" },
  { id: 2, img: "/feat2.jpg", title: "Ưu đãi Đồ Nữ" },
  { id: 3, img: "/feat3.jpg", title: "Đồ Nam Thời Thượng" },
];

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

function normalize(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function matchesGender(pGender, fGender) {
  if (!fGender) return true;
  return normalize(pGender) === normalize(fGender);
}

function matchesType(pType, fType) {
  if (!fType) return true;
  const t = normalize(fType);
  const pt = normalize(pType);

  if (pt === t) return true;

  if (
    ["quan", "pants", "bottom", "quandai", "quanshort"].some((k) =>
      t.includes(k)
    )
  ) {
    return pt.includes("quan");
  }
  if (
    ["ao", "tops", "shirt", "khoac", "thun", "somi"].some((k) => t.includes(k))
  ) {
    return pt.includes("ao");
  }
  if (
    ["vay", "chan vay", "chanvay", "dam", "dress", "skirt"].some((k) =>
      t.includes(k)
    )
  ) {
    return pt.includes("vay") || pt.includes("dam");
  }

  return pt.includes(t);
}

function FeaturedCarousel() {
  return (
    <section className="featured-carousel">
      <div className="container">
        <Swiper
          className="mySwiper"
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 2800, disableOnInteraction: false }}
          loop
          centeredSlides
        >
          {featuredSlides.map((s) => (
            <SwiperSlide key={s.id}>
              <img src={s.img} alt={s.title} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function ShopGrid({ items }) {
  const pageSize = 6;
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const view = items.slice(page * pageSize, page * pageSize + pageSize);
  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(pages - 1, p + 1));

  return (
    <section className="shop">
      <div className="container">
        <div className="shop__grid">
          {view.map((p) => (
            <article key={p.id} className="card">
              <div className="card__media">
                <img src={p.img} alt={p.name} />
                <div className="card__hit">
                  <Link to={`/product/${p.id}`} aria-label={`Xem ${p.name}`} />
                </div>
                <div className="card__actions">
                  <button className="circle-btn" title="Yêu thích">
                    ♡
                  </button>
                  <Link
                    to={`/product/${p.id}`}
                    className="buy-btn"
                    title="Xem & Mua"
                  >
                    Mua ngay
                  </Link>
                  <button className="circle-btn" title="Thêm giỏ">
                    ＋
                  </button>
                </div>
              </div>
              <div className="card__meta">
                <p className="card__title">{p.name}</p>
                <p className="price">${p.price}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="pager">
          <button className="pager__btn" onClick={prev} disabled={page === 0}>
            &lt;
          </button>
          <span className="pager__dots">...</span>
          <button
            className="pager__btn"
            onClick={next}
            disabled={page >= pages - 1}
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home({ activeFilter }) {
  const filtered = useMemo(() => {
    if (!activeFilter) return products;
    const gender = activeFilter.gender;
    const type = activeFilter.type;

    return products.filter(
      (p) => matchesGender(p.gender, gender) && matchesType(p.type, type)
    );
  }, [activeFilter]);

  return (
    <>
      <FeaturedCarousel />
      <ShopGrid items={filtered} />
    </>
  );
}
