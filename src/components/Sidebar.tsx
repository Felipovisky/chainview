import React from 'react';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0d1117] border-r border-slate-800/80 flex flex-col justify-between p-4 h-screen select-none shrink-0">
      <div>
        {/* Cabeçalho do Menu */}
        <div className="flex items-center gap-3 px-3 pt-3 pb-6 mb-3 border-b border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shadow-inner">
            ⚡
          </div>
          <span className="font-semibold text-lg tracking-wide text-white">ChainView</span>
        </div>

        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium">
            <LayoutDashboard size={18} />
            Portfolio
          </a>
        </nav>
      </div>

      <div className="space-y-1 border-t border-slate-800/80 pt-4">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition text-sm">
          <Settings size={18} />
          Configurações
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-rose-400 hover:text-rose-300 transition text-sm">
          <LogOut size={18} />
          Sair
        </a>
      </div>
    </aside>
  );
};