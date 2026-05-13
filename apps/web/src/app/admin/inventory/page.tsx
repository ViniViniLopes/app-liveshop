import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ArrowUpDown } from 'lucide-react';

export default function InventoryPage() {
  const products = [
    { id: '1', name: 'Zen Runner Pro v1', sku: 'ZEN-RUN-01', price: 899.00, stock: 52, status: 'active', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
    { id: '2', name: 'Neon Fitness Set', sku: 'NEON-SET-02', price: 349.00, stock: 12, status: 'active', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f' },
    { id: '3', name: 'Cyber-Zen Cap', sku: 'CYBER-CAP-03', price: 149.00, stock: 156, status: 'active', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f' },
    { id: '4', name: 'Ultra Grip Mat', sku: 'ZEN-MAT-04', price: 199.00, stock: 0, status: 'out_of_stock', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Estoque</h2>
          <p className="text-white/40 text-sm">Gerencie seu catálogo de produtos sincronizado com o Bling.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
            SINCRONIZAR BLING
          </button>
          <button className="bg-[#a0fb00] text-black font-black px-6 py-3 rounded-xl hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={20} />
            NOVO PRODUTO
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex gap-4 items-center bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, SKU ou categoria..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#a0fb00]/50 transition-all"
          />
        </div>
        <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:text-white">
          <Filter size={20} />
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-white/40 text-xs font-black uppercase tracking-widest">
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4 flex items-center gap-2">Preço <ArrowUpDown size={14} /></th>
              <th className="px-6 py-4">Estoque</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/[0.02] transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={product.image} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                    <span className="font-bold text-sm">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-white/40">{product.sku}</td>
                <td className="px-6 py-4 text-sm font-bold">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${product.stock < 10 ? 'text-red-500' : 'text-white'}`}>
                      {product.stock} un
                    </span>
                    {product.stock < 10 && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${
                    product.status === 'active' 
                    ? 'border-green-500/20 text-green-500 bg-green-500/5' 
                    : 'border-red-500/20 text-red-500 bg-red-500/5'
                  }`}>
                    {product.status === 'active' ? 'ATIVO' : 'ESGOTADO'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/20 hover:text-white">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
