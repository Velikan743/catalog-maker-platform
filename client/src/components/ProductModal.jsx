import React, { useState, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { useWishlist } from '../context/WishlistContext';
import { X, Heart, MessageCircle, Check, Maximize2, Shield, Share2 } from 'lucide-react';

export default function ProductModal() {
  const { selectedProduct, setSelectedProduct, setLightboxImage } = useCatalog();
  const {
    toggleWishlist,
    isInWishlist,
    toggleEnquiryItem,
    isInEnquiryList,
    generateWhatsAppLink
  } = useWishlist();

  const [activeImg, setActiveImg] = useState('');
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (selectedProduct) {
      const firstImg = (selectedProduct.images && selectedProduct.images[0]) || '';
      setActiveImg(firstImg);

      // Fetch related items
      fetch(`/api/v1/products/${selectedProduct.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setRelated(data.related || []);
          }
        })
        .catch(err => console.error(err));
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isSaved = isInWishlist(selectedProduct.id);
  const isEnquired = isInEnquiryList(selectedProduct.id);

  const images = selectedProduct.images && selectedProduct.images.length > 0
    ? selectedProduct.images
    : [activeImg];

  const handleWhatsAppEnquiry = () => {
    const link = generateWhatsAppLink([selectedProduct]);
    window.open(link, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--bg-modal)] border border-[var(--border-color)] rounded-[var(--radius-lg)] shadow-2xl p-6 relative flex flex-col gap-6"
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column: Image Gallery & Lightbox Trigger */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border border-[var(--border-color)] group">
              <img
                src={activeImg || images[0]}
                alt={selectedProduct.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                onClick={() => setLightboxImage(activeImg || images[0])}
                className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all flex items-center gap-1.5 text-xs font-semibold"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Zoom Lightbox</span>
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="horizontal-scroll gap-2 py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImg === img ? 'border-[var(--accent-gold)] scale-105 shadow' : 'border-[var(--border-color)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-source">{selectedProduct.source_type}</span>
                <span className={`badge ${selectedProduct.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                  {selectedProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">SKU: {selectedProduct.sku}</span>
              </div>

              <h2 className="font-serif font-bold text-2xl text-[var(--text-primary)] leading-tight gold-text">
                {selectedProduct.title}
              </h2>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-[var(--text-primary)]">
                  ₹{Number(selectedProduct.price).toLocaleString()}
                </span>
                {selectedProduct.compare_at_price > selectedProduct.price && (
                  <span className="text-sm text-[var(--text-muted)] line-through">
                    ₹{Number(selectedProduct.compare_at_price).toLocaleString()}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {selectedProduct.description}
              </p>

              {/* Variants Section */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Available Options & Variants
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variants.map((v, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]">
                        {v.title || v.name || 'Option'} {v.price ? `- ₹${Number(v.price).toLocaleString()}` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={handleWhatsAppEnquiry}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white/20" />
                <span>Enquire via WhatsApp Now</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleEnquiryItem(selectedProduct)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isEnquired
                      ? 'bg-[var(--accent-gold)] text-slate-950 border-[var(--accent-gold)] font-bold shadow'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isEnquired ? 'Selected for Multi-Enquiry' : 'Select for Multi-Enquiry'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(selectedProduct)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isSaved
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-500'
                  }`}
                  title={isSaved ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Recommendation Carousel */}
        {related.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
            <h4 className="font-serif font-bold text-base text-[var(--text-primary)] mb-3">
              Related Recommendations
            </h4>
            <div className="horizontal-scroll gap-4 py-2">
              {related.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="w-40 flex-shrink-0 cursor-pointer group glass-card p-2 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-gold)]"
                >
                  <img
                    src={(item.images && item.images[0]) || ''}
                    alt={item.title}
                    className="w-full h-24 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform"
                  />
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)]">
                    {item.title}
                  </div>
                  <div className="text-xs font-bold gold-text mt-1">
                    ₹{Number(item.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
