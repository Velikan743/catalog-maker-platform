import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import ProductCard from '../../components/ProductCard';
import CategoryPills from '../../components/CategoryPills';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Crown, Sparkles, RefreshCw, ShoppingBag, ShieldCheck, Clock } from 'lucide-react';

export default function LuxuryCatalogView() {
  const { products, loading, refreshCatalog } = useCatalog();

  return (
    <div className="min-h-screen pb-24">
      {/* Opulent Luxury Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0c1611] via-[#060a08] to-[var(--bg-primary)] border-b border-[var(--border-color)] py-14 px-4">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e5c07b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--border-color)] text-[var(--accent-gold)] text-xs font-bold uppercase tracking-widest mb-4 shadow-inner">
              <Crown className="w-4 h-4" />
              <span>Rajdhani Digital Carpet & Fine Loom Catalog</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight gold-text">
              Masterpiece Collection & Artisan Treasures
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
              Explore 130+ hand-knotted silk carpets, vintage runners, dhurries, and luxury decor items. Served via internal database with instant WhatsApp inquiry.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-[var(--text-muted)] font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-gold)]" />
                Verified Looms & Suppliers
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Instant WhatsApp Contact
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="glass-card p-5 rounded-2xl text-center border border-[var(--border-color)] shadow-xl">
              <div className="text-3xl font-extrabold font-serif gold-text">{products.length}+</div>
              <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Catalog Products</div>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center border border-[var(--border-color)] shadow-xl">
              <div className="text-3xl font-extrabold font-serif text-emerald-400">&lt; 5ms</div>
              <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Internal Latency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation Bar */}
      <CategoryPills />

      {/* Main Product Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]/60">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[var(--accent-gold)]" />
            <h2 className="font-serif font-bold text-2xl text-[var(--text-primary)]">
              Product Collection ({products.length})
            </h2>
          </div>
          <button
            onClick={refreshCatalog}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-all font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feed</span>
          </button>
        </div>

        {loading ? (
          <SkeletonLoader count={8} />
        ) : products.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl border border-[var(--border-color)] max-w-md mx-auto p-10 shadow-2xl">
            <ShoppingBag className="w-14 h-14 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
            <h3 className="font-serif font-bold text-xl text-[var(--text-primary)]">No products match selection</h3>
            <p className="text-xs text-[var(--text-muted)] mt-2">Try clearing your search query or selecting 'All Products'.</p>
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
