const db = require('./db');
const shopify = require('./connectors/shopify');
const woocommerce = require('./connectors/woocommerce');
const { importShopifyProducts } = require('./importers/shopifyImporter');
const { importWooProducts } = require('./importers/woocommerceImporter');

async function runSync(targetSource = 'all', demoWooOverrides = {}) {
  const startedAt = new Date().toISOString();
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalUnchanged = 0;
  const details = [];
  const errors = [];
  const sources = targetSource === 'all' ? ['shopify', 'woocommerce'] : [targetSource];

  for (const source of sources) {
    try {
      if (source === 'shopify') {
        const result = importShopifyProducts(await shopify.getProducts());
        totalAdded += result.added; totalUpdated += result.updated; totalUnchanged += result.unchanged;
        details.push(...result.details.map(item => ({ ...item, source })));
      } else if (source === 'woocommerce') {
        const result = importWooProducts(woocommerce.getProducts(demoWooOverrides));
        totalAdded += result.added; totalUpdated += result.updated; totalUnchanged += result.unchanged;
        details.push(...result.details.map(item => ({ ...item, source })));
      } else {
        errors.push(`Unsupported source: ${source}.`);
      }
    } catch (error) {
      console.error(`Error syncing ${source}:`, error.message);
      errors.push(`${source === 'shopify' ? 'Shopify' : 'WooCommerce'}: ${error.message}`);
    }
  }

  return db.addSyncLog({
    source_type: targetSource, started_at: startedAt,
    status: errors.length ? (totalAdded + totalUpdated ? 'partial' : 'failed') : 'success',
    products_added: totalAdded, products_updated: totalUpdated, products_unchanged: totalUnchanged,
    error_message: errors.length ? errors.join('; ') : null, details
  });
}

module.exports = { runSync };
