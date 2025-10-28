import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function currencyVND(n) {
  return new Intl.NumberFormat("vi-VN").format(Number(n || 0));
}


export default function Checkout({ isLoggedIn }) {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState("standard"); // standard | express
  const [payment, setPayment] = useState("cod"); // cod | momo | vnpay
  const [note, setNote] = useState("");

  const [contact, setContact] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const [address, setAddress] = useState({
    line: "",
    ward: "",
    district: "",
    city: "",
  });

  const [orderDone, setOrderDone] = useState(null); // {code, total}

  useEffect(() => {
    if (!isLoggedIn) return; // vẫn cho xem nhưng khi đặt mới check
    // load cart
    try {
      const raw = localStorage.getItem("cart");
      setCart(raw ? JSON.parse(raw) : []);
    } catch {
      setCart([]);
    }
    // load default address if stored by profile page
    try {
      const rawAddr = localStorage.getItem("profile_addresses");
      if (rawAddr) {
        const arr = JSON.parse(rawAddr);
        const def = arr.find((a) => a.isDefault) || arr[0];
        if (def) {
          setContact((c) => ({
            ...c,
            fullName: c.fullName || "Phan Thị Anh Thư",
            phone: c.phone || def.phone || "",
          }));
          setAddress({
            line: def.line || "",
            ward: def.ward || "",
            district: def.district || "",
            city: def.city || "",
          });
        }
      }
    } catch { }
  }, [isLoggedIn]);

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + (i.priceVND || 0) * (i.qty || 1), 0),
    [cart]
  );

  const shipFee = shipping === "express" ? 50000 : 30000;
  const total = subtotal + (cart.length ? shipFee : 0);

  const onChangeContact = (k, v) => setContact((c) => ({ ...c, [k]: v }));

  const onChangeAddress = (k, v) => setAddress((a) => ({ ...a, [k]: v }));

  const placeOrder = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (!cart.length) {
      alert("Giỏ hàng trống.");
      return;
    }
    if (!contact.fullName || !contact.phone || !address.line || !address.city) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    const code = "OD" + Date.now().toString().slice(-8);
    setOrderDone({ code, total });

    // clear cart
    localStorage.setItem("cart", JSON.stringify([]));
    setCart([]);
  };

  if (orderDone) {
    return (
      <div className="checkout-page">
        <Header isLoggedIn={isLoggedIn} />
        <section className="container" style={{ padding: "24px 0 40px" }}>
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              textAlign: "center",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 24,
              background: "#fff",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Đặt hàng thành công 🎉</h2>
            <p>Mã đơn hàng của bạn:</p>
            <div
              style={{
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              {orderDone.code}
            </div>
            <p>
              Tổng thanh toán:{" "}
              <strong>{currencyVND(orderDone.total)} VND</strong>
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <button className="btn" onClick={() => navigate("/profile")}>
                Xem đơn hàng của tôi
              </button>
              <button
                className="btn btn--primary"
                onClick={() => navigate("/store")}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header isLoggedIn={isLoggedIn} />

      <section className="container" style={{ padding: "24px 0 40px" }}>
        <h1
          className="cartpage__title"
          style={{ textAlign: "center", margin: "0 0 18px" }}
        >
          Thanh toán
        </h1>

        <div
          className="co-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 420px",
            gap: 20,
          }}
        >
          {/* LEFT: forms */}
          <div style={{ display: "grid", gap: 16 }}>
            {/* Contact */}
            <div className="co-card">
              <h3 className="co-title">Thông tin liên hệ</h3>
              <div className="co-form">
                <div className="co-row">
                  <label>Họ và tên *</label>
                  <input
                    className="footer__input"
                    value={contact.fullName}
                    onChange={(e) =>
                      onChangeContact("fullName", e.target.value)
                    }
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="co-row">
                  <label>Số điện thoại *</label>
                  <input
                    className="footer__input"
                    value={contact.phone}
                    onChange={(e) => onChangeContact("phone", e.target.value)}
                    placeholder="090..."
                  />
                </div>
                <div className="co-row">
                  <label>Email</label>
                  <input
                    className="footer__input"
                    type="email"
                    value={contact.email}
                    onChange={(e) => onChangeContact("email", e.target.value)}
                    placeholder="you@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="co-card">
              <h3 className="co-title">Địa chỉ nhận hàng</h3>
              <div className="co-form">
                <div className="co-row">
                  <label>Địa chỉ *</label>
                  <input
                    className="footer__input"
                    value={address.line}
                    onChange={(e) => onChangeAddress("line", e.target.value)}
                    placeholder="Số nhà, đường..."
                  />
                </div>
                <div className="co-grid-2">
                  <div className="co-row">
                    <label>Phường/Xã</label>
                    <input
                      className="footer__input"
                      value={address.ward}
                      onChange={(e) => onChangeAddress("ward", e.target.value)}
                    />
                  </div>
                  <div className="co-row">
                    <label>Quận/Huyện</label>
                    <input
                      className="footer__input"
                      value={address.district}
                      onChange={(e) =>
                        onChangeAddress("district", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="co-row">
                  <label>Tỉnh/Thành phố *</label>
                  <input
                    className="footer__input"
                    value={address.city}
                    onChange={(e) => onChangeAddress("city", e.target.value)}
                  />
                </div>
                <div className="co-row">
                  <label>Ghi chú</label>
                  <textarea
                    className="footer__input"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Giao giờ hành chính, gọi trước khi giao…"
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="co-card">
              <h3 className="co-title">Vận chuyển & Thanh toán</h3>

              <div className="co-block">
                <div className="co-subtitle">Phương thức giao hàng</div>
                <div className="co-radios">
                  <label
                    className={`co-radio ${shipping === "standard" ? "is-on" : ""
                      }`}
                  >
                    <input
                      type="radio"
                      name="ship"
                      checked={shipping === "standard"}
                      onChange={() => { }}
                      onClick={() => setShipping("standard")}
                    />
                    <span>Tiêu chuẩn (2-4 ngày) — 30.000đ</span>
                  </label>
                  <label
                    className={`co-radio ${shipping === "express" ? "is-on" : ""
                      }`}
                  >
                    <input
                      type="radio"
                      name="ship"
                      checked={shipping === "express"}
                      onChange={() => { }}
                      onClick={() => setShipping("express")}
                    />
                    <span>Hoả tốc (1-2 ngày) — 50.000đ</span>
                  </label>
                </div>
              </div>

              <div className="co-block">
                <div className="co-subtitle">Phương thức thanh toán</div>
                <div className="co-radios">
                  <label
                    className={`co-radio ${payment === "cod" ? "is-on" : ""}`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={payment === "cod"}
                      onChange={() => { }}
                      onClick={() => setPayment("cod")}
                    />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label
                    className={`co-radio ${payment === "momo" ? "is-on" : ""}`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={payment === "momo"}
                      onChange={() => { }}
                      onClick={() => setPayment("momo")}
                    />
                    <span>Ví MoMo</span>
                  </label>
                  <label
                    className={`co-radio ${payment === "vnpay" ? "is-on" : ""}`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={payment === "vnpay"}
                      onChange={() => { }}
                      onClick={() => setPayment("vnpay")}
                    />
                    <span>VNPAY</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <aside
            className="co-card"
            style={{ height: "fit-content", position: "sticky", top: 88 }}
          >
            <h3 className="co-title">Đơn hàng của bạn</h3>

            {!cart.length ? (
              <p style={{ color: "#6b7280" }}>Giỏ hàng đang trống.</p>
            ) : (
              <>
                <div style={{ display: "grid", gap: 12, marginBottom: 10 }}>
                  {cart.map((it) => (
                    <div
                      key={it.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "64px 1fr auto",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          border: "1px solid #eee",
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "#fafafa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={it.img}
                          alt={it.name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, lineHeight: 1.25 }}>
                          {it.name}
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          SL: {it.qty || 1}
                          {it.size ? ` • Size: ${it.size}` : ""}
                          {it.color ? ` • Màu: ${it.color}` : ""}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {currencyVND((it.priceVND || 0) * (it.qty || 1))}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{ borderTop: "1px solid #eee", margin: "10px 0" }}
                />

                <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Tạm tính</span>
                    <strong>{currencyVND(subtotal)} VND</strong>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Phí vận chuyển</span>
                    <strong>
                      {currencyVND(cart.length ? shipFee : 0)} VND
                    </strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 6,
                      fontSize: 16,
                    }}
                  >
                    <span>Tổng cộng</span>
                    <strong style={{ fontSize: 18 }}>
                      {currencyVND(total)} VND
                    </strong>
                  </div>
                </div>

                <button
                  className="btn btn--primary"
                  style={{ width: "100%", marginTop: 14 }}
                  onClick={placeOrder}
                >
                  Đặt hàng
                </button>
              </>
            )}
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
