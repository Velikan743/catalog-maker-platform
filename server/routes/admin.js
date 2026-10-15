const express = require('express');
const router = express.Router();
const db = require('../db');
const { runSync } = require('../syncEngine');
const mutateSourceProduct = require('../mutateSourceProduct');
const shopifyConnector = require('../connectors/shopify');
const wooConnector = require('../connectors/woocommerce');
const { requireAdminToken } = require('../adminAuth');

// GET /api/v1/admin/dashboard - Overview statistics
router.get('/dashboard', (req, res) => {
  try {
    const products = db.getProducts();
    const categories = db.getCategories();
    const settings = db.getSettings();
    const syncLogs = db.getSyncLogs(5);
    const analytics = db.getAnalytics();

    const shopifyCount = products.filter(p => p.source_type === 'shopify').length;
    const wooCount = products.filter(p => p.source_type === 'woocommerce').length;
    const manualCount = products.filter(p => p.source_type === 'manual').length;
    const outOfStockCount = products.filter(p => !p.in_stock).length;

    res.json({
      success: true,
      stats: {
        total_products: products.length,
        total_categories: categories.length,
        shopify_products: shopifyCount,
        woocommerce_products: wooCount,
        manual_products: manualCount,
        out_of_stock_products: outOfStockCount,
        active_design: settings.active_design,
        whatsapp_number: settings.whatsapp_number,
        last_sync_time: settings.last_sync_time,
        total_views: analytics.views_count || 0,
        total_enquiries: analytics.enquiries_count || 0,
        total_wishlists: analytics.wishlist_add_count || 0
      },
      connections: {
        shopify: { connected: shopifyConnector.configuration().connected },
        woocommerce: { connected: wooConnector.configuration().connected, demo: wooConnector.configuration().demo }
      },
      recent_sync_logs: syncLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
});

// GET /api/v1/admin/settings - Read settings
router.get('/settings', (req, res) => {
  res.json({ success: true, settings: db.getSettings() });
});

// POST /api/v1/admin/settings - Update settings (Active theme, WhatsApp number, etc.)
router.post('/settings', (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
});

// --- Category Management ---
router.get('/categories', (req, res) => {
  res.json({ success: true, categories: db.getCategories() });
});

router.post('/categories', (req, res) => {
  try {
    const category = db.saveCategory(req.body);
    res.json({ success: true, categories: category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save category.' });
  }
});

router.delete('/categories/:id', (req, res) => {
  try {
    db.deleteCategory(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
});

// --- Product Management ---
router.post('/products', (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Product details were not received as JSON.' });
    }
    const saved = db.saveProduct(req.body);
    res.json({ success: true, product: saved });
  } catch (err) {
    console.error('Failed to save product:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to save product.' });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    db.deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// --- Data Import & Sync Engine ---
router.post('/import/shopify', async (req, res) => {
  try {
    const log = await runSync('shopify');
    res.json({ success: true, message: 'Shopify products imported successfully.', log });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Shopify import failed.' });
  }
});

router.post('/import/woocommerce', async (req, res) => {
  try {
    const log = await runSync('woocommerce');
    res.json({ success: true, message: 'WooCommerce products imported successfully.', log });
  } catch (err) {
    res.status(500).json({ success: false, message: 'WooCommerce import failed.' });
  }
});

router.post('/sync/run', async (req, res) => {
  try {
    const { source = 'all', demoWooOverrides = {} } = req.body || {};
    const log = await runSync(source, demoWooOverrides);
    res.status(log.status === 'success' ? 200 : 502).json({ success: log.status === 'success', log, message: log.error_message });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Catalog synchronization failed.' });
  }
});

router.get('/sync/history', (req, res) => {
  res.json({ success: true, sync_logs: db.getSyncLogs(50) });
});

router.get('/change-history', (req, res) => {
  res.json({ success: true, change_history: db.getChangeHistory(50) });
});

// --- Apply a requested change to a real connected store ---
router.post('/mutate-source-product', requireAdminToken, async (req, res) => {
  try {
    const externalRecord = await mutateSourceProduct(req.body);
    res.json({
      success: true,
      message: req.body.source_type === 'shopify'
        ? `The product was updated in Shopify. Run a sync to refresh the catalog.`
        : `The WooCommerce demo product was updated for this session.`,
      external_record: externalRecord
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Failed to mutate source data.' });
  }
});

module.exports = router;
