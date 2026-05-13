'use client';

import React from 'react';
import { NeonButton, GlassPanel } from '@liveshop/liquidos-ui';
import { CheckCircle2, Package, Calendar, MapPin, ArrowRight, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="relative min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* 🎊 CELEBRATION BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#a0fb00]/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <main className="relative z-10 w-full max-w-lg px-6 py-12 flex flex-col items-center">
        
        {/* ✅ SUCCESS ICON */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-[#a0fb00] blur-[40px] opacity-20 rounded-full animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-[#a0fb00]/10 border-2 border-[#a0fb00] flex items-center justify-center shadow-[0_0_50px_rgba(160,251,0,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-[#a0fb00]" />
          </div>
        </div>

        {/* 🏆 HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">
            Pedido<br />Confirmado!
          </h1>
          <p className="text-sm text-white/40 font-bold uppercase tracking-widest">
            Obrigado por escolher a <span className="text-[#a0fb00]">Runner's Xchange</span>
          </p>
        </div>

        {/* 📦 ORDER SUMMARY CARD */}
        <GlassPanel className="w-full p-8 rounded-[40px] flex flex-col gap-6 mb-12 border-white/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Código do Pedido</p>
              <p className="text-lg font-black text-white">#RX-849201</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#a0fb00]">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="h-[1px] bg-white/5 w-full" />

          <div className="grid grid-cols-2 gap-6">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Itens</p>
                <p className="text-xs font-bold">03 Unidades</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Entrega</p>
                <p className="text-xs font-bold text-[#a0fb00]">Em 3-5 dias</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Endereço</p>
              <p className="text-xs font-bold line-clamp-1">Rua das Flores, 123 • São Paulo, SP</p>
            </div>
          </div>
        </GlassPanel>

        {/* 🚀 CTA */}
        <div className="w-full flex flex-col gap-4">
          <Link href="/">
            <NeonButton icon={<ArrowRight className="w-5 h-5" />} className="py-4 uppercase tracking-widest font-black italic">
              Continuar Comprando
            </NeonButton>
          </Link>
          
          <Link href="/profile" className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center hover:text-[#a0fb00] transition-colors">
            Acompanhar Status do Pedido
          </Link>
        </div>

      </main>

    </div>
  );
}
