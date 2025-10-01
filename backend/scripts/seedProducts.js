// scripts/seedProducts.js
require('dotenv').config();
require('../db'); // đảm bảo gọi connect
const Product = require('../Models/Product');

(async () => {
    await Product.deleteMany({});
    await Product.insertMany([
        { name: 'Áo thun Basic', color: 'black', colors: ['black'], category: 'shirt', price: 150000 },
        { name: 'Áo thun Basic', color: 'white', colors: ['white'], category: 'shirt', price: 150000 },
        { name: 'Giày Sneaker Pro', colors: ['red', 'white'], category: 'shoes', price: 790000 },

        { name: 'Tai nghe Bluetooth', color: 'blue', category: 'electronics', price: 350000 }
    ]);
    console.log('Seeded!');
    process.exit(0);
})();
