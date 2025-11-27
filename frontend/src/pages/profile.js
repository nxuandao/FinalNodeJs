import { useEffect, useRef, useState,useMemo} from "react";
import Footer from "../components/Footer";
import "../App.css";

import Header from "../components/Header";

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "http://localhost:8080";

const orderTabs = [
  { key: "all", label: "Tất cả" },
  { key: "new", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Chuẩn bị hàng" },
  { key: "shipped", label: "Đang vận chuyển" },
  { key: "received", label: "Đã giao" },

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
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editingInfo, setEditingInfo] = useState(false);
  const filteredOrders = useMemo(() => {
  if (orderTab === "all") return orders;

  const map = {
    new: "Chờ xác nhận",
    confirmed: "Chuẩn bị hàng",
    shipped: "Đang vận chuyển",
    received: "Đã giao",
    "return items": "Trả hàng",
    cancelled: "Đã hủy",
  };

  return orders.filter(o => o.status === map[orderTab]);
}, [orders, orderTab]);

  // ====== ADDRESS STATE ======
  const [addresses, setAddresses] = useState([]);
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
const deleteAddress = async (id) => {
  if (!window.confirm("Bạn có chắc muốn xoá địa chỉ này không?")) return;

  try {
    // Lấy lại user mới nhất từ localStorage (có thể chứa các địa chỉ khác)
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const fullList = storedUser.addresses || [];

    // Lọc phần tử cần xóa
    const updatedList = fullList.filter((a) => a.id !== id);

    await updateUserInfo({ addresses: updatedList });

    // Cập nhật localStorage & state
    localStorage.setItem("user", JSON.stringify({
      ...storedUser,
      addresses: updatedList,
    }));

    setAddresses(updatedList);
    alert("✅ Đã xoá địa chỉ!");
  } catch (err) {
    console.error(err);
    alert("❌ Không thể xoá địa chỉ!");
  }
};


  // ====== PASSWORD STATE ======
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // 🧩 Load user info từ localStorage
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.name) setFullName(storedUser.name);
      if (storedUser.email) setEmail(storedUser.email);
      if (storedUser.phone) setPhone(storedUser.phone || "");
      if (storedUser.avatar) setAvatar(storedUser.avatar);
    } catch (err) {
      console.error("Error loading user info:", err);
    }
  }, []);
  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user._id) return;

      const res = await fetch(`${API_BASE}/orders/user/${user._id}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("❌ Lỗi tải orders:", err);
    }
  };

  fetchOrders();
}, [section]); // load mỗi khi chuyển tab

  // 🧩 Load user info từ MongoDB
useEffect(() => {
  const fetchUserFromServer = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      if (!storedUser._id || !token) return;

      const res = await fetch(`${API_BASE}/users/${storedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.user) {
        const u = data.user;
        setFullName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
      setAvatar(
  u.avatar?.startsWith("http")
    ? u.avatar
    : `${API_BASE}${u.avatar}`
);

        setAddresses(u.addresses || []);

        // Cập nhật localStorage để đồng bộ
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải thông tin user:", err);
    }
  };

  fetchUserFromServer();
}, []);


  // 📤 Cập nhật thông tin user lên server
  const updateUserInfo = async (patch) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user._id) return alert("Không tìm thấy thông tin người dùng!");

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/update/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();

      localStorage.setItem("user", JSON.stringify(updated.user));
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại, vui lòng thử lại!");
    }
  };

  // 📸 Upload avatar
  const onAvatarChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    try {
      const formData = new FormData();
      formData.append("avatar", f);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/upload/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const avatarUrl = data.avatarUrl.startsWith("http")
      ? data.avatarUrl
      : `${API_BASE}${data.avatarUrl}`;

    setAvatar(avatarUrl);
    setShowAvatarMenu(false);

      const savedPath = data.avatarUrl.startsWith("http")
      ? data.avatarUrl.replace(API_BASE, "")
      : data.avatarUrl;

    await updateUserInfo({ avatar: savedPath });
    } catch (err) {
      console.error(err);
      alert("Tải ảnh thất bại, vui lòng thử lại!");
    }
  };

  const openAvatarMenu = () => setShowAvatarMenu((v) => !v);
  const pickAvatar = () => fileRef.current?.click();

  const logout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất không?")) {
      localStorage.clear();
      sessionStorage.clear?.();
      window.location.href = "/login";
    }
  };

  /* ============== ĐỊA CHỈ ============== */
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

