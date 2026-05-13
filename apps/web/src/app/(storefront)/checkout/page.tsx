'use client';

import React, { useState } from 'react';
import { GamifiedProgress, PaymentOption, NeonButton, GlassPanel } from '@liveshop/liquidos-ui';
import { ChevronLeft, MapPin, CreditCard, QrCode, FileText, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const router = useRouter();
  const { items, total } = useCart();
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-[#a0fb00] font-black italic animate-pulse">Autenticando...</div>;

  const FREE_SHIPPING_TARGET = 1500;
  const isGoalReached = total >= FREE_SHIPPING_TARGET;
  const remaining = Math.max(0, FREE_SHIPPING_TARGET - total);
  const [isPaying, setIsPaying] = useState(false);
  const { clearCart } = useCart();

  const handlePay = async () => {
    setIsPaying(true);
    // Simular processamento do gateway (Pagar.me/Stripe)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    clearCart();
    router.push('/checkout/success');
  };

  if (isPaying) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-[#a0fb00]/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#a0fb00] rounded-full animate-spin shadow-[0_0_20px_rgba(160,251,0,0.5)]" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black italic uppercase tracking-widest animate-pulse">Processando Pagamento</h2>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Criptografia de 256 bits ativa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans pb-32">
      
      {/* 🏷️ HEADER */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-5 flex items-center">
        <Link href="/cart" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-1 text-center text-lg font-black italic uppercase tracking-tight mr-10">Checkout</h1>
      </header>

      <main className="p-6 flex flex-col gap-8 max-w-2xl mx-auto w-full">
        
        {/* 📍 SHIPPING SECTION */}
        <section>
          <h2 className="text-xs font-black italic uppercase tracking-widest text-white/40 mb-4 px-1">Informações de Envio</h2>
          <GlassPanel className="p-4 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#a0fb00]/10 flex items-center justify-center text-[#a0fb00]">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Rua das Flores, 123</p>
              <p className="text-[11px] text-white/40 uppercase font-bold tracking-wider">São Paulo, SP • 01234-567</p>
            </div>
            <button className="text-[10px] font-black text-[#a0fb00] uppercase border border-[#a0fb00]/30 px-3 py-2 rounded-full">Editar</button>
          </GlassPanel>
        </section>

        {/* 💳 PAYMENT SECTION */}
        <section>
          <h2 className="text-xs font-black italic uppercase tracking-widest text-white/40 mb-4 px-1">Método de Pagamento</h2>
          <div className="flex flex-col gap-3">
            <PaymentOption 
              title="Cartão de Crédito"
              subtitle="Até 10x sem juros"
              selected={paymentMethod === 'credit_card'}
              onSelect={() => setPaymentMethod('credit_card')}
              icon={<CreditCard className="w-5 h-5" />}
            />
            <PaymentOption 
              title="Pix"
              subtitle="Aprovação imediata"
              selected={paymentMethod === 'pix'}
              onSelect={() => setPaymentMethod('pix')}
              icon={<QrCode className="w-5 h-5" />}
            />
            <PaymentOption 
              title="Boleto"
              subtitle="Vencimento em 3 dias"
              selected={paymentMethod === 'boleto'}
              onSelect={() => setPaymentMethod('boleto')}
              icon={<FileText className="w-5 h-5" />}
            />
          </div>
        </section>

        {/* 🎁 GAMIFIED SUMMARY */}
        <section>
          <h2 className="text-xs font-black italic uppercase tracking-widest text-white/40 mb-4 px-1">Resumo do Pedido</h2>
          <GamifiedProgress 
            current={total}
            target={FREE_SHIPPING_TARGET}
            label={isGoalReached ? "Frete Grátis Liberado!" : "Quase lá!"}
            sublabel={isGoalReached 
              ? "Você ganhou um Brinde Exclusivo de colecionador." 
              : `Gaste mais R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para ganhar um Brinde Exclusivo`}
          />

          <GlassPanel className="p-6 rounded-3xl flex flex-col gap-3">
            <div className="flex justify-between text-sm text-white/60">
              <span>Subtotal ({items.length} itens)</span>
              <span className="text-white font-bold">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60">
              <span>Frete</span>
              <span className="text-[#a0fb00] font-bold">Grátis</span>
            </div>
            <div className="h-[1px] bg-white/10 my-1" />
            <div className="flex justify-between items-end">
              <span className="text-base font-bold">Total</span>
              <span className="text-3xl font-black text-[#a0fb00] tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </GlassPanel>
        </section>

      </main>

      {/* 🚀 PAY BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-6 pb-10 bg-[#0a0a0a]/90 backdrop-blur-3xl border-t border-white/10 z-50">
        <div className="max-w-2xl mx-auto">
          <NeonButton 
            onClick={handlePay}
            icon={<Lock className="w-5 h-5" />} 
            className="py-4 uppercase tracking-widest font-black italic"
          >
            Pagar Agora
          </NeonButton>
        </div>
      </div>

    </div>
  );
}
