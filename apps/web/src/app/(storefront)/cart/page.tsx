'use client';

import React from 'react';
import { CartItem, CartSummary, NeonButton, GamifiedProgress } from '@liveshop/liquidos-ui';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, total, updateQuantity, removeFromCart } = useCart();
  
  const FREE_SHIPPING_TARGET = 1500;
  const remaining = Math.max(0, FREE_SHIPPING_TARGET - total);
  const isGoalReached = total >= FREE_SHIPPING_TARGET;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      
      {/* 🔮 AMBIENT GLOW */}
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#a0fb00]/5 blur-[120px] pointer-events-none -z-10" />

      {/* 🏷️ STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-5 flex items-center">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-1 text-center text-lg font-black italic uppercase tracking-tight mr-10">Seu Carrinho</h1>
      </header>

      {/* 📦 MAIN CONTENT */}
      <main className="p-6 flex flex-col gap-8 max-w-2xl mx-auto w-full pb-32">
        
        {/* 🎮 GAMIFIED PROGRESS */}
        {items.length > 0 && (
          <GamifiedProgress 
            current={total} 
            target={FREE_SHIPPING_TARGET} 
            label={isGoalReached ? "🎁 BRINDE DESBLOQUEADO!" : "🚀 QUASE LÁ!"}
            sublabel={isGoalReached 
              ? "Você ganhou um Cyber-Cap exclusivo de colecionador." 
              : `Adicione mais R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para ganhar um brinde.`}
          />
        )}

        {/* 🛒 ITEMS LIST */}
        <div className="flex flex-col gap-4">
          {items.length > 0 ? items.map((item) => (
            <CartItem 
              key={item.id}
              name={item.name}
              price={item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              quantity={item.quantity}
              image={(item.raw_bling_data as any)?.media?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
              onIncrease={() => updateQuantity(item.id, 1)}
              onDecrease={() => updateQuantity(item.id, -1)}
              onRemove={() => removeFromCart(item.id)}
            />
          )) : (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/20">
              <ShoppingBag className="w-16 h-16 opacity-10" />
              <p className="font-black italic uppercase tracking-widest">Carrinho Vazio</p>
              <Link href="/">
                <NeonButton className="px-8 py-3 text-[10px] uppercase font-black italic">Explorar Drops</NeonButton>
              </Link>
            </div>
          )}
        </div>

        {/* 📊 SUMMARY */}
        {items.length > 0 && (
          <div className="flex flex-col gap-8">
            <CartSummary 
              subtotal={total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              shipping="Grátis"
              total={total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            />

            <Link href="/checkout">
              <NeonButton className="py-4 uppercase tracking-widest font-black italic shadow-[0_0_30px_rgba(160,251,0,0.3)]">
                Finalizar Compra
              </NeonButton>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
