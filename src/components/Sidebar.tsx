import React from 'react';
import {
LayoutDashboard, Plus, Download, Upload,
Settings, LogOut, Trash2, Zap, ChevronLeft, ChevronRight, Folder
} from 'lucide-react';
interface Props {
totalBalance: number;
portfolios: { name: string; color: string; balance: number }[];
activePortfolio: string | null;
onSelectPortfolio: (name: string | null) => void;
onCreatePortfolio: () => void;
onDeletePortfolio: (name: string) => void;
isPrivacyMode?: boolean;
isCollapsed: boolean;
onToggleCollapse: () => void;
onExport: () => void;
onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export const Sidebar: React.FC<Props> = ({
totalBalance,
portfolios,
activePortfolio,
onSelectPortfolio,
onCreatePortfolio,
onDeletePortfolio,
isPrivacyMode = false,
isCollapsed,
onToggleCollapse,
onExport,
onImport
}) => {
const formatCurrency = (val: number) => {
if (isPrivacyMode) return '••••••';
return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};
return (
<aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0d1117] border-r border-slate-800/80 flex flex-col transition-all duration-300 z-20 shrink-0 relative`}>
{/* Botão de Retrair */}
<button onClick={onToggleCollapse} className="absolute -right-3 top-8 bg-[#121824] border border-slate-700 text-slate-400 hover:text-white p-1 rounded-full z-30 shadow-lg hover:bg-slate-800 transition-colors">
{isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
</button>
      {/* Header Logo */}
      <div className="h-20 flex items-center justify-center px-4 border-b border-slate-800/80">
        <div className={`flex items-center gap-3 overflow-hidden transition-all ${isCollapsed ? 'w-8' : 'w-full'}`}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Zap size={20} className="fill-current" />
          </div>
          {!isCollapsed && (
            <span className="font-black text-xl text-white tracking-tight shrink-0">ChainView</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-8 scrollbar-hide">
        
        {/* Visão Geral (Todos os Portfólios) */}
        <div>
          <button
            onClick={() => onSelectPortfolio(null)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-3'} rounded-xl transition-all ${
              activePortfolio === null 
                ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-sm' 
                : 'hover:bg-slate-800/50 border border-transparent'
            }`}
            title={isCollapsed ? "Visão Geral" : ""}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <LayoutDashboard size={18} className={`shrink-0 ${activePortfolio === null ? 'text-emerald-400' : 'text-slate-400'}`} />
              {!isCollapsed && (
                <div className="text-left shrink-0">
                  <div className={`font-bold text-sm ${activePortfolio === null ? 'text-emerald-400' : 'text-slate-200'}`}>Visão Geral</div>
                  <div className="text-xs text-slate-500 font-medium">{formatCurrency(totalBalance)}</div>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Meus Portfólios */}
        <div>
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-3 flex justify-between items-center">
              Meus Portfólios ({portfolios.length})
            </div>
          )}
          
          <div className="space-y-1">
            {portfolios.map(portfolio => {
              const isActive = activePortfolio === portfolio.name;
              return (
                <div key={portfolio.name} className="relative group">
                  <button
                    onClick={() => onSelectPortfolio(portfolio.name)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'} rounded-lg transition-all ${
                      isActive 
                        ? 'bg-slate-800 border border-slate-700' 
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                    title={isCollapsed ? portfolio.name : ""}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${portfolio.color}`}>
                        <Folder size={12} className="text-white" />
                      </div>
                      {!isCollapsed && (
                        <div className="text-left shrink-0">
                          <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'}`}>
                            {portfolio.name}
                          </div>
                          <div className="text-xs text-slate-500">{formatCurrency(portfolio.balance)}</div>
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {!isCollapsed && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeletePortfolio(portfolio.name); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 rounded opacity-0 group-hover:opacity-100 transition-all"
                      title="Eliminar Carteira"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              onClick={onCreatePortfolio}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all mt-2`}
              title={isCollapsed ? "Criar portfólio" : ""}
            >
              <div className="w-5 h-5 rounded border border-slate-600 border-dashed flex items-center justify-center shrink-0">
                <Plus size={12} />
              </div>
              {!isCollapsed && <span className="text-sm font-medium">Criar portfólio</span>}
            </button>
          </div>
        </div>

        {/* Backup e Segurança */}
        <div className="mt-auto pt-6 border-t border-slate-800/60">
          {!isCollapsed && <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Backup e Segurança</div>}
          <div className="space-y-1">
            <button onClick={onExport} className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition group`} title={isCollapsed ? "Exportar Dados" : ""}>
              <Download size={18} className="shrink-0 group-hover:text-emerald-400 transition-colors" />
              {!isCollapsed && <span className="text-sm font-medium">Exportar Dados</span>}
            </button>
            
            <label className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition cursor-pointer group`} title={isCollapsed ? "Importar Dados" : ""}>
              <Upload size={18} className="shrink-0 group-hover:text-emerald-400 transition-colors" />
              {!isCollapsed && <span className="text-sm font-medium">Importar Dados</span>}
              <input type="file" accept=".json" className="hidden" onChange={onImport} />
            </label>
          </div>
        </div>

        {/* Sistema */}
        <div className="pt-2">
          <div className="space-y-1">
            <button className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition group`} title={isCollapsed ? "Configurações" : ""}>
              <Settings size={18} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
            </button>
            <button className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition group`} title={isCollapsed ? "Sair" : ""}>
              <LogOut size={18} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
);
};