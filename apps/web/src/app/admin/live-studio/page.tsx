import React from 'react';
import { Play, Copy, Shield, Settings, Info, Radio } from 'lucide-react';

export default function LiveStudioPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Live Studio</h2>
          <p className="text-white/40 text-sm">Configure sua transmissão e gerencie seus produtos ao vivo.</p>
        </div>
        <button className="bg-red-500 text-white font-black px-8 py-3 rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <Radio size={20} />
          ENTRAR NO AR
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Connection Settings */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={24} className="text-[#a0fb00]" />
              <h3 className="text-xl font-black uppercase italic">Configurações de Transmissão</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-white/40 uppercase mb-2 block">Servidor (RTMP Ingest URL)</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value="rtmp://liveshop.zen/live/ingest" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white/60"
                  />
                  <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <Copy size={20} className="text-white/40" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-white/40 uppercase mb-2 block">Chave de Transmissão</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    readOnly 
                    value="zen_live_xxxxxxxxxxxxxxxx" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white/60"
                  />
                  <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <Copy size={20} className="text-white/40" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex gap-4 items-start">
              <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-400/80 leading-relaxed">
                Use estas chaves no seu software de transmissão (OBS Studio, vMix) ou no app mobile Liveshop Zen. 
                Recomendamos 1080p, 30fps e bitrate de 4500kbps para melhor performance.
              </p>
            </div>
          </div>

          {/* Active Products in Live */}
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic">Produtos no Drop</h3>
              <button className="text-xs font-black text-[#a0fb00] hover:underline">+ ADICIONAR PRODUTO</button>
            </div>
            
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff" className="w-16 h-16 rounded-xl object-cover" alt="" />
                  <div className="flex-1">
                    <p className="font-bold">Zen Runner Pro v1</p>
                    <p className="text-xs text-white/40">R$ 899,00 • SKU: ZEN-RUN-01</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#a0fb00]/10 text-[#a0fb00] text-xs font-black rounded-lg">DESTACAR</button>
                    <button className="p-2 text-white/20 hover:text-red-400 transition-all">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Chat Preview */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl flex flex-col h-[600px] xl:h-auto">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h4 className="text-sm font-black uppercase italic">Chat em Tempo Real</h4>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-black text-white/40">12.4k ONLINE</span>
            </div>
          </div>
          
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
             {[
               { user: 'Vinao', msg: 'Qual o tamanho desse tênis?', color: '#a0fb00' },
               { user: 'Ana', msg: 'Entrega para o RJ?', color: '#fff' },
               { user: 'Beto', msg: 'Já garanti o meu! 🔥', color: '#fff' },
               { user: 'Carla', msg: 'Tem rosa?', color: '#fff' },
             ].map((chat, i) => (
               <div key={i} className="space-y-1">
                 <span className="text-[10px] font-black uppercase" style={{ color: chat.color }}>{chat.user}</span>
                 <p className="text-sm text-white/80">{chat.msg}</p>
               </div>
             ))}
          </div>

          <div className="p-4 bg-white/5 border-t border-white/5">
            <input 
              placeholder="Enviar mensagem como Loja..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
