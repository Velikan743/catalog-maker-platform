import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, Check, MessageCircle, ArrowUpRight } from 'lucide-react';

export default function ProductCard({ product }) {
  const { setSelectedProduct } = useCatalog();
  const {
    toggleWishlist,
    isInWishlist,
    toggleEnquiryItem,
    isInEnquiryList,
    generateWhatsAppLink
  } = useWishlist();

  const isSaved = isInWishlist(product.id);
  const isEnquired = isInEnquiryList(product.id);

  const mainImage = (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80';

  const handleSingleWhatsApp = (e) => {
    e.stopPropagation();
    const link = generateWhatsAppLink([product]);
    window.open(link, '_blank');
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group glass-card overflow-hidden flex flex-col cursor-pointer relative transition-all duration-300 border border-[var(--border-color)] hover:border-[var(--accent-gold)] shadow-xl rounded-2xl"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950/60">
        <img
          src={mainImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Source Badge */}
        <span className="absolute top-3 left-3 badge badge-source backdrop-blur-md font-mono text-[9px] shadow-sm">
          {product.source_type}
        </span>

        {/* Stock Status Badge */}
        <span className={`absolute top-3 right-12 badge ${product.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'} backdrop-blur-md shadow-sm`}>
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>

        {/* Wishlist Heart Icon Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-rose-500 text-white shadow-lg scale-110'
              : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/70'
          }`}
          title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Multi-Enquiry Select Checkbox Badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleEnquiryItem(product);
          }}
          className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md ${
            isEnquired
              ? 'bg-[var(--accent-gold)] text-slate-950 shadow-lg font-extrabold'
              : 'bg-black/60 text-white/90 hover:bg-black/80 border border-white/20'
          }`}
        >
          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
            isEnquired ? 'bg-slate-950 border-slate-950 text-[var(--accent-gold)]' : 'border-white/60'
          }`}>
            {isEnquired && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span>{isEnquired ? 'Enquiry Selected' : 'Select'}</span>
        </button>
      </div>

      {/* Card Detail Section */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-[var(--bg-card)]/40">
        <div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold mb-1 flex items-center justify-between">
            <span>{product.sub_category || 'Handmade'}</span>
            <span className="font-mono text-[9px] opacity-75">{product.sku}</span>
          </div>
          <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--accent-gold)] transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Instant WhatsApp Button */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)]/50 flex items-center justify-between">
          <div>
            <span className="font-extrabold text-base text-[var(--text-primary)] gold-text">
              ₹{Number(product.price).toLocaleString()}
            </span>
            {product.compare_at_price > product.price && (
              <span className="text-xs text-[var(--text-muted)] line-through ml-2">
                ₹{Number(product.compare_at_price).toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={handleSingleWhatsApp}
            className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 transition-all flex items-center justify-center shadow-sm"
            title="Enquire on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
