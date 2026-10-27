import React, { useMemo } from 'react';
import type { CryptoAsset } from '../types/crypto';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
}

export const TopPerformers: React.FC<Props> = ({ assets }) => {
  const { topWinners, topLosers } = useMemo(() => {
    if (!assets || assets.length === 0) return { topWinners: [], topLosers: [] };

    const perf = assets
      .filter(a => a.symbol !== 'USDT' && a.symbol !== 'USDC')
      .map(a => {
        const invested = Number(a.investedAmount) || 0;
        const currentVal = Number(a.quantity) * Number(a.currentPrice);
        const profit = currentVal - invested;
        const profitPct = invested > 0 ? (profit / invested) * 100 : 0;
        return { ...a, profit, profitPct };
      })
      .sort((a, b) => b.profit - a.profit);

    const winners = perf.filter(a => a.profit > 0).slice(0, 3);
    const losers = perf.filter(a => a.profit < 0).reverse().slice(0, 3);

    return { topWinners: winners, topLosers: losers };
  }, [assets]);

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 flex flex-col shadow-lg">
      <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Top 3 Movimentações</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 md:divide-x md:divide-slate-800/60">
        
        {/* Bloco de Maiores Lucros */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-4 uppercase tracking-wider">
            <TrendingUp size={16} /> Maiores Lucros
          </div>
          <div className="space-y-3">
            {topWinners.length > 0 ? topWinners.map(asset => (
              <div key={asset.id} className="flex items-center justify-between bg-[#0b0e14] p-3.5 rounded-lg border border-slate-800/50 hover:border-emerald-500/30 transition-colors">
                <span className="text-sm font-bold text-slate-200">{asset.symbol}</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">+${asset.profit.toFixed(2)}</div>
                  <div className="text-xs font-medium text-emerald-500/70">+{asset.profitPct.toFixed(2)}%</div>
                </div>
              </div>
            )) : (
              <div className="text-xs text-slate-500 italic py-6 text-center bg-[#0b0e14] rounded-lg border border-slate-800/30">Nenhum ativo em lucro.</div>
            )}
          </div>
        </div>

        {/* Bloco de Maiores Prejuízos */}
        <div className="flex flex-col md:pl-8">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-4 uppercase tracking-wider">
            <TrendingDown size={16} /> Maiores Prejuízos
          </div>
          <div className="space-y-3">
            {topLosers.length > 0 ? topLosers.map(asset => (
              <div key={asset.id} className="flex items-center justify-between bg-[#0b0e14] p-3.5 rounded-lg border border-slate-800/50 hover:border-rose-500/30 transition-colors">
                <span className="text-sm font-bold text-slate-200">{asset.symbol}</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-rose-400">-${Math.abs(asset.profit).toFixed(2)}</div>
                  <div className="text-xs font-medium text-rose-500/70">{asset.profitPct.toFixed(2)}%</div>
                </div>
              </div>
            )) : (
              <div className="text-xs text-slate-500 italic py-6 text-center bg-[#0b0e14] rounded-lg border border-slate-800/30">Nenhum ativo em prejuízo.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};