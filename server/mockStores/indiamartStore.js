// Simulated IndiaMART B2B API endpoint providing 25 products with MOQ and bulk pricing

let indiamartProductsStore = [
  {
    QUERY_ID: "IM-9001",
    ITEM_NAME: "Handcrafted Jute Braided Rug (Wholesale Lot)",
    COMPANY_NAME: "Rajdhani Export House",
    MIN_ORDER_QTY: "20 Pieces",
    PRICE_PER_UNIT: "3200",
    CURRENCY: "INR",
    CATEGORY_NAME: "Handwoven Dhurries",
    DESCRIPTION: "Natural un-bleached eco jute braided area rugs. Heavy grade export quality suitable for hospitality and commercial projects.",
    PRIMARY_IMAGE: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    GST_NUMBER: "07AAAAA0000A1Z5",
    CITY: "Bhadohi",
    STATE: "Uttar Pradesh"
  },
  {
    QUERY_ID: "IM-9002",
    ITEM_NAME: "Brass Antique Hanging Lantern (Bulk Pack)",
    COMPANY_NAME: "Heritage Brassware Traders",
    MIN_ORDER_QTY: "10 Pieces",
    PRICE_PER_UNIT: "4500",
    CURRENCY: "INR",
    CATEGORY_NAME: "Handcrafted Lighting",
    DESCRIPTION: "Perforated traditional Moradabadi brass lamp with intricate filigree cutwork.",
    PRIMARY_IMAGE: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    GST_NUMBER: "09BBBBA1111B2Z8",
    CITY: "Moradabad",
    STATE: "Uttar Pradesh"
  }
];

// Generate 23 additional items to reach 25 items
const b2bCategories = ["Silk & Wool Carpets", "Vintage Runners", "Handwoven Dhurries", "Artisan Furniture", "Handcrafted Lighting", "Home Accessories & Decor"];
const b2bCities = ["Bhadohi", "Jaipur", "Moradabad", "Srinagar", "Jodhpur", "Panipat"];

for (let i = 3; i <= 25; i++) {
  const cat = b2bCategories[i % b2bCategories.length];
  const city = b2bCities[i % b2bCities.length];
  const priceVal = 2800 + (i * 1100);

  indiamartProductsStore.push({
    QUERY_ID: `IM-90${String(i).padStart(2, '0')}`,
    ITEM_NAME: `IndiaMART B2B Wholesale ${cat.replace(/s$/, '')} Lot #${i}`,
    COMPANY_NAME: `Rajdhani Wholesale Looms ${city}`,
    MIN_ORDER_QTY: `${(i % 4 + 1) * 5} Pieces`,
    PRICE_PER_UNIT: String(priceVal),
    CURRENCY: "INR",
    CATEGORY_NAME: cat,
    DESCRIPTION: `Export quality bulk supply of ${cat.toLowerCase()}. Certified handloom craftsmanship directly from manufacturers in ${city}.`,
    PRIMARY_IMAGE: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
    GST_NUMBER: `07AAACR${1000 + i}A1Z${i % 9}`,
    CITY: city,
    STATE: "India"
  });
}

module.exports = {
  getProducts: () => indiamartProductsStore
};
