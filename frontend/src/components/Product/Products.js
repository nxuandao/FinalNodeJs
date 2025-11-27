import React, { useEffect, useState } from "react";
import "../Product/Products.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProductsList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧩 Fetch sản phẩm từ backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8080/admin/products");
        const data = await res.json();
        if (res.ok) {
          setProducts(data.data || []);
        } else {
          toast.error(data.message || "Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("An error occurred while fetching products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  
  const handleViewDetails = (productId) => {
    navigate(`/homeAdmin/product/${productId}`);
  };
  // 🧩 Hàm bật/tắt trạng thái hoạt động của sản phẩm
const handleStatusChange = async (productId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8080/admin/products/${productId}/status`, {

        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Sản phẩm đã được chuyển sang trạng thái: ${
            newStatus ? "Hoạt động" : "Ngừng hoạt động"
          }`
        );
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, isActive: newStatus } : p
          )
        );
      } else {
        toast.error(data.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái sản phẩm");
    }
  };

  return (
    <div className="ProductsList">
      <div className="header">
        <h1>Product Management</h1>
        <button
          className="add-btn"
          onClick={() => navigate("/homeAdmin/add-product")}
        >
          Add Product
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ProductID</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Price</th>
            <th>IsActive</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.sku || p.productCode || "—"}</td>
              <td>{p.name}</td>
              <td>{p.brand}</td>
              <td>{p.price?.toLocaleString()}₫</td>
              
             <td>
                <div className="status-dropdown">
                  <select
                    value={p.isActive ? "true" : "false"}
                    onChange={(e) =>
                      handleStatusChange(p._id, e.target.value === "true")
                    }
                    className={`status-select ${
                      p.isActive ? "active" : "inactive"
                    }`}
                  >
                    <option value="true" className="active-option">
                      Active
                    </option>
                    <option value="false" className="inactive-option">
                      Inactive
                    </option>
                  </select>
                </div>
              </td>
              <td>
                <button
                  className="detail-btn"
                  onClick={() => handleViewDetails(p._id)}
                >
                  🔍 Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsList;
