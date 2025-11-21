import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function parseVND(val) {
  if (typeof val === "number" && Number.isFinite(val)) return Math.round(val);
  if (typeof val === "string") {
    const digits = val.replace(/[^\d]/g, "");
    return Number(digits || 0);
  }
  return 0;
}

export default function Cart({ isLoggedIn }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const fmtVND = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));
  const makeKey = (i) => `${i.id || ""}__${i.color || ""}__${i.size || ""}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : [];
      const normalized = Array.isArray(parsed)
        ? parsed
            .map((i) => ({
              id: i.id,
              sku: i.sku || "",
              name: i.name || "Sản phẩm",
              img: i.img || "",
              priceVND: Number(i.priceVND || 0),
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
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("cart", JSON.stringify(cart));
    setSelected((prev) => {
      const next = new Set();
      cart.forEach((i) => {
        const k = makeKey(i);
        if (prev.has(k)) next.add(k);
      });
      return next;
    });
  }, [cart, loaded]);

  const totalVND = useMemo(
    () => cart.reduce((s, i) => s + parseVND(i.priceVND) * (i.qty || 1), 0),
    [cart]
  );
  const totalItems = useMemo(
    () => cart.reduce((s, i) => s + (i.qty || 1), 0),
    [cart]
  );

  const selectedItems = useMemo(
    () => cart.filter((i) => selected.has(makeKey(i))),
    [cart, selected]
  );
  const selectedCount = useMemo(
    () => selectedItems.reduce((s, i) => s + (i.qty || 1), 0),
    [selectedItems]
  );
  const selectedTotalVND = useMemo(
    () =>
      selectedItems.reduce(
        (s, i) => s + parseVND(i.priceVND) * (i.qty || 1),
        0
      ),
    [selectedItems]
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

  const toggleOne = (key) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  };

  const allKeys = useMemo(() => cart.map(makeKey), [cart]);
  const allChecked = useMemo(
    () => allKeys.length > 0 && allKeys.every((k) => selected.has(k)),
    [allKeys, selected]
  );
  const toggleAll = () => {
    setSelected((prev) => {
      if (allChecked) return new Set();
      const n = new Set(prev);
      allKeys.forEach((k) => n.add(k));
      return n;
    });
  };

  const removeSelected = () => {
    if (selected.size === 0) return;
    setCart((prev) => prev.filter((i) => !selected.has(makeKey(i))));
    setSelected(new Set());
  };

const checkout = () => {
  if (!isLoggedIn) {
    navigate("/login");
    return;
  }

  if (selected.size === 0) {
    alert("Bạn chưa chọn sản phẩm nào, vui lòng chọn sản phẩm để tiếp tục mua hàng.");
    return;
  }

  localStorage.setItem(
    "cart_selected_keys",
    JSON.stringify(Array.from(selected))
  );

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
          <div className="cartpage__empty cartpage__empty--center">
            <div className="empty__art" aria-hidden>
              <svg width="180" height="180" viewBox="0 0 200 200">
                <rect
                  x="50"
                  y="70"
                  width="100"
                  height="90"
                  stroke="#111"
                  strokeWidth="3"
                  fill="none"
                />
                <rect
                  x="62"
                  y="40"
                  width="30"
                  height="25"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                />
                <rect
                  x="108"
                  y="48"
                  width="30"
                  height="20"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                />
                <path
                  d="M85 110h30v-18"
                  stroke="#111"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="empty__title">Giỏ hàng của bạn đang trống</h3>
            <button
              className="btn btn--primary cartpage__cta"
              onClick={goShopping}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="cartlist">
              <div className="cartlist__toolbar">
                <label className="chk">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                  />
                  <span>Chọn tất cả</span>
                </label>
                <button
                  className="btn btn--ghost"
                  onClick={removeSelected}
                  disabled={selected.size === 0}
                >
                  Xoá đã chọn
                </button>
              </div>

              {cart.map((it) => {
                const key = makeKey(it);
                const lineTotal = parseVND(it.priceVND) * (it.qty || 1);
                const checked = selected.has(key);
                return (
                  <div key={key} className="cartrow">
                    <div className="cartrow__select">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(key)}
                      />
                    </div>

                    <div className="cartrow__img">
                      {it.img ? (
                        <img src={it.img} alt={it.name} />
                      ) : (
                        <div className="cartrow__img--placeholder" />
                      )}
                    </div>

                    <div className="cartrow__info">
                      <div className="cartrow__name">{it.name}</div>

                      <div className="cartrow__price">
                        Giá: {fmtVND(it.priceVND)} VND
                      </div>
                        <div className="cartrow__line">
                          <span className="cartrow__label">Size:</span>
                          <span className="cartrow__value">{it.size || "—"}</span>
                        </div>
                                            <div className="cartrow__line">
                          <span className="cartrow__label">Màu sắc:</span>

                          <span className="cartrow__value">
                            {it.color || "—"}
                          </span>

                          {it.color && (
                            <span
                              style={{
                                display: "inline-block",
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                border: "1px solid #ccc",
                                marginLeft: 6,
                                background: it.color,
                              }}
                            ></span>
                          )}
                        </div>



                    

                      <div className="cartrow__line cartrow__qtyline">
                        <span className="cartrow__label">Số lượng:</span>
                        <div className="qtyctrl">
                          <button
                            onClick={() =>
                              updateQty(key, Math.max(1, (it.qty || 1) - 1))
                            }
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
                        <strong className="cartrow__value">
                          {fmtVND(lineTotal)} VND
                        </strong>
                      </div>

                      <div className="cartrow__removewrap">
                        <button
                          className="cartrow__remove"
                          onClick={() => removeItem(key)}
                        >
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
  {selectedCount === 0 ? (
    <span>Chưa chọn sản phẩm nào</span>
  ) : (
    <>
      Đã chọn {selectedCount} sản phẩm — Tổng cộng:{" "}
      <strong>{fmtVND(selectedTotalVND)} VND</strong>
    </>
  )}

  
</div>



              <button
                className="btn btn--primary"
                onClick={checkout}
                disabled={selected.size === 0}
              >
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
