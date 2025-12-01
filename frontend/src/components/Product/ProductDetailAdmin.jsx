import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AddProduct.css"; 

const ProductDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8080/admin/products/${id}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data.data);
        } else {
          alert(data.message || "Không thể lấy thông tin sản phẩm!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Có lỗi khi tải dữ liệu sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Đang tải dữ liệu sản phẩm...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm!</div>;

  return (
    <div className="add-product-container">
      <h2> Chi tiết sản phẩm</h2>

      <form className="add-product-form">
     
        <div className="form-group">
          <label>Mã sản phẩm</label>
          <input
            type="text"
            value={product.sku || product.productCode || "—"}
            readOnly
          />
        </div>

        {/* Tên sản phẩm */}
        <div className="form-group">
          <label>Tên sản phẩm</label>
          <input type="text" value={product.name || ""} readOnly />
        </div>

        {/* Thương hiệu */}
        <div className="form-group">
          <label>Thương hiệu</label>
          <input type="text" value={product.brand || "—"} readOnly />
        </div>

        {/* Mô tả */}
        <div className="form-group">
          <label>Mô tả</label>
          <textarea value={product.description || ""} readOnly />
        </div>

        {/* Danh mục & Giá */}
        <div className="form-row">
          <div className="form-group">
            <label>Danh mục</label>
           <input type="text" value={product.producttype || "—"} readOnly />
          </div>

          <div className="form-group">
            <label>Giá (VND)</label>
            <input
              type="text"
              value={
                product.price
                  ? product.price.toLocaleString("vi-VN") + "₫"
                  : "—"
              }
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Giới tính</label>
            <input
              type="text"
              value={product.gender || "—"}
              readOnly
            />
          </div>
        </div>

        
        {product.colors?.length > 0 && (
          <div className="form-group">
            <label>Màu có sẵn</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {product.colors.map((color, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: color.toLowerCase(),
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                    display: "inline-block",
                  }}
                  title={color}
                ></div>
              ))}
            </div>
          </div>
        )}

      
        <div className="form-group">
          <label>Ảnh sản phẩm</label>
          {product.images?.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px",
              }}
            >
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={product.name}
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          ) : product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "150px",
                borderRadius: "10px",
                marginTop: "10px",
              }}
            />
          ) : (
            <p>Không có ảnh</p>
          )}
        </div>

        
        <div className="variants-section">
          <h4>Size / Màu / Tồn kho</h4>
          {product.sizes?.length > 0 ? (
            <table className="variant-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Màu</th>
                  <th>Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {product.sizes.map((v, index) => (
                  <tr key={index}>
                    <td>{v.size}</td>
                    <td>
                    <div
                      style={{
                        backgroundColor: v.color?.toLowerCase() || "#ccc",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "1px solid #999",
                        display: "inline-block",
                      }}
                      title={v.color}
                    ></div>
                  </td>

                    <td>{v.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có biến thể</p>
          )}
        </div>

      
        <div
          className="form-row"
          style={{ marginTop: "20px", justifyContent: "space-between" }}
        >
          <button
            type="button"
            className="btn-submit"
            onClick={() => navigate(`/homeAdmin/edit-product/${id}`)}
          >
            Chỉnh sửa
          </button>

          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/homeAdmin/products')}
          >
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductDetailAdmin;
