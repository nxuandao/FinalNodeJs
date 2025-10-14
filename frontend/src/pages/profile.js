import React, { useMemo, useRef, useState } from "react";
import "../App.css";

export default function ProfilePage() {
  const [active, setActive] = useState("orders");
  const [avatar, setAvatar] = useState("/avatar.jpg"); // TODO(backend): load URL avatar từ API khi mở trang
  const [openAvatar, setOpenAvatar] = useState(false);

  const logout = () => {
    // TODO(backend): gọi POST /api/auth/logout nếu dùng cookie/refresh-token
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="profilex container">
      <div className="profilex__grid">
        <aside className="profilex__sidebar">
          <div className="profilex__user">
            <button
              className="profilex__avatarbtn"
              onClick={() => setOpenAvatar(true)}
            >
              <img src={avatar} alt="avatar" className="profilex__avatar" />
            </button>
            <h3 className="profilex__name">Phan Thị Anh Thư</h3>
            <p className="profilex__email">pthu73811@gmail.com</p>
            <AvatarDialog
              open={openAvatar}
              onClose={() => setOpenAvatar(false)}
              value={avatar}
              onChange={setAvatar}
            />
          </div>

          <nav className="profilex__menu">
            <button
              className={`profilex__item ${
                active === "orders" ? "active" : ""
              }`}
              onClick={() => setActive("orders")}
            >
              <i className="icon">📋</i> Đơn hàng của tôi
            </button>
            <button
              className={`profilex__item ${
                active === "address" ? "active" : ""
              }`}
              onClick={() => setActive("address")}
            >
              <i className="icon">📍</i> Sổ địa chỉ
            </button>
            <button
              className={`profilex__item ${active === "info" ? "active" : ""}`}
              onClick={() => setActive("info")}
            >
              <i className="icon">🧾</i> Thông tin của tôi
            </button>
            <button
              className={`profilex__item ${
                active === "member" ? "active" : ""
              }`}
              onClick={() => setActive("member")}
            >
              <i className="icon">💎</i> Membership
            </button>
            <button
              className={`profilex__item ${
                active === "password" ? "active" : ""
              }`}
              onClick={() => setActive("password")}
            >
              <i className="icon">🔒</i> Thay đổi mật khẩu
            </button>
            <button className="profilex__item danger" onClick={logout}>
              <i className="icon">↩️</i> Đăng xuất
            </button>
          </nav>
        </aside>

        <main className="profilex__content">
          {active === "orders" && <Orders />}
          {active === "address" && <Address />}
          {active === "info" && <Info />}
          {active === "member" && <Member />}
          {active === "password" && <Password />}
        </main>
      </div>
    </div>
  );
}

