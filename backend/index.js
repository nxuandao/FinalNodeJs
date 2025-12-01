require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");


// MongoDB
require("./Models/db");

// Import routes (CommonJS)
const aiRoutes = require("./Routes/ai.routes");
const AdminCustomerRoutes = require("./Routes/AdminCustomerRoutes");
const AdminProductRoutes = require("./Routes/AdminProductRoutes");
const AuthRouter = require("./Routes/AuthRouter");
const ProductsRouter = require("./Routes/ProductsRouter");
const userRoutes = require("./Routes/UserRouter");
const uploadRoutes = require("./Routes/UpLoadRouter");
const orderRoutes = require("./Routes/orderRoutes");
const PaymentRouter = require("./Routes/Payment");
const couponsRouter = require("./Routes/CouponsRouter");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.FRONTEND_URL,
      process.env.FRONTEND_ORIGIN,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

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
          "http://localhost:5173",
        ],
      },
    },
  })
);

// Cho phép truy cập ảnh upload
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

app.use(express.json());
app.set("trust proxy", true);

// Routes
app.use("/payment", PaymentRouter);
app.use("/orders", orderRoutes);
app.use("/auth", AuthRouter);
app.use("/products", ProductsRouter);
app.use("/users", userRoutes);
app.use("/auth", AdminCustomerRoutes);
app.use("/admin", uploadRoutes);
app.use("/admin", AdminProductRoutes);
app.use("/ai", aiRoutes);
app.use("/coupons", couponsRouter);

app.get("/ping", (req, res) => res.send("Pong"));

// Proxy ảnh
app.get("/img-proxy", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing url");

    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).send("Upstream error");

    res.set("Content-Type", r.headers.get("content-type") || "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");

    r.body.pipe(res);
  } catch (err) {
    console.error("img-proxy error:", err);
    res.status(500).send("Proxy error");
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server is running at http://localhost:${PORT}`)
);
