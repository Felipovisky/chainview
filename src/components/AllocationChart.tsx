import React from 'react';
import type { CryptoAsset } from '../types/crypto';

interface Props {
  assets: CryptoAsset[];
}

export const AllocationChart: React.FC<Props> = ({ assets }) => {
  const totalBalance = assets.reduce((acc, curr) => acc + curr.quantity * curr.currentPrice, 0);

  const colors = ['bg-amber-500', 'bg-indigo-500', 'bg-sky-400', 'bg-pink-500', 'bg-emerald-500'];

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-white mb-4">Distribuição</h3>
      <div className="space-y-3 font-sans">
        {assets.map((asset, index) => {
          const balance = asset.quantity * asset.currentPrice;
          const percentage = totalBalance > 0 ? (balance / totalBalance) * 100 : 0;
          const color = colors[index % colors.length];

          return (
            <div key={asset.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{asset.name}</span>
                <span className="text-slate-400 font-mono">${balance.toFixed(2)} ({percentage.toFixed(2)}%)</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};