import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
function parseVND(val) {
  if (typeof val === "number" && Number.isFinite(val)) return Math.round(val);
  if (typeof val === "string") {
    const digits = val.replace(/[^\d]/g, ""); // bỏ ., , khoảng trắng...
    return Number(digits || 0);
  }
  return 0;
}
export default function Cart({ isLoggedIn }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false); // tránh ghi đè lần đầu

  // --- Helpers ---
  // digits mặc định: 3 số thập phân (vd: 699,999 theo vi-VN)
  const fmtVND = (n) =>
    new Intl.NumberFormat("vi-VN").format(Number(n || 0)); // ✅ 699.999



  // Mỗi item có key riêng theo id+color+size để không đè nhau
  const makeKey = (i) => `${i.id || ""}__${i.color || ""}__${i.size || ""}`;

  // --- Load cart từ localStorage ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : [];
      const normalized = Array.isArray(parsed)
        ? parsed
          .map((i) => ({
            id: i.id,
            name: i.name || "Sản phẩm",
            img: i.img || "",
            // giữ dạng số thập phân nếu BE/LS đang lưu "699.999"
            priceVND: Number(i.priceVND || 0), // ✅ giữ là số nguyên

            color: typeof i.color === "string" ? i.color : "",
            size: typeof i.size === "string" ? i.size : "",
            qty: Math.max(1, Number(i.qty || 1)),
          }))
          .filter((i) => i.id)
        : [];
      setCart(normalized);
    } catch {
      setCart([]);
    } finally {
      setLoaded(true); // đã load xong
    }
  }, []);

  // --- Lưu lại khi cart đổi (chỉ sau khi đã load xong) ---
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, loaded]);

  // --- Tính toán ---
  const totalVND = useMemo(
    () => cart.reduce((s, i) => s + parseVND(i.priceVND) * (i.qty || 1), 0),
    [cart]
  );
  const totalItems = useMemo(
    () => cart.reduce((s, i) => s + (i.qty || 1), 0),
    [cart]
  );

  const goShopping = () => navigate("/store");

  const updateQty = (key, next) => {
    if (!Number.isFinite(next) || next < 1) return;
    setCart((prev) =>
      prev.map((i) => (makeKey(i) === key ? { ...i, qty: next } : i))
    );
  };

  const removeItem = (key) => {
    setCart((prev) => prev.filter((i) => makeKey(i) !== key));
  };

  const checkout = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="cart-page">
      <Header isLoggedIn={isLoggedIn} />

      <section className="cartpage container cartpage--center">
        <div className="cartpage__header">
          <h1 className="cartpage__title">Giỏ hàng của bạn</h1>
        </div>

        <div className="cartpage__divider" />

        {cart.length === 0 ? (
          // ----- VIEW: GIỎ HÀNG TRỐNG -----
          <div className="cartpage__empty cartpage__empty--center">
            <div className="empty__art" aria-hidden>
              <svg width="180" height="180" viewBox="0 0 200 200">
                <rect x="50" y="70" width="100" height="90" stroke="#111" strokeWidth="3" fill="none" />
                <rect x="62" y="40" width="30" height="25" fill="none" stroke="#111" strokeWidth="3" />
                <rect x="108" y="48" width="30" height="20" fill="none" stroke="#111" strokeWidth="3" />
                <path d="M85 110h30v-18" stroke="#111" strokeWidth="3" fill="none" />
              </svg>
            </div>
            <h3 className="empty__title">Giỏ hàng của bạn đang trống</h3>
            <button className="btn btn--primary cartpage__cta" onClick={goShopping}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          // ----- VIEW: CÓ SẢN PHẨM -----
          <>
            <div className="cartlist">
              {cart.map((it) => {
                const key = makeKey(it);
                const lineTotal = parseVND(it.priceVND) * (it.qty || 1);
                return (
                  <div key={key} className="cartrow">
                    <div className="cartrow__img">
                      {it.img ? <img src={it.img} alt={it.name} /> : <div className="cartrow__img--placeholder" />}
                    </div>

                    <div className="cartrow__info">
                      <div className="cartrow__name">{it.name}</div>

                      <div className="cartrow__price">Giá: {fmtVND(it.priceVND)} VND</div>

                      <div className="cartrow__line">
                        <span className="cartrow__label">Size:</span>
                        <span className="cartrow__value">{it.size || "—"}</span>
                      </div>

                      <div className="cartrow__line">
                        <span className="cartrow__label">Màu sắc:</span>
                        <span className="cartrow__value">{it.color || "—"}</span>
                      </div>

                      <div className="cartrow__line cartrow__qtyline">
                        <span className="cartrow__label">Số lượng:</span>
                        <div className="qtyctrl">
                          <button
                            onClick={() => updateQty(key, Math.max(1, (it.qty || 1) - 1))}
                            aria-label="Giảm số lượng"
                          >
                            -
                          </button>
                          <span>{it.qty || 1}</span>
                          <button
                            onClick={() => updateQty(key, (it.qty || 1) + 1)}
                            aria-label="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cartrow__line">
                        <span className="cartrow__label">Thành tiền:</span>
                        <strong className="cartrow__value">{fmtVND(lineTotal)} VND</strong>
                      </div>

                      <div className="cartrow__removewrap">
                        <button className="cartrow__remove" onClick={() => removeItem(key)}>
                          Xoá
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cartpage__footer">
              <div className="cartpage__total">
                {totalItems} sản phẩm — Tổng cộng: <strong>{fmtVND(totalVND)} VND</strong>
              </div>
              <button className="btn btn--primary" onClick={checkout}>
                Thanh toán
              </button>
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
