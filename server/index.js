require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const catalogRoutes = require('./routes/catalog');
const adminRoutes = require('./routes/admin');
const shopify = require('./connectors/shopify');
const woocommerce = require('./connectors/woocommerce');
const { runSync } = require('./syncEngine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

async function initializeServer() {
  // Setup periodic background sync worker (runs every 15 mins if enabled)
  setInterval(async () => {
    const settings = db.getSettings();
    if (settings.auto_sync_enabled && (shopify.configuration().connected || woocommerce.configuration().connected)) {
      console.log('Running scheduled live store sync...');
      await runSync('all');
    }
  }, 15 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`🚀 Catalog Maker Platform Server running on http://localhost:${PORT}`);
    console.log(`📡 Internal API: http://localhost:${PORT}/api/v1/products`);
    console.log('Configure Shopify and WooCommerce credentials in environment variables to connect live stores.');
  });
}

initializeServer();
