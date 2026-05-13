'use client';

import React from 'react';
import { SocialLoginButton, NeonButton } from '@liveshop/liquidos-ui';
import { ChevronLeft, User, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginSelectionPage() {
  return (
    <div className="relative min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* 🖼️ BACKGROUND CONTEXT */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMRhglso9DYKsXLX2MO3fWpCCmyfu1rNy_w8-fvzv56eHLadRi05wEaOaYzWAJ-JMg3ZTUeE1rEghFNWk1WXxcEUBiS9QSLrXXEg-2zL2LVniwCmct2G1LPe7xx6cfyyc0aMD3iVxX2-7Nb-KB_BtJTqSSXKoZWtP3595WkIY4lqaTUz78tfZhRcNZSW27W7i88rfMFIGIEgGP6cdDEOz8XDJMcjR9r_iMTC4U5ALuw-F2kZkC6N0me_tOeRMzPYe8Hlpq2KH3bww" 
          className="w-full h-full object-cover opacity-40 grayscale" 
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* 🛒 LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md px-6 mt-auto mb-12">
        <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-[48px] p-10 flex flex-col items-center border border-white/10 shadow-2xl relative overflow-hidden">
          
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#a0fb00]/20 blur-[60px] rounded-full" />
          
          {/* Back Button & Profile Placeholder */}
          <div className="w-full flex justify-between items-center mb-10">
            <Link href="/" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60">
              <User className="w-5 h-5" />
            </div>
          </div>

          {/* Brand Logo */}
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="w-20 h-20 bg-[#a0fb00] rounded-[24px] flex items-center justify-center rotate-12 shadow-[0_0_40px_rgba(160,251,0,0.3)]">
              <span className="text-black text-3xl font-black italic -rotate-12">Z</span>
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Liveshop Zen</h1>
            <p className="text-white/40 text-center text-sm font-medium">Acesse sua conta para uma experiência <br /> de compra equilibrada.</p>
          </div>

          {/* Social Logins */}
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">Entrar com</p>
          <div className="flex gap-6 mb-10">
            <Link href="/auth/email">
              <SocialLoginButton icon={<Mail className="w-6 h-6" />} />
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center w-32 mb-10 opacity-20">
            <div className="flex-1 h-[1px] bg-white" />
            <span className="px-4 text-[10px] font-black">OU</span>
            <div className="flex-1 h-[1px] bg-white" />
          </div>

          {/* CTA */}
          <NeonButton className="py-4 uppercase tracking-widest font-black italic">
            Criar Nova Conta
          </NeonButton>

          <p className="text-[9px] font-bold text-white/20 mt-8 tracking-widest uppercase">
            Powered by Liveshop Zen
          </p>

        </div>
      </div>

    </div>
  );
}
