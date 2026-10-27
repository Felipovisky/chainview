import React, { useState, useEffect, useMemo } from 'react';
import type { CryptoAsset } from '../types/crypto';
import { Target, Gauge, ArrowDownToLine, AlertTriangle } from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
}

export const MarketIndicators: React.FC<Props> = ({ assets }) => {
  const [activeView, setActiveView] = useState<'recompra' | 'fng' | 'ath'>('fng');
  
  const [fngData, setFngData] = useState<{ value: string; classification: string } | null>(null);
  const [athData, setAthData] = useState<Record<string, number>>({});

  useEffect(() => {
    if (activeView === 'fng' && !fngData) {
      fetch('https://api.alternative.me/fng/?limit=1')
        .then(res => res.json())
        .then(data => {
          if (data && data.data && data.data[0]) {
            setFngData({
              value: data.data[0].value,
              classification: data.data[0].value_classification
            });
          }
        })
        .catch(console.error);
    }
  }, [activeView, fngData]);

  useEffect(() => {
    if (activeView === 'ath' && Object.keys(athData).length === 0 && assets.length > 0) {
      const ids = assets.filter(a => !['USDT', 'USDC'].includes(a.symbol)).map(a => a.id).join(',');
      fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`)
        .then(res => res.json())
        .then(data => {
          const map: Record<string, number> = {};
          data.forEach((coin: any) => { map[coin.id] = coin.ath; });
          setAthData(map);
        })
        .catch(console.error);
    }
  }, [activeView, assets, athData]);

  const recompraOpps = useMemo(() => {
    return assets
      .filter(a => !['USDT', 'USDC'].includes(a.symbol) && a.quantity > 0)
      .map(a => {
        const avgPrice = a.investedAmount / a.quantity;
        const discount = ((a.currentPrice - avgPrice) / avgPrice) * 100;
        return { ...a, avgPrice, discount };
      })
      .filter(a => a.discount < 0)
      .sort((a, b) => a.discount - b.discount)
      .slice(0, 10);
  }, [assets]);

  const athOpps = useMemo(() => {
    if (Object.keys(athData).length === 0) return [];
    return assets
      .filter(a => !['USDT', 'USDC'].includes(a.symbol) && a.currentPrice > 0 && athData[a.id])
      .map(a => {
        const ath = athData[a.id];
        const drop = ((a.currentPrice - ath) / ath) * 100;
        const potential = ((ath - a.currentPrice) / a.currentPrice) * 100;
        return { ...a, ath, drop, potential };
      })
      .sort((a, b) => a.drop - b.drop)
      .slice(0, 10);
  }, [assets, athData]);

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-5 flex flex-col h-[620px] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Radar de Mercado</h3>
      </div>

      <div className="flex bg-[#0b0e14] p-1 rounded-lg mb-4 border border-slate-800/60 shrink-0">
        <button 
          onClick={() => setActiveView('fng')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${activeView === 'fng' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Gauge size={14} /> Sentimento
        </button>
        <button 
          onClick={() => setActiveView('recompra')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${activeView === 'recompra' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Target size={14} /> Recompras
        </button>
        <button 
          onClick={() => setActiveView('ath')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${activeView === 'ath' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ArrowDownToLine size={14} /> Fundo ATH
        </button>
      </div>

      {activeView === 'fng' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          {fngData ? (
            <div className="w-full flex flex-col items-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Fear & Greed Index</div>
              <div className="relative w-56 h-28 overflow-hidden flex justify-center mb-4">
                <div className="w-56 h-56 rounded-full border-[14px] border-slate-800 absolute top-0"></div>
                <div 
                  className="w-56 h-56 rounded-full border-[14px] border-transparent absolute top-0"
                  style={{
                    borderTopColor: parseInt(fngData.value) > 50 ? '#10b981' : '#f43f5e',
                    borderRightColor: parseInt(fngData.value) > 50 ? '#10b981' : '#f43f5e',
                    transform: `rotate(${ -135 + (parseInt(fngData.value) * 1.8) }deg)`
                  }}
                ></div>
                <div className="absolute bottom-0 flex flex-col items-center">
                  <span className="text-5xl font-black text-white">{fngData.value}</span>
                </div>
              </div>
              <span className={`text-base font-bold uppercase ${parseInt(fngData.value) > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fngData.classification.replace('-', ' ')}
              </span>
              <p className="text-center text-xs text-slate-500 mt-8 px-6 leading-relaxed">
                {parseInt(fngData.value) <= 30 ? 'Mercado em medo extremo. Historicamente uma boa zona de compra (Acumulação).' : parseInt(fngData.value) >= 70 ? 'Mercado em ganância extrema. Altamente arriscado, considere realizar lucros.' : 'Mercado neutro. Ideal para manter posições e observar a tendência.'}
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500">A carregar índice...</div>
          )}
        </div>
      )}

      {/* Espaçamento ultra-compacto para caberem os 10 (gap-1 e py-1) */}
      {activeView === 'recompra' && (
        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
          {recompraOpps.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center px-4">
              <AlertTriangle size={24} className="mb-2 opacity-50" />
              Nenhuma oportunidade de recompra. Ativos acima do preço médio.
            </div>
          ) : (
            recompraOpps.map(asset => (
              <div key={asset.id} className="flex items-center justify-between bg-[#0b0e14] border border-slate-800/60 rounded-lg px-3 py-1 hover:border-slate-700/60 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">{asset.symbol}</span>
                  <span className="text-[10px] text-slate-500">Médio: ${asset.avgPrice.toFixed(4)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-emerald-400">Desconto</span>
                  <span className="text-sm font-bold text-white">{asset.discount.toFixed(2)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Espaçamento ultra-compacto para caberem os 10 (gap-1 e py-1) */}
      {activeView === 'ath' && (
        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
          {athOpps.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">A carregar topos históricos...</div>
          ) : (
            athOpps.map(asset => (
              <div key={asset.id} className="flex items-center justify-between bg-[#0b0e14] border border-slate-800/60 rounded-lg px-3 py-1 hover:border-slate-700/60 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">{asset.symbol}</span>
                  <span className="text-[10px] text-slate-500">ATH: ${asset.ath.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-rose-400">Queda</span>
                  <span className="text-sm font-bold text-white">{asset.drop.toFixed(2)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};