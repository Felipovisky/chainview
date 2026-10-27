import React from 'react';
import type { CryptoAsset } from '../types/crypto';
import { Trash2, BarChart2, Wallet } from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
  onRemove: (id: string) => void;
  onSelectAsset: (asset: CryptoAsset) => void;
}

export const PortfolioTable: React.FC<Props> = ({ assets, onRemove, onSelectAsset }) => {
  // Separamos automaticamente o dinheiro de Caixa dos Investimentos Voláteis
  const cashAssets = assets.filter(a => ['USDT', 'USDC'].includes(a.symbol));
  const cryptoAssets = assets.filter(a => !['USDT', 'USDC'].includes(a.symbol));

  // Criámos uma função isolada para desenhar as linhas e evitar código repetido
  const renderAssetRow = (asset: CryptoAsset, isCash: boolean) => {
    const currentBalance = asset.quantity * asset.currentPrice;
    const avgPrice = asset.quantity > 0 ? asset.investedAmount / asset.quantity : 0;
    const profit = currentBalance - asset.investedAmount;
    const profitPercent = asset.investedAmount > 0 ? (profit / asset.investedAmount) * 100 : 0;
    const isProfitable = profit >= 0;

    return (
      <tr
        key={asset.id}
        onClick={() => onSelectAsset(asset)}
        className="hover:bg-slate-800/40 cursor-pointer transition-colors select-none group"
      >
        <td className="px-4 py-4 font-sans font-medium text-white">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectAsset(asset);
            }}
            className="flex items-center gap-2.5 text-left hover:text-emerald-400 transition"
          >
            <span className={`w-7 h-7 rounded-full bg-slate-800 border flex items-center justify-center text-[10px] font-bold shrink-0 ${isCash ? 'text-amber-400 border-amber-500/30' : 'text-emerald-400 border-slate-700'}`}>
              {asset.symbol.slice(0, 3)}
            </span>
            <div>
              <span className="font-bold block leading-tight whitespace-nowrap">{asset.name}</span>
              <span className="text-slate-500 text-[10px] font-mono font-normal">
                {isCash ? 'CAIXA LIVRE' : `· ${asset.symbol}`}
              </span>
            </div>
          </button>
        </td>

        <td className="px-4 py-4 text-right text-slate-400">
          ${asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
        </td>
        <td className="px-4 py-4 text-right text-slate-200">
          {asset.quantity.toLocaleString('en-US', { maximumFractionDigits: 5 })}
        </td>
        <td className="px-4 py-4 text-right text-slate-300">
          ${asset.investedAmount.toFixed(2)}
        </td>
        <td className="px-4 py-4 text-right font-bold text-white">
          ${currentBalance.toFixed(2)}
        </td>
        
        <td className="px-4 py-4 text-right text-amber-400/90">
          {isCash ? <span className="text-slate-600">-</span> : `$${avgPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`}
        </td>
        
        <td className={`px-4 py-4 text-right font-medium whitespace-nowrap ${isCash ? 'text-slate-600' : isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isCash ? '-' : `${isProfitable ? '+' : ''}$${profit.toFixed(2)}`}
        </td>
        
        <td className={`px-4 py-4 text-right font-bold whitespace-nowrap ${isCash ? 'text-slate-600' : isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isCash ? '-' : `${isProfitable ? '+' : ''}${profitPercent.toFixed(2)}%`}
        </td>

        <td className="px-4 py-4 text-center">
          {isCash ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-slate-800/50 text-slate-500 border border-slate-700/50">
              ESTÁVEL
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
              {asset.trend}
            </span>
          )}
        </td>

        <td className="px-4 py-4 text-center font-sans">
          <div className="flex items-center justify-center gap-2 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={(e) => { e.stopPropagation(); onSelectAsset(asset); }} className="hover:text-emerald-400 p-1.5 rounded-md hover:bg-slate-800 transition" title="Ver Histórico">
              <BarChart2 size={15} />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(asset.id); }} className="hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-800 transition" title="Remover Ativo">
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0d1117]/50">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Seus Ativos</h3>
        <span className="text-[11px] text-slate-500 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
          Clique numa moeda para ver o histórico
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0f141f] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
            <tr>
              <th className="px-4 py-3 font-bold">Ativo</th>
              <th className="px-4 py-3 text-right font-bold">Cotação Atual</th>
              <th className="px-4 py-3 text-right font-bold">Quantidade</th>
              <th className="px-4 py-3 text-right font-bold">Aporte Total</th>
              <th className="px-4 py-3 text-right font-bold">Saldo (Valor)</th>
              <th className="px-4 py-3 text-right font-bold">Preço Médio</th>
              <th className="px-4 py-3 text-right font-bold">Lucro ($)</th>
              <th className="px-4 py-3 text-right font-bold">Lucro (%)</th>
              <th className="px-4 py-3 text-center font-bold">Trend</th>
              <th className="px-4 py-3 text-center font-bold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            
            {/* SECÇÃO 1: CAIXA LIVRE */}
            {cashAssets.length > 0 && (
              <>
                <tr className="bg-[#0a0d12]">
                  <td colSpan={10} className="px-4 py-3 border-y border-slate-800/60">
                    <div className="flex items-center gap-2 font-sans text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">
                      <Wallet size={14} /> Saldo Disponível (Caixa)
                    </div>
                  </td>
                </tr>
                {cashAssets.map(asset => renderAssetRow(asset, true))}
              </>
            )}

            {/* SECÇÃO 2: CRIPTOATIVOS VOLÁTEIS */}
            {cryptoAssets.length > 0 && (
              <>
                <tr className="bg-[#0a0d12]">
                  <td colSpan={10} className="px-4 py-3 border-y border-slate-800/60">
                    <div className="flex items-center gap-2 font-sans text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
                      <BarChart2 size={14} /> Criptoativos Voláteis
                    </div>
                  </td>
                </tr>
                {cryptoAssets.map(asset => renderAssetRow(asset, false))}
              </>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
};