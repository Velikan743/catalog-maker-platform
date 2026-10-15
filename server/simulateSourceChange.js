const shopifyStore = require('./mockStores/shopifyStore');
const woocommerceStore = require('./mockStores/woocommerceStore');

function mutateSourceProduct({ source_type, product_id, price, stock_quantity, title } = {}) {
  let externalRecord;

  if (source_type === 'shopify') {
    externalRecord = shopifyStore.mutateProduct(product_id, {
      price,
      inventory_quantity: stock_quantity,
      title
    });
  } else if (source_type === 'woocommerce') {
    externalRecord = woocommerceStore.mutateProduct(product_id, {
      price,
      stock_quantity,
      name: title
    });
  } else {
    throw new Error('Choose Shopify or WooCommerce as the source store.');
  }

  if (!externalRecord) {
    const error = new Error(`Product ${product_id || '(empty ID)'} was not found in the ${source_type} demo store.`);
    error.statusCode = 404;
    throw error;
  }

  return externalRecord;
}

module.exports = mutateSourceProduct;
