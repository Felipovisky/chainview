import React from 'react';
import type { CryptoAsset } from '../types/crypto';
import { PieChart, ShieldCheck, Landmark, Rocket } from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
  variant?: 'compact' | 'full';
}

export const AllocationChart: React.FC<Props> = ({ assets, variant = 'full' }) => {
  const safeNum = (n: any) => (isNaN(Number(n)) ? 0 : Number(n));

  const totalBalance = assets.reduce((acc, curr) => {
    const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(curr.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(curr.symbol.toUpperCase());
    const price = isStable ? 1 : safeNum(curr.currentPrice);
    return acc + safeNum(curr.quantity) * price;
  }, 0);

  const categories = {
    caixa: { label: 'Caixa (Reservas)', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', solidBg: 'bg-emerald-500', assets: [] as any[], total: 0 },
    solidas: { label: 'Sólidas (Fundação)', icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', solidBg: 'bg-blue-500', assets: [] as any[], total: 0 },
    altcoins: { label: 'Altcoins (Risco)', icon: Rocket, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', solidBg: 'bg-amber-500', assets: [] as any[], total: 0 }
  };

  assets.forEach(asset => {
    const id = asset.id.toLowerCase();
    const sym = asset.symbol.toUpperCase();
    const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(id) || ['USDT', 'USDC', 'DAI'].includes(sym);
    const isSolid = ['bitcoin', 'ethereum'].includes(id) || ['BTC', 'ETH'].includes(sym);
    
    const price = isStable ? 1 : safeNum(asset.currentPrice);
    const value = safeNum(asset.quantity) * price;
    if (value <= 0) return;

    let catKey: keyof typeof categories = 'altcoins';
    if (isStable) catKey = 'caixa';
    else if (isSolid) catKey = 'solidas';

    categories[catKey].assets.push({ ...asset, value, percentage: (value / totalBalance) * 100 });
    categories[catKey].total += value;
  });

  Object.keys(categories).forEach(k => {
    const key = k as keyof typeof categories;
    categories[key].assets.sort((a, b) => b.percentage - a.percentage);
  });

  if (variant === 'compact') {
    return (
      <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
        {/* Título com tamanho corrigido (text-sm em vez de text-[11px]) */}
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <PieChart size={16} className="text-emerald-500" /> Distribuição Resumida
        </h3>
        <div className="space-y-3.5 w-full my-auto">
          {(Object.keys(categories) as Array<keyof typeof categories>).map(key => {
            const cat = categories[key];
            const catPct = totalBalance > 0 ? (cat.total / totalBalance) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex justify-between items-end mb-1 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <cat.icon size={13} className={cat.color} /> {cat.label}
                  </span>
                  <span className={`font-black ${cat.color}`}>{catPct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.solidBg} transition-all duration-500`} style={{ width: `${catPct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <PieChart size={18} className="text-emerald-500" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Distribuição por Risco</h3>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {(Object.keys(categories) as Array<keyof typeof categories>).map(key => {
          const cat = categories[key];
          const catPct = totalBalance > 0 ? (cat.total / totalBalance) * 100 : 0;
          const Icon = cat.icon;

          if (cat.assets.length === 0) return null;

          return (
            <div key={key} className={`border ${cat.border} rounded-xl p-4 bg-[#0b0e14]`}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className={`flex items-center gap-2 font-bold ${cat.color}`}>
                  <div className={`p-1.5 rounded-md ${cat.bg}`}><Icon size={16} /></div>
                  <span className="text-sm">{cat.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-black text-white">{catPct.toFixed(1)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {cat.assets.map(asset => (
                  <div key={asset.id} className="flex justify-between items-center bg-[#121824] border border-slate-800/60 p-2.5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#0b0e14] border border-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-300 relative overflow-hidden shrink-0">
                        <span className="absolute z-0">{asset.symbol.slice(0, 3)}</span>
                        <img 
                          src={(asset as any).imageUrl || `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} 
                          alt={asset.symbol}
                          className="w-full h-full object-cover relative z-10 bg-[#0b0e14]"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <span className="font-bold text-slate-300 text-xs">{asset.symbol}</span>
                    </div>
                    <span className="text-xs text-slate-400">{asset.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {totalBalance === 0 && (
          <div className="text-center text-slate-500 text-xs py-8">
            Adicione ativos para ver a sua distribuição.
          </div>
        )}
      </div>
    </div>
  );
};