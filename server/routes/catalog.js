const express = require('express');
const router = express.Router();
const db = require('../db');
const shopify = require('../connectors/shopify');
const woocommerce = require('../connectors/woocommerce');

async function getCatalogProducts(query = {}) {
  let demoWooOverrides = {};
  try { demoWooOverrides = JSON.parse(query.demoWooOverrides || '{}'); } catch { /* ignore malformed session demo data */ }
  const [shopifyResult, wooResult] = await Promise.allSettled([
    shopify.configuration().connected ? shopify.getProducts() : Promise.resolve([]),
    woocommerce.getProducts(demoWooOverrides)
  ]);
  return [
    ...db.getProducts().filter(product => product.source_type === 'manual'),
    ...(shopifyResult.status === 'fulfilled' ? shopifyResult.value.map(product => ({ ...product, id: `prod-shopify-${product.source_id}` })) : []),
    ...(wooResult.status === 'fulfilled' ? wooResult.value.map(product => ({ ...product, id: `prod-woo-${product.source_id}` })) : [])
  ];
}

function filterProducts(products, { category, search, inStock, sort }) {
  let results = products;
  if (category) results = results.filter(product => product.category_id === category || product.category_slug === category);
  if (search) {
    const term = String(search).toLowerCase().trim();
    results = results.filter(product => [product.title, product.sku, product.description, product.sub_category].some(value => String(value || '').toLowerCase().includes(term)));
  }
  if (inStock === 'true') results = results.filter(product => product.in_stock);
  if (sort === 'price_asc') results.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') results.sort((a, b) => b.price - a.price);
  else if (sort === 'newest') results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  else results.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  return results;
}

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
router.get('/products', async (req, res) => {
  try {
    const { category, search, inStock, sort, page = 1, limit = 20 } = req.query;

    const allProducts = filterProducts(await getCatalogProducts(req.query), { category, search, inStock, sort });

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
router.get('/products/:id', async (req, res) => {
  try {
    const products = await getCatalogProducts(req.query);
    const product = products.find(item => String(item.id) === String(req.params.id));
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Track analytics view
    db.trackAnalytics('view', { product_id: product.id });

    // Get related products in same category
    const related = filterProducts(products, { category: product.category_id })
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
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.json({ success: true, results: [] });
    }
    const results = filterProducts(await getCatalogProducts(req.query), { search: q }).slice(0, 15);
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
