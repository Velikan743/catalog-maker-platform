import React, { useState, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
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
  Building2
} from 'lucide-react';

export default function AdminPage() {
  const { config, refreshConfig, refreshCatalog, switchTheme } = useCatalog();

  const [stats, setStats] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [changeHistory, setChangeHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Settings form
  const [waNumber, setWaNumber] = useState('');
  const [catalogTitle, setCatalogTitle] = useState('');

  // Source Mutation Testing Form
  const [mutateSource, setMutateSource] = useState('shopify');
  const [mutateProdId, setMutateProdId] = useState('7101');
  const [mutatePrice, setMutatePrice] = useState('79900');
  const [mutateStock, setMutateStock] = useState('15');

  // New Product Modal Form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    price: '',
    category_id: 'cat-carpets',
    description: '',
    in_stock: true,
    stock_quantity: 10,
    image_url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80'
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, catRes, prodRes, histRes] = await Promise.all([
        fetch('/api/v1/admin/dashboard').then(r => r.json()),
        fetch('/api/v1/admin/categories').then(r => r.json()),
        fetch('/api/v1/products?limit=200').then(r => r.json()),
        fetch('/api/v1/admin/change-history').then(r => r.json())
      ]);

      if (dashRes.success) {
        setStats(dashRes.stats);
        setSyncLogs(dashRes.recent_sync_logs || []);
      }
      if (catRes.success) setCategories(catRes.categories || []);
      if (prodRes.success) setProducts(prodRes.products || []);
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
        body: JSON.stringify({ source })
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage({ type: 'success', text: `Sync Completed! Added: ${data.log.products_added}, Updated: ${data.log.products_updated}, Unchanged: ${data.log.products_unchanged}` });
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
  const handleImportIndiaMART = () => handleRunSync('indiamart');

  // Source Mutation Simulation
  const handleSimulateSourceChange = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/v1/admin/simulate-source-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: mutateSource,
          product_id: mutateProdId,
          price: mutatePrice,
          stock_quantity: mutateStock
        })
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage({ type: 'success', text: `Source External Data Mutated! Click "Run Synchronization" to verify live catalog update!` });
      } else {
        setSyncMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setSyncMessage({ type: 'error', text: 'Mutation simulation failed' });
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
      const data = await res.json();
      if (data.success) {
        setShowProductForm(false);
        setEditingProduct(null);
        loadAdminData();
        refreshCatalog();
      }
    } catch (err) {
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from central catalog?')) return;
    try {
      await fetch(`/api/v1/admin/products/${id}`, { method: 'DELETE' });
      loadAdminData();
      refreshCatalog();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleToggleStock = async (product) => {
    try {
      await fetch('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          in_stock: !product.in_stock,
          stock_status: !product.in_stock ? 'in_stock' : 'out_of_stock'
        })
      });
      loadAdminData();
      refreshCatalog();
    } catch (err) {
      alert('Toggle stock failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-[var(--accent-gold)] font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Catalog Maker Management Portal</span>
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
            Rajdhani Royal
          </button>
          <button
            onClick={() => switchTheme('glassmorphic')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              config.active_design === 'glassmorphic' ? 'bg-blue-600 text-white shadow' : 'text-[var(--text-muted)]'
            }`}
          >
            Velox Glass
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

      {/* --- TAB 1: OVERVIEW DASHBOARD --- */}
      {activeTab === 'overview' && stats && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Total Catalog Items</div>
              <div className="text-3xl font-extrabold gold-text mt-1">{stats.total_products}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Shopify: {stats.shopify_products} \| Woo: {stats.woocommerce_products} {stats.indiamart_products ? `\| B2B: ${stats.indiamart_products}` : ''}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Active Categories</div>
              <div className="text-3xl font-extrabold text-blue-400 mt-1">{stats.total_categories}</div>
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
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">Quick E-Commerce & B2B Import Actions</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Import 50+ Shopify demo items, 50+ WooCommerce demo items, 25 IndiaMART B2B items, or run sync.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleImportShopify}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
              >
                Import Shopify (50+)
              </button>
              <button
                onClick={handleImportWooCommerce}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
              >
                Import WooCommerce (50+)
              </button>
              <button
                onClick={handleImportIndiaMART}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 font-bold text-xs hover:bg-amber-600 hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Import IndiaMART B2B</span>
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

          {/* Demonstration Helper: Source Mutation Simulator */}
          <div className="glass-card p-6 rounded-2xl border-2 border-purple-500/30 bg-purple-950/10">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
              <Zap className="w-5 h-5" />
              <span>Mandatory Demonstration Tool: External Source Mutation Simulator</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Use this tool to artificially change a product's price or stock quantity on the external Shopify/WooCommerce store. Then click <strong>"Run Synchronization"</strong> to demonstrate live update detection and catalog propagation!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs text-[var(--text-muted)] font-semibold block mb-1">Target E-Commerce Store</label>
                <select
                  value={mutateSource}
                  onChange={(e) => {
                    setMutateSource(e.target.value);
                    setMutateProdId(e.target.value === 'shopify' ? '7101' : '401');
                  }}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 rounded-xl text-xs text-[var(--text-primary)]"
                >
                  <option value="shopify">Shopify Store (ID: 7101)</option>
                  <option value="woocommerce">WooCommerce Store (ID: 401)</option>
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
                <label className="text-xs text-[var(--text-muted)] font-semibold block mb-1">New Simulated Price (₹)</label>
                <input
                  type="number"
                  value={mutatePrice}
                  onChange={(e) => setMutatePrice(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 rounded-xl text-xs text-[var(--text-primary)]"
                />
              </div>

              <button
                onClick={handleSimulateSourceChange}
                disabled={syncing}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow"
              >
                1. Mutate External Store Data
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
                <span>2. Run Synchronization Now</span>
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
                  category_id: 'cat-carpets',
                  description: 'Handcrafted artisan catalog item.',
                  in_stock: true,
                  stock_quantity: 10,
                  image_url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80'
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
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    >
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
        <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)] max-w-xl">
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
        </div>
      )}

    </div>
  );
}
