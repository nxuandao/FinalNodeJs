// frontend/src/services/products.js
export async function fetchProducts({ q, gender, category, page, limit = 12 }) {
  const startIndex = (page - 1) * limit;
  const items = Array.from({ length: limit }).map((_, i) => {
    const id = startIndex + i + 1;
    return {
      id: id,
      name:
        "San pham " +
        id +
        (gender ? " " + gender : "") +
        (category ? " - " + category : ""),
      price: (Math.random() * 100).toFixed(2),
      compareAtPrice: (Math.random() * 120).toFixed(2),
      image: "/shop1.jpg",
    };
  });

  return { items: items, total: 100 };
}
