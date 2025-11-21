import { useEffect, useState } from "react";
import { handleSuccess, handleError } from "../../utils";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState(10);
  const [expireAt, setExpireAt] = useState("");
  const [maxUses, setMaxUses] = useState(0); // ⬅ NEW

  const [editingCode, setEditingCode] = useState(null);

  // Load coupons
  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/coupons`);
      const data = await res.json();
      if (data.success) setCoupons(data.data);
    } catch {
      handleError("Không tải được danh sách coupon");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Create coupon
 // Create coupon
const createCoupon = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return handleError("Bạn cần đăng nhập");

  try {
    const res = await fetch(`${API_BASE}/coupons/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code,
        discountType,
        discountValue,
        expireAt: new Date(expireAt).toISOString(),
        maxUses,
      }),
    });

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    if (data.success) {
      handleSuccess("Tạo coupon thành công!");
      resetForm();
      loadCoupons();
    } else {
      handleError(data.message || "Không thể tạo coupon");
    }
  } catch (err) {
    handleError("Lỗi kết nối server");
  }
};

  // Update coupon
  const updateCoupon = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return handleError("Bạn cần đăng nhập");

    try {
      const res = await fetch(`${API_BASE}/coupons/${editingCode}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          discountType,
          discountValue,
          expireAt: new Date(expireAt).toISOString(), 
          maxUses,
        }),
      });

      const data = await res.json();
      if (data.success) {
        handleSuccess("Cập nhật coupon thành công!");
        resetForm();
        loadCoupons();
      } else handleError(data.message);
    } catch {
      handleError("Lỗi server");
    }
  };

  // Delete coupon
  const deleteCoupon = async (code) => {
    const token = localStorage.getItem("token");
    if (!token) return handleError("Bạn cần đăng nhập");

    if (!window.confirm(`Xoá coupon ${code}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/coupons/${code}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        handleSuccess("Đã xoá coupon!");
        loadCoupons();
      } else handleError(data.message);
    } catch {
      handleError("Lỗi server");
    }
  };

  // Edit coupon
  const editCoupon = (c) => {
    setEditingCode(c.code);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue ?? 0);
    setMaxUses(c.maxUses || 0);
    setExpireAt(c.expireAt ? c.expireAt.slice(0, 16) : "");
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("percent");
    setDiscountValue(10);
    setExpireAt("");
    setMaxUses(0);
    setEditingCode(null);
  };

  return (
    <div className="admin-coupons container" style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>Quản lý Coupons</h2>

      {/* FORM */}
      <form
        onSubmit={editingCode ? updateCoupon : createCoupon}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          border: "1px solid #ddd",
          marginBottom: 30,
        }}
      >
        <h3>{editingCode ? "Cập nhật Coupon" : "Tạo Coupon mới"}</h3>

        <div className="form-grid" style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Mã Coupon</label>
            <input
              type="text"
              value={code}
              disabled={!!editingCode}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div>
            <label>Loại giảm giá</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Giảm trực tiếp (VND)</option>
            </select>
          </div>

          <div>
            <label>Giá trị giảm</label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div>
            <label>Số lần sử dụng tối đa (0 = không giới hạn)</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div>
            <label>Ngày hết hạn</label>
            <input
              type="datetime-local"
              value={expireAt}
              onChange={(e) => setExpireAt(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        </div>

        <button className="btn btn--primary" style={{ marginTop: 15 }}>
          {editingCode ? "Cập nhật" : "Tạo Coupon"}
        </button>

        {editingCode && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              marginLeft: 10,
              padding: "8px 15px",
              background: "#777",
              color: "white",
              borderRadius: 5,
            }}
          >
            Hủy
          </button>
        )}
      </form>

      {/* LIST */}
      <h3>Danh sách Coupons</h3>

      {loading ? (
        <p>Đang tải...</p>
      ) : coupons.length === 0 ? (
        <p>Chưa có coupon nào.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              <th style={th}>Mã</th>
              <th style={th}>Loại</th>
              <th style={th}>Giá trị</th>
              <th style={th}>Giới hạn</th>
              <th style={th}>Đã dùng</th>
              <th style={th}>Ngày hết hạn</th>
              <th style={th}>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td style={td}>{c.code}</td>
                <td style={td}>{c.discountType === "percent" ? "Giảm %" : "Giảm VNĐ"}</td>

                <td style={td}>
                  {c.discountType === "percent"
                    ? `${c.discountValue ?? 0}%`
                    : `${(c.discountValue ?? 0).toLocaleString("vi-VN")} VND`}
                </td>

                <td style={td}>{c.maxUses === 0 ? "Không giới hạn" : c.maxUses}</td>

                <td style={td}>{c.orderApplied ?? 0}</td>

                <td style={td}>{new Date(c.expireAt).toLocaleString("vi-VN")}</td>

                <td style={td}>
                  <button
                    className="btn btn--primary"
                    onClick={() => editCoupon(c)}
                    style={{ marginRight: 10 }}
                  >
                    Sửa
                  </button>

                  <button className="btn btn--danger" onClick={() => deleteCoupon(c.code)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  textAlign: "left",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};
