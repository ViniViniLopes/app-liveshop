'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, X } from 'lucide-react';
import { useSupabaseActionEvent } from '@/hooks/useSupabaseActionEvent';

interface MorphCardProps {
  product: any;
  tenant: any;
  mediaItemId?: string;
}

export function MorphCard({ product, tenant, mediaItemId }: MorphCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { trackAction } = useSupabaseActionEvent();

  const handleBuyNow = () => {
    trackAction({
      tenantId: tenant.id,
      actionType: 'buy_now',
      mediaItemId,
      blingProductId: product.id,
    });
    // Proceed to checkout logic
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            layoutId="product-card"
            onClick={() => setIsExpanded(true)}
            className="liquid-glass rounded-3xl p-4 flex items-center justify-between cursor-pointer"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 overflow-hidden">
                <img src={product.main_image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm line-clamp-1">{product.name}</h3>
                <p className="text-live-neon font-bold">R$ {product.price}</p>
              </div>
            </div>
            <div className="bg-live-neon text-black rounded-2xl px-4 py-2 font-bold text-sm flex items-center gap-2">
              Comprar <ChevronRight size={16} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            layoutId="product-card"
            className="liquid-glass rounded-[2.5rem] p-6 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-24 h-24 rounded-3xl bg-white/10 overflow-hidden">
                 <img src={product.main_image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-full bg-white/10 text-white"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-white text-xl font-bold mb-2">{product.name}</h2>
            <p className="text-white/60 text-sm mb-6 line-clamp-3">{product.description}</p>

            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Preço</p>
                <p className="text-white text-2xl font-bold">R$ {product.price}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Estoque</p>
                <p className="text-live-neon font-bold">{product.stock > 0 ? 'Em estoque' : 'Esgotado'}</p>
              </div>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full bg-live-neon text-black py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
            >
              <ShoppingBag size={24} />
              Finalizar Compra
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
