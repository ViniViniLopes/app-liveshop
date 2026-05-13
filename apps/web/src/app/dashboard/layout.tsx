import React from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-8">
          <div className="text-live-neon font-black text-2xl tracking-tighter">LIVESHOP</div>
          <div className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] mt-1">TENANT ADMIN</div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem href="/dashboard" icon="📊" label="Visão Geral" active />
          <NavItem href="/dashboard/media" icon="🎬" label="Lives & Vídeos" />
          <NavItem href="/dashboard/products" icon="📦" label="Produtos" />
          <NavItem href="/dashboard/affiliates" icon="🤝" label="Afiliados" />
          <NavItem href="/dashboard/orders" icon="💰" label="Vendas" />
          
          <div className="pt-8 pb-2 px-4 text-[10px] text-zinc-600 font-bold tracking-widest uppercase">
            Configurações
          </div>
          <NavItem href="/dashboard/branding" icon="🎨" label="Marca & Cores" />
          <NavItem href="/dashboard/domain" icon="🌐" label="Domínio" />
          <NavItem href="/dashboard/integrations" icon="🔌" label="Integrações" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="liquid-glass p-4 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-live-neon/20 border border-live-neon/30 flex items-center justify-center text-xs">V</div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-bold truncate">Vinao Studio</div>
              <div className="text-[10px] text-zinc-500 truncate">Plano Pro</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/50 backdrop-blur-md sticky top-0 z-40">
          <div className="text-sm text-zinc-400 font-medium">Dashboard / Visão Geral</div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-1.5 border border-white/20 rounded-lg text-sm hover:bg-white/5 transition-colors">Ver Loja</button>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-liquid-xl text-sm font-medium transition-colors",
        active ? "bg-white/5 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"
      )}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}

// Utility local copy of cn (since this is in apps/web)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
