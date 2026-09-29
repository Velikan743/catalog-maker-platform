import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { Filter, SlidersHorizontal, Layers } from 'lucide-react';

export default function CategoryPills() {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    inStockOnly,
    setInStockOnly,
    sortOrder,
    setSortOrder
  } = useCatalog();

  return (
    <div className="py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Touch-Scrollable Category Pills */}
        <div className="horizontal-scroll gap-2.5 w-full sm:w-auto py-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === null
                ? 'bg-[var(--accent-gold)] text-slate-950 border-[var(--accent-gold)] shadow-md font-bold'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--border-focus)]'
            }`}
          >
            All Products
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                selectedCategory === cat.id
                  ? 'bg-[var(--accent-gold)] text-slate-950 border-[var(--accent-gold)] shadow-md font-bold'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--border-focus)]'
              }`}
            >
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Filters & Sorting */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Stock Filter */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] px-3 py-1.5 rounded-full border border-[var(--border-color)] hover:border-[var(--border-focus)]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-[var(--accent-gold)] rounded cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] px-3 py-1.5 rounded-full border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] focus:outline-none cursor-pointer font-medium"
            >
              <option value="featured" className="bg-[var(--bg-modal)] text-[var(--text-primary)]">Featured</option>
              <option value="price_asc" className="bg-[var(--bg-modal)] text-[var(--text-primary)]">Price: Low to High</option>
              <option value="price_desc" className="bg-[var(--bg-modal)] text-[var(--text-primary)]">Price: High to Low</option>
              <option value="newest" className="bg-[var(--bg-modal)] text-[var(--text-primary)]">Newest First</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
