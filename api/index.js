require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('../server/db');
const catalogRoutes = require('../server/routes/catalog');
const adminRoutes = require('../server/routes/admin');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Catalog Platform APIs ---
// Mount on both /v1 and /api/v1 to handle Vercel path rewrites seamlessly
app.use('/v1/admin', adminRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use('/v1', catalogRoutes);
app.use('/api/v1', catalogRoutes);

// Fallback status middleware
app.use((req, res) => {
  res.json({
    status: 'online',
    path: req.path,
    url: req.url,
    total_products: db.getProducts().length
  });
});

module.exports = app;
