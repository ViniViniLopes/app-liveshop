'use client';

import React, { useEffect, useState } from 'react';
import { GlassPanel, NeonButton } from '@liveshop/liquidos-ui';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!cleared) {
      clearCart();
      setCleared(true);
    }
  }, [clearCart, cleared]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center font-sans p-6">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <GlassPanel className="p-8 rounded-3xl flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#a0fb00]/20 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-[#a0fb00]" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Pagamento Aprovado!</h1>
            <p className="text-white/60 text-sm">Seu pedido foi confirmado e já estamos preparando para envio.</p>
          </div>

          <div className="w-full h-[1px] bg-white/10" />

          {sessionId && (
            <div className="w-full text-left space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">ID da Transação</p>
              <p className="text-xs font-mono text-white/80 break-all">{sessionId}</p>
            </div>
          )}

          <div className="w-full pt-4 space-y-3">
            <Link href="/" className="block">
              <NeonButton className="w-full py-4 uppercase tracking-widest font-black italic" icon={<ShoppingBag className="w-5 h-5" />}>
                Continuar Comprando
              </NeonButton>
            </Link>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
