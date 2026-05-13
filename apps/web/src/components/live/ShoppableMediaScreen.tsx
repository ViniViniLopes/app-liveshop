'use client';

import { useEffect, useState } from 'react';
import { MorphCard } from '@/components/product/MorphCard';

interface ShoppableMediaScreenProps {
  mediaItem: any;
  product: any;
  tenant: any;
  tracking: {
    affiliateId?: string;
    clickId?: string;
  };
}

export function ShoppableMediaScreen({ mediaItem, product, tenant, tracking }: ShoppableMediaScreenProps) {
  const [videoTheme, setVideoTheme] = useState({
    color: tenant.branding?.primary_color || '#A3FF00'
  });

  // Simplified Video Theme Extraction (Logic would go here)
  
  return (
    <main className="relative h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full relative">
          {mediaItem.type === 'recorded_video' ? (
            <video 
              src={mediaItem.source_url} 
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
             <div className="w-full h-full bg-white/5 flex items-center justify-center">
                {/* Fallback/Embed Renderer */}
                <iframe src={mediaItem.embed_url} className="w-full h-full border-0" allowFullScreen />
             </div>
          )}
          {/* Liquid Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        </div>
      </div>

      {/* Top Header (Branding) */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start">
        <div className="flex items-center gap-3">
          {tenant.branding?.logo_url && (
            <img src={tenant.branding.logo_url} alt={tenant.name} className="h-8 w-auto" />
          )}
          <div className="liquid-glass px-4 py-2 rounded-full border-white/10">
            <p className="text-white font-bold text-xs liquid-safe-contrast">{tenant.name}</p>
          </div>
        </div>
      </div>

      {/* Interaction Layer */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 pointer-events-none">
        <div className="max-w-md w-full mx-auto pointer-events-auto">
          <MorphCard 
            product={product} 
            tenant={tenant} 
            mediaItemId={mediaItem.id} 
          />
        </div>
      </div>
    </main>
  );
}
