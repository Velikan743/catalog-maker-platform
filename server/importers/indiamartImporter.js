const db = require('../db');

function mapIndiamartCategory(catName) {
  const cn = (catName || '').toLowerCase();
  if (cn.includes('carpet') || cn.includes('silk') || cn.includes('rug')) return 'cat-carpets';
  if (cn.includes('runner')) return 'cat-runners';
  if (cn.includes('dhurrie')) return 'cat-dhurries';
  if (cn.includes('furniture')) return 'cat-furniture';
  if (cn.includes('lighting') || cn.includes('lamp')) return 'cat-lighting';
  return 'cat-decor';
}

function normalizeIndiamartProduct(imItem) {
  const price = Number(imItem.PRICE_PER_UNIT || 0);
  const categoryId = mapIndiamartCategory(imItem.CATEGORY_NAME);

  return {
    source_type: 'indiamart',
    source_id: String(imItem.QUERY_ID),
    sku: `IM-${imItem.QUERY_ID}`,
    title: imItem.ITEM_NAME,
    description: `[B2B Wholesale - MOQ: ${imItem.MIN_ORDER_QTY} | Supplier: ${imItem.COMPANY_NAME}, ${imItem.CITY}]\n\n${imItem.DESCRIPTION}`,
    price: price,
    compare_at_price: Math.round(price * 1.25),
    category_id: categoryId,
    sub_category: 'IndiaMART B2B',
    stock_status: 'in_stock',
    in_stock: true,
    stock_quantity: 50,
    images: [imItem.PRIMARY_IMAGE],
    variants: [
      { name: 'Minimum Order Qty', options: [imItem.MIN_ORDER_QTY] },
      { name: 'Supplier GST', options: [imItem.GST_NUMBER] }
    ],
    source_url: `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(imItem.ITEM_NAME)}`,
    tags: `b2b, wholesale, indiamart, ${imItem.CITY.toLowerCase()}`
  };
}

function importIndiamartProducts(imList) {
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  const details = [];

  imList.forEach(rawItem => {
    const normalized = normalizeIndiamartProduct(rawItem);
    const existing = db.getProductBySourceId('indiamart', normalized.source_id);

    if (!existing) {
      db.saveProduct(normalized);
      added++;
      details.push({ action: 'added', title: normalized.title, sku: normalized.sku });
    } else {
      unchanged++;
    }
  });

  return { added, updated, unchanged, details };
}

module.exports = { normalizeIndiamartProduct, importIndiamartProducts };
