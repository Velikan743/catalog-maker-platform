// Simulated WooCommerce REST API v3 endpoint providing 55 products

let wooCommerceProductsStore = [
  {
    id: 401,
    name: "Handcrafted Teak & Brass Accent Sideboard",
    slug: "handcrafted-teak-brass-sideboard",
    permalink: "https://woostore.example/product/handcrafted-teak-brass-sideboard",
    date_created: "2026-02-01T10:00:00",
    date_modified: "2026-09-22T15:30:00",
    type: "simple",
    status: "publish",
    description: "Solid plantation teak wood sideboard with hand-carved cane doors and brushed brass hardware. Features 3 spacious drawers and internal shelving.",
    short_description: "Solid teak sideboard with cane detail and brass hardware.",
    sku: "WOOC-FURN-001",
    price: "48500",
    regular_price: "56000",
    sale_price: "48500",
    on_sale: true,
    purchasable: true,
    stock_quantity: 4,
    stock_status: "instock",
    categories: [
      { id: 104, name: "Artisan Furniture", slug: "artisan-furniture" }
    ],
    images: [
      { id: 301, src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80" },
      { id: 302, src: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80" }
    ],
    attributes: [
      { name: "Material", options: ["Teak Wood", "Brass", "Rattan"] }
    ]
  },
  {
    id: 402,
    name: "Moroccan Hammered Brass Floor Lamp",
    slug: "moroccan-brass-floor-lamp",
    permalink: "https://woostore.example/product/moroccan-brass-floor-lamp",
    date_created: "2026-02-05T11:20:00",
    date_modified: "2026-09-24T09:10:00",
    type: "simple",
    status: "publish",
    description: "Intricately hand-punched brass floor lamp casting warm starry ambient shadows. Electroplated antique brass finish with solid marble base.",
    short_description: "Hand-punched brass floor lamp with marble base.",
    sku: "WOOC-LGHT-002",
    price: "24900",
    regular_price: "29900",
    sale_price: "24900",
    on_sale: true,
    purchasable: true,
    stock_quantity: 7,
    stock_status: "instock",
    categories: [
      { id: 105, name: "Handcrafted Lighting", slug: "handcrafted-lighting" }
    ],
    images: [
      { id: 303, src: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" }
    ],
    attributes: [
      { name: "Finish", options: ["Antique Brass", "Matte Black"] }
    ]
  },
  {
    id: 403,
    name: "Velvet Emerald Tufted Armchair",
    slug: "velvet-emerald-tufted-armchair",
    permalink: "https://woostore.example/product/velvet-emerald-tufted-armchair",
    date_created: "2026-02-10T14:00:00",
    date_modified: "2026-09-25T11:45:00",
    type: "simple",
    status: "publish",
    description: "Plush cotton-velvet lounge chair with deep button-tufting and tapered walnut legs. Ergonomic deep seating with high-density foam core.",
    short_description: "Emerald green velvet tufted lounge armchair.",
    sku: "WOOC-FURN-003",
    price: "36500",
    regular_price: "42000",
    sale_price: "36500",
    on_sale: true,
    purchasable: true,
    stock_quantity: 3,
    stock_status: "instock",
    categories: [
      { id: 104, name: "Artisan Furniture", slug: "artisan-furniture" }
    ],
    images: [
      { id: 304, src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80" }
    ],
    attributes: [
      { name: "Color", options: ["Emerald Green", "Royal Navy", "Mustard Yellow"] }
    ]
  },
  {
    id: 404,
    name: "Stoneware Ceramic Speckled Vase Set",
    slug: "stoneware-ceramic-speckled-vase-set",
    permalink: "https://woostore.example/product/stoneware-ceramic-speckled-vase-set",
    date_created: "2026-02-12T09:15:00",
    date_modified: "2026-09-26T16:00:00",
    type: "simple",
    status: "publish",
    description: "Set of 3 wheel-thrown matte stoneware ceramic vases with natural speckled glaze. Watertight design suitable for fresh or dried florals.",
    short_description: "Trio of hand-thrown matte ceramic vases.",
    sku: "WOOC-DCR-004",
    price: "6800",
    regular_price: "8500",
    sale_price: "6800",
    on_sale: true,
    purchasable: true,
    stock_quantity: 15,
    stock_status: "instock",
    categories: [
      { id: 106, name: "Home Accessories & Decor", slug: "home-decor" }
    ],
    images: [
      { id: 305, src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80" }
    ],
    attributes: [
      { name: "Set Count", options: ["3 Vases"] }
    ]
  },
  {
    id: 405,
    name: "Natural Braided Jute & Wool Area Rug",
    slug: "natural-braided-jute-wool-rug",
    permalink: "https://woostore.example/product/natural-braided-jute-wool-rug",
    date_created: "2026-02-15T16:30:00",
    date_modified: "2026-09-27T10:20:00",
    type: "simple",
    status: "publish",
    description: "Eco-friendly hand-braided organic jute blended with soft ivory wool threads. Reversible flat weave design resistant to wear.",
    short_description: "Hand-braided eco-friendly jute and wool rug.",
    sku: "WOOC-CARP-005",
    price: "19500",
    regular_price: "24000",
    sale_price: "19500",
    on_sale: true,
    purchasable: true,
    stock_quantity: 9,
    stock_status: "instock",
    categories: [
      { id: 103, name: "Handwoven Dhurries", slug: "handwoven-dhurries" }
    ],
    images: [
      { id: 306, src: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80" }
    ],
    attributes: [
      { name: "Dimensions", options: ["5ft x 8ft", "8ft x 10ft"] }
    ]
  }
];

// Generate 50 additional items to reach 55 items
const wooCategoriesList = [
  { id: 104, name: "Artisan Furniture", slug: "artisan-furniture" },
  { id: 105, name: "Handcrafted Lighting", slug: "handcrafted-lighting" },
  { id: 106, name: "Home Accessories & Decor", slug: "home-decor" },
  { id: 103, name: "Handwoven Dhurries", slug: "handwoven-dhurries" }
];

const wooMaterials = ["Solid Rosewood", "Hammered Copper", "Handloom Cotton", "Blown Glass", "Natural Rattan", "Carrara Marble", "Oatmeal Linen"];
const wooStyles = ["Nordic Minimalist", "Mid-Century Modern", "Bohemian Artisan", "Vintage Industrial", "Zen Japanese", "Contemporary Classic"];
const wooImgPool = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
];

for (let i = 6; i <= 55; i++) {
  const mat = wooMaterials[i % wooMaterials.length];
  const style = wooStyles[i % wooStyles.length];
  const catObj = wooCategoriesList[i % wooCategoriesList.length];
  const priceVal = 5500 + (i * 1250);

  wooCommerceProductsStore.push({
    id: 400 + i,
    name: `WooCommerce ${style} ${mat} ${catObj.name.replace(/s$/, '')} #${i}`,
    slug: `woocommerce-${style.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
    permalink: `https://woostore.example/product/woocommerce-item-${i}`,
    date_created: new Date(Date.now() - (i * 90000000)).toISOString(),
    date_modified: new Date(Date.now() - (i * 4000000)).toISOString(),
    type: "simple",
    status: "publish",
    description: `Premium hand-finished ${catObj.name.toLowerCase()} constructed from authentic ${mat.toLowerCase()}. ${style} styling tailored for modern interiors.`,
    short_description: `${style} ${mat} craft work.`,
    sku: `WOOC-ITM-${String(i).padStart(3, '0')}`,
    price: String(priceVal),
    regular_price: String(Math.round(priceVal * 1.2)),
    sale_price: String(priceVal),
    on_sale: true,
    purchasable: true,
    stock_quantity: (i % 6 === 0) ? 0 : (i % 4 + 3),
    stock_status: (i % 6 === 0) ? "outofstock" : "instock",
    categories: [catObj],
    images: [
      { id: 300 + i, src: wooImgPool[i % wooImgPool.length] }
    ],
    attributes: [
      { name: "Craftsmanship", options: [mat, style] }
    ]
  });
}

module.exports = {
  getProducts: () => wooCommerceProductsStore,
  mutateProduct: (id, updates) => {
    const p = wooCommerceProductsStore.find(item => item.id === Number(id));
    if (p) {
      if (updates.price) {
        p.price = String(updates.price);
        p.sale_price = String(updates.price);
      }
      if (updates.stock_quantity !== undefined) {
        p.stock_quantity = Number(updates.stock_quantity);
        p.stock_status = p.stock_quantity > 0 ? "instock" : "outofstock";
      }
      if (updates.name) p.name = updates.name;
      p.date_modified = new Date().toISOString();
      return p;
    }
    return null;
  }
};
