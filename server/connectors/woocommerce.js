function configuration() {
  return { connected: true, demo: true };
}

function getProducts() {
  // WooCommerce is intentionally a mock connection, but fabricated products
  // should not be mixed into the real Shopify catalog.
  return [];
}

async function mutateProduct({ product_id, price, stock_quantity, title }) {
  const error = new Error('WooCommerce is a mock connection with no demo products configured. Only Shopify products are available to update.');
  error.statusCode = 404;
  throw error;
}

module.exports = { configuration, getProducts, mutateProduct };
