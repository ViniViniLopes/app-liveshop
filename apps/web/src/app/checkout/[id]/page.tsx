'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      // Fetch user/tenant context if any, hardcoded here for simplicity
      const tenant_id = 'c1234567-8901-2345-6789-0123456789ab'; // Mock tenant

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/checkout-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          tenant_id,
          product_id: params.id,
          quantity: 1,
          customer_email: 'cliente@teste.com' // Idealmente pegaria do contexto do usuario logado
        })
      });

      const data = await response.json();

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert('Erro ao gerar checkout: ' + (data.error || 'Desconhecido'));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao processar checkout.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      {/* Summary Side */}
      <div className="w-full md:w-[45%] bg-[#0a0a0a] p-8 md:p-16 border-r border-white/5">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-12">
          <ArrowLeft size={18} />
          Voltar para a loja
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Resumo</h1>
            <p className="text-white/40">Pedido #{params.id.slice(0, 8).toUpperCase()}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Zen Runner Pro v1</h3>
                <p className="text-sm text-white/40">Tamanho: 42 • Cor: Neon</p>
              </div>
              <p className="font-black">R$ 899,00</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <div className="flex justify-between text-white/40">
              <span>Subtotal</span>
              <span>R$ 899,00</span>
            </div>
            <div className="flex justify-between text-white/40">
              <span>Frete</span>
              <span className="text-[#a0fb00]">Grátis</span>
            </div>
            <div className="flex justify-between text-2xl font-black pt-4">
              <span>TOTAL</span>
              <span className="text-[#a0fb00]">R$ 899,00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Side */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="flex items-center gap-2 bg-[#a0fb00]/10 text-[#a0fb00] px-4 py-2 rounded-full self-start w-fit">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Pagamento 100% Seguro</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Finalizar Pedido</h2>
            <p className="text-white/40 text-sm">Você será redirecionado para o ambiente seguro da Stripe para inserir os dados do cartão ou pagar via Pix.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
            <div className="flex justify-center gap-4 text-white/40 opacity-50 mb-4">
              {/* Fake card flags */}
              <div className="h-8 w-12 bg-white/20 rounded"></div>
              <div className="h-8 w-12 bg-white/20 rounded"></div>
              <div className="h-8 w-12 bg-white/20 rounded"></div>
            </div>
            
            <button 
              onClick={handleStripeCheckout}
              disabled={loading}
              className="w-full bg-[#a0fb00] disabled:bg-[#a0fb00]/50 text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  CARREGANDO...
                </>
              ) : (
                <>
                  PAGAR COM STRIPE
                  <Lock size={18} />
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Liveshop Zen S.A. • Processado por Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
