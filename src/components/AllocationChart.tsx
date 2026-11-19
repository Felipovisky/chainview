import React from 'react';
import type { CryptoAsset } from '../types/crypto';
import { PieChart, Shield, Landmark, Rocket, TrendingUp, Zap, type LucideIcon } from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
  variant?: 'compact' | 'full';
}

interface StrategyProfile {
  name: 'Conservador' | 'Institucional' | 'Moderado' | 'Arrojado';
  caixa: number;
  fundacao: number;
  risco: number;
  icon: LucideIcon;
  badgeClasses: string;
}

const STRATEGY_PROFILES: StrategyProfile[] = [
  {
    name: 'Conservador',
    caixa: 50,
    fundacao: 40,
    risco: 10,
    icon: Shield,
    badgeClasses: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  {
    name: 'Institucional',
    caixa: 20,
    fundacao: 70,
    risco: 10,
    icon: Landmark,
    badgeClasses: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  {
    name: 'Moderado',
    caixa: 30,
    fundacao: 45,
    risco: 25,
    icon: TrendingUp,
    badgeClasses: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  },
  {
    name: 'Arrojado',
    caixa: 10,
    fundacao: 30,
    risco: 60,
    icon: Zap,
    badgeClasses: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
];

export const AllocationChart: React.FC<Props> = ({ assets, variant = 'full' }) => {
  const safeNum = (n: any) => {
    const val = Number(n);
    return isNaN(val) || !isFinite(val) ? 0 : val;
  };

  const isStablecoin = (a: CryptoAsset) =>
    ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(a.id.toLowerCase()) ||
    ['USDT', 'USDC', 'DAI'].includes(a.symbol.toUpperCase());

  const isFoundation = (a: CryptoAsset) =>
    ['bitcoin', 'ethereum'].includes(a.id.toLowerCase()) ||
    ['BTC', 'ETH'].includes(a.symbol.toUpperCase());

  const valuedAssets = assets
    .map((a) => {
      const price = isStablecoin(a) ? 1 : safeNum(a.currentPrice);
      const value = safeNum(a.quantity) * price;
      return { ...a, value };
    })
    .filter((a) => a.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalValue = valuedAssets.reduce((acc, a) => acc + a.value, 0);

  const caixaAssets = valuedAssets.filter((a) => isStablecoin(a));
  const fundacaoAssets = valuedAssets.filter((a) => !isStablecoin(a) && isFoundation(a));
  const riscoAssets = valuedAssets.filter((a) => !isStablecoin(a) && !isFoundation(a));

  const caixaTotal = caixaAssets.reduce((acc, a) => acc + a.value, 0);
  const fundacaoTotal = fundacaoAssets.reduce((acc, a) => acc + a.value, 0);
  const riscoTotal = riscoAssets.reduce((acc, a) => acc + a.value, 0);

  const getPct = (val: number) => (totalValue > 0 ? (val / totalValue) * 100 : 0);

  const caixaPct = getPct(caixaTotal);
  const fundacaoPct = getPct(fundacaoTotal);
  const riscoPct = getPct(riscoTotal);

  // Detecta o perfil de estratégia mais próximo
  const detectClosestProfile = () => {
    if (totalValue <= 0) return null;

    let best: StrategyProfile = STRATEGY_PROFILES[0];
    let bestMatch = -1;

    STRATEGY_PROFILES.forEach((profile) => {
      const distance =
        Math.abs(caixaPct - profile.caixa) +
        Math.abs(fundacaoPct - profile.fundacao) +
        Math.abs(riscoPct - profile.risco);
      const matchPct = Math.max(0, 100 - distance / 2);

      if (matchPct > bestMatch) {
        bestMatch = matchPct;
        best = profile;
      }
    });

    return {
      ...best,
      matchPct: bestMatch,
      tooltip: `Perfil mais próximo: ${best.name} (Alvo: ${best.caixa}% Caixa • ${best.fundacao}% Fundação • ${best.risco}% Risco)`,
    };
  };

  const detectedProfile = detectClosestProfile();
  const ProfileIcon = detectedProfile?.icon;

  // ==========================================
  // VARIANTE COMPACTA (Resumo Geral)
  // ==========================================
  if (variant === 'compact') {
    const rows = [
      {
        label: 'Caixa (Reservas)',
        pct: caixaPct,
        icon: Shield,
        textColor: 'text-emerald-400',
        barColor: 'bg-emerald-500',
      },
      {
        label: 'Sólidas (Fundação)',
        pct: fundacaoPct,
        icon: Landmark,
        textColor: 'text-blue-400',
        barColor: 'bg-blue-500',
      },
      {
        label: 'Altcoins (Risco)',
        pct: riscoPct,
        icon: Rocket,
        textColor: 'text-amber-400',
        barColor: 'bg-amber-500',
      },
    ];

    return (
      <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg h-full flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart size={16} className="text-emerald-400" /> Distribuição Resumida
          </h3>

          {detectedProfile && ProfileIcon && (
            <span
              title={detectedProfile.tooltip}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${detectedProfile.badgeClasses}`}
            >
              <ProfileIcon size={11} />
              {detectedProfile.name}
            </span>
          )}
        </div>

        <div className="space-y-4 my-auto">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-2 font-semibold text-slate-300">
                    <Icon size={13} className={row.textColor} />
                    {row.label}
                  </span>
                  <span className={`font-bold font-mono tabular-nums ${row.textColor}`}>
                    {row.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/90 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.barColor} transition-all duration-700`}
                    style={{ width: `${Math.min(100, row.pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // VARIANTE COMPLETA (Gráficos & Radar)
  // ==========================================
  const groups = [
    {
      title: 'Caixa (Reservas)',
      pct: caixaPct,
      items: caixaAssets,
      icon: Shield,
      borderClass: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      titleColor: 'text-emerald-400',
    },
    {
      title: 'Sólidas (Fundação)',
      pct: fundacaoPct,
      items: fundacaoAssets,
      icon: Landmark,
      borderClass: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      titleColor: 'text-blue-400',
    },
    {
      title: 'Altcoins (Risco)',
      pct: riscoPct,
      items: riscoAssets,
      icon: Rocket,
      borderClass: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      titleColor: 'text-amber-400',
    },
  ];

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col h-full">
      {/* Cabeçalho com Perfil Detectado */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <PieChart size={16} className="text-emerald-400" /> Distribuição por Risco
        </h3>

        {detectedProfile && ProfileIcon && (
          <div
            title={detectedProfile.tooltip}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-bold border cursor-help ${detectedProfile.badgeClasses}`}
          >
            <ProfileIcon size={13} />
            <span className="uppercase tracking-wider">Perfil {detectedProfile.name}</span>
            <span className="opacity-40">|</span>
            <span className="font-mono tabular-nums">{detectedProfile.matchPct.toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Lista de Baldes */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {totalValue <= 0 ? (
          <div className="text-center text-slate-500 text-xs py-12">
            Nenhum ativo em carteira para calcular a distribuição.
          </div>
        ) : (
          groups.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.title}
                className={`bg-[#0b0e14] border ${group.borderClass} rounded-xl p-4`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${group.iconBg}`}>
                      <Icon size={14} />
                    </div>
                    <span className={`text-xs font-bold ${group.titleColor}`}>{group.title}</span>
                  </div>
                  <span className="text-sm font-black font-mono tabular-nums text-white">
                    {group.pct.toFixed(1)}%
                  </span>
                </div>

                {group.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {group.items.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between bg-[#121824] border border-slate-800/80 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {asset.imageUrl ? (
                            <img
                              src={asset.imageUrl}
                              alt={asset.symbol}
                              className="w-5 h-5 rounded-full shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 text-[9px] font-bold text-slate-300 flex items-center justify-center shrink-0">
                              {asset.symbol.slice(0, 3).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-bold text-slate-200 uppercase truncate">
                            {asset.symbol}
                          </span>
                        </div>
                        <span className="text-xs font-mono tabular-nums text-slate-400">
                          {getPct(asset.value).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600 italic">Nenhum ativo neste grupo.</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};