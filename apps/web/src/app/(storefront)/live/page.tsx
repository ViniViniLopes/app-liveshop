'use client';

import React, { useState } from 'react';
import { 
  GlassPanel, 
  NeonButton, 
  StatusBadge, 
  ProductDetailSheet 
} from '@liveshop/liquidos-ui';
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  ShoppingBag, 
  X,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { fetchLiveSessions } from '@/lib/services';
import type { LiveSession, MediaItem } from '@liveshop/database/src/types';

export default function LiveFeedPage() {
  const [showProduct, setShowProduct] = useState(false);
  const [sessions, setSessions] = useState<(LiveSession & { media_items: MediaItem })[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const data = await fetchLiveSessions();
      setSessions(data);
      setLoading(false);

      if (data[0]) {
        // Subscrever ao canal de Realtime para esta Live
        const channel = supabase.channel(`live-${data[0].id}`, {
          config: { broadcast: { self: true } }
        });

        channel
          .on('broadcast', { event: 'message' }, ({ payload }) => {
            setMessages(prev => [...prev.slice(-20), payload]);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };
    loadData();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessions[0]) return;

    const messagePayload = {
      id: Date.now(),
      text: newMessage,
      user: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anônimo',
      avatar: user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email || 'A'}&background=a0fb00&color=000`
    };

    await supabase.channel(`live-${sessions[0].id}`).send({
      type: 'broadcast',
      event: 'message',
      payload: messagePayload
    });

    setNewMessage('');
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-[#a0fb00] font-black italic animate-pulse">Sintonizando...</div>;
  
  const currentLive = sessions[0];
  if (!currentLive) return <div className="h-screen bg-black flex items-center justify-center text-white/40 font-black italic uppercase tracking-widest">Nenhuma Live no Momento</div>;

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 📹 BACKGROUND VIDEO SIMULATOR */}
      <div className="absolute inset-0 z-0">
        <img 
          src={currentLive.media_items?.thumbnail_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} 
          className="w-full h-full object-cover opacity-80"
          alt={currentLive.title}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* 🏷️ TOP INFO */}
      <header className="absolute top-0 left-0 w-full p-6 pt-12 flex justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          <StatusBadge label="Ao Vivo" active />
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-5 h-5 rounded-full bg-white/20" />
            <span className="text-xs font-bold text-white">@fashion_model</span>
          </div>
        </div>
        
        <Link href="/" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
          <X className="w-5 h-5" />
        </Link>
      </header>

      {/* 🛒 FLOATING PRODUCT CARD */}
      <div className="absolute bottom-32 left-6 right-6 z-10">
        <GlassPanel 
          className="p-4 flex items-center gap-4 cursor-pointer animate-in slide-in-from-bottom duration-500"
          onClick={() => setShowProduct(true)}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden shrink-0">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiKOByfdcvXDwuCasXfYjgvQBUzOjNiWmUa5CVKLwHyS2wtI1JH-3jNL704oUPLIK6rZhuG1rvtz5yusmJJ-E25uFsFTC9aNDi9-wvM-e9r1J8NYQXvOY5CiIO4RVC4zOFjNvtaSPauMP5-oyCFULQXzcZE4FjnLE2T9sW0kFqTc05s3yT_6jTdRtyHxL671zetLl5MTW0ovDMR_HPmc2gFyO3mc1nIANbgamOddJiwQuKyGkid7cQNmCWFVsynFLGol4n9Ti4DLA" className="w-full h-full object-cover" alt="Product" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#a0fb00] mb-1">Destaque da Live</h3>
            <p className="text-sm font-bold text-white truncate">Tênis CyberX Runner</p>
            <p className="text-xs text-white/60 font-bold">R$ 499,00</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/20" />
        </GlassPanel>
      </div>

      {/* 💬 CHAT OVERLAY */}
      <div className="absolute bottom-32 left-0 w-full px-6 z-20 pointer-events-none">
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar pointer-events-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 animate-in slide-in-from-left duration-300">
              <img src={msg.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="Avatar" />
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-[20px] rounded-tl-none border border-white/5 max-w-[80%]">
                <p className="text-[10px] font-black text-[#a0fb00] uppercase tracking-tighter mb-0.5">{msg.user}</p>
                <p className="text-sm text-white/90 font-medium leading-tight">{msg.text}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5 self-start">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Silêncio no chat... comece a conversa!</p>
            </div>
          )}
        </div>
      </div>

      {/* ⌨️ CHAT INPUT */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Diga algo..." 
              className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-full py-4 px-6 text-sm focus:outline-none focus:border-[#a0fb00]/50 transition-all pr-12"
            />
            <button 
              onClick={sendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#a0fb00] rounded-full flex items-center justify-center text-black"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={() => setShowProduct(true)}
            className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse"
          >
            <ShoppingBag className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* 🛍️ PRODUCT DETAIL SHEET */}
      {showProduct && (
        <ProductDetailSheet 
          onClose={() => setShowProduct(false)}
          onAddToCart={() => {
            alert('Adicionado ao carrinho!');
            setShowProduct(false);
          }}
        />
      )}

    </div>
  );
}
