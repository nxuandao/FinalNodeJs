import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useRef, useState, useEffect } from "react";

const GROUPS = [
  {
    title: "Nam",
    key: "nam",
    items: [
      { label: "Áo Sơmi", value: "nam-ao-somi" },
      { label: "Áo Khoác", value: "nam-ao-khoac" },
      { label: "Áo Thun", value: "nam-ao-thun" },
      { label: "Quần Dài", value: "nam-quan-dai" },
      { label: "Quần Short", value: "nam-quan-short" },
    ],
  },
  {
    title: "Nữ",
    key: "nu",
    items: [
      { label: "Áo Sơmi", value: "nu-ao-somi" },
      { label: "Áo Thun", value: "nu-ao-thun" },
      { label: "Áo Khoác", value: "nu-ao-khoac" },
      { label: "Quần Dài", value: "nu-quan-dai" },
      { label: "Quần Short", value: "nu-quan-short" },
      { label: "Váy", value: "nu-vay" },
      { label: "Đầm", value: "nu-dam" },
      { label: "Chân Váy", value: "nu-chan-vay" },
    ],
  },
];

export default function Header({ isLoggedIn }) {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected] = useState("");
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/store") return;
    const cat = new URLSearchParams(location.search).get("cat");
    if (!cat) {
      setSelected("");
      return;
    }
    const arr = cat.split(",");
    if (arr.length === 1) {
      setSelected(arr[0]);
      return;
    }
    const namSet = new Set(GROUPS[0].items.map((i) => i.value));
    const nuSet = new Set(GROUPS[1].items.map((i) => i.value));
    const arrSet = new Set(arr);
    if (arr.length === namSet.size && [...namSet].every((v) => arrSet.has(v))) {
      setSelected("group:nam");
    } else if (
      arr.length === nuSet.size &&
      [...nuSet].every((v) => arrSet.has(v))
    ) {
      setSelected("group:nu");
    } else {
      setSelected("");
    }
  }, [location.pathname, location.search]);

  const onSearchSubmit = (e) => {
    if (e.key === "Enter") {
      const qs = new URLSearchParams({ q: search }).toString();
      navigate(`/store?${qs}`);
    }
  };

  const goStore = (catValues) => {
    const qs = new URLSearchParams();
    if (catValues.length) qs.set("cat", catValues.join(","));
    navigate(`/store${qs.toString() ? `?${qs.toString()}` : ""}`, {
      replace: location.pathname === "/store",
    });
  };

  const chooseItem = (slug) => {
    setSelected(slug);
    goStore([slug]);
  };

  const chooseGroup = (key) => {
    const group = GROUPS.find((g) => g.key === key);
    if (!group) return;
    setSelected(`group:${key}`);
    goStore(group.items.map((i) => i.value));
  };

  return (
    <header className="site-header">
      <div className="container nav__inner">
        <nav className="nav__menu">
          <Link to="/home">HOME</Link>
          <Link to="/about">ABOUT</Link>
          <Link to="/store">STORE</Link>
          <Link to="/blog">BLOG</Link>
          <Link to="/contact">CONTACT</Link>
        </nav>

        <div className="nav__logo">OurShop</div>

        <div className="nav__right">
          <div className="nav__searchwrap">
            <SearchIcon fontSize="small" />
            <input
              className="nav__search"
              placeholder="Tìm kiếm…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onSearchSubmit}
            />
          </div>

          <div className="filterwrap" ref={filterRef}>
            <button
              className="icon-btn"
              onClick={() => setShowFilter((v) => !v)}
              aria-label="Bộ lọc"
              title="Bộ lọc"
              type="button"
            >
              <FilterListIcon />
            </button>

            {showFilter && (
              <div className="filterbar">
                <div className="filter-panel">
                  {GROUPS.map((g) => (
                    <div className="list-group" key={g.key}>
                      <button
                        type="button"
                        className="list-title"
                        onClick={() => chooseGroup(g.key)}
                        title={`Xem tất cả sản phẩm ${g.title}`}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        {g.title}
                      </button>
                      <div className="list-stack">
                        {g.items.map((it) => {
                          const active = selected === it.value;
                          return (
                            <button
                              key={it.value}
                              type="button"
                              className={`list-item ${
                                active ? "is-active" : ""
                              }`}
                              onClick={() => chooseItem(it.value)}
                              title={`${g.title} - ${it.label}`}
                            >
                              {it.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoggedIn && (
            <button
              className="icon-btn"
              onClick={() => navigate("/cart")}
              aria-label="Giỏ hàng"
              title="Giỏ hàng"
              type="button"
            >
              <ShoppingCartIcon />
            </button>
          )}

         {isLoggedIn ? (
  (() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const avatar =
      user?.avatar ||
      "https://cdn-icons-png.flaticon.com/512/847/847969.png"; // ảnh mặc định

    return (
      <div className="nav-user">
        <img
          src={avatar}
          alt={user?.name || "User"}
          className="avatar"
          onClick={() => navigate("/profile")}
          title={user?.name || "Trang cá nhân"}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            cursor: "pointer",
            objectFit: "cover",
            marginLeft: 8,
          }}
        />
      </div>
    );
  })()
) : (
  <Link to="/login" className="btn btn--sm btn--primary">
    Login
  </Link>
)}

        </div>
      </div>
    </header>
  );
}
