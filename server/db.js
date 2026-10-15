const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'database.json');

const initialProducts = [];

// Helper to ensure data directory exists
const ensureDataDir = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      // Ignore read-only environment errors on Vercel
    }
  }
};

// Initial default database structure
const defaultData = {
  settings: {
    whatsapp_number: '+919833113449',
    whatsapp_message_header: 'Hi, I am interested in inquiring about the following products:',
    active_design: 'luxury', // 'luxury' or 'glassmorphic'
    catalog_name: 'The Style Edit | Clothing, Shoes & Jewellery',
    currency_symbol: '₹',
    auto_sync_enabled: true,
    auto_sync_interval_mins: 15,
    last_sync_time: new Date().toISOString()
  },
  categories: [
    { id: 'cat-shirts', name: 'Shirts', slug: 'shirts', image: '', order_index: 1, is_visible: true },
    { id: 'cat-tshirts', name: 'T-Shirts', slug: 't-shirts', image: '', order_index: 2, is_visible: true },
    { id: 'cat-pants', name: 'Pants', slug: 'pants', image: '', order_index: 3, is_visible: true },
    { id: 'cat-jeans', name: 'Jeans', slug: 'jeans', image: '', order_index: 4, is_visible: true },
    { id: 'cat-shoes', name: 'Shoes', slug: 'shoes', image: '', order_index: 5, is_visible: true },
    { id: 'cat-jewellery', name: 'Jewellery', slug: 'jewellery', image: '', order_index: 6, is_visible: true },
    { id: 'cat-ties', name: 'Ties', slug: 'ties', image: '', order_index: 7, is_visible: true },
    { id: 'cat-jackets', name: 'Jackets', slug: 'jackets', image: '', order_index: 8, is_visible: true },
    { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', image: '', order_index: 9, is_visible: true }
  ],
  products: initialProducts,
  sync_logs: [],
  change_history: [],
  analytics: {
    views_count: 124,
    enquiries_count: 18,
    wishlist_add_count: 35,
    popular_products: {}
  }
};

class Database {
  constructor() {
    ensureDataDir();
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        const merged = { ...defaultData, ...parsed };
        if (!merged.settings.catalog_name || /carpet|handloom|rajdhani/i.test(merged.settings.catalog_name)) {
          merged.settings.catalog_name = defaultData.settings.catalog_name;
        }
        const savedCategories = Array.isArray(parsed.categories) ? parsed.categories.filter(category =>
          !['cat-carpets', 'cat-runners', 'cat-dhurries', 'cat-furniture', 'cat-lighting', 'cat-decor'].includes(category.id)
        ) : [];
        const categoriesById = new Map(defaultData.categories.map(category => [category.id, category]));
        savedCategories.forEach(category => {
          categoriesById.set(category.id, { ...categoriesById.get(category.id), ...category });
        });
        merged.categories = [...categoriesById.values()];
        // Never serve the old fabricated Shopify, WooCommerce, or IndiaMART fixtures.
        merged.products = (Array.isArray(parsed.products) ? parsed.products : []).filter(product => product.source_type === 'manual');
        return merged;
      }
    } catch (err) {
      console.error('Error loading DB file, using the default catalog settings:', err);
    }
    this.save(defaultData);
    return defaultData;
  }

  save(data = this.data) {
    try {
      ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      this.data = data;
    } catch (err) {
      // Catch read-only filesystem errors on serverless Vercel environment
      this.data = data;
    }
  }

  // --- Settings ---
  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // --- Categories ---
  getCategories() {
    return this.data.categories.sort((a, b) => a.order_index - b.order_index);
  }

  saveCategory(category) {
    const idx = this.data.categories.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      this.data.categories[idx] = { ...this.data.categories[idx], ...category };
    } else {
      this.data.categories.push({
        id: category.id || `cat-${Date.now()}`,
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        image: category.image || '',
        order_index: category.order_index || (this.data.categories.length + 1),
        is_visible: category.is_visible !== undefined ? category.is_visible : true
      });
    }
    this.save();
    return this.data.categories;
  }

  deleteCategory(id) {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // --- Products ---
  getProducts(filters = {}) {
    let list = [...(this.data.products || [])];

    if (filters.category) {
      list = list.filter(p => p.category_id === filters.category || p.category_slug === filters.category);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sub_category && p.sub_category.toLowerCase().includes(q))
      );
    }

    if (filters.inStockOnly) {
      list = list.filter(p => p.in_stock);
    }

    if (filters.sourceType) {
      list = list.filter(p => p.source_type === filters.sourceType);
    }

    if (filters.sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    return list;
  }

  getProductById(id) {
    const list = this.data.products || [];
    return list.find(p => String(p.id) === String(id));
  }

  getProductBySourceId(sourceType, sourceId) {
    const list = this.data.products || [];
    return list.find(p => p.source_type === sourceType && String(p.source_id) === String(sourceId));
  }

  saveProduct(product) {
    if (!this.data.products) this.data.products = [...initialProducts];
    const existingIdx = this.data.products.findIndex(p => String(p.id) === String(product.id));
    const now = new Date().toISOString();

    if (existingIdx >= 0) {
      const existing = this.data.products[existingIdx];
      this.recordChanges(existing, product, product.updated_by_source || 'admin');

      const updated = {
        ...existing,
        ...product,
        updated_at: now
      };
      this.data.products[existingIdx] = updated;
      this.save();
      return updated;
    } else {
      const newProd = {
        id: product.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        sku: product.sku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
        title: product.title || 'Untitled Product',
        description: product.description || '',
        price: Number(product.price) || 0,
        compare_at_price: Number(product.compare_at_price) || 0,
        category_id: product.category_id || 'cat-shirts',
        sub_category: product.sub_category || 'General',
        stock_status: product.stock_status || 'in_stock',
        in_stock: product.in_stock !== undefined ? Boolean(product.in_stock) : true,
        stock_quantity: Number(product.stock_quantity) || 10,
        images: Array.isArray(product.images) ? product.images : [],
        variants: product.variants || [],
        source_type: product.source_type || 'manual',
        source_id: product.source_id || null,
        source_url: product.source_url || '',
        created_at: now,
        updated_at: now
      };
      this.data.products.push(newProd);
      this.save();
      return newProd;
    }
  }

  deleteProduct(id) {
    if (!this.data.products) this.data.products = [...initialProducts];
    this.data.products = this.data.products.filter(p => String(p.id) !== String(id));
    this.save();
    return true;
  }

  // --- Change History ---
  recordChanges(oldProd, newProd, source) {
    const fieldsToTrack = ['price', 'stock_status', 'in_stock', 'title', 'description'];
    const now = new Date().toISOString();

    fieldsToTrack.forEach(field => {
      if (newProd[field] !== undefined && oldProd[field] !== newProd[field]) {
        this.data.change_history.unshift({
          id: `chg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product_id: oldProd.id,
          product_title: oldProd.title,
          field_changed: field,
          old_value: oldProd[field],
          new_value: newProd[field],
          source: source,
          changed_at: now
        });
      }
    });

    if (this.data.change_history.length > 200) {
      this.data.change_history = this.data.change_history.slice(0, 200);
    }
  }

  getChangeHistory(limit = 50) {
    return this.data.change_history.slice(0, limit);
  }

  // --- Sync Logs ---
  addSyncLog(logEntry) {
    const log = {
      id: `sync-${Date.now()}`,
      source_type: logEntry.source_type,
      started_at: logEntry.started_at,
      completed_at: new Date().toISOString(),
      status: logEntry.status || 'success',
      products_added: logEntry.products_added || 0,
      products_updated: logEntry.products_updated || 0,
      products_unchanged: logEntry.products_unchanged || 0,
      error_message: logEntry.error_message || null,
      details: logEntry.details || []
    };
    this.data.sync_logs.unshift(log);
    if (this.data.sync_logs.length > 100) {
      this.data.sync_logs = this.data.sync_logs.slice(0, 100);
    }
    this.data.settings.last_sync_time = log.completed_at;
    this.save();
    return log;
  }

  getSyncLogs(limit = 20) {
    return this.data.sync_logs.slice(0, limit);
  }

  // --- Analytics ---
  trackAnalytics(type, payload = {}) {
    if (type === 'view') {
      this.data.analytics.views_count = (this.data.analytics.views_count || 0) + 1;
      if (payload.product_id) {
        const pid = payload.product_id;
        this.data.analytics.popular_products[pid] = (this.data.analytics.popular_products[pid] || 0) + 1;
      }
    } else if (type === 'enquiry') {
      this.data.analytics.enquiries_count = (this.data.analytics.enquiries_count || 0) + 1;
    } else if (type === 'wishlist') {
      this.data.analytics.wishlist_add_count = (this.data.analytics.wishlist_add_count || 0) + 1;
    }
    this.save();
  }

  getAnalytics() {
    return this.data.analytics;
  }
}

module.exports = new Database();
