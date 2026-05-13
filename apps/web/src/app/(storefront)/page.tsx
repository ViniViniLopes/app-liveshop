'use client';

import React, { useState } from 'react';
import { PromoBanner, FloatingPiP, GlassPanel, NeonButton } from '@liveshop/liquidos-ui';
import { Search, Menu, ShoppingCart, Home, User, Bell, Heart } from 'lucide-react';
import Link from 'next/link';
import { SplashScreen } from '@liveshop/liquidos-ui';
import { fetchProducts, fetchLiveSessions, toggleWishlist, fetchUserWishlist } from '@/lib/services';
import type { Product, LiveSession, MediaItem } from '@liveshop/database/src/types';
import { useCart } from '@/context/CartContext';

export default function DiscoveryHome() {
  const [showPiP, setShowPiP] = useState(true);
  const [isSplashing, setIsSplashing] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [lives, setLives] = useState<(LiveSession & { media_items: MediaItem })[]>([]);
  const { itemCount } = useCart();
  const [wishlist, setWishlist] = useState<string[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const [p, l, ws] = await Promise.all([
        fetchProducts(), 
        fetchLiveSessions(),
        fetchUserWishlist()
      ]);
      setProducts(p);
      setLives(l);
      setWishlist(ws.map((w: any) => w.product_id));
    };
    loadData();

    const timer = setTimeout(() => setIsSplashing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isSplashing) {
    return <SplashScreen brand="Liveshop Zen" />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-32">
      
      {/* 🏷️ TOP BAR */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Menu className="w-6 h-6 text-white/60" />
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-[#a0fb00]">Liveshop Zen</h1>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-white/60" />
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
        </div>
      </header>

      <main className="p-6 flex flex-col gap-8">
        
        {/* 🔍 SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input 
            type="text" 
            placeholder="Buscar drops, atletas, equipamentos..." 
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#a0fb00]/50 transition-all"
          />
        </div>

        {/* 🔥 HERO SLIDER */}
        <section className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
          <PromoBanner 
            tag="Flash Drop"
            title="50% OFF"
            subtitle="Equipamentos de elite só hoje."
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuA_DmCat0R9engSE8Qhbf-TjcR291KN40tm_EnpUTIQJAtXKyanz7yHX9v_YTAQ3Mo8siNCAd9j5rRgsFGVjSJIj3-i-XI72yRAXK-82rfG-kR2D_1-o9-uNGrF6Xwp_RqyjanogohKQamAaAUUSrAxyJBmzWxZeNgv2Z3TNi8pDoVKSEUToD7Qe3n9_JO30pUFJk-cjHF3BOxqFUKSCLPblGq5BQzlMLrY-zW-dqMZYk4iBrL0-whZKIzJuvWmMpal2l6TtRvGUyk"
          />
        </section>

        {/* 📺 LIVE DROPS (Grid) */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-lg font-black italic uppercase tracking-tight">Live Drops</h2>
            <span className="text-[10px] font-black text-[#a0fb00] uppercase tracking-widest">Ver Todos</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {lives.length > 0 ? lives.map((live) => (
              <Link href="/live" key={live.id} className="group relative aspect-[3/4] rounded-[32px] overflow-hidden border border-white/5">
                <img 
                  src={live.media_items?.thumbnail_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={live.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {live.status === 'live' && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">Live</span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-bold text-white line-clamp-2 leading-tight mb-2">{live.title}</p>
                  <span className="text-xs font-black text-[#a0fb00]">R$ 499,00</span>
                </div>
              </Link>
            )) : (
              <div className="col-span-2 py-12 text-center text-white/20 font-black italic uppercase tracking-widest border border-dashed border-white/10 rounded-[32px]">
                Nenhum Drop Ativo
              </div>
            )}
          </div>
        </section>

        {/* 👟 NEW DROPS (Products) */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-lg font-black italic uppercase tracking-tight">Novos Drops</h2>
            <span className="text-[10px] font-black text-[#a0fb00] uppercase tracking-widest">Ver Tudo</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
            {products.length > 0 ? products.map((product) => (
              <div key={product.id} className="min-w-[160px] snap-start group">
                <div className="aspect-square rounded-[32px] overflow-hidden bg-white/5 border border-white/5 mb-3 relative">
                  <Link href={`/products/${product.id}`}>
                    <img 
                      src={(product.raw_bling_data as any)?.media?.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={product.name}
                    />
                  </Link>
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                    <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                      <span className="text-[8px] font-black text-white uppercase">{product.stock > 0 ? 'Em Estoque' : 'Esgotado'}</span>
                    </div>
                    <button 
                      onClick={async (e) => {
                        e.preventDefault();
                        await toggleWishlist(product.id);
                        setWishlist(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]);
                      }}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors"
                    >
                      <Heart 
                        size={14} 
                        color={wishlist.includes(product.id) ? "#a0fb00" : "#fff"}
                        fill={wishlist.includes(product.id) ? "#a0fb00" : "none"} 
                      />
                    </button>
                  </div>
                </div>
                <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">{product.name}</h3>
                <p className="text-xs font-black text-[#a0fb00]">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            )) : (
              <div className="w-full py-8 text-center text-white/20 font-black italic uppercase tracking-widest border border-dashed border-white/10 rounded-[32px]">
                Nenhum Produto Disponível
              </div>
            )}
          </div>
        </section>

      </main>

      {/* 📺 FLOATING PiP */}
      {showPiP && (
        <Link href="/live">
          <FloatingPiP 
            username="@neonwear_br"
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuC1CHkbjj6BJIHC4OWIvcB71nXW9RL_MeRA9u7ARWcRwe0McvZ9pmO-Tp5rZO3EI9Vnfx56uRluFfgughbnss6xYwqEPyDcTz2K0ExF5rpmZFEhOXsO4Ttt8erdVc7reJbPpnrjxPeWrXiK57peu4TpRnS9WiBf75xuqYGcm-sDdhYOnlzIvxw7Lxl9xTSFTQ5dLv1xMo5XpEGOQYDtRQ0N7moYg5BDQOaRCQif8f4Jd57RvJmftMUS91EexoA0W6WJMHhc1tNlmVE"
            onClose={() => setShowPiP(false)}
          />
        </Link>
      )}

      {/* 🧭 BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-[#0a0a0a]/80 backdrop-blur-3xl border-t border-white/5 flex justify-around items-center px-6 pb-4">
        <Link href="/" className="text-[#a0fb00] flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
          <Home className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
        </Link>
        <button className="text-white/40 flex flex-col items-center gap-1 hover:text-white transition-colors">
          <Search className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Busca</span>
        </button>
        <Link href="/cart" className="text-white/40 flex flex-col items-center gap-1 relative hover:text-white transition-colors">
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#a0fb00] rounded-full flex items-center justify-center px-1">
              <span className="text-[8px] font-black text-black">{itemCount}</span>
            </div>
          )}
          <span className="text-[8px] font-black uppercase tracking-widest">Carrinho</span>
        </Link>
        <Link href="/profile" className="text-white/40 flex flex-col items-center gap-1 hover:text-white transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Perfil</span>
        </Link>
      </nav>

    </div>
  );
}
