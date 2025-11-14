import React, { useState } from "react";
import "./AddProduct.css";

export default function AddProduct() {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    producttype: "",
    price: "",
    images: [],
    gender: "",
    sku: "",
    colors: [],
  });

  const [variants, setVariants] = useState([{ size: "", color: "#000000", stockQuantity: "" }]);
  const [uploading, setUploading] = useState(false);
  const [newColor, setNewColor] = useState("#000000");

  // 🎨 Bản đồ mã hex → tên màu gần đúng
  const colorNameMap = {
    "#000000": "Đen",
    "#ffffff": "Trắng",
    "#ff0000": "Đỏ",
    "#00ff00": "Xanh lá",
    "#0000ff": "Xanh dương",
    "#ffff00": "Vàng",
    "#ff00ff": "Hồng tím",
    "#00ffff": "Xanh ngọc",
    "#808080": "Xám",
  };

  const getColorName = (hex) => colorNameMap[hex.toLowerCase()] || hex;

  // 🧩 Xử lý input chung
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // 🧩 Quản lý biến thể (size / color / stock)
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleColorChange = (index, value) => {
    handleVariantChange(index, "color", value);
    // nếu màu chưa có trong danh sách tổng → thêm mới
    if (!product.colors.includes(value)) {
      setProduct((prev) => ({
        ...prev,
        colors: [...prev.colors, value],
      }));
    }
  };

  const addVariant = () => {
    setVariants([...variants, { size: "", color: "#000000", stockQuantity: "" }]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  // 🧩 Upload ảnh lên Cloudinary qua server
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    setUploading(true);
    try {
      const res = await fetch("http://localhost:8080/admin/upload/multiple", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.images) {
        setProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...data.images],
        }));
        alert("✅ Ảnh đã tải lên Cloudinary!");
      } else {
        alert(data.message || "❌ Lỗi khi tải ảnh!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Không thể tải ảnh!");
    } finally {
      setUploading(false);
    }
  };

  // 🧩 Quản lý màu tổng (phía trên)
  const addColor = () => {
    if (!product.colors.includes(newColor)) {
      setProduct((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }));
    }
  };

  const removeColor = (color) => {
    setProduct((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  // 🧩 Submit form thêm sản phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.sku.trim()) {
      alert("⚠️ Vui lòng nhập mã sản phẩm!");
      return;
    }

    const finalProduct = {
      ...product,
      price: Number(product.price),
      sizes: variants,
    };

    try {
      const res = await fetch("http://localhost:8080/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalProduct),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Sản phẩm "${finalProduct.name}" đã được thêm thành công!`);
        console.log("📦 Saved product:", data);
      } else {
        alert(`❌ Thêm sản phẩm thất bại: ${data.message}`);
      }
    } catch (err) {
      console.error("Error adding product:", err);
      alert("❌ Lỗi khi kết nối đến server!");
    }
  };

  // 🧩 Giao diện
  return (
    <div className="add-product-container">
      <h2>🛒 Thêm sản phẩm mới</h2>

      <form className="add-product-form" onSubmit={handleSubmit}>
        {/* Mã sản phẩm */}
        <div className="form-group">
          <label>Mã sản phẩm</label>
          <input
            type="text"
            name="sku"
            value={product.sku}
            onChange={handleChange}
            placeholder="VD: SP001, AO123..."
            required
          />
        </div>

        {/* Tên sản phẩm */}
        <div className="form-group">
          <label>Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        {/* Thương hiệu */}
        <div className="form-group">
          <label>Thương hiệu</label>
          <input
            type="text"
            name="brand"
            value={product.brand}
            onChange={handleChange}
            placeholder="VD: Nike"
          />
        </div>

        {/* Mô tả */}
        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="Nhập mô tả sản phẩm..."
          />
        </div>

        {/* Danh mục + Giá */}
        <div className="form-row">
          <div className="form-group">
            <label>Danh mục</label>
            <input
              type="text"
              name="producttype"
              value={product.producttype}
              onChange={handleChange}
              placeholder="VD: Áo, Quần, Giày..."
            />
          </div>

          <div className="form-group">
            <label>Giá (VND)</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              placeholder="VD: 299000"
            />
          </div>
        </div>

        {/* Giới tính */}
        <div className="form-group">
          <label>Giới tính</label>
          <select
            name="gender"
            value={product.gender}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        {/* Màu tổng */}
        <div className="form-group">
          <label>Màu sắc</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
            />
            <button
              type="button"
              className="btn-add"
              style={{ padding: "6px 12px" }}
              onClick={addColor}
            >
              + Thêm màu
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {product.colors.map((color, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: color,
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "2px solid #ccc",
                  position: "relative",
                }}
              >
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "10px",
                    width: "16px",
                    height: "16px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ảnh */}
        <div className="form-group">
          <label>Ảnh sản phẩm</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
          {uploading && <p>⏳ Đang tải ảnh lên...</p>}
          {product.images.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {product.images.map((img, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: "120px",
                    height: "120px",
                  }}
                >
                  <img
                    src={img}
                    alt={`product-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setProduct((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }))
                    }
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      
        {/* Biến thể */}
<div className="variants-section">
  <h4>Size / Màu / Tồn kho</h4>

  {variants.map((v, index) => (
    <div key={index} className="variant-row">
      <input
        type="text"
        placeholder="Size"
        value={v.size}
        onChange={(e) =>
          handleVariantChange(index, "size", e.target.value)
        }
      />

      {/* Chọn màu */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="color"
          value={v.color || "#000000"}
          onChange={(e) => handleColorChange(index, e.target.value)}
          style={{
            width: "40px",
            height: "40px",
            cursor: "pointer",
            border: "none",
            background: "transparent",
          }}
        />
        <span>{getColorName(v.color || "#000000")}</span>
      </div>

      <input
        type="number"
        placeholder="Tồn kho"
        value={v.stockQuantity}
        onChange={(e) =>
          handleVariantChange(index, "stockQuantity", e.target.value)
        }
      />

      <button
        type="button"
        className="btn-remove"
        onClick={() => removeVariant(index)}
      >
        ❌
      </button>
    </div>
  ))}

  <button type="button" className="btn-add" onClick={addVariant}>
    + Thêm biến thể
  </button>

  {/* 🎨 Màu vừa chọn sẽ hiển thị luôn ở đây */}
  {product.colors.length > 0 && (
    <div
      style={{
        marginTop: "15px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <h5 style={{ width: "100%" }}>🎨 Màu đã chọn:</h5>
      {product.colors.map((color, index) => (
        <div
          key={index}
          style={{
            backgroundColor: color,
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "2px solid #ccc",
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={() => removeColor(color)}
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "red",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "10px",
              width: "16px",
              height: "16px",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}
</div>


        <button type="submit" className="btn-submit">
          ✅ Thêm sản phẩm
        </button>
      </form>
    </div>
  );
}
