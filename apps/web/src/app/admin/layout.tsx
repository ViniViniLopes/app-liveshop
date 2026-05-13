import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Box, Video, Users, Settings, LogOut, Package } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col">
        <div className="p-8 border-bottom border-white/5">
          <h1 className="text-xl font-black italic text-[#a0fb00] tracking-tighter">
            ZEN <span className="text-white">ADMIN</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-[#a0fb00] font-bold">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/admin/inventory" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Box size={20} />
            Estoque
          </Link>
          <Link href="/admin/live-studio" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Video size={20} />
            Live Studio
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Package size={20} />
            Pedidos
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Users size={20} />
            Equipe
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-all">
            <Settings size={20} />
            Configurações
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all mt-2">
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
