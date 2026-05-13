'use client';

import React, { useState } from 'react';
import { CreditCard, QrCode, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [method, setMethod] = useState<'credit_card' | 'pix'>('credit_card');

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
            <span className="text-[10px] font-black uppercase tracking-widest">Pagamento Seguro PCI-DSS</span>
          </div>

          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Escolha o Método</h2>

          {/* Payment Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setMethod('credit_card')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${method === 'credit_card' ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white'}`}
            >
              <CreditCard size={18} />
              CARTÃO
            </button>
            <button 
              onClick={() => setMethod('pix')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${method === 'pix' ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white'}`}
            >
              <QrCode size={18} />
              PIX
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {method === 'credit_card' ? (
              <>
                <div className="space-y-4">
                  <input placeholder="Número do Cartão" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-[#a0fb00]/50 outline-none" />
                  <input placeholder="Nome como no Cartão" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-[#a0fb00]/50 outline-none" />
                  <div className="flex gap-4">
                    <input placeholder="MM/AA" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-[#a0fb00]/50 outline-none" />
                    <input placeholder="CVV" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-[#a0fb00]/50 outline-none" />
                  </div>
                </div>
                <button className="w-full bg-[#a0fb00] text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                  FINALIZAR COMPRA
                  <Lock size={18} />
                </button>
              </>
            ) : (
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center space-y-6">
                <div className="w-48 h-48 bg-white mx-auto p-4 rounded-2xl flex items-center justify-center">
                  <QrCode size={120} className="text-black" />
                </div>
                <div>
                  <p className="text-sm font-bold mb-2">Escaneie o QR Code para pagar</p>
                  <p className="text-xs text-white/40">A aprovação é instantânea e o pedido será enviado ao Bling imediatamente.</p>
                </div>
                <button className="text-[#a0fb00] text-xs font-black uppercase hover:underline">COPIAR CÓDIGO PIX</button>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Liveshop Zen S.A. • CNPJ 00.000.000/0000-00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
