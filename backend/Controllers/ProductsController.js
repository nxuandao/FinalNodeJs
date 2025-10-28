const Product = require('../Models/Product');

/** ========= Helpers ========= **/
function escapeRegex(s = '') {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PLACEHOLDER_IMG =
  process.env.PLACEHOLDER_IMG ||
  'https://via.placeholder.com/800x800?text=No+Image';

const RAW_API_BASE = (process.env.API_BASE || '').replace(/\/+$/, '');
const RAW_PUBLIC_BASE = (process.env.PUBLIC_BASE || '').replace(/\/+$/, '');
const RAW_STATIC_BASE = (process.env.STATIC_BASE || '').replace(/\/+$/, '');

const STATIC_BASE = [RAW_STATIC_BASE, RAW_PUBLIC_BASE, RAW_API_BASE].find(
  (u) => /^https?:\/\//i.test(u)
) || '';

function normalizeGoogleDrive(url) {
  const m1 = url.match(/\/d\/([^/]+)/);
  const m2 = url.match(/[?&]id=([^&]+)/);
  const id = (m1 && m1[1]) || (m2 && m2[1]);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
}

function normalizeImageUrl(u) {
  if (!u) return '';
  let s = String(u).trim();
  s = s.replace(/\\/g, '/');
  s = s.replace(/^https:\/*/i, 'https://').replace(/^http:\/*/i, 'http://');
  if (/^https?:\/\/(drive\.google\.com|docs\.google\.com)\//i.test(s)) {
    s = normalizeGoogleDrive(s);
  }
  if (!/^https?:\/\//i.test(s) && STATIC_BASE) {
    const path = s.startsWith('/') ? s : `/${s}`;
    s = `${STATIC_BASE}${path}`;
  }
  try { if (/^https?:\/\//i.test(s)) s = encodeURI(s); } catch (_) { }
  return s;
}

function maybeProxy(url) {
  if (process.env.IMG_PROXY === '1' && RAW_API_BASE && /^https?:\/\//i.test(url)) {
    return `${RAW_API_BASE}/img-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function normalizeProduct(doc) {
  const images = Array.isArray(doc.images) ? doc.images : [];
  const primary = images[0] || doc.image || PLACEHOLDER_IMG;

  // colors: luôn thành mảng string
  const colors = Array.isArray(doc.colors) && doc.colors.length
    ? doc.colors.map(c => String(c).trim()).filter(Boolean)
    : (doc.color ? [String(doc.color).trim()] : []);

  // sizes: nhận cả ["S","M"] hoặc [{size:"S", stockQuantity:120}]
  const sizes = Array.isArray(doc.sizes)
    ? doc.sizes.map(s => {
      if (typeof s === 'string') return s.trim();
      if (s && typeof s.size === 'string') return s.size.trim();
      return '';
    }).filter(Boolean)
    : [];

  return {
    ...doc,
    colors,
    sizes,
    image: maybeProxy(normalizeImageUrl(primary)),
    imagesNormalized: images.map((i) => maybeProxy(normalizeImageUrl(i))),
  };
}

/** ========= Controller ========= **/

// Giữ nguyên listProducts
const listProducts = async (req, res) => {
  try {
    const { q, color, category, page = 1, limit = 12, sort = 'createdAt', order = 'desc' } = req.query;
    const filter = { isActive: true };
    const ors = [];
    if (q && q.trim()) {
      const qEsc = escapeRegex(q.trim());
      ors.push({ name: { $regex: qEsc, $options: 'i' } });
      ors.push({ description: { $regex: qEsc, $options: 'i' } });
    }
    if (color && color.trim()) {
      const cEsc = escapeRegex(color.trim());
      ors.push({ color: { $regex: `^${cEsc}$`, $options: 'i' } });
      ors.push({ colors: { $elemMatch: { $regex: `^${cEsc}$`, $options: 'i' } } });
    }
    if (ors.length) filter.$or = ors;
    if (category && category.trim()) {
      const catEsc = escapeRegex(category.trim());
      filter.category = { $regex: `^${catEsc}$`, $options: 'i' };
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 12, 1), 100);
    const allowSort = ['name', 'price', 'createdAt', 'updatedAt'];
    const sortField = allowSort.includes(String(sort)) ? String(sort) : 'createdAt';
    const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortOrder };

    const [items] = await Promise.all([
      Product.find(filter)
        .collation({ locale: 'vi', strength: 1 })
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean()
    ]);

    const data = items.map(normalizeProduct);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('listProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ mới: lấy chi tiết
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Product.findOne({ _id: id, isActive: true }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: normalizeProduct(doc) });
  } catch (err) {
    console.error('getProductById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ mới: thêm review
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, content } = req.body || {};
    const ratingNum = Number(rating);
    const text = (content || '').trim();
    if (!text || !(ratingNum >= 1 && ratingNum <= 5)) {
      return res.status(400).json({ success: false, message: 'Invalid review data' });
    }
    const product = await Product.findById(id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    product.reviews.push({
      userId: req.user?.id || req.user?._id || req.user?.sub,
      userName: req.user?.name || req.user?.email || 'User',
      rating: ratingNum,
      content: text,
      createdAt: new Date(),
    });
    await product.save();
    return res.json({ success: true, data: { reviews: product.reviews } });
  } catch (err) {
    console.error('addReview error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { listProducts, getProductById, addReview };