const saveAddress = async (e) => {
  e.preventDefault();

  const form = { ...addrForm };
  const newAddress = {
    id: form.id || crypto.randomUUID(),
    label: form.label,
    line: form.line,
    city: form.city,
    district: form.district,
    ward: form.ward,
    phone: form.phone,
    isDefault: form.isDefault,
  };

  try {
    let updatedList;

    if (editing === "new") {
      updatedList = [...addresses, newAddress];
    } else {
      updatedList = addresses.map((a) =>
        a.id === form.id ? newAddress : a
      );
    }

    // ⭐ QUAN TRỌNG: Nếu đặt mặc định → bỏ mặc định của địa chỉ khác
    if (newAddress.isDefault) {
      updatedList = updatedList.map(a => ({
        ...a,
        isDefault: a.id === newAddress.id
      }));
    }

    // 🧠 Gửi lên backend
    await updateUserInfo({ addresses: updatedList });

    // 🧠 Lưu localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        addresses: updatedList,
      })
    );

    setAddresses(updatedList);
    setEditing(null);
    alert("✅ Cập nhật địa chỉ thành công!");
  } catch (err) {
    console.error(err);
    alert("❌ Cập nhật địa chỉ thất bại!");
  }
};



const setDefaultAddress = async (id) => {
  try {
    let updatedList = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));

    // Lưu backend
    await updateUserInfo({ addresses: updatedList });

    // Lưu localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        addresses: updatedList,
      })
    );

    setAddresses(updatedList);
    alert("Đã đặt làm địa chỉ mặc định!");
  } catch (err) {
    alert("Không thể đặt mặc định!");
  }
};


  /* ============== ĐỔI MẬT KHẨU ============== */
