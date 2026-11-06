import React, { useState, useEffect } from 'react';
import { Gauge, Target, ArrowDownToLine, Loader2 } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';

interface Props {
  assets: CryptoAsset[];
  variant?: 'compact' | 'full';
}

export const MarketIndicators: React.FC<Props> = ({ assets, variant = 'full' }) => {
  const [activeTab, setActiveTab] = useState<'sentimento' | 'recompras' | 'fundo'>(() => {
    return (localStorage.getItem('chainview_market_tab') as any) || 'sentimento';
  });

  useEffect(() => {
    localStorage.setItem('chainview_market_tab', activeTab);
  }, [activeTab]);

  const [fngValue, setFngValue] = useState(50);
  const [isLoadingFng, setIsLoadingFng] = useState(true);
  const [athData, setAthData] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;
    const calculateSentiment = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&price_change_percentage=24h');
        const data = await res.json();
        
        if (isMounted && data && data[0]) {
          const change24h = data[0].price_change_percentage_24h || 0;
          let calculatedVal = Math.round(50 + (change24h * 3.5));
          if (calculatedVal < 10) calculatedVal = 10;
          if (calculatedVal > 95) calculatedVal = 95;
          setFngValue(calculatedVal);
        }
      } catch (e) {
        setFngValue(50);
      } finally {
        if (isMounted) setIsLoadingFng(false);
      }
    };
    calculateSentiment();
    return () => { isMounted = false; };
  }, []);

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

  const createArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = {
      x: cx + r * Math.cos(startAngle * Math.PI / 180),
      y: cy + r * Math.sin(startAngle * Math.PI / 180)
    };
    const end = {
      x: cx + r * Math.cos(endAngle * Math.PI / 180),
      y: cy + r * Math.sin(endAngle * Math.PI / 180)
    };
    return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  };

  const getFngInfo = (val: number) => {
    if (val <= 25) return { text: "MEDO EXTREMO", color: "#ef4444", desc: "Mercado em pânico." };
    if (val <= 45) return { text: "MEDO", color: "#f97316", desc: "Preços abaixo da média." };
    if (val <= 55) return { text: "NEUTRO", color: "#eab308", desc: "Sem direção clara." };
    if (val <= 75) return { text: "GANÂNCIA", color: "#84cc16", desc: "Otimismo no mercado." };
    return { text: "GANÂNCIA EXTREMA", color: "#22c55e", desc: "Sinal de euforia máxima." };
  };

  const fngInfo = getFngInfo(fngValue);
  const angle = 180 + (fngValue / 100) * 180;

  if (variant === 'compact') {
    const cx = 150, cy = 105, r = 85;
    const dotX = cx + r * Math.cos(angle * Math.PI / 180);
    const dotY = cy + r * Math.sin(angle * Math.PI / 180);

    return (
      <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg h-full flex flex-col justify-between items-center overflow-hidden">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 w-full mb-1">
          <Gauge size={16} className="text-rose-400" /> Sentimento (Radar)
        </h3>
        
        {isLoadingFng ? (
          <div className="my-auto"><Loader2 className="animate-spin text-slate-500" size={32} /></div>
        ) : (
          <div className="relative w-full max-w-[230px] my-auto">
            <svg viewBox="0 0 300 135" className="w-full h-auto drop-shadow-md">
              <path d={createArc(cx, cy, r, 180, 213)} fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />
              <path d={createArc(cx, cy, r, 217, 250)} fill="none" stroke="#f97316" strokeWidth="18" strokeLinecap="round" />
              <path d={createArc(cx, cy, r, 254, 287)} fill="none" stroke="#eab308" strokeWidth="18" strokeLinecap="round" />
              <path d={createArc(cx, cy, r, 291, 324)} fill="none" stroke="#84cc16" strokeWidth="18" strokeLinecap="round" />
              <path d={createArc(cx, cy, r, 328, 360)} fill="none" stroke="#22c55e" strokeWidth="18" strokeLinecap="round" />
              <circle cx={dotX} cy={dotY} r="8" fill="white" stroke={fngInfo.color} strokeWidth="3" />
            </svg>
            <div className="absolute top-[52px] left-1/2 -translate-x-1/2 text-center w-full">
              <div className="text-5xl font-black text-white leading-none tracking-tight">{fngValue}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider mt-2 truncate px-2" style={{ color: fngInfo.color }}>
                {fngInfo.text}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const safeNum = (n: any) => { const val = Number(n); return isNaN(val) ? 0 : val; };
  const dotXFull = 150 + 90 * Math.cos(angle * Math.PI / 180);
  const dotYFull = 120 + 90 * Math.sin(angle * Math.PI / 180);

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
        const ath = athData[a.id] || 0;
        const current = safeNum(a.currentPrice);
        const drop = (ath > 0 && current > 0) ? ((current - ath) / ath) * 100 : 0;
        return { ...a, ath, drop };
      })
      .filter(a => a.drop < -10 && a.ath > 0)
      .sort((a, b) => a.drop - b.drop);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val);

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col h-full">
      <div className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Radar de Mercado</div>

      <div className="flex bg-[#0b0e14] p-1 rounded-lg border border-slate-800 mb-6">
        <button onClick={() => setActiveTab('sentimento')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'sentimento' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
          <Gauge size={14} /> SENTIMENTO
        </button>
        <button onClick={() => setActiveTab('recompras')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'recompras' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
          <Target size={14} /> RECOMPRAS
        </button>
        <button onClick={() => setActiveTab('fundo')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'fundo' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
          <ArrowDownToLine size={14} /> FUNDO ATH
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === 'sentimento' && (
          <div className="flex flex-col items-center justify-center h-full pt-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Índice de Sentimento do Mercado</div>
            
            {isLoadingFng ? (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-500 my-12">
                <Loader2 size={32} className="animate-spin text-slate-600" />
                <span className="text-xs">A calcular sentimento...</span>
              </div>
            ) : (
              <div className="relative w-full max-w-[300px] mb-8">
                <svg viewBox="0 0 300 150" className="w-full h-auto drop-shadow-lg">
                  <path d={createArc(150, 120, 90, 180, 213)} fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                  <path d={createArc(150, 120, 90, 217, 250)} fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="round" />
                  <path d={createArc(150, 120, 90, 254, 287)} fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="round" />
                  <path d={createArc(150, 120, 90, 291, 324)} fill="none" stroke="#84cc16" strokeWidth="12" strokeLinecap="round" />
                  <path d={createArc(150, 120, 90, 328, 360)} fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
                  <circle cx={dotXFull} cy={dotYFull} r="8" fill="white" stroke={fngInfo.color} strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </svg>

                <div className="absolute top-[80px] left-1/2 -translate-x-1/2 text-center flex flex-col items-center">
                  <span className="text-5xl font-black text-white leading-none tracking-tighter" style={{ textShadow: `0 0 20px ${fngInfo.color}40` }}>{fngValue}</span>
                  <span className="text-xs font-bold uppercase tracking-wider mt-2" style={{ color: fngInfo.color }}>{fngInfo.text}</span>
                </div>
              </div>
            )}
            {!isLoadingFng && <p className="text-xs text-slate-400 text-center max-w-[280px] leading-relaxed">{fngInfo.desc}</p>}
          </div>
        )}

        {activeTab === 'recompras' && (
          <div className="space-y-3">
            {getRecompras().length === 0 ? <div className="text-center text-slate-500 text-xs py-8">Nenhum ativo com desconto superior a 3%.</div> : getRecompras().map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-[#0b0e14] border border-slate-800 rounded-lg hover:border-slate-700 transition">
                <div>
                  <div className="font-bold text-slate-200 text-sm">{asset.symbol}</div>
                  <div className="text-[10px] text-slate-500">Médio: {formatCurrency(asset.pm)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Desconto PM</div>
                  <div className="font-bold text-emerald-400 text-sm">{asset.discount.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'fundo' && (
          <div className="space-y-3">
            {getFundoAth().length === 0 ? <div className="text-center text-slate-500 text-xs py-8">Aguardando dados...</div> : getFundoAth().map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-[#0b0e14] border border-slate-800 rounded-lg hover:border-slate-700 transition">
                <div>
                  <div className="font-bold text-slate-200 text-sm">{asset.symbol}</div>
                  <div className="text-[10px] text-slate-500">ATH: {formatCurrency(asset.ath)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Queda do ATH</div>
                  <div className="font-bold text-rose-400 text-sm">{asset.drop.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};