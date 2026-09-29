import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children, config }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('catalog_maker_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [enquiryList, setEnquiryList] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('catalog_maker_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to persist wishlist:', e);
    }
  }, [wishlist]);

  // Wishlist Actions
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        // Track analytics
        fetch('/api/v1/track-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'wishlist', payload: { product_id: product.id } })
        }).catch(() => {});
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  // WhatsApp Multi-Select Enquiry Actions
  const toggleEnquiryItem = (product) => {
    setEnquiryList(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInEnquiryList = (productId) => {
    return enquiryList.some(p => p.id === productId);
  };

  const clearEnquiryList = () => {
    setEnquiryList([]);
  };

  // Generate WhatsApp formatted text link
  const generateWhatsAppLink = (customProducts = null) => {
    const items = customProducts || enquiryList;
    if (!items || items.length === 0) return '#';

    const rawPhone = (config?.whatsapp_number || '+919876543210').replace(/[^0-9]/g, '');
    const header = config?.whatsapp_message_header || 'Hi, I am interested in inquiring about the following products:';

    let text = `${header}\n\n`;
    items.forEach((item, index) => {
      const itemUrl = `${window.location.origin}/#product-${item.id}`;
      text += `${index + 1}. *${item.title}*\n   SKU: ${item.sku} | Price: ₹${Number(item.price).toLocaleString()}\n   Link: ${itemUrl}\n\n`;
    });
    text += `Please share bulk pricing, availability, and delivery timeline. Thank you!`;

    // Track analytics
    fetch('/api/v1/track-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'enquiry', payload: { item_count: items.length } })
    }).catch(() => {});

    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist,
      enquiryList,
      toggleEnquiryItem,
      isInEnquiryList,
      clearEnquiryList,
      generateWhatsAppLink
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
