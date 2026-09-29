import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import LuxuryCatalogView from '../templates/LuxuryTheme/CatalogView';
import GlassCatalogView from '../templates/GlassTheme/CatalogView';

export default function CatalogPage() {
  const { config } = useCatalog();

  if (config.active_design === 'glassmorphic') {
    return <GlassCatalogView />;
  }

  return <LuxuryCatalogView />;
}
