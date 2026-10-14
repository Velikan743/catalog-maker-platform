const db = require('./db');
const shopifyStore = require('./mockStores/shopifyStore');
const woocommerceStore = require('./mockStores/woocommerceStore');
const { normalizeShopifyProduct } = require('./importers/shopifyImporter');
const { normalizeWooProduct } = require('./importers/woocommerceImporter');

function simulateSourceChange({ source_type, product_id, price, stock_quantity, title } = {}) {
  const startedAt = new Date().toISOString();
  let externalRecord;
  let normalized;

  if (source_type === 'shopify') {
    externalRecord = shopifyStore.mutateProduct(product_id, {
      price,
      inventory_quantity: stock_quantity,
      title
    });
    if (externalRecord) normalized = normalizeShopifyProduct(externalRecord);
  } else if (source_type === 'woocommerce') {
    externalRecord = woocommerceStore.mutateProduct(product_id, {
      price,
      stock_quantity,
      name: title
    });
    if (externalRecord) normalized = normalizeWooProduct(externalRecord);
  } else {
    throw new Error('Choose Shopify or WooCommerce as the source store.');
  }

  if (!externalRecord) {
    const error = new Error(`Product ${product_id || '(empty ID)'} was not found in the ${source_type} demo store.`);
    error.statusCode = 404;
    throw error;
  }

  const existing = db.getProductBySourceId(source_type, normalized.source_id);
  const changed = !existing ||
    Number(existing.price) !== Number(normalized.price) ||
    Number(existing.stock_quantity) !== Number(normalized.stock_quantity) ||
    Boolean(existing.in_stock) !== Boolean(normalized.in_stock) ||
    existing.title !== normalized.title;

  const catalogProduct = existing
    ? (changed ? db.saveProduct({
      ...existing,
      ...normalized,
      id: existing.id,
      updated_by_source: `${source_type}_sync`
    }) : existing)
    : db.saveProduct(normalized);

  const syncLog = db.addSyncLog({
    source_type,
    started_at: startedAt,
    status: 'success',
    products_added: existing ? 0 : 1,
    products_updated: existing && changed ? 1 : 0,
    products_unchanged: existing && !changed ? 1 : 0,
    details: [{
      action: existing ? (changed ? 'updated' : 'unchanged') : 'added',
      title: normalized.title,
      sku: normalized.sku,
      source: source_type
    }]
  });

  return { externalRecord, catalogProduct, syncLog };
}

module.exports = simulateSourceChange;
