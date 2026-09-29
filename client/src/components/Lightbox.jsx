import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { X, ZoomIn, Download } from 'lucide-react';

export default function Lightbox() {
  const { lightboxImage, setLightboxImage } = useCatalog();

  if (!lightboxImage) return null;

  return (
    <div
      onClick={() => setLightboxImage(null)}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animation-fadeIn"
    >
      <button
        onClick={() => setLightboxImage(null)}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl max-h-[85vh] flex items-center justify-center"
      >
        <img
          src={lightboxImage}
          alt="High resolution view"
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}
