import React, { useState, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { readManualProducts, deleteManualProduct } from '../utils/manualProducts';
import { getShopifySnapshot, readShopifySyncHistory, recordShopifySync } from '../utils/shopifySyncCache';
import {
  Shield,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sliders,
  ShoppingBag,
  Palette,
  History,
  Zap,
} from 'lucide-react';

const MANUAL_PRODUCT_CATEGORIES = [
  { id: 'cat-shirts', name: 'Shirts' },
  { id: 'cat-tshirts', name: 'T-Shirts' },
  { id: 'cat-pants', name: 'Pants' },
  { id: 'cat-jeans', name: 'Jeans' },
  { id: 'cat-shoes', name: 'Shoes' },
  { id: 'cat-jewellery', name: 'Jewellery' },
  { id: 'cat-ties', name: 'Ties' },
  { id: 'cat-jackets', name: 'Jackets' },
  { id: 'cat-accessories', name: 'Clothing Accessories' }
];

export default function AdminPage() {
  const { config, refreshConfig, refreshCatalog, switchTheme, upsertProduct } = useCatalog();

  const [stats, setStats] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [changeHistory, setChangeHistory] = useState([]);
  const [categories, setCategories] = useState(MANUAL_PRODUCT_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [connectionErrors, setConnectionErrors] = useState([]);

  // Settings form
  const [waNumber, setWaNumber] = useState('');
  const [catalogTitle, setCatalogTitle] = useState('');

  // Live Shopify / session demo product editing
  const [mutateSource, setMutateSource] = useState('shopify');
  const [mutateProdId, setMutateProdId] = useState('');
  const [mutatePrice, setMutatePrice] = useState('');
  const [mutateStock, setMutateStock] = useState('');
  const [adminToken, setAdminToken] = useState('');

  // New Product Modal Form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    price: '',
    category_id: '',
    description: '',
    in_stock: true,
    stock_quantity: 10,
    image_url: ''
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, catRes, prodRes, histRes] = await Promise.all([
        fetch('/api/v1/admin/dashboard').then(r => r.json()),
        fetch('/api/v1/admin/categories').then(r => r.json()),
        fetch(`/api/v1/products?limit=200${sessionStorage.getItem('woo-demo-overrides') ? `&demoWooOverrides=${encodeURIComponent(sessionStorage.getItem('woo-demo-overrides'))}` : ''}`).then(r => r.json()),
        fetch('/api/v1/admin/change-history').then(r => r.json())
      ]);

      if (dashRes.success) {
        setStats(dashRes.stats);
        const localSyncLogs = readShopifySyncHistory();
        const serverSyncLogs = dashRes.recent_sync_logs || [];
        const localIds = new Set(localSyncLogs.map(log => log.id));
        setSyncLogs([...localSyncLogs, ...serverSyncLogs.filter(log => !localIds.has(log.id))].slice(0, 100));
      }
      if (catRes.success) {
        const categoriesById = new Map(MANUAL_PRODUCT_CATEGORIES.map(category => [category.id, category]));
        (catRes.categories || []).forEach(category => categoriesById.set(category.id, category));
        setCategories([...categoriesById.values()]);
      }
      if (prodRes.success) {
        const serverProducts = prodRes.products || [];
        const liveShopifyProducts = serverProducts.filter(product => product.source_type === 'shopify');
        const snapshotShopifyProducts = getShopifySnapshot(liveShopifyProducts);
        const serverManualProducts = serverProducts.filter(product => product.source_type === 'manual');
        const manualProductsById = new Map(serverManualProducts.map(product => [String(product.id), product]));
        readManualProducts().forEach(product => manualProductsById.set(String(product.id), product));
        const liveProducts = [
          ...manualProductsById.values(),
          ...snapshotShopifyProducts,
          ...serverProducts.filter(product => product.source_type !== 'manual' && product.source_type !== 'shopify')
        ];
        setConnectionErrors(prodRes.source_errors || []);
        setProducts(liveProducts);
        setMutateProdId(current => current || liveProducts.find(product => product.source_type === 'shopify')?.source_id || '');
        setStats(current => current ? {
          ...current,
          total_products: liveProducts.length,
          shopify_products: liveProducts.filter(product => product.source_type === 'shopify').length,
          woocommerce_products: liveProducts.filter(product => product.source_type === 'woocommerce').length,
          manual_products: liveProducts.filter(product => product.source_type === 'manual').length
        } : current);
      }
      if (histRes.success) setChangeHistory(histRes.change_history || []);

      const settings = config;
      setWaNumber(settings.whatsapp_number || '');
      setCatalogTitle(settings.catalog_name || '');
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Sync Action Handlers
  const handleRunSync = async (source = 'all') => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/v1/admin/sync/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          demoWooOverrides: JSON.parse(sessionStorage.getItem('woo-demo-overrides') || '{}')
        })
      });
      const data = await res.json();
      if (data.success) {
        let displayedLog = data.log;
        if (source === 'shopify' || source === 'all') {
          const productsResponse = await fetch('/api/v1/products?limit=200');
          const productsData = await productsResponse.json();
          if (!productsResponse.ok || !productsData.success) throw new Error(productsData.message || 'Could not reload Shopify products after synchronization.');
          const freshShopifyProducts = (productsData.products || []).filter(product => product.source_type === 'shopify');
          displayedLog = recordShopifySync(freshShopifyProducts, source);
        }
        setSyncMessage({ type: 'success', text: `Sync Completed! Added: ${displayedLog.products_added}, Updated: ${displayedLog.products_updated}, Unchanged: ${displayedLog.products_unchanged}` });
        if (displayedLog) setSyncLogs(current => [displayedLog, ...current.filter(log => log.id !== displayedLog.id)].slice(0, 100));
        loadAdminData();
        refreshCatalog();
      } else {
        setSyncMessage({ type: 'error', text: data.message || 'Sync Failed' });
      }
    } catch (err) {
      setSyncMessage({ type: 'error', text: 'Network Error executing sync' });
    } finally {
      setSyncing(false);
    }
  };

  const handleImportShopify = () => handleRunSync('shopify');
  const handleImportWooCommerce = () => handleRunSync('woocommerce');
  // Apply a requested change directly to the connected source store.
  const handleLiveSourceChange = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const mutation = {
        source_type: mutateSource,
        product_id: mutateProdId,
        price: mutatePrice,
          stock_quantity: mutateStock === '' ? undefined : mutateStock,
      };
      const res = await fetch('/api/v1/admin/mutate-source-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(mutation)
      });
      const data = await res.json();
      if (data.success) {
        let demoWooOverrides = {};
        if (mutateSource === 'woocommerce') {
          try { demoWooOverrides = JSON.parse(sessionStorage.getItem('woo-demo-overrides') || '{}'); } catch { demoWooOverrides = {}; }
          demoWooOverrides[String(mutateProdId)] = data.external_record;
          sessionStorage.setItem('woo-demo-overrides', JSON.stringify(demoWooOverrides));
        }
        const syncRes = await fetch('/api/v1/admin/sync/run', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: mutateSource, demoWooOverrides })
        });
        const syncData = await syncRes.json();
        if (!syncRes.ok || !syncData.success) throw new Error(syncData.message || 'Product was updated, but catalog refresh failed.');
        if (mutateSource === 'shopify') {
          const productsResponse = await fetch('/api/v1/products?limit=200');
          const productsData = await productsResponse.json();
          if (!productsResponse.ok || !productsData.success) throw new Error(productsData.message || 'Product changed, but the catalog snapshot could not be refreshed.');
          const log = recordShopifySync((productsData.products || []).filter(product => product.source_type === 'shopify'), 'shopify');
          setSyncLogs(current => [log, ...current.filter(item => item.id !== log.id)].slice(0, 100));
        }
        setSyncMessage({ type: 'success', text: `${mutateSource === 'shopify' ? 'Shopify product updated live' : 'WooCommerce demo product updated'}; catalog synchronized.` });
        loadAdminData();
        refreshCatalog();
      } else {
        setSyncMessage({ type: 'error', text: data.message || 'Live store update failed.' });
      }
    } catch (err) {
      setSyncMessage({ type: 'error', text: err.message || 'Live store update failed.' });
    } finally {
      setSyncing(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_number: waNumber,
          catalog_name: catalogTitle
        })
      });
      const data = await res.json();
      if (data.success) {
        refreshConfig();
        alert('Settings saved successfully!');
      }
    } catch (err) {
      alert('Error saving settings');
    }
  };

  // Product CRUD
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id: editingProduct ? editingProduct.id : undefined,
        images: [formData.image_url]
      };
      const res = await fetch('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`API returned HTTP ${res.status} with a non-JSON response.`);
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || `API returned HTTP ${res.status}.`);
      }

      setShowProductForm(false);
      setEditingProduct(null);
      upsertProduct(data.product);
      setProducts(current => {
        const exists = current.some(product => String(product.id) === String(data.product.id));
        return exists
          ? current.map(product => String(product.id) === String(data.product.id) ? data.product : product)
          : [data.product, ...current];
      });
      if (!editingProduct) {
        setStats(current => current && ({
          ...current,
          total_products: current.total_products + 1,
          manual_products: current.manual_products + 1
        }));
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      alert(`Failed to save product: ${err.message || 'Network error.'}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from central catalog?')) return;
    try {
      await fetch(`/api/v1/admin/products/${id}`, { method: 'DELETE' });
      deleteManualProduct(id);
      setProducts(current => current.filter(product => String(product.id) !== String(id)));
      loadAdminData();
      refreshCatalog();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleToggleStock = async (product) => {
    try {
      const nextInStock = !product.in_stock;
      if (product.source_type === 'shopify' || product.source_type === 'woocommerce') {
        const response = await fetch('/api/v1/admin/mutate-source-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({
            source_type: product.source_type,
            product_id: product.source_id,
            stock_quantity: nextInStock ? Math.max(Number(product.stock_quantity) || 0, 1) : 0
          })
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Store stock update failed.');
        let demoWooOverrides = {};
        try { demoWooOverrides = JSON.parse(sessionStorage.getItem('woo-demo-overrides') || '{}'); } catch { demoWooOverrides = {}; }
        if (product.source_type === 'woocommerce') {
          demoWooOverrides[String(product.source_id)] = result.external_record;
          sessionStorage.setItem('woo-demo-overrides', JSON.stringify(demoWooOverrides));
        }
        const syncResponse = await fetch('/api/v1/admin/sync/run', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: product.source_type, demoWooOverrides })
        });
        const syncResult = await syncResponse.json();
        if (!syncResponse.ok || !syncResult.success) throw new Error(syncResult.message || 'Product stock changed, but the catalog could not be refreshed.');
        await loadAdminData();
        refreshCatalog();
        return;
      }
      const payload = {
        ...product,
        in_stock: nextInStock,
        stock_status: nextInStock ? 'in_stock' : 'out_of_stock',
        stock_quantity: nextInStock
          ? Math.max(Number(product.stock_quantity) || 0, 1)
          : 0
      };
      const res = await fetch('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `API returned HTTP ${res.status}.`);
      }

      upsertProduct(data.product);
      setProducts(current => current.map(item =>
        String(item.id) === String(data.product.id) ? data.product : item
      ));
      setStats(current => current && ({
        ...current,
        out_of_stock_products: Math.max(0, current.out_of_stock_products + (nextInStock ? -1 : 1))
      }));
    } catch (err) {
      alert(`Toggle stock failed: ${err.message || 'Network error.'}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-[var(--accent-gold)] font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
          <span>Fashion Boutique Management</span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-[var(--text-primary)] gold-text">
            Platform Administration
          </h1>
        </div>

        {/* Quick Theme Switcher in Admin */}
        <div className="flex items-center gap-3 bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)]">
          <Palette className="w-4 h-4 text-[var(--accent-gold)]" />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Active Design:</span>
          <button
            onClick={() => switchTheme('luxury')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              config.active_design === 'luxury' ? 'bg-[var(--accent-gold)] text-slate-950 shadow' : 'text-[var(--text-muted)]'
            }`}
          >
            Atelier Noir
          </button>
          <button
            onClick={() => switchTheme('glassmorphic')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              config.active_design === 'glassmorphic' ? 'bg-[var(--accent-gold-dark)] text-white shadow' : 'text-[var(--text-muted)]'
            }`}
          >
            Modern Ivory
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 border-b border-[var(--border-color)] mb-8 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'overview' ? 'bg-[var(--accent-gold)] text-slate-950 shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'sync' ? 'bg-[var(--accent-gold)] text-slate-950 shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Import & Sync Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'products' ? 'bg-[var(--accent-gold)] text-slate-950 shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Product Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-[var(--accent-gold)] text-slate-950 shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>WhatsApp & Settings</span>
        </button>
      </div>

      {/* Sync Status Alert Notification */}
      {syncMessage && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm ${
          syncMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {syncMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{syncMessage.text}</span>
        </div>
      )}
      {connectionErrors.map(error => (
        <div key={error} className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs">{error}</div>
      ))}

      {/* --- TAB 1: OVERVIEW DASHBOARD --- */}
      {activeTab === 'overview' && stats && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Total Catalog Items</div>
              <div className="text-3xl font-extrabold gold-text mt-1">{stats.total_products}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Shopify: {stats.shopify_products} · WooCommerce: {stats.woocommerce_products}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Active Categories</div>
              <div className="text-3xl font-extrabold text-[var(--accent-gold)] mt-1">{stats.total_categories}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Visible in frontend navigation</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Total Catalog Views</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.total_views}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Tracked frontend views</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase">WhatsApp Enquiries</div>
              <div className="text-3xl font-extrabold text-amber-400 mt-1">{stats.total_enquiries}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Generated customer messages</div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">Live Store Connections</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Shopify changes appear in the catalog after synchronization. WooCommerce is a mock connection with no products.</p>
              <p className="text-xs mt-2 flex flex-wrap gap-4">
                <span className={stats.connections?.shopify?.connected ? 'text-emerald-400' : 'text-amber-400'}>Shopify: {stats.connections?.shopify?.connected ? 'Connected' : 'Needs credentials'}</span>
                <span className="text-amber-400">WooCommerce: Demo only</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleImportShopify}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
              >
                Sync Shopify Products
              </button>
              <button
                onClick={handleImportWooCommerce}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--border-focus)]/30 font-bold text-xs hover:bg-[var(--accent-gold-dark)] hover:text-white transition-all disabled:opacity-50"
              >
                Sync WooCommerce Demo
              </button>
              <button
                onClick={() => handleRunSync('all')}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl bg-[var(--accent-gold)] text-slate-950 font-bold text-xs shadow hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>Run Full Sync</span>
              </button>
            </div>
          </div>

          {/* Product Change History Audit Log */}
          <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)]">
            <h3 className="font-serif font-bold text-base text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-[var(--accent-gold)]" />
              <span>Recent Product Change Audit Log</span>
            </h3>

            {changeHistory.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] py-4">No price or stock changes recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[var(--text-muted)] uppercase border-b border-[var(--border-color)]">
                    <tr>
                      <th className="py-2 px-3">Timestamp</th>
                      <th className="py-2 px-3">Product Title</th>
                      <th className="py-2 px-3">Field</th>
                      <th className="py-2 px-3">Old Value</th>
                      <th className="py-2 px-3">New Value</th>
                      <th className="py-2 px-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/50">
                    {changeHistory.slice(0, 10).map(chg => (
                      <tr key={chg.id}>
                        <td className="py-2 px-3 text-[var(--text-muted)]">{new Date(chg.changed_at).toLocaleString()}</td>
                        <td className="py-2 px-3 font-semibold text-[var(--text-primary)]">{chg.product_title}</td>
                        <td className="py-2 px-3 uppercase text-[var(--accent-gold)] font-mono">{chg.field_changed}</td>
                        <td className="py-2 px-3 text-rose-400">{String(chg.old_value)}</td>
                        <td className="py-2 px-3 text-emerald-400">{String(chg.new_value)}</td>
                        <td className="py-2 px-3 badge badge-source">{chg.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: IMPORT & SYNC ENGINE --- */}
      {activeTab === 'sync' && (
        <div className="flex flex-col gap-8">

          {/* Live store product update */}
          <div className="glass-card p-6 rounded-2xl border-2 border-[var(--border-focus)]/30 bg-[var(--accent-gold)]/5">
            <div className="flex items-center gap-2 text-[var(--accent-gold)] font-bold text-sm mb-2">
              <Zap className="w-5 h-5" />
              <span>Update a Store Product</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Shopify edits update your live store. WooCommerce is a mock connection and has no catalog products configured.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end">
              <div>
                <label className="text-xs text-[var(--text-muted)] font-semibold block mb-1">Target E-Commerce Store</label>
                <select
                  value={mutateSource}
                  onChange={(e) => {
                    setMutateSource(e.target.value);
                    setMutateProdId(products.find(product => product.source_type === e.target.value)?.source_id || '');
                  }}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 rounded-xl text-xs text-[var(--text-primary)]"
                >
                  <option value="shopify">Shopify</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] font-semibold block mb-1">External Product ID</label>
                <input
                  type="text"
                  value={mutateProdId}
                  onChange={(e) => setMutateProdId(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 rounded-xl text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] font-semibold block mb-1">New Price (optional)</label>
                <input
                  type="number"
                  value={mutatePrice}
                  onChange={(e) => setMutatePrice(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 rounded-xl text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] font-semibold block mb-1">New Stock (optional)</label>
                <input type="number" min="0" step="1" value={mutateStock} onChange={(e) => setMutateStock(e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 rounded-xl text-xs text-[var(--text-primary)]" />
              </div>

              {mutateSource === 'shopify' && <div>
                <label className="text-xs text-[var(--text-muted)] font-semibold block mb-1">Admin API Token</label>
                <input
                  type="password"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 rounded-xl text-xs text-[var(--text-primary)]"
                />
              </div>}

              <button
                onClick={handleLiveSourceChange}
                disabled={syncing || !mutateProdId || (!mutatePrice && !mutateStock) || (mutateSource === 'shopify' && !adminToken)}
                className="py-2.5 px-4 rounded-xl bg-[var(--accent-gold-dark)] hover:opacity-90 text-white font-bold text-xs transition-all shadow"
              >
                Update Product &amp; Sync
              </button>
            </div>
          </div>

          {/* Sync History Logs */}
          <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">Synchronization History Logs</h3>
              <button
                onClick={() => handleRunSync('all')}
                disabled={syncing}
                className="px-4 py-2 rounded-xl bg-[var(--accent-gold)] text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>Synchronize Stores Now</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[var(--text-muted)] uppercase border-b border-[var(--border-color)]">
                  <tr>
                    <th className="py-2.5 px-3">Sync ID</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Added</th>
                    <th className="py-2.5 px-3">Updated</th>
                    <th className="py-2.5 px-3">Unchanged</th>
                    <th className="py-2.5 px-3">Change Details</th>
                    <th className="py-2.5 px-3">Completed Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/50">
                  {syncLogs.map(log => (
                    <tr key={log.id}>
                      <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">{log.id}</td>
                      <td className="py-2.5 px-3 uppercase font-bold text-[var(--accent-gold)]">{log.source_type}</td>
                      <td className="py-2.5 px-3">
                        <span className={`badge ${log.status === 'success' ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">+{log.products_added}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">{log.products_updated}</td>
                      <td className="py-2.5 px-3 text-[var(--text-muted)]">{log.products_unchanged}</td>
                      <td className="py-2.5 px-3 text-[var(--text-secondary)] max-w-md">
                        {(log.details || []).filter(detail => detail.action === 'updated').map(detail => {
                          const changes = Object.entries(detail.changes || {})
                            .filter(([, change]) => change && typeof change === 'object')
                            .map(([field, change]) => `${field}: ${change.old ?? '—'} → ${change.new ?? '—'}`)
                            .join(', ');
                          return `${detail.title}: ${changes}`;
                        }).join(' · ') || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-secondary)]">{new Date(log.completed_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 3: PRODUCT MANAGER --- */}
      {activeTab === 'products' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">Catalog Product Inventory</h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  title: '',
                  sku: `MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
                  price: '25000',
                  category_id: '',
                  description: 'Clothing, footwear, or jewellery product.',
                  in_stock: true,
                  stock_quantity: 10,
                  image_url: ''
                });
                setShowProductForm(true);
              }}
              className="px-4 py-2 rounded-xl bg-[var(--accent-gold)] text-slate-950 font-bold text-xs flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Manual Product</span>
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="modal-overlay">
              <div className="w-full max-w-lg bg-[var(--bg-modal)] p-6 rounded-2xl border border-[var(--border-color)]">
                <h4 className="font-serif font-bold text-lg text-[var(--text-primary)] mb-4">
                  {editingProduct ? 'Edit Product' : 'Create Manual Product'}
                </h4>
                <form onSubmit={handleSaveProduct} className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="text-[var(--text-muted)] font-semibold block mb-1">Product Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[var(--text-muted)] font-semibold block mb-1">SKU</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        required
                        className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-[var(--text-muted)] font-semibold block mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[var(--text-muted)] font-semibold block mb-1">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      required
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[var(--text-muted)] font-semibold block mb-1">Image URL</label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-[var(--text-muted)] font-semibold block mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[var(--accent-gold)] text-slate-950 font-bold"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="glass-card p-4 rounded-2xl border border-[var(--border-color)] overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[var(--text-muted)] uppercase border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3">SKU</th>
                  <th className="py-2 px-3">Source</th>
                  <th className="py-2 px-3">Price</th>
                  <th className="py-2 px-3">Stock Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/50">
                {products.map(prod => (
                  <tr key={prod.id}>
                    <td className="py-2.5 px-3 flex items-center gap-3 font-semibold text-[var(--text-primary)]">
                      <img src={(prod.images && prod.images[0]) || ''} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      <span className="line-clamp-1 max-w-xs">{prod.title}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">{prod.sku}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-[var(--accent-gold)]">{prod.source_type}</td>
                    <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">₹{Number(prod.price).toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleToggleStock(prod)}
                        className={`badge cursor-pointer ${prod.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'}`}
                      >
                        {prod.in_stock ? 'In Stock (Toggle)' : 'Out of Stock (Toggle)'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: WHATSAPP & SETTINGS --- */}
      {activeTab === 'settings' && (
        <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)] max-w-4xl">
          <h3 className="font-serif font-bold text-lg text-[var(--text-primary)] mb-4">Catalog Configuration</h3>
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="text-[var(--text-muted)] font-semibold block mb-1">Catalog Name</label>
              <input
                type="text"
                value={catalogTitle}
                onChange={(e) => setCatalogTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="text-[var(--text-muted)] font-semibold block mb-1">WhatsApp Business Phone Number (with Country Code)</label>
              <input
                type="text"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Example: +919876543210</span>
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-[var(--accent-gold)] text-slate-950 font-bold self-start mt-2 shadow"
            >
              Save Configuration
            </button>
          </form>
          <div className="mt-8 border-t border-[var(--border-color)] pt-6">
            <h4 className="font-serif font-bold text-base text-[var(--text-primary)]">Connect your stores</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-2">Add the Shopify server-side environment variables in Vercel Project Settings → Environment Variables, then redeploy. For local development, put them in the root <code>.env</code> file. Keep API secrets private and never add them to client-side Vite variables. WooCommerce is a demo source and needs no credentials.</p>
            <div className="grid md:grid-cols-2 gap-4 mt-4 text-xs">
              <div className="rounded-xl border border-[var(--border-color)] p-4">
                <div className="font-bold text-[var(--text-primary)]">Shopify {stats?.connections?.shopify?.connected ? '· Connected' : '· Not connected'}</div>
                <code className="block mt-2 text-[var(--text-secondary)]">SHOPIFY_STORE_DOMAIN</code>
                <code className="block mt-1 text-[var(--text-secondary)]">SHOPIFY_ADMIN_ACCESS_TOKEN</code>
                <code className="block mt-1 text-[var(--text-secondary)]">SHOPIFY_API_VERSION (optional)</code>
              </div>
              <div className="rounded-xl border border-[var(--border-color)] p-4">
                <div className="font-bold text-[var(--text-primary)]">WooCommerce · Demo catalog</div>
                <p className="mt-2 text-[var(--text-secondary)]">Three sample fashion products. Price and stock edits are simulated in this browser session.</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--text-secondary)]">Shopify price and inventory edits require <code>ADMIN_API_TOKEN</code>. Enter it in the mutation panel; it stays in this browser session only.</p>
          </div>
        </div>
      )}

    </div>
  );
}
