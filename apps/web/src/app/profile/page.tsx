'use client';

import { OrderItem, GlassPanel, NeonButton, ProfileStat } from '@liveshop/liquidos-ui';
import { 
  Settings, 
  ChevronRight, 
  Package, 
  Star, 
  ShieldCheck, 
  LogOut,
  ChevronLeft,
  ShoppingBag,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchUserOrders } from '@/lib/services';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);
      const ordersData = await fetchUserOrders();
      setOrders(ordersData);
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-[#a0fb00] font-black italic animate-pulse">Sincronizando Perfil...</div>;

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Zen Member';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-32">
      
      {/* 🔮 AMBIENT GLOW */}
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#a0fb00]/5 blur-[120px] pointer-events-none -z-10" />

      {/* 🏷️ HEADER */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-black italic uppercase tracking-tight">Meu Perfil</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
          <Settings className="w-5 h-5 text-white/40" />
        </button>
      </header>

      <main className="p-6 flex flex-col gap-8 max-w-2xl mx-auto w-full">
        
        {/* 👤 USER INFO */}
        <section className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#a0fb00] to-blue-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                <img 
                  src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${userDisplayName}&background=a0fb00&color=000`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#a0fb00] rounded-full border-4 border-[#0a0a0a] flex items-center justify-center">
              <Award className="w-4 h-4 text-black" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">{userDisplayName}</h2>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Membro Pro • Nível {Math.floor(orders.length / 5) + 1}</p>
          </div>
        </section>

        {/* 📊 STATS */}
        <section className="flex gap-4">
          <ProfileStat icon={<Package className="w-4 h-4" />} label="Pedidos" value={orders.length.toString()} />
          <ProfileStat icon={<Star className="w-4 h-4" />} label="Pontos" value={(orders.length * 100).toString()} />
          <ProfileStat icon={<ShoppingBag className="w-4 h-4" />} label="Drops" value="8" />
        </section>

        {/* 📦 ORDER HISTORY */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-end px-1">
            <h2 className="text-xs font-black italic uppercase tracking-widest text-white/40">Últimos Pedidos</h2>
            <span className="text-[10px] font-black text-[#a0fb00] uppercase tracking-widest">Ver Tudo</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {orders.length > 0 ? orders.slice(0, 5).map((order) => (
              <OrderItem 
                key={order.id}
                id={order.id.split('-')[0].toUpperCase()}
                date={new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                status={order.order_status}
                total={order.gross_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                itemsCount={1}
              />
            )) : (
              <div className="py-8 text-center text-white/20 font-black italic uppercase tracking-widest border border-dashed border-white/10 rounded-[32px]">
                Nenhum pedido realizado
              </div>
            )}
          </div>
        </section>

        {/* 🚪 ACTIONS */}
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 py-4 rounded-3xl border border-white/5 bg-white/5 text-red-500 font-black italic uppercase tracking-widest text-[10px] hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>

      </main>
    </div>
  );
}

    </div>
  );
}
