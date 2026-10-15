const STORAGE_KEY = 'catalog-manual-products';

export function readManualProducts() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(product => product?.source_type === 'manual') : [];
  } catch {
    return [];
  }
}

export function saveManualProduct(product) {
  if (typeof window === 'undefined' || !product || product.source_type !== 'manual') return;
  const products = readManualProducts();
  const index = products.findIndex(item => String(item.id) === String(product.id));
  if (index === -1) products.unshift(product);
  else products[index] = product;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function deleteManualProduct(productId) {
  if (typeof window === 'undefined') return;
  const products = readManualProducts().filter(product => String(product.id) !== String(productId));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function mergeManualProducts(products = []) {
  const byId = new Map();
  products.filter(product => product?.source_type === 'manual')
    .forEach(product => byId.set(String(product.id), product));
  readManualProducts().forEach(product => byId.set(String(product.id), product));
  return [...byId.values()];
}
