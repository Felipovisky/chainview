import React from 'react';
import type { CryptoAsset } from '../types/crypto';
import { Trash2, BarChart2 } from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
  onRemove: (id: string) => void;
  onSelectAsset: (asset: CryptoAsset) => void;
}

export const PortfolioTable: React.FC<Props> = ({ assets, onRemove, onSelectAsset }) => {
  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-emerald-400">Lucros e Prejuízos</h3>
        <span className="text-[11px] text-slate-500">Clique no nome da moeda ou no gráfico para ver as transações</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0f141f] text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
            <tr>
              <th className="px-6 py-3">Ativo</th>
              <th className="px-6 py-3 text-right">Preço Atual</th>
              <th className="px-6 py-3 text-right">Quantidade</th>
              <th className="px-6 py-3 text-right">Aporte</th>
              <th className="px-6 py-3 text-right">Saldo</th>
              <th className="px-6 py-3 text-right">$ Médio</th>
              <th className="px-6 py-3 text-right">Lucro</th>
              <th className="px-6 py-3 text-right">% Lucro</th>
              <th className="px-6 py-3 text-center">Trend</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {assets.map((asset) => {
              const currentBalance = asset.quantity * asset.currentPrice;
              const avgPrice = asset.quantity > 0 ? asset.investedAmount / asset.quantity : 0;
              const profit = currentBalance - asset.investedAmount;
              const profitPercent = asset.investedAmount > 0 ? (profit / asset.investedAmount) * 100 : 0;
              const isProfitable = profit >= 0;

              return (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="hover:bg-slate-800/60 cursor-pointer transition-colors select-none group"
                >
                  <td className="px-6 py-4 font-sans font-medium text-white">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsset(asset);
                      }}
                      className="flex items-center gap-2.5 text-left hover:text-emerald-400 transition"
                    >
                      <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-emerald-400 group-hover:border-emerald-500/50 transition">
                        {asset.symbol.slice(0, 3)}
                      </span>
                      <div>
                        <span className="font-semibold block leading-tight">{asset.name}</span>
                        <span className="text-slate-500 text-[11px] font-mono font-normal">· {asset.symbol}</span>
                      </div>
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">${asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  {/* Linha da quantidade corrigida para max de 5 casas decimais */}
                  <td className="px-6 py-4 text-right">{asset.quantity.toLocaleString('en-US', { maximumFractionDigits: 5 })}</td>
                  <td className="px-6 py-4 text-right">${asset.investedAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-white">${currentBalance.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-amber-400/90">${avgPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  
                  <td className={`px-6 py-4 text-right font-medium ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfitable ? '+' : ''}${profit.toFixed(2)}
                  </td>
                  
                  <td className={`px-6 py-4 text-right font-medium ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfitable ? '+' : ''}{profitPercent.toFixed(2)}%
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {asset.trend}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center font-sans">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(asset);
                        }}
                        className="hover:text-emerald-400 p-1 rounded hover:bg-slate-700/50 transition"
                        title="Ver Histórico de Transações"
                      >
                        <BarChart2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(asset.id);
                        }}
                        className="hover:text-rose-400 p-1 rounded hover:bg-slate-700/50 transition"
                        title="Remover Criptomoeda"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};