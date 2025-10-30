const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const AuthRouter = require('./Routes/AuthRouter');
const ProductsRouter = require('./Routes/ProductsRouter');
const AdminCustomerRoutes = require('./Routes/AdminCustomerRoutes');
const AdminProductRoute = require('./Routes/AdminProductRoutes');

require('dotenv').config();
require('./Models/db');

const PORT = process.env.PORT || 8080;

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