import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { readManualProducts, saveManualProduct, mergeManualProducts } from '../utils/manualProducts';
import { getShopifySnapshot } from '../utils/shopifySyncCache';

const CatalogContext = createContext();

export const CatalogProvider = ({ children }) => {
  const [config, setConfig] = useState({
    catalog_name: 'The Style Edit | Clothing, Shoes & Jewellery',
    whatsapp_number: '+919876543210',
    whatsapp_message_header: 'Hi, I am interested in inquiring about the following catalog products:',
    active_design: 'luxury',
    currency_symbol: '₹'
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(readManualProducts);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('featured');
  const [activeView, setActiveView] = useState('catalog'); // 'catalog' | 'admin' | 'wishlist'
  
  const [selectedProduct, setSelectedProduct] = useState(null); // Detail modal
  const [lightboxImage, setLightboxImage] = useState(null); // Lightbox zoom view

  const upsertProduct = useCallback((product) => {
    if (!product) return;
    saveManualProduct(product);
    setProducts(current => {
      const exists = current.some(item => String(item.id) === String(product.id));
      return exists
        ? current.map(item => String(item.id) === String(product.id) ? product : item)
        : [product, ...current];
    });
  }, []);

  // Fetch initial config & categories
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/config');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setCategories(data.categories || []);
        document.documentElement.setAttribute('data-theme', data.config.active_design || 'luxury');
      }
    } catch (err) {
      console.error('Failed to load catalog config:', err);
    }
  }, []);

  // Fetch products with current filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (inStockOnly) params.append('inStock', 'true');
      if (sortOrder !== 'featured') params.append('sort', sortOrder);
      params.append('limit', '100');
      const demoWooOverrides = sessionStorage.getItem('woo-demo-overrides');
      if (demoWooOverrides) params.append('demoWooOverrides', demoWooOverrides);

      const res = await fetch(`/api/v1/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const serverProducts = data.products || [];
        const manualProducts = mergeManualProducts(serverProducts);
        const liveShopifyProducts = serverProducts.filter(product => product.source_type === 'shopify');
        const snapshotShopifyProducts = getShopifySnapshot(liveShopifyProducts);
        const matchesFilters = product => {
          if (selectedCategory && product.category_id !== selectedCategory && product.category_slug !== selectedCategory) return false;
          if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();
            if (![product.title, product.sku, product.description, product.sub_category]
              .some(value => String(value || '').toLowerCase().includes(query))) return false;
          }
          if (inStockOnly && !product.in_stock) return false;
          return true;
        };
        const visibleManualProducts = manualProducts.filter(matchesFilters);
        const visibleShopifyProducts = snapshotShopifyProducts.filter(matchesFilters);
        const otherLiveProducts = serverProducts.filter(product => product.source_type !== 'manual' && product.source_type !== 'shopify');
        setProducts([...visibleManualProducts, ...visibleShopifyProducts, ...otherLiveProducts]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, inStockOnly, sortOrder]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Dynamically update design theme
  const switchTheme = (newTheme) => {
    setConfig(prev => ({ ...prev, active_design: newTheme }));
    document.documentElement.setAttribute('data-theme', newTheme);
    fetch('/api/v1/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active_design: newTheme })
    }).catch(err => console.error(err));
  };

  return (
    <CatalogContext.Provider value={{
      config,
      categories,
      products,
      loading,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      inStockOnly,
      setInStockOnly,
      sortOrder,
      setSortOrder,
      activeView,
      setActiveView,
      selectedProduct,
      setSelectedProduct,
      lightboxImage,
      setLightboxImage,
      upsertProduct,
      switchTheme,
      refreshCatalog: fetchProducts,
      refreshConfig: fetchConfig
    }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => useContext(CatalogContext);
