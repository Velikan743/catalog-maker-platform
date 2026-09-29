const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/config - Get catalog configuration & settings
router.get('/config', (req, res) => {
  try {
    const settings = db.getSettings();
    const categories = db.getCategories().filter(c => c.is_visible);
    res.json({
      success: true,
      config: {
        catalog_name: settings.catalog_name,
        whatsapp_number: settings.whatsapp_number,
        whatsapp_message_header: settings.whatsapp_message_header,
        active_design: settings.active_design,
        currency_symbol: settings.currency_symbol,
        last_sync_time: settings.last_sync_time
      },
      categories
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load catalog configuration.' });
  }
});

// GET /api/v1/categories - List visible categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.getCategories().filter(c => c.is_visible);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
});

// GET /api/v1/products - List products with search, pagination, category filtering
router.get('/products', (req, res) => {
  try {
    const { category, search, inStock, sort, page = 1, limit = 20 } = req.query;

    const allProducts = db.getProducts({
      category,
      search,
      inStockOnly: inStock === 'true',
      sort
    });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = allProducts.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      total: allProducts.length,
      page: pageNum,
      limit: limitNum,
      has_more: startIndex + limitNum < allProducts.length,
      products: paginatedProducts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch catalog products.' });
  }
});

// GET /api/v1/products/:id - Get single product detail + related items
router.get('/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Track analytics view
    db.trackAnalytics('view', { product_id: product.id });

    // Get related products in same category
    const related = db.getProducts({ category: product.category_id })
      .filter(p => p.id !== product.id)
      .slice(0, 6);

    res.json({
      success: true,
      product,
      related
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving product detail.' });
  }
});

// GET /api/v1/search - Instant search endpoint
router.get('/search', (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.json({ success: true, results: [] });
    }
    const results = db.getProducts({ search: q }).slice(0, 15);
    res.json({ success: true, query: q, results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Search operation failed.' });
  }
});

// POST /api/v1/track-analytics - Client analytics logger (wishlist, WhatsApp inquiry)
router.post('/track-analytics', (req, res) => {
  try {
    const { type, payload } = req.body;
    if (type) {
      db.trackAnalytics(type, payload);
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

module.exports = router;
