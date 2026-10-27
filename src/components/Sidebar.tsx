import React from 'react';
import { LayoutDashboard, Settings, LogOut, Plus, Trash2, Wallet } from 'lucide-react';
import { BackupManager } from './BackupManager';

interface Portfolio {
  name: string;
  color: string;
  balance: number;
}

interface Props {
  totalBalance: number;
  portfolios: Portfolio[];
  activePortfolio: string | null;
  onSelectPortfolio: (name: string | null) => void;
  onCreatePortfolio: () => void;
  onDeletePortfolio: (name: string) => void;
}

export const Sidebar: React.FC<Props> = ({
  totalBalance,
  portfolios,
  activePortfolio,
  onSelectPortfolio,
  onCreatePortfolio,
  onDeletePortfolio
}) => {
  const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <aside className="w-20 xl:w-64 bg-[#0d1117] border-r border-slate-800/80 flex flex-col justify-between h-screen select-none shrink-0 transition-all duration-300">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-center xl:justify-start gap-3 p-4 xl:p-5 border-b border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
            ⚡
          </div>
          <span className="font-semibold text-lg tracking-wide text-white hidden xl:block">ChainView</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <nav className="space-y-1">
            <button 
              onClick={() => onSelectPortfolio(null)}
              className={`w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
                activePortfolio === null 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard size={18} className="shrink-0" />
              <div className="hidden xl:flex flex-col items-start">
                <span>Visão Geral</span>
                <span className="text-[10px] opacity-70 font-mono">{formatCurrency(totalBalance)}</span>
              </div>
            </button>
          </nav>

          <div className="pt-2">
            <div className="hidden xl:flex items-center justify-between px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Meus Portfólios ({portfolios.length})</span>
            </div>
            
            <nav className="space-y-1">
              {portfolios.map(p => (
                <div key={p.name} className="relative group flex items-center">
                  <button
                    onClick={() => onSelectPortfolio(p.name)}
                    className={`w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2 rounded-lg transition ${
                      activePortfolio === p.name 
                        ? 'bg-slate-800/80 text-white' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${p.color} shadow-inner`}>
                      <Wallet size={12} className="text-white/80" />
                    </div>
                    <div className="hidden xl:flex flex-col items-start truncate pr-6">
                      <span className="text-sm truncate w-32 text-left">{p.name}</span>
                      <span className="text-[10px] opacity-70 font-mono">{formatCurrency(p.balance)}</span>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeletePortfolio(p.name); }}
                    className="absolute right-2 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded opacity-0 group-hover:opacity-100 transition hidden xl:flex"
                    title={`Eliminar ${p.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button 
                onClick={onCreatePortfolio}
                className="w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2 mt-2 text-slate-400 hover:text-emerald-400 transition text-sm group"
              >
                <div className="w-5 h-5 rounded border border-slate-700 border-dashed flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition shrink-0">
                  <Plus size={14} />
                </div>
                <span className="hidden xl:block">Criar portfólio</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800/40 space-y-4">
        <BackupManager />
        
        <div className="space-y-1">
          <a href="#" className="flex items-center justify-center xl:justify-start gap-3 px-3 py-2 text-slate-400 hover:text-white transition text-sm rounded-lg hover:bg-slate-800/50" title="Configurações">
            <Settings size={18} className="shrink-0" />
            <span className="hidden xl:block">Configurações</span>
          </a>
          <a href="#" className="flex items-center justify-center xl:justify-start gap-3 px-3 py-2 text-rose-400 hover:text-rose-300 transition text-sm rounded-lg hover:bg-rose-500/10" title="Sair">
            <LogOut size={18} className="shrink-0" />
            <span className="hidden xl:block">Sair</span>
          </a>
        </div>
      </div>
    </aside>
  );
};