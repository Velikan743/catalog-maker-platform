export function getStockLabel(product) {
  if (!product?.in_stock) return 'Out of Stock';
  const quantity = product.stock_quantity;
  if (quantity === null || quantity === undefined || quantity === '') return 'In Stock';
  const numericQuantity = Number(quantity);
  return Number.isFinite(numericQuantity) && numericQuantity >= 0
    ? `In Stock · ${numericQuantity} left`
    : 'In Stock';
}
