function mapWooCategory(categories = [], title = '') {
  const text = `${(categories || []).map(category => `${category.name || ''} ${category.slug || ''}`).join(' ')} ${title}`.toLowerCase();
  if (/jewel|necklace|earring|bracelet|ring|pendant/.test(text)) return 'cat-jewellery';
  if (/shoe|sneaker|boot|sandal|heel|loafer/.test(text)) return 'cat-shoes';
  if (/t[ -]?shirt|tee/.test(text)) return 'cat-tshirts';
  if (/shirt|blouse/.test(text)) return 'cat-shirts';
  if (/pant|trouser/.test(text)) return 'cat-pants';
  if (/jean|denim/.test(text)) return 'cat-jeans';
  if (/tie/.test(text)) return 'cat-ties';
  if (/jacket|coat/.test(text)) return 'cat-jackets';
  return 'cat-accessories';
}

function normalizeWooProduct(wooProd) {
  const price = Number(wooProd.price || wooProd.regular_price || 0);
  const regPrice = Number(wooProd.regular_price || price);
  const qty = Number(wooProd.stock_quantity !== undefined && wooProd.stock_quantity !== null ? wooProd.stock_quantity : 0);
  const inStock = wooProd.stock_status === 'instock' && (wooProd.stock_quantity == null || qty > 0);
  const categoryId = mapWooCategory(wooProd.categories, wooProd.name);

  const images = (wooProd.images && wooProd.images.length > 0)
    ? wooProd.images.map(img => img.src)
    : [];

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
    sub_category: (wooProd.categories || [])[0] ? wooProd.categories[0].name : 'Accessories',
    stock_status: inStock ? 'in_stock' : 'out_of_stock',
    in_stock: inStock,
    stock_quantity: qty,
    images: images,
    variants: attributes,
    source_url: wooProd.permalink || '',
    tags: wooProd.type || ''
  };
}

function importWooProducts(wooList) {
  const db = require('../db');
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
