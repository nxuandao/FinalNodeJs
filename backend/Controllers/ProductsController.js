// Controllers/ProductsController.js
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

// chỉ dùng base nếu là http(s)
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

  // backslash -> slash
  s = s.replace(/\\/g, '/');

  // chuẩn scheme
  s = s.replace(/^https:\/*/i, 'https://').replace(/^http:\/*/i, 'http://');

  // drive share -> direct
  if (/^https?:\/\/(drive\.google\.com|docs\.google\.com)\//i.test(s)) {
    s = normalizeGoogleDrive(s);
  }

  // đường dẫn tương đối -> ghép base (nếu có)
  if (!/^https?:\/\//i.test(s) && STATIC_BASE) {
    const path = s.startsWith('/') ? s : `/${s}`;
    s = `${STATIC_BASE}${path}`;
  }

  try {
    if (/^https?:\/\//i.test(s)) s = encodeURI(s);
  } catch (_) { }

  return s;
}

// bật nếu muốn bọc qua proxy ảnh của backend để né hotlink/CSP: IMG_PROXY=1
function maybeProxy(url) {
  if (process.env.IMG_PROXY === '1' && RAW_API_BASE && /^https?:\/\//i.test(url)) {
    return `${RAW_API_BASE}/img-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/** ========= Controller ========= **/

const listProducts = async (req, res) => {
  try {
    const {
      q, color, category,
      page = 1, limit = 12,
      sort = 'createdAt', order = 'desc'
    } = req.query;

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

    const [items, total] = await Promise.all([
      Product.find(filter)
        .collation({ locale: 'vi', strength: 1 })
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Chuẩn hoá ảnh trước khi trả về: thêm field image (1 ảnh chính) + imagesNormalized
    const data = items.map((doc) => {
      const images = Array.isArray(doc.images) ? doc.images : [];
      const primary = images[0] || doc.image || "https://via.placeholder.com/800x800?text=No+Image";
      return { ...doc, image: primary };
    });

    return res.json({ success: true, data, /* meta... */ });


    return res.json({
      success: true,
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        sort: sortField,
        order: sortOrder === 1 ? 'asc' : 'desc'
      }
    });
  } catch (err) {
    console.error('listProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { listProducts };
