export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-white/5 p-6 hidden md:block">
        <div className="text-neon font-bold text-xl mb-12">LiveShop Admin</div>
        <nav className="space-y-4">
          <div className="text-neon/60 text-sm font-medium">MENU</div>
          <div className="text-white/80 hover:text-white cursor-pointer">Dashboard</div>
          <div className="text-white/80 hover:text-white cursor-pointer">Lives & Vídeos</div>
          <div className="text-white/80 hover:text-white cursor-pointer">Produtos (Bling)</div>
          <div className="text-white/80 hover:text-white cursor-pointer">Afiliados</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Visão Geral</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">Tenant ID: dev-preview</span>
            <div className="w-10 h-10 rounded-full bg-neon/20 border border-neon/40" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="liquid-glass p-6 rounded-liquid-2xl border border-white/5">
            <div className="text-zinc-500 text-sm mb-1">Vendas Hoje</div>
            <div className="text-2xl font-bold text-neon">R$ 12.450,00</div>
          </div>
          <div className="liquid-glass p-6 rounded-liquid-2xl border border-white/5">
            <div className="text-zinc-500 text-sm mb-1">Live Viewers</div>
            <div className="text-2xl font-bold">1.240</div>
          </div>
          <div className="liquid-glass p-6 rounded-liquid-2xl border border-white/5">
            <div className="text-zinc-500 text-sm mb-1">Conversão</div>
            <div className="text-2xl font-bold text-neon">4.8%</div>
          </div>
        </div>

        <div className="mt-12 liquid-glass p-8 rounded-liquid-2xl border border-white/5 min-h-[300px] flex items-center justify-center">
          <p className="text-zinc-600 italic">Módulos do dashboard em construção...</p>
        </div>
      </main>
    </div>
  );
}
