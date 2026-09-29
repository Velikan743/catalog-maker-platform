// Simulated Shopify REST API endpoint providing 55 products

let shopifyProductsStore = [
  {
    id: 7101,
    title: "Rajdhani Kashmiri Pure Silk Hand-Knotted Carpet",
    body_html: "<p>Masterpiece 100% mulberry silk carpet woven by royal artisans in Srinagar. Intricate Persian floral motif with 400 knots per square inch. Radiant luster that shifts color under lighting.</p>",
    vendor: "Rajdhani Silk Weavers",
    product_type: "Silk & Wool Carpets",
    created_at: "2026-01-15T08:30:00Z",
    updated_at: "2026-09-20T10:15:00Z",
    published_at: "2026-01-15T08:30:00Z",
    variants: [
      { id: 9101, title: "6ft x 9ft", price: "85000.00", compare_at_price: "105000.00", sku: "SHPF-SK-001", inventory_quantity: 4 }
    ],
    images: [
      { id: 801, src: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80" },
      { id: 802, src: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=800&q=80" }
    ],
    tags: "silk, kashmiri, handmade, luxury"
  },
  {
    id: 7102,
    title: "Royal Isfahan Blue & Gold Oriental Rug",
    body_html: "<p>Classic Isfahan medallion pattern in royal navy blue and burnished gold. High-density wool pile with silk highlight contours.</p>",
    vendor: "Heritage Persian Looms",
    product_type: "Silk & Wool Carpets",
    created_at: "2026-01-18T09:10:00Z",
    updated_at: "2026-09-22T14:20:00Z",
    published_at: "2026-01-18T09:10:00Z",
    variants: [
      { id: 9102, title: "8ft x 10ft", price: "64500.00", compare_at_price: "78000.00", sku: "SHPF-SK-002", inventory_quantity: 6 }
    ],
    images: [
      { id: 803, src: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80" },
      { id: 804, src: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80" }
    ],
    tags: "persian, isfahan, blue, rug"
  },
  {
    id: 7103,
    title: "Bukhara Crimson Red Geometric Tribal Rug",
    body_html: "<p>Traditional Elephant foot medallion Bukhara pattern in rich crimson red. Pure New Zealand wool with hand-finished fringes.</p>",
    vendor: "Rajdhani Carpet Studio",
    product_type: "Silk & Wool Carpets",
    created_at: "2026-01-20T11:00:00Z",
    updated_at: "2026-09-25T16:00:00Z",
    published_at: "2026-01-20T11:00:00Z",
    variants: [
      { id: 9103, title: "5ft x 7ft", price: "42000.00", compare_at_price: "49900.00", sku: "SHPF-SK-003", inventory_quantity: 8 }
    ],
    images: [
      { id: 805, src: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=800&q=80" }
    ],
    tags: "bukhara, red, wool, tribal"
  },
  {
    id: 7104,
    title: "Jaipur Antique Vintage Distressed Runner",
    body_html: "<p>Distressed washed vintage runner rug perfect for hallways and entryways. Soft stone-washed wool blend with earthy terracotta tones.</p>",
    vendor: "Jaipur Weavers",
    product_type: "Vintage Runners",
    created_at: "2026-01-22T10:00:00Z",
    updated_at: "2026-09-24T11:30:00Z",
    published_at: "2026-01-22T10:00:00Z",
    variants: [
      { id: 9104, title: "2.5ft x 10ft", price: "28500.00", compare_at_price: "34000.00", sku: "SHPF-SK-004", inventory_quantity: 5 }
    ],
    images: [
      { id: 806, src: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=800&q=80" }
    ],
    tags: "runner, vintage, terracotta, corridor"
  },
  {
    id: 7105,
    title: "Minimalist Scandinavian Flatweave Wool Dhurrie",
    body_html: "<p>Modern Scandinavian inspired geometric Dhurrie. 100% organic un-dyed wool flatweave with tassels.</p>",
    vendor: "Nordic Looms",
    product_type: "Handwoven Dhurries",
    created_at: "2026-01-25T14:20:00Z",
    updated_at: "2026-09-26T09:40:00Z",
    published_at: "2026-01-25T14:20:00Z",
    variants: [
      { id: 9105, title: "6ft x 9ft", price: "18900.00", compare_at_price: "22500.00", sku: "SHPF-SK-005", inventory_quantity: 12 }
    ],
    images: [
      { id: 807, src: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80" }
    ],
    tags: "dhurrie, flatweave, scandi, minimalist"
  }
];

// Generate 50 additional items systematically to reach 55 items
const categoriesList = ["Silk & Wool Carpets", "Vintage Runners", "Handwoven Dhurries", "Home Accessories & Decor"];
const colorsList = ["Emerald Green", "Royal Sapphire", "Burgundy Rose", "Saffron Gold", "Ivory Pearl", "Slate Grey", "Midnight Black", "Terracotta Clay"];
const adjectivesList = ["Imperial", "Artisan", "Hand-Embroidered", "Heritage", "Opulent", "Contemporary", "Boho Luxe", "Geometric"];
const imgPool = [
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
];

for (let i = 6; i <= 55; i++) {
  const color = colorsList[i % colorsList.length];
  const adj = adjectivesList[i % adjectivesList.length];
  const cat = categoriesList[i % categoriesList.length];
  const basePrice = 12000 + (i * 1450);

  shopifyProductsStore.push({
    id: 7100 + i,
    title: `Shopify ${adj} ${color} ${cat.replace(/s$/, '')} #${i}`,
    body_html: `<p>Premium ${color.toLowerCase()} ${cat.toLowerCase()} featuring ${adj.toLowerCase()} weave design. Built with durable high-grade fibers for residential and hotel projects.</p>`,
    vendor: "Rajdhani Global Looms",
    product_type: cat,
    created_at: new Date(Date.now() - (i * 86400000)).toISOString(),
    updated_at: new Date(Date.now() - (i * 3600000)).toISOString(),
    published_at: new Date(Date.now() - (i * 86400000)).toISOString(),
    variants: [
      {
        id: 9100 + i,
        title: "Standard",
        price: basePrice.toFixed(2),
        compare_at_price: (basePrice * 1.25).toFixed(2),
        sku: `SHPF-SK-${String(i).padStart(3, '0')}`,
        inventory_quantity: (i % 7 === 0) ? 0 : (i % 3 + 2)
      }
    ],
    images: [
      { id: 800 + i, src: imgPool[i % imgPool.length] }
    ],
    tags: `shopify, ${color.toLowerCase()}, ${cat.toLowerCase()}`
  });
}

module.exports = {
  getProducts: () => shopifyProductsStore,
  mutateProduct: (id, updates) => {
    const p = shopifyProductsStore.find(item => item.id === Number(id));
    if (p) {
      if (updates.price && p.variants[0]) {
        p.variants[0].price = String(updates.price);
      }
      if (updates.inventory_quantity !== undefined && p.variants[0]) {
        p.variants[0].inventory_quantity = Number(updates.inventory_quantity);
      }
      if (updates.title) p.title = updates.title;
      p.updated_at = new Date().toISOString();
      return p;
    }
    return null;
  }
};
