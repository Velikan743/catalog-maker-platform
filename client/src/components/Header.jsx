import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { useWishlist } from '../context/WishlistContext';
import { Search, Heart, Shield, Sparkles, X, Sun, Moon, Layers } from 'lucide-react';

export default function Header() {
  const {
    config,
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
    switchTheme
  } = useCatalog();

  const { wishlist } = useWishlist();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-[var(--border-color)] px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Brand Header */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div 
            onClick={() => setActiveView('catalog')}
            className="cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent-gold-dark)] to-[var(--accent-gold)] flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-[var(--accent-gold-glow)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight tracking-wide gold-text group-hover:opacity-95 transition-opacity">
                {config.catalog_name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[var(--text-muted)] tracking-widest uppercase font-semibold">
                  High-Speed Catalog Engine
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setActiveView(activeView === 'wishlist' ? 'catalog' : 'wishlist')}
              className="relative p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView(activeView === 'admin' ? 'catalog' : 'admin')}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent-gold)]"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        {activeView === 'catalog' && (
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search silk carpets, teak furniture, SKUs or categories..."
              className="w-full pl-10 pr-10 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Desktop Controls & View Selector */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Active Design Template Switcher */}
          <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-full border border-[var(--border-color)] text-xs">
            <button
              onClick={() => switchTheme('luxury')}
              className={`px-3 py-1 rounded-full font-semibold text-[11px] transition-all ${
                config.active_design === 'luxury'
                  ? 'bg-[var(--accent-gold)] text-slate-950 font-bold shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Rajdhani Royal
            </button>
            <button
              onClick={() => switchTheme('glassmorphic')}
              className={`px-3 py-1 rounded-full font-semibold text-[11px] transition-all ${
                config.active_design === 'glassmorphic'
                  ? 'bg-blue-600 text-white font-bold shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Velox Glass
            </button>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => setActiveView(activeView === 'wishlist' ? 'catalog' : 'wishlist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeView === 'wishlist'
                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-rose-500 hover:text-rose-400'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className="bg-rose-500 text-white px-1.5 py-0.2 text-[10px] font-bold rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Admin Panel Access Button */}
          <button
            onClick={() => setActiveView(activeView === 'admin' ? 'catalog' : 'admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeView === 'admin'
                ? 'bg-[var(--accent-gold)] text-slate-950 border-[var(--accent-gold)] font-bold shadow'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{activeView === 'admin' ? 'Customer View' : 'Admin Portal'}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
