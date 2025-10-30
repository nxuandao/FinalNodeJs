import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useRef, useState, useEffect } from "react";

export default function Header({ isLoggedIn }) {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilter(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const onSearchSubmit = (e) => {
    if (e.key === "Enter") {
      const qs = new URLSearchParams({ q: search }).toString();
      navigate(`/store?${qs}`);
    }
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
            >
              <FilterListIcon />
            </button>
            {showFilter && (
              <div className="filterbar">
                <div className="filter-panel">
                  <p>Bộ lọc sản phẩm (chưa hoàn thiện)</p>
                </div>
              </div>
            )}
          </div>
          {isLoggedIn && (
            <button className="icon-btn" onClick={() => navigate("/cart")}>
              <ShoppingCartIcon />
            </button>
          )}
          {isLoggedIn ? (
            <button className="icon-btn">
              <AccountCircleIcon />
            </button>
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
