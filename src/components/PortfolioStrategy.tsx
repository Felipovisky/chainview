import React, { useState, useEffect } from 'react';
import type { CryptoAsset } from '../types/crypto';
import {
  AlertCircle, Shield, Landmark, TrendingUp, Zap
} from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
}

export const PortfolioStrategy: React.FC<Props> = ({ assets }) => {
  // Salva o perfil selecionado
  const [selectedProfile, setSelectedProfile] = useState<'Conservador' | 'Institucional' | 'Moderado' | 'Arrojado'>(() => {
    return (localStorage.getItem('chainview_strategy_profile') as 'Conservador' | 'Institucional' | 'Moderado' | 'Arrojado') || 'Moderado';
  });

  useEffect(() => {
    localStorage.setItem('chainview_strategy_profile', selectedProfile);
  }, [selectedProfile]);

  const profiles = {
    'Conservador': { icon: Shield, caixa: 50, fundacao: 40, risco: 10, desc: 'Proteção máxima de capital com munição para quedas severas.', activeBorder: 'border-emerald-500/40', activeBg: 'bg-emerald-500/5', color: 'text-emerald-400' },
    'Institucional': { icon: Landmark, caixa: 20, fundacao: 70, risco: 10, desc: 'Modelo clássico de fundos: foco nos gigantes, risco controlado.', activeBorder: 'border-blue-500/40', activeBg: 'bg-blue-500/5', color: 'text-blue-400' },
    'Moderado': { icon: TrendingUp, caixa: 30, fundacao: 45, risco: 25, desc: 'Equilíbrio perfeito entre crescimento e liquidez defensiva.', activeBorder: 'border-indigo-500/40', activeBg: 'bg-indigo-500/5', color: 'text-indigo-400' },
    'Arrojado': { icon: Zap, caixa: 10, fundacao: 30, risco: 60, desc: 'Exposição agressiva aos ciclos de alta. Pouco caixa, muito risco.', activeBorder: 'border-emerald-500/40', activeBg: 'bg-emerald-500/5', color: 'text-emerald-400' }
  };

  const totalAssetsValue = assets.reduce((acc, curr) => {
    const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(curr.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(curr.symbol.toUpperCase());
    const price = isStable ? 1 : curr.currentPrice;
    return acc + (curr.quantity * price);
  }, 0);

  const buckets = assets.reduce((acc, curr) => {
    const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(curr.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(curr.symbol.toUpperCase());
    const isFoundation = ['bitcoin', 'ethereum'].includes(curr.id.toLowerCase()) || ['BTC', 'ETH'].includes(curr.symbol.toUpperCase());
    const val = curr.quantity * (isStable ? 1 : curr.currentPrice);

    if (isStable) acc.caixa += val;
    else if (isFoundation) acc.fundacao += val;
    else acc.risco += val;

    return acc;
  }, { caixa: 0, fundacao: 0, risco: 0 });

  const getPercentage = (val: number) => totalAssetsValue > 0 ? (val / totalAssetsValue) * 100 : 0;
  const currentProfile = profiles[selectedProfile];

  const caixaDiff = buckets.caixa - (totalAssetsValue * (currentProfile.caixa / 100));
  const fundacaoDiff = buckets.fundacao - (totalAssetsValue * (currentProfile.fundacao / 100));
  const riscoDiff = buckets.risco - (totalAssetsValue * (currentProfile.risco / 100));

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);

  const actions = [];
  if (caixaDiff <= -1) actions.push(`O seu balde de Caixa (Estável) precisa de ${formatCurrency(Math.abs(caixaDiff))}. Considere realizar lucros para aumentar a liquidez.`);
  if (fundacaoDiff <= -1) actions.push(`O seu balde de Fundação precisa de ${formatCurrency(Math.abs(fundacaoDiff))}. Reforce a sua posição em BTC/ETH.`);
  if (riscoDiff <= -1) actions.push(`O seu balde de Risco precisa de ${formatCurrency(Math.abs(riscoDiff))}. Busque assimetrias em Altcoins.`);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-8 shadow-lg">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-2">Simulador de Estratégia</h3>
          <p className="text-sm text-slate-400">Escolha um perfil de risco para comparar a sua distribuição atual com o modelo institucional ideal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {(Object.keys(profiles) as Array<keyof typeof profiles>).map(profileKey => {
            const profile = profiles[profileKey];
            const Icon = profile.icon;
            const isActive = selectedProfile === profileKey;
            return (
              <button
                key={profileKey}
                onClick={() => setSelectedProfile(profileKey)}
                className={`text-left p-4 rounded-xl border transition-all duration-300 ${isActive ? `${profile.activeBorder} ${profile.activeBg}` : 'bg-[#0b0e14] border-slate-800 hover:border-slate-700'}`}
              >
                <div className={`flex items-center gap-2 font-bold mb-2 ${isActive ? profile.color : 'text-slate-300'}`}>
                  <Icon size={18} /> {profileKey}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{profile.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'PÓ DA PAZ (CAIXA)', current: getPercentage(buckets.caixa), target: currentProfile.caixa, val: buckets.caixa, diff: caixaDiff, colorText: 'text-emerald-400', colorBg: 'bg-emerald-500' },
            { label: 'FUNDAÇÃO (BTC/ETH)', current: getPercentage(buckets.fundacao), target: currentProfile.fundacao, val: buckets.fundacao, diff: fundacaoDiff, colorText: 'text-blue-400', colorBg: 'bg-blue-500' },
            { label: 'RISCO (ALTCOINS)', current: getPercentage(buckets.risco), target: currentProfile.risco, val: buckets.risco, diff: riscoDiff, colorText: 'text-rose-400', colorBg: 'bg-rose-500' },
          ].map((bucket, i) => {
            const isExcess = bucket.diff >= 0;
            return (
              <div key={i} className="bg-[#0b0e14] border border-slate-800/80 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{bucket.label}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bucket.target}% <span className="text-slate-600">ALVO IDEAL</span></div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={`text-3xl font-black ${bucket.colorText}`}>{bucket.current.toFixed(1)}%</span>
                    <span className="text-xs font-bold text-slate-500">Atual / <span className="text-slate-200">{formatCurrency(bucket.val)}</span></span>
                  </div>

                  <div className="relative h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                    <div className={`absolute top-0 left-0 h-full ${bucket.colorBg} transition-all duration-1000`} style={{ width: `${Math.min(100, bucket.current)}%` }}></div>
                    <div className="absolute top-0 w-1 h-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)] z-10 transition-all duration-1000" style={{ left: `calc(${bucket.target}% - 2px)` }}></div>
                  </div>
                </div>

                <div>
                  <span className={`inline-block px-3 py-1.5 rounded-md text-[10px] font-bold ${
                    isExcess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {isExcess ? `Excesso de ${formatCurrency(bucket.diff)}` : `Falta investir +${formatCurrency(Math.abs(bucket.diff))}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-6">
          <h4 className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
            <AlertCircle size={14} /> Plano de Ação Matemático
          </h4>
          <div className="space-y-3">
            {actions.length > 0 ? (
              actions.map((action, i) => (
                <div key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-slate-600 font-bold mt-0.5">→</span>
                  <p>{action}</p>
                </div>
              ))
            ) : (
              <div className="flex gap-3 text-sm text-emerald-400 font-bold">
                <span>✓</span>
                <p>O seu portefólio está perfeitamente alinhado com o seu perfil de risco! Nenhuma ação necessária no momento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};