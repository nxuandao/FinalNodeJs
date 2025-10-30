
import React, { useEffect, useState } from "react";
import "../Product/Products.css";
import { toast } from "react-toastify";

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

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

  // 🧩 Hàm cập nhật số lượng theo size
  const handleUpdateQuantity = async (productId) => {
    if (!selectedSize || !newQuantity) {
      toast.warn("Please select size and enter quantity");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/admin/products/${productId}/quantity`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            size: selectedSize,
            stockQuantity: Number(newQuantity),
          }),
        }
      );

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success("Updated successfully!");

        // Cập nhật lại trong state
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? result.data : p
          )
        );
        setEditingProduct(null);
        setNewQuantity("");
        setSelectedSize("");
      } else {
        toast.error(result.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("An error occurred while updating quantity");
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="ProductsList">
      <h1>Product Management</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Sizes & Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p._id.slice(-4)}</td>
              <td>{p.name}</td>
              <td>{p.brand}</td>
              <td>{p.price?.toLocaleString()}₫</td>
              <td>
                {p.sizes?.map((s) => (
                  <div key={s.size}>
                    {s.size}: {s.stockQuantity}
                  </div>
                ))}
              </td>
              <td>
                <button
                  onClick={() => setEditingProduct(p)}
                  className="edit-btn"
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal chỉnh sửa số lượng */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Update Quantity</h2>
            <p>
              <strong>{editingProduct.name}</strong> ({editingProduct.brand})
            </p>

            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="">Select size</option>
              {editingProduct.sizes?.map((s) => (
                <option key={s.size} value={s.size}>
                  {s.size} (current: {s.stockQuantity})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Enter new quantity"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
            />

            <div className="modal-buttons">
              <button
                className="submit-btn"
                onClick={() => handleUpdateQuantity(editingProduct._id)}
              >
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setEditingProduct(null);
                  setNewQuantity("");
                  setSelectedSize("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
