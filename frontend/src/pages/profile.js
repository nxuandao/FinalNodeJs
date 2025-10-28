import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import "../App.css";

const orderTabs = [
  { key: "all", label: "Tất cả" },
  { key: "new", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Chờ lấy hàng" },
  { key: "shipped", label: "Chờ giao hàng" },
  { key: "received", label: "Đã giao" },
  { key: "return items", label: "Trả hàng" },
  { key: "cancelled", label: "Đã huỷ" },
];

function EmptyOrders() {
  return (
    <div className="pf-empty">
      <div className="pf-empty__art">
        <svg width="180" height="180" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="96" fill="#F5F5F5" />
          <g transform="translate(60,48)">
            <rect
              x="0"
              y="12"
              rx="12"
              width="80"
              height="100"
              fill="#ffffff"
              stroke="#e5e7eb"
            />
            <circle cx="40" cy="64" r="10" fill="#e5e7eb" />
            <path d="M18 12L28 0H52L62 12" fill="#e5e7eb" />
          </g>
        </svg>
      </div>
      <h3 className="pf-empty__title">Chưa có đơn hàng nào</h3>
      <p className="pf-empty__desc">
        Nơi này sẽ giúp xem lại những đơn hàng mà bạn đã đặt, hãy quay lại đây
        sau khi gửi đơn hàng đầu tiên của mình nhé!
      </p>
    </div>
  );
}

export default function Profile() {
  const [section, setSection] = useState("orders");
  const [orderTab, setOrderTab] = useState("all");

  const [avatar, setAvatar] = useState("https://i.pravatar.cc/200?img=12");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const fileRef = useRef(null);

  const [fullName, setFullName] = useState("Phan Thị Anh Thư");
  const [email, setEmail] = useState("thu@example.com");
  const [phone, setPhone] = useState("0900000000");
  const [editingInfo, setEditingInfo] = useState(false);

  const [addresses, setAddresses] = useState([
    {
      id: crypto.randomUUID(),
      label: "Nhà riêng",
      line: "123 Đường Trần Quang Diệu",
      city: "TP.HCM",
      district: "Quận 3",
      ward: "Phường 13",
      phone: "0900000000",
      isDefault: true,
    },
  ]);
  const [editing, setEditing] = useState(null);
  const [addrForm, setAddrForm] = useState({
    id: "",
    label: "",
    line: "",
    city: "",
    district: "",
    ward: "",
    phone: "",
    isDefault: false,
  });

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  useEffect(() => {
    try {
      const info = JSON.parse(localStorage.getItem("profile_info") || "{}");
      if (info.fullName) setFullName(info.fullName);
      if (info.email) setEmail(info.email);
      if (info.phone) setPhone(info.phone);
      if (info.avatar) setAvatar(info.avatar);
    } catch {}
  }, []);

  const openAvatarMenu = () => setShowAvatarMenu((v) => !v);
  const pickAvatar = () => fileRef.current?.click();
  const onAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatar(url);
    setShowAvatarMenu(false);
    persistInfo({ avatar: url });
  };

  const persistInfo = (patch) => {
    const cur = {
      fullName,
      email,
      phone,
      avatar,
      ...patch,
    };
    localStorage.setItem("profile_info", JSON.stringify(cur));
  };

  const logout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất không?")) {
      window.location.href = "/login";
    }
  };

  const beginAddAddress = () => {
    setEditing("new");
    setAddrForm({
      id: crypto.randomUUID(),
      label: "",
      line: "",
      city: "",
      district: "",
      ward: "",
      phone: "",
      isDefault: false,
    });
  };

  const beginEditAddress = (a) => {
    setEditing(a.id);
    setAddrForm({ ...a });
  };

  const saveAddress = (e) => {
    e.preventDefault();
    const form = { ...addrForm };
    if (form.isDefault) {
      const next = addresses.map((a) => ({
        ...a,
        isDefault: a.id === form.id,
      }));
      const exists = next.find((a) => a.id === form.id);
      if (exists) {
        Object.assign(exists, form);
        setAddresses(next);
      } else {
        setAddresses([...next, form]);
      }
    } else {
      let next = [...addresses];
      const idx = next.findIndex((a) => a.id === form.id);
      if (idx >= 0) next[idx] = form;
      else next.push(form);
      if (!next.some((a) => a.isDefault)) next[0].isDefault = true;
      setAddresses(next);
    }
    setEditing(null);
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }
    alert("Đổi mật khẩu thành công!");
    setCurPass("");
    setNewPass("");
    setConfirmPass("");
  };

  const saveInfo = (e) => {
    e.preventDefault();
    persistInfo();
    setEditingInfo(false);
    alert("Đã lưu thông tin cá nhân!");
  };

  return (
    <>
      <div className="container">
        <nav className="pf-breadcrumb">
          <a href="/home">Home</a> <span>/</span> <span>Profile Page</span>
        </nav>

        <div className="pf-wrap">
          <aside className="pf-sidebar">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
                position: "relative",
              }}
            >
              <div
                className="pf-user__avatar"
                onClick={openAvatarMenu}
                style={{ width: 120, height: 120, cursor: "pointer" }}
                title="Xem / đổi ảnh"
              >
                <img src={avatar} alt="Avatar" />
              </div>
              {showAvatarMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: 130,
                    right: "50%",
                    transform: "translateX(50%)",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    boxShadow: "0 12px 28px rgba(0,0,0,.12)",
                    padding: 8,
                    display: "flex",
                    gap: 8,
                    zIndex: 20,
                  }}
                >
                  <button
                    className="btn btn--sm"
                    onClick={() => {
                      setShowAvatarPreview(true);
                      setShowAvatarMenu(false);
                    }}
                  >
                    Xem ảnh
                  </button>
                  <button className="btn btn--sm" onClick={pickAvatar}>
                    Đổi ảnh
                  </button>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onAvatarChange}
              />
              <h3
                className="pf-name"
                style={{ margin: 0, textAlign: "center" }}
              >
                {fullName}
              </h3>
            </div>

            <ul className="pf-menu">
              <li onClick={() => setSection("orders")}>
                🧾 <span>Đơn hàng của tôi</span>
              </li>
              <li onClick={() => setSection("address")}>
                📍 <span>Sổ địa chỉ</span>
              </li>
              <li onClick={() => setSection("info")}>
                ℹ️ <span>Thông tin của tôi</span>
              </li>
              <li onClick={() => setSection("password")}>
                🔐 <span>Thay đổi mật khẩu</span>
              </li>
              <li onClick={logout}>
                🚪 <span>Đăng xuất</span>
              </li>
            </ul>
          </aside>

          <section className="pf-content">
            {section === "orders" && (
              <>
                <div className="pf-tabs">
                  {orderTabs.map((t) => (
                    <button
                      key={t.key}
                      className={`pf-tab ${
                        orderTab === t.key ? "is-active" : ""
                      }`}
                      onClick={() => setOrderTab(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="pf-panel">
                  <EmptyOrders />
                </div>
              </>
            )}

            {section === "address" && (
              <div className="pf-panel" style={{ display: "block" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h3 style={{ margin: 0 }}>Sổ địa chỉ</h3>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={beginAddAddress}
                  >
                    Thêm địa chỉ
                  </button>
                </div>

                {!editing && (
                  <div style={{ display: "grid", gap: 12 }}>
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 12,
                          padding: 12,
                          display: "grid",
                          gap: 6,
                          background: "#fff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>
                            {a.label}{" "}
                            {a.isDefault && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  fontSize: 12,
                                  color: "#2563eb",
                                  border: "1px solid #bfdbfe",
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  background: "#eff6ff",
                                }}
                              >
                                Mặc định
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            {!a.isDefault && (
                              <button
                                className="btn btn--sm"
                                onClick={() => setDefaultAddress(a.id)}
                              >
                                Đặt mặc định
                              </button>
                            )}
                            <button
                              className="btn btn--sm"
                              onClick={() => beginEditAddress(a)}
                            >
                              Sửa
                            </button>
                          </div>
                        </div>
                        <div>{a.line}</div>
                        <div>
                          {a.ward}, {a.district}, {a.city}
                        </div>
                        <div>SĐT: {a.phone}</div>
                      </div>
                    ))}
                  </div>
                )}

                {editing && (
                  <form
                    onSubmit={saveAddress}
                    style={{ display: "grid", gap: 12, maxWidth: 560 }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        gridTemplateColumns: "1fr 1fr",
                      }}
                    >
                      <input
                        className="footer__input"
                        placeholder="Tên địa chỉ"
                        value={addrForm.label}
                        onChange={(e) =>
                          setAddrForm({ ...addrForm, label: e.target.value })
                        }
                      />
                      <input
                        className="footer__input"
                        placeholder="SĐT nhận hàng"
                        value={addrForm.phone}
                        onChange={(e) =>
                          setAddrForm({ ...addrForm, phone: e.target.value })
                        }
                      />
                    </div>
                    <input
                      className="footer__input"
                      placeholder="Địa chỉ"
                      value={addrForm.line}
                      onChange={(e) =>
                        setAddrForm({ ...addrForm, line: e.target.value })
                      }
                    />
                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        gridTemplateColumns: "1fr 1fr",
                      }}
                    >
                      <input
                        className="footer__input"
                        placeholder="Tỉnh/TP"
                        value={addrForm.city}
                        onChange={(e) =>
                          setAddrForm({ ...addrForm, city: e.target.value })
                        }
                      />
                      <input
                        className="footer__input"
                        placeholder="Quận/Huyện"
                        value={addrForm.district}
                        onChange={(e) =>
                          setAddrForm({ ...addrForm, district: e.target.value })
                        }
                      />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        gridTemplateColumns: "1fr 1fr",
                      }}
                    >
                      <input
                        className="footer__input"
                        placeholder="Phường/Xã"
                        value={addrForm.ward}
                        onChange={(e) =>
                          setAddrForm({ ...addrForm, ward: e.target.value })
                        }
                      />
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={addrForm.isDefault}
                          onChange={(e) =>
                            setAddrForm({
                              ...addrForm,
                              isDefault: e.target.checked,
                            })
                          }
                        />
                        Đặt làm mặc định
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn--primary" type="submit">
                        Lưu
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setEditing(null)}
                      >
                        Huỷ
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {section === "info" && (
              <div className="pf-panel" style={{ display: "block" }}>
                {!editingInfo ? (
                  <div style={{ maxWidth: 520, display: "grid", gap: 10 }}>
                    <h3 style={{ marginTop: 0 }}>Thông tin của tôi</h3>
                    <div>
                      <strong>Họ và tên:</strong> {fullName}
                    </div>
                    <div>
                      <strong>Email:</strong> {email}
                    </div>
                    <div>
                      <strong>Số điện thoại:</strong> {phone}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <button
                        className="btn btn--primary"
                        onClick={() => setEditingInfo(true)}
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={saveInfo}
                    style={{ display: "grid", gap: 12, maxWidth: 520 }}
                  >
                    <h3 style={{ marginTop: 0 }}>Cập nhật thông tin</h3>
                    <div>
                      <label>Họ và tên</label>
                      <input
                        className="footer__input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Email</label>
                      <input
                        className="footer__input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Số điện thoại</label>
                      <input
                        className="footer__input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn--primary" type="submit">
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setEditingInfo(false)}
                      >
                        Huỷ
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {section === "password" && (
              <div className="pf-panel" style={{ display: "block" }}>
                <h3 style={{ marginTop: 0 }}>Thay đổi mật khẩu</h3>
                <form
                  onSubmit={changePassword}
                  style={{ display: "grid", gap: 12, maxWidth: 520 }}
                >
                  <div>
                    <label>Mật khẩu hiện tại</label>
                    <input
                      className="footer__input"
                      type="password"
                      value={curPass}
                      onChange={(e) => setCurPass(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Mật khẩu mới</label>
                    <input
                      className="footer__input"
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Nhập lại mật khẩu</label>
                    <input
                      className="footer__input"
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                  </div>
                  <button className="btn btn--primary" type="submit">
                    Đổi mật khẩu
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>

      {showAvatarPreview && (
        <div
          onClick={() => setShowAvatarPreview(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <img
            src={avatar}
            alt="Avatar Preview"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,.4)",
            }}
          />
        </div>
      )}

      <Footer />
    </>
  );
}
