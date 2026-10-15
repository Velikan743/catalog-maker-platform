const shopify = require('./connectors/shopify');
const woocommerce = require('./connectors/woocommerce');

async function mutateSourceProduct(input = {}) {
  if (input.source_type === 'shopify') return shopify.mutateProduct(input);
  if (input.source_type === 'woocommerce') return woocommerce.mutateProduct(input);
  throw new Error('Choose Shopify or WooCommerce as the source store.');
}

module.exports = mutateSourceProduct;
