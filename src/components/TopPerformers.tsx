import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';
interface Props {
assets: CryptoAsset[];
}
export const TopPerformers: React.FC<Props> = ({ assets }) => {
const safeNum = (n: any) => (isNaN(Number(n)) ? 0 : Number(n));
const performaceData = assets.map(asset => {
const invested = safeNum(asset.investedAmount);
const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(asset.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(asset.symbol.toUpperCase());
const currentPrice = isStable ? 1 : safeNum(asset.currentPrice);
const currentValue = safeNum(asset.quantity) * currentPrice;
    const profit = currentValue - invested;
    const profitPct = invested > 0 ? (profit / invested) * 100 : 0;
    
    return { ...asset, profit, profitPct };
}).filter(a => safeNum(a.quantity) > 0.000001 && a.investedAmount > 0);
const topGainers = [...performaceData].filter(a => a.profit > 0).sort((a, b) => b.profit - a.profit).slice(0, 5);
const topLosers = [...performaceData].filter(a => a.profit < 0).sort((a, b) => a.profit - b.profit).slice(0, 5);
const formatUsd = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
return (
<div className="bg-[#121824] border border-slate-800/80 rounded-xl p-4 shadow-lg">
<h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Top 5 Movimentações</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
            <TrendingUp size={14} /> Maiores Lucros
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {topGainers.length === 0 ? (
              <div className="col-span-5 text-slate-500 text-xs py-1">Sem ativos com lucro no momento.</div>
            ) : (
              topGainers.map(asset => (
                <div key={asset.id} className="bg-[#0b0e14] border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between text-center hover:border-slate-700 transition-colors">
                  <div className="font-bold text-slate-200 text-xs">{asset.symbol}</div>
                  <div>
                    <div className="text-emerald-400 font-bold text-xs">{formatUsd(asset.profit)}</div>
                    <div className="text-[10px] text-emerald-500/70 font-medium">+{asset.profitPct.toFixed(1)}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">
            <TrendingDown size={14} /> Maiores Prejuízos
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {topLosers.length === 0 ? (
              <div className="col-span-5 text-slate-500 text-xs py-1">Sem ativos com prejuízo no momento.</div>
            ) : (
              topLosers.map(asset => (
                <div key={asset.id} className="bg-[#0b0e14] border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between text-center hover:border-slate-700 transition-colors">
                  <div className="font-bold text-slate-200 text-xs">{asset.symbol}</div>
                  <div>
                    <div className="text-rose-400 font-bold text-xs">{formatUsd(asset.profit)}</div>
                    <div className="text-[10px] text-rose-500/70 font-medium">{asset.profitPct.toFixed(1)}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
);
};