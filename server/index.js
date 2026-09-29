const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const db = require('./db');
const catalogRoutes = require('./routes/catalog');
const adminRoutes = require('./routes/admin');
const shopifyStore = require('./mockStores/shopifyStore');
const woocommerceStore = require('./mockStores/woocommerceStore');
const { runSync } = require('./syncEngine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Simulated External E-Commerce APIs ---
// 1. Shopify REST API Endpoint
app.get('/api/external/shopify/products.json', (req, res) => {
  res.json({ products: shopifyStore.getProducts() });
});

// 2. WooCommerce REST API v3 Endpoint
app.get('/api/external/woocommerce/wp-json/wc/v3/products', (req, res) => {
  res.json(woocommerceStore.getProducts());
});

// --- Internal Catalog Platform APIs ---
app.use('/api/v1', catalogRoutes);
app.use('/api/v1/admin', adminRoutes);

// --- Serve Static Production Assets if Client Built ---
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Catalog Maker API Server is running. Client build not found yet.');
  }
});

// Auto-seed initial catalog from mock external stores if database has no products
async function initializeServer() {
  const currentProds = db.getProducts();
  if (currentProds.length === 0) {
    console.log('📦 Database empty on startup. Running initial import of 110+ demo products...');
    await runSync('all');
    console.log('✅ Initial import complete! Database populated with Shopify & WooCommerce products.');
  }

  // Setup periodic background sync worker (runs every 15 mins if enabled)
  setInterval(async () => {
    const settings = db.getSettings();
    if (settings.auto_sync_enabled) {
      console.log('🔄 Running scheduled background catalog sync...');
      await runSync('all');
    }
  }, 15 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`🚀 Catalog Maker Platform Server running on http://localhost:${PORT}`);
    console.log(`📡 Internal API: http://localhost:${PORT}/api/v1/products`);
    console.log(`🛍️ Mock Shopify API: http://localhost:${PORT}/api/external/shopify/products.json`);
    console.log(`🛒 Mock WooCommerce API: http://localhost:${PORT}/api/external/woocommerce/wp-json/wc/v3/products`);
  });
}

initializeServer();
