import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AddProduct.css";

const EditProductAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    productCode: "",
    name: "",
    brand: "",
    description: "",
    producttype: "",
    price: "",
    gender: "",
    images: [],
    colors: [],
  });

  const [variants, setVariants] = useState([]);
  const [newColor, setNewColor] = useState("#000000");
  const [loading, setLoading] = useState(true);

  // 🎨 Bản đồ tên màu phổ biến
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

  // 🧩 Lấy dữ liệu sản phẩm theo ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8080/admin/products/${id}`);
        const data = await res.json();

        if (res.ok && data.data) {
          setProduct({
            productCode: data.data.sku || data.data.productCode || "",
            name: data.data.name || "",
            brand: data.data.brand || "",
            description: data.data.description || "",
            producttype: data.data.producttype || "",
            price: data.data.price || "",
            gender: data.data.gender || "",
            images: data.data.images || [],
            colors: data.data.colors || [],
          });
          setVariants(data.data.sizes || []);
        } else {
          toast.error(data.message || "Không thể tải sản phẩm!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Lỗi khi tải sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 🧩 Input thay đổi chung
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // 🧩 Thêm màu vào danh sách tổng
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

  // 🧩 Biến thể (size / color / stock)
  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleColorChange = (index, value) => {
  const updated = [...variants];
  updated[index].color = value;
  setVariants(updated);
};


  const addVariant = () => {
    setVariants([...variants, { size: "", color: "#000000", stockQuantity: 0 }]);
  };

  const removeVariant = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  // 🧩 Upload ảnh
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

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
        toast.success("Ảnh đã tải lên Cloudinary!");
      } else {
        toast.error(data.message || "Lỗi khi tải ảnh!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Không thể tải ảnh lên Cloudinary!");
    }
  };

  // 🧩 Submit cập nhật sản phẩm
const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Lấy tất cả màu từ variants (loại bỏ trùng)
  const variantColors = [...new Set(variants.map(v => v.color).filter(Boolean))];

  try {
    const res = await fetch(`http://localhost:8080/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: product.name,
        brand: product.brand,
        description: product.description,
        producttype: product.producttype,
        price: Number(product.price),
        gender: product.gender,
        images: product.images,
        sizes: variants,
        colors: variantColors, // ✅ chỉ cập nhật 1 lần khi lưu
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Cập nhật sản phẩm thành công!");
      
      setProduct((prev) => ({ ...prev, colors: variantColors }));
      setTimeout(() => navigate(`/homeAdmin/product/${id}`), 1500);
    } else {
      toast.error(data.message || "Không thể cập nhật sản phẩm!");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Lỗi khi cập nhật sản phẩm!");
  }
};


  if (loading) return <div>Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div className="add-product-container">
      <h2>Chỉnh sửa sản phẩm</h2>

      <form className="add-product-form" onSubmit={handleSubmit}>
        {/* Mã sản phẩm */}
        <div className="form-group">
          <label>Mã sản phẩm</label>
          <input type="text" value={product.productCode} readOnly />
        </div>

        {/* Tên sản phẩm */}
        <div className="form-group">
          <label>Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
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
          />
        </div>

        {/* Mô tả */}
        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
          />
        </div>

        {/* Danh mục + Giá */}
        <div className="form-row">
          <div className="form-group">
            <label>Danh mục</label>
            <select
              name="producttype"
              value={product.producttype}
              onChange={handleChange}
              onFocus={(e) => (e.target.size = 8)}
              onBlur={(e) => (e.target.size = 1)}
              required
              style={{ cursor: "pointer" }}
            >
              <option value={product.producttype}>{product.producttype}</option>
              <option value="quần">Quần</option>
              <option value="váy">Váy</option>
              <option value="đầm">Đầm</option>
              <option value="áo sơ mi">Áo sơ mi</option>
              <option value="áo thun">Áo thun</option>
              <option value="áo khoác">Áo khoác</option>
              <option value="quần short">Quần short</option>
            </select>
          </div>

          <div className="form-group">
            <label>Giá (VND)</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
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
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        {/* 🎨 Màu tổng */}
        <div className="form-group">
          <label>Màu sắc</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
  <input
    type="color"
    value={newColor}
    onChange={(e) => setNewColor(e.target.value)}
  />
  <input
    type="text"
    value={newColor}
    onChange={(e) => setNewColor(e.target.value)}
    placeholder="#000000"
    style={{
      width: "90px",
      textTransform: "lowercase",
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "4px 6px",
    }}
  />
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

        {/* 📸 Ảnh */}
        <div className="form-group">
          <label>Ảnh sản phẩm</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
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

        {/* 👕 Biến thể */}
        <div className="variants-section">
          <h4>Size / Màu / Tồn kho</h4>
          {variants.map((v, index) => (
            <div key={index} className="variant-row">
              <input
                type="text"
                placeholder="Size"
                value={v.size}
                onChange={(e) => handleVariantChange(index, "size", e.target.value)}
              />

             <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  {/* Bộ chọn màu */}
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

  {/* Ô nhập mã màu thủ công */}
  <input
    type="text"
    value={v.color || "#000000"}
    onChange={(e) => handleColorChange(index, e.target.value)}
    placeholder="#000000"
    style={{
      width: "90px",
      textTransform: "lowercase",
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "4px 6px",
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

          {/* 🎨 Màu vừa chọn hiển thị ngay bên dưới */}
          {product.colors.length > 0 && (
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
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
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" className="btn-submit">
          Lưu thay đổi
        </button>
        <button
          type="button"
          className="cancel-btn"
          onClick={() => navigate(`/homeAdmin/product/${id}`)}
        >
          Quay lại
        </button>
      </form>
    </div>
  );
};

export default EditProductAdmin;
