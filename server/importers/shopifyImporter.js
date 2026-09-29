const db = require('../db');

function mapShopifyCategory(productType) {
  const pt = (productType || '').toLowerCase();
  if (pt.includes('silk') || pt.includes('carpet') || pt.includes('rug')) return 'cat-carpets';
  if (pt.includes('runner')) return 'cat-runners';
  if (pt.includes('dhurrie') || pt.includes('flatweave')) return 'cat-dhurries';
  if (pt.includes('furniture')) return 'cat-furniture';
  if (pt.includes('lighting') || pt.includes('lamp')) return 'cat-lighting';
  return 'cat-decor';
}

function normalizeShopifyProduct(shopifyProd) {
  const variant = (shopifyProd.variants && shopifyProd.variants[0]) || {};
  const price = Number(variant.price || 0);
  const compareAtPrice = Number(variant.compare_at_price || price);
  const qty = Number(variant.inventory_quantity !== undefined ? variant.inventory_quantity : 10);
  const inStock = qty > 0;
  const categoryId = mapShopifyCategory(shopifyProd.product_type);

  const images = (shopifyProd.images && shopifyProd.images.length > 0)
    ? shopifyProd.images.map(img => img.src)
    : ['https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80'];

  const variants = (shopifyProd.variants || []).map(v => ({
    id: v.id,
    title: v.title,
    price: Number(v.price),
    sku: v.sku,
    stock: v.inventory_quantity
  }));

  // Clean html body tags
  const descriptionClean = (shopifyProd.body_html || '')
    .replace(/<[^>]*>?/gm, '')
    .trim();

  return {
    source_type: 'shopify',
    source_id: String(shopifyProd.id),
    sku: variant.sku || `SHPF-${shopifyProd.id}`,
    title: shopifyProd.title,
    description: descriptionClean || shopifyProd.title,
    price: price,
    compare_at_price: compareAtPrice > price ? compareAtPrice : 0,
    category_id: categoryId,
    sub_category: shopifyProd.product_type || 'Shopify Import',
    stock_status: inStock ? 'in_stock' : 'out_of_stock',
    in_stock: inStock,
    stock_quantity: qty,
    images: images,
    variants: variants,
    source_url: `https://shopify-store.example/products/${shopifyProd.id}`,
    tags: shopifyProd.tags || ''
  };
}

function importShopifyProducts(shopifyList) {
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  const details = [];

  shopifyList.forEach(rawProd => {
    const normalized = normalizeShopifyProduct(rawProd);
    const existing = db.getProductBySourceId('shopify', normalized.source_id);

    if (!existing) {
      db.saveProduct(normalized);
      added++;
      details.push({ action: 'added', title: normalized.title, sku: normalized.sku });
    } else {
      // Check if data changed
      const priceChanged = Number(existing.price) !== Number(normalized.price);
      const stockChanged = Boolean(existing.in_stock) !== Boolean(normalized.in_stock) || Number(existing.stock_quantity) !== Number(normalized.stock_quantity);
      const titleChanged = existing.title !== normalized.title;

      if (priceChanged || stockChanged || titleChanged) {
        db.saveProduct({
          ...existing,
          ...normalized,
          id: existing.id, // Preserve existing internal database ID
          updated_by_source: 'shopify_sync'
        });
        updated++;
        details.push({
          action: 'updated',
          title: normalized.title,
          sku: normalized.sku,
          changes: {
            price: priceChanged ? { old: existing.price, new: normalized.price } : null,
            stock: stockChanged ? { old: existing.stock_quantity, new: normalized.stock_quantity } : null
          }
        });
      } else {
        unchanged++;
      }
    }
  });

  return { added, updated, unchanged, details };
}

module.exports = { normalizeShopifyProduct, importShopifyProducts };
