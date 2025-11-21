import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function currencyVND(n) {
  return new Intl.NumberFormat("vi-VN").format(Number(n || 0));
}


export default function Checkout({ isLoggedIn }) {
  const navigate = useNavigate();
  const user = useMemo(() => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}, []);

  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState("standard"); // standard | express
  const [payment, setPayment] = useState("cod"); // cod | momo | vnpay
 
const [addresses, setAddresses] = useState([]);
const [selectedAddress, setSelectedAddress] = useState(null);

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
  phone: "",
});



  const [orderDone, setOrderDone] = useState(null); // {code, total}

  useEffect(() => {
    if (!isLoggedIn) return; // vẫn cho xem nhưng khi đặt mới check
    // load cart
    try {
      if (user) {
  setContact({
    fullName: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
  });
}

     const rawCart = localStorage.getItem("cart");
const rawKeys = localStorage.getItem("cart_selected_keys");

let fullCart = rawCart ? JSON.parse(rawCart) : [];
let keys = rawKeys ? JSON.parse(rawKeys) : [];

if (Array.isArray(keys) && keys.length > 0) {
  // chỉ lấy các sản phẩm được tick chọn
  fullCart = fullCart.filter((item) => {
    const key = `${item.id || ""}__${item.color || ""}__${item.size || ""}`;
    return keys.includes(key);
  });
} else {
  // nếu không chọn sản phẩm nào -> báo lỗi
  alert("Bạn chưa chọn sản phẩm nào, vui lòng chọn sản phẩm để tiếp tục mua hàng.");
  navigate("/cart");
}

setCart(fullCart);
  //const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const list = Array.isArray(user.addresses) ? user.addresses : [];

  setAddresses(list);

  // set địa chỉ mặc định
  const def = list.find(a => a.isDefault);

  setSelectedAddress(def ? def : list[0] || null);
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
  },  [isLoggedIn, navigate, user]);
  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + (i.priceVND || 0) * (i.qty || 1), 0),
    [cart]
  );
const [voucher, setVoucher] = useState("");
const [discount, setDiscount] = useState(0);
const [voucherError, setVoucherError] = useState("");
  const shipFee = shipping === "express" ? 50000 : 30000;
  const total = subtotal + (cart.length ? shipFee : 0) - discount;

  // Voucher states


  const onChangeContact = (k, v) => setContact((c) => ({ ...c, [k]: v }));

 // const onChangeAddress = (k, v) => setAddress((a) => ({ ...a, [k]: v }));
const applyVoucher = async () => {
  const code = voucher.trim().toUpperCase();

  if (!code) {
    setVoucherError("Vui lòng nhập mã.");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/coupons/apply", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, total: subtotal })
    });

    const json = await res.json();

    if (!json.success) {
      setDiscount(0);
      setVoucherError(json.message);
      return;
    }

    // Áp dụng kết quả từ server
    setDiscount(json.discount);
    setVoucherError("");
  } catch (err) {
    setVoucherError("Lỗi kết nối server");
  }
};

const placeOrder = async () => {
 

  if (!isLoggedIn) {
    navigate("/login");
    return;
  }
  if (!cart.length) {
    alert("Giỏ hàng trống.");
    return;
  }
  if (!selectedAddress) {
    alert("Vui lòng chọn địa chỉ nhận hàng.");
    return;
  }
  if (!contact.fullName || !contact.phone) {
    alert("Vui lòng điền đầy đủ thông tin liên hệ.");
    return;
  }

  const code = "OD" + Date.now().toString().slice(-8);

  const payload = {
    code,
    userId: user?._id || null,
    userId: user?._id || null,
 items: cart.map(item => ({
  id: item.id,                // id sản phẩm
  sku: item.sku,              // mã sản phẩm
  name: item.name,            // tên sản phẩm
  img: item.img,              // ảnh sản phẩm
  priceVND: item.priceVND,    // giá
  qty: item.qty,              // số lượng
  size: item.size || null,
  color: item.color || null,
})),


    contact,
   address: {
  line: selectedAddress?.line || "",
  ward: selectedAddress?.ward || "",
  district: selectedAddress?.district || "",
  city: selectedAddress?.city || "",
  phone: selectedAddress?.phone || "",
  label: selectedAddress?.label || ""
},

    shippingMethod: shipping,
    paymentMethod: payment,
    subtotal,
    shipFee,
    total,
    voucherCode: voucher || null,
discount,
  };
 console.log("Selected Address:", selectedAddress);
console.log("Payload gửi lên:", payload);
  try {
    const res = await fetch("http://localhost:8080/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!json.success) {
      alert(json.message || "Tạo đơn hàng thất bại!");
      return;
    }

    setOrderDone({ code, total, shippingAddress: selectedAddress });

    localStorage.setItem("cart", JSON.stringify([]));
    setCart([]);

  } catch (error) {
    alert("Lỗi server khi tạo đơn hàng!");
    console.error(error);
  }
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
  <h3 className="co-title">📍 Địa chỉ nhận hàng</h3>

  {!addresses.length && (
    <p style={{ color: "#666" }}>Bạn chưa có địa chỉ. Hãy thêm địa chỉ trong trang Hồ sơ.</p>
  )}

  <div style={{ display: "grid", gap: 12 }}>
    {addresses.map((addr) => {
      const active = selectedAddress?._id === addr._id;
      return (
        <div
           key={addr._id || addr.id}
          onClick={() => setSelectedAddress(addr)}
          style={{
            border: active ? "2px solid #2563eb" : "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 12,
            cursor: "pointer",
            background: active ? "#eff6ff" : "#fff",
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {addr.label || "Địa chỉ"}
            {addr.isDefault && (
              <span style={{ color: "#2563eb", marginLeft: 8 }}>
                (Mặc định)
              </span>
            )}
          </div>

          <div>{addr.line}</div>
          <div>
            {addr.ward}, {addr.district}, {addr.city}
          </div>
          <div>📞 {addr.phone}</div>
        </div>
      );
    })}
  </div>
</div>
{/* Voucher */}
<div className="co-card">
  <h3 className="co-title">🎁 Mã giảm giá</h3>

  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
    <input
      className="footer__input"
      placeholder="Nhập mã giảm giá..."
      value={voucher}
   onChange={(e) => {
  const v = e.target.value.toUpperCase();
  setVoucher(v);

  // Nếu người dùng xóa sạch mã
  if (v.trim() === "") {
    setDiscount(0);
    setVoucherError("");
  }
}}


      style={{ flex: 1 }}
    />

    <button
      className="btn btn--primary"
      onClick={applyVoucher}
      style={{ whiteSpace: "nowrap" }}
    >
      Áp dụng
    </button>
  </div>

  {/* Thêm nút xóa mã */}
  {discount > 0 && (
    <button
      className="btn"
      style={{ marginTop: 8, padding: "6px 12px" }}
      onClick={() => {
        setVoucher("");      // clear input
        setDiscount(0);      // clear discount
        setVoucherError(""); // clear error
      }}
    >
      Xóa mã
    </button>
  )}

  {discount > 0 && (
    <p style={{ marginTop: 8, color: "green", fontWeight: 600 }}>
      ✓ Mã hợp lệ! Bạn được giảm {currencyVND(discount)} VND
    </p>
  )}

  {voucherError && (
    <p style={{ marginTop: 8, color: "red" }}>
      {voucherError}
    </p>
  )}
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
