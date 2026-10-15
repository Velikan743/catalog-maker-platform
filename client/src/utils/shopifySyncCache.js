const PRODUCT_SNAPSHOT_KEY = 'catalog-shopify-synced-products';
const SYNC_HISTORY_KEY = 'catalog-shopify-sync-history';
const HISTORY_LIMIT = 100;

function readArray(key) {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return null;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getShopifySnapshot(liveProducts = []) {
  const saved = readArray(PRODUCT_SNAPSHOT_KEY);
  if (saved !== null) return saved;
  saveShopifySnapshot(liveProducts);
  return liveProducts;
}

export function saveShopifySnapshot(products) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRODUCT_SNAPSHOT_KEY, JSON.stringify(products));
}

export function readShopifySyncHistory() {
  return readArray(SYNC_HISTORY_KEY) || [];
}

export function recordShopifySync(freshProducts, source = 'shopify') {
  const previousProducts = readArray(PRODUCT_SNAPSHOT_KEY) || [];
  const previousById = new Map(previousProducts.map(product => [String(product.source_id), product]));
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  const details = [];
  const fields = ['title', 'sku', 'price', 'compare_at_price', 'stock_quantity', 'in_stock', 'description', 'category_id'];

  for (const product of freshProducts) {
    const previous = previousById.get(String(product.source_id));
    if (!previous) {
      added += 1;
      details.push({ action: 'added', title: product.title, sku: product.sku, source: 'shopify' });
      continue;
    }
    const changes = Object.fromEntries(fields
      .filter(field => String(previous[field] ?? '') !== String(product[field] ?? ''))
      .map(field => [field, { old: previous[field], new: product[field] }]));
    if (Object.keys(changes).length) {
      updated += 1;
      details.push({ action: 'updated', title: product.title, sku: product.sku, source: 'shopify', changes });
    } else {
      unchanged += 1;
    }
  }

  const completedAt = new Date().toISOString();
  const log = {
    id: `browser-sync-${Date.now()}`,
    source_type: source,
    started_at: completedAt,
    completed_at: completedAt,
    status: 'success',
    products_added: added,
    products_updated: updated,
    products_unchanged: unchanged,
    error_message: null,
    details
  };
  saveShopifySnapshot(freshProducts);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify([log, ...readShopifySyncHistory()].slice(0, HISTORY_LIMIT)));
  }
  return log;
}
