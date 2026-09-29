const express = require('express');
const router = express.Router();
const db = require('../db');
const { runSync } = require('../syncEngine');
const shopifyStore = require('../mockStores/shopifyStore');
const woocommerceStore = require('../mockStores/woocommerceStore');

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
    const imCount = products.filter(p => p.source_type === 'indiamart').length;
    const manualCount = products.filter(p => p.source_type === 'manual').length;
    const outOfStockCount = products.filter(p => !p.in_stock).length;

    res.json({
      success: true,
      stats: {
        total_products: products.length,
        total_categories: categories.length,
        shopify_products: shopifyCount,
        woocommerce_products: wooCount,
        indiamart_products: imCount,
        manual_products: manualCount,
        out_of_stock_products: outOfStockCount,
        active_design: settings.active_design,
        whatsapp_number: settings.whatsapp_number,
        last_sync_time: settings.last_sync_time,
        total_views: analytics.views_count || 0,
        total_enquiries: analytics.enquiries_count || 0,
        total_wishlists: analytics.wishlist_add_count || 0
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
    const saved = db.saveProduct(req.body);
    res.json({ success: true, product: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save product.' });
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

router.post('/import/indiamart', async (req, res) => {
  try {
    const log = await runSync('indiamart');
    res.json({ success: true, message: 'IndiaMART B2B products imported successfully.', log });
  } catch (err) {
    res.status(500).json({ success: false, message: 'IndiaMART import failed.' });
  }
});

router.post('/sync/run', async (req, res) => {
  try {
    const { source = 'all' } = req.body;
    const log = await runSync(source);
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Catalog synchronization failed.' });
  }
});

router.get('/sync/history', (req, res) => {
  res.json({ success: true, sync_logs: db.getSyncLogs(50) });
});

router.get('/change-history', (req, res) => {
  res.json({ success: true, change_history: db.getChangeHistory(50) });
});

// --- Live Demonstration Helper: Simulate Source Mutation ---
router.post('/simulate-source-change', (req, res) => {
  try {
    const { source_type, product_id, price, stock_quantity, title } = req.body;

    let updated = null;
    if (source_type === 'shopify') {
      updated = shopifyStore.mutateProduct(product_id, { price, inventory_quantity: stock_quantity, title });
    } else if (source_type === 'woocommerce') {
      updated = woocommerceStore.mutateProduct(product_id, { price, stock_quantity, name: title });
    }

    if (updated) {
      res.json({
        success: true,
        message: `Successfully modified ${source_type} external store record. Run Sync to propagate changes!`,
        external_record: updated
      });
    } else {
      res.status(404).json({ success: false, message: 'Target external product not found.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mutate source data.' });
  }
});

module.exports = router;
