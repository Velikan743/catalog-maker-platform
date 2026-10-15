const { normalizeShopifyProduct } = require('../importers/shopifyImporter');

function configuration() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  return { connected: Boolean(domain && token), domain, token, version: process.env.SHOPIFY_API_VERSION || '2026-10' };
}

async function graphql(query, variables = {}) {
  const { domain, token, version, connected } = configuration();
  if (!connected) throw new Error('Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN.');
  const host = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) throw new Error('SHOPIFY_STORE_DOMAIN must be a store domain such as example.myshopify.com.');
  const response = await fetch(`https://${host}/admin/api/${version}/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.map(error => error.message).join('; ') || `Shopify API returned HTTP ${response.status}.`);
  return payload.data;
}

async function getProducts() {
  const products = [];
  let after = null;
  do {
    const data = await graphql(`query Products($after: String) { products(first: 100, after: $after) { nodes { id legacyResourceId title descriptionHtml productType vendor tags onlineStoreUrl variants(first: 100) { nodes { id title price compareAtPrice sku inventoryQuantity } } media(first: 20) { nodes { ... on MediaImage { image { url altText } } } } } pageInfo { hasNextPage endCursor } } }`, { after });
    const page = data.products;
    for (const item of page.nodes) {
      products.push(normalizeShopifyProduct({
        id: item.legacyResourceId, title: item.title, body_html: item.descriptionHtml, product_type: item.productType,
        vendor: item.vendor, tags: item.tags.join(', '), online_store_url: item.onlineStoreUrl,
        variants: item.variants.nodes.map(v => ({ id: v.id, title: v.title, price: v.price, compare_at_price: v.compareAtPrice, sku: v.sku, inventory_quantity: v.inventoryQuantity })),
        images: item.media.nodes.map(m => m.image).filter(Boolean).map(image => ({ src: image.url, alt: image.altText }))
      }));
    }
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return products;
}

async function mutateProduct({ product_id, price, stock_quantity, title }) {
  const rawId = String(product_id || '').replace(/^gid:\/\/shopify\/Product\//, '');
  if (!rawId) throw new Error('Enter a Shopify product ID.');
  const productGid = `gid://shopify/Product/${rawId}`;
  const current = await graphql(`query ProductVariants($id: ID!) { product(id: $id) { id title variants(first: 100) { nodes { id inventoryItem { id tracked inventoryLevels(first: 10) { nodes { location { id } quantities(names: ["available"]) { quantity } } } } } } } }`, { id: productGid });
  if (!current.product) { const e = new Error(`Shopify product ${rawId} was not found.`); e.statusCode = 404; throw e; }
  const variantId = current.product.variants.nodes[0]?.id;
  if (price !== undefined && price !== '' && !variantId) throw new Error('This Shopify product has no variant whose price can be changed.');
  let updatedTitle = current.product.title;
  let updatedPrice;
  if (title || (price !== undefined && price !== '')) {
    const updated = await graphql(`mutation UpdateProduct($productId: ID!, $product: ProductUpdateInput!, $variants: [ProductVariantsBulkInput!]!) { productUpdate(product: $product) { product { id title } userErrors { field message } } productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id price } userErrors { field message } } }`, {
      productId: current.product.id,
      product: { id: current.product.id, ...(title ? { title } : {}) },
      variants: price !== undefined && price !== '' ? [{ id: variantId, price: String(price) }] : []
    });
    const errors = [...(updated.productUpdate?.userErrors || []), ...(updated.productVariantsBulkUpdate?.userErrors || [])];
    if (errors.length) throw new Error(errors.map(error => error.message).join('; '));
    updatedTitle = updated.productUpdate.product.title;
    updatedPrice = updated.productVariantsBulkUpdate.productVariants[0]?.price;
  }
  if (stock_quantity !== undefined && stock_quantity !== '') {
    const variant = current.product.variants.nodes[0];
    const level = variant?.inventoryItem?.inventoryLevels?.nodes?.[0];
    if (!variant?.inventoryItem?.tracked || !level?.location?.id) {
      throw new Error('The first Shopify variant must track inventory and be stocked at a location before its quantity can be changed.');
    }
    const quantity = Number(stock_quantity);
    if (!Number.isInteger(quantity) || quantity < 0) throw new Error('Stock quantity must be a non-negative whole number.');
    const inventoryResult = await graphql(`mutation SetStock($input: InventorySetQuantitiesInput!) { inventorySetQuantities(input: $input) { userErrors { field message } } }`, {
      input: { name: 'available', reason: 'correction', referenceDocumentUri: `https://catalog.local/products/${rawId}`, quantities: [{ inventoryItemId: variant.inventoryItem.id, locationId: level.location.id, quantity }] }
    });
    const inventoryErrors = inventoryResult.inventorySetQuantities.userErrors || [];
    if (inventoryErrors.length) throw new Error(inventoryErrors.map(error => error.message).join('; '));
  }
  return { id: rawId, title: updatedTitle, price: updatedPrice };
}

module.exports = { configuration, getProducts, mutateProduct };