const changePassword = async (e) => {
  e.preventDefault();
  if (!newPass || newPass !== confirmPass) {
    return alert("Mật khẩu xác nhận không khớp.");
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/users/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: curPass,
        newPassword: newPass,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");

    alert("✅ " + data.message);
    setCurPass("");
    setNewPass("");
    setConfirmPass("");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};


  const saveInfo = async (e) => {
    e.preventDefault();
    await updateUserInfo({
      name: fullName,
      phone: phone,
    });
    setEditingInfo(false);
  };
  const handleCancelOrder = async (orderId) => {
  await cancelOrder(orderId); // chờ hoàn tất
  setSelectedOrder(null);     // đóng modal
  setSection("orders");       // quay về tab chính
  setOrderTab("all");         // nếu muốn hiển thị tất cả đơn
};

const cancelOrder = async (orderId) => {
  if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;

  try {
    const res = await fetch(`${API_BASE}/orders/update-status/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Đã hủy" }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Hủy đơn thất bại");

    alert("Đơn hàng đã được hủy!");

    // ✅ Cập nhật ngay trạng thái trong state, không cần fetch lại
    setOrders(prev =>
      prev.map(o => (o._id === orderId ? { ...o, status: "Đã hủy" } : o))
    );

    // Nếu đang mở modal, cập nhật luôn trạng thái
    if (selectedOrder?._id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: "Đã hủy" }));
    }
  } catch (err) {
    console.error(err);
    alert("Không thể hủy đơn!");
  }
};


   return (
    <>
      <div className="container">
         <Header isLoggedIn={true} />
       
       <div className="pf-wrap p-20" style={{ marginTop: "40px" }}>
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
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #ddd",
                  cursor: "pointer",
                }}
              >
                <img
                  src={avatar}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
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
              <h3 style={{ margin: 0 }}>{fullName}</h3>
            </div>

            <ul className="pf-menu">
              <li onClick={() => setSection("orders")}>Đơn hàng của tôi</li>
              <li onClick={() => setSection("address")}> Sổ địa chỉ</li>
              <li onClick={() => setSection("info")}>Thông tin</li>
              <li onClick={() => setSection("password")}>Đổi mật khẩu</li>
              <li onClick={logout}>Đăng xuất</li>
            </ul>
          </aside>

          <section className="pf-content">

  {/* 🧾 Đơn hàng */}
  {section === "orders" && (
    <>
      <div className="pf-tabs">
        {orderTabs.map((t) => (
          <button
            key={t.key}
            className={`pf-tab ${orderTab === t.key ? "is-active" : ""}`}
            onClick={() => setOrderTab(t.key)}
          >
            {t.label}
          </button>
          
        ))}
        {/* Nút hủy đơn, chỉ hiển thị nếu trạng thái là "Chờ xác nhận" */}
   
      </div>
      <div className="pf-panel">

{filteredOrders.map(order => (
  <div
    key={order._id}
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      cursor: "pointer",
    }}
    onClick={() => setSelectedOrder(order)}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <strong>Mã đơn: {order.code}</strong>
      <span style={{ color: "#2563eb" }}>{order.status}</span>
    </div>

    <div style={{ marginTop: 8 }}>
      {order.items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
          <img src={item.img} width={50} height={50} style={{ borderRadius: 8 }} />
          <div>
            <div>{item.name}</div>
            <div>{item.qty} x {item.priceVND.toLocaleString()}đ</div>
          </div>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 10 }}>
      <strong>Tổng tiền:</strong> {order.total.toLocaleString()}đ
    </div>
 
  </div>
))}

</div>

    </>
  )}
{selectedOrder && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
    onClick={() => setSelectedOrder(null)} // click ngoài modal để đóng
  >
    <div
      onClick={(e) => e.stopPropagation()} // ngăn click bên trong đóng modal
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        maxWidth: 600,
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <button
        onClick={() => setSelectedOrder(null)}
        style={{ marginBottom: 12 }}
      >
        Quay lại
      </button>

      <h3>Đơn hàng: {selectedOrder.code}</h3>
      <p>
        Trạng thái: <strong>{selectedOrder.status}</strong>
      </p>

      <div style={{ marginTop: 12 }}>
        {selectedOrder.items.map((item, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: 10, marginBottom: 6 }}
          >
            <img
              src={item.img}
              width={50}
              height={50}
              style={{ borderRadius: 8 }}
            />
            <div>
              <div>{item.name}</div>
              <div>
                {item.qty} x {item.priceVND.toLocaleString()}đ
              </div>
            </div>
          </div>
        ))}
      </div>

      <p>
        <strong>Tổng tiền:</strong> {selectedOrder.total.toLocaleString()}đ
      </p>
   {selectedOrder.status === "Chờ xác nhận" && (
  <button
    className="btn btn--danger"
    style={{ marginTop: 10 }}
    onClick={(e) => {
      e.stopPropagation();
     handleCancelOrder(selectedOrder._id);
    }}
  >
    Hủy đơn
  </button>
)}


    
    </div>
  </div>
)}



 
 {section === "info" && (
  <div className="pf-panel" style={{ display: "block" }}>
    {!editingInfo ? (
      <div style={{ maxWidth: 520, display: "grid", gap: 10 }}>
        <h3 style={{ marginTop: 0 }}>Thông tin của tôi</h3>
        <div>
          <strong>Họ và tên:</strong> {fullName || "Chưa cập nhật"}
        </div>
        <div>
          <strong>Email:</strong> {email || "Chưa cập nhật"}
        </div>
        <div>
          <strong>Số điện thoại:</strong> {phone || "Chưa cập nhật"}
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
        onSubmit={async (e) => {
          e.preventDefault();
          await updateUserInfo({
            name: fullName,
            phone: phone,
          });
          setEditingInfo(false);
        }}
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
            disabled
            style={{
              backgroundColor: "#f3f4f6",
              cursor: "not-allowed",
            }}
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
  <button type="submit" className="btn btn--primary">
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

 {/* 📍 Sổ địa chỉ */}
{section === "address" && (
  <div className="pf-panel">
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <h3>Sổ địa chỉ</h3>

      {/* Nút Thêm địa chỉ */}
     
        <button
        className="btn btn--primary btn--sm"
        onClick={() => {
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
        }}
      >
        Thêm địa chỉ
      </button>
    </div>

    {/* Khi chưa có địa chỉ */}
    {!editing && addresses.length === 0 && (
      <p>Chưa có địa chỉ nào. Hãy thêm địa chỉ mới để thuận tiện giao hàng!</p>
    )}

   {/* Khi đã có địa chỉ */}
{!editing && addresses.length > 0 && (
  <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
  {addresses.map((addr, idx) => (
  <div
    key={addr.id}
    style={{
      position: "relative",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 12,
    }}
  >
    <div><strong>{addr.label || `Địa chỉ ${idx + 1}`}</strong></div>
    <div>{addr.line}</div>
    <div>{addr.ward}, {addr.district}, {addr.city}</div>
    <div>📞 {addr.phone}</div>

    {addr.isDefault && (
      <div style={{ color: "#2563eb", marginTop: 4 }}>
        (Địa chỉ mặc định)
      </div>
    )}

    {/* Nút hành động */}
    <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 8 }}>
      
      {/* Nút Sửa */}
      <button
        className="btn btn--sm"
        onClick={() => beginEditAddress(addr)}
      >
       Sửa
      </button>

      {/* Nút Đặt mặc định */}
      {!addr.isDefault && (
        <button
          className="btn btn--sm"
          onClick={() => setDefaultAddress(addr.id)}
        >
          Mặc định
        </button>
      )}

      {/* Nút Xóa */}
      <button
        className="btn btn--sm btn--danger"
        onClick={() => deleteAddress(addr.id)}
      >
        Xoá
      </button>
    </div>
  </div>
))}

  </div>
)}


    {/* Khi đang thêm hoặc chỉnh sửa */}
    {editing && (
      <form
        onSubmit={saveAddress}
        style={{ display: "grid", gap: 12, maxWidth: 560, marginTop: 20 }}
      >
        <h4>
          {editing === "new" ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
        </h4>

        <input
          className="footer__input"
          placeholder="Tên địa chỉ (VD: Nhà riêng, Công ty)"
          value={addrForm.label}
          onChange={(e) =>
            setAddrForm({ ...addrForm, label: e.target.value })
          }
        />

        <input
          className="footer__input"
          placeholder="Số nhà, tên đường"
          value={addrForm.line}
          onChange={(e) =>
            setAddrForm({ ...addrForm, line: e.target.value })
          }
        />

        <div>
          <label>Tỉnh / Thành phố</label>
          <select
            className="footer__input"
            value={addrForm.city}
            onChange={(e) =>
              setAddrForm({ ...addrForm, city: e.target.value })
            }
          >
            <option value="">-- Chọn Tỉnh/Thành phố --</option>
            {[
              "An Giang","Bà Rịa - Vũng Tàu","Bắc Giang","Bắc Kạn","Bạc Liêu","Bắc Ninh",
              "Bến Tre","Bình Định","Bình Dương","Bình Phước","Bình Thuận","Cà Mau",
              "Cần Thơ","Cao Bằng","Đà Nẵng","Đắk Lắk","Đắk Nông","Điện Biên","Đồng Nai",
              "Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Nội","Hà Tĩnh","Hải Dương",
              "Hải Phòng","Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang",
              "Kon Tum","Lai Châu","Lâm Đồng","Lạng Sơn","Lào Cai","Long An","Nam Định",
              "Nghệ An","Ninh Bình","Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình",
              "Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La",
              "Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên Huế","Tiền Giang",
              "TP Hồ Chí Minh","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"
            ].map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <input
          className="footer__input"
          placeholder="Quận / Huyện"
          value={addrForm.district}
          onChange={(e) =>
            setAddrForm({ ...addrForm, district: e.target.value })
          }
        />

        <input
          className="footer__input"
          placeholder="Phường / Xã"
          value={addrForm.ward}
          onChange={(e) =>
            setAddrForm({ ...addrForm, ward: e.target.value })
          }
        />

        <input
          className="footer__input"
          placeholder="Số điện thoại"
          value={addrForm.phone}
          onChange={(e) =>
            setAddrForm({ ...addrForm, phone: e.target.value })
          }
        />

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={addrForm.isDefault}
            onChange={(e) =>
              setAddrForm({ ...addrForm, isDefault: e.target.checked })
            }
          />{" "}
          Đặt làm mặc định
        </label>

        <div style={{ display: "flex", gap: 8 }}>
  <button type="submit" className="btn btn--primary">
    Lưu
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


  {/* 🔐 Đổi mật khẩu */}
  {section === "password" && (
    <div className="pf-panel" style={{ display: "block" }}>
      <h3>Thay đổi mật khẩu</h3>
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
          }}
        >
          <img
            src={avatar}
            alt="Avatar"
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