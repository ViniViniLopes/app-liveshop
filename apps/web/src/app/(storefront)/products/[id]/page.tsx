'use client';

import { SizeSelector, ColorSelector, NeonButton, GlassPanel } from '@liveshop/liquidos-ui';
import { ChevronLeft, Heart, Share2, Star, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchProductById } from '@/lib/services';
import type { Product } from '@liveshop/database/src/types';
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('black');
  const { addToCart } = useCart();

  React.useEffect(() => {
    const loadProduct = async () => {
      if (typeof id === 'string') {
        const data = await fetchProductById(id);
        setProduct(data);
      }
      setLoading(false);
    };
    loadProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#a0fb00] font-black italic animate-pulse uppercase tracking-widest">Carregando Drop...</div>;
  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center text-white/40 font-black italic uppercase tracking-widest">Drop Não Encontrado</div>;

  const productImages = (product.raw_bling_data as any)?.media?.images || [];
  const productImage = productImages[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';
  const sizes = ['P', 'M', 'G', 'GG']; // Poderia vir do Bling também
  const colors = [
    { id: 'black', hex: '#1c1c1c', name: 'Preto Carbono' },
    { id: 'white', hex: '#e2e2e2', name: 'Branco Neve' },
    { id: 'neon', hex: '#a0fb00', name: 'Verde Elétrico' }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-x-hidden">
      
      {/* 🖼️ PRODUCT IMAGE/VIDEO BACKGROUND */}
      <div className="absolute inset-0 h-[70vh] z-0">
        <img 
          src={productImage} 
          className="w-full h-full object-cover opacity-80" 
          alt={product.name}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
      </div>

      {/* 🏷️ TOP ACTIONS */}
      <header className="absolute top-0 left-0 w-full p-6 pt-10 flex justify-between items-center z-20">
        <Link href="/" className="w-11 h-11 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/10">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#a0fb00]/10 backdrop-blur-xl rounded-full border border-[#a0fb00]/30">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#a0fb00]">Drops</span>
        </div>

        <div className="flex gap-3">
          <button className="w-11 h-11 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/10">
            <Heart className="w-5 h-5" />
          </button>
          <button className="w-11 h-11 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/10">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 🛒 CONTENT AREA */}
      <div className="relative z-10 pt-[55vh]">
        <div className="bg-[#0a0a0a]/90 backdrop-blur-[40px] rounded-t-[48px] border-t border-white/10 p-8 pb-32 flex flex-col gap-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          
          {/* Header do Produto */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none max-w-[70%]">
                {product.name}
              </h1>
              <span className="text-2xl font-black text-[#a0fb00] tracking-tighter">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-[#a0fb00]">
                {[1,2,3,4].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                <Star className="w-4 h-4" />
              </div>
              <span className="text-xs text-white/40 font-bold uppercase tracking-widest">4.8 (124 avaliações)</span>
            </div>
          </div>

          <div className="h-[1px] bg-white/5 w-full" />

          {/* Seletores */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black italic uppercase tracking-widest text-white/40">Selecione o Tamanho</h3>
                <button className="text-[10px] font-bold text-[#a0fb00] underline uppercase">Guia de Medidas</button>
              </div>
              <SizeSelector sizes={sizes} selected={size} onSelect={setSize} />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-white/40 px-1">Selecione a Cor</h3>
              <ColorSelector colors={colors} selected={color} onSelect={setColor} />
            </div>
          </div>

          <p className="text-sm text-white/60 leading-relaxed font-medium">
            {product.description || 'Nenhuma descrição disponível para este produto de elite.'}
          </p>

        </div>
      </div>

      {/* 🚀 BUY BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-6 pb-10 bg-[#0a0a0a]/90 backdrop-blur-3xl border-t border-white/10 z-50">
        <div className="max-w-2xl mx-auto">
          <NeonButton 
            onClick={() => product && addToCart(product)}
            icon={<ShoppingBag className="w-5 h-5" />} 
            className="py-4 uppercase tracking-widest font-black italic"
          >
            Adicionar ao Carrinho
          </NeonButton>
        </div>
      </div>

    </div>
  );
}
