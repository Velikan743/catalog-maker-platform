const DEMO_PRODUCTS = [
  {
    id: 401, name: 'Everyday Cotton Poplin Shirt', slug: 'everyday-cotton-poplin-shirt',
    description: 'A clean-cut cotton poplin shirt for workdays and weekends.', sku: 'DEMO-SHIRT-401', price: '2499', regular_price: '2999',
    stock_status: 'instock', stock_quantity: 18, type: 'simple', permalink: '',
    categories: [{ name: 'Shirts', slug: 'shirts' }], images: [{ src: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85' }]
  },
  {
    id: 402, name: 'Court Leather Sneakers', slug: 'court-leather-sneakers',
    description: 'Minimal leather sneakers with a cushioned everyday sole.', sku: 'DEMO-SHOE-402', price: '5499', regular_price: '5499',
    stock_status: 'instock', stock_quantity: 9, type: 'simple', permalink: '',
    categories: [{ name: 'Shoes', slug: 'shoes' }], images: [{ src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85' }]
  },
  {
    id: 403, name: 'Sculpted Gold Hoop Earrings', slug: 'sculpted-gold-hoop-earrings',
    description: 'Lightweight gold-tone hoops with a softly sculpted profile.', sku: 'DEMO-JEWEL-403', price: '1799', regular_price: '1799',
    stock_status: 'instock', stock_quantity: 24, type: 'simple', permalink: '',
    categories: [{ name: 'Jewellery', slug: 'jewellery' }], images: [{ src: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85' }]
  }
];

function configuration() {
  return { connected: true, demo: true };
}

function getProducts(overrides = {}) {
  return DEMO_PRODUCTS.map(product => ({ ...product, ...(overrides[String(product.id)] || {}) }));
}

async function mutateProduct({ product_id, price, stock_quantity, title }) {
  const product = DEMO_PRODUCTS.find(item => String(item.id) === String(product_id));
  if (!product) {
    const error = new Error(`WooCommerce demo product ${product_id || '(empty ID)'} was not found.`);
    error.statusCode = 404;
    throw error;
  }
  return {
    ...product,
    ...(title ? { name: String(title) } : {}),
    ...(price !== undefined && price !== '' ? { price: String(price), regular_price: String(price), sale_price: '' } : {}),
    ...(stock_quantity !== undefined && stock_quantity !== '' ? {
      stock_quantity: Number(stock_quantity), stock_status: Number(stock_quantity) > 0 ? 'instock' : 'outofstock'
    } : {})
  };
}

module.exports = { configuration, getProducts, mutateProduct };
