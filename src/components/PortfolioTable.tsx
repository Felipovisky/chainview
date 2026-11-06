import React, { useState, useEffect } from 'react';
import { Trash2, TrendingUp, TrendingDown, Minus, BarChart3, Edit2, ArrowLeftRight, Zap, Target, ShieldAlert, HelpCircle } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';
interface Props {
assets: CryptoAsset[];
onRemove: (id: string) => void;
onSelectAsset: (asset: CryptoAsset) => void;
onEditAsset?: (asset: CryptoAsset) => void;
onSwapAsset?: (asset: CryptoAsset) => void;
}
type Timeframe = '24h' | '7d' | '30d' | '1y';
const TooltipHeader = ({ title, tooltip }: { title: string, tooltip: string }) => (
<div className="group relative inline-flex items-center gap-1 cursor-help">
    <span className="border-b border-dashed border-slate-600 pb-0.5">{title}</span>
    <HelpCircle size={12} className="text-slate-500" />
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl text-xs text-slate-200 font-normal normal-case leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-t border-l border-slate-700 transform rotate-45"></div>
      <span className="relative z-10">{tooltip}</span>
    </div>
  </div>
);
export const PortfolioTable: React.FC<Props> = ({ assets, onRemove, onSelectAsset, onEditAsset, onSwapAsset }) => {
const [timeframe, setTimeframe] = useState<Timeframe>(() => {
const saved = localStorage.getItem('chainview_table_timeframe');
return (saved as Timeframe) || '24h';
});
useEffect(() => {
localStorage.setItem('chainview_table_timeframe', timeframe);
}, [timeframe]);
const safeNum = (val: any) => {
const num = Number(val);
return isNaN(num) ? 0 : num;
};
const formatCurrency = (value: number) => {
return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(safeNum(value));
};
const generateSignal = (asset: CryptoAsset, profitPercentage: number, tf: Timeframe, changePercentage: number) => {
if (['USDT', 'USDC', 'DAI'].includes(asset.symbol.toUpperCase())) {
return { text: 'CAIXA', color: 'text-slate-400 bg-slate-800/50 border-slate-700', icon: ShieldAlert };
}
    const thresholds = {
      '24h': { dipForte: -7, dipNormal: -2, euforia: 10, lucroAlvo: 20, lucroParcial: 10 },
      '7d':  { dipForte: -15, dipNormal: -5, euforia: 25, lucroAlvo: 30, lucroParcial: 15 },
      '30d': { dipForte: -30, dipNormal: -10, euforia: 50, lucroAlvo: 50, lucroParcial: 25 },
      '1y':  { dipForte: -60, dipNormal: -30, euforia: 200, lucroAlvo: 100, lucroParcial: 50 },
    }[tf];

    if (changePercentage > thresholds.euforia && profitPercentage > thresholds.lucroAlvo) {
      return { text: 'VENDA FORTE', color: 'text-amber-400 bg-amber-400/10 border-amber-500/30', icon: Target };
    }

    if (changePercentage > (thresholds.euforia / 2) && profitPercentage > thresholds.lucroParcial) {
      return { text: 'REALIZAR LUCRO', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Target };
    }

    if (changePercentage < thresholds.dipForte) {
      return { text: 'COMPRA FORTE', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]', icon: Zap };
    }

    if (changePercentage < thresholds.dipNormal) {
      return { text: 'COMPRA', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: Zap };
    }

    return { text: 'AGUARDAR', color: 'text-slate-400 bg-slate-800/50 border-slate-700', icon: Minus };
};
if (assets.length === 0) {
return (
<div className="bg-[#121824] border border-slate-800/80 rounded-xl p-12 text-center shadow-lg">
<h3 className="text-lg font-bold text-white mb-2">Ainda não adicionou ativos.</h3>
<p className="text-slate-400 text-sm">Registe uma nova transação para ver a sua carteira aqui.</p>
</div>
);
}
return (
<div className="bg-[#121824] border border-slate-800/80 rounded-xl overflow-visible shadow-lg">
<div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
<Target size={16} /> Horizonte dos Sinais Táticos
</h3>
        <div className="flex bg-[#121824] p-1 rounded-lg border border-slate-800">
          {(['24h', '7d', '30d', '1y'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                timeframe === tf 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tf === '24h' ? 'HOJE' : tf === '7d' ? '7 DIAS' : tf === '30d' ? '1 MÊS' : '1 ANO'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto relative pb-10 sm:pb-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0b0e14] text-xs uppercase text-slate-500 border-b border-slate-800/80 font-bold tracking-wider">
            <tr>
              <th className="py-4 px-6">Ativo</th>
              <th className="py-4 px-4 text-right">Preço</th>
              <th className="py-4 px-4 text-right">Saldo</th>
              <th className="py-4 px-4 text-right hidden sm:table-cell">
                <TooltipHeader title="Preço Médio" tooltip="Calculado automaticamente considerando todas as suas compras e abatendo vendas parciais." />
              </th>
              <th className="py-4 px-4 text-right hidden sm:table-cell">
                <TooltipHeader title="Total" tooltip="Valor total atualizado deste ativo na sua carteira." />
              </th>
              <th className="py-4 px-4 text-right">
                <TooltipHeader title="Rentabilidade" tooltip="Lucro ou prejuízo em USD e % com base no seu Preço Médio e no Preço Atual." />
              </th>
              <th className="py-4 px-4 text-center">
                <TooltipHeader title={`Variação (${timeframe})`} tooltip="Variação percentual do mercado para esta moeda no horizonte temporal selecionado." />
              </th>
              <th className="py-4 px-4 text-center text-indigo-400 bg-indigo-500/5">
                <TooltipHeader title="Sinal" tooltip="Recomendação tática gerada pelo algoritmo cruzando a sua Rentabilidade com a Variação do mercado." />
              </th>
              <th className="py-4 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {assets.map((asset) => {
              const currentPrice = safeNum(asset.currentPrice);
              const quantity = safeNum(asset.quantity);
              const invested = safeNum(asset.investedAmount);
              
              const totalValue = quantity * currentPrice;
              const avgPrice = quantity > 0 ? invested / quantity : 0;
              const profitLoss = totalValue - invested;
              const profitLossPercentage = invested > 0 ? (profitLoss / invested) * 100 : 0;
              
              const isProfit = profitLoss > 0;
              const isNeutral = Math.abs(profitLoss) < 0.01;

              const changePercentage = safeNum(
                timeframe === '24h' ? asset.change24h : 
                timeframe === '7d' ? asset.change7d : 
                timeframe === '30d' ? asset.change30d : 
                asset.change1y
              );
              
              const signal = generateSignal(asset, profitLossPercentage, timeframe, changePercentage);
              const SignalIcon = signal.icon;

              return (
                <tr key={asset.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => onSelectAsset(asset)}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0b0e14] border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 relative overflow-hidden shrink-0">
                        <span className="absolute z-0">{asset.symbol.slice(0, 3)}</span>
                        <img 
                          src={(asset as any).imageUrl || `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} 
                          alt={asset.symbol}
                          className="w-full h-full object-cover relative z-10 bg-[#0b0e14]"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">{asset.name}</div>
                        <div className="text-xs text-slate-500 uppercase">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 text-right font-medium text-slate-300">
                    {formatCurrency(currentPrice)}
                  </td>
                  
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-slate-200">{quantity.toLocaleString('en-US', { maximumFractionDigits: 6 })}</div>
                  </td>
                  
                  <td className="py-4 px-4 text-right hidden sm:table-cell">
                    <div className="font-medium text-slate-300">{formatCurrency(avgPrice)}</div>
                  </td>

                  <td className="py-4 px-4 text-right hidden sm:table-cell">
                    <div className="font-bold text-white">{formatCurrency(totalValue)}</div>
                  </td>
                  
                  <td className="py-4 px-4 text-right">
                    <div className={`font-bold ${isNeutral ? 'text-slate-400' : isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isNeutral ? '$0.00' : `${isProfit ? '+' : ''}${formatCurrency(profitLoss)}`}
                    </div>
                    {!isNeutral && (
                      <div className={`text-xs ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isProfit ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4 text-center">
                    <div className={`inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 rounded border font-bold w-24 transition-colors
                      ${changePercentage > 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                        changePercentage < 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                        'text-slate-400 bg-slate-800/50 border-slate-700'}`}
                    >
                      {changePercentage > 0 ? <TrendingUp size={12} /> : changePercentage < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                      {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(2)}%
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center bg-indigo-500/5">
                    <div className={`inline-flex items-center justify-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-md border font-black uppercase tracking-wider w-full transition-colors ${signal.color}`}>
                      <SignalIcon size={12} className="shrink-0" />
                      {signal.text}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onSelectAsset(asset)} className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded transition" title="Ver Histórico">
                        <BarChart3 size={15} />
                      </button>
                      {onSwapAsset && (
                        <button onClick={() => onSwapAsset(asset)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded transition" title="Converter (Swap)">
                          <ArrowLeftRight size={15} />
                        </button>
                      )}
                      {onEditAsset && (
                        <button onClick={() => onEditAsset(asset)} className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded transition" title="Editar Saldo/Carteira">
                          <Edit2 size={15} />
                        </button>
                      )}
                      <button onClick={() => onRemove(asset.id)} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition" title="Eliminar Ativo">
                        <Trash2 size={15} />
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