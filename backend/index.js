require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
// Nếu Node < 18, bật 2 dòng dưới để có fetch:
// const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

require('./Models/db');

const AuthRouter = require('./Routes/AuthRouter');
const ProductsRouter = require('./Routes/ProductsRouter');

const app = express();
const PORT = process.env.PORT || 8080;

/* --- Security headers / CSP: cho phép ảnh từ https, data:, blob: --- */
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      // nới lỏng img-src để <img> load được ảnh Cloudinary/hstatic...
      "img-src": ["'self'", "data:", "https:", "blob:"],
    },
  },
}));

/* --- CORS --- */
app.use(cors({
  // cho phép cả CRA (3000) và Vite (5173); thêm FRONTEND_ORIGIN nếu có
  origin: [/^http:\/\/localhost:(3000|5173)$/, process.env.FRONTEND_ORIGIN].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.set('trust proxy', true);

/* --- Healthcheck --- */
app.get('/ping', (req, res) => res.send('Pong'));

/* --- Routes --- */
app.use('/auth', AuthRouter);
app.use('/products', ProductsRouter);

/* --- (Tuỳ chọn) Image proxy: dùng nếu nguồn ảnh chặn/hotlink/CORS --- */
app.get('/img-proxy', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send('Missing url');
    const r = await fetch(url); // Node 18+ có global fetch
    if (!r.ok) return res.status(r.status).send('Upstream error');

    res.set('Content-Type', r.headers.get('content-type') || 'image/jpeg');
    // có thể thêm cache:
    res.set('Cache-Control', 'public, max-age=86400');
    r.body.pipe(res);
  } catch (e) {
    console.error('img-proxy error:', e);
    res.status(500).send('Proxy error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const express = require('express');
// const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const AuthRouter = require('./Routes/AuthRouter');
const ProductsRouter = require('./Routes/ProductsRouter');
const AdminCustomerRoutes = require('./Routes/AdminCustomerRoutes');
const AdminProductRoute = require('./Routes/AdminProductRoutes');

require('dotenv').config();
require('./Models/db');

// const PORT = process.env.PORT || 8080;

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");


app.get('/ping', (req, res) => {
  res.send('Pong');
});

app.use(bodyParser.json());
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.set('trust proxy', true); //
app.use('/auth', AuthRouter);
app.use('/products', ProductsRouter);

app.use('/auth', require('./Routes/AuthRouter'));

app.use('/auth', AdminCustomerRoutes);

app.use('/admin', AdminProductRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
