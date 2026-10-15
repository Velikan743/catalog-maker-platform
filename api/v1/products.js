const db = require('../../server/db');
const shopify = require('../../server/connectors/shopify');
const woocommerce = require('../../server/connectors/woocommerce');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { category, search, inStock, sort, page = 1, limit = 100 } = req.query || {};
    const [shopifyResult, wooResult] = await Promise.allSettled([
      shopify.configuration().connected ? shopify.getProducts() : Promise.resolve([]),
      woocommerce.configuration().connected ? woocommerce.getProducts(parseWooOverrides(req.query?.demoWooOverrides)) : Promise.resolve([])
    ]);
    const products = [
      ...db.getProducts().filter(product => product.source_type === 'manual'),
      ...(shopifyResult.status === 'fulfilled' ? shopifyResult.value.map(product => ({ ...product, id: `prod-shopify-${product.source_id}` })) : []),
      ...(wooResult.status === 'fulfilled' ? wooResult.value.map(product => ({ ...product, id: `prod-woo-${product.source_id}` })) : [])
    ];
    let allProducts = products;
    if (category) allProducts = allProducts.filter(product => product.category_id === category || product.category_slug === category);
    if (search) {
      const term = String(search).toLowerCase().trim();
      allProducts = allProducts.filter(product => [product.title, product.sku, product.description, product.sub_category].some(value => String(value || '').toLowerCase().includes(term)));
    }
    if (inStock === 'true') allProducts = allProducts.filter(product => product.in_stock);
    if (sort === 'price_asc') allProducts.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') allProducts.sort((a, b) => b.price - a.price);
    else if (sort === 'newest') allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else allProducts.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = allProducts.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      total: allProducts.length,
      page: pageNum,
      limit: limitNum,
      has_more: startIndex + limitNum < allProducts.length,
      products: paginatedProducts,
      source_errors: [shopifyResult, wooResult].map((result, index) => result.status === 'rejected' ? `${index === 0 ? 'Shopify' : 'WooCommerce'}: ${result.reason.message}` : null).filter(Boolean)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

function parseWooOverrides(serialized) {
  if (!serialized) return {};
  try {
    const parsed = JSON.parse(serialized);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
