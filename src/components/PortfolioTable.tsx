import React from 'react';
import { Trash2, TrendingUp, TrendingDown, Minus, BarChart3, Edit2, ArrowLeftRight, Zap, Target, ShieldAlert } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';

interface Props {
  assets: CryptoAsset[];
  onRemove: (id: string) => void;
  onSelectAsset: (asset: CryptoAsset) => void;
  onEditAsset?: (asset: CryptoAsset) => void;
  onSwapAsset?: (asset: CryptoAsset) => void;
}

export const PortfolioTable: React.FC<Props> = ({ assets, onRemove, onSelectAsset, onEditAsset, onSwapAsset }) => {
  const safeNum = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(safeNum(value));
  };

  // Motor Tático Algorítmico
  const generateSignal = (asset: CryptoAsset, profitPercentage: number) => {
    // Exclui stablecoins do sinal de risco
    if (['USDT', 'USDC', 'DAI'].includes(asset.symbol.toUpperCase())) {
      return { text: 'CAIXA', color: 'text-slate-400 bg-slate-800/50 border-slate-700', icon: ShieldAlert };
    }

    const change24h = safeNum(asset.athChange);

    // Regra 1: Euforia Extrema (Realizar Lucros)
    // Se subiu mais de 10% nas últimas 24h E o seu lucro total é superior a 20%, VENDER!
    if (change24h > 10 && profitPercentage > 20) {
      return { text: 'VENDA FORTE', color: 'text-amber-400 bg-amber-400/10 border-amber-500/30', icon: Target };
    }
    
    // Regra 2: Realização Parcial (Venda Padrão)
    if (change24h > 5 && profitPercentage > 10) {
      return { text: 'REALIZAR LUCRO', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Target };
    }

    // Regra 3: Compra Forte ("Buy the Dip")
    // Se o mercado sangrou mais de 7% num dia (Pullback forte), é hora de comprar com desconto.
    if (change24h < -7) {
      return { text: 'COMPRA FORTE', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]', icon: Zap };
    }

    // Regra 4: Acumulação Segura
    // Correção leve com preço a consolidar
    if (change24h < -2) {
      return { text: 'COMPRA', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: Zap };
    }

    // Regra 5: Aguardar
    return { text: 'AGUARDAR', color: 'text-slate-400 bg-slate-800/50 border-slate-700', icon: Minus };
  };

  if (assets.length === 0) {
    return (
      <div className="bg-[#121824] rounded-xl p-8 border border-slate-800/80 text-center shadow-lg">
        <p className="text-slate-400 text-sm">Ainda não adicionou ativos. Registe uma nova transação.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121824] rounded-xl border border-slate-800/80 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0b0e14] text-xs uppercase text-slate-500 border-b border-slate-800/80 font-bold tracking-wider">
            <tr>
              <th className="py-4 px-6">Ativo</th>
              <th className="py-4 px-4 text-right">Preço</th>
              <th className="py-4 px-4 text-right">Saldo</th>
              <th className="py-4 px-4 text-right hidden sm:table-cell">Total / Preço Médio</th>
              <th className="py-4 px-4 text-right">Rentabilidade</th>
              <th className="py-4 px-4 text-center">Tendência</th>
              <th className="py-4 px-4 text-center text-indigo-400 bg-indigo-500/5">Sinal</th>
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

              const signal = generateSignal(asset, profitLossPercentage);
              const SignalIcon = signal.icon;

              return (
                <tr key={asset.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => onSelectAsset(asset)}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                        {asset.symbol.slice(0, 3)}
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
                    <div className="font-bold text-white">{formatCurrency(totalValue)}</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5">PM: {formatCurrency(avgPrice)}</div>
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
                    <div className={`inline-flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded border font-bold uppercase w-24
                      ${asset.trend?.includes('Alta') ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                        asset.trend === 'Baixa' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                        'text-slate-400 bg-slate-800/50 border-slate-700'}`}
                    >
                      {asset.trend?.includes('Alta') ? <TrendingUp size={12} /> : 
                       asset.trend === 'Baixa' ? <TrendingDown size={12} /> : 
                       <Minus size={12} />}
                      {asset.trend}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center bg-indigo-500/5">
                    <div className={`inline-flex items-center justify-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-md border font-black uppercase tracking-wider w-full ${signal.color}`}>
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