import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import ProductCard from '../../components/ProductCard';
import CategoryPills from '../../components/CategoryPills';
import SkeletonLoader from '../../components/SkeletonLoader';
import { LayoutGrid, Zap, RefreshCw, Layers } from 'lucide-react';

export default function GlassCatalogView() {
  const { products, loading, refreshCatalog } = useCatalog();

  return (
    <div className="min-h-screen pb-24">
      {/* Modern Glassmorphic Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="glass-card p-8 rounded-3xl border border-[var(--border-focus)]/30 bg-gradient-to-r from-[var(--accent-gold)]/10 via-white/5 to-[var(--accent-gold-dark)]/10 backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--border-focus)]/20 text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Clothing · Shoes · Jewellery</span>
            </div>
            <h1 className="font-sans font-extrabold text-2xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
              The Season, Styled
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
              Shop clothing, shoes, and jewellery from your connected Shopify and WooCommerce stores.
            </p>
          </div>

          <button
            onClick={refreshCatalog}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-gold-dark)] hover:opacity-90 text-white font-bold text-xs shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Store Products</span>
          </button>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <CategoryPills />

      {/* Product List */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[var(--accent-gold)]" />
            <h2 className="font-sans font-bold text-xl text-[var(--text-primary)]">
              Products Grid ({products.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader count={8} />
        ) : products.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl border border-[var(--border-color)] max-w-md mx-auto p-8">
            <Layers className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <h3 className="font-sans font-bold text-base text-[var(--text-primary)]">No live products found</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Connect Shopify or WooCommerce in Admin, then synchronize store products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
