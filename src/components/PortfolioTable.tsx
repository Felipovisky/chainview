import React, { useState } from 'react';
import type { CryptoAsset } from '../types/crypto';
import {
  ArrowLeftRight, Edit3, Trash2, Shield, TrendingUp, TrendingDown, Minus, Target
} from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
  isPrivacyMode?: boolean;
  currency?: 'USD' | 'BRL';
  exchangeRate?: number | null;
  onRemove: (id: string) => void;
  onSelectAsset: (asset: CryptoAsset) => void;
  onEditAsset: (asset: CryptoAsset) => void;
  onSwapAsset: (asset: CryptoAsset) => void;
}

type Horizon = '24h' | '7d' | '30d' | '1y';

export const PortfolioTable: React.FC<Props> = ({
  assets,
  isPrivacyMode = false,
  currency = 'USD',
  exchangeRate = null,
  onRemove,
  onSelectAsset,
  onEditAsset,
  onSwapAsset,
}) => {
  const [horizon, setHorizon] = useState<Horizon>(() => {
    return (localStorage.getItem('chainview_signal_horizon') as Horizon) || '1y';
  });

  const handleHorizonChange = (h: Horizon) => {
    setHorizon(h);
    localStorage.setItem('chainview_signal_horizon', h);
  };

  const safeNum = (n: any) => {
    const val = Number(n);
    return isNaN(val) || !isFinite(val) ? 0 : val;
  };

  const isStablecoin = (asset: CryptoAsset) =>
    ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(asset.id.toLowerCase()) ||
    ['USDT', 'USDC', 'DAI'].includes(asset.symbol.toUpperCase());

  const isBrl = currency === 'BRL' && !!exchangeRate;
  const rate = isBrl && exchangeRate ? exchangeRate : 1;
  const locale = isBrl ? 'pt-BR' : 'en-US';
  const symbolPrefix = isBrl ? 'R$ ' : '$';

  const formatPrice = (usdVal: number) => {
    const val = usdVal * rate;
    if (val >= 1) {
      return `${symbolPrefix}${val.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (val >= 0.01) {
      return `${symbolPrefix}${val.toLocaleString(locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
    }
    return `${symbolPrefix}${val.toLocaleString(locale, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
  };

  const formatCurrency = (usdVal: number) => {
    const val = usdVal * rate;
    return `${symbolPrefix}${val.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatSignedCurrency = (usdVal: number) => {
    const val = usdVal * rate;
    const sign = val > 0 ? '+' : val < 0 ? '-' : '';
    return `${sign}${symbolPrefix}${Math.abs(val).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatQuantity = (val: number) =>
    val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });

  const getVariationByHorizon = (asset: CryptoAsset): number => {
    if (isStablecoin(asset)) return 0;
    if (horizon === '24h') return safeNum(asset.change24h);
    if (horizon === '7d') return safeNum(asset.change7d);
    if (horizon === '30d') return safeNum(asset.change30d);
    return safeNum(asset.change1y);
  };

  const getHorizonLabel = () => {
    if (horizon === '24h') return '24H';
    if (horizon === '7d') return '7D';
    if (horizon === '30d') return '30D';
    return '1Y';
  };

  const getFiboSignal = (asset: CryptoAsset) => {
    if (isStablecoin(asset)) {
      return {
        level: 'CAIXA',
        dropFromAth: null as number | null,
        tooltip: 'Reserva de liquidez (Stablecoin)',
        classes: 'bg-slate-800/70 text-slate-300 border-slate-700/80',
        isStable: true,
      };
    }

    const ath = safeNum((asset as any).ath);
    const current = safeNum(asset.currentPrice);
    const athChangePct = (asset as any).athChangePct;

    let dropFromAth: number | null = null;
    if (ath > 0 && current > 0) {
      dropFromAth = ((current - ath) / ath) * 100;
    } else if (typeof athChangePct === 'number' && !isNaN(athChangePct)) {
      dropFromAth = athChangePct;
    }

    if (dropFromAth === null) {
      return {
        level: '—',
        dropFromAth: null,
        tooltip: 'Aguardando dados de ATH',
        classes: 'bg-slate-800/40 text-slate-500 border-slate-800',
        isStable: false,
      };
    }

    if (dropFromAth <= -78.6) {
      return {
        level: '0.786',
        dropFromAth,
        tooltip: `0.786 • Desconto Extremo (ATH ${dropFromAth.toFixed(1)}%)`,
        classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        isStable: false,
      };
    }
    if (dropFromAth <= -61.8) {
      return {
        level: '0.618',
        dropFromAth,
        tooltip: `0.618 • Desconto Ideal (ATH ${dropFromAth.toFixed(1)}%)`,
        classes: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        isStable: false,
      };
    }
    if (dropFromAth <= -50.0) {
      return {
        level: '0.500',
        dropFromAth,
        tooltip: `0.5 • Preço Justo (ATH ${dropFromAth.toFixed(1)}%)`,
        classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        isStable: false,
      };
    }
    if (dropFromAth <= -38.2) {
      return {
        level: '0.382',
        dropFromAth,
        tooltip: `0.382 • Aproximação do Preço Justo (ATH ${dropFromAth.toFixed(1)}%)`,
        classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        isStable: false,
      };
    }

    return {
      level: '< 0.382',
      dropFromAth,
      tooltip: `Acima do Preço Justo (ATH ${dropFromAth.toFixed(1)}%)`,
      classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      isStable: false,
    };
  };

  const totalPortfolioBalance = assets.reduce((acc, a) => {
    const price = isStablecoin(a) ? 1 : safeNum(a.currentPrice);
    return acc + safeNum(a.quantity) * price;
  }, 0);

  const totalPortfolioInvested = assets.reduce((acc, a) => acc + safeNum(a.investedAmount), 0);
  const totalPortfolioProfit = totalPortfolioBalance - totalPortfolioInvested;
  const totalPortfolioProfitPct =
    totalPortfolioInvested > 0 ? (totalPortfolioProfit / totalPortfolioInvested) * 100 : 0;

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl shadow-lg overflow-hidden">
      {/* Barra Superior: Horizonte + Mini Legenda Fibo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800/80 bg-[#0f141f]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Target size={14} className="text-blue-400" />
            Meus Ativos
          </div>

          <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold text-slate-400 border-l border-slate-800 pl-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> 0.5 Justo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> 0.618 Ideal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> 0.786 Extremo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#0b0e14] p-1 rounded-lg border border-slate-800 w-fit">
          {[
            { key: '24h', label: '24H' },
            { key: '7d', label: '7D' },
            { key: '30d', label: '30D' },
            { key: '1y', label: '1A' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleHorizonChange(item.key as Horizon)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                horizon === item.key
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0d121c] text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 whitespace-nowrap">
              <th className="px-4 py-3">Ativo</th>
              <th className="px-3 py-3 text-right">Preço</th>
              <th className="px-3 py-3 text-right">Qtd Tokens</th>
              <th className="px-3 py-3 text-right">Preço Médio</th>
              <th className="px-3 py-3 text-right">Aporte</th>
              <th className="px-3 py-3 text-right">Saldo Atual</th>
              <th className="px-3 py-3 text-right">Rentabilidade</th>
              <th className="px-3 py-3 text-right">Var. ({getHorizonLabel()})</th>
              <th className="px-3 py-3 text-center">Fibo / ATH</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/50 text-xs">
            {assets.length > 0 ? (
              assets.map((asset) => {
                const stable = isStablecoin(asset);
                const qty = safeNum(asset.quantity);
                const price = stable ? 1 : safeNum(asset.currentPrice);
                const invested = safeNum(asset.investedAmount);
                const currentBalance = qty * price;
                const avgPrice = qty > 0 ? invested / qty : 0;
                const profit = currentBalance - invested;
                const profitPct = invested > 0 ? (profit / invested) * 100 : 0;
                const weightPct = totalPortfolioBalance > 0 ? (currentBalance / totalPortfolioBalance) * 100 : 0;
                const variation = getVariationByHorizon(asset);
                const fibo = getFiboSignal(asset);

                return (
                  <tr
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className="hover:bg-slate-800/35 transition cursor-pointer whitespace-nowrap"
                  >
                    {/* ATIVO */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {asset.imageUrl ? (
                          <img
                            src={asset.imageUrl}
                            alt={asset.name}
                            className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                            {asset.symbol.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-white text-[13px] truncate max-w-[120px]">
                          {asset.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {asset.symbol}
                        </span>
                      </div>
                    </td>

                    {/* PREÇO */}
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-200">
                      {formatPrice(price)}
                    </td>

                    {/* QTD TOKENS */}
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-400">
                      {isPrivacyMode ? '••••' : formatQuantity(qty)}
                    </td>

                    {/* PREÇO MÉDIO */}
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-400">
                      {formatPrice(avgPrice)}
                    </td>

                    {/* APORTE */}
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-400">
                      {isPrivacyMode ? '••••••' : formatCurrency(invested)}
                    </td>

                    {/* SALDO ATUAL + % CARTEIRA */}
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums">
                      {isPrivacyMode ? (
                        <span className="font-bold text-white text-[13px]">••••••</span>
                      ) : (
                        <div className="inline-flex items-baseline justify-end gap-1.5">
                          <span className="font-bold text-white text-[13px]">
                            {formatCurrency(currentBalance)}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({weightPct.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* RENTABILIDADE */}
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums">
                      {stable ? (
                        <span className="text-slate-600">—</span>
                      ) : isPrivacyMode ? (
                        <span className="text-slate-600">••••</span>
                      ) : (
                        <div className={`inline-flex items-baseline justify-end gap-1.5 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <span className="font-bold">
                            {formatSignedCurrency(profit)}
                          </span>
                          <span className="text-[11px] opacity-80">
                            ({profitPct >= 0 ? '+' : ''}{profitPct.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* VARIAÇÃO */}
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`inline-flex items-center justify-end gap-1 text-[11px] font-bold ${
                          variation > 0
                            ? 'text-emerald-400'
                            : variation < 0
                            ? 'text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {variation > 0 ? (
                          <TrendingUp size={12} />
                        ) : variation < 0 ? (
                          <TrendingDown size={12} />
                        ) : (
                          <Minus size={12} />
                        )}
                        {variation > 0 ? '+' : ''}
                        {variation.toFixed(1)}%
                      </span>
                    </td>

                    {/* SINAL FIBO COMPACTO */}
                    <td className="px-3 py-3.5 text-center">
                      <span
                        title={fibo.tooltip}
                        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono tabular-nums font-bold border ${fibo.classes}`}
                      >
                        {fibo.isStable ? (
                          <>
                            <Shield size={11} /> CAIXA
                          </>
                        ) : fibo.dropFromAth !== null ? (
                          <>
                            <span>{fibo.level}</span>
                            <span className="opacity-40">|</span>
                            <span className="opacity-90">{fibo.dropFromAth.toFixed(0)}%</span>
                          </>
                        ) : (
                          <span>{fibo.level}</span>
                        )}
                      </span>
                    </td>

                    {/* AÇÕES */}
                    <td
                      className="px-4 py-3.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSwapAsset(asset)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                          title="Trocar / Converter Ativo"
                        >
                          <ArrowLeftRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditAsset(asset)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                          title="Editar Posição"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remover ${asset.name} (${asset.symbol}) e todo o seu histórico?`)) {
                              onRemove(asset.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Remover Ativo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-500 text-sm">
                  Nenhum ativo encontrado. Clique em <strong>+ Nova Transação</strong> para começar.
                </td>
              </tr>
            )}
          </tbody>

          {/* RODAPÉ COM TOTAIS */}
          {assets.length > 0 && (
            <tfoot className="bg-[#0d121c] border-t-2 border-slate-800 text-xs font-mono tabular-nums whitespace-nowrap">
              <tr>
                <td colSpan={4} className="px-4 py-3.5 font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total ({assets.length} {assets.length === 1 ? 'ativo' : 'ativos'})
                </td>
                <td className="px-3 py-3.5 text-right font-bold text-slate-300">
                  {isPrivacyMode ? '••••••' : formatCurrency(totalPortfolioInvested)}
                </td>
                <td className="px-3 py-3.5 text-right font-black text-emerald-400 text-[13px]">
                  {isPrivacyMode ? '••••••' : formatCurrency(totalPortfolioBalance)}
                </td>
                <td className="px-3 py-3.5 text-right">
                  {isPrivacyMode ? (
                    <span className="text-slate-600">••••</span>
                  ) : (
                    <div className={`inline-flex items-baseline justify-end gap-1.5 ${totalPortfolioProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span className="font-bold">
                        {formatSignedCurrency(totalPortfolioProfit)}
                      </span>
                      <span className="text-[11px] opacity-80">
                        ({totalPortfolioProfitPct >= 0 ? '+' : ''}{totalPortfolioProfitPct.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};