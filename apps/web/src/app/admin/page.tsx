import React from 'react';
import { TrendingUp, ShoppingBag, Eye, DollarSign, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Vendas Hoje', value: 'R$ 12.450', icon: DollarSign, trend: '+14%', color: '#a0fb00' },
    { label: 'Pedidos', value: '48', icon: ShoppingBag, trend: '+8%', color: '#fff' },
    { label: 'Visualizações', value: '1.2k', icon: Eye, trend: '+22%', color: '#fff' },
    { label: 'Ticket Médio', value: 'R$ 259', icon: TrendingUp, trend: '-2%', color: '#fff' },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Visão Geral</h2>
          <p className="text-white/40 text-sm">Bem-vindo de volta ao comando da sua loja.</p>
        </div>
        <button className="bg-[#a0fb00] text-black font-black px-6 py-3 rounded-xl hover:scale-105 transition-all flex items-center gap-2">
          ABRIR LIVE STUDIO
          <ArrowUpRight size={18} />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/5 rounded-2xl">
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-white/40 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-black">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Status Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-8 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-500 text-xs font-black uppercase tracking-widest">Live Offline</span>
            </div>
            <h3 className="text-4xl font-black mb-4 tracking-tighter leading-none">SEU PRÓXIMO DROP ESTÁ PRONTO?</h3>
            <p className="text-white/40 max-w-md mb-8">
              Prepare seus produtos e inicie sua transmissão para alcançar milhares de clientes em tempo real.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all">
                AGENDAR DROP
              </button>
              <button className="px-8 py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
                VER ANALYTICS
              </button>
            </div>
          </div>
          <div className="h-48 bg-white/5 flex items-end px-8">
             <div className="flex-1 flex gap-1 h-32 items-end">
                {[40, 70, 45, 90, 65, 80, 30, 55, 75, 40, 60, 85, 35, 95, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#a0fb00]/20 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
             </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
          <h4 className="text-lg font-black uppercase italic mb-6">Atividade Recente</h4>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-[#a0fb00]/10 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-[#a0fb00]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Novo Pedido #3942</p>
                  <p className="text-xs text-white/40">há 2 minutos • R$ 249,00</p>
                </div>
                <ArrowUpRight size={16} className="text-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
