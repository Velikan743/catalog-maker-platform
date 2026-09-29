const db = require('./db');
const shopifyStore = require('./mockStores/shopifyStore');
const woocommerceStore = require('./mockStores/woocommerceStore');
const indiamartStore = require('./mockStores/indiamartStore');
const { importShopifyProducts } = require('./importers/shopifyImporter');
const { importWooProducts } = require('./importers/woocommerceImporter');
const { importIndiamartProducts } = require('./importers/indiamartImporter');

async function runSync(targetSource = 'all') {
  const startedAt = new Date().toISOString();
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalUnchanged = 0;
  let allDetails = [];
  let errors = [];

  // 1. Sync Shopify Products
  if (targetSource === 'all' || targetSource === 'shopify') {
    try {
      const shopifyRaw = shopifyStore.getProducts();
      const res = importShopifyProducts(shopifyRaw);
      totalAdded += res.added;
      totalUpdated += res.updated;
      totalUnchanged += res.unchanged;
      allDetails = allDetails.concat(res.details.map(d => ({ ...d, source: 'shopify' })));
    } catch (err) {
      console.error('Error syncing Shopify products:', err);
      errors.push(`Shopify Sync Error: ${err.message}`);
    }
  }

  // 2. Sync WooCommerce Products
  if (targetSource === 'all' || targetSource === 'woocommerce') {
    try {
      const wooRaw = woocommerceStore.getProducts();
      const res = importWooProducts(wooRaw);
      totalAdded += res.added;
      totalUpdated += res.updated;
      totalUnchanged += res.unchanged;
      allDetails = allDetails.concat(res.details.map(d => ({ ...d, source: 'woocommerce' })));
    } catch (err) {
      console.error('Error syncing WooCommerce products:', err);
      errors.push(`WooCommerce Sync Error: ${err.message}`);
    }
  }

  // 3. Sync IndiaMART B2B Products
  if (targetSource === 'all' || targetSource === 'indiamart') {
    try {
      const imRaw = indiamartStore.getProducts();
      const res = importIndiamartProducts(imRaw);
      totalAdded += res.added;
      totalUpdated += res.updated;
      totalUnchanged += res.unchanged;
      allDetails = allDetails.concat(res.details.map(d => ({ ...d, source: 'indiamart' })));
    } catch (err) {
      console.error('Error syncing IndiaMART products:', err);
      errors.push(`IndiaMART Sync Error: ${err.message}`);
    }
  }

  // Record log in DB
  const logEntry = db.addSyncLog({
    source_type: targetSource,
    started_at: startedAt,
    status: errors.length > 0 ? (totalAdded > 0 || totalUpdated > 0 ? 'partial' : 'failed') : 'success',
    products_added: totalAdded,
    products_updated: totalUpdated,
    products_unchanged: totalUnchanged,
    error_message: errors.length > 0 ? errors.join('; ') : null,
    details: allDetails
  });

  return logEntry;
}

module.exports = { runSync };
