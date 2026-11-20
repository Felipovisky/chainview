import React, { useState, useEffect } from 'react';
import { Target, ArrowDownToLine } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';

interface Props {
  assets: CryptoAsset[];
  variant?: 'compact' | 'full';
}

export const MarketIndicators: React.FC<Props> = ({ assets, variant = 'full' }) => {
  const [activeTab, setActiveTab] = useState<'recompras' | 'fundo'>(() => {
    const saved = localStorage.getItem('chainview_market_tab');
    return saved === 'fundo' ? 'fundo' : 'recompras';
  });

  useEffect(() => {
    localStorage.setItem('chainview_market_tab', activeTab);
  }, [activeTab]);

  const [athData, setAthData] = useState<Record<string, number>>({});

  useEffect(() => {
    if (variant === 'compact') return;
    const fetchAth = async () => {
      const assetIds = Array.from(new Set(assets.map(a => a.id))).join(',');
      if (!assetIds) return;
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${assetIds}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const newAth: Record<string, number> = {};
          data.forEach((coin: any) => { newAth[coin.id] = coin.ath; });
          setAthData(newAth);
        }
      } catch (e) {
        console.warn("Erro ao buscar ATH:", e);
      }
    };
    fetchAth();
  }, [assets.map(a => a.id).join(','), variant]);

  const safeNum = (n: any) => {
    const val = Number(n);
    return isNaN(val) ? 0 : val;
  };

  const getRecompras = () => {
    return assets
      .filter(a => !['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(a.id.toLowerCase()))
      .map(a => {
        const qty = safeNum(a.quantity);
        const inv = safeNum(a.investedAmount);
        const PM = qty > 0 ? inv / qty : 0;
        const current = safeNum(a.currentPrice);
        const discount = (PM > 0 && current > 0) ? ((current - PM) / PM) * 100 : 0;
        return { ...a, pm: PM, discount };
      })
      .filter(a => a.discount < -3 && a.pm > 0)
      .sort((a, b) => a.discount - b.discount);
  };

  const getFundoAth = () => {
    return assets
      .filter(a => !['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(a.id.toLowerCase()))
      .map(a => {
        const ath = athData[a.id] || safeNum(a.ath) || 0;
        const current = safeNum(a.currentPrice);
        const drop = (ath > 0 && current > 0) ? ((current - ath) / ath) * 100 : 0;
        return { ...a, ath, drop };
      })
      .filter(a => a.drop < -10 && a.ath > 0)
      .sort((a, b) => a.drop - b.drop);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(val);

  if (variant === 'compact') {
    const recompras = getRecompras();
    return (
      <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg h-full flex flex-col justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 w-full mb-3">
          <Target size={16} className="text-emerald-400" /> Oportunidades (PM)
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {recompras.length === 0 ? (
            <div className="text-center text-slate-500 text-xs my-auto">
              Nenhum ativo com desconto superior a 3% em relação ao preço médio.
            </div>
          ) : (
            recompras.slice(0, 3).map(asset => (
              <div
                key={asset.id}
                className="flex items-center justify-between px-3 py-2 bg-[#0b0e14] border border-slate-800/80 rounded-lg"
              >
                <span className="font-bold text-slate-200 text-xs">{asset.symbol}</span>
                <span className="font-bold text-emerald-400 text-xs font-mono tabular-nums">
                  {asset.discount.toFixed(2)}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col h-full">
      <div className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Radar de Mercado</div>

      <div className="flex bg-[#0b0e14] p-1 rounded-lg border border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('recompras')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${
            activeTab === 'recompras'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Target size={14} /> DESCONTOS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fundo')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${
            activeTab === 'fundo'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ArrowDownToLine size={14} /> FUNDO ATH
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === 'recompras' && (
          <div className="space-y-3">
            {getRecompras().length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-8">
                Nenhum ativo com desconto superior a 3%.
              </div>
            ) : (
              getRecompras().map(asset => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-[#0b0e14] border border-slate-800 rounded-lg hover:border-slate-700 transition"
                >
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{asset.symbol}</div>
                    <div className="text-[10px] text-slate-500">Médio: {formatCurrency(asset.pm)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Desconto PM</div>
                    <div className="font-bold text-emerald-400 text-sm font-mono tabular-nums">
                      {asset.discount.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'fundo' && (
          <div className="space-y-3">
            {getFundoAth().length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-8">Aguardando dados...</div>
            ) : (
              getFundoAth().map(asset => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-[#0b0e14] border border-slate-800 rounded-lg hover:border-slate-700 transition"
                >
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{asset.symbol}</div>
                    <div className="text-[10px] text-slate-500">ATH: {formatCurrency(asset.ath)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Queda do ATH</div>
                    <div className="font-bold text-rose-400 text-sm font-mono tabular-nums">
                      {asset.drop.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};