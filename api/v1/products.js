const db = require('../../server/db');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { category, search, inStock, sort, page = 1, limit = 100 } = req.query || {};

    const allProducts = db.getProducts({
      category,
      search,
      inStockOnly: inStock === 'true',
      sort
    });

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
      products: paginatedProducts
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
