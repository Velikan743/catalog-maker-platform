const db = require('../db');

function mapWooCategory(categories = []) {
  if (!categories || categories.length === 0) return 'cat-furniture';
  const catName = (categories[0].name || categories[0].slug || '').toLowerCase();
  
  if (catName.includes('carpet') || catName.includes('rug') || catName.includes('silk')) return 'cat-carpets';
  if (catName.includes('runner')) return 'cat-runners';
  if (catName.includes('dhurrie')) return 'cat-dhurries';
  if (catName.includes('furniture')) return 'cat-furniture';
  if (catName.includes('lighting') || catName.includes('lamp')) return 'cat-lighting';
  return 'cat-decor';
}

function normalizeWooProduct(wooProd) {
  const price = Number(wooProd.price || wooProd.regular_price || 0);
  const regPrice = Number(wooProd.regular_price || price);
  const qty = Number(wooProd.stock_quantity !== undefined && wooProd.stock_quantity !== null ? wooProd.stock_quantity : 8);
  const inStock = wooProd.stock_status === 'instock' && qty > 0;
  const categoryId = mapWooCategory(wooProd.categories);

  const images = (wooProd.images && wooProd.images.length > 0)
    ? wooProd.images.map(img => img.src)
    : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'];

  const attributes = (wooProd.attributes || []).map(a => ({
    name: a.name,
    options: a.options
  }));

  const descriptionClean = (wooProd.description || wooProd.short_description || '')
    .replace(/<[^>]*>?/gm, '')
    .trim();

  return {
    source_type: 'woocommerce',
    source_id: String(wooProd.id),
    sku: wooProd.sku || `WOOC-${wooProd.id}`,
    title: wooProd.name,
    description: descriptionClean || wooProd.name,
    price: price,
    compare_at_price: regPrice > price ? regPrice : 0,
    category_id: categoryId,
    sub_category: wooProd.categories[0] ? wooProd.categories[0].name : 'WooCommerce Import',
    stock_status: inStock ? 'in_stock' : 'out_of_stock',
    in_stock: inStock,
    stock_quantity: qty,
    images: images,
    variants: attributes,
    source_url: wooProd.permalink || `https://woostore.example/product/${wooProd.slug}`,
    tags: wooProd.type || ''
  };
}

function importWooProducts(wooList) {
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  const details = [];

  wooList.forEach(rawProd => {
    const normalized = normalizeWooProduct(rawProd);
    const existing = db.getProductBySourceId('woocommerce', normalized.source_id);

    if (!existing) {
      db.saveProduct(normalized);
      added++;
      details.push({ action: 'added', title: normalized.title, sku: normalized.sku });
    } else {
      const priceChanged = Number(existing.price) !== Number(normalized.price);
      const stockChanged = Boolean(existing.in_stock) !== Boolean(normalized.in_stock) || Number(existing.stock_quantity) !== Number(normalized.stock_quantity);
      const titleChanged = existing.title !== normalized.title;

      if (priceChanged || stockChanged || titleChanged) {
        db.saveProduct({
          ...existing,
          ...normalized,
          id: existing.id,
          updated_by_source: 'woocommerce_sync'
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

module.exports = { normalizeWooProduct, importWooProducts };
