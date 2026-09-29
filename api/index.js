const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('../server/db');
const catalogRoutes = require('../server/routes/catalog');
const adminRoutes = require('../server/routes/admin');
const shopifyStore = require('../server/mockStores/shopifyStore');
const woocommerceStore = require('../server/mockStores/woocommerceStore');
const { runSync } = require('../server/syncEngine');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- External Mock APIs ---
app.get('/api/external/shopify/products.json', (req, res) => {
  res.json({ products: shopifyStore.getProducts() });
});

app.get('/api/external/woocommerce/wp-json/wc/v3/products', (req, res) => {
  res.json(woocommerceStore.getProducts());
});

// --- Catalog Platform APIs ---
app.use('/api/v1', catalogRoutes);
app.use('/api/v1/admin', adminRoutes);

// Seed DB if empty on cold start
const currentProds = db.getProducts();
if (currentProds.length === 0) {
  runSync('all').catch(err => console.error(err));
}

module.exports = app;
