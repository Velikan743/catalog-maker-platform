import React from 'react';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { WishlistProvider } from './context/WishlistContext';

import Header from './components/Header';
import CatalogPage from './pages/CatalogPage';
import AdminPage from './pages/AdminPage';
import WishlistDrawer from './components/WishlistDrawer';
import ProductModal from './components/ProductModal';
import Lightbox from './components/Lightbox';
import WhatsAppBar from './components/WhatsAppBar';

function MainLayout() {
  const { activeView, config } = useCatalog();

  return (
    <WishlistProvider config={config}>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <Header />

        {activeView === 'catalog' && <CatalogPage />}
        {activeView === 'admin' && <AdminPage />}
        {activeView === 'wishlist' && <WishlistDrawer />}

        <ProductModal />
        <Lightbox />
        <WhatsAppBar />
      </div>
    </WishlistProvider>
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <MainLayout />
    </CatalogProvider>
  );
}
