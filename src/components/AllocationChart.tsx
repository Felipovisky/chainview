import React from 'react';
import type { CryptoAsset } from '../types/crypto';

interface Props {
  assets: CryptoAsset[];
}

export const AllocationChart: React.FC<Props> = ({ assets }) => {
  const validAssets = assets.filter(a => a.quantity > 0 && a.currentPrice > 0);
  
  const totalBalance = validAssets.reduce((acc, curr) => acc + (curr.quantity * curr.currentPrice), 0);
  const sortedAssets = [...validAssets].sort((a, b) => 
    (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice)
  );

  const chartData = sortedAssets.map(asset => {
    const val = asset.quantity * asset.currentPrice;
    const pct = totalBalance > 0 ? ((val / totalBalance) * 100).toFixed(1) : '0.0';
    return {
      name: asset.symbol,
      percentStr: `${pct}%`
    };
  });

  const COLORS = [
    '#f59e0b', '#3b82f6', '#10b981', '#a855f7', 
    '#f43f5e', '#06b6d4', '#6366f1', '#d946ef',
    '#84cc16', '#f97316', '#14b8a6', '#ec4899',
    '#eab308', '#2dd4bf', '#fb7185'
  ];

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 flex flex-col h-[620px] shadow-lg">
      <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Distribuição (%)</h3>
      
      <div className="flex-1 overflow-y-auto pr-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">Sem ativos</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {chartData.map((entry, index) => (
              <div 
                key={entry.name} 
                className="flex items-center gap-2 bg-[#0b0e14] border border-slate-800/60 rounded-lg px-3 py-2.5 hover:border-slate-700 transition-colors"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-xs font-bold text-slate-300 truncate" title={entry.name}>
                  {entry.name}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-auto">
                  {entry.percentStr}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};