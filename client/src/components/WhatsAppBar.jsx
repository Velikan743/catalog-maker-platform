import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { MessageCircle, Trash2, ArrowRight } from 'lucide-react';

export default function WhatsAppBar() {
  const { enquiryList, clearEnquiryList, generateWhatsAppLink } = useWishlist();

  if (!enquiryList || enquiryList.length === 0) return null;

  const totalValue = enquiryList.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  const handleSendEnquiry = () => {
    const link = generateWhatsAppLink();
    window.open(link, '_blank');
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-bounce-short">
      <div className="glass-panel p-3.5 rounded-2xl border-2 border-[var(--accent-gold)] shadow-2xl flex items-center justify-between gap-3 bg-[var(--bg-modal)]/90 backdrop-blur-xl">

        {/* Selected Counter & Subtotal */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
            {enquiryList.length}
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)]">
              {enquiryList.length} {enquiryList.length === 1 ? 'Product' : 'Products'} Selected
            </div>
            <div className="text-xs text-[var(--text-muted)] font-medium">
              Estimated Total: <span className="gold-text font-bold">₹{totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearEnquiryList}
            className="p-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-rose-400 hover:border-rose-400/40 transition-all text-xs"
            title="Clear selected products"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleSendEnquiry}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Send WhatsApp Enquiry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
