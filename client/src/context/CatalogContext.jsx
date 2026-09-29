import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CatalogContext = createContext();

export const CatalogProvider = ({ children }) => {
  const [config, setConfig] = useState({
    catalog_name: 'Rajdhani Fine Carpets & Handloom Collection',
    whatsapp_number: '+919876543210',
    whatsapp_message_header: 'Hi, I am interested in inquiring about the following catalog products:',
    active_design: 'luxury',
    currency_symbol: '₹'
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('featured');
  const [activeView, setActiveView] = useState('catalog'); // 'catalog' | 'admin' | 'wishlist'
  
  const [selectedProduct, setSelectedProduct] = useState(null); // Detail modal
  const [lightboxImage, setLightboxImage] = useState(null); // Lightbox zoom view

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

      const res = await fetch(`/api/v1/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
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
      switchTheme,
      refreshCatalog: fetchProducts,
      refreshConfig: fetchConfig
    }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => useContext(CatalogContext);
