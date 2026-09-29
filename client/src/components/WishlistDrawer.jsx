import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCatalog } from '../context/CatalogContext';
import ProductCard from './ProductCard';
import { Heart, Trash2, MessageCircle, ArrowLeft } from 'lucide-react';

export default function WishlistDrawer() {
  const { wishlist, generateWhatsAppLink } = useWishlist();
  const { setActiveView } = useCatalog();

  const handleBatchWhatsApp = () => {
    const link = generateWhatsAppLink(wishlist);
    window.open(link, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-[var(--border-color)] pb-6">
        <div>
          <button
            onClick={() => setActiveView('catalog')}
            className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Catalog</span>
          </button>
          <h2 className="font-serif font-bold text-2xl text-[var(--text-primary)] gold-text flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
            <span>Saved Wishlist Products ({wishlist.length})</span>
          </h2>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={handleBatchWhatsApp}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Inquire All Wishlist via WhatsApp</span>
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl border border-[var(--border-color)] max-w-lg mx-auto p-8">
          <Heart className="w-16 h-16 text-rose-500/30 mx-auto mb-4" />
          <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[var(--text-muted)] mt-2 mb-6">
            Click the heart icon on any product in the catalog to save it here without needing an account.
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-6 py-2.5 rounded-full bg-[var(--accent-gold)] text-slate-950 font-bold text-xs shadow-md"
          >
            Explore Product Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
