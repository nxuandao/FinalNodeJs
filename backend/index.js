require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

require("./Models/db"); // ✅ Kết nối MongoDB trước khi chạy routes

// ✅ Import routes
const AdminCustomerRoutes = require("./Routes/AdminCustomerRoutes");
const AdminProductRoutes = require("./Routes/AdminProductRoutes");
const AuthRouter = require("./Routes/AuthRouter");
const ProductsRouter = require("./Routes/ProductsRouter");
const userRoutes = require("./Routes/UserRouter");
const uploadRoutes = require("./Routes/UpLoadRouter"); // ✅ Upload route (Cloudinary)

const app = express();
const PORT = process.env.PORT || 8080;

/* --- ✅ 1. CORS phải bật TRƯỚC mọi routes --- */
app.use(
  cors({
    origin: [
      "http://localhost:3000", // CRA
      "http://localhost:5173", // Vite
      process.env.FRONTEND_URL, // Nếu deploy FE
      process.env.FRONTEND_ORIGIN, // thêm fallback
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* --- ✅ 2. Helmet bảo mật, cho phép ảnh Cloudinary / HTTPS / data URLs --- */
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": [
  "'self'",
  "data:",
  "blob:",
  "https:",
  "http:",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5173"
],

      },
    },
  })
);
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);




/* --- ✅ 4. Middleware cơ bản --- */
app.use(express.json());
app.set("trust proxy", true);

/* --- ✅ 5. Healthcheck --- */
app.get("/ping", (req, res) => res.send("Pong"));

/* --- ✅ 6. Các routes --- */
app.use("/auth", AuthRouter);
app.use("/products", ProductsRouter);
app.use("/users", userRoutes);
app.use("/auth", AdminCustomerRoutes);

// ⚠️ Đặt upload route TRƯỚC admin product route
app.use("/admin", uploadRoutes);
app.use("/admin", AdminProductRoutes);

/* --- ✅ 7. (Optional) Image proxy (cho ảnh Cloudinary/hotlink) --- */
app.get("/img-proxy", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing url");
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).send("Upstream error");

    res.set("Content-Type", r.headers.get("content-type") || "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    r.body.pipe(res);
  } catch (e) {
    console.error("img-proxy error:", e);
    res.status(500).send("Proxy error");
  }
});

/* --- ✅ 8. Start server --- */
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