function AvatarDialog({ open, onClose, value, onChange }) {
  const [preview, setPreview] = useState(value);
  const fileRef = useRef(null);

  React.useEffect(() => {
    if (open) setPreview(value);
  }, [open, value]);

  const hasChanged = preview !== value;

  const pick = () => fileRef.current?.click();

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpg|jpeg|webp|gif)$/i.test(f.type)) return;
    if (f.size > 5 * 1024 * 1024) return;
    const r = new FileReader();
    r.onload = () => setPreview(r.result);
    r.readAsDataURL(f);
    // TODO(backend): upload file và setPreview(url từ server), onChange(url)
  };

  const save = () => {
    onChange(preview); // TODO(backend): khi đã upload, preview sẽ là URL server
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modalx">
      <div className="modalx__backdrop" onClick={onClose} />
      <div className="modalx__panel">
        <h3 className="modalx__title">Ảnh đại diện</h3>
        <div className="modalx__body">
          <img src={preview} alt="preview" className="avatar-preview" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            style={{ display: "none" }}
          />
        </div>
        <div className="modalx__actions">
          <button className="btn btn--ghost" onClick={pick}>
            Chọn ảnh đại diện
          </button>
          <div style={{ flex: 1 }} />

          {hasChanged && (
            <button className="btn btn--primary" onClick={save}>
              Áp dụng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const [tab, setTab] = React.useState("all");

  const orders = [
    // TODO(backend): bỏ mock, gọi GET /api/orders (có thể kèm ?status=tab hoặc lấy tất cả rồi filter)
    { id: "DH001", date: "2025-10-01", total: 459000, status: "new" },
    { id: "DH002", date: "2025-10-02", total: 299000, status: "confirmed" },
    { id: "DH003", date: "2025-10-03", total: 189000, status: "shipped" },
    { id: "DH004", date: "2025-10-04", total: 99000, status: "received" },
    { id: "DH005", date: "2025-10-05", total: 159000, status: "cancelled" },
  ];

  const TABS = [
    { key: "all", label: "Tất cả" },
    { key: "new", label: "Đơn mới" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "shipped", label: "Đã gửi hàng" },
    { key: "received", label: "Đã nhận" },
    { key: "cancelled", label: "Đã huỷ" },
  ];

  const filtered = useMemo(
    () => (tab === "all" ? orders : orders.filter((o) => o.status === tab)),
    [tab, orders]
  );

  return (
    <div className="cardpanel">
      <h2>Đơn hàng của tôi</h2>
      <div className="order-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`order-tab ${tab === t.key ? "is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="order-empty">
          <img src="/empty-order.png" alt="" />
          <p className="order-empty__title">Chưa có đơn hàng nào</p>
          <p className="order-empty__text">
            Nơi này giúp bạn xem lại đơn đã đặt. Hãy quay lại sau khi đặt đơn
            đầu tiên nhé!
          </p>
        </div>
      ) : (
        <div className="order-list">
          {filtered.map((o) => (
            <div key={o.id} className="order-item">
              <div className="order-item__left">
                <div className={`status-dot ${o.status}`} />
                <div>
                  <div className="order-id">{o.id}</div>
                  <div className="order-date">{o.date}</div>
                </div>
              </div>
              <div className="order-item__right">
                <div className="order-total">
                  {o.total.toLocaleString("vi-VN")}₫
                </div>
                <a className="order-link" href={`/orders/${o.id}`}>
                  Chi tiết
                </a>
                {/* TODO(backend): trang /orders/:id gọi GET /api/orders/:id */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Address() {
  // TODO(backend): khi mount, gọi GET /api/user/addresses để fill danh sách
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
  });

  const add = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.street || !form.city) return;
    const item = { id: Date.now(), ...form, isDefault: addresses.length === 0 };
    setAddresses((prev) => [item, ...prev]);
    setForm({ name: "", phone: "", street: "", city: "" });
    // TODO(backend): POST /api/user/addresses
  };

  const remove = (id) => {
    setAddresses((prev) => prev.filter((x) => x.id !== id));
    // TODO(backend): DELETE /api/user/addresses/:id
  };

  const setDefault = (id) => {
    setAddresses((prev) => prev.map((x) => ({ ...x, isDefault: x.id === id })));
    // TODO(backend): PATCH /api/user/addresses/:id/default
  };

  return (
    <div className="cardpanel">
      <h2>Sổ địa chỉ</h2>
      <form className="formx" onSubmit={add}>
        <label>Họ tên người nhận</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
        />
        <label>Số điện thoại</label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
        />
        <label>Địa chỉ</label>
        <input
          type="text"
          placeholder="Số nhà, đường"
          value={form.street}
          onChange={(e) => setForm((s) => ({ ...s, street: e.target.value }))}
        />
        <label>Tỉnh/Thành phố</label>
        <input
          type="text"
          value={form.city}
          onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
        />
        <button className="btn btn--primary">Thêm địa chỉ mới</button>
      </form>

      <div className="addr-list" style={{ marginTop: 16 }}>
        {addresses.length === 0 ? (
          <p>Chưa có địa chỉ nào. Hãy thêm địa chỉ để đặt đơn nhanh hơn.</p>
        ) : (
          addresses.map((a) => (
            <div key={a.id} className="addr-item">
              <div className="addr-main">
                <div className="addr-name">
                  {a.name} • {a.phone}
                </div>
                <div className="addr-text">
                  {a.street}, {a.city}
                </div>
                {a.isDefault && <span className="addr-badge">Mặc định</span>}
              </div>
              <div className="addr-actions">
                {!a.isDefault && (
                  <button
                    className="btn btn--ghost"
                    onClick={() => setDefault(a.id)}
                  >
                    Đặt mặc định
                  </button>
                )}
                <button
                  className="btn btn--danger"
                  onClick={() => remove(a.id)}
                >
                  Xoá
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Info() {
  // TODO(backend): khi mount, gọi GET /api/user/profile để fill form
  const [form, setForm] = useState({
    fullName: "Phan Thị Anh Thư",
    email: "pthu73811@gmail.com",
    phone: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO(backend): PUT /api/user/profile với form
    alert("Đã lưu thông tin (tạm, chưa gọi API)!");
  };

  return (
    <div className="cardpanel">
      <h2>Thông tin cá nhân</h2>
      <form className="formx" onSubmit={onSubmit}>
        <label>Họ và tên</label>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
        />
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        />
        <label>Số điện thoại</label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
        />
        <button className="btn btn--primary">Lưu thay đổi</button>
      </form>
    </div>
  );
}

function Member() {
  // TODO(backend): lấy cấp độ hiện tại từ GET /api/user/membership (nếu có)
  return (
    <div className="cardpanel">
      <h2>Membership</h2>
      <p>
        Bạn hiện đang ở cấp độ <strong>Dream Maker</strong>.
      </p>
      <p>Tham gia chương trình khách hàng thân thiết để nhận thêm ưu đãi.</p>
    </div>
  );
}

function Password() {
  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");

  const change = (e) => {
    e.preventDefault();
    if (!n1 || n1 !== n2) return alert("Mật khẩu mới không khớp");
    // TODO(backend): POST /api/user/change-password { currentPassword: cur, newPassword: n1 }
    alert("Đổi mật khẩu (tạm, chưa gọi API)!");
    setCur("");
    setN1("");
    setN2("");
  };

  return (
    <div className="cardpanel">
      <h2>Thay đổi mật khẩu</h2>
      <form className="formx" onSubmit={change}>
        <label>Mật khẩu hiện tại</label>
        <input
          type="password"
          value={cur}
          onChange={(e) => setCur(e.target.value)}
        />
        <label>Mật khẩu mới</label>
        <input
          type="password"
          value={n1}
          onChange={(e) => setN1(e.target.value)}
        />
        <label>Nhập lại mật khẩu mới</label>
        <input
          type="password"
          value={n2}
          onChange={(e) => setN2(e.target.value)}
        />
        <button className="btn btn--primary">Đổi mật khẩu</button>
      </form>
      {/* TODO(backend): xử lý lỗi 401/400 và hiển thị thông báo từ server */}
    </div>
  );
}
